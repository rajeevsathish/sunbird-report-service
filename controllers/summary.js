var debug = require('debug')('controllers:summary');
const createError = require('http-errors');

const { report_summary, report_status } = require('../models');
const CONSTANTS = require('../resources/constants.json');
const { formatApiResponse } = require('../helpers/responseFormatter');

/**
 * @description controller to read a report/chart summary
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @return {*} 
 */
const createSummary = async (req, res, next) => {
    try {
        const { summary } = req.body.request;
        const { id } = await report_summary.create(summary);

        if ('param_hash' in summary) {
            const { reportid, param_hash } = summary;

            const document = await report_status.findOne({
                where: {
                    reportid: reportid,
                    hashed_val: param_hash
                }
            })

            if (!document) {
                await report_status.create({
                    reportid,
                    status: CONSTANTS.REPORT_STATUS.DRAFT,
                    hashed_val: param_hash
                })
            }
        }

        return res.status(200).json(formatApiResponse({ id: req.id, result: { summaryId: id } }));
    } catch (error) {
        debug('createSummary failed', JSON.stringify(error));
        return next(createError(500, error));
    }
}

/**
 * @description controller to list all the report or chart summaries
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @return {*} 
 */
const listSummaries = async (req, res, next) => {
    try {

        const { filters = {}, options = {} } = req.body.request;
        const { count, rows } = await report_summary.findAndCountAll({
            ...(Object.keys(filters).length && {
                where: {
                    ...filters
                }
            }),
            order: [['createdon', 'DESC']],
            ...options
        });
        return res.json(formatApiResponse({ id: req.id, result: { summaries: rows, count } }));
    } catch (error) {
        debug('listSummaries failed', JSON.stringify(error));
        return next(createError(500, error));
    }
}

/**
 * @description This controller method is used to fetch the latest report/chart summary
 */
const getLatestSummary = async (req, res, next) => {
    try {
        const { hash } = req.query;
        const { reportid, chartid } = req.params;
        const { count, rows } = await report_summary.findAndCountAll({
            where: {
                reportid,
                ...(chartid && { chartid }),
                ...(hash && { param_hash: hash })
            },
            order: [
                ['createdon', 'DESC']
            ],
            limit: 1
        });

        return res.json(formatApiResponse({ id: req.id, result: { summaries: rows, count } }));

    } catch (error) {
        debug('getLatestSummary failed', JSON.stringify(error));
        return next(createError(500, error));
    }
}

module.exports = {
    getLatestSummary,
    createSummary,
    listSummaries
}