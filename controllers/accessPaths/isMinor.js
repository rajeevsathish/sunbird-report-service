const _ = require('lodash');

module.exports = {
    ruleName: 'isMinor',
    isMatch(user, payload) {
        //payload is boolean here
        const isUserMinor = _.get(user, 'isMinor') || false;
        return isUserMinor === payload
    }
}