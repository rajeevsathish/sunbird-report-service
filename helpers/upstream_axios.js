const axios = require('axios');
const { envVariables: { UPSTREAM, PORTAL_API_AUTH_TOKEN } } = require('./envHelpers')

const commonHeaders = {
    'Authorization': `Bearer ${PORTAL_API_AUTH_TOKEN}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json'
}

const successCallback = function (config) {
    config.headers = { ...config.headers, ...commonHeaders };
    return config;
}

const errorCallback = function (error) {
    return Promise.reject(error);
}

/*
    UPSTREAM INSTANCES
*/
const learnerUpstream = axios.create({
    baseURL: UPSTREAM.LEARNER
});

learnerUpstream.interceptors.request.use(successCallback, errorCallback);

const contentProxyUpstream = axios.create({
    baseURL: UPSTREAM.CONTENT_PROXY
});

contentProxyUpstream.interceptors.request.use(successCallback, errorCallback);

module.exports = {
    learnerUpstream,
    contentProxyUpstream
}