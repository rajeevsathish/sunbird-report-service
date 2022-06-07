const _ = require('lodash');
var memoryCache = require('memory-cache');
var debug = require('debug')('helpers:dataServiceHelper');


const { reportParameters } = require('../controllers/parameters');
const { envVariables } = require('./envHelpers');
const { dataServiceProxyUpstream } = require('./upstream_axios')

const fetchDataset = ({ headers = {}, datasetId, params, ...rest }) => {
    const config = {
        method: 'get',
        url: `/data/v3/dataset/get/${datasetId}`,
        headers,
        ...(params && { params }),
        ...rest
    };

    return dataServiceProxyUpstream(config);
}

const getPeriodicFiles = async ({ datasetId, headers, params }) => {
    try {
        const fetchDatasetResponse = await fetchDataset({
            headers,
            datasetId,
            params
        });

        return _.get(fetchDatasetResponse, 'data.result') || {};
    } catch (error) {
        debug('getPeriodicFiles failed', datasetId, params, headers, JSON.stringify(error));
        return { periodWiseFiles: {}, files: [], expiresAt: 0 };
    }
}

const fetchAndFormatExhaustDataset = async ({ req, document, user }) => {
    const datasetId = _.get(document, 'reportconfig.dataset.datasetId');
    try {
        const { from, to } = req.query;
        const parameters = _.get(document, 'parameters') || null;

        let parameter = null, data = [];
        if (parameters && Array.isArray(parameters)) {
            [parameter] = parameters;
        }

        const isParameterized = parameter && (parameter in reportParameters);
        if (isParameterized) {
            const { masterData, cache = false, value } = reportParameters[parameter];
            const resolvedValue = value(user);
            debug(parameter, 'Resolved Value', JSON.stringify(resolvedValue));
            let masterDataForParameter;

            if (isUserSuperAdmin(user)) {
                //if the user is super REPORT_ADMIN then return all the masterData;
                //get the master data from memory cache is available else call the master data fetch API for the parameter.
                const cachedData = memoryCache.get(parameter);
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

            await Promise.all(masterDataForParameter.map(value => {
                const input = {
                    datasetId,
                    headers: {
                        ['X-Channel-Id']: value,
                    },
                    ...(from && to && {
                        params: {
                            from, to
                        }
                    })
                }
                return getPeriodicFiles(input)
                    .then(response => {
                        data.push({
                            id: value,
                            type: parameter,
                            ...response
                        })
                        return response
                    })
            }));

        } else {
            const channelID = req.get('X-Channel-Id') || _.get(user, 'rootOrg.slug');
            const input = {
                datasetId,
                headers: {
                    ['X-Channel-Id']: channelID,
                },
                ...(from && to && {
                    params: {
                        from, to
                    }
                })
            };
            const response = await getPeriodicFiles(input);
            data.push({
                id: 'default',
                type: null,
                ...response
            })
        }

        return [{
            dataset_id: datasetId,
            parameters,
            isParameterized,
            data,
            ...(from && to && {
                from, to
            })
        }];

    } catch (error) {
        debug('fetchAndFormatExhaustDataset failed', datasetId, JSON.stringify(error));
        return [{ dataset_id: datasetId, data: [], parameters: null, isParameterized: false }]
    }
}

module.exports = {
    fetchAndFormatExhaustDataset
}