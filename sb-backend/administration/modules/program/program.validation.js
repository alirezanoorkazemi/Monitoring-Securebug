const check = require('express-validator');
const moment = require('moment');
const {requiredResponse, notValidResponse} = require('../../../libs/message.helper');
const {safeString, cleanXSS, isArray, isObjectID} = require('../../../libs/methode.helper');
const {
    PROGRAM_TYPE,
    PRODUCT_TYPE,
    PROGRAM_STATUS,
    PROGRAM_BOUNTY_TYPE,
    PROGRAM_MATURITY,
    COMPETENCY_PROFILE,
    HACKER_TAGS,
    STATIC_VARIABLES,
    PROGRAM_MODERATOR_ACCESS,
    NEXT_GEN_DURATION_TYPE
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
        check.query('name').optional({nullable: true}).isString().withMessage(notValidResponse("name"))
            .trim().customSanitizer(v => safeString(v)).bail(),
        check.query('program_type').optional({nullable: true}).isInt().withMessage(notValidResponse("program_type")).bail()
            .isIn(PROGRAM_TYPE.VALUES).withMessage(notValidResponse("program_type")).bail()
            .toInt(),
        check.query('status').optional({nullable: true}).isInt().withMessage(notValidResponse("status")).bail()
            .isIn(PROGRAM_STATUS.VALUES).withMessage(notValidResponse("status")).bail()
            .toInt(),
        check.query('is_verify').optional({nullable: true}).isBoolean().withMessage(notValidResponse("is_verify")).bail()
            .isIn([true, false]).withMessage(notValidResponse("is_verify")).bail()
            .toBoolean(),
        check.query('is_next_generation').optional({nullable: true}).isInt().withMessage(notValidResponse("is_next_generation")).bail()
            .isIn(PROGRAM_BOUNTY_TYPE.VALUES).withMessage(notValidResponse("is_next_generation")).bail()
            .toInt(),
    ]
};

const getHackersValidationSchema = () => {
    return [
        check.query('page').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("page")).bail()
            .isInt({gt: 0}).withMessage(notValidResponse("page")).bail()
            .toInt(),
        check.query('sort_type').optional({nullable: true})
            .isInt().withMessage(notValidResponse("sort_type")).bail()
            .isIn([1, -1]).withMessage(notValidResponse("sort_type")).bail()
            .toInt(),
        check.query('username').optional({nullable: true}).isString().withMessage(notValidResponse("username")).bail()
            .trim().customSanitizer(v => safeString(v)),
        check.query('order').optional({nullable: true})
            .isString().withMessage(notValidResponse("order")).bail()
            .isIn(["rank", "username", "register_date_time", "privilage"]).withMessage(notValidResponse("order")).bail()
            .trim().customSanitizer(v => safeString(v)),
        check.query('user_verify').optional({nullable: true}).isBoolean().withMessage(notValidResponse("user_verify")).bail()
            .isIn([true, false]).withMessage(notValidResponse("user_verify")).bail()
            .toBoolean(),
        check.query('invitation_list').optional({nullable: true})
            .isBoolean().withMessage(notValidResponse("invitation_list")).bail()
            .isIn([true, false]).withMessage(notValidResponse("invitation_list")).bail()
            .toBoolean(),
        check.query('invited_hacker_list').optional({nullable: true})
            .isBoolean().withMessage(notValidResponse("invited_hacker_list")).bail()
            .isIn([true, false]).withMessage(notValidResponse("invited_hacker_list")).bail()
            .toBoolean(),
        check.query('competency').optional({nullable: true})
            .isInt({gt: 0}).withMessage(notValidResponse("competency")).bail()
            .isIn(COMPETENCY_PROFILE.VALUES).withMessage(notValidResponse("competency")).bail()
            .toInt(),
        check.query('tag').optional({nullable: true})
            .isInt({gt: 0}).withMessage(notValidResponse("tag")).bail()
            .isIn(HACKER_TAGS.VALUES).withMessage(notValidResponse("tag")).bail()
            .toInt()
    ]
};

const addHackersValidationSchema = () => {
    return [
        check.param('id').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("id")).bail()
            .isMongoId().withMessage(notValidResponse("id")).customSanitizer(v => safeString(v)).bail(),
        check.body('expire_day').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("expire_day")).bail()
            .isInt({lt: 32, gt: 0}).withMessage(notValidResponse("expire_day")).bail()
            .toInt(),
        check.body('hacker_ids').custom((value) => {
            const hacker_ids = JSON.parse(JSON.stringify(value));
            if (!isArray(hacker_ids) || hacker_ids.length === 0) {
                return false;
            }
            for (let i = 0; i < hacker_ids.length; i++) {
                if (!isObjectID(hacker_ids[i])) {
                    return false;
                }
                hacker_ids[i] = safeString(hacker_ids[i]);
            }
            return true;
        }).withMessage(notValidResponse("hacker_ids")).bail()
    ]
};

const getValidationSchema = () => {
    return [
        check.param('id').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("id")).bail()
            .isMongoId().withMessage(notValidResponse("id")).customSanitizer(v => safeString(v)).bail(),
    ]
};

const getHistoryValidationSchema = () => {
    return [
        check.param('id').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("id")).bail()
            .isMongoId().withMessage(notValidResponse("id")).customSanitizer(v => safeString(v)).bail(),
    ]
};

const updateValidationSchema = () => {
    return [
        check.param('id').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("id")).bail()
            .isMongoId().withMessage(notValidResponse("id")).customSanitizer(v => safeString(v)).bail(),
        check.body('tab').notEmpty({ignore_whitespace: true})
            .withMessage(requiredResponse("tab")).bail()
            .isInt().withMessage(notValidResponse("tab")).bail()
            .isIn([0, 1]).withMessage(notValidResponse("tab"))
            .toInt(),
        check.body('name').if(check.body('tab').equals("0"))
            .notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("name")).bail()
            .isString().withMessage(notValidResponse("name")).bail()
            .customSanitizer(v => safeString(v)),
        check.body('tagline').if(check.body('tab').equals("0"))
            .notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("tagline")).bail()
            .isString().withMessage(notValidResponse("tagline")).bail()
            .customSanitizer(v => safeString(v)),
        check.body('policy').if(check.body('tab').equals("0"))
            .notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("policy")).bail()
            .isString().withMessage(notValidResponse("policy")).bail()
            .customSanitizer(v => {
                const str = cleanXSS(v);
                return safeString(str);
            }),
        check.body('compliance1').if(check.body('tab').equals("1"))
            .notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("compliance1")).bail()
            .isInt().withMessage(notValidResponse("compliance1")).bail()
            .isIn([0, 1]).withMessage(notValidResponse("compliance1")).bail()
            .toInt(),
        check.body('compliance2').if(check.body('tab').equals("1"))
            .notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("compliance2")).bail()
            .isInt().withMessage(notValidResponse("compliance2")).bail()
            .isIn([0, 1]).withMessage(notValidResponse("compliance2")).bail()
            .toInt(),
        check.body('compliance3').if(check.body('tab').equals("1"))
            .notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("compliance3")).bail()
            .isInt().withMessage(notValidResponse("compliance3")).bail()
            .isIn([0, 1]).withMessage(notValidResponse("compliance3")).bail()
            .toInt(),
        check.body('compliance4').if(check.body('tab').equals("1"))
            .notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("compliance4")).bail()
            .isInt().withMessage(notValidResponse("compliance4")).bail()
            .isIn([0, 1]).withMessage(notValidResponse("compliance4")).bail()
            .toInt(),
        check.body('compliance5').if(check.body('tab').equals("1"))
            .notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("compliance5")).bail()
            .isInt().withMessage(notValidResponse("compliance5")).bail()
            .isIn([0, 1]).withMessage(notValidResponse("compliance5")).bail()
            .toInt(),
        check.body('compliance6').if(check.body('tab').equals("1"))
            .notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("compliance6")).bail()
            .isInt().withMessage(notValidResponse("compliance6")).bail()
            .isIn([0, 1]).withMessage(notValidResponse("compliance6")).bail()
            .toInt()
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

const setExpireDayValidationSchema = () => {
    return [
        check.param('id').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("id")).bail()
            .isMongoId().withMessage(notValidResponse("id")).customSanitizer(v => safeString(v)).bail(),
        check.body('expire_day').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("expire_day")).bail()
            .isISO8601().withMessage(notValidResponse("expire_day")).bail()
            .toDate()
    ]
};

const updateMaximumRewardValidationSchema = () => {
    return [
        check.param('id').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("id")).bail()
            .isMongoId().withMessage(notValidResponse("id")).customSanitizer(v => safeString(v)).bail(),
        check.body('maximum_reward').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("maximum_reward")).bail()
            .isInt().withMessage(notValidResponse("maximum_reward")).bail()
            .toInt()
    ]
};

const changeStatusValidationSchema = () => {
    return [
        check.param('id').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("id")).bail()
            .isMongoId().withMessage(notValidResponse("id")).customSanitizer(v => safeString(v)).bail(),
        check.body('status').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("status")).bail()
            .isInt({gt: -1}).withMessage(notValidResponse("status")).bail()
            .isIn(PROGRAM_STATUS.VALUES).withMessage(notValidResponse("status")).bail().toInt()
    ]
};

const changeProgramTypeValidationSchema = () => {
    return [
        check.param('id').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("id")).bail()
            .isMongoId().withMessage(notValidResponse("id")).customSanitizer(v => safeString(v)).bail(),
        check.body('program_type').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("program_type")).bail()
            .isInt({gt: 0}).withMessage(notValidResponse("program_type")).bail()
            .isIn(PROGRAM_TYPE.VALUES).withMessage(notValidResponse("program_type")).bail().toInt()
    ]
};

const changeProductTypeValidationSchema = () => {
    return [
        check.param('id').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("id")).bail()
            .isMongoId().withMessage(notValidResponse("id")).customSanitizer(v => safeString(v)).bail(),
        check.body('product_type').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("product_type")).bail()
            .isInt({gt: 0}).withMessage(notValidResponse("product_type")).bail()
            .isIn(PRODUCT_TYPE.VALUES).withMessage(notValidResponse("product_type")).bail().toInt()
    ]
};

const changeProgramBountyTypeValidationSchema = () => {
    return [
        check.param('id').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("id")).bail()
            .isMongoId().withMessage(notValidResponse("id")).customSanitizer(v => safeString(v)).bail(),
        check.body('is_next_generation').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("is_next_generation")).bail()
            .isInt({gt: -1}).withMessage(notValidResponse("is_next_generation")).bail()
            .isIn(PROGRAM_BOUNTY_TYPE.VALUES).withMessage(notValidResponse("is_next_generation")).bail().toInt()
    ]
};

const deleteHackerValidationSchema = () => {
    return [
        check.param('id').notEmpty({ignore_whitespace: true})
            .withMessage(requiredResponse("id")).bail()
            .isMongoId().withMessage(notValidResponse("id"))
            .customSanitizer(v => safeString(v)).bail(),
        check.param('hacker_id').notEmpty({ignore_whitespace: true})
            .withMessage(requiredResponse("hacker_id")).bail()
            .isMongoId().withMessage(notValidResponse("hacker_id"))
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

const getModeratorsValidationSchema = () => {
    return [
        check.param('id').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("id")).bail()
            .isMongoId().withMessage(notValidResponse("id")).customSanitizer(v => safeString(v)).bail()
    ]
};

const createTargetValidationSchema = () => {
    return [
        check.param('id').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("id")).bail()
            .isMongoId().withMessage(notValidResponse("id")).customSanitizer(v => safeString(v)).bail(),
        check.body('target_type_id').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("target_type_id")).bail()
            .isMongoId().withMessage(notValidResponse("target_type_id")).customSanitizer(v => safeString(v)).bail(),
        check.body('language_id').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("language_id")).bail()
            .custom((value) => {
                const language_ids = JSON.parse(JSON.stringify(value));
                if (!isArray(language_ids) || language_ids.length === 0) {
                    return false;
                }
                for (let i = 0; i < language_ids.length; i++) {
                    if (!isObjectID(language_ids[i])) {
                        return false;
                    }
                    language_ids[i] = safeString(language_ids[i]);
                }
                return true;
            }).withMessage(notValidResponse("language_id")),
        check.body('maturity').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("maturity")).bail()
            .isInt().withMessage(notValidResponse("maturity")).bail()
            .isIn(PROGRAM_MATURITY.VALUES).withMessage(notValidResponse("maturity")).bail().toInt(),
        check.body('identifier').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("identifier")).bail()
            .isString().withMessage(notValidResponse("identifier")).bail()
            .customSanitizer(v => safeString(v)),
    ]
};

const updateTargetValidationSchema = () => {
    return [
        check.param('id').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("id")).bail()
            .isMongoId().withMessage(notValidResponse("id")).customSanitizer(v => safeString(v)).bail(),
        check.param('target_id').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("target_id")).bail()
            .isMongoId().withMessage(notValidResponse("target_id")).customSanitizer(v => safeString(v)).bail(),
        check.body('target_type_id').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("target_type_id")).bail()
            .isMongoId().withMessage(notValidResponse("target_type_id")).customSanitizer(v => safeString(v)).bail(),
        check.body('language_id').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("language_id")).bail()
            .custom((value) => {
                const language_ids = JSON.parse(JSON.stringify(value));
                if (!isArray(language_ids) || language_ids.length === 0) {
                    return false;
                }
                for (let i = 0; i < language_ids.length; i++) {
                    if (!isObjectID(language_ids[i])) {
                        return false;
                    }
                    language_ids[i] = safeString(language_ids[i]);
                }
                return true;
            }).withMessage(notValidResponse("language_id")),
        check.body('maturity').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("maturity")).bail()
            .isInt().withMessage(notValidResponse("maturity")).bail()
            .isIn(PROGRAM_MATURITY.VALUES).withMessage(notValidResponse("maturity")).bail().toInt(),
        check.body('identifier').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("identifier")).bail()
            .isString().withMessage(notValidResponse("identifier")).bail()
            .customSanitizer(v => safeString(v))
    ]
};

const deleteTargetValidationSchema = () => {
    return [
        check.param('id').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("id")).bail()
            .isMongoId().withMessage(notValidResponse("id")).customSanitizer(v => safeString(v)).bail(),
        check.param('target_id').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("target_id")).bail()
            .isMongoId().withMessage(notValidResponse("target_id")).customSanitizer(v => safeString(v)).bail(),
    ]
};

const createRewardValidationSchema = () => {
    return [
        check.param('id').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("id")).bail()
            .isMongoId().withMessage(notValidResponse("id")).customSanitizer(v => safeString(v)).bail(),
        check.body('target_id').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("target_id")).bail()
            .isMongoId().withMessage(notValidResponse("target_id")).customSanitizer(v => safeString(v)).bail(),
        check.body('currency_id').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("currency_id")).bail()
            .isMongoId().withMessage(notValidResponse("currency_id")).customSanitizer(v => safeString(v)).bail(),
        check.body('critical_price').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("critical_price")).bail()
            .isInt({gt: -1}).withMessage(notValidResponse("critical_price")).bail().toInt(),
        check.body('high_price').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("high_price")).bail()
            .isInt({gt: -1}).withMessage(notValidResponse("high_price")).bail().toInt(),
        check.body('medium_price').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("medium_price")).bail()
            .isInt({gt: -1}).withMessage(notValidResponse("medium_price")).bail().toInt(),
        check.body('low_price').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("low_price")).bail()
            .isInt({gt: -1}).withMessage(notValidResponse("low_price")).bail().toInt(),
        check.body('none_price').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("none_price")).bail()
            .isInt({gt: -1}).withMessage(notValidResponse("none_price")).bail().toInt()
    ]
};

const createRewardForAllTargetsValidationSchema = () => {
    return [
        check.param('id').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("id")).bail()
            .isMongoId().withMessage(notValidResponse("id")).customSanitizer(v => safeString(v)).bail(),
        check.body('currency_id').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("currency_id")).bail()
            .isMongoId().withMessage(notValidResponse("currency_id")).customSanitizer(v => safeString(v)).bail(),
        check.body('critical_price').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("critical_price")).bail()
            .isInt({gt: -1}).withMessage(notValidResponse("critical_price")).bail().toInt(),
        check.body('high_price').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("high_price")).bail()
            .isInt({gt: -1}).withMessage(notValidResponse("high_price")).bail().toInt(),
        check.body('medium_price').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("medium_price")).bail()
            .isInt({gt: -1}).withMessage(notValidResponse("medium_price")).bail().toInt(),
        check.body('low_price').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("low_price")).bail()
            .isInt({gt: -1}).withMessage(notValidResponse("low_price")).bail().toInt(),
        check.body('none_price').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("none_price")).bail()
            .isInt({gt: -1}).withMessage(notValidResponse("none_price")).bail().toInt()
    ]
};

const updateRewardValidationSchema = () => {
    return [
        check.param('id').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("id")).bail()
            .isMongoId().withMessage(notValidResponse("id")).customSanitizer(v => safeString(v)).bail(),
        check.param('reward_id').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("reward_id")).bail()
            .isMongoId().withMessage(notValidResponse("reward_id")).customSanitizer(v => safeString(v)).bail(),
        check.body('all_target').optional({nullable: true})
            .isIn([true, false]).withMessage(notValidResponse("all_target")).toBoolean().bail(),
        check.body('target_id').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("target_id")).bail()
            .isMongoId().withMessage(notValidResponse("target_id")).customSanitizer(v => safeString(v)).bail(),
        check.body('currency_id').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("currency_id")).bail()
            .isMongoId().withMessage(notValidResponse("currency_id")).customSanitizer(v => safeString(v)).bail(),
        check.body('critical_price').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("critical_price")).bail()
            .isInt({gt: -1}).withMessage(notValidResponse("critical_price")).bail().toInt(),
        check.body('high_price').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("high_price")).bail()
            .isInt({gt: -1}).withMessage(notValidResponse("high_price")).bail().toInt(),
        check.body('medium_price').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("medium_price")).bail()
            .isInt({gt: -1}).withMessage(notValidResponse("medium_price")).bail().toInt(),
        check.body('low_price').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("low_price")).bail()
            .isInt({gt: -1}).withMessage(notValidResponse("low_price")).bail().toInt(),
        check.body('none_price').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("none_price")).bail()
            .isInt({gt: -1}).withMessage(notValidResponse("none_price")).bail().toInt()
    ]
};

const deleteRewardValidationSchema = () => {
    return [
        check.param('id').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("id")).bail()
            .isMongoId().withMessage(notValidResponse("id")).customSanitizer(v => safeString(v)).bail(),
        check.body('all_target').optional({nullable: true})
            .isIn([true, false]).withMessage(notValidResponse("all_target")).toBoolean().bail(),
        check.param('reward_id').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("reward_id")).bail()
            .isMongoId().withMessage(notValidResponse("reward_id")).customSanitizer(v => safeString(v)).bail(),
    ]
};

const createPolicyValidationSchema = () => {
    return [
        check.param('id').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("id")).bail()
            .isMongoId().withMessage(notValidResponse("id")).customSanitizer(v => safeString(v)).bail(),
        check.body('target_id').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("target_id")).bail()
            .isMongoId().withMessage(notValidResponse("target_id")).customSanitizer(v => safeString(v)).bail(),
        check.body('out_of_target').optional({nullable: true}).customSanitizer(v => safeString(v)),
        check.body('target_information').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("target_information")).bail()
            .isString().withMessage(notValidResponse("target_information")).bail().customSanitizer(v => {
            const str = cleanXSS(v);
            return safeString(str);
        }),
        check.body('qualifying_vulnerabilities').if(check.body('is_next_generation').not().equals("2"))
            .notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("qualifying_vulnerabilities")).bail()
            .isString().withMessage(notValidResponse("qualifying_vulnerabilities")).bail().customSanitizer(v => {
            const str = cleanXSS(v);
            return safeString(str);
        }),
        check.body('non_qualifying_vulnerabilities').if(check.body('is_next_generation').not().equals("2"))
            .notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("non_qualifying_vulnerabilities")).bail()
            .isString().withMessage(notValidResponse("non_qualifying_vulnerabilities")).bail().customSanitizer(v => {
            const str = cleanXSS(v);
            return safeString(str);
        }),
        check.body('item1').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("item1")).bail()
            .isBoolean().withMessage(notValidResponse("item1")).bail()
            .isIn([true, false]).withMessage(notValidResponse("item1")).bail().toBoolean(),
        check.body('item2').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("item2")).bail()
            .isBoolean().withMessage(notValidResponse("item2")).bail()
            .isIn([true, false]).withMessage(notValidResponse("item2")).bail().toBoolean(),
        check.body('item3').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("item3")).bail()
            .isBoolean().withMessage(notValidResponse("item3")).bail()
            .isIn([true, false]).withMessage(notValidResponse("item3")).bail().toBoolean()
    ]
};

const createPolicyForAllTargetsValidationSchema = () => {
    return [
        check.param('id').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("id")).bail()
            .isMongoId().withMessage(notValidResponse("id")).customSanitizer(v => safeString(v)).bail(),
        check.body('out_of_target').optional({nullable: true}).customSanitizer(v => safeString(v)),
        check.body('target_information').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("target_information")).bail()
            .isString().withMessage(notValidResponse("target_information")).bail().customSanitizer(v => {
            const str = cleanXSS(v);
            return safeString(str);
        }),
        check.body('qualifying_vulnerabilities').if(check.body('is_next_generation').not().equals("2"))
            .notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("qualifying_vulnerabilities")).bail()
            .isString().withMessage(notValidResponse("qualifying_vulnerabilities")).bail().customSanitizer(v => {
            const str = cleanXSS(v);
            return safeString(str);
        }),
        check.body('non_qualifying_vulnerabilities').if(check.body('is_next_generation').not().equals("2"))
            .notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("non_qualifying_vulnerabilities")).bail()
            .isString().withMessage(notValidResponse("non_qualifying_vulnerabilities")).bail().customSanitizer(v => {
            const str = cleanXSS(v);
            return safeString(str);
        }),
        check.body('item1').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("item1")).bail()
            .isBoolean().withMessage(notValidResponse("item1")).bail()
            .isIn([true, false]).withMessage(notValidResponse("item1")).bail().toBoolean(),
        check.body('item2').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("item2")).bail()
            .isBoolean().withMessage(notValidResponse("item2")).bail()
            .isIn([true, false]).withMessage(notValidResponse("item2")).bail().toBoolean(),
        check.body('item3').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("item3")).bail()
            .isBoolean().withMessage(notValidResponse("item3")).bail()
            .isIn([true, false]).withMessage(notValidResponse("item3")).bail().toBoolean()
    ]
};

const updatePolicyValidationSchema = () => {
    return [
        check.param('id').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("id")).bail()
            .isMongoId().withMessage(notValidResponse("id")).customSanitizer(v => safeString(v)).bail(),
        check.param('policy_id').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("policy_id")).bail()
            .isMongoId().withMessage(notValidResponse("policy_id")).customSanitizer(v => safeString(v)).bail(),
        check.body('all_target').optional({nullable: true})
            .isIn([true, false]).withMessage(notValidResponse("all_target")).toBoolean().bail(),
        check.body('target_id').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("target_id")).bail()
            .isMongoId().withMessage(notValidResponse("target_id")).customSanitizer(v => safeString(v)).bail(),
        check.body('out_of_target').optional({nullable: true}).customSanitizer(v => safeString(v)),
        check.body('target_information').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("target_information")).bail()
            .isString().withMessage(notValidResponse("target_information")).bail().customSanitizer(v => {
            const str = cleanXSS(v);
            return safeString(str);
        }),
        check.body('qualifying_vulnerabilities').if(check.body('is_next_generation').equals("2"))
            .notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("qualifying_vulnerabilities")).bail()
            .isString().withMessage(notValidResponse("qualifying_vulnerabilities")).bail().customSanitizer(v => {
            const str = cleanXSS(v);
            return safeString(str);
        }),
        check.body('non_qualifying_vulnerabilities').if(check.body('is_next_generation').not().equals("2"))
            .notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("non_qualifying_vulnerabilities")).bail()
            .isString().withMessage(notValidResponse("non_qualifying_vulnerabilities")).bail().customSanitizer(v => {
            const str = cleanXSS(v);
            return safeString(str);
        }),
        check.body('item1').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("item1")).bail()
            .isBoolean().withMessage(notValidResponse("item1")).bail()
            .isIn([true, false]).withMessage(notValidResponse("item1")).bail().toBoolean(),
        check.body('item2').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("item2")).bail()
            .isBoolean().withMessage(notValidResponse("item2")).bail()
            .isIn([true, false]).withMessage(notValidResponse("item2")).bail().toBoolean(),
        check.body('item3').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("item3")).bail()
            .isBoolean().withMessage(notValidResponse("item3")).bail()
            .isIn([true, false]).withMessage(notValidResponse("item3")).bail().toBoolean()
    ]
};

const deletePolicyValidationSchema = () => {
    return [
        check.param('id').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("id")).bail()
            .isMongoId().withMessage(notValidResponse("id")).customSanitizer(v => safeString(v)).bail(),
        check.body('all_target').optional({nullable: true})
            .isIn([true, false]).withMessage(notValidResponse("all_target")).toBoolean().bail(),
        check.param('policy_id').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("policy_id")).bail()
            .isMongoId().withMessage(notValidResponse("policy_id")).customSanitizer(v => safeString(v)).bail(),
    ]
};

const deleteModeratorValidationSchema = () => {
    return [
        check.param('id').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("id")).bail()
            .isMongoId().withMessage(notValidResponse("id")).customSanitizer(v => safeString(v)).bail(),
        check.param('moderator_user_id').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("moderator_user_id")).bail()
            .isMongoId().withMessage(notValidResponse("moderator_user_id")).customSanitizer(v => safeString(v)).bail()
    ]
};

const assignModeratorValidationSchema = () => {
    return [
        check.param('id').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("id")).bail()
            .isMongoId().withMessage(notValidResponse("id")).customSanitizer(v => safeString(v)).bail(),
        check.body('moderator_user_id').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("moderator_user_id")).bail()
            .isMongoId().withMessage(notValidResponse("moderator_user_id")).customSanitizer(v => safeString(v)).bail(),
        check.body('user_access').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("user_access")).bail()
            .isInt({gt: -1}).withMessage(notValidResponse("user_access")).bail()
            .isIn(PROGRAM_MODERATOR_ACCESS.VALUES).withMessage(notValidResponse("user_access")).bail()
            .customSanitizer(v => safeString(v)).toInt()
    ]
};

const updateAssignedModeratorValidationSchema = () => {
    return [
        check.param('id').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("id")).bail()
            .isMongoId().withMessage(notValidResponse("id")).customSanitizer(v => safeString(v)).bail(),
        check.param('moderator_user_id').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("moderator_user_id")).bail()
            .isMongoId().withMessage(notValidResponse("moderator_user_id")).customSanitizer(v => safeString(v)).bail(),
        check.body('user_access').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("user_access")).bail()
            .isInt({gt: -1}).withMessage(notValidResponse("user_access")).bail()
            .isIn(PROGRAM_MODERATOR_ACCESS.VALUES).withMessage(notValidResponse("user_access")).bail()
            .customSanitizer(v => safeString(v)).toInt()
    ]
};

const budgetingProgramsValidationSchema = () => {
    return [
        check.param('id').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("id")).bail()
            .isMongoId().withMessage(notValidResponse("id")).customSanitizer(v => safeString(v)).bail(),
        check.body('monthly_hours').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("monthly_hours")).bail()
            .customSanitizer(monthly_hours => {
                const new_monthly_hours = JSON.parse(monthly_hours);
                if (isArray(new_monthly_hours)) {
                    return new_monthly_hours.map(item => {
                        return {date: safeString(item.date), hours: Number(item.hours)}
                    });
                }
            })
            .custom((monthly_hours) => {
                if (!(isArray(monthly_hours) || monthly_hours.length > 0)) {
                    return false;
                }
                const min_hours = 0;
                const max_hours = 240;
                for (let item of monthly_hours) {
                    const is_repeated_date = monthly_hours.filter(m => m.date === item.date);
                    if (is_repeated_date.length > 1) {
                        return false;
                    }
                    if (item.hours < min_hours || item.hours > max_hours) {
                        return false;
                    }
                    if (!moment(item.date, "yyyy-MM-01", true).isValid()) {
                        return false;
                    }
                }
                return true;
            }).withMessage(notValidResponse("monthly_hours")),
        check.body('duration_type').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("duration_type")).bail()
            .isIn(NEXT_GEN_DURATION_TYPE.VALUES).withMessage(notValidResponse("duration_type")).bail()
            .custom((type, {req}) => {
                if (type === NEXT_GEN_DURATION_TYPE.TWELVE_MONTH && req.body.monthly_hours.length !== NEXT_GEN_DURATION_TYPE.TWELVE_MONTH) {
                    return false;
                } else if (type === NEXT_GEN_DURATION_TYPE.SIX_MONTH && req.body.monthly_hours.length !== NEXT_GEN_DURATION_TYPE.SIX_MONTH) {
                    return false;
                }
                return true;
            }).withMessage(notValidResponse("duration_type")).bail()
            .customSanitizer(type => safeString(type)).toInt(),
        check.body('hourly_price').notEmpty({ignore_whitespace: true}).withMessage(requiredResponse("hourly_price")).bail()
            .custom((price) => !isNaN(price)).withMessage(notValidResponse("hourly_price")).bail()
            .customSanitizer(price => safeString(price)).toInt()
    ]
};

module.exports = {
    gets: getsValidationSchema,
    changeVerify: changeVerifyValidationSchema,
    setExpireDay: setExpireDayValidationSchema,
    changeStatus: changeStatusValidationSchema,
    updateMaximumReward: updateMaximumRewardValidationSchema,
    getModerators: getModeratorsValidationSchema,
    deleteModerator: deleteModeratorValidationSchema,
    assignModerator: assignModeratorValidationSchema,
    updateAssignedModerator: updateAssignedModeratorValidationSchema,
    delete: deleteValidationSchema,
    update: updateValidationSchema,
    createTarget: createTargetValidationSchema,
    updateTarget: updateTargetValidationSchema,
    deleteTarget: deleteTargetValidationSchema,
    createReward: createRewardValidationSchema,
    createRewardForAllTargets: createRewardForAllTargetsValidationSchema,
    updateReward: updateRewardValidationSchema,
    deleteReward: deleteRewardValidationSchema,
    createPolicy: createPolicyValidationSchema,
    createPolicyForAllTargets: createPolicyForAllTargetsValidationSchema,
    updatePolicy: updatePolicyValidationSchema,
    deletePolicy: deletePolicyValidationSchema,
    changeProgramType: changeProgramTypeValidationSchema,
    changeProductType: changeProductTypeValidationSchema,
    changeProgramBountyType: changeProgramBountyTypeValidationSchema,
    getHackers: getHackersValidationSchema,
    addHackers: addHackersValidationSchema,
    deleteHacker: deleteHackerValidationSchema,
    gethistory: getHistoryValidationSchema,
    get: getValidationSchema,
    budgeting: budgetingProgramsValidationSchema
};