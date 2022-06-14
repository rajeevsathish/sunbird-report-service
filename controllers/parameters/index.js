const _ = require('lodash');
const fs = require('fs');
const path = require('path');
var memoryCache = require('memory-cache');
var debug = require('debug')('parameters:index');

const { getSharedAccessSignature } = require('../../helpers/azure-storage');
const { envVariables } = require('../../helpers/envHelpers');
const { isUserSuperAdmin } = require('../../helpers/userHelper');
const CONSTANTS = require('../../resources/constants.json')

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

    return null;
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
            if (user) {
                const hash = getParametersHash(report, user);
                if (isUserSuperAdmin(user)) {
                    results.push(report);
                } else {
                    const childReports = _.uniqBy(_.concat(_.filter(_.get(report, 'children'), child => hash.includes(_.get(child, 'hashed_val'))),
                        _.map(hash, hashed_val => ({
                            hashed_val,
                            status: CONSTANTS.REPORT_STATUS.DRAFT,
                            reportid: _.get(report, 'reportid'),
                            materialize: true
                        }))), 'hashed_val');

                    if (childReports.length) {
                        if (childReports.length === 1) {
                            const mergedReport = _.assign(report.dataValues, _.pick(_.get(childReports, '[0].dataValues'), ['status', 'hashed_val']));
                            results.push(mergedReport);
                        } else {
                            report.children = childReports;
                            results.push(report);
                        }
                    }
                }
            }
        }
        else {
            results.push(report);
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
        .then(({ sasUrl, expiresAt }) => ({ key: value, sasUrl, expiresAt }))
        .catch(_ => ({ key: value, sasUrl: null, expiresAt: null }))
        .then(data => {
            const { key, sasUrl, expiresAt } = data;
            dataset.data.push({
                id: key,
                type: parameter,
                url: sasUrl,
                expiresAt
            });
        });
    return promise;
}

const getDataset = async ({ dataSource, user, req }) => {
    let { id, path } = dataSource;
    try {
        const dataset = { dataset_id: id, isParameterized: false, parameters: null, data: [] };
        // for backward compatibility
        if (typeof path === 'string' && path.startsWith('/reports/fetch/')) {
            path = path.replace('/reports/fetch/', '');
        }

        const parameter = getParameterFromPath(path);

        if (parameter) {

            dataset.isParameterized = true;
            dataset.parameters = [parameter];

            const { masterData, cache = false, value } = parameters[parameter];
            const resolvedValue = value(user);
            debug(parameter, 'Resolved Value', JSON.stringify(resolvedValue));
            let masterDataForParameter;

            if (isUserSuperAdmin(user)) {
                //if the user is super REPORT_ADMIN then return all the masterData;
                //get the master data from memory cache is available else call the master data fetch API for the parameter.
                const cachedData = memoryCache.get(parameter);
                debug(parameter, 'Cached Data', JSON.stringify(cachedData));
                if (false && cachedData && cache) {
                    masterDataForParameter = cachedData;
                } else {
                    masterDataForParameter = await masterData({ user, req });
                    debug(parameter, 'Master Data', JSON.stringify(masterDataForParameter));
                    memoryCache.put(parameter, masterDataForParameter, envVariables.MEMORY_CACHE_TIMEOUT);
                }
            } else {
                //if the user is not super REPORT_ADMIN then return only the resolved parameter data;
                masterDataForParameter = resolvedValue && (Array.isArray(resolvedValue) ? resolvedValue : [resolvedValue]);
            }

            if (Array.isArray(masterDataForParameter) && masterDataForParameter.length) {
                await Promise.all(masterDataForParameter.map(generateSasPredicate({ parameter, path, dataset })))
            }

        } else {
            const { sasUrl, expiresAt } = await getSharedAccessSignature({ filePath: path }).catch(error => null);
            dataset.data = [{
                id: 'default',
                type: null,
                url: sasUrl,
                expiresAt
            }];
        }

        return dataset;

    } catch (error) {
        return { dataset_id: id, data: [], parameters: null, isParameterized: false }
    }
}

const getDatasets = async ({ document, user, req }) => {
    let dataSources = _.get(document, 'reportconfig.dataSource');
    if (!dataSources) return [];
    dataSources = Array.isArray(dataSources) ? dataSources : [dataSources];
    return Promise.all(dataSources.map(dataSource => getDataset({ dataSource, user, req })));
}

module.exports = { populateReportsWithParameters, getDatasets, reportParameters: parameters, isReportParameterized }