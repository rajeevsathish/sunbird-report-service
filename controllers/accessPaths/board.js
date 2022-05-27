const _ = require('lodash');

module.exports = {
    ruleName: 'board',
    isMatch(user, payload) {
        payload = Array.isArray(payload) ? payload : [payload];
        const userBoards = _.get(user, 'framework.board');
        if (!userBoards) return false;
        if (!Array.isArray(userBoards)) return false;
        return _.some(payload, board => {
            board = _.toLower(board);
            if (_.find(userBoards, userBoard => _.toLower(userBoard) === board)) {
                return true;
            }

            return false;
        });
    }
}