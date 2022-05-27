const _ = require('lodash');
const { locationSearch } = require("../../helpers/learnerHelper");

module.exports = {
    name: '$state',
    value: (userData) => _.get(_.find(_.get(userData, 'userProfile.userLocations'), ['type', 'state']), 'name'),
    cache: true,
    async masterData({ user, req }) {
        try {
            const body = { "request": { 'filters': { 'type': 'state' } } };
            const response = await locationSearch({ body });
            const result = response.data;
            return _.map(_.get(result, 'result.response') || [], 'name');
        } catch (error) {
            return [];
        }
    }
}