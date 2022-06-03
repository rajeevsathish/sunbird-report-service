
const _ = require('lodash');
var debug = require('debug')('parameters:$channel');

const { orgSearch } = require("../../helpers/orgHelper");

module.exports = {
    name: '$channel',
    value: (userData) => _.get(userData, 'userProfile.rootOrg.hashTagId'),
    cache: true,
    async masterData({ user, req }) {
        try {
            const body = {
                "request": {
                    "filters": {
                        "isRootOrg": true,
                        "status": 1
                    },
                    "fields": ["id", "channel", "slug", "orgName"]
                }
            };
            const response = await orgSearch({ body });
            const result = response.data;
            return _.map(_.get(result, 'result.response.content') || [], 'id');
        } catch (error) {
            debug(`$channel masterData fetch failed`, JSON.stringify(error));
            return [];
        }
    }
}