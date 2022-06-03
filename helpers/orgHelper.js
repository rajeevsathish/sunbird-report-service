const { contentProxyUpstream, learnerUpstream } = require('./upstream_axios')
const ROUTES = require('../resources/routes.json');

const orgSearch = ({ headers = {}, body = {} }) => {
    const config = {
        method: 'post',
        url: ROUTES.ORG.SEARCH.URL,
        headers,
        data: body
    };

    return learnerUpstream(config);
}

module.exports = {
    orgSearch
}