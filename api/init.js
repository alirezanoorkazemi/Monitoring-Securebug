const { Model } = require("mongoose");

api = express();
api.disable('x-powered-by');

getUserLogin = async function (token) {
    try {
        let str = unToken(token);
        if (str !== "") {
            let data = str.split('#');
            if (data.length !== 4)
                return 0;

            if (!isObjectID(data[1]))
                return 0;
            else {
                let nowDate = new Date().getTime();
                if (nowDate > data[3]) {
                    return -1;//expire token
                }
                else {
                    let user_id = safeString(data[1]);
                    let row = await Models.UserModel.findOne({ "_id": user_id });
                    if (row) {
                        if (row['status'])
                            return row;
                        else
                            return -3;//user account is disabled
                    }
                    else
                        return 0;
                }
            }
        }
        else {
            return 0;
        }
    }
    catch (e) {
        return 0;
    }
};


isAuth = async function (req, res, next) {
    await check.header('x-token').trim().not().isEmpty()
        .withMessage({ "result": LangGlobal.token_is_empty_error, "code": -1, "is_login": -1 }).run(req);
    const errors = check.validationResult(req);
    if (!errors.isEmpty()) {
        res.json(errors.array()[0].msg);
    }
    let user = await getUserLogin(req.headers['x-token']);
    if (user === 0) {
        res.json({ "result": LangGlobal.token_is_invalid_error, "code": -2, "is_login": -2 });
    }
    else if (user === -1) {
        res.json({ "result": LangGlobal.token_is_expire_error, "code": -3, "is_login": -3 });
    }
    else if (user === -3) {
        res.json({ "result": LangGlobal.account_is_disabled_error, "code": -4, "is_login": -4 });
    }
    else {
        api.set('user', user);
        next();
    }
};