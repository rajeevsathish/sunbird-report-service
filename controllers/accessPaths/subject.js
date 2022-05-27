const _ = require('lodash');

module.exports = {
    ruleName: 'subject',
    isMatch(user, payload) {
        payload = Array.isArray(payload) ? payload : [payload];
        const userSubjects = _.get(user, 'framework.subject');
        if (!userSubjects) return false;
        if (!Array.isArray(userSubjects)) return false;
        return _.some(payload, subject => {
            subject = _.toLower(subject);
            if (_.find(userSubjects, userSubject => _.toLower(userSubject) === subject)) {
                return true;
            }

            return false;
        });
    }
}