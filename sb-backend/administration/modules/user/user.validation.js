const check = require('express-validator');
const {
    setPublicResponse,
    maxLengthMsg,
    notValidResponse,
    requiredResponse,
    notEqualResponse
} = require('../../../libs/message.helper');
const {STATIC_VARIABLES, ADMIN_ROLES} = require('../../../libs/enum.helper');
const {safeString, isObjectID} = require('../../../libs/methode.helper');

const loginValidationSchema = () => {
    return [
        check.body('email').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("email")).bail()
            .isString().withMessage(notValidResponse("email")).bail()
            .trim().toLowerCase().customSanitizer(v => safeString(v))
            .isEmail().withMessage(notValidResponse("email")).bail()
            .isLength({max: STATIC_VARIABLES.MAX_LENGTH.EMAIL}).withMessage(setPublicResponse(maxLengthMsg("email", STATIC_VARIABLES.MAX_LENGTH.EMAIL, STATIC_VARIABLES.ERROR_CODE.MAX_LENGTH))),
        check.body('password').isString().withMessage(notValidResponse("password")).bail().trim()
            .notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("password")).bail()
    ];
};

const refreshTokenValidationSchema = () => {
    return [
        check.header('x-token').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("x-token")),
        check.body('x-refresh-token').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("x-refresh-token"))
    ];
};

const createNotificationsValidationSchema = () => {
    return [
        check.body('title').notEmpty({ignore_whitespace: true})
            .withMessage(requiredResponse("title")).bail()
            .isString().withMessage(notValidResponse("title")).bail()
            .trim().customSanitizer(v => safeString(v)),
        check.body('message').notEmpty({ignore_whitespace: true})
            .withMessage(requiredResponse("message")).bail()
            .isString().withMessage(notValidResponse("message")).bail()
            .trim().customSanitizer(v => safeString(v)),
        check.body('is_company').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("is_company")).bail()
            .isBoolean().withMessage(notValidResponse("is_company")).bail()
            .isIn([true, false]).withMessage(notValidResponse("is_company")).bail()
            .toBoolean(),
          check.body('type').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("type")).bail()
            .isString().withMessage(notValidResponse("type")).bail()
            .isIn(['info', 'success', 'danger','warning']).withMessage(notValidResponse("type")).bail(),
        check.body('user_ids').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("user_ids")).bail()
            .custom((value) => {
                const user_ids = JSON.parse(value);
                if (!user_ids) {
                    return false;
                }
                if (user_ids.length > 0) {
                    for (let i = 0; i < user_ids.length; i++) {
                        if (!isObjectID(user_ids[i])) {
                            return false;
                        }
                    }
                }
                return true;
            }).withMessage(notValidResponse("user_ids"))
    ];
};

const updateNotificationStatusValidationSchema = () => {
    return [
        check.body('notification_ids').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("notification_ids")).bail()
            .custom((value, {req}) => {
                const notification_ids = JSON.parse(value);
                if (!notification_ids || notification_ids.length === 0) {
                    return false;
                }
                for (let i = 0; i < notification_ids.length; i++) {
                    if (!isObjectID(notification_ids[i])) {
                        return false;
                    }
                }
                return true;
            }).withMessage(notValidResponse("notification_ids"))
    ];
};

const getsValidationSchema = () => {
    return [
        check.query('is_dashboard').optional({nullable: true})
            .isBoolean().withMessage(notValidResponse("is_dashboard")).bail()
            .isIn([true, false]).withMessage(notValidResponse("is_dashboard")).bail()
            .toBoolean(),
        check.query('page').if(check.query('is_dashboard').not().exists({checkFalsy: true}))
            .notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("page")).bail()
            .isInt({gt: 0}).withMessage(notValidResponse("page")).bail()
            .toInt(),
        check.query('limit').if(check.query('is_dashboard').not().exists({checkFalsy: true}))
            .notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("limit")).bail()
            .isInt({gt: 0}).withMessage(notValidResponse("limit")).bail()
            .isIn(STATIC_VARIABLES.PAGE_SIZE_VALUES).withMessage(notValidResponse("limit")).bail()
            .toInt(),
        check.query('email').optional({nullable: true}).isString()
            .withMessage(notValidResponse("email")).bail().toLowerCase().customSanitizer(v => safeString(v))
    ]
};

const getNotificationsValidationSchema = () => {
    return [
        check.query('only_count').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("only_count")).bail()
            .isBoolean().withMessage(notValidResponse("only_count")).bail()
            .isIn([true, false]).withMessage(notValidResponse("only_count")).bail()
            .toBoolean(),
        check.query('is_new').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("is_new")).bail()
            .isBoolean().withMessage(notValidResponse("is_new")).bail()
            .isIn([true, false]).withMessage(notValidResponse("is_new")).bail()
            .toBoolean(),
        check.query('page').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("page")).bail()
            .isInt({gt: 0}).withMessage(notValidResponse("page")).bail()
            .toInt()
    ]
};

const createValidationSchema = () => {
    return [
        check.body('fn').notEmpty({ignore_whitespace: true})
            .withMessage(requiredResponse("first_name")).bail()
            .isString().withMessage(notValidResponse("first_name")).bail()
            .trim().customSanitizer(v => safeString(v)),
        check.body('ln').notEmpty({ignore_whitespace: true})
            .withMessage(requiredResponse("last_name")).bail()
            .isString().withMessage(notValidResponse("last_name")).bail()
            .trim().customSanitizer(v => safeString(v)),
        check.body('alias').notEmpty({ignore_whitespace: true})
            .withMessage(requiredResponse("alias")).bail()
            .isString().withMessage(notValidResponse("alias")).bail()
            .trim().customSanitizer(v => safeString(v)),
        check.body('email').notEmpty({ignore_whitespace: true})
            .withMessage(requiredResponse("email")).bail()
            .isString().withMessage(notValidResponse("email")).bail()
            .isEmail().withMessage(notValidResponse("email")).bail()
            .trim().toLowerCase().customSanitizer(v => safeString(v)),
        check.body('user_level_access').notEmpty({ignore_whitespace: true})
            .withMessage(requiredResponse("user_level_access")).bail()
            .isInt().withMessage(notValidResponse("user_level_access")).bail()
            .isIn(ADMIN_ROLES.VALUES).withMessage(notValidResponse("user_level_access"))
            .toInt(),
        check.body('status').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("status")).bail()
            .isBoolean().withMessage(notValidResponse("status")).bail()
            .isIn([true, false]).withMessage(notValidResponse("status")).bail()
            .toBoolean(),
        check.body('password').notEmpty({ignore_whitespace: true})
            .withMessage(requiredResponse("password")).bail()
            .isString().withMessage(notValidResponse("password")).bail()
            .customSanitizer(v => safeString(v)),
        check.body('confirm_password').notEmpty({ignore_whitespace: true})
            .withMessage(requiredResponse("confirm_password")).bail()
            .isString().withMessage(notValidResponse("confirm_password")).bail()
            .custom((value, {req}) => value === req.body.password)
            .withMessage(notEqualResponse("confirm_password", "password"))
            .customSanitizer(v => safeString(v))
    ]
};

const updateValidationSchema = () => {
    return [
        check.param('id').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("id")).bail()
            .isMongoId().withMessage(notValidResponse("id")).bail().customSanitizer(v => safeString(v)),
        check.body('fn').notEmpty({ignore_whitespace: true})
            .withMessage(requiredResponse("first_name")).bail()
            .isString().withMessage(notValidResponse("first_name")).bail()
            .trim().customSanitizer(v => safeString(v)),
        check.body('ln').notEmpty({ignore_whitespace: true})
            .withMessage(requiredResponse("last_name")).bail()
            .isString().withMessage(notValidResponse("last_name")).bail()
            .trim().customSanitizer(v => safeString(v)),
        check.body('alias').notEmpty({ignore_whitespace: true})
            .withMessage(requiredResponse("alias")).bail()
            .isString().withMessage(notValidResponse("alias")).bail()
            .trim().customSanitizer(v => safeString(v)),
        check.body('email').notEmpty({ignore_whitespace: true})
            .withMessage(requiredResponse("email")).bail()
            .isString().withMessage(notValidResponse("email")).bail()
            .isEmail().withMessage(notValidResponse("email")).bail()
            .trim().toLowerCase().customSanitizer(v => safeString(v)),
        check.body('user_level_access').notEmpty({ignore_whitespace: true})
            .withMessage(requiredResponse("user_level_access")).bail()
            .isInt().withMessage(notValidResponse("user_level_access")).bail()
            .isIn(ADMIN_ROLES.VALUES).withMessage(notValidResponse("user_level_access"))
            .toInt(),
        check.body('status').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("status")).bail()
            .isBoolean().withMessage(notValidResponse("status")).bail()
            .isIn([true, false]).withMessage(notValidResponse("status")).bail()
            .toBoolean(),
        check.body('password').optional({nullable: true})
            .isString().withMessage(notValidResponse("password")).bail()
            .customSanitizer(v => safeString(v)),
        check.body('confirm_password').if(check.body('password').exists({checkFalsy: true}))
            .notEmpty({ignore_whitespace: true})
            .withMessage(requiredResponse("confirm_password")).bail()
            .isString().withMessage(notValidResponse("confirm_password")).bail()
            .custom((value, {req}) => value === req.body.password)
            .withMessage(notEqualResponse("confirm_password", "password"))
            .customSanitizer(v => safeString(v))
    ]
};

const profileValidationSchema = () => {
    return [
        check.body('first_name').notEmpty({ignore_whitespace: true})
            .withMessage(requiredResponse("first_name")).bail()
            .isString().withMessage(notValidResponse("first_name")).bail()
            .trim().customSanitizer(v => safeString(v)),
        check.body('last_name').notEmpty({ignore_whitespace: true})
            .withMessage(requiredResponse("last_name")).bail()
            .isString().withMessage(notValidResponse("last_name")).bail()
            .trim().customSanitizer(v => safeString(v)),
        check.body('alias').notEmpty({ignore_whitespace: true})
            .withMessage(requiredResponse("alias")).bail()
            .isString().withMessage(notValidResponse("alias")).bail()
            .trim().customSanitizer(v => safeString(v)),
        check.body('password').optional({checkFalsy: true})
            .isString().withMessage(notValidResponse("password")).bail()
            .customSanitizer(v => safeString(v)),
        check.body('confirm_password').if(check.body('password').exists({checkFalsy: true}))
            .notEmpty({ignore_whitespace: true})
            .withMessage(requiredResponse("confirm_password")).bail()
            .isString().withMessage(notValidResponse("confirm_password")).bail()
            .custom((value, {req}) => value === req.body.password)
            .withMessage(notEqualResponse("confirm_password", "password"))
            .customSanitizer(v => safeString(v))
    ]
};

const deleteValidationSchema = () => {
    return [
        check.param('id').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("id")).bail()
            .isMongoId().withMessage(notValidResponse("id")).bail().customSanitizer(v => safeString(v))
    ]
};

const selectListValidationSchema = () => {
    return [
        check.query('program_id').optional({nullable: true})
            .isMongoId().withMessage(notValidResponse("program_id"))
            .customSanitizer(v => safeString(v)).bail()
    ]
};

module.exports = {
    login: loginValidationSchema,
    create: createValidationSchema,
    profile: profileValidationSchema,
    createNotifications: createNotificationsValidationSchema,
    update: updateValidationSchema,
    delete: deleteValidationSchema,
    selectList: selectListValidationSchema,
    gets: getsValidationSchema,
    getNotifications: getNotificationsValidationSchema,
    updateNotificationStatus: updateNotificationStatusValidationSchema,
    refreshToken: refreshTokenValidationSchema
};