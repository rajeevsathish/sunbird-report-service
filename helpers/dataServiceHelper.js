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

        return _.get(fetchDatasetResponse, 'data.result.periodWiseFiles') || {};
    } catch (error) {
        debug('getPeriodicFiles failed', datasetId, params, headers, JSON.stringify(error));
        return {};
    }
}

const fetchAndFormatExhaustDataset = async ({ req, document, user }) => {
    const datasetId = _.get(document, 'reportconfig.dataset.datasetId');
    try {
        const { from, to } = req.query;
        const parameters = _.get(document, 'parameters') || null;

        let parameter = null, data = {};
        if (parameters && Array.isArray(parameters)) {
            [parameter] = parameters;
        }

        const isParameterized = parameter && (parameter in reportParameters);
        if (isParameterized) {
            const { masterData, cache = false } = reportParameters[parameter];
            let masterDataForParameter;

            //get the master data from memory cache is available else call the master data fetch API for the parameter.
            const cachedData = memoryCache.get(parameter);

            if (cachedData && cache) {
                masterDataForParameter = cachedData;
            } else {
                masterDataForParameter = await masterData({ user, req });
                memoryCache.put(parameter, masterDataForParameter, envVariables.MEMORY_CACHE_TIMEOUT);
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
                return getPeriodicFiles(input).then(periodWiseFiles => {
                    data[value] = { periodWiseFiles }
                    return periodWiseFiles
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
            const periodWiseFiles = await getPeriodicFiles(input);
            data = {
                default: {
                    periodWiseFiles
                }
            }
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
        return [{ dataset_id: datasetId, data: null, parameters: null, isParameterized: false }]
    }
}

module.exports = {
    fetchAndFormatExhaustDataset
}