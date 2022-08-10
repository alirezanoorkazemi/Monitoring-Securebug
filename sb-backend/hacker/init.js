require('./../appConfig');
require('./../libs/core');

hacker = express();
hacker.disable('x-powered-by');

getHackerLogin = async function (token, check_refresh_token = true, check_verification = true, populate_fields = false) {
    let data_string = await decryptToken(token);
    if (!data_string) {
        return 0;
    }
    let data = data_string.split('#');
    if (data.length !== 6) {
        return 0;
    }
    if (!isObjectID(data[1])) {
        return 0;
    }
    let nowDate = getTimeStamp();
    if (nowDate > data[3]) {
        return -1;
    }
    if (nowDate > data[5] && check_refresh_token) {
        return -5;
    }
    const user_id = safeString(data[1]);
    let user = null;
    if (populate_fields) {
        user = await SchemaModels.HackerUserModel.findOne({_id: user_id})
            .populate('country_id')
            .populate('country_id_residence')
            .populate('incoming_range_id')
            .populate('payment_bank_transfer_country_id')
            .populate('payment_bank_transfer_country_id_residence')
            .populate('payment_bank_transfer_currency_id')
            .populate('identity_country_id');
    } else {
        user = await SchemaModels.HackerUserModel.findOne({_id: user_id});
    }
    if (!user) {
        return 0;
    }
    if (user.is_verify && check_verification) {
        if (user.status) {
            return user;
        } else {
            return -3;//user account is disabled
        }
    } else if (!check_verification) {
        return user;
    } else {
        return -2;//user account is not verify
    }
};

getHackerKycBasic = function (user) {
    try {
        let isOK = false;
        if (!isUndefined(user)) {
            if (user.fn !== "" && user.ln !== "" && user.competency_profile !== 0 && user.address1 !== "") {
                if (!isUndefined(user.country_id) && isObjectID(user.country_id._id)
                    && !isUndefined(user.incoming_range_id) && isObjectID(user.incoming_range_id._id)) {
                    if (!isUndefined(user.skills) && user.skills.length > 0) {
                        isOK = true;
                    } else {
                        isOK = false;
                    }
                } else {
                    isOK = false;
                }
            } else {
                isOK = false;
            }
        } else {
            isOK = false;
        }
        return isOK;
    } catch (e) {
        if (isSentry)
            Sentry.captureException(e);
        return false;
    }
};

getHackerKycAdvanced = function (user) {
    try {
        let isOK = false;
        if (!isUndefined(user)) {
            if (!isUndefined(user.identity_passport_file_status) && user.identity_passport_file_status == HACKER_IDENTITY_STATUS.APPROVED &&
                ((!isUndefined(user.identity_card_file_status) && user.identity_card_file_status == HACKER_IDENTITY_STATUS.APPROVED) ||
                    !isUndefined(user.identity_driver_file_status) && user.identity_driver_file_status == HACKER_IDENTITY_STATUS.APPROVED)) {
                if (getHackerKycBasic(user)) {
                    isOK = true;
                } else {
                    isOK = false;
                }
            } else {
                isOK = false;
            }
        } else {
            isOK = false;
        }
        return isOK;
    } catch (e) {
        if (isSentry)
            Sentry.captureException(e);
        return false;
    }
};


const lang = {
    auth_token_is_empty: "token is empty",
    auth_token_invalid: "token invalid",
    auth_token_expire: "token expire",
    auth_refresh_token_expire: "refresh token expire",
    auth_account_is_not_verify: "account is not verify",
    auth_account_is_disabled: "account is disabled",
};
isAuth = async function (req, res, next) {
    try {
        await check.header('x-token').trim().not().isEmpty()
            .withMessage({"result": lang.auth_token_is_empty, "code": "-1", "is_login": "-1"}).run(req);
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
            return;
        }
        let user = await getHackerLogin(req.headers['x-token']);
        if (typeof user !== 'number') {
            hacker.set('hackerUser', user);
            next();
        } else {
            if (user === -5) {
                res.json({"result": lang.auth_refresh_token_expire, "code": "-5", "is_login": "0"});
            } else if (user === 0) {
                res.json({"result": lang.auth_token_invalid, "code": "-1", "is_login": "-1"});
            } else if (user === -1) {
                res.json({"result": lang.auth_token_expire, "code": "-1", "is_login": "-1"});
            } else if (user === -2) {
                res.json({"result": lang.auth_account_is_not_verify, "code": "-2", "is_login": "-2"});
            } else if (user === -3) {
                res.json({"result": lang.auth_account_is_disabled, "code": "-3", "is_login": "-3"});
            }
        }
    } catch (e) {
        if (isSentry)
            Sentry.captureException(e);
        if (isDebug)
            res.status(500).json({"result": e.toString()});
        else
            res.status(500).json({"result": "Internal Server Error!"});
    }
};