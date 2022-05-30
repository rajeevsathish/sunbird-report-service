const _ = require('lodash');

/**
 * @description accesspath rule definition for user's district location
 * 
 */

module.exports = {
    ruleName: 'district',
    isMatch(user, payload) {
        payload = Array.isArray(payload) ? payload : [payload];
        const userProfileLocation = _.get(user, 'profileLocation');
        if (!userProfileLocation) return false;
        if (!Array.isArray(userProfileLocation)) return false;
        const userDistrict = _.find(userProfileLocation, location => _.get(location, 'type') === 'district');
        if (!(userDistrict && ('id' in userDistrict))) return false;
        return _.some(payload, locationId => locationId === userDistrict.id);
    }
}