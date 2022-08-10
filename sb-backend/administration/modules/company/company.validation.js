const check = require('express-validator');
const {requiredResponse, notValidResponse, notEqualResponse} = require('../../../libs/message.helper');
const {safeString} = require('../../../libs/methode.helper');
const {STATIC_VARIABLES, ROLES} = require('../../../libs/enum.helper');

const getsValidationSchema = () => {
    return [
        check.query('page').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("page")).bail()
            .isInt({gt: 0}).withMessage(notValidResponse("page")).bail()
            .toInt(),
        check.query('limit').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("limit")).bail()
            .isInt({gt: 0}).withMessage(notValidResponse("limit")).bail()
            .isIn(STATIC_VARIABLES.PAGE_SIZE_VALUES).withMessage(notValidResponse("limit")).bail()
            .toInt(),
        check.query('is_verify').optional({nullable: true}).isBoolean().withMessage(notValidResponse("is_verify")).bail()
            .isIn([true, false]).withMessage(notValidResponse("is_verify")).bail()
            .toBoolean(),
        check.query('is_online').optional({nullable: true}).isBoolean().withMessage(notValidResponse("is_online")).bail()
            .isIn([true, false]).withMessage(notValidResponse("is_online")).bail()
            .toBoolean(),
        check.query('admin_verify').optional({nullable: true}).isBoolean().withMessage(notValidResponse("admin_verify")).bail()
            .isIn([true, false]).withMessage(notValidResponse("admin_verify")).bail()
            .toBoolean(),
        check.query('select_term').if(check.query('select_term').exists())
            .notEmpty({ignore_whitespace: true})
            .withMessage(requiredResponse("select_term")).bail()
            .isString().withMessage(notValidResponse("select_term")).bail()
            .trim().customSanitizer(v => safeString(v)),
        check.query('email').optional({nullable: true}).isString()
            .withMessage(notValidResponse("email")).bail()
            .trim().customSanitizer(v => safeString(v))
    ];
};

const getValidationSchema = () => {
    return [
        check.param('id').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("id")).bail()
            .isMongoId().withMessage(notValidResponse("id")).customSanitizer(v => safeString(v)).bail(),
        check.param('report_id').optional({nullable: true})
            .isMongoId().withMessage(notValidResponse("report_id")).customSanitizer(v => safeString(v)).bail()
    ]
};

const disabled2FAValidationSchema = () => {
    return [
        check.param('id').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("id")).bail()
            .isMongoId().withMessage(notValidResponse("id")).customSanitizer(v => safeString(v)).bail()
    ]
};

const uploadAvatarValidationSchema = () => {
    return [
        check.param('id').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("id")).bail()
            .isMongoId().withMessage(notValidResponse("id")).customSanitizer(v => safeString(v)).bail()
    ]
};

const deleteAvatarValidationSchema = () => {
    return [
        check.param('id').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("id")).bail()
            .isMongoId().withMessage(notValidResponse("id")).customSanitizer(v => safeString(v)).bail()
    ]
};

const getMembersValidationSchema = () => {
    return [
        check.param('id').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("id")).bail()
            .isMongoId().withMessage(notValidResponse("id")).customSanitizer(v => safeString(v)).bail()
    ]
};

const changeStatusValidationSchema = () => {
    return [
        check.param('id').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("id")).bail()
            .isMongoId().withMessage(notValidResponse("id")).bail().customSanitizer(v => safeString(v)),
        check.body('status').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("status")).bail()
            .isBoolean().withMessage(notValidResponse("status")).bail()
            .isIn([true, false]).withMessage(notValidResponse("status")).bail()
            .toBoolean()
    ]
};

const changeVerifyValidationSchema = () => {
    return [
        check.param('id').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("id")).bail()
            .isMongoId().withMessage(notValidResponse("id")).customSanitizer(v => safeString(v)).bail(),
        check.body('is_verify').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("is_verify")).bail()
            .isBoolean().withMessage(notValidResponse("is_verify")).bail()
            .isIn([true, false]).withMessage(notValidResponse("is_verify")).bail()
            .toBoolean()
    ]
};

const changeIsFullyManageValidationSchema = () => {
    return [
        check.param('id').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("id")).bail()
            .isMongoId().withMessage(notValidResponse("id")).customSanitizer(v => safeString(v)).bail(),
        check.body('is_fully_manage').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("is_fully_manage")).bail()
            .isBoolean().withMessage(notValidResponse("is_fully_manage")).bail()
            .isIn([true, false]).withMessage(notValidResponse("is_fully_manage")).bail()
            .toBoolean()
    ]
};

const changeVerifyByAdminValidationSchema = () => {
    return [
        check.param('id').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("id")).bail()
            .isMongoId().withMessage(notValidResponse("id")).customSanitizer(v => safeString(v)).bail(),
        check.body('admin_verify').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("admin_verify")).bail()
            .isBoolean().withMessage(notValidResponse("admin_verify")).bail()
            .isIn([true, false]).withMessage(notValidResponse("admin_verify")).bail()
            .toBoolean()
    ]
};

const changeActivityValidationSchema = () => {
    return [
        check.param('id').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("id")).bail()
            .isMongoId().withMessage(notValidResponse("id")).customSanitizer(v => safeString(v)).bail(),
        check.body('account_is_disable').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("account_is_disable")).bail()
            .isBoolean().withMessage(notValidResponse("account_is_disable")).bail()
            .isIn([true, false]).withMessage(notValidResponse("account_is_disable")).bail()
            .toBoolean()
    ]
};

const changeActivityMemberValidationSchema = () => {
    return [
        check.param('id').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("id")).bail()
            .isMongoId().withMessage(notValidResponse("id")).customSanitizer(v => safeString(v)).bail(),
        check.param('member_id').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("member_id")).bail()
            .isMongoId().withMessage(notValidResponse("id")).customSanitizer(v => safeString(v)).bail(),
        check.body('account_is_disable').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("account_is_disable")).bail()
            .isBoolean().withMessage(notValidResponse("account_is_disable")).bail()
            .isIn([true, false]).withMessage(notValidResponse("account_is_disable")).bail()
            .toBoolean()
    ]
};

const getDashboardValidationSchema = () => {
    return [
        check.param('id').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("id")).bail()
            .isMongoId().withMessage(notValidResponse("id")).customSanitizer(v => safeString(v)).bail(),
        check.query('page').optional({nullable: true})
            .isInt({gt: 0}).withMessage(notValidResponse("page")).bail()
            .toInt(),
        check.query('approved_reports_count').optional({nullable: true})
            .isBoolean().withMessage(notValidResponse("approved_reports_count")).bail()
            .isIn([true, false]).withMessage(notValidResponse("approved_reports_count")).bail()
            .toBoolean(),
        check.query('approved_reports_list').optional({nullable: true})
            .isBoolean().withMessage(notValidResponse("approved_reports_list")).bail()
            .isIn([true, false]).withMessage(notValidResponse("approved_reports_list")).bail()
            .toBoolean()
    ]
};

const getChartValidationSchema = () => {
    return [
        check.param('id').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("id")).bail()
            .isMongoId().withMessage(notValidResponse("id")).customSanitizer(v => safeString(v)).bail(),
        check.query('programs').optional({nullable: true})
            .isBoolean().withMessage(notValidResponse("programs")).bail()
            .isIn([true, false]).withMessage(notValidResponse("programs")).bail()
            .toBoolean(),
        check.query('reports_status').optional({nullable: true})
            .isBoolean().withMessage(notValidResponse("reports_status")).bail()
            .isIn([true, false]).withMessage(notValidResponse("reports_status")).bail()
            .toBoolean(),
        check.query('reports_severity').optional({nullable: true})
            .isBoolean().withMessage(notValidResponse("reports_severity")).bail()
            .isIn([true, false]).withMessage(notValidResponse("reports_severity")).bail()
            .toBoolean()
    ]
};

const getPaymentsValidationSchema = () => {
    return [
        check.param('id').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("id")).bail()
            .isMongoId().withMessage(notValidResponse("id")).customSanitizer(v => safeString(v)).bail(),
        check.query('transactions_history').optional({nullable: true})
            .isBoolean().withMessage(notValidResponse("transactions_history")).bail()
            .isIn([true, false]).withMessage(notValidResponse("transactions_history")).bail()
            .toBoolean(),
        check.query('page').optional({nullable: true})
            .isInt({gt: 0}).withMessage(notValidResponse("page")).bail()
            .toInt(),
        check.query('limit').optional({nullable: true})
            .isInt().withMessage(notValidResponse("limit")).bail()
            .isIn([10, 25, 50, 100]).withMessage(notValidResponse("limit")).bail()
            .toInt()
    ]
};

const getProgramsValidationSchema = () => {
    return [
        check.param('id').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("id")).bail()
            .isMongoId().withMessage(notValidResponse("id")).customSanitizer(v => safeString(v)).bail(),
        check.query('reports_count').optional({nullable: true})
            .isBoolean().withMessage(notValidResponse("reports_count")).bail()
            .isIn([true, false]).withMessage(notValidResponse("reports_count")).bail()
            .toBoolean()
    ]
};

const changePasswordValidationSchema = () => {
    return [
        check.param('id').notEmpty({ignore_whitespace: true})
            .withMessage(requiredResponse("id")).bail()
            .isMongoId().withMessage(notValidResponse("id"))
            .customSanitizer(v => safeString(v)).bail(),
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

const addMemberValidationSchema = () => {
    return [
        check.param('id').notEmpty({ignore_whitespace: true})
            .withMessage(requiredResponse("id")).bail()
            .isMongoId().withMessage(notValidResponse("id"))
            .customSanitizer(v => safeString(v)).bail(),
        check.body('fn').notEmpty({ignore_whitespace: true})
            .withMessage(requiredResponse("first_name")).bail()
            .isString().withMessage(notValidResponse("first_name")).bail()
            .trim().customSanitizer(v => safeString(v)),
        check.body('ln').notEmpty({ignore_whitespace: true})
            .withMessage(requiredResponse("last_name")).bail()
            .isString().withMessage(notValidResponse("last_name")).bail()
            .trim().customSanitizer(v => safeString(v)),
        check.body('email').notEmpty({ignore_whitespace: true})
            .withMessage(requiredResponse("email")).bail()
            .isString().withMessage(notValidResponse("email")).bail()
            .isEmail().withMessage(notValidResponse("email")).bail()
            .trim().toLowerCase().customSanitizer(v => safeString(v)),
        check.body('user_level_access').notEmpty({ignore_whitespace: true})
            .withMessage(requiredResponse("user_level_access")).bail()
            .isInt().withMessage(notValidResponse("user_level_access")).bail()
            .isIn(ROLES.VALUES).withMessage(notValidResponse("user_level_access"))
            .toInt(),
        check.body('status').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("status")).bail()
            .isBoolean().withMessage(notValidResponse("status")).bail()
            .isIn([true, false]).withMessage(notValidResponse("status")).bail()
            .toBoolean(),
        check.body('comment').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("comment")).bail()
            .isBoolean().withMessage(notValidResponse("comment")).bail()
            .isIn([true, false]).withMessage(notValidResponse("comment")).bail()
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
            .customSanitizer(v => safeString(v)),
        // check.body('access_program_list').notEmpty({ignore_whitespace: true})
        //     .withMessage(requiredResponse("access_program_list")).bail()
        //     .custom((value) => {
        //         const access_program_list = JSON.parse(value);
        //         if (!isArray(access_program_list) || access_program_list.length === 0) {
        //             return false;
        //         }
        //         return true;
        //     }).withMessage(notValidResponse("access_program_list")).bail(),
    ]
};

const updateMemberValidationSchema = () => {
    return [
        check.param('id').notEmpty({ignore_whitespace: true})
            .withMessage(requiredResponse("id")).bail()
            .isMongoId().withMessage(notValidResponse("id"))
            .customSanitizer(v => safeString(v)).bail(),
        check.param('member_id').notEmpty({ignore_whitespace: true})
            .withMessage(requiredResponse("member_id")).bail()
            .isMongoId().withMessage(notValidResponse("member_id"))
            .customSanitizer(v => safeString(v)).bail(),
        check.body('fn').notEmpty({ignore_whitespace: true})
            .withMessage(requiredResponse("first_name")).bail()
            .isString().withMessage(notValidResponse("first_name")).bail()
            .trim().customSanitizer(v => safeString(v)),
        check.body('ln').notEmpty({ignore_whitespace: true})
            .withMessage(requiredResponse("last_name")).bail()
            .isString().withMessage(notValidResponse("last_name")).bail()
            .trim().customSanitizer(v => safeString(v)),
        check.body('email').notEmpty({ignore_whitespace: true})
            .withMessage(requiredResponse("email")).bail()
            .isString().withMessage(notValidResponse("email")).bail()
            .isEmail().withMessage(notValidResponse("email")).bail()
            .trim().toLowerCase().customSanitizer(v => safeString(v)),
        check.body('user_level_access').notEmpty({ignore_whitespace: true})
            .withMessage(requiredResponse("user_level_access")).bail()
            .isInt().withMessage(notValidResponse("user_level_access")).bail()
            .isIn(ROLES.VALUES).withMessage(notValidResponse("user_level_access"))
            .toInt(),
        check.body('status').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("status")).bail()
            .isBoolean().withMessage(notValidResponse("status")).bail()
            .isIn([true, false]).withMessage(notValidResponse("status")).bail()
            .toBoolean(),
        check.body('comment').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("comment")).bail()
            .isBoolean().withMessage(notValidResponse("comment")).bail()
            .isIn([true, false]).withMessage(notValidResponse("comment")).bail()
            .toBoolean(),
        check.body('password').optional({nullable: true})
            .isString().withMessage(notValidResponse("password")).bail()
            .customSanitizer(v => safeString(v)),
        check.body('confirm_password').optional({nullable: true})
            .isString().withMessage(notValidResponse("confirm_password")).bail()
            .custom((value, {req}) => value === req.body.password)
            .withMessage(notEqualResponse("confirm_password", "password"))
            .customSanitizer(v => safeString(v)),
        // check.body('access_program_list').notEmpty({ignore_whitespace: true})
        //     .withMessage(requiredResponse("access_program_list")).bail()
        //     .custom((value) => {
        //         const access_program_list = JSON.parse(value);
        //         if (!isArray(access_program_list) || access_program_list.length === 0) {
        //             return false;
        //         }
        //         return true;
        //     }).withMessage(notValidResponse("access_program_list")).bail(),

    ]
};

const deleteMemberValidationSchema = () => {
    return [
        check.param('id').notEmpty({ignore_whitespace: true})
            .withMessage(requiredResponse("id")).bail()
            .isMongoId().withMessage(notValidResponse("id"))
            .customSanitizer(v => safeString(v)).bail(),
        check.param('member_id').notEmpty({ignore_whitespace: true})
            .withMessage(requiredResponse("member_id")).bail()
            .isMongoId().withMessage(notValidResponse("member_id"))
            .customSanitizer(v => safeString(v)).bail()
    ]
};

const updateValidationSchema = () => {
    return [
        check.param('id').notEmpty({ignore_whitespace: true})
            .withMessage(requiredResponse("id")).bail()
            .isMongoId().withMessage(notValidResponse("id")).bail(),
        check.body('tab').notEmpty({ignore_whitespace: true})
            .withMessage(requiredResponse("tab")).bail()
            .isInt().withMessage(notValidResponse("tab")).bail()
            .isIn([0, 1, 2]).withMessage(notValidResponse("tab"))
            .toInt(),
        check.body('fn').if(check.body('tab').equals("0"))
            .notEmpty({ignore_whitespace: true})
            .withMessage(requiredResponse("first_name")).bail()
            .isString().withMessage(notValidResponse("first_name")).bail()
            .trim().customSanitizer(v => safeString(v)),
        check.body('ln').if(check.body('tab').equals("0"))
            .notEmpty({ignore_whitespace: true})
            .withMessage(requiredResponse("last_name")).bail()
            .isString().withMessage(notValidResponse("last_name")).bail()
            .trim().customSanitizer(v => safeString(v)),
        check.body('organization_name').if(check.body('tab').equals("0"))
            .optional({nullable: true})
            .isString().withMessage(notValidResponse("organization_name")).bail()
            .trim().customSanitizer(v => safeString(v)),
        check.body('display_name').if(check.body('tab').equals("0"))
            .optional({nullable: true})
            .isString().withMessage(notValidResponse("display_name")).bail()
            .trim().customSanitizer(v => safeString(v)),
        check.body('role').if(check.body('tab').equals("0"))
            .optional({nullable: true})
            .isString().withMessage(notValidResponse("role")).bail()
            .trim().customSanitizer(v => safeString(v)),
        check.body('profile_visibility').if(check.body('tab').equals("1"))
            .notEmpty({ignore_whitespace: true})
            .withMessage(requiredResponse("profile_visibility")).bail()
            .isBoolean().withMessage(notValidResponse("profile_visibility")).bail()
            .isIn([true, false]).withMessage(notValidResponse("profile_visibility"))
            .bail(),
        check.body('short_introduction').if(check.body('tab').equals("1"))
            .optional({nullable: true})
            .isString().withMessage(notValidResponse("short_introduction")).bail()
            .trim().customSanitizer(v => safeString(v)),
        check.body('about').if(check.body('tab').equals("1"))
            .optional({nullable: true})
            .isString().withMessage(notValidResponse("about")).bail()
            .trim().customSanitizer(v => safeString(v)),
        check.body('github_url').if(check.body('tab').equals("1"))
            .optional({nullable: true})
            .isString().withMessage(notValidResponse("github_url")).bail()
            .trim().customSanitizer(v => safeString(v)),
        check.body('linkedin_url').if(check.body('tab').equals("1"))
            .optional({nullable: true})
            .isString().withMessage(notValidResponse("linkedin_url")).bail()
            .trim().customSanitizer(v => safeString(v)),
        check.body('twitter_url').if(check.body('tab').equals("1"))
            .optional({nullable: true})
            .isString().withMessage(notValidResponse("twitter_url")).bail()
            .trim().customSanitizer(v => safeString(v)),
        check.body('website_url').if(check.body('tab').equals("1"))
            .optional({nullable: true})
            .isString().withMessage(notValidResponse("website_url")).bail()
            .trim().customSanitizer(v => safeString(v)),
        check.body('company_country_id').if(check.body('tab').equals("1"))
            .optional({nullable: true})
            .isMongoId().withMessage(notValidResponse("company_country_id")).bail(),
        check.body('city').if(check.body('tab').equals("1"))
            .optional({nullable: true})
            .isString().withMessage(notValidResponse("city")).bail()
            .trim().customSanitizer(v => safeString(v)),
        check.body('region').if(check.body('tab').equals("1"))
            .optional({nullable: true})
            .isString().withMessage(notValidResponse("region")).bail()
            .trim().customSanitizer(v => safeString(v)),
        check.body('postal_code').if(check.body('tab').equals("1"))
            .optional({nullable: true})
            .isString().withMessage(notValidResponse("postal_code")).bail()
            .trim().customSanitizer(v => safeString(v)),
        check.body('address1').if(check.body('tab').equals("1"))
            .optional({nullable: true})
            .isString().withMessage(notValidResponse("address1")).bail()
            .trim().customSanitizer(v => safeString(v)),
        check.body('address2').if(check.body('tab').equals("1"))
            .optional({nullable: true})
            .isString().withMessage(notValidResponse("address2")).bail()
            .customSanitizer(v => safeString(v)),
        check.body('phone').if(check.body('tab').equals("1"))
            .optional({nullable: true})
            .isString().withMessage(notValidResponse("phone")).bail()
            .customSanitizer(v => safeString(v)),
        check.body('invoice_address_reference').if(check.body('tab').equals("2"))
            .optional({nullable: true})
            .isString().withMessage(notValidResponse("invoice_address_reference")).bail()
            .trim().customSanitizer(v => safeString(v)),
        check.body('invoice_address_email').if(check.body('tab').equals("2"))
            .optional({nullable: true})
            .isString().withMessage(notValidResponse("invoice_address_email")).bail()
            .trim().customSanitizer(v => safeString(v)),
        check.body('invoice_address_address1').if(check.body('tab').equals("2"))
            .optional({nullable: true})
            .isString().withMessage(notValidResponse("invoice_address_address1")).bail()
            .trim().customSanitizer(v => safeString(v)),
        check.body('invoice_address_address2').if(check.body('tab').equals("2"))
            .optional({nullable: true})
            .isString().withMessage(notValidResponse("invoice_address_address2")).bail()
            .trim().customSanitizer(v => safeString(v)),
        check.body('invoice_address_zip_code').if(check.body('tab').equals("2"))
            .optional({nullable: true})
            .isString().withMessage(notValidResponse("invoice_address_zip_code")).bail()
            .trim().customSanitizer(v => safeString(v)),
        check.body('invoice_address_city').if(check.body('tab').equals("2"))
            .optional({nullable: true})
            .isString().withMessage(notValidResponse("invoice_address_city")).bail()
            .trim().customSanitizer(v => safeString(v)),
        check.body('credit_card_number').if(check.body('tab').equals("2"))
            .optional({nullable: true})
            .isString().withMessage(notValidResponse("credit_card_number")).bail()
            .trim().customSanitizer(v => safeString(v)),
        check.body('credit_date').if(check.body('tab').equals("2"))
            .optional({nullable: true})
            .isString().withMessage(notValidResponse("credit_date")).bail()
            .trim().customSanitizer(v => safeString(v)),
        check.body('credit_cvc').if(check.body('tab').equals("2"))
            .optional({nullable: true})
            .isString().withMessage(notValidResponse("credit_cvc")).bail()
            .trim().customSanitizer(v => safeString(v)),
        check.body('credit_bank_holder_name').if(check.body('tab').equals("2"))
            .optional({nullable: true})
            .isString().withMessage(notValidResponse("credit_bank_holder_name")).bail()
            .trim().customSanitizer(v => safeString(v)),
        check.body('payment_paypal_email').if(check.body('tab').equals("2"))
            .optional({nullable: true})
            .isString().withMessage(notValidResponse("payment_paypal_email")).bail()
            .trim().customSanitizer(v => safeString(v)),
        check.body('invoice_address_country_id').if(check.body('tab').equals("2"))
            .optional({nullable: true})
            .isMongoId().withMessage(notValidResponse("invoice_address_country_id")).bail()
            .customSanitizer(v => safeString(v)),
        check.body('credit_currency_id').if(check.body('tab').equals("2"))
            .optional({nullable: true})
            .isMongoId().withMessage(notValidResponse("credit_currency_id")).bail()
            .customSanitizer(v => safeString(v)),
    ]
};

const deleteValidationSchema = () => {
    return [
        check.param('id').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("id")).bail()
            .isMongoId().withMessage(notValidResponse("id")).customSanitizer(v => safeString(v)).bail()
    ]
};

module.exports = {
    gets: getsValidationSchema,
    get: getValidationSchema,
    getDashboard: getDashboardValidationSchema,
    getChart: getChartValidationSchema,
    getPayments: getPaymentsValidationSchema,
    getPrograms: getProgramsValidationSchema,
    changeActivity: changeActivityValidationSchema,
    changeActivityMember: changeActivityMemberValidationSchema,
    changeVerify: changeVerifyValidationSchema,
    changeIsFullyManage: changeIsFullyManageValidationSchema,
    changeVerifyByAdmin: changeVerifyByAdminValidationSchema,
    changePassword: changePasswordValidationSchema,
    getMembers: getMembersValidationSchema,
    addMember: addMemberValidationSchema,
    updateMember: updateMemberValidationSchema,
    deleteMember: deleteMemberValidationSchema,
    update: updateValidationSchema,
    delete: deleteValidationSchema,
    uploadAvatar: uploadAvatarValidationSchema,
    deleteAvatar: deleteAvatarValidationSchema,
    disabled2FA: disabled2FAValidationSchema,
    changeStatus: changeStatusValidationSchema
};