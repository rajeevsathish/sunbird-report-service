const _ = require('lodash');
const { orgSearch } = require("../../helpers/orgHelper");

module.exports = {
    name: '$slug',
    value: (userData) => _.get(userData, 'userProfile.rootOrg.slug'),
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
            return _.map(_.get(result, 'result.response.content') || [], 'slug');
        } catch (error) {
            return [];
        }
    }
}