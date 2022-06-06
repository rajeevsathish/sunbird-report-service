const Joi = require("joi");
const CONSTANTS = require('../../resources/constants.json');

const reportTypesEnum = Object.values(CONSTANTS.REPORT_TYPE)
const statusEnum = Object.values(CONSTANTS.REPORT_STATUS)

module.exports = {
    "report:create": Joi.object({
        request: Joi.object({
            report: Joi.object({
                reportid: Joi.string().optional(),
                description: Joi.string().required(),
                title: Joi.string().required(),
                authorizedroles: Joi.array().items(Joi.string()).required(),
                reportaccessurl: Joi.string().optional(),
                reportconfig: Joi.object().required(),
                createdon: Joi.string().optional(),
                updatedon: Joi.string().optional(),
                createdby: Joi.string().required(),
                type: Joi.string().valid(...reportTypesEnum).required(),
                report_type: Joi.string().valid("report", "dataset").optional(),
                status: Joi.string()
                    .valid(CONSTANTS.REPORT_STATUS.DRAFT)
                    .trim()
                    .optional(),
                slug: Joi.string().trim().required(),
                templateurl: Joi.string().optional(),
                tags: Joi.array().items(Joi.string()).required(),
                updatefrequency: Joi.string().required(),
                reportgenerateddate: Joi.string().required(),
                reportduration: Joi.object({
                    startdate: Joi.string().required(),
                    enddate: Joi.string().required(),
                }).required(),
                parameters: Joi.array().items(Joi.string()).optional(),
                accesspath: Joi.alternatives().conditional('type', { is: CONSTANTS.REPORT_TYPE.PROTECTED, then: Joi.object().required(), otherwise: Joi.object().optional() }),
                visibilityflags: Joi.object().optional().default({})
            }).required(),
        }).required(),
    }),
    "report:update": Joi.object({
        request: Joi.object({
            report: Joi.object({
                description: Joi.string().optional(),
                title: Joi.string().optional(),
                authorizedroles: Joi.array().items(Joi.string()).optional(),
                reportaccessurl: Joi.string().optional(),
                reportconfig: Joi.object().optional(),
                createdon: Joi.string().optional(),
                updatedon: Joi.string().optional(),
                createdby: Joi.string().optional(),
                type: Joi.string().valid(...reportTypesEnum).optional(),
                report_type: Joi.string().valid("report", "dataset").optional(),
                status: Joi.string()
                    .valid(...statusEnum)
                    .trim()
                    .optional(),
                slug: Joi.string().trim().optional(),
                templateurl: Joi.string().optional(),
                tags: Joi.array().items(Joi.string()).optional(),
                updatefrequency: Joi.string().optional(),
                reportgenerateddate: Joi.string().optional(),
                reportduration: Joi.object({
                    startdate: Joi.string().required(),
                    enddate: Joi.string().required(),
                }).optional(),
                parameters: Joi.array().items(Joi.string()).optional(),
                accesspath: Joi.object().optional(),
                visibilityflags: Joi.object().optional().default({})
            }).required(),
            options: Joi.object().unknown(true).optional()
        }).required(),
    }),
    "report:search": Joi.object({
        request: Joi.object({
            filters: Joi.object().unknown(true).optional(),
            options: Joi.object().unknown(true).optional()
        }).required(),
    })
}