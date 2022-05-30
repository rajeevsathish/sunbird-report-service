const _ = require('lodash');

/**
 * @description accesspath rule definition for user's gradeLevel
 * 
 */

module.exports = {
    ruleName: 'gradeLevel',
    isMatch(user, payload) {
        payload = Array.isArray(payload) ? payload : [payload];
        const userGradeLevels = _.get(user, 'framework.gradeLevel');
        if (!userGradeLevels) return false;
        if (!Array.isArray(userGradeLevels)) return false;
        return _.some(payload, gradeLevel => {
            gradeLevel = _.toLower(gradeLevel);
            if (_.find(userGradeLevels, userGradeLevel => _.toLower(userGradeLevel) === gradeLevel)) {
                return true;
            }

            return false;
        });
    }
}