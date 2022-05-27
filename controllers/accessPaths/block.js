const _ = require('lodash');

module.exports = {
    ruleName: 'block',
    isMatch(user, payload) {
        payload = Array.isArray(payload) ? payload : [payload];
        const userProfileLocation = _.get(user, 'profileLocation');
        if (!userProfileLocation) return false;
        if (!Array.isArray(userProfileLocation)) return false;
        const userBlock = _.find(userProfileLocation, location => _.get(location, 'type') === 'block');
        if (!(userBlock && ('id' in userBlock))) return false;
        return _.some(payload, locationId => locationId === userBlock.id);
    }
}