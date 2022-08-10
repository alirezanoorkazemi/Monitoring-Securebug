const check = require('express-validator');
const {requiredResponse, notValidResponse} = require('../../../../libs/message.helper');
const {STATIC_VARIABLES} = require('../../../../libs/enum.helper');
const {safeString} = require('../../../../libs/methode.helper');

const getsValidationSchema = () => {
    return [
        check.query('page').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("page")).bail()
            .isInt({gt: 0}).withMessage(notValidResponse("limit")).bail()
            .toInt(),
        check.query('limit').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("limit")).bail()
            .isInt({gt: 0}).withMessage(notValidResponse("limit")).bail()
            .isIn(STATIC_VARIABLES.PAGE_SIZE_VALUES).withMessage(notValidResponse("limit")).bail()
            .toInt(),
        check.query('title').optional({nullable: true}).isString()
            .withMessage(notValidResponse("title")).bail().customSanitizer(v => safeString(v))
    ]
};

const createValidationSchema = () => {
    return [
        check.body('title').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("title")).bail()
            .isString().withMessage(notValidResponse("title")).bail().customSanitizer(v => safeString(v)),
        check.body('status').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("status")).bail()
            .isBoolean().withMessage(notValidResponse("status")).bail()
            .isIn([true, false]).withMessage(notValidResponse("status")).bail()
            .toBoolean()
    ]
};

const updateValidationSchema = () => {
    return [
        check.param('id').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("id")).bail()
            .isMongoId().withMessage(notValidResponse("id")).bail().customSanitizer(v => safeString(v)),
        check.body('title').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("title")).bail()
            .isString().withMessage(notValidResponse("title")).bail().customSanitizer(v => safeString(v)),
        check.body('status').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("status")).bail()
            .isBoolean().withMessage(notValidResponse("status")).bail()
            .isIn([true, false]).withMessage(notValidResponse("status")).bail()
            .toBoolean()
    ]
};

const deleteValidationSchema = () => {
    return [
        check.param('id').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("id")).bail()
            .isMongoId().withMessage(notValidResponse("id")).bail().customSanitizer(v => safeString(v))
    ]
};

module.exports = {
    gets: getsValidationSchema,
    update: updateValidationSchema,
    delete: deleteValidationSchema,
    create: createValidationSchema
};