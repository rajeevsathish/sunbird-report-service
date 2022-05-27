const _ = require('lodash');

module.exports = {
    ruleName: 'channel',
    isMatch(user, payload) {
        payload = Array.isArray(payload) ? payload : [payload];
        const userChannelId = _.get(user, 'channel');
        if (!userChannelId) return false;
        return _.some(payload, channel => channel === userChannelId);
    }
}