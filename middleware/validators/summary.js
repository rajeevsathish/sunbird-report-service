const Joi = require("joi");

module.exports = {
    "summary:create": Joi.object({
        request: Joi.object({
            summary: Joi.object({
                reportid: Joi.string().required(),
                createdby: Joi.string().required(),
                chartid: Joi.string().optional(),
                summary: Joi.string().required(),
                param_hash: Joi.string().optional()
            }).required(),
        }).required(),
    }),
    "summary:list": Joi.object({
        request: Joi.object({
            filters: Joi.object({
                reportid: Joi.string().required(),
                chartid: Joi.string().optional(),
            }).required(),
        }).required(),
    })
}