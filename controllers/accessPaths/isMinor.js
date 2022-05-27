const _ = require('lodash');

/**
 * @description accesspath rule definition whether user is minor or not
 * 
 */

module.exports = {
    ruleName: 'isMinor',
    isMatch(user, payload) {
        //payload is boolean here
        const isUserMinor = _.get(user, 'isMinor') || false;
        return isUserMinor === payload
    }
}