const _ = require('lodash');

/**
 * @description accesspath rule definition of user's medium
 * 
 */

module.exports = {
    ruleName: 'medium',
    isMatch(user, payload) {
        payload = Array.isArray(payload) ? payload : [payload];
        const userMediums = _.get(user, 'framework.medium');
        if (!userMediums) return false;
        if (!Array.isArray(userMediums)) return false;
        return _.some(payload, medium => {
            medium = _.toLower(medium);
            if (_.find(userMediums, userMedium => _.toLower(userMedium) === medium)) {
                return true;
            }

            return false;
        });
    }
}