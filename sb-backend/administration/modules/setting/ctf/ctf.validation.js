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

const createChallengeValidationSchema = () => {
    return [
        check.param('id').notEmpty({ignore_whitespace: true})
            .withMessage(requiredResponse("id")).bail()
            .isMongoId().withMessage(notValidResponse("id"))
            .customSanitizer(v => safeString(v)).bail(),
        check.body('name').notEmpty({ignore_whitespace: true})
            .withMessage(requiredResponse("name")).bail()
            .isString().withMessage(notValidResponse("name")).bail()
            .trim().customSanitizer(v => safeString(v)),
        check.body('category_id').notEmpty({ignore_whitespace: true})
            .withMessage(requiredResponse("category_id")).bail()
            .isInt().withMessage(notValidResponse("category_id")).bail()
            .toInt(),
        check.body('level_id').notEmpty({ignore_whitespace: true})
            .withMessage(requiredResponse("level_id")).bail()
            .isInt().withMessage(notValidResponse("level_id")).bail()
            .toInt(),
        check.body('point').notEmpty({ignore_whitespace: true})
            .withMessage(requiredResponse("point")).bail()
            .isInt().withMessage(notValidResponse("point")).bail()
            .toInt(),
        check.body('coin').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("status")).bail()
            .isInt().withMessage(notValidResponse("coin")).bail()
            .toInt(),
        check.body('flag').notEmpty({ignore_whitespace: true})
            .withMessage(requiredResponse("flag")).bail()
            .isString().withMessage(notValidResponse("flag")).bail()
            .customSanitizer(v => safeString(v)),
        check.body('description').optional({nullable: true})
            .isString().withMessage(notValidResponse("description")).bail()
            .customSanitizer(v => safeString(v)),
        check.body('link').notEmpty({ignore_whitespace: true})
            .withMessage(requiredResponse("link")).bail()
            .isString().withMessage(notValidResponse("link")).bail()
            .customSanitizer(v => safeString(v))
    ]
};

const updateChallengeValidationSchema = () => {
    return [
        check.param('challenge_id').notEmpty({ignore_whitespace: true})
            .withMessage(requiredResponse("challenge_id")).bail()
            .isMongoId().withMessage(notValidResponse("challenge_id"))
            .customSanitizer(v => safeString(v)).bail(),
        check.param('id').notEmpty({ignore_whitespace: true})
            .withMessage(requiredResponse("id")).bail()
            .isMongoId().withMessage(notValidResponse("id"))
            .customSanitizer(v => safeString(v)).bail(),
        check.body('name').notEmpty({ignore_whitespace: true})
            .withMessage(requiredResponse("name")).bail()
            .isString().withMessage(notValidResponse("name")).bail()
            .trim().customSanitizer(v => safeString(v)),
        check.body('category_id').notEmpty({ignore_whitespace: true})
            .withMessage(requiredResponse("category_id")).bail()
            .isInt().withMessage(notValidResponse("category_id")).bail()
            .toInt(),
        check.body('level_id').notEmpty({ignore_whitespace: true})
            .withMessage(requiredResponse("level_id")).bail()
            .isInt().withMessage(notValidResponse("level_id")).bail()
            .toInt(),
        check.body('point').notEmpty({ignore_whitespace: true})
            .withMessage(requiredResponse("point")).bail()
            .isInt().withMessage(notValidResponse("point")).bail()
            .toInt(),
        check.body('coin').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("status")).bail()
            .isInt().withMessage(notValidResponse("coin")).bail()
            .toInt(),
        check.body('flag').notEmpty({ignore_whitespace: true})
            .withMessage(requiredResponse("flag")).bail()
            .isString().withMessage(notValidResponse("flag")).bail()
            .customSanitizer(v => safeString(v)),
        check.body('description').optional({nullable: true})
            .isString().withMessage(notValidResponse("description")).bail()
            .customSanitizer(v => safeString(v)),
        check.body('status').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("status")).bail()
            .isBoolean().withMessage(notValidResponse("status")).bail()
            .isIn([true, false]).withMessage(notValidResponse("status")).bail()
            .toBoolean(),
        check.body('link').notEmpty({ignore_whitespace: true})
            .withMessage(requiredResponse("link")).bail()
            .isString().withMessage(notValidResponse("link")).bail()
            .customSanitizer(v => safeString(v))
    ]
};

const createValidationSchema = () => {
    return [
        check.body('title').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("title")).bail()
            .isString().withMessage(notValidResponse("title")).bail().customSanitizer(v => safeString(v)),
        check.body('start_date_time').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("start_date_time")).bail()
            .isString().withMessage(notValidResponse("start_date_time")).bail().customSanitizer(v => safeString(v)),
        check.body('end_date_time').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("end_date_time")).bail()
            .isString().withMessage(notValidResponse("end_date_time")).bail().customSanitizer(v => safeString(v)),
        check.body('initial_point').optional({nullable: true})
            .isInt({gt: 0}).withMessage(notValidResponse("initial_point")).bail()
            .customSanitizer(v => safeString(v)).toInt(),
        check.body('minimum_point').optional({nullable: true})
            .isInt({gt: 0}).withMessage(notValidResponse("minimum_point")).bail()
            .customSanitizer(v => safeString(v)).toInt(),
        check.body('decay').optional({nullable: true})
            .isInt({gt: 0}).withMessage(notValidResponse("decay")).bail()
            .customSanitizer(v => safeString(v)).toInt(),
        check.body('coins').optional({nullable: true})
            .isInt({gt: 0}).withMessage(notValidResponse("coins")).bail()
            .customSanitizer(v => safeString(v)).toInt(),
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
        check.body('start_date_time').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("start_date_time")).bail()
            .isString().withMessage(notValidResponse("start_date_time")).bail().customSanitizer(v => safeString(v)),
        check.body('end_date_time').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("end_date_time")).bail()
            .isString().withMessage(notValidResponse("end_date_time")).bail().customSanitizer(v => safeString(v)),
        check.body('initial_point').optional({nullable: true})
            .isInt({gt: 0}).withMessage(notValidResponse("initial_point")).bail()
            .customSanitizer(v => safeString(v)).toInt(),
        check.body('minimum_point').optional({nullable: true})
            .isInt({gt: 0}).withMessage(notValidResponse("minimum_point")).bail()
            .customSanitizer(v => safeString(v)).toInt(),
        check.body('decay').optional({nullable: true})
            .isInt({gt: 0}).withMessage(notValidResponse("decay")).bail()
            .customSanitizer(v => safeString(v)).toInt(),
        check.body('coins').optional({nullable: true})
            .isInt({gt: 0}).withMessage(notValidResponse("coins")).bail()
            .customSanitizer(v => safeString(v)).toInt(),
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

const deleteChallengeValidationSchema = () => {
    return [
        check.param('id').notEmpty({ignore_whitespace: true})
            .withMessage(requiredResponse("id")).bail()
            .isMongoId().withMessage(notValidResponse("id"))
            .customSanitizer(v => safeString(v)).bail(),
        check.param('challenge_id').notEmpty({ignore_whitespace: true})
            .withMessage(requiredResponse("challenge_id")).bail()
            .isMongoId().withMessage(notValidResponse("challenge_id"))
            .customSanitizer(v => safeString(v)).bail()
    ]
};

const getChallengesValidationSchema = () => {
    return [
        check.param('id').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("id")).bail()
            .isMongoId().withMessage(notValidResponse("id")).customSanitizer(v => safeString(v)).bail()
    ]
};

const setChallengeCoinsValidationSchema = () => {
    return [
        check.param('id').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("id")).bail()
            .isMongoId().withMessage(notValidResponse("id")).customSanitizer(v => safeString(v)).bail()
    ]
};

const getStatisticValidationSchema = () => {
    return [
        check.query('token').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("token")).bail(),
        check.param('id').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("id")).bail()
            .isMongoId().withMessage(notValidResponse("id")).customSanitizer(v => safeString(v)).bail()
    ]
};

module.exports = {
    gets: getsValidationSchema,
    getChallenges: getChallengesValidationSchema,
    setChallengeCoins: setChallengeCoinsValidationSchema,
    getStatistic: getStatisticValidationSchema,
    update: updateValidationSchema,
    delete: deleteValidationSchema,
    createChallenge: createChallengeValidationSchema,
    updateChallenge: updateChallengeValidationSchema,
    deleteChallenge: deleteChallengeValidationSchema,
    create: createValidationSchema
};