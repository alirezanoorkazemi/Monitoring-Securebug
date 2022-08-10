const check = require('express-validator');
const {requiredResponse, notValidResponse, customResponse} = require('../../../libs/message.helper');
const {safeString, cleanXSS} = require('../../../libs/methode.helper');
const {
    REPORT_ACTIVITY,
    REPORT_SEVERITY,
    PROGRAM_BOUNTY_TYPE,
    STATIC_VARIABLES,
    REPORT_STATUS
} = require('../../../libs/enum.helper');

const getsValidationSchema = () => {
    return [
        check.query('page').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("page")).bail()
            .isInt({gt: 0}).withMessage(notValidResponse("page")).bail()
            .toInt(),
        check.query('limit').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("limit")).bail()
            .isInt({gt: 0}).withMessage(notValidResponse("limit")).bail()
            .isIn(STATIC_VARIABLES.PAGE_SIZE_VALUES).withMessage(notValidResponse("limit")).bail()
            .toInt(),
        check.query('order').optional({nullable: true}).isString().withMessage(notValidResponse("order")).bail()
            .isIn(['date', 'title', 'last_modified']).withMessage(notValidResponse("order")).bail(),
        check.query('severity').optional({nullable: true}).isInt().withMessage(notValidResponse("severity")).bail()
            .isIn(REPORT_SEVERITY.VALUES).withMessage(notValidResponse("severity")).bail()
            .toInt(),
        check.query('status').optional({nullable: true}).isInt().withMessage(notValidResponse("status")).bail()
            .isIn(REPORT_STATUS.VALUES).withMessage(notValidResponse("status")).bail()
            .toInt(),
        check.query('from_date').optional({nullable: true})
            .isISO8601().withMessage(notValidResponse("from_date")).bail()
            .toDate(),
        check.query('to_date').optional({nullable: true})
            .isISO8601().withMessage(notValidResponse("to_date")).bail()
            .toDate()
            .if(check.query('from_date').exists({checkFalsy: true}))
            .if(check.query('to_date').exists({checkFalsy: true}))
            .custom((value, {req}) => value >= req.query.from_date)
            .withMessage(customResponse("from_date is greater than to_date")),
        check.query('report_activity').optional({nullable: true}).isInt().withMessage(notValidResponse("report_activity")).bail()
            .isIn(REPORT_ACTIVITY.VALUES).withMessage(notValidResponse("report_activity")).bail()
            .toInt(),
        check.query('has_pay').optional({nullable: true}).isBoolean().withMessage(notValidResponse("has_pay")).bail()
            .isIn([true, false]).withMessage(notValidResponse("has_pay")).bail()
            .toBoolean(),
        check.query('comments').optional({nullable: true}).isString().withMessage(notValidResponse("comments")).bail()
            .isIn(["read", "unread", "company", "unread-company"]).withMessage(notValidResponse("comments")).bail(),
        check.query('report_id').optional({nullable: true}).isMongoId().withMessage(notValidResponse("report_id")).bail(),
        check.query('program_id').optional({nullable: true}).isMongoId().withMessage(notValidResponse("program_id")).bail(),
        check.query('vulnerability_type_id').optional({nullable: true}).isMongoId().withMessage(notValidResponse("vulnerability_type_id")).bail(),
        check.query('program_name').optional({nullable: true})
            .isString().withMessage(notValidResponse("program_name")).customSanitizer(v => safeString(v)).bail(),
        check.query('report_fields').optional({nullable: true})
            .isString().withMessage(notValidResponse("report_fields")).customSanitizer(v => safeString(v)).bail(),
        check.query('hacker_username').optional({nullable: true}).isString().withMessage(notValidResponse("hacker_username"))
            .customSanitizer(v => safeString(v)).bail(),
        check.query('is_next_generation').optional({nullable: true}).isInt().withMessage(notValidResponse("is_next_generation")).bail()
            .isIn(PROGRAM_BOUNTY_TYPE.VALUES).withMessage(notValidResponse("is_next_generation")).bail()
            .toInt()
    ]
};

const getValidationSchema = () => {
    return [
        check.param('id').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("id")).bail()
            .isMongoId().withMessage(notValidResponse("id")).customSanitizer(v => safeString(v)).bail()
    ]
};

const changeStatusValidationSchema = () => {
    return [
        check.param('id').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("id")).bail()
            .isMongoId().withMessage(notValidResponse("id")).customSanitizer(v => safeString(v)).bail(),
        check.body('status').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("status")).bail()
            .isInt({gt: -1}).withMessage(notValidResponse("status")).bail()
            .isIn(REPORT_STATUS.VALUES).withMessage(notValidResponse("status")).bail().toInt()
    ]
};

const changeSeverityValidationSchema = () => {
    return [
        check.param('id').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("id")).bail()
            .isMongoId().withMessage(notValidResponse("id")).customSanitizer(v => safeString(v)).bail(),
        check.body('severity').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("severity")).bail()
            .isInt({gt: -1}).withMessage(notValidResponse("severity")).bail()
            .isIn(REPORT_SEVERITY.VALUES).withMessage(notValidResponse("severity")).bail().toInt(),
        check.body('score').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("score")).bail()
    ]
};

const payPriceValidationSchema = () => {
    return [
        check.param('id').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("id")).bail()
            .isMongoId().withMessage(notValidResponse("id")).customSanitizer(v => safeString(v)).bail(),
        check.body('pay_price').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("pay_price")).bail()
            .isInt({gt: 0}).withMessage(notValidResponse("pay_price")).bail().toInt()
    ]
};

const setReferenceIdValidationSchema = () => {
    return [
        check.param('id').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("id")).bail()
            .isMongoId().withMessage(notValidResponse("id")).customSanitizer(v => safeString(v)).bail(),
        check.body('reference_id').optional({checkFalsy: true})
            .isMongoId().withMessage(notValidResponse("reference_id")).customSanitizer(v => safeString(v)).bail()
    ]
};

const updateValidationSchema = () => {
    return [
        check.param('id').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("id")).bail()
            .isMongoId().withMessage(notValidResponse("id")).customSanitizer(v => safeString(v)).bail(),
        check.body('title').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("title")).bail()
            .isString().withMessage(notValidResponse("title")).bail().customSanitizer(v => safeString(v)),
        check.body('proof_url').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("proof_url")).bail()
            .isString().withMessage(notValidResponse("proof_url")).bail().customSanitizer(v => safeString(v)),
        check.body('proof_concept').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("proof_concept")).bail()
            .isString().withMessage(notValidResponse("proof_concept")).bail().customSanitizer(v => safeString(v)),
        check.body('proof_recommendation').optional({nullable: true})
            .isString().withMessage(notValidResponse("proof_recommendation")).bail().customSanitizer(v => safeString(v)),
        check.body('security_impact').optional({nullable: true})
            .isString().withMessage(notValidResponse("security_impact")).bail().customSanitizer(v => safeString(v)),
        check.body('vulnerability_type').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("vulnerability_type")).bail()
            .isMongoId().withMessage(notValidResponse("vulnerability_type")).bail().customSanitizer(v => safeString(v))
    ]
};

const changeActivityValidationSchema = () => {
    return [
        check.param('id').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("id")).bail()
            .isMongoId().withMessage(notValidResponse("id")).customSanitizer(v => safeString(v)).bail(),
        check.body('is_close').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("is_close")).bail()
            .isInt({gt: -1}).withMessage(notValidResponse("is_close")).bail()
            .isIn(REPORT_ACTIVITY.VALUES).withMessage(notValidResponse("is_close")).bail().toInt()
    ]
};

const addCommentValidationSchema = () => {
    return [
        check.param('id').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("id")).bail()
            .isMongoId().withMessage(notValidResponse("id")).customSanitizer(v => safeString(v)).bail(),
    ]
};

const getCommentsValidationSchema = () => {
    return [
        check.query('page').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("page")).bail()
            .isInt({gt: 0}).withMessage(notValidResponse("page")).bail()
            .toInt(),
        check.query('limit').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("limit")).bail()
            .isInt({gt: 0}).withMessage(notValidResponse("limit")).bail()
            .isIn(STATIC_VARIABLES.PAGE_SIZE_VALUES).withMessage(notValidResponse("limit")).bail()
            .toInt(),
        check.param('id').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("id")).bail()
            .isMongoId().withMessage(notValidResponse("id")).customSanitizer(v => safeString(v)).bail()
    ]
};

const deleteCommentValidationSchema = () => {
    return [
        check.param('id').notEmpty({ignore_whitespace: true})
            .withMessage(requiredResponse("id")).bail()
            .isMongoId().withMessage(notValidResponse("id"))
            .customSanitizer(v => safeString(v)).bail(),
        check.param('comment_id').notEmpty({ignore_whitespace: true})
            .withMessage(requiredResponse("comment_id")).bail()
            .isMongoId().withMessage(notValidResponse("comment_id"))
            .customSanitizer(v => safeString(v)).bail()
    ]
};

const deleteValidationSchema = () => {
    return [
        check.param('id').notEmpty({ignore_whitespace: true})
            .withMessage(requiredResponse("id")).bail()
            .isMongoId().withMessage(notValidResponse("id"))
            .customSanitizer(v => safeString(v)).bail()
    ]
};

module.exports = {
    gets: getsValidationSchema,
    get: getValidationSchema,
    update: updateValidationSchema,
    delete: deleteValidationSchema,
    getComments: getCommentsValidationSchema,
    changeStatus: changeStatusValidationSchema,
    changeSeverity: changeSeverityValidationSchema,
    payPrice: payPriceValidationSchema,
    setReferenceId: setReferenceIdValidationSchema,
    deleteComment: deleteCommentValidationSchema,
    addComment: addCommentValidationSchema,
    changeActivity: changeActivityValidationSchema
};