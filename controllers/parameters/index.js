const _ = require('lodash');
const fs = require('fs');
const path = require('path');
var memoryCache = require('memory-cache');

const { getSharedAccessSignature } = require('../../helpers/azure-storage');
const { envVariables } = require('../../helpers/envHelpers');

/*

Each parameter file follows the given interface.
name : string
value: (user) => string
masterData: () => Array<string>
cache: boolean - whether to store masterData in mem cache or not

*/

const basename = path.basename(__filename);
const parameters = {};

//read all the parameter files inside the folder and build the parameters object;
((folderPath) => {
    fs.readdirSync(folderPath)
        .filter(file => file !== basename)
        .forEach(file => {
            const { name, ...rest } = require(path.join(folderPath, file));
            parameters[name] = rest;
        })
})(__dirname);

/**
@description check if the report is parameterized or not
 */
const isReportParameterized = (report) => _.get(report, 'parameters.length') > 0 && _.isArray(report.parameters);

/**
@description convert a string into base64
 */
const getHashedValue = (val) => Buffer.from(val).toString("base64");

/**
@description read the parameter value from the user context. refer to value function in params object
 */
const getParameterValue = (param, user) => {

    if (param in parameters) {
        return parameters[param].value(user)
    }

    throw new Error('invalid parameter');
}

/**
@description generate hash from parameters value of report
 */
const getParametersHash = (report, user) => {
    const parameters = _.get(report, 'parameters');
    const result = _.map(parameters, param => {
        const userParamValue = getParameterValue(_.toLower(param), user);
        if (!userParamValue) return null;
        if (!_.isArray(userParamValue)) return getHashedValue(userParamValue);
        return _.map(userParamValue, val => getHashedValue(val));
    });
    return _.flatMap(_.compact(result));
}

/**
@description populate report with parameter values
 */
const populateReportsWithParameters = (reports, user) => {
    return _.reduce(reports, (results, report) => {
        const isParameterized = isReportParameterized(report);
        report.isParameterized = isParameterized;
        if (isParameterized) {
            const hash = getParametersHash(report, user);
            if (isUserSuperAdmin(user)) {
                results.push(report);
            } else if (isUserAdmin(user)) {
                const childReports = _.uniqBy(_.concat(_.filter(report.children, child => hash.includes(child.hashed_val)), _.map(hash, hashed_val => ({
                    hashed_val,
                    status: "draft",
                    reportid: _.get(report, 'reportid'),
                    materialize: true
                }))), 'hashed_val');
                if (childReports.length) {
                    if (childReports.length === 1) {
                        delete report.children;
                        results.push(_.assign(report, _.omit(childReports[0], 'id')));
                    } else {
                        report.children = childReports;
                        results.push(report);
                    }
                }
            } else {
                const childReports = _.filter(report.children, child => hash.includes(child.hashed_val) && child.status === 'live');
                if (childReports.length) {
                    if (childReports.length === 1) {
                        delete report.children;
                        results.push(_.assign(report, _.omit(childReports[0], 'id')));
                    } else {
                        report.children = childReports;
                        results.push(report);
                    }
                }
            }
        }
        else {
            delete report.children;
            if (!isUserAdmin(user)) {
                if (report.status === 'live') {
                    results.push(report);
                }
            } else {
                results.push(report);
            }
        }
        return results;
    }, []);
}

const getParameterFromPath = path => {
    const existingParameters = Object.keys(parameters);

    for (let param of existingParameters) {
        if (_.includes(path, param)) {
            return param;
        }
    }

    return null
}

const generateSasPredicate = ({ parameter, path, dataset }) => value => {
    const resolvedPath = path.replace(parameter, value);
    const promise = getSharedAccessSignature({ filePath: resolvedPath })
        .then(sasUrl => ({ key: value, sasUrl }))
        .catch(_ => ({ key: value, sasUrl: null }))
        .then(data => {
            const { key, sasUrl } = data;
            dataset.data[key] = { signedUrl: sasUrl };
        });
    return promise;
}

const getDataset = async ({ dataSource, user, req }) => {
    let { id, path } = dataSource;
    try {
        const dataset = { dataset_id: id, isParameterized: false, parameters: null, data: {} };
        // for backward compatibility
        if (typeof path === 'string' && path.startsWith('/reports/fetch/')) {
            path = path.replace('/reports/fetch/', '');
        }

        const parameter = getParameterFromPath(path);

        if (parameter) {

            dataset.isParameterized = true;
            dataset.parameters = [parameter];

            const { masterData, cache = false } = parameters[parameter];
            let masterDataForParameter;

            //get the master data from memory cache is available else call the master data fetch API for the parameter.
            const cachedData = memoryCache.get(parameter);
            if (cachedData && cache) {
                masterDataForParameter = cachedData;
            } else {
                masterDataForParameter = await masterData({ user, req });
                memoryCache.put(parameter, masterDataForParameter, envVariables.MEMORY_CACHE_TIMEOUT);
            }

            await Promise.all(masterDataForParameter.map(generateSasPredicate({ parameter, path, dataset })))

        } else {
            const sasUrl = await getSharedAccessSignature({ filePath: path }).catch(error => null);
            dataset.data = {
                default: {
                    signedUrl: sasUrl
                }
            };
        }

        return dataset;

    } catch (error) {
        return { dataset_id: id, data: null, parameters: null, isParameterized: false }
    }
}

const getDatasets = async ({ document, user, req }) => {
    let dataSources = _.get(document, 'reportconfig.dataSource');
    if (!dataSources) return [];
    dataSources = Array.isArray(dataSources) ? dataSources : [dataSources];
    return Promise.all(dataSources.map(dataSource => getDataset({ dataSource, user, req })));
}

module.exports = { populateReportsWithParameters, getDatasets }