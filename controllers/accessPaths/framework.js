const _ = require('lodash');

module.exports = {
    ruleName: 'framework',
    isMatch(user, payload) {
        payload = Array.isArray(payload) ? payload : [payload];

        const frameworkIds = _.get(user, 'framework.id');
        if (!frameworkIds) return false;
        if (!Array.isArray(frameworkIds)) return false;

        return _.some(payload, frameworkId => {
            if (_.find(frameworkIds, id => id === frameworkId)) {
                return true;
            }

            return false;
        });
    }
}