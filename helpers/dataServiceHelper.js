const { dataServiceProxyUpstream } = require('./upstream_axios')

const getExhaustDataset = ({ headers = {}, body = {}, params, ...rest }) => {
    const config = {
        method: 'get',
        url: '/dataset/get',
        headers,
        ...(params && { params }),
        ...rest
    };

    return dataServiceProxyUpstream(config);
}

module.exports = {
    getExhaustDataset
}