const check = require('express-validator');
const {notValidResponse, requiredResponse, notEqualResponse} = require('../../../libs/message.helper');
const {
    HACKER_IDENTITY_STATUS, STATIC_VARIABLES, HACKER_IDENTITY_TYPE,
    HACKER_TAGS, HACKER_PAYMENT_STATUS, COMPETENCY_PROFILE,
    PAYMENT_DEFAULT, BANK_TRANSFER_TYPE
} = require('../../../libs/enum.helper');
const {safeString, isArray} = require('../../../libs/methode.helper');


const getsValidationSchema = () => {
    return [
        check.query('page').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("page")).bail()
            .isInt({gt: 0}).withMessage(notValidResponse("page")).bail()
            .toInt(),
        check.query('limit').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("limit")).bail()
            .isInt({gt: 0}).withMessage(notValidResponse("limit")).bail()
            .isIn(STATIC_VARIABLES.PAGE_SIZE_VALUES).withMessage(notValidResponse("limit")).bail()
            .toInt(),
        check.query('email').optional({nullable: true}).isString().withMessage(notValidResponse("email")).bail()
            .trim().customSanitizer(v => safeString(v)),
         check.query('first_name').optional({nullable: true}).isString().withMessage(notValidResponse("first_name")).bail()
            .trim().customSanitizer(v => safeString(v)),
         check.query('last_name').optional({nullable: true}).isString().withMessage(notValidResponse("last_name")).bail()
            .trim().customSanitizer(v => safeString(v)),
        check.query('username').optional({nullable: true}).isString().withMessage(notValidResponse("username")).bail()
            .trim().customSanitizer(v => safeString(v)),
        check.query('withdraw').optional({nullable: true}).isString().withMessage(notValidResponse("withdraw")).bail()
            .isIn(['all_withdraw', 'pending_withdraw', 'paid_withdraw']).withMessage(notValidResponse("withdraw")).bail()
            .trim().customSanitizer(v => safeString(v)),
        check.query('country_id').optional({nullable: true}).isMongoId().withMessage(notValidResponse("country_id")).bail(),
        check.query('status').optional({nullable: true}).isBoolean().withMessage(notValidResponse("status")).bail()
            .isIn([true, false]).withMessage(notValidResponse("status")).bail()
            .toBoolean(),
        check.query('is_verify').optional({nullable: true}).isBoolean().withMessage(notValidResponse("is_verify")).bail()
            .isIn([true, false]).withMessage(notValidResponse("is_verify")).bail()
            .toBoolean(),
         check.query('user_verify').optional({nullable: true}).isBoolean().withMessage(notValidResponse("user_verify")).bail()
            .isIn([true, false]).withMessage(notValidResponse("user_verify")).bail()
            .toBoolean(),
        check.query('identity').optional({nullable: true}).isInt({gt: -1}).withMessage(notValidResponse("identity")).bail()
            .isIn(HACKER_IDENTITY_STATUS.VALUES).withMessage(notValidResponse("identity")).bail().toInt(),
        check.query('tag').optional({nullable: true}).isInt({gt: -1}).withMessage(notValidResponse("tag")).bail()
            .isIn(HACKER_TAGS.VALUES).withMessage(notValidResponse("tag")).bail().toInt(),
        check.query('select_term').if(check.query('select_term').exists())
            .notEmpty({ignore_whitespace: true})
            .withMessage(requiredResponse("select_term")).bail()
            .isString().withMessage(notValidResponse("select_term")).bail()
            .trim().customSanitizer(v => safeString(v))
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

const addCoinValidationSchema = () => {
    return [
        check.param('id').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("id")).bail()
            .isMongoId().withMessage(notValidResponse("id")).customSanitizer(v => safeString(v)).bail(),
        check.body('coin').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("coin")).bail()
            .isInt().withMessage(notValidResponse("coin")).bail()
            .toInt(),
        check.body('text').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("text")).bail()
            .isString().withMessage(notValidResponse("text")).bail()
            .trim().customSanitizer(v => safeString(v))
    ]
};

const changeIdentityStatusValidationSchema = () => {
    return [
        check.param('id').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("id")).bail()
            .isMongoId().withMessage(notValidResponse("id")).customSanitizer(v => safeString(v)).bail(),
        check.body('status').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("status")).bail()
            .isInt().withMessage(notValidResponse("status")).bail()
            .isIn(HACKER_IDENTITY_STATUS.VALUES).withMessage(notValidResponse("status")).bail()
            .toInt(),
        check.body('type').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("type")).bail()
            .isInt().withMessage(notValidResponse("type")).bail()
            .isIn(HACKER_IDENTITY_TYPE.VALUES).withMessage(notValidResponse("type")).bail()
            .toInt()
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

const assignTagValidationSchema = () => {
    return [
        check.param('id').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("id")).bail()
            .isMongoId().withMessage(notValidResponse("id")).customSanitizer(v => safeString(v)).bail(),
        check.body('tag').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("tag")).bail()
            .custom((value) => {
                const tag = JSON.parse(value);
                if (!isArray(tag)) {
                    return false;
                }
                if (tag.length > 0) {
                    for (let i = 0; i < tag.length; i++) {
                        if (!HACKER_TAGS.VALUES.includes(tag[i])) {
                            return false;
                        }
                    }
                }
                return true;
            }).withMessage(notValidResponse("tag"))
    ]
};

const changePaymentStatusValidationSchema = () => {
    return [
        check.param('id').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("id")).bail()
            .isMongoId().withMessage(notValidResponse("id")).customSanitizer(v => safeString(v)).bail(),
        check.param('payment_id').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("payment_id")).bail()
            .isMongoId().withMessage(notValidResponse("payment_id")).customSanitizer(v => safeString(v)).bail(),
        check.body('status').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("status")).bail()
            .isIn(HACKER_PAYMENT_STATUS.VALUES).withMessage(notValidResponse("status")).bail()
            .isInt().withMessage(notValidResponse("status")).bail()
            .toInt()
    ]
};

const deleteValidationSchema = () => {
    return [
        check.param('id').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("id")).bail()
            .isMongoId().withMessage(notValidResponse("id")).customSanitizer(v => safeString(v)).bail()
    ]
};

const getValidationSchema = () => {
    return [
        check.param('id').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("id")).bail()
            .isMongoId().withMessage(notValidResponse("id")).customSanitizer(v => safeString(v)).bail(),
        check.param('report_id').optional({nullable: true})
            .isMongoId().withMessage(notValidResponse("report_id")).customSanitizer(v => safeString(v)).bail(),
        check.query('hacker_card').optional({nullable:true})
            .isBoolean().withMessage(notValidResponse("hacker_card")).bail()
            .isIn([true, false]).withMessage(notValidResponse("hacker_card"))
            .bail().toBoolean(),
    ]
};

const disabled2FAValidationSchema = () => {
    return [
        check.param('id').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("id")).bail()
            .isMongoId().withMessage(notValidResponse("id")).customSanitizer(v => safeString(v)).bail()
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
            .isIn([0, 1,2, 3]).withMessage(notValidResponse("tab"))
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
        check.body('email').if(check.body('tab').equals("0"))
            .notEmpty({ignore_whitespace: true})
            .withMessage(requiredResponse("email")).bail()
            .isString().withMessage(notValidResponse("email")).bail()
            .isEmail().withMessage(notValidResponse("email")).bail()
            .trim().toLowerCase().customSanitizer(v => safeString(v)),
        check.body('username').if(check.body('tab').equals("0"))
            .notEmpty({ignore_whitespace: true})
            .withMessage(requiredResponse("username")).bail()
            .isString().withMessage(notValidResponse("username")).bail()
            .trim().toLowerCase().customSanitizer(v => safeString(v)),
        check.body('invitation').if(check.body('tab').equals("0"))
            .notEmpty({ignore_whitespace: true})
            .withMessage(requiredResponse("invitation")).bail()
            .isBoolean().withMessage(notValidResponse("invitation")).bail()
            .isIn([true, false]).withMessage(notValidResponse("invitation"))
            .bail(),
        check.body('profile_visibility').if(check.body('tab').equals("1"))
            .notEmpty({ignore_whitespace: true})
            .withMessage(requiredResponse("profile_visibility")).bail()
            .isBoolean().withMessage(notValidResponse("profile_visibility")).bail()
            .isIn([true, false]).withMessage(notValidResponse("profile_visibility"))
            .bail(),
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
        check.body('country_id').if(check.body('tab').equals("1"))
            .optional({nullable: true})
            .isMongoId().withMessage(notValidResponse("country_id")).bail(),
        check.body('country_id_residence').if(check.body('tab').equals("1"))
            .optional({nullable: true})
            .isMongoId().withMessage(notValidResponse("country_id_residence")).bail(),
        check.body('incoming_range_id').if(check.body('tab').equals("1"))
            .optional({nullable: true})
            .isMongoId().withMessage(notValidResponse("incoming_range_id")).bail(),
        check.body('competency_profile').if(check.body('tab').equals("1"))
            .optional({nullable: true})
            .isInt({gt: 0}).withMessage(notValidResponse("competency_profile")).bail()
            .isIn(COMPETENCY_PROFILE.VALUES).withMessage(notValidResponse("competency_profile"))
            .bail(),
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
         check.body('review_application').if(check.body('tab').equals("2"))
             .notEmpty({ignore_whitespace: true})
             .withMessage(requiredResponse("review_application")).bail()
             .isBoolean().withMessage(notValidResponse("review_application")).bail()
             .isIn([true, false]).withMessage(notValidResponse("review_application"))
             .bail(),
         check.body('video_recorded_interview').if(check.body('tab').equals("2"))
             .notEmpty({ignore_whitespace: true})
             .withMessage(requiredResponse("video_recorded_interview")).bail()
             .isBoolean().withMessage(notValidResponse("video_recorded_interview")).bail()
             .isIn([true, false]).withMessage(notValidResponse("video_recorded_interview"))
             .bail(),
         check.body('technical_interview').if(check.body('tab').equals("2"))
             .notEmpty({ignore_whitespace: true})
             .withMessage(requiredResponse("technical_interview")).bail()
             .isBoolean().withMessage(notValidResponse("technical_interview")).bail()
             .isIn([true, false]).withMessage(notValidResponse("technical_interview"))
             .bail(),
         check.body('mobile_address_verification').if(check.body('tab').equals("2"))
             .notEmpty({ignore_whitespace: true})
             .withMessage(requiredResponse("mobile_address_verification")).bail()
             .isBoolean().withMessage(notValidResponse("mobile_address_verification")).bail()
             .isIn([true, false]).withMessage(notValidResponse("mobile_address_verification"))
             .bail(),
         check.body('verification_of_two_references').if(check.body('tab').equals("2"))
             .notEmpty({ignore_whitespace: true})
             .withMessage(requiredResponse("verification_of_two_references")).bail()
             .isBoolean().withMessage(notValidResponse("verification_of_two_references")).bail()
             .isIn([true, false]).withMessage(notValidResponse("verification_of_two_references"))
             .bail(),
        check.body('contract_agreement').if(check.body('tab').equals("2"))
             .notEmpty({ignore_whitespace: true})
             .withMessage(requiredResponse("contract_agreement")).bail()
             .isBoolean().withMessage(notValidResponse("contract_agreement")).bail()
             .isIn([true, false]).withMessage(notValidResponse("contract_agreement"))
             .bail(),
        check.body('payment_default').if(check.body('tab').equals("3"))
            .optional({nullable: true})
            .isInt().withMessage(notValidResponse("payment_default")).bail()
            .isIn(PAYMENT_DEFAULT.VALUES).withMessage(notValidResponse("payment_default")).bail()
            .toInt(),
        check.body('payment_bank_transfer_type').if(check.body('tab').equals("3"))
            .optional({nullable: true})
            .isInt().withMessage(notValidResponse("payment_bank_transfer_type")).bail()
            .isIn(BANK_TRANSFER_TYPE.VALUES).withMessage(notValidResponse("payment_bank_transfer_type")).bail()
            .toInt(),
        check.body('payment_paypal_email').if(check.body('tab').equals("3"))
            .optional({nullable: true})
            .isString().withMessage(notValidResponse("payment_paypal_email")).bail()
            .trim().customSanitizer(v => safeString(v)),
        check.body('payment_bank_transfer_account_holder').if(check.body('tab').equals("3"))
            .optional({nullable: true})
            .isString().withMessage(notValidResponse("payment_bank_transfer_account_holder")).bail()
            .trim().customSanitizer(v => safeString(v)),
        check.body('payment_bank_transfer_bic').if(check.body('tab').equals("3"))
            .optional({nullable: true})
            .isString().withMessage(notValidResponse("payment_bank_transfer_bic")).bail()
            .trim().customSanitizer(v => safeString(v)),
        check.body('payment_bank_transfer_iban').if(check.body('tab').equals("3"))
            .optional({nullable: true})
            .isString().withMessage(notValidResponse("payment_bank_transfer_iban")).bail()
            .trim().customSanitizer(v => safeString(v)),
        check.body('payment_usdt_public_key').if(check.body('tab').equals("3"))
            .optional({nullable: true})
            .isString().withMessage(notValidResponse("payment_usdt_public_key")).bail()
            .trim().customSanitizer(v => safeString(v)),
        check.body('payment_bank_transfer_country_id').if(check.body('tab').equals("3"))
            .optional({nullable: true})
            .isMongoId().withMessage(notValidResponse("payment_bank_transfer_country_id")).bail(),
        check.body('payment_bank_transfer_country_id_residence').if(check.body('tab').equals("3"))
            .optional({nullable: true})
            .isMongoId().withMessage(notValidResponse("payment_bank_transfer_country_id_residence")).bail(),
        check.body('payment_bank_transfer_currency_id').if(check.body('tab').equals("3"))
            .optional({nullable: true})
            .isMongoId().withMessage(notValidResponse("payment_bank_transfer_currency_id")).bail()
    ]
};

const uploadAvatarValidationSchema = () => {
    return [
        check.param('id').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("id")).bail()
            .isMongoId().withMessage(notValidResponse("id")).customSanitizer(v => safeString(v)).bail()
    ]
};

const deleteAvatarValidationSchema  = () => {
    return [
        check.param('id').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("id")).bail()
            .isMongoId().withMessage(notValidResponse("id")).customSanitizer(v => safeString(v)).bail()
    ]
};
const getPaymentsValidationSchema = () => {
    return [
        check.param('id').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("id")).bail()
            .isMongoId().withMessage(notValidResponse("id")).customSanitizer(v => safeString(v)).bail()
    ]
};

module.exports = {
    gets: getsValidationSchema,
    get: getValidationSchema,
    delete: deleteValidationSchema,
    update: updateValidationSchema,
    changeActivity: changeActivityValidationSchema,
    changeVerify: changeVerifyValidationSchema,
    changeIdentityStatus: changeIdentityStatusValidationSchema,
    addCoin: addCoinValidationSchema,
    getPayments: getPaymentsValidationSchema,
    assignTag: assignTagValidationSchema,
    changePaymentStatus: changePaymentStatusValidationSchema,
    changePassword: changePasswordValidationSchema,
    disabled2FA: disabled2FAValidationSchema,
    uploadAvatar: uploadAvatarValidationSchema,
    deleteAvatar: deleteAvatarValidationSchema,
    changeStatus: changeStatusValidationSchema
};