const _ = require('lodash');

module.exports = {
    ruleName: 'slug',
    isMatch(user, payload) {
        payload = Array.isArray(payload) ? payload : [payload];
        const userSlug = _.get(user, 'slug');
        if (!userSlug) return false;
        return _.some(payload, slug => slug === userSlug);
    }
}