const { Op } = require("sequelize");
const createError = require('http-errors');
var debug = require('debug')('report-service:server');
const _ = require('lodash');
const axios = require('axios');

const { report, report_status, report_summary } = require('../models');
const CONSTANTS = require('../resources/constants.json');
const { formatApiResponse } = require('../helpers/responseFormatter');
const { validateAccessPath, matchAccessPath } = require("./accessPaths");
const { getDatasets } = require("./parameters");

// checks by reportid if the report exists in our database or not
const reportExists = async (reportid) => report.findOne({ where: { reportid } });

/**
 * @description controller for searching of the reports. If user token is not passed return only public reports else filter the reports based on the accesspath set.
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @return {*} 
 */
const search = async (req, res, next) => {
    try {
        const { filters = {}, options = { showChildren: true } } = req.body.request;
        const { accesspath, ...otherFilters } = filters;

        let { rows } = await report.findAndCountAll({
            ...(Object.keys(otherFilters).length && {
                where: {
                    ...otherFilters
                }
            }),
            order: [['createdon', 'DESC']],
            ...(options.showChildren && {
                include: { model: report_status, required: false, as: 'children' }
            }),
            ...options
        });

        //is accesspath is provided as search filter create a closure to filter reports
        const accessPathMatchClosure = accesspath && matchAccessPath(accesspath);

        //check if x-authenticated-user-token is provided. If not return only public reports else validate accesspaths.
        let filteredReports = [];
        const userDetails = req.userDetails;
        if (!userDetails) {
            //token absent => check only public reports
            filteredReports = _.filter(rows, row => {
                if (accessPathMatchClosure) {
                    const isMatched = accessPathMatchClosure(row);
                    if (!isMatched) return false;
                }
                return row.type === CONSTANTS.REPORT_TYPE.PUBLIC;
            });
        } else {
            //token present => check for both public and private reports
            filteredReports = _.filter(rows, row => {
                const { type } = row;
                if (!type) return false;
                if (accessPathMatchClosure) {
                    const isMatched = accessPathMatchClosure(row);
                    if (!isMatched) return false;
                }
                if (type === CONSTANTS.REPORT_TYPE.PUBLIC) return true;
                if (type === CONSTANTS.REPORT_TYPE.PRIVATE) {
                    return validateAccessPath(userDetails)(row);
                }
            })
        }
        return res.status(200).json(formatApiResponse({ id: req.id, result: { reports: filteredReports, count: filteredReports.length } }));
    } catch (error) {
        return next(createError(500, error));
    }
}

/**
 * @description controller for the creation of report
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @return {*} 
 */
const create = async (req, res, next) => {
    try {
        const { report: reportMeta } = req.body.request;
        const { reportid, reportaccessurl } = await report.create(reportMeta);

        return res.status(201).json(formatApiResponse({
            id: req.id,
            result: {
                reportId: reportid,
                reportaccessurl
            }
        }));

    } catch (error) {
        return next(createError(500, error.message));
    }
}

/**
 * @description controller for the deletion of report
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @return {*} 
 */
const remove = async (req, res, next) => {
    try {
        const { reportid, hash } = req.params;
        let success;

        if (hash) {
            success = await report_status.destroy({
                where: {
                    reportid,
                    hashed_val: hash
                }
            });
        } else {
            //if a report is deleted, delete all associated report summaries and report status entries.
            try {

                const exists = await reportExists(reportid);
                if (!exists) return next(createError(404, CONSTANTS.MESSAGES.NO_REPORT));

                await Promise.all([
                    report.destroy({
                        where: {
                            reportid
                        }
                    }),
                    report_summary.destroy({
                        where: {
                            reportid
                        }
                    })],
                    report_summary.destroy({
                        where: {
                            reportid
                        }
                    }));

                success = true;
            } catch (error) {
                success = false;
            }
        }

        if (!success) {
            return next(createError(404, CONSTANTS.MESSAGES.NO_REPORT));
        }

        return res.status(200).json(formatApiResponse({ id: req.id, result: { reportid, ...(hash && { hash }) } }));
    } catch (error) {
        return next(createError(500, error.message));
    }
}

/**
 * @description controller to read a report metadata with or without access path
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @return {*} 
 */
const read = async (req, res, next) => {
    try {
        const { reportid, hash } = _.get(req, "params");
        const { fields, showChildren = 'true' } = req.query;
        const document = await report.findOne({
            where: {
                reportid
            },
            ...((showChildren === 'true') && {
                include: {
                    model: report_status, required: false, as: 'children', where: {
                        reportid,
                        ...(hash && { hashed_val: hash })
                    }
                }
            }),
            ...(fields && typeof fields === 'string' && {
                attributes: fields.split(',')
            })
        });

        if (!document) return next(createError(404, CONSTANTS.MESSAGES.NO_REPORT));

        if (document.type === 'private') {
            const userDetails = req.userDetails;

            if (!userDetails) {
                return next(createError(401, 'unauthorized access'));
            }

            const isAuthorized = validateAccessPath(userDetails)(document);

            if (!isAuthorized) {
                return next(createError(401, 'unauthorized access'));
            }

        }

        return res.json(formatApiResponse({ id: req.id, result: document }));
    } catch (error) {
        return next(createError(500, error.message));
    }
}

/**
 * @description controller to update a report metadata.
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @return {*} 
 */
const update = async (req, res, next) => {
    try {
        const { reportid } = _.get(req, "params");
        const { report: updatePayload, options = { returning: true } } = _.get(req, "body.request");

        const exists = await reportExists(reportid);
        if (!exists) return next(createError(404, CONSTANTS.MESSAGES.NO_REPORT));

        await report.update(
            {
                ...updatePayload
            },
            {
                where: {
                    reportid
                },
                ...options
            });

        return res.status(200).json(formatApiResponse({ id: req.id, result: { reportid } }));
    } catch (error) {
        return next(createError(500, error.message));
    }
}

/**
 * @description controller to publish a report live.
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @return {*} 
 */
const publish = async (req, res, next) => {
    try {
        const { reportid, hash } = req.params;

        const document = await reportExists(reportid);
        if (!document) return next(createError(404, CONSTANTS.MESSAGES.NO_REPORT));

        if (!hash) {
            await report.update(
                {
                    status: CONSTANTS.REPORT_STATUS.LIVE,
                },
                {
                    where: {
                        reportid
                    }
                })
        } else {
            const { count } = await report_status.findAndCountAll({
                where: {
                    reportid,
                    hashed_val: hash
                }
            })

            if (count > 0) {
                await report_status.update(
                    {
                        status: CONSTANTS.REPORT_STATUS.LIVE
                    },
                    {
                        reportid,
                        hashed_val: hash
                    }
                )
            } else {
                await report_status.create({
                    reportid,
                    status: CONSTANTS.REPORT_STATUS.LIVE,
                    hashed_val: hash
                })
            }
        }

        return res.status(200).json(formatApiResponse({ id: req.id, result: { reportid, ...(hash && { hash }) } }));
    } catch (error) {
        return next(createError(500, error.message));
    }
}

/**
 * @description find all jobsIds from a report
 * @param {*} reportConfig
 * @returns
 */
const getJobIds = reportConfig => {
    const dataSourcesObj = _.get(reportConfig, 'dataSource');
    const dataSources = (_.isArray(dataSourcesObj) && dataSourcesObj) || [];
    return _.map(dataSources, 'id');
}

/**
 * @description deactivates an analytics job
 * @param {*} jobId
 * @returns
 */
const deactivateJob = jobId => {
    var config = {
        method: 'post',
        url: `${envVariables.DEACTIVATE_JOB_API.HOST}/${jobId}`,
        headers: {
            'Authorization': envVariables.DEACTIVATE_JOB_API.KEY,
            'Content-Type': 'application/json'
        }
    };
    return axios(config)
        .then(response => {
            const { err, errmsg, status } = _.get(response, 'data.params');
            if (status === 'failed' || (err && errmsg)) {
                throw new Error(JSON.stringify({ err, errmsg, status }));
            }
        });
}

/**
 * @description deactivates all jobs whenever a report is retired
 * @param {*} report
 */
const deactivateAllJobsForReport = async jobIds => {
    try {
        await Promise.all(_.map(jobIds, id => deactivateJob(id)));
        return true;
    } catch (error) {
        console.log(JSON.stringify(error));
        return false;
    }
}

/**
 * @description controller to retire a report.
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @return {*} 
 */
const retire = async (req, res, next) => {
    try {
        const { reportid, hash } = req.params;

        const document = await reportExists(reportid);
        if (!document) return next(createError(404, CONSTANTS.MESSAGES.NO_REPORT));

        if (!hash) {

            const reportConfig = _.get(document, 'reportconfig');

            if (reportConfig) {
                const jobIds = getJobIds(reportConfig);
                if (jobIds.length) {
                    const success = await deactivateAllJobsForReport(jobIds);
                    if (!success) {
                        return next(createError(500, CONSTANTS.MESSAGES.RETIRE_FAILURE));
                    }
                }
            }

            await report.update(
                {
                    status: CONSTANTS.REPORT_STATUS.RETIRED,
                },
                {
                    where: {
                        reportid
                    }
                });

        } else {

            const { count } = await report_status.findAndCountAll({
                where: {
                    reportid,
                    hashed_val: hash
                }
            })

            if (count > 0) {
                await report_status.update(
                    {
                        status: CONSTANTS.REPORT_STATUS.RETIRED
                    },
                    {
                        reportid,
                        hashed_val: hash
                    }
                )
            } else {
                await report_status.create({
                    reportid,
                    status: CONSTANTS.REPORT_STATUS.RETIRED,
                    hashed_val: hash
                })
            }
        }
        return res.status(200).json(formatApiResponse({ id: req.id, result: { reportid, ...(hash && { hash }) } }));
    } catch (error) {
        return next(createError(500, error.message));
    }
}

/**
 * @description controller to read a report metadata along with it's datasets files
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @return {*} 
 */
const readWithDatasets = async (req, res, next) => {
    try {
        const { reportid, hash } = _.get(req, "params");
        const { fields, showChildren = 'true' } = req.query;
        const document = await report.findOne({
            where: {
                reportid
            },
            ...((showChildren === 'true') && {
                include: {
                    model: report_status, required: false, as: 'children', where: {
                        reportid,
                        ...(hash && { hashed_val: hash })
                    }
                }
            }),
            ...(fields && typeof fields === 'string' && {
                attributes: fields.split(',')
            })
        });

        if (!document) return next(createError(404, CONSTANTS.MESSAGES.NO_REPORT));

        const user = req.userDetails;
        if (document.type === 'private') {

            if (!user) {
                return next(createError(401, 'unauthorized access'));
            }

            const isAuthorized = validateAccessPath(user)(document);

            if (!isAuthorized) {
                return next(createError(401, 'unauthorized access'));
            }
        }

        const datasets = await getDatasets({ document, user, req });
        return res.json(formatApiResponse({ id: req.id, result: { metadata: document, datasets } }));
    } catch (error) {
        return next(createError(500, error.message));
    }
}


module.exports = { search, create, remove, read, update, publish, retire, readWithDatasets };