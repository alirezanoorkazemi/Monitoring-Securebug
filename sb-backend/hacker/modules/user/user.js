require('../../init');
const lang = require('./lang/en');
const model = require('./user.model');
const fs = require('fs');
const path = require('path');
const router = express.Router();
let filecert = {"dir": "hacker/certificate", "field": "cert", "type": "file"};
let fileCVE = {"dir": "hacker/cve", "field": "cve", "type": "file"};
let fileTAX = {"dir": "hacker/tax", "field": "tax", "type": "file"};
let fileAvatar = {"dir": "avatars", "field": "avatar", "type": "image"};
let file_identity_passport = {"dir": "hacker/identity", "field": "identity_passport_file", "type": "file_image"};
let file_identity_card = {"dir": "hacker/identity", "field": "identity_card_file", "type": "file_image"};
let file_identity_driver = {"dir": "hacker/identity", "field": "identity_driver_file", "type": "file_image"};

let uploadDirs = [
    fileCVE, fileTAX, fileAvatar, file_identity_passport
    , file_identity_card, file_identity_driver, filecert
];


/**
 * @swagger
 * /hacker/user/register:
 *   post:
 *     tags:
 *       - hacker
 *     description: register hacker
 *     parameters:
 *       - name : username
 *         type : string
 *         in: formData
 *         required : true
 *         description : username
 *       - name : email
 *         type : string
 *         in: formData
 *         required : true
 *         description : email
 *       - name : password1
 *         type : string
 *         in: formData
 *         required : true
 *         description : password
 *       - name : password2
 *         type : string
 *         in: formData
 *         required : true
 *         description : confirm password
 *       - name : fist_name
 *         type : string
 *         in: formData
 *         required : true
 *         description : first name
 *       - name : last_name
 *         type : string
 *         in: formData
 *         required : true
 *         description : last name
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: |
 *               <pre>
 *               {"code":"0","result":"register success"}
 *               {"code":"1","result":"username is empty"}
 *               {"code":"2","result":"email is empty"}
 *               {"code":"3","result":"email is not valid"}
 *               {"code":"4","result":"password1(password) is empty"}
 *               {"code":"5","result":"password2(confirm password) is empty"}
 *               {"code":"6","result":"fist name is empty"}
 *               {"code":"7","result":"last name is empty"}
 *               {"code":"8","result":"confirm password is not matched"}
 *               {"code":"9","result":"email is exist"}
 *               {"code":"10","result":"username is exist"}
 *               {"code":"11","result":"fist_name must be less that 100 characters"}
 *               {"code":"12","result":"last_name must be less that 100 characters"}
 *               {"code":"13","result":"username must be between 5 and 21 characters"}
 *               {"code":"14","result":"Only use letters, numbers and '_'"}
 *               {"code":"15","result":"email must be between 5 and 65 characters"}
 *               {"code":"16","result":"password must be between 8 and 100 characters"}
 *               {"code":"17","result":"password must have at least one uppercase"}
 *               {"code":"18","result":"password must have at least one lowercase"}
 *               {"code":"19","result":"password must must have at least one number"}
 *               {"code":"20","result":"password must have at least one special character"}
 *               {"code":"21","result":"confirm password must be between 8 and 100 characters"}
 *               {"code":"22","result":"confirm password must have at least one uppercase"}
 *               {"code":"23","result":"confirm password must have at least one lowercase"}
 *               {"code":"24","result":"confirm password must must have at least one number"}
 *               {"code":"25","result":"confirm password must have at least one special character"}
 *               {"code":"26","result":"first_name must be only letter."}
 *               {"code":"27","result":"last_name must be only letter."}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/register', uploader.none(), [
    check.body('username').trim().not().isEmpty()
        .withMessage({"result": lang.register_username_is_empty, "code": "1"})
        .isLength({min: 5, max: 21}).withMessage({
        "result": "username must be between 5 and 21 characters",
        "code": "13"
    })
        .matches('^[a-zA-Z0-9_]*$').withMessage({"result": "Only use letters, numbers and '_'", "code": "14"}),
    check.body('email').trim().not().isEmpty()
        .withMessage({"result": lang.register_email_is_empty, "code": "2"})
        .isString().withMessage({"result": lang.register_email_is_not_valid, "code": "3"})
        .isEmail().withMessage({"result": lang.register_email_is_not_valid, "code": "3"})
        .isLength({min: 5, max: 65}).withMessage({"result": "email must be between 5 and 65 characters", "code": "15"}),
    check.body('password1').trim().not().isEmpty()
        .withMessage({"result": lang.register_password1_is_empty, "code": "4"})
        .isLength({min: 8, max: 100}).withMessage({
        "result": "password must be between 8 and 100 characters",
        "code": "16"
    })
        .matches('^(?=.*[A-Z])').withMessage({"result": "password must have at least one uppercase", "code": "17"})
        .matches('^(?=.*[a-z])').withMessage({"result": "password must have at least one lowercase", "code": "18"})
        .matches('^(?=.*\\d)').withMessage({"result": "password must must have at least one number", "code": "19"})
        .matches('^(?=.*[\\/\\\\|@$!%*,#_?~^.`:&\\-+=\"\'{}<>()\\[\\]])').withMessage({
        "result": "password must have at least one special character",
        "code": "20"
    }),
    check.body('password2').trim().not().isEmpty()
        .withMessage({"result": lang.register_password2_is_empty, "code": "5"})
        .isLength({min: 8, max: 100}).withMessage({
        "result": "confirm password must be between 8 and 100 characters",
        "code": "21"
    })
        .matches('^(?=.*[A-Z])').withMessage({
        "result": "confirm password must have at least one uppercase",
        "code": "22"
    })
        .matches('^(?=.*[a-z])').withMessage({
        "result": "confirm password must have at least one lowercase",
        "code": "23"
    })
        .matches('^(?=.*\\d)').withMessage({
        "result": "confirm password must must have at least one number",
        "code": "24"
    })
        .matches('^(?=.*[\\/\\\\|@$!%*,#_?~^.`:&\\-+=\"\'{}<>()\\[\\]])').withMessage({
        "result": "confirm password must have at least one special character",
        "code": "20"
    }),
    check.body('fist_name').trim().not().isEmpty()
        .withMessage({"result": lang.register_fist_name_is_empty, "code": "6"})
        .isLength({max: 65}).withMessage({"result": "fist_name must be less that 65 characters.", "code": "11"})
        .matches('^[a-zA-Z\\s]+$').withMessage({"result": "first_name must be only letter.", "code": "26"}),
    check.body('last_name').trim().not().isEmpty()
        .withMessage({"result": lang.register_last_name_is_empty, "code": "7"})
        .isLength({max: 40}).withMessage({"result": "last_name must be less that 40 characters.", "code": "12"})
        .matches('^[a-zA-Z\\s]+$').withMessage({"result": "last_name must be only letter.", "code": "27"})

], async (req, res) => {
    try {


        let username = safeString(req.body.username);
        username = username.toLowerCase();
        let email = safeString(req.body.email);
        email = email.toLowerCase();
        let password1 = safeString(req.body.password1);
        let password2 = safeString(req.body.password2);
        let fist_name = safeString(req.body.fist_name);
        let last_name = safeString(req.body.last_name);
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else if (password1 !== password2) {
            res.json({"result": lang.register_confirm_password_is_not_matched, "code": "8"});
        } else if (password1.trim().toLowerCase() === email.trim().toLowerCase()) {
            res.json({"result": "email and password are same", "code": "10"});
        } else {
            let checkEmail = await model.checkEmail(email);
            if (checkEmail > 0) {
                res.json({"result": lang.register_email_is_exist, "code": "9"});
                return;
            }
            let checkUsername = await model.checkUsername(username);
            if (checkUsername > 0) {
                res.json({"result": lang.register_username_is_exist, "code": "10"});
                return;
            }
            let resultRegister = await model.register(username, email, password2, fist_name, last_name);
            let url = `${AppConfig.FRONTEND_URL}user/register/verification?token=${resultRegister}`;
            const htmlTemplate = generateEmailTemplate("hacker_register",fist_name,{url},true);
            sendMail(email, "Verify your email and complete your registration", htmlTemplate);
            res.json({"result": lang.register_success, "code": "0"});
        }
    } catch (e) {
        if (isSentry)
            Sentry.captureException(e);
        if (isDebug)
            res.status(500).json({"result": e.toString()});
        else
            res.status(500).json({"result": "Internal Server Error!"});

    }

});

/**
 * @swagger
 * /hacker/user/verify:
 *   post:
 *     tags:
 *       - hacker
 *     description: verify hacker
 *     parameters:
 *       - name : code
 *         type : string
 *         in: formData
 *         required : true
 *         description : verify code
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: |
 *               <pre>
 *               {"code":"0","result":"verify success"}
 *               {"code":"1","result":"code is empty"}
 *               {"code":"2","result":"invalid code"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/verify', uploader.none(), [
    check.body('code').trim().not().isEmpty()
        .withMessage({"result": lang.verify_code_is_empty, "code": "1"}),
], async (req, res) => {
    try {
        let code = safeString(req.body.code);
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else {
            let currentUser = await model.getUserByVerifyCode(code);
            if (currentUser) {
                await model.updateVerifyUser(currentUser._id);
                let url = AppConfig.FRONTEND_URL;
                let htmlTemplate = generateEmailTemplate("hacker_verify_email",currentUser.fn,{url},true);
                sendMail(currentUser.email, "Welcome to SecureBug", htmlTemplate);
                res.json({"result": lang.verify_success, "code": "0"});
            } else {
                res.json({"result": lang.verify_invalid_code, "code": "2"});
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

});

/**
 * @swagger
 * /hacker/user/refresh-token:
 *   post:
 *     tags:
 *       - hacker
 *     description: refresh-token hacker
 *     parameters:
 *       - name : x-token
 *         type : string
 *         in: header
 *         required : true
 *         description : x-token
 *       - name : x-refresh-token
 *         type : string
 *         in: form data
 *         required : true
 *         description : x-refresh-token
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: |
 *               <pre>
 *               {"code":"3","result":"x-token is not valid"}
 *               {"code":"2","result":"x-token is empty"}
 *               {"code":"3","result":"x-refresh-token is not valid"}
 *               {"code":"2","result":"x-refresh-token is empty"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/refresh-token', uploader.none(), [
    check.header('x-token').trim().not().isEmpty()
        .withMessage({"result": "token is empty", "code": "1", "is_login": "0"}),
    check.body('x-refresh-token').trim().not().isEmpty()
        .withMessage({"result": "refresh-token is empty", "code": "2", "is_login": "0"})
], async (req, res) => {
    try {
        let refresh_token = safeString(req.body['x-refresh-token']);
        let token = safeString(req.headers['x-token']);
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else {
            let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            ip = ip.replace(/::ffff:/g, '');
            let user_agent = req.headers['user-agent'];
            const result = await model.refreshToken(token, refresh_token, user_agent, ip);
            if (result === 1) {
                return res.json({"result": "token is invalid", "code": "-1", "is_login": "0"});
            } else if (result === 2) {
                return res.json({"result": "refresh token is invalid", "code": "-1", "is_login": "0"});
            } else {
                return res.json({"result": result, "code": "0", "is_login": "0"});
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

});

/**
 * @swagger
 * /hacker/user/login:
 *   post:
 *     tags:
 *       - hacker
 *     description: login hacker
 *     parameters:
 *       - name : email
 *         type : string
 *         in: formData
 *         required : true
 *         description : email
 *       - name : password
 *         type : string
 *         in: formData
 *         required : true
 *         description : password
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: |
 *               <pre>
 *               {"code":"-2","result":"account is not verify"}
 *               {"code":"-3","result":"account is disabled"}
 *               {"code":"0","result":"login success","token":"hacker token",{hacker data object}}
 *               {"code":"1","result":"email is empty"}
 *               {"code":"2","result":"email is not valid"}
 *               {"code":"3","result":"password is empty"}
 *               {"code":"4","result":"email or password is not correct"}
 *               {"code":"5","result":"email must be between 5 and 65 characters"}
 *               {"code":"6","result":"password must be between 3 and 100 characters"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/login', uploader.none(), [
    check.body('email').trim().not().isEmpty()
        .withMessage({"result": lang.login_email_is_empty, "code": "1"})
        .isString().withMessage({"result": lang.login_email_is_not_valid, "code": "2"})
        .isEmail().withMessage({"result": lang.login_email_is_not_valid, "code": "2"})
        .isLength({min: 5, max: 65}).withMessage({"result": "email must be between 5 and 65 characters", "code": "5"}),
    check.body('password').trim().not().isEmpty()
        .withMessage({"result": lang.login_password_is_empty, "code": "3"})
        .isLength({min: 3, max: 100}).withMessage({
        "result": "password must be between 3 and 100 characters",
        "code": "6"
    }),
], async (req, res) => {
    try {
        let email = safeString(req.body.email);
        email = email.toLowerCase();
        let password = safeString(req.body.password);
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else {
            let captchaResult = await googleRecaptchaCheck(req);
            if (captchaResult){
                let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
                ip = ip.replace(/::ffff:/g, '');
                let user_agent = req.headers['user-agent'];
                let resultLogin = await model.login(email, password);
                if (resultLogin === -1) {
                    return res.json({"result": lang.login_email_or_password_is_not_correct, "code": "4"});
                } else if (resultLogin === -2) {
                    return res.json({"result": lang.login_account_is_not_verify, "code": "2"});
                } else if (resultLogin === -3) {
                    return res.json({"result": lang.login_account_is_disabled, "code": "3"});
                } else {
                    let userData = await model.getDataData(resultLogin);
                    if (userData.google_auth) {
                        return res.json({"result": "google auth required", "code": "0", "google_auth": true});
                    } else {
                        const tokens = await createTokens(resultLogin['_id'], null, ip, user_agent);
                        userData['token'] = tokens.token;
                        userData['refresh_token'] = tokens.refresh_token;
                        userData['result'] = lang.login_success;
                        userData['code'] = "0";
                        return res.json(userData);
                    }
                }

            } else {
                res.json({"result": "Failed captcha verification", "code": "7"});
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

});


/**
 * @swagger
 * /hacker/user/login_with_google_authenticator:
 *   post:
 *     tags:
 *       - hacker
 *     description: login with google authenticator
 *     parameters:
 *       - name : email
 *         type : string
 *         in: formData
 *         required : true
 *         description : email
 *       - name : password
 *         type : string
 *         in: formData
 *         required : true
 *         description : password
 *       - name : code
 *         type : string
 *         in: formData
 *         required : true
 *         description : code
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: |
 *               <pre>
 *               {"code":"-2","result":"account is not verify"}
 *               {"code":"-3","result":"account is disabled"}
 *               {"code":"0","result":"login success","token":"hacker token",{hacker data object}}
 *               {"code":"1","result":"email is empty"}
 *               {"code":"2","result":"email is not valid"}
 *               {"code":"3","result":"password is empty"}
 *               {"code":"4","result":"email or password is not correct"}
 *               {"code":"5","result":"email must be less that 65 characters."}
 *               {"code":"6","result":"password must be between 3 and 100 characters"}
 *               {"code":"7","result":"code is empty"}
 *               {"code":"8","result":"user not enable google 2fa"}
 *               {"code":"9","result":"code is invalid"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/login_with_google_authenticator', uploader.none(), [
    check.body('email').trim().not().isEmpty()
        .withMessage({"result": lang.login_email_is_empty, "code": "1"})
        .isString().withMessage({"result": lang.login_email_is_not_valid, "code": "2"})
        .isEmail().withMessage({"result": lang.login_email_is_not_valid, "code": "2"})
        .isLength({min: 5, max: 65}).withMessage({"result": "email must be between 5 and 65 characters", "code": "5"}),
    check.body('password').trim().not().isEmpty()
        .withMessage({"result": lang.login_password_is_empty, "code": "3"})
        .isLength({min: 3, max: 100}).withMessage({
        "result": "password must be between 3 and 100 characters",
        "code": "6"
    }),
    check.body('code').trim().not().isEmpty()
        .withMessage({"result": "code is empty", "code": "7"})
], async (req, res) => {
    try {
        let email = safeString(req.body.email);
        email = email.toLowerCase();
        let password = safeString(req.body.password);
        let code = safeString(req.body.code);
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else {
            let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            ip = ip.replace(/::ffff:/g, '');
            let user_agent = req.headers['user-agent'];
            let resultLogin = await model.login(email, password);
            if (resultLogin === -1) {
               return res.json({"result": lang.login_email_or_password_is_not_correct, "code": "4"});
            } else if (resultLogin === -2) {
                return   res.json({"result": lang.login_account_is_not_verify, "code": "2"});
            } else if (resultLogin === -3) {
                return  res.json({"result": lang.login_account_is_disabled, "code": "3"});
            } else {
                let userData = await model.getDataData(resultLogin);
                if (!userData.google_auth) {
                    return  res.json({"result": "google auth not enable can not use this login method", "code": "8"});
                } else {
                    let googleKey = decryptionString(resultLogin.google_towfa_secret_key).split(":");

                    let checkOpt = google2faCheck(googleKey[0], code);
                    if (checkOpt) {
                        const tokens = await createTokens(resultLogin['_id'], null, ip, user_agent);
                        userData['token'] = tokens.token;
                        userData['refresh_token'] = tokens.refresh_token;
                        userData['result'] = lang.login_success;
                        userData['code'] = "0";
                        return  res.json(userData);
                    } else {
                        return  res.json({"result": "code is invalid", "code": "9"});
                    }
                }
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

});

/**
 * @swagger
 * /hacker/user/profile:
 *   get:
 *     tags:
 *       - hacker
 *     description: get hacker profile
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: |
 *               <pre>
 *               {"code":"-1","result":"token is empty","is_login":"-1"}
 *               {"code":"-1","result":"token invalid","is_login":"-1"}
 *               {"code":"-1","result":"token expire","is_login":"-1"}
 *               {"code":"-2","result":"account is not verify","is_login":"-2"}
 *               {"code":"-3","result":"account is disabled","is_login":"-3"}
 *               {"code":"0","result":"hacker data","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.get('/profile', isAuth, uploader.none(), async (req, res) => {
    try {
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else {
            let user = hacker.get('hackerUser');
            let userData = await model.getDataData(user);
            res.json({"result": userData, "code": "0", "is_login": "0"});
        }
    } catch (e) {
        if (isSentry)
            Sentry.captureException(e);
        if (isDebug)
            res.status(500).json({"result": e.toString()});
        else
            res.status(500).json({"result": "Internal Server Error!"});
    }

});

/**
 * @swagger
 * /hacker/user/resend_verify:
 *   post:
 *     tags:
 *       - hacker
 *     description: resend verify hacker
 *     parameters:
 *       - name : email
 *         type : string
 *         in: formData
 *         required : true
 *         description : email
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: |
 *               <pre>
 *               {"code":"0","result":"send new active code"}
 *               {"code":"1","result":"email is empty"}
 *               {"code":"2","result":"email is not valid"}
 *               {"code":"3","result":"email not found or account is verified"}
 *               {"code":"4","result":"email must be between 5 and 65 characters"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/resend_verify', uploader.none(), [
    check.body('email').trim().not().isEmpty()
        .withMessage({"result": lang.resend_verify_email_is_empty, "code": "1"})
        .isString().withMessage({"result": lang.resend_verify_email_is_not_valid, "code": "2"})
        .isEmail().withMessage({"result": lang.resend_verify_email_is_not_valid, "code": "2"})
        .isLength({min: 5, max: 65}).withMessage({"result": "email must be between 5 and 65 characters", "code": "4"})
], async (req, res) => {
    try {
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else {
            let email = safeString(req.body.email);
            email = email.toLowerCase();
            let emailIsFound = await model.checkEmailForResend(email);
            if (emailIsFound) {
                let newCode = await model.updateNewVerifyCode(emailIsFound._id);
                let url = `${AppConfig.FRONTEND_URL}user/register/verification?token=${newCode}`;
                let htmlTemplate = generateEmailTemplate("hacker_register",emailIsFound.fn,{url},true);
                //send email verification
                let sendMailResult = await sendMail(email, lang.resend_verify_email_subject, htmlTemplate);
                res.json({"result": lang.resend_verify_success, "code": "0"});
            } else {
                res.json({"result": lang.resend_verify_failed, "code": "3"});
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

});

/**
 * @swagger
 * /hacker/user/forgot_password:
 *   post:
 *     tags:
 *       - hacker
 *     description: forgot password hacker
 *     parameters:
 *       - name : email
 *         type : string
 *         in: formData
 *         required : true
 *         description : email
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: |
 *               <pre>
 *               {"code":"0","result":"send new password"}
 *               {"code":"1","result":"email is empty"}
 *               {"code":"2","result":"email is not valid"}
 *               {"code":"3","result":"email not found"}
 *               {"code":"4","result":"email must be between 5 and 65 characters"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/forgot_password', uploader.none(), [
    check.body('email').trim().not().isEmpty()
        .withMessage({"result": lang.forgot_password_email_is_empty, "code": "1"})
        .isString().withMessage({"result": lang.forgot_password_email_is_not_valid, "code": "2"})
        .isEmail().withMessage({"result": lang.forgot_password_email_is_not_valid, "code": "2"})
        .isLength({min: 5, max: 65}).withMessage({"result": "email must be between 5 and 65 characters", "code": "4"})
], async (req, res) => {
    try {
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else {
            let email = safeString(req.body.email);
            email = email.toLowerCase();
            let emailIsFound = await model.checkEmailForReset(email);
            if (emailIsFound) {
                let newCode = await model.updateNewResetCode(emailIsFound._id);
                //send email reset password
                let url = `${AppConfig.FRONTEND_URL}user/recovery?token=${newCode}`;
                let url2 = AppConfig.FRONTEND_URL;
                let htmlTemplate = generateEmailTemplate("forget_password",emailIsFound.fn,{url, url2},true);
                let sendMailResult = await sendMail(email, lang.forgot_password_email_subject, htmlTemplate);
                res.json({"result": "If we find a match. we will send to you reset password code", "code": "0"});
            } else {
                res.json({"result": "If we find a match. we will send to you reset password code", "code": "0"});
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

});


/**
 * @swagger
 * /hacker/user/reset_password:
 *   post:
 *     tags:
 *       - hacker
 *     description: reset password hacker
 *     parameters:
 *       - name : code
 *         type : string
 *         in: formData
 *         required : true
 *         description : code
 *       - name : password1
 *         type : string
 *         in: formData
 *         required : true
 *         description : new password
 *       - name : password2
 *         type : string
 *         in: formData
 *         required : true
 *         description : confirm new password
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: |
 *               <pre>
 *               {"code":"0","result":"change password ok"}
 *               {"code":"1","result":"code is empty"}
 *               {"code":"2","result":"new password is empty"}
 *               {"code":"3","result":"confirm new password is empty"}
 *               {"code":"4","result":"confirm new password is not matched"}
 *               {"code":"5","result":"code not found"}
 *               {"code":"6","result":"new password must be between 8 and 100 characters"}
 *               {"code":"7","result":"new password must have at least one uppercase"}
 *               {"code":"8","result":"new password must have at least one lowercase"}
 *               {"code":"9","result":"new password must must have at least one number"}
 *               {"code":"10","result":"new password must have at least one special character"}
 *               {"code":"11","result":"confirm new  password must be between 8 and 100 characters"}
 *               {"code":"12","result":"confirm new  password must have at least one uppercase"}
 *               {"code":"13","result":"confirm new  password must have at least one lowercase"}
 *               {"code":"14","result":"confirm new  password must must have at least one number"}
 *               {"code":"15","result":"confirm new password must have at least one special character"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/reset_password', uploader.none(), [
    check.body('code').trim().not().isEmpty()
        .withMessage({"result": lang.reset_password_code_is_empty, "code": "1"}),
    check.body('password1').trim().not().isEmpty()
        .withMessage({"result": lang.reset_password_new_password_is_empty, "code": "2"})
        .isLength({min: 8, max: 100}).withMessage({
        "result": "new password must be between 8 and 100 characters",
        "code": "6"
    })
        .matches('^(?=.*[A-Z])').withMessage({"result": "new password must have at least one uppercase", "code": "7"})
        .matches('^(?=.*[a-z])').withMessage({"result": "new password must have at least one lowercase", "code": "8"})
        .matches('^(?=.*\\d)').withMessage({"result": "new password must must have at least one number", "code": "9"})
        .matches('^(?=.*[\\/\\\\|@$!%*,#_?~^.`:&\\-+=\"\'{}<>()\\[\\]])').withMessage({
        "result": "new password must have at least one special character",
        "code": "10"
    }),
    check.body('password2').trim().not().isEmpty()
        .withMessage({"result": lang.reset_password_confirm_new_password_is_empty, "code": "3"})
        .isLength({
            min: 8,
            max: 100
        }).withMessage({"result": "confirm new password must be between 8 and 100 characters", "code": "11"})
        .matches('^(?=.*[A-Z])').withMessage({
        "result": "confirm new password must have at least one uppercase",
        "code": "12"
    })
        .matches('^(?=.*[a-z])').withMessage({
        "result": "confirm new password must have at least one lowercase",
        "code": "13"
    })
        .matches('^(?=.*\\d)').withMessage({
        "result": "confirm new password must must have at least one number",
        "code": "14"
    })
        .matches('^(?=.*[\\/\\\\|@$!%*,#_?~^.`:&\\-+=\"\'{}<>()\\[\\]])').withMessage({
        "result": "confirm new password must have at least one special character",
        "code": "25"
    }),
], async (req, res) => {
    try {
        let password1 = safeString(req.body.password1);
        let password2 = safeString(req.body.password2);
        let code = safeString(req.body.code);
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else if (password1 !== password2) {
            res.json({"result": lang.reset_password_confirm_new_password_is_not_matched, "code": "4"});
        } else {
            let userFound = await model.getUserByResetCode(makeKey(code));
            if (userFound) {
                let resultSave = await model.updateNewPassword(userFound._id, password2);
                //remove all token
                let allToken = await ftSearch('sbloginIndex', `@user_id:${userFound._id}`);
                for (let row of allToken) {
                    await ioredis.del(row.key);
                }
                res.json({"result": lang.reset_password_success, "code": "0"});
            } else {
                res.json({"result": lang.reset_password_failed, "code": "5"});
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

});

/**
 * @swagger
 * /hacker/user/save_profile:
 *   post:
 *     tags:
 *       - hacker
 *     description: save hacker profile
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : username
 *         type : string
 *         in: formData
 *         required : true
 *         description : username
 *       - name : first_name
 *         type : string
 *         in: formData
 *         required : true
 *         description : first_name
 *       - name : last_name
 *         type : string
 *         in: formData
 *         required : true
 *         description : last_name
 *       - name : about
 *         type : string
 *         in: formData
 *         description : about
 *       - name : competency_profile
 *         type : string
 *         enum: [0,1,2,3]
 *         in: formData
 *         required : true
 *         description : |
 *              <pre>
 *               0 -> None
 *               1 -> ThreatHunter
 *               2 -> BugHunter
 *              </pre>
 *
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: |
 *               <pre>
 *               {"code":"-1","result":"token is empty","is_login":"-1"}
 *               {"code":"-1","result":"token invalid","is_login":"-1"}
 *               {"code":"-1","result":"token expire","is_login":"-1"}
 *               {"code":"-2","result":"account is not verify","is_login":"-2"}
 *               {"code":"-3","result":"account is disabled","is_login":"-3"}
 *               {"code":"0","result":"saved","is_login":"0"}
 *               {"code":"1","result":"username is empty","is_login":"0"}
 *               {"code":"2","result":"first_name is empty","is_login":"0"}
 *               {"code":"3","result":"last_name is empty","is_login":"0"}
 *               {"code":"4","result":"competency_profile is empty","is_login":"0"}
 *               {"code":"5","result":"competency_profile is not valid","is_login":"0"}
 *               {"code":"6","result":"username is exists","is_login":"0"}
 *               {"code":"7","result":"first_name must be less that 65 characters.","is_login":"0"}
 *               {"code":"8","result":"last_name must be less that 40 characters.","is_login":"0"}
 *               {"code":"9","result":"username must be between 5 and 21 characters","is_login":"0"}
 *               {"code":"10","result":"Only use letters, numbers and '_'","is_login":"0"}
 *               {"code":"11","result":"Github must be less that 120 characters.","is_login":"0"}
 *               {"code":"12","result":"Please Enter Valid Link for Github.","is_login":"0"}
 *               {"code":"13","result":"twitter must be less that 120 characters.","is_login":"0"}
 *               {"code":"14","result":"Please Enter Valid Link for twitter.","is_login":"0"}
 *               {"code":"15","result":"linkedin must be less that 120 characters.","is_login":"0"}
 *               {"code":"16","result":"Please Enter Valid Link for linkedin.","is_login":"0"}
 *               {"code":"17","result":"website_url must be less that 75 characters.","is_login":"0"}
 *               {"code":"18","result":"user not verified","is_login":"0"}
 *               {"code":"19","result":"user is disabled","is_login":"0"}
 *               {"code":"20","result":"user is not valid","is_login":"0"}
 *               {"code":"21","result":"first_name must be only letter.","is_login":"0"}
 *               {"code":"22","result":"last_name must be only letter.","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/save_profile', isAuth, uploader.none(), [
    check.body('username').trim().not().isEmpty()
        .withMessage({"result": lang.save_profile_username_is_empty, "code": "1", "is_login": "0"})
        .isLength({min: 5, max: 21}).withMessage({
        "result": "username must be between 5 and 21 characters",
        "code": "9"
    })
        .matches('^[a-zA-Z0-9_]*$').withMessage({"result": "Only use letters, numbers and '_'", "code": "10"}),
    check.body('first_name').trim().not().isEmpty()
        .withMessage({"result": lang.save_profile_first_name_is_empty, "code": "2", "is_login": "0"})
        .isLength({max: 65}).withMessage({"result": "first_name must be less that 65 characters.", "code": "7"})
        .matches('^[a-zA-ZäåöÄÅÖ\\s]+$').withMessage({"result": "first_name must be only letter.", "code": "21"}),
    check.body('last_name').trim().not().isEmpty()
        .withMessage({"result": lang.save_profile_last_name_is_empty, "code": "3", "is_login": "0"})
        .isLength({max: 40}).withMessage({"result": "last_name must be less that 40 characters.", "code": "8"})
        .matches('^[a-zA-ZäåöÄÅÖ\\s]+$').withMessage({"result": "last_name must be only letter.", "code": "22"}),
    check.body('competency_profile').trim().not().isEmpty()
        .withMessage({"result": lang.save_profile_competency_profile_is_empty, "code": "4", "is_login": "0"}),
    check.body('github_url')
        .isLength({max: 120}).withMessage({"result": "Github must be less that 120 characters.", "code": "11"})
        .matches('^http(?:s)?:\\/\\/(?:www\\.)?github\\.com\\/([a-zA-Z0-9_]+)').optional({checkFalsy: true})
        .withMessage({"result": "Please Enter Valid Link for Github", "code": "12"}),
    check.body('twitter_url')
        .isLength({max: 120}).withMessage({"result": "twitter must be less that 120 characters.", "code": "13"})
        .matches('^http(?:s)?:\\/\\/(?:www\\.)?twitter\\.com\\/([a-zA-Z0-9_]+)').optional({checkFalsy: true})
        .withMessage({"result": "Please Enter Valid Link for twitter", "code": "14"}),
    check.body('linkedin_url')
        .isLength({max: 120}).withMessage({"result": "linkedin must be less that 120 characters.", "code": "15"})
        .matches('^https://[a-z]{2,3}[.]linkedin[.]com/.*$').optional({checkFalsy: true})
        .withMessage({"result": "Please Enter Valid Link for linkedin", "code": "16"}),
    check.body('website_url')
        .isLength({max: 75}).withMessage({"result": "website_url must be less that 75 characters.", "code": "17"})
], async (req, res) => {
    try {
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else {
            let user = hacker.get('hackerUser');

            let competency_profile = toNumber(req.body.competency_profile);
            if (competency_profile <= 0 || competency_profile > 3) {
                res.json({"result": lang.save_profile_competency_profile_is_not_valid, "code": "5", "is_login": "0"});
                return;
            }
            let username = safeString(req.body.username);
            username = username.toLowerCase();
            let fn = safeString(req.body.first_name);
            let ln = safeString(req.body.last_name);
            let profile_visibility = safeString(req.body.profile_visibility);
            profile_visibility = (profile_visibility === "true") ? true : false;
            let about = cleanXSS(req.body.about);
            about = safeString(about);
            let github_url = safeString(req.body.github_url);
            let twitter_url = safeString(req.body.twitter_url);
            let linkedin_url = safeString(req.body.linkedin_url);
            let website_url = safeString(req.body.website_url);
            let resultSave = await model.updateProfileUrlData(user, profile_visibility
                , about, github_url, twitter_url, linkedin_url
                , website_url, fn, ln, username, competency_profile, user.tag);
            if (resultSave === -1) {
                return res.json({"result": lang.save_profile_username_is_exists, "code": "6", "is_login": "0"});
            } else if (resultSave === 1) {
                return res.json({"result": "user is not valid", "code": "6", "is_login": "0"});
            } else if (resultSave === 2) {
                return res.json({"result": "you can not change your username", "code": "6", "is_login": "0"});
            } else {
                res.json({"result": lang.save_profile_success, "code": "0", "is_login": "0"});
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

});

/**
 * @swagger
 * /hacker/user/disabled_account:
 *   post:
 *     tags:
 *       - hacker
 *     description: disable account hacker
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : current_password
 *         type : string
 *         in: formData
 *         required : true
 *         description : current password
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: |
 *               <pre>
 *               {"code":"-1","result":"token is empty","is_login":"-1"}
 *               {"code":"-1","result":"token invalid","is_login":"-1"}
 *               {"code":"-1","result":"token expire","is_login":"-1"}
 *               {"code":"-2","result":"account is not verify","is_login":"-2"}
 *               {"code":"-3","result":"account is disabled","is_login":"-3"}
 *               {"code":"0","result":"ok","is_login":"0","account_is_disable":bool}
 *               {"code":"1","result":"current password is empty","is_login":"0"}
 *               {"code":"2","result":"current password is not valid","is_login":"0"}
 *               {"code":"3","result":"current password must be between 8 and 100 characters","is_login":"0"}
 *               {"code":"4","result":"current password must have at least one uppercase","is_login":"0"}
 *               {"code":"5","result":"current password must have at least one lowercase":"0"}
 *               {"code":"6","result":"current password must have at least one number","is_login":"0"}
 *               {"code":"7","result":"current password must have at least one special character","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/disabled_account', isAuth, uploader.none(), [
    check.body('current_password').optional({checkFalsy: true})
        .isLength({min: 8, max: 100}).withMessage({
        "result": "current password must be between 8 and 100 characters",
        "code": "3"
    })
        .matches('^(?=.*[A-Z])').withMessage({
        "result": "current password must have at least one uppercase",
        "code": "4"
    })
        .matches('^(?=.*[a-z])').withMessage({
        "result": "current password must have at least one lowercase",
        "code": "5"
    })
        .matches('^(?=.*\\d)').withMessage({
        "result": "current password must must have at least one number",
        "code": "6"
    })
        .matches('^(?=.*[\\/\\\\|@$!%*,#_?~^.`:&\\-+=\"\'{}<>()\\[\\]])').withMessage({
        "result": "current password must have at least one special character",
        "code": "7"
    }),
], async (req, res) => {
    try {
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else {
            let user = hacker.get('hackerUser');
            if (!user.account_is_disable) {
                let current_password = safeString(req.body.current_password);
                if (current_password === "") {
                    res.json({"result": lang.disabled_account_current_password_is_empty, "code": "1", "is_login": "0"});
                    return;
                }
                if (user.password === makeHash(current_password)) {
                    let resultSave = await model.disabledAccount(user._id, true);
                    let allToken = await ftSearch('sbloginIndex', `@user_id:${user._id}`);
                    for (let row of allToken) {
                        await ioredis.del(row.key);
                    }
                    res.json({
                        "result": lang.disabled_account_success,
                        "account_is_disable": true,
                        "code": "0",
                        "is_login": "0"
                    });
                } else {
                    res.json({
                        "result": lang.disabled_account_current_password_is_not_valid,
                        "code": "2",
                        "is_login": "0"
                    });
                }
            } else {
                let resultSave = await model.disabledAccount(user._id, false);
                res.json({
                    "result": lang.disabled_account_success,
                    "account_is_disable": false,
                    "code": "0",
                    "is_login": "0"
                });
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

});

/**
 * @swagger
 * /hacker/user/change_password:
 *   post:
 *     tags:
 *       - hacker
 *     description: change password hacker
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : current_password
 *         type : string
 *         in: formData
 *         required : true
 *         description : current password
 *       - name : new_password
 *         type : string
 *         in: formData
 *         required : true
 *         description : new password
 *       - name : confirm_password
 *         type : string
 *         in: formData
 *         required : true
 *         description : confirm new password
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: |
 *               <pre>
 *               {"code":"-1","result":"token is empty","is_login":"-1"}
 *               {"code":"-1","result":"token invalid","is_login":"-1"}
 *               {"code":"-1","result":"token expire","is_login":"-1"}
 *               {"code":"-2","result":"account is not verify","is_login":"-2"}
 *               {"code":"-3","result":"account is disabled","is_login":"-3"}
 *               {"code":"0","result":"saved","is_login":"0"}
 *               {"code":"1","result":"current_password is empty","is_login":"0"}
 *               {"code":"2","result":"new_password is empty","is_login":"0"}
 *               {"code":"3","result":"confirm new password is empty","is_login":"0"}
 *               {"code":"4","result":"confirm new password is not match","is_login":"0"}
 *               {"code":"5","result":"current password is not correct","is_login":"0"}
 *               {"code":"6","result":"current password must be more than 3 characters","is_login":"0"}
 *               {"code":"7","result":"new password must be between 8 and 100 characters","is_login":"0"}
 *               {"code":"8","result":"new password must have at least one uppercase","is_login":"0"}
 *               {"code":"9","result":"new password must have at least one lowercase","is_login":"0"}
 *               {"code":"10","result":"new password must have at least one number","is_login":"0"}
 *               {"code":"11","result":"new password must have at least one special character","is_login":"0"}
 *               {"code":"12","result":"confirm password must be between 8 and 100 characters","is_login":"0"}
 *               {"code":"13","result":"confirm password must have at least one uppercase","is_login":"0"}
 *               {"code":"14","result":"confirm password must have at least one lowercase","is_login":"0"}
 *               {"code":"15","result":"confirm password must have at least one number","is_login":"0"}
 *               {"code":"16","result":"confirm password must have at least one special character","is_login":"0"}
 *               {"code":"17","result":"user is not verified","is_login":"0"}
 *               {"code":"18","result":"user is disabled","is_login":"0"}
 *               {"code":"19","result":"user is not valid","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/change_password', isAuth, uploader.none(), [
    check.body('current_password').trim().not().isEmpty()
        .withMessage({"result": lang.change_password_current_password_is_empty, "code": "1", "is_login": "0"})
        .isLength({min: 8, max: 100}).withMessage({
        "result": "current password must be more than 3 characters",
        "code": "6"
    }),
    check.body('new_password').trim().not().isEmpty()
        .withMessage({"result": lang.change_password_new_password_is_empty, "code": "2", "is_login": "0"})
        .isLength({min: 8, max: 100}).withMessage({
        "result": "new password must be between 8 and 100 characters",
        "code": "7"
    })
        .matches('^(?=.*[A-Z])').withMessage({"result": "new password must have at least one uppercase", "code": "8"})
        .matches('^(?=.*[a-z])').withMessage({"result": "new password must have at least one lowercase", "code": "9"})
        .matches('^(?=.*\\d)').withMessage({"result": "new password must must have at least one number", "code": "10"})
        .matches('^(?=.*[\\/\\\\|@$!%*,#_?~^.`:&\\-+=\"\'{}<>()\\[\\]])').withMessage({
        "result": "new password must have at least one special character",
        "code": "11"
    }),
    check.body('confirm_password').trim().not().isEmpty()
        .withMessage({"result": lang.change_password_confirm_new_password_is_empty, "code": "3", "is_login": "0"})
        .isLength({min: 8, max: 100}).withMessage({
        "result": "confirm password must be between 8 and 100 characters",
        "code": "12"
    })
        .matches('^(?=.*[A-Z])').withMessage({
        "result": "confirm password must have at least one uppercase",
        "code": "13"
    })
        .matches('^(?=.*[a-z])').withMessage({
        "result": "confirm password must have at least one lowercase",
        "code": "14"
    })
        .matches('^(?=.*\\d)').withMessage({
        "result": "confirm password must must have at least one number",
        "code": "15"
    })
        .matches('^(?=.*[\\/\\\\|@$!%*,#_?~^.`:&\\-+=\"\'{}<>()\\[\\]])').withMessage({
        "result": "confirm password must have at least one special character",
        "code": "16"
    })
], async (req, res) => {
    try {
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else {
            let user = hacker.get('hackerUser');

            let current_password = safeString(req.body.current_password);
            let new_password = safeString(req.body.new_password);
            let confirm_password = safeString(req.body.confirm_password);
            if (user.password === makeHash(current_password)) {
                if (new_password === confirm_password) {
                    let resultSave = await model.updateNewPassword(user._id, confirm_password);
                    if (resultSave === 1) {
                        return res.json({"result": "user is not valid", "code": "2", "is_login": "0"});
                    }
                    //remove all token
                    let allToken = await ftSearch('sbloginIndex', `@user_id:${user._id}`);
                    for (let row of allToken) {
                        await ioredis.del(row.key);
                    }
                    res.json({"result": lang.change_password_success, "code": "0", "is_login": "0"});
                } else {
                    res.json({
                        "result": lang.change_password_confirm_new_password_is_not_match,
                        "code": "4",
                        "is_login": "0"
                    });
                }
            } else {
                res.json({
                    "result": lang.change_password_current_password_is_not_correct,
                    "code": "5",
                    "is_login": "0"
                });
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

});

/**
 * @swagger
 * /hacker/user/save_skills:
 *   post:
 *     tags:
 *       - hacker
 *     description: save skills hacker
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : data
 *         type : object
 *         in: formData
 *         required : true
 *         description : |
 *          <pre>[{"skills_id":"1","proficiency":"1"},{"skills_id":"2","proficiency":"3"}]</pre>
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: |
 *               <pre>
 *               {"code":"-1","result":"token is empty","is_login":"-1"}
 *               {"code":"-1","result":"token invalid","is_login":"-1"}
 *               {"code":"-1","result":"token expire","is_login":"-1"}
 *               {"code":"-2","result":"account is not verify","is_login":"-2"}
 *               {"code":"-3","result":"account is disabled","is_login":"-3"}
 *               {"code":"0","result":"ok","is_login":"0","skills":[selected_skills]}
 *               {"code":"1","result":"not send data","is_login":"0"}
 *               {"code":"2","result":"user is not verified","is_login":"0"}
 *               {"code":"3","result":"user is disabled","is_login":"0"}
 *               {"code":"4","result":"user is not valid","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/save_skills', isAuth, uploader.none(), async (req, res) => {
    try {
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else {

            let user = hacker.get('hackerUser');

            let data = req.body;
            if (checkKey(data, 'data')) {

                var rows = data['data'];
                var dataSkills = [];

                for (let row of rows) {
                    if (checkKey(row, 'skills_id') && checkKey(row, 'proficiency')) {
                        var proficiency = toNumber(row.proficiency);
                        var skills_id = safeString(row.skills_id);
                        var skills = await model.getSkills(skills_id);

                        if (skills > 0) {
                            if (proficiency > 0 && proficiency < 4)
                                dataSkills.push({"skills_id": skills_id, "proficiency": proficiency});
                        }
                    }
                }
                let result = await model.saveSkills(user._id, dataSkills);
                if (result === 1) {
                    return res.json({"result": "user is not valid", "code": "2", "is_login": "0"});
                }
                let hacker_skills = await model.getSkillsList(user._id);
                res.json({"result": lang.save_skills_success, "code": "0", "skills": hacker_skills, "is_login": "0"});
            } else {
                res.json({"result": lang.save_skills_failed, "code": "1", "is_login": "0"});
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

});

/**
 * @swagger
 * /hacker/user/list_skills:
 *   get:
 *     tags:
 *       - hacker
 *     description: get skills hacker
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: |
 *               <pre>
 *               {"code":"-1","result":"token is empty","is_login":"-1"}
 *               {"code":"-1","result":"token invalid","is_login":"-1"}
 *               {"code":"-1","result":"token expire","is_login":"-1"}
 *               {"code":"-2","result":"account is not verify","is_login":"-2"}
 *               {"code":"-3","result":"account is disabled","is_login":"-3"}
 *               {"code":"0","hacker_skills":[selected_skills],"is_login":"0","skills":[skills]}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.get('/list_skills', isAuth, uploader.none(), async (req, res) => {
    try {
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else {
            let user = hacker.get('hackerUser');
            let hacker_skills = await model.getSkillsList(user._id);
            let skillsCache = await getCache('skills');
            let allSkills = [];
            if (skillsCache) {
                allSkills = skillsCache;
            } else {
                let skills = await model.getListSkills();
                let skillsCacheResult = await setCache('skills', skills);
                allSkills = skills;
            }
            res.json({"hacker_skills": hacker_skills.skills, "skills": allSkills, "is_login": "0"});
        }
    } catch (e) {
        if (isSentry)
            Sentry.captureException(e);
        if (isDebug)
            res.status(500).json({"result": e.toString()});
        else
            res.status(500).json({"result": "Internal Server Error!"});
    }

});

/**
 * @swagger
 * /hacker/user/token_isvalid:
 *   get:
 *     tags:
 *       - hacker
 *     description: get hacker token is valid
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: |
 *               <pre>
 *               {"code":"-1","result":"token is empty","is_login":"-1"}
 *               {"code":"-1","result":"token invalid","is_login":"-1"}
 *               {"code":"-1","result":"token expire","is_login":"-1"}
 *               {"code":"-2","result":"account is not verify","is_login":"-2"}
 *               {"code":"-3","result":"account is disabled","is_login":"-3"}
 *               {"code":"0","result":{hacker_data},"is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.get('/token_isvalid', uploader.none(), async (req, res) => {
    try {
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else {
            let user = await getHackerLogin(req.headers['x-token'], false, true, true);
            if (isNumber(user)) {
                return res.json({"result": "token is invalid", "code": "-1", "is_login": "0"});
            }
            let userData = await model.getDataData(user);
            res.json({"result": userData, "code": "0", "is_login": "0"});
        }
    } catch (e) {
        if (isSentry)
            Sentry.captureException(e);
        if (isDebug)
            res.status(500).json({"result": e.toString()});
        else
            res.status(500).json({"result": "Internal Server Error!"});
    }

});

/**
 * @swagger
 * /hacker/user/save_personal_profile:
 *   post:
 *     tags:
 *       - hacker
 *     description: save personal hacker profile
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : country_id
 *         type : string
 *         in: formData
 *         description : country_id
 *       - name : country_id_residence
 *         type : string
 *         in: formData
 *         description : country_id_residence
 *       - name : address1
 *         type : string
 *         in: formData
 *         description : address1
 *       - name : address2
 *         type : string
 *         in: formData
 *         description : address2
 *       - name : city
 *         type : string
 *         in: formData
 *         description : city
 *       - name : region
 *         type : string
 *         in: formData
 *         description : region
 *       - name : postal_code
 *         type : string
 *         in: formData
 *         description : postal_code
 *       - name : incoming_range_id
 *         type : string
 *         in: formData
 *         description : incoming_range_id
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: |
 *               <pre>
 *               {"code":"-1","result":"token is empty","is_login":"-1"}
 *               {"code":"-1","result":"token invalid","is_login":"-1"}
 *               {"code":"-1","result":"token expire","is_login":"-1"}
 *               {"code":"-2","result":"account is not verify","is_login":"-2"}
 *               {"code":"-3","result":"account is disabled","is_login":"-3"}
 *               {"code":"0","result":"saved","is_login":"0"}
 *               {"code":"1","result":"country not found","is_login":"0"}
 *               {"code":"2","result":"country residence not found","is_login":"0"}
 *               {"code":"3","result":"range not found","is_login":"0"}
 *               {"code":"4","result":"address1 is empty","is_login":"0"}
 *               {"code":"5","result":"address1 must be between 5 and 100 characters","is_login":"0"}
 *               {"code":"7","result":"address2 must be less that 100 characters.","is_login":"0"}
 *               {"code":"8","result":"city is empty","is_login":"0"}
 *               {"code":"9","result":"city must be between 2 and 35 characters","is_login":"0"}
 *               {"code":"10","result":"region is empty","is_login":"0"}
 *               {"code":"11","result":"region must be between 2 and 35 characters","is_login":"0"}
 *               {"code":"12","result":"postal_code is empty","is_login":"0"}
 *               {"code":"13","result":"postal_code must be between 3 and 20 characters","is_login":"0"}
 *               {"code":"14","result":"postal_code must be number","is_login":"0"}
 *               {"code":"15","result":"user is not verified","is_login":"0"}
 *               {"code":"16","result":"user is disabled","is_login":"0"}
 *               {"code":"17","result":"user is not valid","is_login":"0"}
 *               {"code":"18","result":"city must be only letter.","is_login":"0"}
 *               {"code":"19","result":"region must be only letter.","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/save_personal_profile', isAuth, uploader.none(), [
    check.body('address1').optional({checkFalsy: true}).trim()
        .isLength({min: 5, max: 100}).withMessage({
        "result": "address1 must be between 5 and 100 characters",
        "code": "5"
    }),
    check.body('address2').optional({checkFalsy: true}).trim()
        .isLength({max: 100}).withMessage({"result": "address2 must be less that 100 characters.", "code": "7"}),
    check.body('city').optional({checkFalsy: true}).trim()
        .isLength({min: 2, max: 35}).withMessage({"result": "city must be between 2 and 35 characters", "code": "9"})
        .matches('^[a-zA-ZäåöÄÅÖ\\s]+$').withMessage({"result": "city must be only letter.", "code": "18"}),
    check.body('region').optional({checkFalsy: true}).trim()
        .isLength({min: 2, max: 35}).withMessage({"result": "region must be between 2 and 35 characters", "code": "11"})
        .matches('^[a-zA-ZäåöÄÅÖ\\s]+$').withMessage({"result": "region must be only letter.", "code": "19"}),
    check.body('postal_code').optional({checkFalsy: true}).trim()
        .isLength({min: 3, max: 20}).withMessage({
        "result": "postal_code must be between 3 and 20 characters",
        "code": "13"
    })
        .matches('^[0-9 ]+$').withMessage({"result": "postal_code must be number.", "code": "14"}),
    check.body('country_id').trim().not().isEmpty()
        .withMessage({"result": "country is empty", "code": "13", "is_login": "0"})
], async (req, res) => {
    try {
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else {
            let user = hacker.get('hackerUser');

            let country_id = safeString(req.body.country_id);
            let country_id_residence = safeString(req.body.country_id_residence);
            let address1 = safeString(req.body.address1);
            let address2 = safeString(req.body.address2);
            let city = safeString(req.body.city);
            let region = safeString(req.body.region);
            let postal_code = safeString(req.body.postal_code);
            let incoming_range_id = safeString(req.body.incoming_range_id);
            //check country_id is valid?
            let country = await model.getCountry(country_id);
            if (country == 0) {
                res.json({"result": lang.save_personal_profile_country_not_found, "code": "1", "is_login": "0"});
                return;
            }

            if (country_id_residence != '') {
                //check country_id_residence is valid?
                let country = await model.getCountry(country_id_residence);
                if (country == 0) {
                    res.json({
                        "result": lang.save_personal_profile_country_id_residence_not_found,
                        "code": "2",
                        "is_login": "0"
                    });
                    return;
                }
            }

            if (incoming_range_id != '') {
                //check incoming_range_id is valid?
                let range = await model.getRange(incoming_range_id);
                if (range == 0) {
                    res.json({"result": lang.save_personal_range_not_found, "code": "3", "is_login": "0"});
                    return;
                }
            }

            let resultSave = await model.updateProfilePersonalData(user._id, country_id
                , country_id_residence, address1, address2, city, region, postal_code, incoming_range_id);
            if (resultSave === 1) {
                return res.json({"result": "user is not valid", "code": "17", "is_login": "0"});
            }
            res.json({"result": lang.save_personal_success, "code": "0", "is_login": "0"});
        }
    } catch (e) {
        if (isSentry)
            Sentry.captureException(e);
        if (isDebug)
            res.status(500).json({"result": e.toString()});
        else
            res.status(500).json({"result": "Internal Server Error!"});
    }

});


/**
 * @swagger
 * /hacker/user/UploadCVE:
 *   post:
 *     tags:
 *       - hacker
 *     description: upload cve file hacker
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : cve
 *         type : file
 *         in: formData
 *         required : true
 *         description : cve
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: |
 *               <pre>
 *               {"code":"-1","result":"token is empty","is_login":"-1"}
 *               {"code":"-1","result":"token invalid","is_login":"-1"}
 *               {"code":"-1","result":"token expire","is_login":"-1"}
 *               {"code":"-2","result":"account is not verify","is_login":"-2"}
 *               {"code":"-3","result":"account is disabled","is_login":"-3"}
 *               {"code":"0","result":"saved","is_login":"0","cve_file":"file_address"}
 *               {"code":"1","result":"already file upload","is_login":"0"}
 *               {"code":"2","result":"file not send","is_login":"0"}
 *               {"code":"3","result":"user is not verified","is_login":"0"}
 *               {"code":"4","result":"user is disabled","is_login":"0"}
 *               {"code":"5","result":"user is not valid","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
async function upload_cve_check(req, file, cb) {
    try {
        req.uploadDirs = uploadDirs
        let user = hacker.get('hackerUser');
        if (!isUndefined(user.cve_file) && user.cve_file !== "") {
            req.validationErrors = {"result": "already file upload!", "code": "1", "is_login": "0"};
            cb(null, false);
            return;
        }
        req.validationErrors = "";
        fileFilter(req, file, cb);
    } catch (e) {
        if (isDebug)
            req.validationErrors = {"result": e.toString()};
        else
            req.validationErrors = {"result": "Internal Server Error!"};
        cb(null, false);
    }
};
const uploader_cve = multer({storage: storage, fileFilter: upload_cve_check});
let uploadFilesCVE = uploader_cve.fields([{name: 'cve', maxCount: 1}]);
router.post('/UploadCVE', isAuth, uploadFilesCVE, async (req, res) => {
    try {
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
            return;
        }
        if (!isUndefined(req.validationErrors) && req.validationErrors != "") {
            res.json(req.validationErrors);
            return;
        }
        let user = hacker.get('hackerUser');

        let cve = '';
        var isUpload = Object.keys(req.files).length;
        if (isUpload == 0) {
            res.json({"result": "file not send", "code": "2", "is_login": "0"});
            return;
        } else {
            let cve_file_original_name = '';
            if (req.files && Object.keys(req.files).length > 0 && !isUndefined(req.files.cve)) {
                let filename = req.files.cve[0].filename;
                cve = `hacker/cve/${filename}`;
                cve_file_original_name = safeString(req.files.cve[0].originalname);
            }
            let resultSave = await model.updateCVE(user._id, cve, cve_file_original_name);
            if (resultSave === 1) {
                return res.json({"result": "user is not valid", "code": "5", "is_login": "0"});
            }
            let cve_file = AppConfig.API_URL + cve;
            res.json({
                "result": lang.upload_CVE_success
                , "cve_file": cve_file
                , "cve_file_original_name": cve_file_original_name
                , "code": "0", "is_login": "0"
            });
        }
    } catch (e) {
        if (isSentry)
            Sentry.captureException(e);
        if (isDebug)
            res.status(500).json({"result": e.toString()});
        else
            res.status(500).json({"result": "Internal Server Error!"});
    }
});

/**
 * @swagger
 * /hacker/user/DeleteCVE:
 *   delete:
 *     tags:
 *       - hacker
 *     description: delete cve file hacker
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: |
 *               <pre>
 *               {"code":"-1","result":"token is empty","is_login":"-1"}
 *               {"code":"-1","result":"token invalid","is_login":"-1"}
 *               {"code":"-1","result":"token expire","is_login":"-1"}
 *               {"code":"-2","result":"account is not verify","is_login":"-2"}
 *               {"code":"-3","result":"account is disabled","is_login":"-3"}
 *               {"code":"0","result":"delete ok","is_login":"0"}
 *               {"code":"1","result":"user is not verified","is_login":"0"}
 *               {"code":"2","result":"user is disabled","is_login":"0"}
 *               {"code":"3","result":"user is not valid","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.delete('/DeleteCVE', isAuth, uploader.none(), async (req, res) => {
    try {
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else {
            let user = hacker.get('hackerUser');

            let path = appDir + 'media/' + user['cve_file'];
            fs.stat(path, async (err, stats) => {
                if (!err && stats.isFile())
                    fs.unlinkSync(path);
            });
            let resultSave = await model.deleteCVE(user._id);
            if (resultSave === 1) {
                return res.json({"result": "user is not valid", "code": "3", "is_login": "0"});
            }
            res.json({"result": lang.delete_CVE_success, "code": "0", "is_login": "0"});
        }
    } catch (e) {
        if (isSentry)
            Sentry.captureException(e);
        if (isDebug)
            res.status(500).json({"result": e.toString()});
        else
            res.status(500).json({"result": "Internal Server Error!"});
    }

});

/**
 * @swagger
 * /hacker/user/UploadAvatar:
 *   post:
 *     tags:
 *       - hacker
 *     description: upload avatar file hacker
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : avatar
 *         type : file
 *         in: formData
 *         required : true
 *         description : avatar
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: |
 *               <pre>
 *               {"code":"-1","result":"token is empty","is_login":"-1"}
 *               {"code":"-1","result":"token invalid","is_login":"-1"}
 *               {"code":"-1","result":"token expire","is_login":"-1"}
 *               {"code":"-2","result":"account is not verify","is_login":"-2"}
 *               {"code":"-3","result":"account is disabled","is_login":"-3"}
 *               {"code":"1","result":"already file upload","is_login":"0"}
 *               {"code":"2","result":"file not send","is_login":"0"}
 *               {"code":"3","result":"user is not verified","is_login":"0"}
 *               {"code":"4","result":"user is disabled","is_login":"0"}
 *               {"code":"5","result":"user is not valid","is_login":"0"}
 *               {"code":"0","result":"saved","is_login":"0","avatar_file":"avatar_file_address"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */

async function upload_avatar_check(req, file, cb) {
    try {
        req.uploadDirs = uploadDirs
        let user = hacker.get('hackerUser');
        if (!isUndefined(user.avatar_file) && user.avatar_file !== "") {
            req.validationErrors = {"result": "already file upload!", "code": "1", "is_login": "0"};
            cb(null, false);
            return;
        }
        req.validationErrors = "";
        fileFilter(req, file, cb);
    } catch (e) {
        if (isDebug)
            req.validationErrors = {"result": e.toString()};
        else
            req.validationErrors = {"result": "Internal Server Error!"};
        cb(null, false);
    }
};
const uploader_avatar = multer({storage: storage, fileFilter: upload_avatar_check});
let uploadFilesAvatar = uploader_avatar.fields([{name: 'avatar', maxCount: 1}]);
router.post('/UploadAvatar', isAuth, uploadFilesAvatar, async (req, res) => {
    try {
        let user = hacker.get('hackerUser');

        if (!isUndefined(req.validationErrors) && req.validationErrors != "") {
            res.json(req.validationErrors);
            return;
        }
        var isUpload = Object.keys(req.files).length;
        if (isUpload == 0) {
            res.json({"result": "file not send", "code": "2", "is_login": "0"});
            return;
        } else {
            let img;
            let filename;
            let img2;
            if (req.files && Object.keys(req.files).length > 0 && !isUndefined(req.files.avatar)) {
                filename = req.files.avatar[0].filename;
                img = `avatars/${filename}`;
            }
            let path = appDir + 'media/' + img;
            img2 = `avatars/update_${filename}`;
            let newFile = appDir + `media/avatars/update_${filename}`;
            const imageFile = await sharp(path).toFile(newFile);
            fs.stat(path, async (err, stats) => {
                if (!err && stats.isFile())
                    fs.unlinkSync(path);
            });

            let resultSave = await model.updateAvatar(user._id, img2);
            if (resultSave === 1) {
                return res.json({"result": "user is not valid", "code": "3", "is_login": "0"});
            }
            let avatar_file = AppConfig.API_URL + img2;
            res.json({"result": lang.upload_Avatar_success, "avatar_file": avatar_file, "code": "0", "is_login": "0"});
        }
    } catch (e) {
        if (isSentry)
            Sentry.captureException(e);
        if (isDebug)
            res.status(500).json({"result": e.toString()});
        else
            res.status(500).json({"result": "Internal Server Error!"});
    }
});

/**
 * @swagger
 * /hacker/user/DeleteAvatar:
 *   delete:
 *     tags:
 *       - hacker
 *     description: delete Avatar file hacker
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: |
 *               <pre>
 *               {"code":"-1","result":"token is empty","is_login":"-1"}
 *               {"code":"-1","result":"token invalid","is_login":"-1"}
 *               {"code":"-1","result":"token expire","is_login":"-1"}
 *               {"code":"-2","result":"account is not verify","is_login":"-2"}
 *               {"code":"-3","result":"account is disabled","is_login":"-3"}
 *               {"code":"0","result":"delete ok","is_login":"0"}
 *               {"code":"1","result":"user is not verified","is_login":"0"}
 *               {"code":"2","result":"user is disabled","is_login":"0"}
 *               {"code":"3","result":"user is not valid","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.delete('/DeleteAvatar', isAuth, uploader.none(), async (req, res) => {
    try {
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else {
            let user = hacker.get('hackerUser');

            let path = appDir + 'media/' + user['avatar_file'];
            fs.stat(path, async (err, stats) => {
                if (!err && stats.isFile())
                    fs.unlinkSync(path);
            });
            let resultSave = await model.deleteAvatar(user._id);
            if (resultSave === 1) {
                return res.json({"result": "user is not valid", "code": "3", "is_login": "0"});
            }
            res.json({"result": lang.delete_Avatar_success, "code": "0", "is_login": "0"});
        }
    } catch (e) {
        if (isSentry)
            Sentry.captureException(e);

        if (isDebug)
            res.status(500).json({"result": e.toString()});
        else
            res.status(500).json({"result": "Internal Server Error!"});
    }

});


/**
 * @swagger
 * /hacker/user/save_invitation:
 *   post:
 *     tags:
 *       - hacker
 *     description: save invitation hacker
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : invitation
 *         type : bool
 *         in: formData
 *         description : invitation
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: |
 *               <pre>
 *               {"code":"-1","result":"token is empty","is_login":"-1"}
 *               {"code":"-1","result":"token invalid","is_login":"-1"}
 *               {"code":"-1","result":"token expire","is_login":"-1"}
 *               {"code":"-2","result":"account is not verify","is_login":"-2"}
 *               {"code":"-3","result":"account is disabled","is_login":"-3"}
 *               {"code":"1","result":"user is not verified","is_login":"0"}
 *               {"code":"2","result":"user is disabled","is_login":"0"}
 *               {"code":"3","result":"user is not valid","is_login":"0"}
 *               {"code":"0","result":"saved","is_login":"0","invitation":bool}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/save_invitation', isAuth, uploader.none(), async (req, res) => {
    try {
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else {
            let user = hacker.get('hackerUser');

            let invitation = safeString(req.body.invitation);
            invitation = (invitation === "true") ? true : false;
            let resultSave = await model.updateInvitation(user._id, invitation);
            if (resultSave === 1) {
                return res.json({"result": "user is not valid", "code": "3", "is_login": "0"});
            }
            res.json({"result": lang.save_invitation_success, "invitation": invitation, "code": "0", "is_login": "0"});
        }
    } catch (e) {
        if (isSentry)
            Sentry.captureException(e);
        if (isDebug)
            res.status(500).json({"result": e.toString()});
        else
            res.status(500).json({"result": "Internal Server Error!"});
    }

});

/**
 * @swagger
 * /hacker/user/payment_paypal:
 *   post:
 *     tags:
 *       - hacker
 *     description: save payment paypal hacker
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : email
 *         type : string
 *         in: formData
 *         description : email
 *         required : true
 *       - name : payment_default
 *         type : string
 *         in: formData
 *         description : |
 *              <pre>
 *                  payment_default value : 1 -> set default payment method
 *              </pre>
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: |
 *               <pre>
 *               {"code":"-1","result":"token is empty","is_login":"-1"}
 *               {"code":"-1","result":"token invalid","is_login":"-1"}
 *               {"code":"-1","result":"token expire","is_login":"-1"}
 *               {"code":"-2","result":"account is not verify","is_login":"-2"}
 *               {"code":"-3","result":"account is disabled","is_login":"-3"}
 *               {"code":"0","result":"saved","is_login":"0"}
 *               {"code":"1","result":"email is empty","is_login":"0"}
 *               {"code":"2","result":"email is not valid","is_login":"0"}
 *               {"code":"3","result":"email must be between 5 and 65 characters","is_login":"0"}
 *               {"code":"4","result":"account is disable","is_login":"0"}
 *               {"code":"5","result":"user is not verified","is_login":"0"}
 *               {"code":"6","result":"user is not valid","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/payment_paypal', isAuth, uploader.none(), [
    check.body('email').trim().not().isEmpty()
        .withMessage({"result": "email is empty", "code": "1", "is_login": "0"})
        .isString().withMessage({"result": "email is not valid", "code": "2", "is_login": "0"})
        .isEmail().withMessage({"result": "email is not valid", "code": "2", "is_login": "0"})
        .isLength({min: 5, max: 65}).withMessage({"result": "email must be between 5 and 65 characters", "code": "3"})
], async (req, res) => {
    try {
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else {
            let user = hacker.get('hackerUser');

            let email = safeString(req.body.email);
            email = email.toLowerCase();
            const was_payment_default = user && user.payment_default === toNumber(PAYMENT_DEFAULT.PAYPAL);
            let payment_default = toNumber(req.body.payment_default);
            payment_default = (payment_default) ? PAYMENT_DEFAULT.PAYPAL : PAYMENT_DEFAULT.NONE;
            let resultSave = await model.updatePaymentPaypal(user._id, email, payment_default, was_payment_default);
            if (resultSave === 1) {
                return res.json({"result": "user is not valid", "code": "3", "is_login": "0"});
            }
            res.json({"result": lang.payment_paypal_success, "code": "0", "is_login": "0"});
        }
    } catch (e) {
        if (isSentry)
            Sentry.captureException(e);
        if (isDebug)
            res.status(500).json({"result": e.toString()});
        else
            res.status(500).json({"result": "Internal Server Error!"});
    }

});


/**
 * @swagger
 * /hacker/user/payment_clear_paypal:
 *   delete:
 *     tags:
 *       - hacker
 *     description: payment clear paypal hacker
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: |
 *               <pre>
 *               {"code":"-1","result":"token is empty","is_login":"-1"}
 *               {"code":"-1","result":"token invalid","is_login":"-1"}
 *               {"code":"-1","result":"token expire","is_login":"-1"}
 *               {"code":"-2","result":"account is not verify","is_login":"-2"}
 *               {"code":"-3","result":"account is disabled","is_login":"-3"}
 *               {"code":"0","result":"saved","is_login":"0"}
 *               {"code":"1","result":"account is disable","is_login":"0"}
 *               {"code":"2","result":"user is not valid","is_login":"0"}
 *               {"code":"3","result":"user is not verified","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.delete('/payment_clear_paypal', isAuth, uploader.none(), async (req, res) => {
    try {
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else {
            let user = hacker.get('hackerUser');
            let resultSave = await model.clearPaymentPaypal(user._id, user.default_payment);
            if (resultSave === 1) {
                return res.json({"result": "user is not valid", "code": "2", "is_login": "0"});
            }
            res.json({"result": lang.payment_clear_paypal_success, "code": "0", "is_login": "0"});
        }
    } catch (e) {
        if (isSentry)
            Sentry.captureException(e);
        if (isDebug)
            res.status(500).json({"result": e.toString()});
        else
            res.status(500).json({"result": "Internal Server Error!"});
    }

});


/**
 * @swagger
 * /hacker/user/payment_usdt:
 *   post:
 *     tags:
 *       - hacker
 *     description: save payment usdt hacker
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : public_key
 *         type : string
 *         in: formData
 *         description : public_key
 *         required : true
 *       - name : payment_default
 *         type : string
 *         in: formData
 *         description : |
 *              <pre>
 *                  payment_default value : 2 -> set default payment method
 *              </pre>
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: |
 *               <pre>
 *               {"code":"-1","result":"token is empty","is_login":"-1"}
 *               {"code":"-1","result":"token invalid","is_login":"-1"}
 *               {"code":"-1","result":"token expire","is_login":"-1"}
 *               {"code":"-2","result":"account is not verify","is_login":"-2"}
 *               {"code":"-3","result":"account is disabled","is_login":"-3"}
 *               {"code":"0","result":"saved","is_login":"0"}
 *               {"code":"1","result":"public_key is empty","is_login":"0"}
 *               {"code":"2","result":"public_key is not valid","is_login":"0"}
 *               {"code":"3","result":"account is disable","is_login":"0"}
 *               {"code":"4","result":"user is not verified","is_login":"0"}
 *               {"code":"5","result":"user is not valid","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/payment_usdt', isAuth, uploader.none(), [
    check.body('public_key').trim().not().isEmpty()
        .withMessage({"result": lang.payment_usdt_public_key_is_empty, "code": "1", "is_login": "0"})
        .matches('^[T][a-km-zA-HJ-NP-Z1-9]{33}$').withMessage({
        "result": lang.payment_usdt_public_key_is_not_valid,
        "code": "2",
        "is_login": "0"
    }),
], async (req, res) => {
    try {
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else {
            let user = hacker.get('hackerUser');
            let public_key = safeString(req.body.public_key);
            const was_payment_default = user && user.payment_default === toNumber(PAYMENT_DEFAULT.USDT);
            let payment_default = toNumber(req.body.payment_default);
            payment_default = (payment_default) ? PAYMENT_DEFAULT.USDT : PAYMENT_DEFAULT.NONE;
            const result = await model.updatePaymentUSDT(user._id, public_key, payment_default, was_payment_default);
            if (result === 1) {
                return res.json({"result": "user is not valid", "code": "5", "is_login": "0"});
            }
            res.json({"result": lang.payment_bitcoin_success, "code": "0", "is_login": "0"});
        }
    } catch (e) {
        if (isSentry)
            Sentry.captureException(e);
        if (isDebug)
            res.status(500).json({"result": e.toString()});
        else
            res.status(500).json({"result": "Internal Server Error!"});
    }


});

/**
 * @swagger
 * /hacker/user/payment_clear_usdt:
 *   delete:
 *     tags:
 *       - hacker
 *     description: payment clear usdt hacker
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: |
 *               <pre>
 *               {"code":"-1","result":"token is empty","is_login":"-1"}
 *               {"code":"-1","result":"token invalid","is_login":"-1"}
 *               {"code":"-1","result":"token expire","is_login":"-1"}
 *               {"code":"-2","result":"account is not verify","is_login":"-2"}
 *               {"code":"-3","result":"account is disabled","is_login":"-3"}
 *               {"code":"0","result":"saved","is_login":"0"}
 *               {"code":"1","result":"user is not verified","is_login":"0"}
 *               {"code":"2","result":"user is disabled","is_login":"0"}
 *               {"code":"3","result":"user is not valid","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.delete('/payment_clear_usdt', isAuth, uploader.none(), async (req, res) => {
    try {
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else {
            let user = hacker.get('hackerUser');
            const result = await model.clearPaymentUSDT(user._id, user.payment_default);
            if (result === 1) {
                return res.json({"result": "user is not valid", "code": "5", "is_login": "0"});
            }
            res.json({"result": lang.payment_clear_bitcoin_success, "code": "0", "is_login": "0"});
        }
    } catch (e) {
        if (isSentry)
            Sentry.captureException(e);
        if (isDebug)
            res.status(500).json({"result": e.toString()});
        else
            res.status(500).json({"result": "Internal Server Error!"});
    }

});

/**
 * @swagger
 * /hacker/user/UploadTAX:
 *   post:
 *     tags:
 *       - hacker
 *     description: upload tax file hacker
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : tax
 *         type : file
 *         in: formData
 *         required : true
 *         description : tax
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: |
 *               <pre>
 *               {"code":"-1","result":"token is empty","is_login":"-1"}
 *               {"code":"-1","result":"token invalid","is_login":"-1"}
 *               {"code":"-1","result":"token expire","is_login":"-1"}
 *               {"code":"-2","result":"account is not verify","is_login":"-2"}
 *               {"code":"-3","result":"account is disabled","is_login":"-3"}
 *               {"code":"0","result":"saved","is_login":"0","tax_file":"tax_file_address"}
 *               {"code":"1","result":"already file upload","is_login":"0"}
 *               {"code":"2","result":"file not send","is_login":"0"}
 *               {"code":"3","result":"user is not verified","is_login":"0"}
 *               {"code":"4","result":"user is disabled","is_login":"0"}
 *               {"code":"5","result":"user is not valid","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */

async function upload_tax_check(req, file, cb) {
    try {
        req.uploadDirs = uploadDirs
        let user = hacker.get('hackerUser');
        if (!isUndefined(user.tax_file) && user.tax_file !== "") {
            req.validationErrors = {"result": "already file upload!", "code": "1", "is_login": "0"};
            cb(null, false);
            return;
        }
        req.validationErrors = "";
        fileFilter(req, file, cb);
    } catch (e) {
        if (isDebug)
            req.validationErrors = {"result": e.toString()};
        else
            req.validationErrors = {"result": "Internal Server Error!"};
        cb(null, false);
    }
};
const uploader_tax = multer({storage: storage, fileFilter: upload_tax_check});
let uploadFilesTAX = uploader_tax.fields([{name: 'tax', maxCount: 1}]);
router.post('/UploadTAX', isAuth, uploadFilesTAX, async (req, res) => {
    try {
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
            return;
        }
        if (!isUndefined(req.validationErrors) && req.validationErrors != "") {
            res.json(req.validationErrors);
            return;
        }
        let user = hacker.get('hackerUser');
        var isUpload = Object.keys(req.files).length;
        if (isUpload == 0) {
            res.json({"result": "file not send", "code": "2", "is_login": "0"});
            return;
        } else {
            let tax;
            if (req.files && Object.keys(req.files).length > 0 && !isUndefined(req.files.tax)) {
                let filename = req.files.tax[0].filename;
                tax = `hacker/tax/${filename}`;
            }
            let resultSave = await model.updateTAX(user._id, tax);
            if (resultSave === 1) {
                return res.json({"result": "user is not valid", "code": "5", "is_login": "0"});
            }
            let tax_file = AppConfig.API_URL + tax;
            res.json({"result": lang.upload_TAX_success, "tax_file": tax_file, "code": "0", "is_login": "0"});
        }
    } catch (e) {
        if (isSentry)
            Sentry.captureException(e);
        if (isDebug)
            res.status(500).json({"result": e.toString()});
        else
            res.status(500).json({"result": "Internal Server Error!"});
    }
});

/**
 * @swagger
 * /hacker/user/DeleteTAX:
 *   delete:
 *     tags:
 *       - hacker
 *     description: delete tax file hacker
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: |
 *               <pre>
 *               {"code":"-1","result":"token is empty","is_login":"-1"}
 *               {"code":"-1","result":"token invalid","is_login":"-1"}
 *               {"code":"-1","result":"token expire","is_login":"-1"}
 *               {"code":"-2","result":"account is not verify","is_login":"-2"}
 *               {"code":"-3","result":"account is disabled","is_login":"-3"}
 *               {"code":"0","result":"delete ok","is_login":"0"}
 *               {"code":"1","result":"user is not verified","is_login":"0"}
 *               {"code":"2","result":"user is disabled","is_login":"0"}
 *               {"code":"3","result":"user is not valid","is_login":"0"} *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.delete('/DeleteTAX', isAuth, uploader.none(), async (req, res) => {
    try {
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else {
            let user = hacker.get('hackerUser');
            let path = appDir + 'media/' + user['tax_file'];
            fs.stat(path, async (err, stats) => {
                if (!err && stats.isFile())
                    fs.unlinkSync(path);
            });
            let resultSave = await model.deleteTAX(user._id);
            if (resultSave === 1) {
                return res.json({"result": "user is not valid", "code": "3", "is_login": "0"});
            }
            res.json({"result": lang.delete_TAX_success, "code": "0", "is_login": "0"});
        }
    } catch (e) {
        if (isSentry)
            Sentry.captureException(e);
        if (isDebug)
            res.status(500).json({"result": e.toString()});
        else
            res.status(500).json({"result": "Internal Server Error!"});
    }

});


/**
 * @swagger
 * /hacker/user/payment_bank_transfer:
 *   post:
 *     tags:
 *       - hacker
 *     description: save payment bank transfer hacker
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : payment_bank_transfer_country_id
 *         type : string
 *         in: formData
 *         description : payment_bank_transfer_country_id
 *       - name : payment_bank_transfer_country_id_residence
 *         type : string
 *         in: formData
 *         description : payment_bank_transfer_country_id_residence
 *       - name : payment_bank_transfer_currency_id
 *         type : string
 *         in: formData
 *         description : payment_bank_transfer_currency_id
 *       - name : payment_bank_transfer_type
 *         type : string
 *         in: formData
 *         description : payment_bank_transfer_type
 *       - name : payment_bank_transfer_iban
 *         type : string
 *         in: formData
 *         description : payment_bank_transfer_iban
 *       - name : payment_bank_transfer_bic
 *         type : string
 *         in: formData
 *         description : payment_bank_transfer_bic
 *       - name : payment_bank_transfer_account_holder
 *         type : string
 *         in: formData
 *         description : payment_bank_transfer_account_holder
 *       - name : payment_default
 *         type : string
 *         in: formData
 *         description : |
 *              <pre>
 *                  payment_default value : 3 -> set default payment method
 *              </pre>
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: |
 *               <pre>
 *               {"code":"-1","result":"token is empty","is_login":"-1"}
 *               {"code":"-1","result":"token invalid","is_login":"-1"}
 *               {"code":"-1","result":"token expire","is_login":"-1"}
 *               {"code":"-2","result":"account is not verify","is_login":"-2"}
 *               {"code":"-3","result":"account is disabled","is_login":"-3"}
 *               {"code":"0","result":"saved","is_login":"0"}
 *               {"code":"1","result":"country not found","is_login":"0"}
 *               {"code":"2","result":"country residence not found","is_login":"0"}
 *               {"code":"3","result":"currency not found","is_login":"0"}
 *               {"code":"4","result":"account holder is empty","is_login":"0"}
 *               {"code":"5","result":"account holder must be less that 65 characters.","is_login":"0"}
 *               {"code":"6","result":"IBAN is empty","is_login":"0"}
 *               {"code":"7","result":"IBAN must be less that 35 characters.","is_login":"0"}
 *               {"code":"8","result":"BIC is empty","is_login":"0"}
 *               {"code":"9","result":"BIC must be less that 11 characters.","is_login":"0"}
 *               {"code":"10","result":"user is not verified","is_login":"0"}
 *               {"code":"11","result":"user is disabled","is_login":"0"}
 *               {"code":"12","result":"user is not valid","is_login":"0"}
 *               {"code":"13","result":"account type is empty","is_login":"0"}
 *               {"code":"14","result":"country_id residence is empty","is_login":"0"}
 *               {"code":"15","result":"country_id is empty","is_login":"0"}
 *               {"code":"16","result":"currency_id is empty","is_login":"0"}
 *               {"code":"17","result":"account holder must be only letter.","is_login":"0"}
 *               {"code":"18","result":"IBAN must be only letter and number.","is_login":"0"}
 *               {"code":"19","result":"BIC must be only letter and number.","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/payment_bank_transfer', isAuth, uploader.none(), [
    check.body('payment_bank_transfer_type').trim().not().isEmpty()
        .withMessage({"result": "account type is empty", "code": "13", "is_login": "0"}),
    check.body('payment_bank_transfer_country_id_residence').trim().not().isEmpty()
        .withMessage({"result": "country_id residence is empty", "code": "14", "is_login": "0"}),
    check.body('payment_bank_transfer_country_id').trim().not().isEmpty()
        .withMessage({"result": "country_id is empty", "code": "15", "is_login": "0"}),
    check.body('payment_bank_transfer_currency_id').trim().not().isEmpty()
        .withMessage({"result": "currency_id is empty", "code": "16", "is_login": "0"}),
    check.body('payment_bank_transfer_account_holder').trim().not().isEmpty()
        .withMessage({"result": "account holder is empty", "code": "4", "is_login": "0"})
        .isLength({max: 65}).withMessage({"result": "account holder must be less that 65 characters.", "code": "5"})
        .matches('^[a-zA-ZäåöÄÅÖ\\s]+$').withMessage({"result": "account holder must be only letter.", "code": "17"}),
    check.body('payment_bank_transfer_iban').trim().not().isEmpty()
        .withMessage({"result": "IBAN is empty", "code": "6", "is_login": "0"})
        .isLength({max: 35}).withMessage({"result": "IBAN must be less that 35 characters.", "code": "7"})
        .matches('^[a-zA-ZäåöÄÅÖ0-9\\s]+$').withMessage({
        "result": "IBAN must be only letter and number.",
        "code": "18"
    }),
    check.body('payment_bank_transfer_bic').trim().not().isEmpty()
        .withMessage({"result": "BIC is empty", "code": "8", "is_login": "0"})
        .isLength({max: 11}).withMessage({"result": "BIC must be less that 11 characters.", "code": "9"})
        .matches('^[a-zA-ZäåöÄÅÖ0-9\\s]+$').withMessage({
        "result": "BIC must be only letter and number.",
        "code": "19"
    }),

], async (req, res) => {
    try {
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else {
            let user = hacker.get('hackerUser');
            const was_payment_default = user && user.payment_default === toNumber(PAYMENT_DEFAULT.BANK_TRANSFER);
            let payment_default = toNumber(req.body.payment_default);
            payment_default = (payment_default) ? PAYMENT_DEFAULT.BANK_TRANSFER : PAYMENT_DEFAULT.NONE;
            let payment_bank_transfer_country_id = safeString(req.body.payment_bank_transfer_country_id);
            let payment_bank_transfer_country_id_residence = safeString(req.body.payment_bank_transfer_country_id_residence);
            let payment_bank_transfer_currency_id = safeString(req.body.payment_bank_transfer_currency_id);
            let payment_bank_transfer_type = safeString(req.body.payment_bank_transfer_type);
            let payment_bank_transfer_iban = safeString(req.body.payment_bank_transfer_iban);
            let payment_bank_transfer_bic = safeString(req.body.payment_bank_transfer_bic);
            let payment_bank_transfer_account_holder = safeString(req.body.payment_bank_transfer_account_holder);
            if (payment_bank_transfer_country_id != '') {
                //check payment_bank_transfer_country_id is valid?
                let country = await model.getCountry(payment_bank_transfer_country_id);
                if (country == 0) {
                    res.json({"result": lang.payment_bank_transfer_country_not_found, "code": "1", "is_login": "0"});
                    return;
                }
            }

            if (payment_bank_transfer_country_id_residence != '') {
                //check payment_bank_transfer_country_id_residence is valid?
                let country = await model.getCountry(payment_bank_transfer_country_id_residence);
                if (country == 0) {
                    res.json({
                        "result": lang.payment_bank_transfer_country_residence_not_found,
                        "code": "2",
                        "is_login": "0"
                    });
                    return;
                }
            }

            if (payment_bank_transfer_currency_id != '') {
                //check payment_bank_transfer_currency_id is valid?
                let currency = await model.getCurrency(payment_bank_transfer_currency_id);
                if (currency == 0) {
                    res.json({"result": lang.payment_bank_transfer_currency_not_found, "code": "3", "is_login": "0"});
                    return;
                }
            }

            let resultSave = await model.updatePaymentBankTransfer(user._id
                , payment_default
                , was_payment_default
                , payment_bank_transfer_iban
                , payment_bank_transfer_bic
                , payment_bank_transfer_type, payment_bank_transfer_account_holder
                , payment_bank_transfer_country_id, payment_bank_transfer_country_id_residence
                , payment_bank_transfer_currency_id);
            if (resultSave === 1) {
                return res.json({"result": "user is not valid", "code": "12", "is_login": "0"});
            }
            res.json({"result": lang.payment_bank_transfer_success, "code": "0", "is_login": "0"});

        }
    } catch (e) {
        if (isSentry)
            Sentry.captureException(e);

        if (isDebug)
            res.status(500).json({"result": e.toString()});
        else
            res.status(500).json({"result": "Internal Server Error!"});
    }

});


/**
 * @swagger
 * /hacker/user/payment_clear_bank_transfer:
 *   delete:
 *     tags:
 *       - hacker
 *     description: payment clear bank transfer hacker
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: |
 *               <pre>
 *               {"code":"-1","result":"token is empty","is_login":"-1"}
 *               {"code":"-1","result":"token invalid","is_login":"-1"}
 *               {"code":"-1","result":"token expire","is_login":"-1"}
 *               {"code":"-2","result":"account is not verify","is_login":"-2"}
 *               {"code":"-3","result":"account is disabled","is_login":"-3"}
 *               {"code":"0","result":"saved","is_login":"0"}
 *               {"code":"1","result":"user is not valid","is_login":"0"}
 *               {"code":"2","result":"user is not verified","is_login":"0"}
 *               {"code":"3","result":"user is disabled","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.delete('/payment_clear_bank_transfer', isAuth, uploader.none(), async (req, res) => {
    try {
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else {
            let user = hacker.get('hackerUser');
            let resultSave = await model.clearPaymentBankTransfer(user._id, user.default_payment);
            if (resultSave === 1) {
                return res.json({"result": "user is not valid", "code": "1", "is_login": "0"});
            }
            res.json({"result": lang.payment_clear_bank_transfer_success, "code": "0", "is_login": "0"});
        }
    } catch (e) {
        if (isSentry)
            Sentry.captureException(e);
        if (isDebug)
            res.status(500).json({"result": e.toString()});
        else
            res.status(500).json({"result": "Internal Server Error!"});
    }

});


/**
 * @swagger
 * /hacker/user/upload_identity_passport:
 *   post:
 *     tags:
 *       - hacker
 *     description: upload identity passport file hacker
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : identity_country_id
 *         type : string
 *         in: formData
 *         required : true
 *         description : identity_country_id
 *       - name : identity_passport_file
 *         type : file
 *         in: formData
 *         required : true
 *         description : identity_passport_file
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: |
 *               <pre>
 *               {"code":"-1","result":"token is empty","is_login":"-1"}
 *               {"code":"-1","result":"token invalid","is_login":"-1"}
 *               {"code":"-1","result":"token expire","is_login":"-1"}
 *               {"code":"-2","result":"account is not verify","is_login":"-2"}
 *               {"code":"-3","result":"account is disabled","is_login":"-3"}
 *               {"code":"0","result":"saved","is_login":"0","identity_passport_file":"file_address"}
 *               {"code":"1","result":"already file upload","is_login":"0"}
 *               {"code":"2","result":"country not found","is_login":"0"}
 *               {"code":"3","result":"file not send","is_login":"0"}
 *               {"code":"4","result":"already file approved!","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
async function upload_identity_passport_check(req, file, cb) {
    try {
        req.uploadDirs = uploadDirs
        let user = hacker.get('hackerUser');

        if (!isUndefined(user.identity_passport_file) && user.identity_passport_file !== "") {
            req.validationErrors = {"result": "already file upload!", "code": "1", "is_login": "0"};
            cb(null, false);
            return;
        }
        let identity_country_id = safeString(req.body.identity_country_id);
        let country = await model.getCountry(identity_country_id);
        if (country == 0) {
            req.validationErrors = {
                "result": lang.upload_identity_passport_country_not_found,
                "code": "2",
                "is_login": "0"
            };
            cb(null, false);
            return;
        }
        req.validationErrors = "";
        fileFilter(req, file, cb)
    } catch (e) {
        if (isDebug)
            req.validationErrors = {"result": e.toString()};
        else
            req.validationErrors = {"result": "Internal Server Error!"};
        cb(null, false);
    }
};

const uploader_identity_passport = multer({storage: storage, fileFilter: upload_identity_passport_check});
let uploadFilesIdentityPassport = uploader_identity_passport.fields([{name: 'identity_passport_file', maxCount: 1}]);
router.post('/upload_identity_passport', isAuth, uploadFilesIdentityPassport, async (req, res) => {
    try {
        let user = hacker.get('hackerUser');
        if (!isUndefined(req.validationErrors) && req.validationErrors != "") {
            res.json(req.validationErrors);
            return;
        } else {
            if (safeString(user.identity_passport_file_status) === "1") {
                return res.json({"result": "already file approved!", "code": "4", "is_login": "0"});
            }
            let isUpload = Object.keys(req.files).length;
            if (isUpload == 0) {
                res.json({"result": "file not send", "code": "3", "is_login": "0"});
                return;
            } else {
                let file;
                let identity_country_id = safeString(req.body.identity_country_id);
                if (req.files && Object.keys(req.files).length > 0 && !isUndefined(req.files.identity_passport_file)) {
                    let filename = req.files.identity_passport_file[0].filename;
                    file = `hacker/identity/${filename}`;
                    if (isImage(file)) {
                        let path = appDir + 'media/' + file;
                        file = `hacker/identity/update_${filename}`;
                        let newFile = appDir + `media/hacker/identity/update_${filename}`;
                        const imageFile = await sharp(path).toFile(newFile);
                        fs.stat(path, async (err, stats) => {
                            if (!err && stats.isFile())
                                fs.unlinkSync(path);
                        });
                    }
                }


                await model.updateIdentityPassport(user._id, identity_country_id, file);
                  let htmlTemplateForSupport = generateEmailTemplate("hacker_verify_identity_for_support","",{identity: "passport", username: user.username},false);
                const notifications_setting = await model.getSettingsByKey(['reciever_email']);
                if (notifications_setting && notifications_setting.reciever_email) {
                    sendMail(notifications_setting.reciever_email, "New KYC request Received", htmlTemplateForSupport);
                }

                let ret_file = AppConfig.API_URL + file;
                res.json({
                    "result": lang.upload_identity_passport_success,
                    "identity_passport_file": ret_file,
                    "code": "0",
                    "is_login": "0"
                });
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
});

/**
 * @swagger
 * /hacker/user/delete_identity_passport:
 *   delete:
 *     tags:
 *       - hacker
 *     description: delete identity passport file hacker
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description:
 *               <pre>
 *               {"code":"-1","result":"token is empty","is_login":"-1"}
 *               {"code":"-1","result":"token invalid","is_login":"-1"}
 *               {"code":"-1","result":"token expire","is_login":"-1"}
 *               {"code":"-2","result":"account is not verify","is_login":"-2"}
 *               {"code":"-3","result":"account is disabled","is_login":"-3"}
 *               {"code":"0","result":"delete ok","is_login":"0"}
 *               {"code":"1","result":"can not delete!","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.delete('/delete_identity_passport', isAuth, uploader.none(), async (req, res) => {
    try {
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else {
            let user = hacker.get('hackerUser');
            if (!isUndefined(user.identity_passport_file_status) && user.identity_passport_file_status == 1) {
                res.json({"result": "can not delete!", "code": "1", "is_login": "0"});
            } else {
                let path = appDir + 'media/' + user['identity_passport_file'];
                fs.stat(path, async (err, stats) => {
                    if (!err && stats.isFile())
                        fs.unlinkSync(path);
                });
                await model.deleteIdentityPassport(user._id);
                res.json({"result": lang.delete_identity_passport_success, "code": "0", "is_login": "0"});
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

});


/**
 * @swagger
 * /hacker/user/upload_identity_card:
 *   post:
 *     tags:
 *       - hacker
 *     description: upload identity card file hacker
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : identity_country_id
 *         type : string
 *         in: formData
 *         required : true
 *         description : identity_country_id
 *       - name : identity_card_file
 *         type : file
 *         in: formData
 *         required : true
 *         description : identity_card_file
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: |
 *               <pre>
 *               {"code":"-1","result":"token is empty","is_login":"-1"}
 *               {"code":"-1","result":"token invalid","is_login":"-1"}
 *               {"code":"-1","result":"token expire","is_login":"-1"}
 *               {"code":"-2","result":"account is not verify","is_login":"-2"}
 *               {"code":"-3","result":"account is disabled","is_login":"-3"}
 *               {"code":"0","result":"saved","is_login":"0","identity_card_file":"file_address"}
 *               {"code":"1","result":"already file upload","is_login":"0"}
 *               {"code":"2","result":"country not found","is_login":"0"}
 *               {"code":"3","result":"file not send","is_login":"0"}
 *               {"code":"4","result":"already file approved!","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
async function upload_identity_card_check(req, file, cb) {
    try {
        req.uploadDirs = uploadDirs
        let user = hacker.get('hackerUser');
        if (!isUndefined(user.identity_card_file) && user.identity_card_file !== "") {
            req.validationErrors = {"result": "already file upload!", "code": "1", "is_login": "0"};
            cb(null, false);
            return;
        }
        let identity_country_id = safeString(req.body.identity_country_id);
        let country = await model.getCountry(identity_country_id);
        if (country == 0) {
            req.validationErrors = {
                "result": lang.upload_identity_card_country_not_found,
                "code": "2",
                "is_login": "0"
            };
            cb(null, false);
            return;
        }
        req.validationErrors = "";
        fileFilter(req, file, cb)
    } catch (e) {
        if (isDebug)
            req.validationErrors = {"result": e.toString()};
        else
            req.validationErrors = {"result": "Internal Server Error!"};
        cb(null, false);
    }
};
const uploader_identity_card = multer({storage: storage, fileFilter: upload_identity_card_check});
let uploadFilesIdentityCard = uploader_identity_card.fields([{name: 'identity_card_file', maxCount: 1}]);
router.post('/upload_identity_card', isAuth, uploadFilesIdentityCard, async (req, res) => {
    try {
        let user = hacker.get('hackerUser');
        if (!isUndefined(req.validationErrors) && req.validationErrors != "") {
            res.json(req.validationErrors);
            return;
        } else {
            if (safeString(user.identity_card_file_status) === "1") {
                return res.json({"result": "already file approved!", "code": "4", "is_login": "0"});
            }
            var isUpload = Object.keys(req.files).length;
            if (isUpload == 0) {
                res.json({"result": "file not send", "code": "3", "is_login": "0"});
                return;
            } else {
                let file;
                let identity_country_id = safeString(req.body.identity_country_id);
                if (req.files && Object.keys(req.files).length > 0 && !isUndefined(req.files.identity_card_file)) {
                    let filename = req.files.identity_card_file[0].filename;
                    file = `hacker/identity/${filename}`;
                    if (isImage(file)) {
                        let path = appDir + 'media/' + file;
                        file = `hacker/identity/update_${filename}`;
                        let newFile = appDir + `media/hacker/identity/update_${filename}`;
                        const imageFile = await sharp(path).toFile(newFile);
                        fs.stat(path, async (err, stats) => {
                            if (!err && stats.isFile())
                                fs.unlinkSync(path);
                        });
                    }
                }
                await model.updateIdentityCard(user._id, identity_country_id, file);
                let htmlTemplateForSupport = generateEmailTemplate("hacker_verify_identity_for_support","",{identity: "card", username: user.username},false);
                const notifications_setting = await model.getSettingsByKey(['reciever_email']);
                if (notifications_setting && notifications_setting.reciever_email) {
                    sendMail(notifications_setting.reciever_email, "New KYC request Received", htmlTemplateForSupport);
                }
                let ret_file = AppConfig.API_URL + file;
                res.json({
                    "result": lang.upload_identity_card_success,
                    "identity_card_file": ret_file,
                    "code": "0",
                    "is_login": "0"
                });
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
});

/**
 * @swagger
 * /hacker/user/delete_identity_card:
 *   delete:
 *     tags:
 *       - hacker
 *     description: delete identity card file hacker
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: |
 *               <pre>
 *               {"code":"-1","result":"token is empty","is_login":"-1"}
 *               {"code":"-1","result":"token invalid","is_login":"-1"}
 *               {"code":"-1","result":"token expire","is_login":"-1"}
 *               {"code":"-2","result":"account is not verify","is_login":"-2"}
 *               {"code":"-3","result":"account is disabled","is_login":"-3"}
 *               {"code":"0","result":"delete ok","is_login":"0"}
 *               {"code":"1","result":"can not delete!","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.delete('/delete_identity_card', isAuth, uploader.none(), async (req, res) => {
    try {
        let user = hacker.get('hackerUser');
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else {
            if (!isUndefined(user.identity_card_file_status) && user.identity_card_file_status == 1) {
                res.json({"result": "can not delete!", "code": "1", "is_login": "0"});
            } else {
                let path = appDir + 'media/' + user['identity_card_file'];
                fs.stat(path, async (err, stats) => {
                    if (!err && stats.isFile())
                        fs.unlinkSync(path);
                });
                let resultSave = await model.deleteIdentityCard(user._id);
                res.json({"result": lang.delete_identity_card_success, "code": "0", "is_login": "0"});
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

});


/**
 * @swagger
 * /hacker/user/upload_identity_driver:
 *   post:
 *     tags:
 *       - hacker
 *     description: upload identity driver file hacker
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : identity_country_id
 *         type : string
 *         in: formData
 *         required : true
 *         description : identity_country_id
 *       - name : identity_driver_file
 *         type : file
 *         in: formData
 *         required : true
 *         description : identity_driver_file
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: |
 *               <pre>
 *               {"code":"-1","result":"token is empty","is_login":"-1"}
 *               {"code":"-1","result":"token invalid","is_login":"-1"}
 *               {"code":"-1","result":"token expire","is_login":"-1"}
 *               {"code":"-2","result":"account is not verify","is_login":"-2"}
 *               {"code":"-3","result":"account is disabled","is_login":"-3"}
 *               {"code":"0","result":"saved","is_login":"0","identity_driver_file":"file_address"}
 *               {"code":"1","result":"already file upload","is_login":"0"}
 *               {"code":"2","result":"country not found","is_login":"0"}
 *               {"code":"3","result":"file not send","is_login":"0"}
 *               {"code":"4","result":"already file approved!","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
async function upload_identity_driver_check(req, file, cb) {
    try {
        req.uploadDirs = uploadDirs
        let user = hacker.get('hackerUser');
        if (!isUndefined(user.identity_driver_file) && user.identity_driver_file !== "") {
            req.validationErrors = {"result": "already file upload!", "code": "1", "is_login": "0"};
            cb(null, false);
            return;
        }
        let identity_country_id = safeString(req.body.identity_country_id);
        let country = await model.getCountry(identity_country_id);
        if (country == 0) {
            req.validationErrors = {
                "result": lang.upload_identity_driver_country_not_found,
                "code": "2",
                "is_login": "0"
            };
            cb(null, false);
            return;
        }
        req.validationErrors = "";
        fileFilter(req, file, cb)
    } catch (e) {
        if (isDebug)
            req.validationErrors = {"result": e.toString()};
        else
            req.validationErrors = {"result": "Internal Server Error!"};
        cb(null, false);
    }
};
const uploader_identity_driver = multer({storage: storage, fileFilter: upload_identity_driver_check});
let uploadFilesIdentityDriver = uploader_identity_driver.fields([{name: 'identity_driver_file', maxCount: 1}]);
router.post('/upload_identity_driver', isAuth, uploadFilesIdentityDriver, async (req, res) => {
    try {
        let user = hacker.get('hackerUser');
        if (!isUndefined(req.validationErrors) && req.validationErrors != "") {
            res.json(req.validationErrors);
            return;
        } else {
            if (safeString(user.identity_driver_file_status) === "1") {
                return res.json({"result": "already file approved!", "code": "4", "is_login": "0"});
            }
            var isUpload = Object.keys(req.files).length;
            if (isUpload == 0) {
                res.json({"result": "file not send", "code": "3", "is_login": "0"});
                return;
            } else {
                let file;
                let identity_country_id = safeString(req.body.identity_country_id);
                if (req.files && Object.keys(req.files).length > 0 && !isUndefined(req.files.identity_driver_file)) {
                    let filename = req.files.identity_driver_file[0].filename;
                    file = `hacker/identity/${filename}`;
                    if (isImage(file)) {
                        let path = appDir + 'media/' + file;
                        file = `hacker/identity/update_${filename}`;
                        let newFile = appDir + `media/hacker/identity/update_${filename}`;
                        const imageFile = await sharp(path).toFile(newFile);
                        fs.stat(path, async (err, stats) => {
                            if (!err && stats.isFile())
                                fs.unlinkSync(path);
                        });
                    }
                }
                await model.updateIdentityDriver(user._id, identity_country_id, file);
                let htmlTemplateForSupport = generateEmailTemplate("hacker_verify_identity_for_support","",{identity: "driver", username: user.username},false);
                const notifications_setting = await model.getSettingsByKey(['reciever_email']);
                if (notifications_setting && notifications_setting.reciever_email) {
                    sendMail(notifications_setting.reciever_email, "New KYC request Received", htmlTemplateForSupport);
                }
                let ret_file = AppConfig.API_URL + file;
                res.json({
                    "result": lang.upload_identity_driver_success,
                    "identity_driver_file": ret_file,
                    "code": "0",
                    "is_login": "0"
                });
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
});

/**
 * @swagger
 * /hacker/user/delete_identity_driver:
 *   delete:
 *     tags:
 *       - hacker
 *     description: delete identity driver file hacker
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: |
 *               <pre>
 *               {"code":"-1","result":"token is empty","is_login":"-1"}
 *               {"code":"-1","result":"token invalid","is_login":"-1"}
 *               {"code":"-1","result":"token expire","is_login":"-1"}
 *               {"code":"-2","result":"account is not verify","is_login":"-2"}
 *               {"code":"-3","result":"account is disabled","is_login":"-3"}
 *               {"code":"0","result":"delete ok","is_login":"0"}
 *               {"code":"1","result":"can not delete!","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.delete('/delete_identity_driver', isAuth, uploader.none(), async (req, res) => {
    try {
        let user = hacker.get('hackerUser');
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else {
            if (!isUndefined(user.identity_driver_file_status) && user.identity_driver_file_status == 1) {
                res.json({"result": "can not delete!", "code": "1", "is_login": "0"});
            } else {
                let path = appDir + 'media/' + user['delete_identity_driver'];
                fs.stat(path, async (err, stats) => {
                    if (!err && stats.isFile())
                        fs.unlinkSync(path);
                });
                let resultSave = await model.deleteIdentityDriver(user._id);
                res.json({"result": lang.delete_identity_driver_success, "code": "0", "is_login": "0"});
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

});

/**
 * @swagger
 * /hacker/user/change_email:
 *   post:
 *     tags:
 *       - hacker
 *     description: change email hacker
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : new_email
 *         type : string
 *         in: formData
 *         required : true
 *         description : new_email
 *       - name : current_password
 *         type : string
 *         in: formData
 *         required : true
 *         description : current_password
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: |
 *               <pre>
 *               {"code":"-1","result":"token is empty","is_login":"-1"}
 *               {"code":"-1","result":"token invalid","is_login":"-1"}
 *               {"code":"-1","result":"token expire","is_login":"-1"}
 *               {"code":"-2","result":"account is not verify","is_login":"-2"}
 *               {"code":"-3","result":"account is disabled","is_login":"-3"}
 *               {"code":"0","result":"send verify email","is_login":"0"}
 *               {"code":"1","result":"new_email is empty","is_login":"0"}
 *               {"code":"2","result":"new_email is not valid","is_login":"0"}
 *               {"code":"3","result":"current_password is empty","is_login":"0"}
 *               {"code":"4","result":"current password is not valid","is_login":"0"}
 *               {"code":"5","result":"email is exist","is_login":"0"}
 *               {"code":"6","result":"Your identity verified by admin","is_login":"0"}
 *               {"code":"7","result":"user is not verified","is_login":"0"}
 *               {"code":"8","result":"account is disable","is_login":"0"}
 *               {"code":"9","result":"user not found","is_login":"0"}
 *               {"code":"10","result":"new email must be between 5 and 65 characters","is_login":"0"}
 *               {"code":"11","result":"current password must be between 8 and 100 characters","is_login":"0"}
 *               {"code":"12","result":"current password must have at least one uppercase","is_login":"0"}
 *               {"code":"13","result":"current password must have at least one lowercase","is_login":"0"}
 *               {"code":"14","result":"current password must have at least one number","is_login":"0"}
 *               {"code":"15","result":"current password must have at least one special characters","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/change_email', isAuth, uploader.none(), [
    check.body('new_email').trim().not().isEmpty()
        .withMessage({"result": lang.change_email_new_email_is_empty, "code": "1", "is_login": "0"})
        .isString().withMessage({"result": lang.change_email_new_email_is_not_valid, "code": "2", "is_login": "0"})
        .isEmail().withMessage({"result": lang.change_email_new_email_is_not_valid, "code": "2", "is_login": "0"})
        .isLength({min: 5, max: 65}).withMessage({
        "result": "new email must be between 5 and 65 characters",
        "code": "10"
    }),
    check.body('current_password').trim().not().isEmpty()
        .withMessage({"result": lang.change_email_current_password_is_empty, "code": "3", "is_login": "0"})
        .isLength({min: 8, max: 100}).withMessage({
        "result": "current password must be between 8 and 100 characters",
        "code": "11"
    })
        .matches('^(?=.*[A-Z])').withMessage({
        "result": "current password must have at least one uppercase",
        "code": "12"
    })
        .matches('^(?=.*[a-z])').withMessage({
        "result": "current password must have at least one lowercase",
        "code": "13"
    })
        .matches('^(?=.*\\d)').withMessage({
        "result": "current password must must have at least one number",
        "code": "14"
    })
        .matches('^(?=.*[\\/\\\\|@$!%*,#_?~^.`:&\\-+=\"\'{}<>()\\[\\]])').withMessage({
        "result": "current password must have at least one special character",
        "code": "15"
    })
], async (req, res) => {
    try {
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else {
            let user = hacker.get('hackerUser');
            if (user.identity_card_file_status === 1 || user.identity_driver_file_status === 1 || user.identity_passport_file_status === 1) {
                return res.json({"result": "Your identity verified by admin", "code": "6", "is_login": "0"});
            }

            let new_email = safeString(req.body.new_email);
            new_email = new_email.toLowerCase();
            let current_password = safeString(req.body.current_password);
            if (user.password === makeHash(current_password)) {
                let checkEmail = await model.checkEmailAndSiblings(new_email);
                if (checkEmail > 0) {
                    res.json({"result": lang.change_email_email_is_exist, "code": "5", "is_login": "0"});
                    return;
                }
                let result = await model.updateEmailTemp(user._id, new_email);
                if (result === 9) {
                    return res.json({"result": "user not found", "code": "9", "is_login": "0"});
                }
                let url = `${AppConfig.FRONTEND_URL}user/change_email?token=${result}`;
                let htmlTemplate = generateEmailTemplate("hacker_register",user.fn,{url},true);
                //send email
                sendMail(new_email, lang.change_email_email_subject, htmlTemplate);
                res.json({"result": lang.change_email_success, "code": "0", "is_login": "0"});

            } else {
                res.json({"result": lang.change_email_current_password_is_not_valid, "code": "4", "is_login": "0"});
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

});

/**
 * @swagger
 * /hacker/user/verify_change_email:
 *   post:
 *     tags:
 *       - hacker
 *     description: verify change email hacker
 *     parameters:
 *       - name : code
 *         type : string
 *         in: formData
 *         required : true
 *         description : code
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: |
 *               <pre>
 *               {"code":"0","result":"change email is success"}
 *               {"code":"1","result":"code is empty"}
 *               {"code":"2","result":"email is exist"}
 *               {"code":"3","result":"invalid code"}
 *               {"code":"4","result":"user is not verified"}
 *               {"code":"5","result":"Your identity verified by admin"}
 *               {"code":"6","result":"update email failed please try again"}
 *               {"code":"7","result":"account is disable"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/verify_change_email', uploader.none(), [
    check.body('code').trim().not().isEmpty()
        .withMessage({"result": lang.verify_change_email_code_is_empty, "code": "1"}),
], async (req, res) => {
    try {
        let code = safeString(req.body.code);
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else {
            let currentUser = await model.getFoundChangeEmailTempCode(makeKey(code));
            if (currentUser) {
                if (currentUser.identity_passport_file_status === 1 || currentUser.identity_driver_file_status === 1 || currentUser.identity_passport_file_status === 1) {
                    return res.json({"result": "Your identity verified by admin", "code": "6", "is_login": "0"});
                }
                let checkEmail = await model.checkEmail(currentUser.email_temp);
                if (checkEmail > 0) {
                    await model.updateEmailChangeFail(currentUser._id);
                    res.json({"result": lang.verify_change_email_email_is_exist, "code": "2"});
                    return;
                }

                let result = await model.updateEmailChange(currentUser._id, currentUser.email
                    , currentUser.email_temp, currentUser.activity_log);
                if (result === 6) {
                    return res.json({"result": "update email failed please try again", "code": "6"});
                }
                //remove all token
                let allToken = await ftSearch('sbloginIndex', `@user_id:${currentUser._id}`);
                for (let row of allToken) {
                    await ioredis.del(row.key);
                }
                let url = AppConfig.FRONTEND_URL;
                let htmlTemplate = generateEmailTemplate("hacker_verify_email",currentUser.fn,{url}, true);
                await sendMail(currentUser.email_temp, lang.verify_change_email_subject, htmlTemplate);
                res.json({"result": lang.verify_change_email_success, "code": "0"});
            } else {
                res.json({"result": lang.verify_change_email_failed, "code": "3"});
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

});


/**
 * @swagger
 * /hacker/user/UploadCert:
 *   post:
 *     tags:
 *       - hacker
 *     description: upload cert file hacker
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : cert
 *         type : file
 *         in: formData
 *         required : true
 *         description : cert file
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: |
 *               <pre>
 *               {"code":"-1","result":"token is empty","is_login":"-1"}
 *               {"code":"-1","result":"token invalid","is_login":"-1"}
 *               {"code":"-1","result":"token expire","is_login":"-1"}
 *               {"code":"-2","result":"account is not verify","is_login":"-2"}
 *               {"code":"-3","result":"account is disabled","is_login":"-3"}
 *               {"code":"0","result":"saved","is_login":"0","certificate_files":[]}
 *               {"code":"1","result":"max file upload","is_login":"0"}
 *               {"code":"2","result":"invalid file","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
async function upload_cert_check(req, file, cb) {
    try {
        req.uploadDirs = uploadDirs
        let user = hacker.get('hackerUser');
        if (!isUndefined(user.certificate_files) && isArray(user.certificate_files)) {
            if (user.certificate_files.length >= 15) {
                req.validationErrors = {"result": lang.upload_cert_error_max_file, "code": "1", "is_login": "0"};
                cb(null, false);
                return;
            }
        }
        req.validationErrors = "";
        fileFilter(req, file, cb);
    } catch (e) {
        if (isDebug)
            req.validationErrors = {"result": e.toString()};
        else
            req.validationErrors = {"result": "Internal Server Error!"};
        cb(null, false);
    }
};
const uploader_cert = multer({storage: storage, fileFilter: upload_cert_check});
let uploadFilesCert = uploader_cert.fields([{name: 'cert', maxCount: 1}]);
router.post('/UploadCert', isAuth, uploadFilesCert, async (req, res) => {
    try {
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
            return;
        }
        if (!isUndefined(req.validationErrors) && req.validationErrors != "") {
            res.json(req.validationErrors);
            return;
        }
        let user = hacker.get('hackerUser');
        var isUpload = Object.keys(req.files).length;
        if (isUpload == 0) {
            res.json({"result": "file not send", "code": "2", "is_login": "0"});
            return;
        } else {
            let file_original_name = '';
            let filename = "";
            if (req.files && Object.keys(req.files).length > 0 && !isUndefined(req.files.cert)) {
                filename = req.files.cert[0].filename;
                file = `hacker/certificate/${filename}`;
                file_original_name = safeString(req.files.cert[0].originalname);
            }
            let resultSave = await model.addCertFile(user._id, file, file_original_name);
            let user2 = await model.getRow(user._id);
            let certificate_files = user2.certificate_files.map(item => {
                item.file_name = AppConfig.API_URL + item.file_name
                return item;
            });
            res.json({
                "result": lang.upload_cert_success
                , "certificate_files": certificate_files
                , "code": "0", "is_login": "0"
            });
        }
    } catch (e) {
        if (isSentry)
            Sentry.captureException(e);
        if (isDebug)
            res.status(500).json({"result": e.toString()});
        else
            res.status(500).json({"result": "Internal Server Error!"});
    }
});


/**
 * @swagger
 * /hacker/user/DeleteCert:
 *   delete:
 *     tags:
 *       - hacker
 *     description: delete cert file hacker
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : cert_file_id
 *         type : string
 *         in: formData
 *         description : cert_file_id
 *         required : true
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: |
 *               <pre>
 *               {"code":"-1","result":"token is empty","is_login":"-1"}
 *               {"code":"-1","result":"token invalid","is_login":"-1"}
 *               {"code":"-1","result":"token expire","is_login":"-1"}
 *               {"code":"-2","result":"account is not verify","is_login":"-2"}
 *               {"code":"-3","result":"account is disabled","is_login":"-3"}
 *               {"code":"0","result":"delete ok","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.delete('/DeleteCert', isAuth, uploader.none(), async (req, res) => {
    try {
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else {
            let user = hacker.get('hackerUser');
            let cert_file_id = safeString(req.body.cert_file_id);
            let cert_file = {};
            if (user.certificate_files.length > 0) {
                cert_file = user.certificate_files.find((certFile) => {
                    return certFile._id.equals(cert_file_id);
                });
            }
            if (!isUndefined(cert_file) && !isUndefined(cert_file.file_name) && cert_file.file_name !== "") {
                let path = appDir + 'media/' + cert_file.file_name;
                fs.stat(path, async (err, stats) => {
                    if (!err && stats.isFile())
                        fs.unlinkSync(path);
                });
                let resultSave = await model.deleteCertFile(user._id, cert_file_id);
            }
            res.json({"result": lang.delete_CVE_success, "code": "0", "is_login": "0"});
        }
    } catch (e) {
        if (isSentry)
            Sentry.captureException(e);
        if (isDebug)
            res.status(500).json({"result": e.toString()});
        else
            res.status(500).json({"result": "Internal Server Error!"});
    }

});


/**
 * @swagger
 * /hacker/user/statisticsSubmitReport:
 *   get:
 *     tags:
 *       - hacker
 *     description: get hacker statistics submit report
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: |
 *               <pre>
 *               {"code":"-1","result":"token is empty","is_login":"-1"}
 *               {"code":"-1","result":"token invalid","is_login":"-1"}
 *               {"code":"-1","result":"token expire","is_login":"-1"}
 *               {"code":"-2","result":"account is not verify","is_login":"-2"}
 *               {"code":"-3","result":"account is disabled","is_login":"-3"}
 *               {"code":"0","result":{data},"is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.get('/statisticsSubmitReport', isAuth, uploader.none(), async (req, res) => {
    try {
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else {
            let user = hacker.get('hackerUser');
            let data = await model.statisticsSubmitReport(user._id);
            res.json({"result": data, "code": "0", "is_login": "0"});
        }
    } catch (e) {
        if (isSentry)
            Sentry.captureException(e);
        if (isDebug)
            res.status(500).json({"result": e.toString()});
        else
            res.status(500).json({"result": "Internal Server Error!"});
    }

});


/**
 * @swagger
 * /hacker/user/statisticsTotalBounty:
 *   get:
 *     tags:
 *       - hacker
 *     description: get hacker statistics total bounty
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: |
 *               <pre>
 *               {"code":"-1","result":"token is empty","is_login":"-1"}
 *               {"code":"-1","result":"token invalid","is_login":"-1"}
 *               {"code":"-1","result":"token expire","is_login":"-1"}
 *               {"code":"-2","result":"account is not verify","is_login":"-2"}
 *               {"code":"-3","result":"account is disabled","is_login":"-3"}
 *               {"code":"0","result":{data},"is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.get('/statisticsTotalBounty', isAuth, uploader.none(), async (req, res) => {
    try {
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else {
            let user = hacker.get('hackerUser');
            let data = await model.statisticsTotalBounty(user._id);
            res.json({"result": data, "code": "0", "is_login": "0"});
        }
    } catch (e) {
        if (isSentry)
            Sentry.captureException(e);
        if (isDebug)
            res.status(500).json({"result": e.toString()});
        else
            res.status(500).json({"result": "Internal Server Error!"});
    }

});


/**
 * @swagger
 * /hacker/user/statisticsSeverityReport:
 *   get:
 *     tags:
 *       - hacker
 *     description: get hacker statistics severity report
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: |
 *               <pre>
 *               {"code":"-1","result":"token is empty","is_login":"-1"}
 *               {"code":"-1","result":"token invalid","is_login":"-1"}
 *               {"code":"-1","result":"token expire","is_login":"-1"}
 *               {"code":"-2","result":"account is not verify","is_login":"-2"}
 *               {"code":"-3","result":"account is disabled","is_login":"-3"}
 *               {"code":"0","result":{data},"is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.get('/statisticsSeverityReport', isAuth, uploader.none(), async (req, res) => {
    try {
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else {
            let user = hacker.get('hackerUser');
            let data = await model.statisticsSeverityReport(user._id);
            res.json({"result": data, "code": "0", "is_login": "0"});
        }
    } catch (e) {
        if (isSentry)
            Sentry.captureException(e);
        if (isDebug)
            res.status(500).json({"result": e.toString()});
        else
            res.status(500).json({"result": "Internal Server Error!"});
    }

});

/**
 * @swagger
 * /hacker/user/statisticsVulnerabilityReport:
 *   get:
 *     tags:
 *       - hacker
 *     description: get hacker statistics vulnerability report
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: |
 *               <pre>
 *               {"code":"-1","result":"token is empty","is_login":"-1"}
 *               {"code":"-1","result":"token invalid","is_login":"-1"}
 *               {"code":"-1","result":"token expire","is_login":"-1"}
 *               {"code":"-2","result":"account is not verify","is_login":"-2"}
 *               {"code":"-3","result":"account is disabled","is_login":"-3"}
 *               {"code":"0","result":{data},"is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.get('/statisticsVulnerabilityReport', isAuth, uploader.none(), async (req, res) => {
    try {
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else {
            let user = hacker.get('hackerUser');
            let data = await model.statisticsVulnerabilityReport(user._id);
            res.json({"result": data, "code": "0", "is_login": "0"});
        }
    } catch (e) {
        if (isSentry)
            Sentry.captureException(e);
        if (isDebug)
            res.status(500).json({"result": e.toString()});
        else
            res.status(500).json({"result": "Internal Server Error!"});
    }

});


/**
 * @swagger
 * /hacker/user/join-to-prgoram:
 *   post:
 *     tags:
 *       - hacker
 *     description: join to prgoram
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : invite_id
 *         type : string
 *         in: formData
 *         description : invite_id
 *         required : true
 *       - name : status
 *         type : string
 *         in: formData
 *         description : status
 *         required : true
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: |
 *               <pre>
 *               {"code":"-1","result":"token is empty","is_login":"-1"}
 *               {"code":"-1","result":"token invalid","is_login":"-1"}
 *               {"code":"-1","result":"token expire","is_login":"-1"}
 *               {"code":"-2","result":"account is not verify","is_login":"-2"}
 *               {"code":"-3","result":"account is disabled","is_login":"-3"}
 *               {"code":"0","result":"success","is_login":"0"}
 *               {"code":"1","result":"invite_id is empty","is_login":"0"}
 *               {"code":"2","result":"status is empty","is_login":"0"}
 *               {"code":"3","result":"status is invalid","is_login":"0"}
 *               {"code":"4","result":"invite_id not found","is_login":"0"}
 *               {"code":"5","result":"expire","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/join-to-prgoram', isAuth, uploader.none()
    , [
        check.body('invite_id').trim().not().isEmpty()
            .withMessage({"result": "invite_id is empty", "code": "1", "is_login": "0"}),
        check.body('status').trim().not().isEmpty()
            .withMessage({"result": "status is empty", "code": "2", "is_login": "0"}),
    ]
    , async (req, res) => {
        try {
            const errors = check.validationResult(req);
            if (!errors.isEmpty()) {
                res.json(errors.array()[0].msg);
            } else {
                let user = hacker.get('hackerUser');
                let invite_id = safeString(req.body.invite_id);
                let status = safeString(req.body.status);
                let inviteRow = await model.getInvite(user._id, invite_id);
                if (inviteRow) {
                    let currentDateTime = getTimeStamp();
                    let expireDate = getDate(inviteRow.register_date_time).add(inviteRow.expire_day, 'days').unix();
                    if (currentDateTime <= expireDate) {
                        status = toNumber(status);
                        if (status == 1 || status == 2) {
                            let s = await model.saveInvite(user._id, inviteRow._id, status);
                            res.json({"result": "success!", "code": "0", "is_login": "0"});
                        } else {
                            res.json({"result": "status invalid!", "code": "3", "is_login": "0"});
                        }
                    } else {
                        res.json({"result": "expire!", "code": "5", "is_login": "0"});
                    }
                } else {
                    res.json({"result": "invite_id not found!", "code": "4", "is_login": "0"});
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

    });

/**
 * @swagger
 * /hacker/user/list-invites/:
 *   get:
 *     tags:
 *       - hacker
 *     description: list invites of hacker
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : page
 *         type : string
 *         in: query
 *         description : page
 *       - name : status
 *         type : string
 *         in: query
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: |
 *               <pre>
 *               {"code":"-1","result":"token is empty","is_login":"-1"}
 *               {"code":"-1","result":"token invalid","is_login":"-1"}
 *               {"code":"-1","result":"token expire","is_login":"-1"}
 *               {"code":"-2","result":"account is not verify","is_login":"-2"}
 *               {"code":"-3","result":"account is disabled","is_login":"-3"}
 *               {"code":"0","result":{obj},"is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.get('/list-invites', isAuth, async (req, res) => {
    try {
        let user = hacker.get('hackerUser');
        let status = safeString(req.query.status);
        gSortColumns = ['_id'];
        let resultPagination = await model.getInvitesList(user._id, status);
        res.json({"result": resultPagination, "code": "0", "is_login": "0"});
    } catch (e) {
        if (isSentry)
            Sentry.captureException(e);
        if (isDebug)
            res.status(500).json({"result": e.toString()});
        else
            res.status(500).json({"result": "Internal Server Error!"});
    }

});


/**
 * @swagger
 * /hacker/user/logout:
 *   post:
 *     tags:
 *       - hacker
 *     description: logout hacker
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: |
 *               <pre>
 *               {"code":"-1","result":"token is empty","is_login":"-1"}
 *               {"code":"-1","result":"token invalid","is_login":"-1"}
 *               {"code":"-1","result":"token expire","is_login":"-1"}
 *               {"code":"-2","result":"account is not verify","is_login":"-2"}
 *               {"code":"-3","result":"account is disabled","is_login":"-3"}
 *               {"code":"0","result":"success","is_login":"0"}
 *               {"code":"0","result":"error!","is_login":"1"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/logout', async (req, res) => {
    try {
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else {
            let user = await getHackerLogin(req.headers['x-token'], false, false);
            if (!isNumber(user)) {
                let del = await removeToken(req.headers['x-token']);
                if (del)
                    res.json({"result": "success", "code": "0", "is_login": "0"});
                else
                    res.json({"result": "token not exist", "code": "0", "is_login": "0"});
            } else
                res.json({"result": "token is invalid", "code": "0", "is_login": "0"});
        }
    } catch (e) {
        if (isSentry)
            Sentry.captureException(e);
        if (isDebug)
            res.status(500).json({"result": e.toString()});
        else
            res.status(500).json({"result": "Internal Server Error!"});
    }

});

/**
 * @swagger
 * /hacker/user/update_report_notification_setting:
 *   get:
 *     tags:
 *       - hacker
 *     description: set report notification type
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : report_notification_setting
 *         type : Array[number]
 *         in: formData
 *         required : true
 *         description : report notification setting
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: |
 *               <pre>
 *               {"code":"1","result":"data is invalid","is_login":"0"}
 *               {"code":"2","result":"user is invalid","is_login":"0"}
 *               {"code":"3","result":"user not found","is_login":"0"}
 *               {"code":"-1","result":"token is empty","is_login":"-1"}
 *               {"code":"-1","result":"token invalid","is_login":"-1"}
 *               {"code":"-1","result":"token expire","is_login":"-1"}
 *               {"code":"-2","result":"account is not verify","is_login":"-2"}
 *               {"code":"-3","result":"account is disabled","is_login":"-3"}
 *               {"code":"0","result":"report notification successfully updated","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/update_report_notification_setting', isAuth, uploader.none(), async (req, res) => {
    try {
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else {
            let report_notification_setting = req.body.report_notification_setting;
            if (!report_notification_setting) {
                return res.json({"result": "data is invalid", "code": "1", "is_login": "0"});
            }
            report_notification_setting = JSON.parse(JSON.stringify(report_notification_setting));
            for (const setting in report_notification_setting) {
                if (setting.indexOf('advance') === -1) {
                    if (!(report_notification_setting[setting] >= 0 && report_notification_setting[setting] < 5)) {
                        return res.json({"result": "data is invalid", "code": "1", "is_login": "0"});
                    }
                } else {
                    if (
                        !isArray(report_notification_setting[setting])
                        || !report_notification_setting[setting].every(type => {
                            return type >= 0 && type < 5
                        })
                        || report_notification_setting[setting].some(x => report_notification_setting[setting].indexOf(x) !== report_notification_setting[setting].lastIndexOf(x))
                    ) {
                        return res.json({"result": "data is invalid", "code": "1", "is_login": "0"});
                    }
                }
            }

            let user = hacker.get('hackerUser');
            let result = await model.setReportNotificationType(user._id, report_notification_setting);
            if (result === 3) {
                return res.json({"result": "user not found", "code": "3", "is_login": "0"});
            }
            res.json({"result": "report notification successfully updated", "code": "0", "is_login": "0"});
        }
    } catch (e) {
        if (isSentry)
            Sentry.captureException(e);
        if (isDebug)
            res.status(500).json({"result": e.toString()});
        else
            res.status(500).json({"result": "Internal Server Error!"});
    }

});


/**
 * @swagger
 * /hacker/user/enable_google_authenticator_step1:
 *   post:
 *     tags:
 *       - hacker
 *     description: enable google authenticator
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: |
 *               <pre>
 *               {"code":"-1","result":"token is empty","is_login":"-1"}
 *               {"code":"-1","result":"token invalid","is_login":"-1"}
 *               {"code":"-1","result":"token expire","is_login":"-1"}
 *               {"code":"-2","result":"account is not verify","is_login":"-2"}
 *               {"code":"-3","result":"account is disabled","is_login":"-3"}
 *               {"code":"1","result":"alredy enable","is_login":"0"}
 *               {"code":"0","result":"success","image":"base64image...","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/enable_google_authenticator_step1', isAuth, uploader.none(), async (req, res) => {
    try {
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else {
            let user = hacker.get('hackerUser');
            if (!isUndefined(user.google_towfa_status) && user.google_towfa_status == 1) {
                res.json({"result": "alredy enable!", "code": "1", "is_login": "0"});
            } else {
                let secret2FaKey = otplib.authenticator.generateSecret(40);
                let encryptSecret2FaKey = encryptionString(secret2FaKey);
                await model.save2faKey(user._id, encryptSecret2FaKey);
                let svg = new QRCode({
                    content: `otpauth://totp/${user.email}?secret=${secret2FaKey}&issuer=SecureBug&algorithm=SHA1&digits=6&period=30`,
                    padding: 4,
                    width: 256,
                    height: 256,
                    color: "#000000",
                    background: "#ffffff",
                    ecl: "M",
                }).svg();
                res.json({"result": "success", "qrcode": tob64(svg), "code": "0", "is_login": "0"});
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

});

/**
 * @swagger
 * /hacker/user/enable_google_authenticator_step2:
 *   post:
 *     tags:
 *       - hacker
 *     description: enable google authenticator
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : code
 *         type : string
 *         in: formData
 *         required : true
 *         description : code
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: |
 *               <pre>
 *               {"code":"-1","result":"token is empty","is_login":"-1"}
 *               {"code":"-1","result":"token invalid","is_login":"-1"}
 *               {"code":"-1","result":"token expire","is_login":"-1"}
 *               {"code":"-2","result":"account is not verify","is_login":"-2"}
 *               {"code":"-3","result":"account is disabled","is_login":"-3"}
 *               {"code":"1","result":"alredy enable","is_login":"0"}
 *               {"code":"7","result":"code is empty"}
 *               {"code":"8","result":"user not enable google 2fa"}
 *               {"code":"9","result":"code is invalid"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/enable_google_authenticator_step2', uploader.none(),
    [
        check.body('code').trim().not().isEmpty()
            .withMessage({"result": "code is empty", "code": "7"})
    ]
    , async (req, res) => {
        try {
            const errors = check.validationResult(req);
            if (!errors.isEmpty()) {
                res.json(errors.array()[0].msg);
            } else {
                const user = await getHackerLogin(req.headers['x-token'], false);
                if (isNumber(user)) {
                    return res.json({"result": "token is invalid", "code": "-1", "is_login": "0"});
                }
                if (!isUndefined(user.google_towfa_status) && user.google_towfa_status == 1) {
                    res.json({"result": "alredy enable!", "code": "8", "is_login": "0"});
                } else {
                    let code = safeString(req.body.code);
                    if (!isUndefined(user.google_towfa_secret_key) && user.google_towfa_secret_key.length > 0) {
                        let googleKey = decryptionString(user.google_towfa_secret_key).split(":");
                        let checkOpt = google2faCheck(googleKey[0], code);
                        if (checkOpt) {
                            await model.active2fa(user._id);
                            //remove all token
                            let allToken = await ftSearch('sbloginIndex', `@user_id:${user._id}`);
                            for (let row of allToken) {
                                await ioredis.del(row.key);
                            }
                            res.json({"result": "success", "code": "0"});
                        } else {
                            res.json({"result": "code is invalid", "code": "9"});
                        }
                    } else {
                        res.json({"result": "2fa is not active", "code": "10"});
                    }
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

    });


/**
 * @swagger
 * /hacker/user/disabled_google_authenticator:
 *   post:
 *     tags:
 *       - hacker
 *     description: disabled google authenticator
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : code
 *         type : string
 *         in: formData
 *         required : true
 *         description : code
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: |
 *               <pre>
 *               {"code":"-1","result":"token is empty","is_login":"-1"}
 *               {"code":"-1","result":"token invalid","is_login":"-1"}
 *               {"code":"-1","result":"token expire","is_login":"-1"}
 *               {"code":"-2","result":"account is not verify","is_login":"-2"}
 *               {"code":"-3","result":"account is disabled","is_login":"-3"}
 *               {"code":"1","result":"code is empty","is_login":"0"}
 *               {"code":"2","result":"not enable 2fa","is_login":"0"}
 *               {"code":"3","result":"code is invalid","is_login":"0"}
 *               {"code":"0","result":"success","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/disabled_google_authenticator', isAuth, uploader.none()
    , [
        check.body('code').trim().not().isEmpty()
            .withMessage({"result": "code is empty", "code": "1", "is_login": "0"}),
    ]
    , async (req, res) => {
        try {
            const errors = check.validationResult(req);
            if (!errors.isEmpty()) {
                res.json(errors.array()[0].msg);
            } else {
                let user = hacker.get('hackerUser');
                if (!isUndefined(user.google_towfa_secret_key) && user.google_towfa_secret_key.length > 0) {
                    let code = safeString(req.body.code);
                    let googleKey = decryptionString(user.google_towfa_secret_key).split(":");

                    let checkOpt = google2faCheck(googleKey[0], code);
                    if (checkOpt) {
                        await model.reset2aKey(user._id);
                        res.json({"result": "success", "code": "0", "is_login": "0"});
                    } else {
                        res.json({"result": "code is invalid", "code": "3", "is_login": "0"});
                    }
                } else {
                    res.json({"result": "not enable 2fa", "code": "2", "is_login": "0"});
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

    });

/**
 * @swagger
 * /hacker/user/list_session:
 *   get:
 *     tags:
 *       - hacker
 *     description: list of session for user
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: |
 *               <pre>
 *               {"code":"-1","result":"token is empty","is_login":"-1"}
 *               {"code":"-1","result":"token invalid","is_login":"-1"}
 *               {"code":"-1","result":"token expire","is_login":"-1"}
 *               {"code":"-2","result":"account is not verify","is_login":"-2"}
 *               {"code":"-3","result":"account is disabled","is_login":"-3"}
 *               {"code":"0","result":[data],"is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.get('/list_session', uploader.none(), async (req, res) => {
    try {
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else {
            let user = await getHackerLogin(req.headers['x-token'], false);
            if (isNumber(user)) {
                res.json({"result": "token is invalid", "code": "-1", "is_login": "0"});
            }
            const sessions = await model.listSession(user._id, req.headers['x-token']);
            res.json({"result": sessions, "code": "0", "is_login": "0"});
        }
    } catch (e) {
        if (isSentry)
            Sentry.captureException(e);
        if (isDebug)
            res.status(500).json({"result": e.toString()});
        else
            res.status(500).json({"result": "Internal Server Error!"});
    }

});


/**
 * @swagger
 * /hacker/user/delete_user_session:
 *   post:
 *     tags:
 *       - hacker
 *     description: delete user session
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : token_key
 *         type : string
 *         in: formData
 *         required : true
 *         description : token_key
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: |
 *               <pre>
 *               {"code":"-1","result":"token is empty","is_login":"-1"}
 *               {"code":"-1","result":"token invalid","is_login":"-1"}
 *               {"code":"-1","result":"token expire","is_login":"-1"}
 *               {"code":"-2","result":"account is not verify","is_login":"-2"}
 *               {"code":"-3","result":"account is disabled","is_login":"-3"}
 *               {"code":"0","result":"success","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/delete_user_session', uploader.none()
    , [
        check.body('session_hash_id').trim().not().isEmpty()
            .withMessage({"result": "session_hash_id is empty", "code": "1", "is_login": "0"}),
    ]
    , async (req, res) => {
        try {
            const errors = check.validationResult(req);
            if (!errors.isEmpty()) {
                res.json(errors.array()[0].msg);
            } else {
                const session_hash_id = safeString(req.body.session_hash_id);
                let user = await getHackerLogin(req.headers['x-token'], false);
                if (isNumber(user)) {
                    res.json({"result": "token is invalid", "code": "-1", "is_login": "0"});
                }
                const rows = await ftSearch('sbloginIndex', `@session_hash_id:${session_hash_id}`, 'sortby', 'date_time', 'DESC', 'RETURN', '4', 'date_time', 'user_agent', 'ip', 'session_hash_id');
                if (rows && rows.length > 0) {
                    const result = rows[0];
                    if (checkKey(result, 'user_id') && result.user_id == user._id && result.token !== safeString(req.headers['x-token'])) {
                        //delete redis key
                        await delCache('login:' + result.token);
                        res.json({"code": "0", "result": "success", "is_login": "0"});
                    } else {
                        res.json({"code": "2", "result": "can not delete current token!", "is_login": "0"});
                    }
                } else {
                    res.json({"code": "2", "result": "this token is refreshed please get session list and try again", "is_login": "0"});
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

    });

/**
 * @swagger
 * /hacker/user/download:
 *   post:
 *     tags:
 *       - hacker
 *     description: download
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : name
 *         type : string
 *         in: formData
 *         required : true
 *         description : name
 *       - name : type
 *         type : string
 *         in: formData
 *         required : true
 *         description : download
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: |
 *               <pre>
 *               {"code":"-1","result":"token is empty","is_login":"-1"}
 *               {"code":"-1","result":"token invalid","is_login":"-1"}
 *               {"code":"-1","result":"token expire","is_login":"-1"}
 *               {"code":"-2","result":"account is not verify","is_login":"-2"}
 *               {"code":"-3","result":"account is disabled","is_login":"-3"}
 *               {"code":"0","result":"success","is_login":"0"}
 *               {"code":"1","result":"name is empty","is_login":"0"}
 *               {"code":"2","result":"type is empty","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/download', uploader.none()
    , [
        check.body('name').trim().not().isEmpty()
            .withMessage({"result": "name is empty", "code": "1", "is_login": "0"}),
        check.body('type').trim().not().isEmpty()
            .withMessage({"result": "type is empty", "code": "2", "is_login": "0"}),
    ]
    , async (req, res) => {
        try {
            const errors = check.validationResult(req);
            if (!errors.isEmpty()) {
                res.json(errors.array()[0].msg);
            } else {
                let user = await getHackerLogin(req.headers['x-token'], false);
                if (isNumber(user)) {
                    res.status(400).json({"result": "token is invalid", "code": "-1", "is_login": "0"});
                }
                const name = safeString(req.body.name);
                const type = safeString(req.body.type);
                const id = safeString(req.body.id);
                const is_file_owner = await model.checkIsFileOwner(user, name, type, id);
                if (!is_file_owner) {
                    return res.status(400).json({result: 'you can not download this file.', code: 1, is_login: 0});
                }
                const directory_file = path.join(__dirname, `../../../media/${name}`);
                fs.access(directory_file, fs.F_OK, (err) => {
                    if (err) {
                        return res.status(400).json({result: 'file not exist.', code: 1, is_login: 0});
                    }
                    return res.download(directory_file);
                });
            }
        } catch (e) {
            if (isSentry)
                Sentry.captureException(e);
            if (isDebug)
                res.status(500).json({"result": e.toString()});
            else
                res.status(500).json({"result": "Internal Server Error!"});
        }

    });
module.exports = router;
