require('./../appConfig');
require('./../libs/core');
const accessControl = require('accesscontrol');
const ac = new accessControl();
company = express();
company.disable('x-powered-by');

getCompanyLogin = async function (token, check_refresh_token = true, check_verification = true, populate_fields = false) {
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
    let user;
    if (populate_fields) {
        user = await SchemaModels.CompanyUserModel.findOne({_id: user_id})
            .populate('company_country_id')
            .populate('invoice_address_country_id')
            .populate('credit_currency_id');
    } else {
        user = await SchemaModels.CompanyUserModel.findOne({_id: user_id});
    }
    if (!user) {
        return 0;
    }
    if (user.parent_user_id) {
        let parent = await SchemaModels.CompanyUserModel.findOne({_id: user.parent_user_id});
        if (parent) {
            const member_fields = getMemberFields();
            for (const item in parent) {
                if (member_fields.includes(item)) {
                    user[item] = parent[item];
                }
            }
        }
    }
    if (!check_verification) {
        return user;
    } else if (!user.admin_verify) {
        return -4;
    } else if (!user.is_verify) {
        return -2;//user account is not verify
    } else if (!user.status) {
        return -3;//user account is disabled
    } else {
        return user;
    }
};

isAuth = async function (req, res, next) {
    try {
        await check.header('x-token').trim().not().isEmpty()
            .withMessage({"result": "token is empty", "code": "-1", "is_login": "-1"}).run(req);
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
            return;
        }
        let user = await getCompanyLogin(req.headers['x-token']);
        if (typeof user !== 'number') {
            company.set('companyUser', user);
            next();
        } else {
            if (user === -5) {
                res.json({"result": "refresh token expire", "code": "-5", "is_login": "0"});
            } else if (user === 0) {
                res.json({"result": "token invalid", "code": "-1", "is_login": "-1"});
            } else if (user === -1) {
                res.json({"result": "token expire", "code": "-1", "is_login": "-1"});
            } else if (user === -2) {
                res.json({"result": "account is not verify", "code": "-2", "is_login": "-2"});
            } else if (user === -3) {
                res.json({"result": "account is disabled", "code": "-3", "is_login": "-3"});
            } else if (user === -4) {
                res.json({"result": "your account not verify by admin", "code": "-4", "is_login": "0"});
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


ac.grant(ROLES_NAME.OBSERVER)
    .readOwn(RESOURCE.REPORT)
    .readOwn(RESOURCE.INTEGRATION)
    .readOwn(RESOURCE.NOTIFICATION)
    .updateOwn(RESOURCE.NOTIFICATION)
    .readOwn(RESOURCE.USER_PAYMENT)
    .readOwn(RESOURCE.COMMENT)
    .readOwn(RESOURCE.PROGRAM)
    .readOwn(RESOURCE.USER)
    .readOwn(RESOURCE.HACKER)
    .readOwn(RESOURCE.INVITE_MEMBER)
    .readOwn(RESOURCE.USER_PROFILE)
    .readOwn(RESOURCE.USER_DETAILS)
    .updateOwn(RESOURCE.USER_PROFILE)
    .updateOwn(RESOURCE.PASSWORD)
    .grant(ROLES_NAME.VIEWER)
    .extend(ROLES_NAME.OBSERVER)
    .createOwn(RESOURCE.COMMENT)
    .grant(ROLES_NAME.ADMIN)
    .extend(ROLES_NAME.VIEWER)
    .updateOwn(RESOURCE.REPORT)
    .deleteOwn(RESOURCE.PROGRAM)
    .deleteOwn(RESOURCE.PROGRAM_INVITATION)
    .readOwn(RESOURCE.PROGRAM_STATISTICS)
    .updateOwn(RESOURCE.PROGRAM)
    .createOwn(RESOURCE.PROGRAM)
    .createOwn(RESOURCE.SUPPORT)
    .createOwn(RESOURCE.UPLOAD_AVATAR)
    .deleteOwn(RESOURCE.UPLOAD_AVATAR)
    .updateOwn(RESOURCE.USER_DETAILS)
    .createOwn(RESOURCE.INVITE_MEMBER)
    .deleteOwn(RESOURCE.INVITE_MEMBER)
    .updateOwn(RESOURCE.INVITE_MEMBER)
    .createOwn(RESOURCE.USER_PAYMENT)
    .deleteOwn(RESOURCE.USER_PAYMENT)
    .createOwn(RESOURCE.INTEGRATION)
    .updateOwn(RESOURCE.INTEGRATION)
    .deleteOwn(RESOURCE.INTEGRATION)
    .grant(ROLES_NAME.SUPPER_ADMIN)
    .extend(ROLES_NAME.ADMIN)
    .updateOwn(RESOURCE.MEMBER);


hasPermission = function (resource, action) {
    return async function (req, res, next) {
        try {
            let user = company.get('companyUser');
            const role = getCompanyUserAccessLevel(user.user_level_access ? user.user_level_access.toString() : "0");
            let permission;
            if (action === ACTIONS.READ) {
                permission = ac.can(role).readOwn(resource);
            } else if (action === ACTIONS.CREATE) {
                permission = ac.can(role).createOwn(resource);
            } else if (action === ACTIONS.UPDATE) {
                permission = ac.can(role).updateOwn(resource);
            } else if (action === ACTIONS.DELETE) {
                permission = ac.can(role).deleteOwn(resource);
            }
            if (permission.granted) {
                next();
            } else {
                res.json({"result": "You don't have permission for this action.", "code": "403", "is_login": "0"});
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
}







