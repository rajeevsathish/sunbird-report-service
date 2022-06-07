const _ = require('lodash');

/**
 * @description accesspath rule definition for user's channel
 * 
 */

module.exports = {
    ruleName: 'channel',
    isMatch(user, payload) {
        payload = Array.isArray(payload) ? payload : [payload];
        const userChannelId = _.get(user, 'rootOrg.hashTagId') || _.get(user, 'rootOrg.channel') || _.get(user, 'channel');
        if (!userChannelId) return false;
        return _.some(payload, channel => channel === userChannelId);
    }
}