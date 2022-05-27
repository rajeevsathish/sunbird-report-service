const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const basename = path.basename(__filename);

/* 
Reads all the accessPath rule Files and building the config map
Each Access path follows this interface

ruleName: string
isMatch: (user, payload) => boolean

isMatch function validates the given payload against the user context data and return if it matches or not.
*/
const rules = new Map();

((folderPath) => {
    fs.readdirSync(folderPath)
        .filter(file => file !== basename)
        .forEach(file => {
            const { ruleName, isMatch } = require(path.join(folderPath, file));
            rules.set(ruleName, isMatch);
        })
})(__dirname);

/**
 * @description Validates a user context against the accesspath rules set for the report
 * @param {*} user
 */
const validateAccessPath = user => report => {
    const { accesspath, type } = report;

    if (type === 'public') return true;
    if (type === 'private') {
        if (!accesspath) return false;
        if (typeof accesspath !== 'object') return false;
    }

    for (let [key, value] of Object.entries(accesspath)) {
        if (!rules.has(key)) return false;
        const validator = rules.get(key);
        const success = validator(user, value);
        if (!success) return false;
    }

    return true;
}

/**
 * @description func used when access path is sent in the filters for search query. Used to filter out the reports
 * @param {*} accessPathSearchPayload
 * @return {*} 
 */
const matchAccessPath = accessPathSearchPayload => {
    const accessPathSearchPayloadIterable = Object.entries(accessPathSearchPayload);

    return report => {
        const { accesspath: reportAccessPath } = report;
        if (!reportAccessPath) return false;

        for (let [ruleName, value] of accessPathSearchPayloadIterable) {
            value = Array.isArray(value) ? value : [value];

            if (!(ruleName in reportAccessPath)) return false;

            let ruleValue = reportAccessPath[ruleName];
            ruleValue = Array.isArray(ruleValue) ? ruleValue : [ruleValue];
            if (_.intersection(ruleValue, value).length === 0) return false;
        }
        return true;
    }
}

module.exports = { validateAccessPath, matchAccessPath }

