const _ = require('lodash');

module.exports = {
    ruleName: 'userId',
    isMatch(user, payload) {
        payload = Array.isArray(payload) ? payload : [payload];
        const userId = _.get(user, 'identifier') || _.get(user, 'id');
        if (!userId) return false;
        return _.some(payload, id => userId === id);
    }
}