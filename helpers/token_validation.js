var ApiInterceptor = require('sb_api_interceptor');
const { envVariables: { AUTH } } = require('./envHelpers');

const keyCloakConfig = {
    'authServerUrl': AUTH.PORTAL_AUTH_SERVER_URL,
    'realm': AUTH.KEY_CLOAK_REALM,
    'clientId': AUTH.PORTAL_AUTH_SERVER_CLIENT,
    'public': AUTH.KEY_CLOAK_PUBLIC,
    'realmPublicKey': AUTH.KEY_CLOAK_PUBLIC_KEY
}

const cacheConfig = {
    store: AUTH.sunbird_cache_store,
    ttl: AUTH.sunbird_cache_ttl
}

const apiInterceptor = new ApiInterceptor(keyCloakConfig, cacheConfig, [`${AUTH.PORTAL_AUTH_SERVER_URL}/realms/${AUTH.KEY_CLOAK_REALM}`]);


function validateToken(token) {
    return new Promise((resolve, reject) => {
        apiInterceptor.validateToken(token, function (error, tokenData) {
            if (tokenData) {
                resolve({ status: "success", result: tokenData });
            }
            if (error) {
                resolve({ status: "failed", error });
            }
        })
    })
}

module.exports = { validateToken }