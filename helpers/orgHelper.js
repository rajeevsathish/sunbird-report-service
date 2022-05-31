const { contentProxyUpstream } = require('./upstream_axios')
const ROUTES = require('../resources/routes.json');

const orgSearch = ({ headers = {}, body = {} }) => {
    const config = {
        method: 'post',
        url: ROUTES.ORG.SEARCH.URL,
        headers,
        data: body
    };

    return contentProxyUpstream(config);
}

module.exports = {
    orgSearch
}