const _ = require('lodash');

/**
 * @description accesspath rule definition of username value
 * 
 */

module.exports = {
    ruleName: 'username',
    isMatch(user, payload) {
        payload = Array.isArray(payload) ? payload : [payload];
        const userName = _.get(user, 'userName');
        if (!userName) return false;
        return _.some(payload, id => userName === id);
    }
}