const { learnerUpstream } = require('./upstream_axios');
const ROUTES = require('../resources/routes.json');

const locationSearch = ({ headers = {}, body = {} }) => {
    const config = {
        method: 'post',
        url: ROUTES.LOCATION.SEARCH.URL,
        headers,
        data: body
    };

    return learnerUpstream(config);
}

const channelRead = ({ channelId, headers = {} }) => {
    const config = {
        method: 'get',
        url: `${ROUTES.CHANNEL.READ.URL}/${channelId}`,
        headers,
    };
    return learnerUpstream(config);
}

const frameworkRead = ({ frameworkId, headers = {} }) => {
    const config = {
        method: 'get',
        url: `${ROUTES.FRAMEWORK.READ.URL}/${frameworkId}`,
        headers,
    };
    return learnerUpstream(config);
}


module.exports = {
    locationSearch,
    channelRead,
    frameworkRead
}