const _ = require('lodash');

/**
 * @description accesspath rule definition for user block location
 * 
 */

module.exports = {
    ruleName: 'block',
    isMatch(user, payload) {
        payload = Array.isArray(payload) ? payload : [payload];
        const userProfileLocation = _.get(user, 'profileLocation')  || _.get(user, 'userLocations');
        if (!userProfileLocation) return false;
        if (!Array.isArray(userProfileLocation)) return false;
        const userBlock = _.find(userProfileLocation, location => _.get(location, 'type') === 'block');
        if (!(userBlock && ('id' in userBlock))) return false;
        return _.some(payload, locationId => locationId === userBlock.id);
    }
}