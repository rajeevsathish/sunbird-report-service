'use strict'
const { get } = require('lodash');
const env = get(process, 'env');
const fs = require('fs');

const packageObj = JSON.parse(fs.readFileSync('package.json', 'utf8'));

const printEnvVariablesStatus = () => {
    const result = Object.assign(
        {},
        ...function _flatten(object) {
            return [].concat(...Object.keys(object)
                .map(key =>
                    typeof object[key] === 'object' ?
                        _flatten(object[key]) :
                        ({ [key]: object[key] })
                )
            );
        }(envVariables)

    );
    console.log(JSON.stringify(result));
}

const envVariables = {
    DB: {
        HOST: env.SUNBIRD_REPORTS_DB_HOST || 'localhost',
        NAME: env.SUNBIRD_REPORTS_DB_NAME || 'root',
        PASSWORD: env.SUNBIRD_REPORTS_DB_PASSWORD || 'root',
        PORT: env.SUNBIRD_REPORTS_DB_PORT || 5432,
        USER: env.SUNBIRD_REPORTS_DB_USER || 'root'
    },
    SERVER_PORT: env.SUNBIRD_SERVER_PORT || 3030,
    BASE_REPORT_URL: get(env, 'SUNBIRD_BASE_REPORT_URL') || 'report',
    TABLE_NAME: get(env, 'SUNBIRD_REPORTS_TABLE_NAME') || 'report',
    SUMMARY_TABLE_NAME: get(env, 'SUNBIRD_REPORT_SUMMARY_TABLE_NAME') || 'report_summary',
    REPORT_STATUS_TABLE_NAME: get(env, 'SUNBIRD_REPORT_STATUS_TABLE_NAME') || 'report_status',
    ENV: env.SUNBIRD_ENV || 'https://dev.sunbirded.org',
    DEACTIVATE_JOB_API: {
        HOST: env.DEACTIVATE_JOB_API_HOST || '',
        KEY: `Bearer ${env.DEACTIVATE_JOB_API_KEY}`
    },
    PORTAL_API_AUTH_TOKEN: env.sunbird_api_auth_token,
    MEMORY_CACHE_TIMEOUT: 3600000, // in ms
    SUNBIRD_SUPER_ADMIN_SLUG: env.sunbird_super_admin_slug || 'sunbird',
    AUTH: {
        PORTAL_AUTH_SERVER_URL: env.sunbird_portal_auth_server_url,
        KEY_CLOAK_PUBLIC: env.sunbird_keycloak_public || 'true',
        KEY_CLOAK_REALM: env.sunbird_keycloak_realm || 'sunbird',
        PORTAL_AUTH_SERVER_CLIENT: env.sunbird_portal_auth_server_client || 'portal',
        KEY_CLOAK_PUBLIC_KEY: env.sunbird_keycloak_public_key,
        CACHE_STORE: env.sunbird_cache_store || 'memory',
        CACHE_TTL: env.sunbird_cache_ttl || 1800,
    },
    AZURE: {
        container_name: env.sunbird_azure_report_container_name,
        account_name: env.sunbird_azure_account_name,
        account_key: env.sunbird_azure_account_key,
        sasExpiryTime: env.sunbird_report_sas_expiry_in_minutes || 3600 // in minutes
    },
    UPSTREAM: {
        LEARNER: env.sunbird_learner_player_url,
        CONTENT_PROXY: env.sunbird_content_proxy_url,
        DATA_SERVICE: env.sunbird_dataservice_url
    }
}

module.exports = { envVariables, packageObj, printEnvVariablesStatus };