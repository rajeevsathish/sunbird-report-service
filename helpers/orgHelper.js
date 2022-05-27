const { contentProxyUpstream } = require('./upstream_axios')

const orgSearch = ({ headers = {}, body = {} }) => {
    const config = {
        method: 'post',
        url: '/api/org/v1/ext/search',
        headers,
        data: body
    };

    return contentProxyUpstream(config);
}

module.exports = {
    orgSearch
}