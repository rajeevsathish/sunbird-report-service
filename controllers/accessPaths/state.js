const _ = require('lodash');

/**
 * @description accesspath rule definition of user's state value
 * 
 */

module.exports = {
    ruleName: 'state',
    isMatch(user, payload) {
        payload = Array.isArray(payload) ? payload : [payload];
        const userProfileLocation = _.get(user, 'profileLocation') || _.get(user, 'userLocations');
        if (!userProfileLocation) return false;
        if (!Array.isArray(userProfileLocation)) return false;
        const userState = _.find(userProfileLocation, location => _.get(location, 'type') === 'state');
        if (!(userState && ('id' in userState))) return false;
        return _.some(payload, locationId => locationId === userState.id);
    }
}