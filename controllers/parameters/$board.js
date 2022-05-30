const _ = require('lodash');
const { channelRead, frameworkRead } = require('../../helpers/learnerHelper');

module.exports = {
    name: '$board',
    value: (userData) => _.get(userData, 'userProfile.framework.board[0]'),
    cache: false,
    async masterData({ user, req }) {
        try {
            const channelId = req.get('x-channel-id') || req.get('X-CHANNEL-ID') || _.get(user, 'rootOrg.hashTagId') || _.get(user, 'channel');
            const channelReadResponse = await channelRead({ channelId });
            const frameworkName = _.get(channelReadResponse, 'data.result.channel.defaultFramework');
            if (!frameworkName) throw new Error('');
            const frameworkReadResponse = await frameworkRead({ frameworkId: frameworkName });
            const frameworkData = _.get(frameworkReadResponse, 'data.result.framework');
            const boardCategory = _.find(frameworkData.categories, ['code', 'board']);
            if (!_.get(boardCategory, 'terms') && !Array.isArray(boardCategory.terms)) { return of([]); }
            return _.map(boardCategory.terms, 'name');
        } catch (error) {
            return [];
        }
    }
}