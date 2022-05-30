const _ = require('lodash');

/**
 * @description accesspath rule definition of user's userid value
 * 
 */

module.exports = {
    ruleName: 'userId',
    isMatch(user, payload) {
        payload = Array.isArray(payload) ? payload : [payload];
        const userId = _.get(user, 'identifier') || _.get(user, 'id');
        if (!userId) return false;
        return _.some(payload, id => userId === id);
    }
}