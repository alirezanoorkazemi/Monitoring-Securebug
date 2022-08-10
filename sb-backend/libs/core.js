KEY_IO = "io_token_";
modelInstance = [];
gSortColumns = [];
gUrlQuery = null;
gPage = 1;
gLimit = 10;
gSortType = 'DESC';
gSortType2 = -1;
gSortType3 = -1;
gSortColumn = '_id';
const SysLogger = require('ain2');
const OauthHelper = require('./oauth1-helper');
syslog = new SysLogger({tag: AppConfig.SYS_LOG_TAG, facility: 'user'});
request = require('request-promise');
sanitizeHtml = require('sanitize-html');
exceljs = require('exceljs');
nodemailer = require("nodemailer");
numeral = require('numeral');
numbro = require('numbro');
moment = require('moment');
RSA = require('hybrid-crypto-js').RSA;
Crypt = require('hybrid-crypto-js').Crypt;
moment.suppressDeprecationWarnings = true;
momentTimeZone = require('moment-timezone');
jmoment = require('moment-jalaali');
crypto = require('crypto');
http = require('http');
https = require('https');
Q = require('q');
fs = require('fs');
path = require('path');
const Redis = require("ioredis");
ioredis = new Redis(AppConfig.REDIS_PORT, AppConfig.REDIS_HOST);
appDir = path.dirname(require.main.filename) + '/';
express = require('express');
session = require('express-session');
const redis = require('redis');
RedisStore = require('connect-redis')(session);
RedisClient = redis.createClient({
    host: AppConfig.REDIS_HOST,
    port: AppConfig.REDIS_PORT,
});
adaro = require('adaro');
svgCaptcha = require('svg-captcha');
bodyParser = require('body-parser');
const Entities = require('html-entities').XmlEntities;
const entities = new Entities();
check = require('express-validator');
multer = require('multer');

axios = require('axios');

otplib = require('otplib');
otplib.authenticator.options = {digits: 6};
otplib.totp.options = {digits: 6};
QRCode = require("qrcode-svg");


const createDOMPurify = require('dompurify');
const jsdom = require('jsdom').JSDOM;
const window = new jsdom().window;
DOMPurify = createDOMPurify(window);

io = require('socket.io')();
adminIO = io.of('/admin');
hackerIO = io.of('/hacker');
companyIO = io.of('/company');
moderatorIO = io.of('/moderator');


Sentry = require("@sentry/node");
Tracing = require("@sentry/tracing");

Sentry.init({
    dsn: "https://cb2bd854f39748e694fe8f398f578bec@o481737.ingest.sentry.io/5571925",
    tracesSampleRate: 1.0,
});


sharp = require('sharp');


//for editor clean xss
cleanXSS = function (str) {
    try {
        str = text2html(str);
        str = DOMPurify.sanitize(str);
        var clean = sanitizeHtml(str, {
            allowedTags: ['strong', 'i', 'ul', 'li', 'ol', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p'],
            allowedAttributes: {},
            allowedIframeHostnames: []
        });
        return clean;
    } catch (e) {
        return '';
    }
}

function getLine(offset) {
    try {
        var stack = new Error().stack.split('\n'),
            line = stack[(offset || 1) + 1].split(':');
        return parseInt(line[line.length - 2], 10);
    } catch (e) {
        return 0;
    }
}

global.__defineGetter__('__line', function () {
    return getLine(2);
});

fileFilter = function (req, file, cb) {
    try {
        let resultType = getTypeFile(file, req.uploadDirs);
        if (resultType === "image") {
            if (validExtensionImage(file.mimetype) !== '')
                cb(null, true);
            else
                cb(null, false);
        } else if (resultType === "file") {
            if (validExtensionFile(file.mimetype) !== '')
                cb(null, true);
            else
                cb(null, false);

        } else if (resultType === "video") {
            if (validExtensionVideo(file.mimetype) !== '')
                cb(null, true);
            else
                cb(null, false);
        } else if (resultType === "file_image") {
            if (validExtensionFileImage(file.mimetype) !== '')
                cb(null, true);
            else
                cb(null, false);


        } else
            cb(null, false);
    } catch (e) {
        cb(null, false);
    }

};

storage = multer.diskStorage({
    destination: function (req, file, cb) {
        try {
            let dirResult = req.uploadDirs.find(o => o.field === file.fieldname);
            if (!isUndefined(dirResult) && checkKey(dirResult, 'dir'))
                cb(null, appDir + `media/${dirResult.dir}/`);
            else
                cb(null, appDir + 'media/');
        } catch (e) {
            cb(null, appDir + 'media/');
        }
    },
    filename: function (req, file, cb) {
        let resultType = getTypeFile(file, req.uploadDirs);
        let typeFile = '';
        if (resultType === "image")
            typeFile = validExtensionImage(file.mimetype);
        else if (resultType === 'file')
            typeFile = validExtensionFile(file.mimetype);
        else if (resultType === 'video')
            typeFile = validExtensionVideo(file.mimetype);
        else if (resultType === 'file_image')
            typeFile = validExtensionFileImage(file.mimetype);
        cb(null, file.fieldname.replace('[]', '') + makeHash("" + getTimeStamp()
            + random2(99999999999)
        ) + '.' + typeFile);
    }
});


uploader = multer({storage: storage, fileFilter: fileFilter});

validExtensionImage = function (str) {
    if (str === 'image/jpeg' || str === 'image/jpg')
        return 'jpg';
    else if (str === 'image/png')
        return 'png';
    else if (str === 'image/gif')
        return 'gif';
    else
        return '';
}

validExtensionFile = function (str) {
    if (str === 'application/pdf')
        return 'pdf';
    else if (str === 'application/msword')
        return 'dox';
    else if (str === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
        return 'docx';
    else
        return '';
}

validExtensionVideo = function (str) {
    if (str === 'video/mp4')
        return 'mp4';
    else
        return '';
}

validExtensionFileImage = function (str) {
    if (str === 'application/pdf')
        return 'pdf';
    else if (str === 'image/jpeg' || str === 'image/jpg')
        return 'jpg';
    else if (str === 'image/png')
        return 'png';
    else if (str === 'image/gif')
        return 'gif';
    else if (str === 'video/mp4')
        return 'mp4';
    else
        return '';
}


getTypeFile = function (file, uploadDirs) {
    let typeResult = uploadDirs.find(o => o.field === file.fieldname);
    if (!isUndefined(typeResult) && checkKey(typeResult, 'type')) {
        if (typeResult.type === "image") {
            return "image";
        } else if (typeResult.type === "video") {
            return "video";
        } else if (typeResult.type === "file_image") {
            return "file_image";
        } else {
            return 'file';
        }
    } else
        return '';
}

mongoose = require('mongoose');
mongoose.connect(AppConfig.DB_URI, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);
// optionsDust = {
//     cache: false,
//     helpers: [
//         'dustjs-helpers',
//         function (dust) {
//             dust.helpers.random = function (chunk, context, bodies, params) {
//                 let html = Math.random();
//                 body = bodies.block;
//                 chunk.write(html);
//                 chunk.render(body, context);
//                 return chunk;
//             },
//                 dust.helpers.alertDanger = function (chunk, context, bodies, params) {
//                     if (gUrlQuery && gUrlQuery.msg === context.resolve(params.key)) {
//                         let html = `<div class="alert alert-danger text-center">${context.resolve(params.msg)}</div>`;
//                         body = bodies.block;
//                         chunk.write(html);
//                         chunk.render(body, context);
//                         return chunk;
//                     }
//                 },
//                 dust.helpers.eval = function (chunk, context, bodies, params) {
//                     return chunk.map(async (chunk) => {
//                         try {
//                             var expression = '';
//                             chunk.tap(function (data) {
//                                 expression += data;
//                                 return '';
//                             }).render(bodies.block, context).untap();
//                             eval(expression);
//                             let result = await code();
//                             return chunk.write(result).end();
//                         } catch (e) {
//                             return chunk.render(bodies.block, context).end(e.toString());
//                         }
//                     });
//                 },
//                 dust.helpers.alertSuccess = function (chunk, context, bodies, params) {
//                     if (gUrlQuery && gUrlQuery.msg === context.resolve(params.key)) {
//                         let html = `<div class="alert alert-success text-center">${context.resolve(params.msg)}</div>`;
//                         body = bodies.block;
//                         chunk.write(html);
//                         chunk.render(body, context);
//                         return chunk;
//                     }
//                 },
//                 dust.helpers.g2j = function (chunk, context, bodies, params) {
//                     let date = context.resolve(params.date);
//                     body = bodies.block;
//                     chunk.write(g2j(date));
//                     chunk.render(body, context);
//                     return chunk;
//                 },
//                 dust.helpers.g2j2 = function (chunk, context, bodies, params) {
//                     let date = context.resolve(params.date);
//                     body = bodies.block;
//                     chunk.write(dateTime2j(date));
//                     chunk.render(body, context);
//                     return chunk;
//                 },
//                 dust.helpers.date2date = function (chunk, context, bodies, params) {
//                     let date = context.resolve(params.date);
//                     body = bodies.block;
//                     chunk.write(date2date(date));
//                     chunk.render(body, context);
//                     return chunk;
//                 },
//                 dust.helpers.pagination = function (chunk, context, bodies, params) {
//                     let url = context.resolve(params.url);
//                     let totalPage = context.resolve(params.totalPage);
//                     let html = paginationRender(url, totalPage);
//                     body = bodies.block;
//                     chunk.write(html);
//                     chunk.render(body, context);
//                     return chunk;
//                 },
//                 dust.helpers.paginationAjax = function (chunk, context, bodies, params) {
//                     let url = context.resolve(params.url);
//                     let totalPage = context.resolve(params.totalPage);
//                     let html = paginationRenderAjax(url, totalPage);
//                     body = bodies.block;
//                     chunk.write(html);
//                     chunk.render(body, context);
//                     return chunk;
//                 },
//                 dust.helpers.orderColumn = function (chunk, context, bodies, params) {
//                     let url = context.resolve(params.url);
//                     let field = context.resolve(params.field);
//                     let title = context.resolve(params.title);
//                     let html = orderColumn(url, field, title);
//                     body = bodies.block;
//                     chunk.write(html);
//                     chunk.render(body, context);
//                     return chunk;
//                 },
//                 dust.helpers.orderColumnAjax = function (chunk, context, bodies, params) {
//                     let url = context.resolve(params.url);
//                     let field = context.resolve(params.field);
//                     let title = context.resolve(params.title);
//                     let html = orderColumnAjax(url, field, title);
//                     body = bodies.block;
//                     chunk.write(html);
//                     chunk.render(body, context);
//                     return chunk;
//                 },
//                 dust.helpers.renderID = function (chunk, context, bodies, params) {
//                     let totalRows = context.resolve(params.totalRows);
//                     let obj = renderID(totalRows);
//                     let html;
//                     if (isUndefined(context.options.locals.start_number))
//                         context.options.locals.start_number = obj['start_number'];
//                     if (obj.opt === "+") {
//                         html = ++context.options.locals.start_number;
//                     } else {
//                         html = --context.options.locals.start_number;
//                     }
//                     body = bodies.block;
//                     chunk.write(html);
//                     chunk.render(body, context);
//                     return chunk;
//                 },
//                 dust.helpers.callModel = function (chunk, context, bodies, params) {
//                     return chunk.map(async (chunk) => {
//                         try {
//                             let path = context.resolve(params.path);
//                             let className = context.resolve(params.className);
//                             let methodName = context.resolve(params.methodName);
//                             let paramsData = context.resolve(params.params);
//                             var objPrams;
//                             if (paramsData !== '') {
//                                 let paramsModel = `objPrams = ${paramsData};`;
//                                 eval(paramsModel);
//                             }


//                             let obj = null;
//                             if (modelInstance.indexOf(className) === -1) {
//                                 obj = require(appDir + path);
//                                 modelInstance[className] = obj;
//                             } else {
//                                 obj = modelInstance[className];
//                             }

//                             let html = await obj[methodName].apply(obj, objPrams);

//                             if (typeof html === "string") {
//                                 return chunk.render(bodies.block, context).end(html);
//                             } else {
//                                 return chunk.render(bodies.block, context.push(html)).end();
//                             }
//                         } catch (e) {
//                             return chunk.render(bodies.block, context).end(e.toString());
//                         }
//                     });
//                 }
//                 , dust.helpers.nl2br = function (chunk, context, bodies, params) {
//                 let str = context.resolve(params.str);
//                 let html = nl2br(str);
//                 body = bodies.block;
//                 chunk.write(html);
//                 chunk.render(body, context);
//                 return chunk;
//             }
//                 , dust.helpers.format_number = function (chunk, context, bodies, params) {
//                 let str = context.resolve(params.str);
//                 let html = format_number(str);
//                 body = bodies.block;
//                 chunk.write(html);
//                 chunk.render(body, context);
//                 return chunk;
//             }
//                 , dust.helpers.text2html = function (chunk, context, bodies, params) {
//                 let text = context.resolve(params.text);
//                 text = text.replace(/\.\.\//g, '');
//                 let html = text2html(text);
//                 body = bodies.block;
//                 chunk.write(html);
//                 chunk.render(body, context);
//                 return chunk;
//             }
//                 , dust.helpers.loop = function (chunk, context, bodies, params) {
//                 try {
//                     let obj = toJSON(context.resolve(params.obj));
//                     let varname = context.resolve(params.varname);
//                     var items = [];
//                     for (let row of obj) {
//                         let ret = {};
//                         ret[varname] = row;
//                         items.push(ret);
//                     }
//                     return chunk.section(items, context, bodies);
//                 } catch (e) {
//                     body = bodies.block;
//                     chunk.write('');
//                     chunk.render(body, context);
//                     return chunk;
//                 }
//             }
//                 , dust.helpers.json2Str = function (chunk, context, bodies, params) {
//                 let data = context.resolve(params.data);
//                 let html = tob64(json2Str(toJSON(data)));
//                 body = bodies.block;
//                 chunk.write(html);
//                 chunk.render(body, context);
//                 return chunk;
//             }
//                 , dust.helpers.renderIDPlus = function (chunk, context, bodies, params) {
//                 let totalRows = context.resolve(params.totalRows);
//                 let obj = renderID(totalRows);
//                 let html;
//                 if (isUndefined(context.options.locals.start_number))
//                     context.options.locals.start_number = 1;
//                 html = context.options.locals.start_number++;
//                 body = bodies.block;
//                 chunk.write(html);
//                 chunk.render(body, context);
//                 return chunk;
//             }


//         }
//     ]

// };


getUserId = function (user) {

    return user.parent_user_id || user._id;

};

getMemberFields = function () {
    return ["tax_file", "avatar_file", "role", "organization_name", "display_name", "status", "is_verify", "admin_verify", "company_country_id", "address1", "address2",
        "city", "region", "postal_code", "payment_paypal_email", "organization_no", "phone",
        "invoice_address_country_id", "invoice_address_email", "invoice_address_company_name", "invoice_address_address1",
        "invoice_address_address2", "invoice_address_city", "invoice_address_reference",
        "invoice_address_zip_code", "credit_card_number", "credit_date", "credit_cvc", "credit_bank_holder_name",
        "credit_currency_id", "member_users", "is_fully_manage"];
}

getCompanyUserAccessLevel = function (access_level) {
    switch (access_level) {
        case ROLES.SUPPER_ADMIN:
            return ROLES_NAME.SUPPER_ADMIN;
        case ROLES.ADMIN:
            return ROLES_NAME.ADMIN;
        case ROLES.VIEWER:
            return ROLES_NAME.VIEWER;
        case ROLES.OBSERVER:
            return ROLES_NAME.OBSERVER;
    }
};

ACTIONS = Object.freeze({
    READ: "read",
    CREATE: "create",
    UPDATE: "update",
    DELETE: "delete",
});

 NEXT_GEN_DURATION_TYPE = Object.freeze({
    SIX_MONTH: 6,
    TWELVE_MONTH : 12,
    VALUES: [6 , 12]
});

ADMIN_ROLES = Object.freeze({
    ADMIN: "1",
    MODERATOR: "2"
});
ADMIN_ROLES_NAME = Object.freeze({
    ADMIN: "admin",
    MODERATOR: "moderator"
});

getAdministrationUserAccessLevel = function (access_level) {
    switch (access_level) {
        case ADMIN_ROLES.ADMIN:
            return ADMIN_ROLES_NAME.ADMIN;
        case ADMIN_ROLES.MODERATOR:
            return ADMIN_ROLES_NAME.MODERATOR;
    }
};
ADMIN_RESOURCES = Object.freeze({
    USER: "user",
    COMPANY: "company",
    PROGRAM: "program",
    REPORT: "report",
    HACKER: "hacker",
    MODERATOR: "moderator",
    CTF: "ctf",
    COUNTRY: "country",
    LANGUAGE: "language",
    CURRENCY: "currency",
    TARGET_TYPE: "target_type",
    SKILL: "skill",
    RANGE: "range",
    STATISTICS: "statistics"
});

PROGRAM_STATUS = Object.freeze({
    PROGRESS: 0,
    PENDING: 1,
    APPROVED: 2,
    REJECT: 3,
    CLOSE: 4
});
getProgramStatuses = function () {
    return [0, 1, 2, 3, 4];
}
PROGRAM_TYPE = Object.freeze({
    PUBLIC: 1,
    PRIVATE: 2
});

getProgramTypes = function () {
    return [1, 2];
}

PROGRAM_BOUNTY_TYPE = Object.freeze({
    BUG_BOUNTY: 0,
    NEXT_GEN_PEN_TEST: 1,
    INTELLIGENCE_DISCOVERY: 2,
    THREAT_BOUNTY: 3
});

INTEGRATION_TYPE = Object.freeze({
    JIRA:1
});

INTEGRATION_AUTH_STATUS = Object.freeze({
    ACTIVE:1,
    INACTIVE:2,
});

getProgramBountyTypes = function () {
    return [0, 1, 2, 3];
}

HACKER_IDENTITY = Object.freeze({
    PENDING: 0,
    APPROVED: 1,
    REJECTED: 2
});

getHackerIdentity = function () {
    return [0, 1, 2];
}

REPORT_STATUS = Object.freeze({
    NONE: 0,
    PENDING: 1,
    MODIFICATION: 2,
    TRIAGE: 3,
    APPROVE: 4,
    REJECT: 5,
    DUPLICATE: 6,
    RESOLVED: 7,
    NOT_APPLICABLE: 8,
    IN_PROGRESS_BY_ADMIN: 20,
    VALUES: [1, 2, 3, 4, 5, 6, 7, 8]
});

getReportStatuses = function () {
    return [1, 2, 3, 4, 5, 6, 7, 8];
}

convertSetOrMapToArray = function (data) {
    const response = [];
    data.size > 0 && data.forEach(value => response.push({data: value.data, id: value.id}));
    return response;
};

MESSAGE_TYPE = Object.freeze({
    INFO: 1,
    DANGER: 2,
    SUCCESS: 3,
    WARNING: 4,
    VALUES: [1, 2, 3, 4]
});

PRODUCT_TYPE = Object.freeze({
    STARTER: 1,
    PROFESSIONAL: 2,
    ENTERPRISE: 3,
    VALUES: [1, 2, 3]
});

NOTIFICATION_STATUS = Object.freeze({
    SEND: 1,
    READ: 2
});

ACTION_TYPE = Object.freeze({
    CREATE: 1,
    READ: 2,
    UPDATE: 3,
    DELETE: 4,
});

FIELD_TYPE = Object.freeze({
    OTHER: 0,
    STATUS: 1,
    VERIFICATION: 2,
    ACTIVITY: 3,
    ADMIN_VERIFICATION: 4,
    FULLY_MANAGE: 5,
    TAG: 6,
    IDENTITY_STATUS: 7,
    COINS: 8,
    REWARD: 9,
    SEVERITY: 10,
    COMMENT: 11,
});

SENDER_TYPE = Object.freeze({
    ADMIN: 1,
    MODERATOR: 2,
    COMPANY: 3,
    HACKER: 4
});

RESOURCE_TYPE = Object.freeze({
    HACKER: 1,
    REPORT: 2,
    COMPANY: 3,
    PROGRAM: 4,
    COMMENT: 5,
    PAYMENT: 6,
    PROGRAM_INVITE: 7,
    CTF: 8,
    CHALLENGE: 9,
});

ACTIVITY_TEXT_LOG = Object.freeze({
    CHANGE_FULLY_MANAGE: 'Change Fully Manage',
    CHANGE_ADMIN_VERIFICATION: 'Change Admin Verification',
    CHANGE_VERIFICATION: 'Change Verification',
    SET_EXPIRE_DAY: 'Set Expire Day',
    UPDATE_COMPANY: 'Update Company',
    UPDATE_HACKER: 'Update Hacker',
    UPDATE_REPORT: 'Update Report',
    DELETE_REPORT: 'Delete Report',
    DELETE_HACKER: 'Delete Hacker',
    DELETE_COMPANY: 'Delete Company',
    SUBMIT_CHALLENGE: 'Submit Challenge',
    WITHDRAW_REQUEST: 'Withdraw Request',
    SUBMIT_REPORT: 'Submit Report',
    SUBMIT_COMMENT: 'Submit Comment',
    SEND_NOTIFICATION: 'Send Notification',
    SEND_EMAIL: 'Send Email',
    REGISTER: 'Register',
    TWO_FA_LOGIN: '2FA Login',
    RESET_PASSWORD: 'Reset Password',
    CHANGE_PASSWORD: 'Change Password',
    UPDATE_PROFILE: 'Update Profile',
    UPDATE_PERSONAL_INFO: 'Update Personal Info',
    LOGIN: 'Login',
    LOGOUT: 'Logout',
    VERIFY_EMAIL: 'Verify Email',
    UPDATE_ACTIVITY: 'Update Activity',
    UPDATE_SKILLS: 'Update Skills',
    UPLOAD_CVE: 'Upload CVE',
    UPLOAD_TAX: 'Upload Tax',
    DELETE_TAX: 'Delete Tax',
    UPLOAD_AVATAR: 'Upload Avatar',
    DELETE_AVATAR: 'Delete Avatar',
    DELETE_CVE: 'Delete CVE',
    UPDATE_INVITATION: 'Update Invitation',
    UPDATE_USDT_PAYMENT: 'Update USDT Payment',
    CLEAR_USDT_PAYMENT: 'Clear USDT Payment',
    UPDATE_PAYPAL_PAYMENT: 'Update Paypal Payment',
    UPDATE_CREDIT_CARD: 'Update Credit Card',
    UPDATE_INVOICE: 'Update Invoice',
    CLEAR_PAYPAL_PAYMENT: 'Clear Paypal Payment',
    UPDATE_IBAN_PAYMENT: 'Update Iban Payment',
    CLEAR_IBAN_PAYMENT: 'Clear Iban Payment',
    UPDATE_PASSPORT_IDENTITY: 'Update Passport',
    DELETE_PASSPORT_IDENTITY: 'Delete Passport',
    UPDATE_CARD_IDENTITY: 'Update Card Identity',
    DELETE_CARD_IDENTITY: 'Delete Card Identity',
    UPDATE_DRIVER_LICENSE: 'Update Driver License',
    DELETE_DRIVER_LICENSE: 'Delete Driver License',
    CHANGE_EMAII: 'Change Email',
    INVITATION_RESPONSE: 'Invitation Response',
    SET_REPORT_NOTIFICATION: 'Set Report Notification',
    ENABLE_2FA: 'Enable 2FA',
    DISABLE_2FA: 'Disable 2FA',
    DELETE_SESSION: 'Delete Session',
    DELETE_COMMENT: 'Delete Comment',
    CREATE_PROGRAM: 'Create Program',
    CREATE_MEMBER: 'Create Member',
    CREATE_USER: 'Create User',
    UPDATE_USER: 'Update User',
    DELETE_USER: 'Delete User',
    UPDATE_SB_COINS: 'Update SB Coins',
    UPDATE_IDENTITY_STATUS: 'Update Identity Status',
    MEMBER_SET_PASSWORD: 'Member Validate Email And Set Password',
    DELETE_MEMBER: 'Delete Member',
    UPDATE_MEMBER: 'Update Member',
    CREATE_TARGET: 'Create Target',
    UPDATE_TARGET: 'Update Target',
    DELETE_TARGET: 'Delete Target',
    CREATE_REWARDS_FOR_ALL_TARGETS: 'Create Rewards For All Targets',
    UPDATE_REWARDS_FOR_ALL_TARGETS: 'Update Rewards For All Targets',
    DELETE_REWARDS_FOR_ALL_TARGETS: 'Delete Rewards For All Targets',
    CREATE_REWARD: 'Create Reward',
    UPDATE_REWARD: 'Update Reward',
    DELETE_REWARD: 'Delete Reward',
    CREATE_POLICIES_FOR_ALL_TARGETS: 'Create Policies For All Targets',
    DELETE_POLICIES_FOR_ALL_TARGETS: 'Delete Policies For All Targets',
    UPDATE_POLICIES_FOR_ALL_TARGETS: 'Update Policies For All Targets',
    CREATE_POLICY: 'Create Policy',
    UPDATE_POLICY: 'Update Policy',
    DELETE_POLICY: 'Delete Policy',
    DELETE_PROGRAM: 'Delete Program',
    UPDATE_PROGRAM: 'Update Program',
    UPDATE_MAXIMUM_REWARD: 'Update Maximum Reward',
    UPDATE_LAUNCH_TIMELINE: 'Update launch timeline',
    INVITE_HACKERS: 'Invite Hackers',
    CHANGE_SEVERITY: 'Change Severity',
    CHANGE_STATUS: 'Change Status',
    PAY_PRICE: 'Pay Price',
    CHANGE_PROGRAM_TYPE: 'Change program type',
    CHANGE_PROGRAM_BOUNTY_TYPE: 'Change program Bounty type',
    CHANGE_PRODUCT_TYPE: 'Change Product type',
    ASSIGN_TAG: 'Assign Tag',
    ASSIGN_MODERATOR: 'Assign Moderator',
    UPDATE_ASSIGNED_MODERATOR: 'Update Assigned Moderator',
    DELETE_ASSIGNED_MODERATOR: 'Delete Assigned Moderator',
    CHANGE_ACTIVITY: 'Change Activity',
});

HISTORY_TYPE = Object.freeze({
    ACTIVITY: 0,
    REPORT_CHANGE: 1,
    PROGRAM_CHANGE: 2,
});

REPORT_SEVERITY = Object.freeze({
    NONE: 0,
    LOW: 1,
    MEDIUM: 2,
    HIGH: 3,
    CRITICAL: 4,
    VALUES: [0, 1, 2, 3, 4]
});

getReportSeverities = function () {
    return [0, 1, 2, 3, 4];
}

REPORT_ACTIVITY = Object.freeze({
    CLOSE: 0,
    OPEN: 1
});

getReportActivities = function () {
    return [0, 1];
}

WITHDRAW_STATUS = Object.freeze({
    PENDING: 0,
    PAID: 1,
    REJECT: 2
});

INVITE_HACKER_STATUS = Object.freeze({
    PENDING: 0,
    ACCEPT: 1,
    REJECT: 2
});

HACKER_IDENTITY_STATUS = Object.freeze({
    PENDING: 0,
    APPROVED: 1,
    REJECTED: 2
});

REPORT_NOTIFICATION_TYPE = Object.freeze({
    SUBMIT_REPORT: 0,
    CHANGE_STATUS_REPORT: 1,
    SUBMIT_COMMENT: 2,
    ADD_PRICE: 3,
    CHANGE_SEVERITY_REPORT: 4,
    CHANGE_ACTIVITY_REPORT: 5,
});

PAYMENT_DEFAULT = Object.freeze({
    NONE: "0",
    PAYPAL: "1",
    USDT: "2",
    BANK_TRANSFER: "3",
});

ROLES = Object.freeze({
    SUPPER_ADMIN: "0",
    ADMIN: "1",
    VIEWER: "2",
    OBSERVER: "3",
    VALUES: [1, 2, 3]
});

ROLES_NAME = Object.freeze({
    SUPPER_ADMIN: "supper_admin",
    ADMIN: "admin",
    VIEWER: "viewer",
    OBSERVER: "observer"
});

HACKER_TAGS = Object.freeze({
    NONE: 0,
    CHAMPION: 1,
    INTELLIGENCE_DISCOVERY: 2,
    INTERNAL_USER: 3,
    VALUES: [1, 2, 3]
});

NORIFICATION_SETTING = Object.freeze({
    NONE: 1,
    WEB: 2,
    EMAIL: 3,
    EMAIL_WEB: 4,
    VALUES: [1, 2, 3, 4]
});

RESOURCE = Object.freeze({
    REPORT: "report",
    PROGRAM: "program",
    PROGRAM_STATISTICS: "program_statistics",
    PROGRAM_INVITATION: "program_invitation",
    COMMENT: "comment",
    SUPPORT: "support",
    HACKER: "hacker",
    USER: "user",
    USER_PROFILE: "user_profile",
    NOTIFICATION: "notification",
    USER_DETAILS: "user_details",
    USER_PAYMENT: "user_payment",
    INVITE_MEMBER: "invite_member",
    INTEGRATION: "integration",
    MEMBER: "member",
    UPLOAD_AVATAR: "upload_Avatar",
    PASSWORD: "password"
});

sessionConfig = session({
    store: new RedisStore({"client": RedisClient}),
    secret: 'AWff!@#4567',
    resave: false,
    saveUninitialized: false,
    name: 'sid',
    cookie: {httpOnly: true, secure: false}
});


log = function (text, obj, filename, line) {
    let data = '';
    if (isUndefined(obj))
        obj = '';
    if (isJSONorArray(obj)) {
        data = JSON.stringify(obj);
    } else {
        data = obj;
    }

    let logData = `${filename}:${line}# ${text} ${data} `;
    syslog.log(logData);
    if (isDebug)
        console.log(logData);
};

isUndefined = function (obj) {
    return typeof obj === 'undefined';
};

isNull = function (obj) {
    return obj == null ? true : false;
};


safeString = function (str) {
    if (!isUndefined(str) && !isJSONorArray(str)) {
        return entities.encode(str + "").trim();
    } else
        return '';
};

safeStringArray = function (array) {
    return array.map((item) => {
        return safeString(item)
    });
};

createRequestForJiraApis = function (url, method, data) {
    const jira_request = {url, method, data};
    jira_request.headers = OauthHelper.getAuthHeaderForRequest(jira_request);

    return jira_request;
}


text2html = function (str) {
    return entities.decode(str);
};


checkKey = function (obj, key) {
    return !isUndefined(obj) && obj.hasOwnProperty(key);
};


toNumber = function (str) {
    let nStr = Number(str);
    if (isNaN(nStr))
        return 0;
    else
        return nStr;
};


g2j = function (strDate) {
    try {
        if (strDate)
            return jmoment(strDate).format('jYYYY-jMM-jDD');
        else
            return '';
    } catch (e) {
        return '';
    }
};

random = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

random2 = function (max) {
    return Math.floor(Math.random() * max);
};


paginationRender = function (url, totalPage) {
    let lastPageUrl;
    let lastPageClass;
    let nextPageUrl;
    let nextPageClass;
    let firstPageUrl;
    let firstPageClass;
    let prevPageUrl;
    let prevPageClass;

    if (gPage < totalPage) {
        nextPageUrl = url + "&page=" + (gPage + 1);
        nextPageClass = '';
        lastPageUrl = url + "&page=" + totalPage;
        lastPageClass = '';
    } else {
        nextPageUrl = 'javascript:void(0)';
        nextPageClass = 'disabled';
        lastPageUrl = 'javascript:void(0)';
        lastPageClass = 'disabled';
    }

    if (gPage > 1) {
        prevPageUrl = url + "&page=" + (gPage - 1);
        prevPageClass = '';
        firstPageUrl = url + "&page=" + 1;
        firstPageClass = '';
    } else {
        prevPageUrl = 'javascript:void(0)';
        prevPageClass = 'disabled';
        firstPageUrl = 'javascript:void(0)';
        firstPageClass = 'disabled';
    }

    let opt = '';
    for (let i = 10; i <= 100; i += 10) {
        let sel = (gLimit === i) ? 'selected' : '';
        opt += `<option value="${i}" ${sel}>${i}</option>`;
    }


    let html = `<ul class="pagination" dir="ltr">
        <li class="page-item ${firstPageClass}"><a data-toggle="tooltip" title="First Page" class="page-link" href="${firstPageUrl}"><span class="fa fa-step-backward"></span></a></li>
        <li class="page-item ${prevPageClass}"><a  data-toggle="tooltip" title="Prev Page" class="page-link" href="${prevPageUrl}"><span class="fa fa-arrow-left"></span></a></li>
        <li class="page-item pagination-page">
            <input type="text" class="text-center pagination-input" data-url="${url}" value="${gPage}" data-totalpage="${totalPage}"> of ${totalPage}
            &nbsp;<select name="limit" id="limit" data-url="${url}">${opt}</select>
        </li>
        <li class="page-item ${nextPageClass}"><a data-toggle="tooltip" title="Next Page" class="page-link" href="${nextPageUrl}"><span class="fa fa-arrow-right"></span></a></li>
        <li class="page-item ${lastPageClass}"><a data-toggle="tooltip" title="Last Page" class="page-link" href="${lastPageUrl}"><span class="fa fa-step-forward"></span></a></li>
    </ul>`;
    return html;
};


orderColumn = function (url, field, title) {
    let sort2;
    let icon2;
    if (gSortType === 'ASC') {
        sort2 = 'DESC';
        icon2 = 'fa fa-sort-asc';
    } else {
        sort2 = 'ASC';
        icon2 = 'fa fa-sort-desc';
    }


    let url2 = `${url}&field=${field}&sort=${sort2}`;
    let icons;
    let html;
    if (field === gSortColumn) {
        icons = `<span class="${icon2}"></span>`;
        html = `<a href="${url2}">${title}&nbsp;${icons}</a>`;
    } else {
        icons = `<span class="fa fa-sort"></span>`;
        html = `<a href="${url2}">${title}&nbsp;${icons}</a>`;
    }
    return html;
};


orderColumnAjax = function (url, field, title) {
    let sort2;
    let icon2;
    if (gSortType === 'ASC') {
        sort2 = 'DESC';
        icon2 = 'fa fa-sort-asc';
    } else {
        sort2 = 'ASC';
        icon2 = 'fa fa-sort-desc';
    }


    let url2 = `${url}&field=${field}&sort=${sort2}`;
    let icons;
    let html;
    if (field === gSortColumn) {
        icons = `<span class="${icon2}"></span>`;
        html = `<a href="${url2}" class="route">${title}&nbsp;${icons}</a>`;
    } else {
        icons = `<span class="fa fa-sort"></span>`;
        html = `<a href="${url2}" class="route">${title}&nbsp;${icons}</a>`;
    }
    return html;
};


renderID = function (totalRows) {
    totalRows = toNumber(totalRows);
    let opt;
    let start_number;
    if (gSortType === 'ASC') {
        start_number = ((gPage * gLimit) - gLimit);
        opt = '+';
    } else {
        if (gPage > 1) {
            start_number = (totalRows - (gLimit * (gPage - 1))) + 1;
        } else {
            start_number = totalRows + 1;
        }
        opt = '-';
    }
    return {"start_number": start_number, "opt": opt};
};

toParams = function (data) {
    let url = '';
    for (key in data) {
        url += `${key}=${data[key]}&`;
    }
    return url.substr(0, url.length - 1);
};

toJSON = function (str) {
    try {
        return JSON.parse(str);
    } catch (e) {
        return {};
    }

};

json2Str = function (obj) {
    try {
        return JSON.stringify(obj);
    } catch (e) {
        return '';
    }
};

editorToText = function (str) {
    str = str.replace('<!DOCTYPE html>', '');
    str = str.replace('<html>', '');
    str = str.replace('</html>', '');
    str = str.replace('<head>', '');
    str = str.replace('</head>', '');
    str = str.replace('<body>', '');
    str = str.replace('</body>', '');
    return str;
};

getDateGMT = function () {
    var d = new Date(),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
};


getTimeGMT = function () {
    var d = new Date();
    var hour = d.getHours();
    var minute = d.getMinutes();
    var second = d.getSeconds();
    if (hour < 10) hour = '0' + hour;
    if (minute < 10) minute = '0' + minute;
    if (second < 10) second = '0' + second;
    return [hour, minute, second].join(':');
};

getDateTime = function () {
    return momentTimeZone.tz('Europe/Stockholm').format('YYYY-MM-DD HH:mm:ss');
};

getDate = function () {
    return momentTimeZone.tz('Europe/Stockholm');
}

getUtcLessDateTime = function () {
    return moment().utcOffset(0, true).format('YYYY-MM-DD HH:mm:ss');
};

getUtcLessDateTimeFormatLess = function () {
    return moment().utcOffset(0, true);
};

getTimeStamp = function () {
    return momentTimeZone.tz('Europe/Stockholm').unix();
};


getDateTimeGMT = function () {
    return getDate() + " " + getTime();
};


sendMail = async function (to, subject, body, from = AppConfig.SMTP_FROM) {
    try {
        let authObj = {};
        if (AppConfig.SMTP_USERNAME !== "" && AppConfig.SMTP_PASSWORD !== "") {
            authObj = {
                user: AppConfig.SMTP_USERNAME,
                pass: AppConfig.SMTP_PASSWORD
            }
        }
        let transporter = nodemailer.createTransport({
            host: AppConfig.SMTP_HOST,
            port: AppConfig.SMTP_PORT,
            secure: AppConfig.SMTP_IS_SECURE,
            auth: authObj,
            tls: {
                rejectUnauthorized: false
            }
        });

        let mailOptions = {
            "from": {
                name: AppConfig.MAIL_FROM,
                address: from
            },
            "to": to,
            "subject": subject,
            text: "",
            html: body
        };

        let info = await transporter.sendMail(mailOptions);
        return info;
    } catch (e) {
        return e;
    }
};


nl2br = function (str) {
    if (str) {
        let html = str.replace(/\r\n/g, '<br>');
        return html.replace(/\n/g, '<br>');
    } else
        return '';
};


format_number = function (str) {
    let number = numeral(str);
    let ret = number.format('0,0');
    return ret;
};

validateEmail = function (email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
};


paginationRenderAjax = function (url, totalPage) {
    let lastPageUrl;
    let lastPageClass;
    let nextPageUrl;
    let nextPageClass;
    let firstPageUrl;
    let firstPageClass;
    let prevPageUrl;
    let prevPageClass;

    if (gPage < totalPage) {
        nextPageUrl = url + "&page=" + (gPage + 1);
        nextPageClass = '';
        lastPageUrl = url + "&page=" + totalPage;
        lastPageClass = '';
    } else {
        nextPageUrl = '';
        nextPageClass = 'disabled';
        lastPageUrl = '';
        lastPageClass = 'disabled';
    }

    if (gPage > 1) {
        prevPageUrl = url + "&page=" + (gPage - 1);
        prevPageClass = '';
        firstPageUrl = url + "&page=" + 1;
        firstPageClass = '';
    } else {
        prevPageUrl = '';
        prevPageClass = 'disabled';
        firstPageUrl = '';
        firstPageClass = 'disabled';
    }

    let html = `<ul class="pagination">
        <li class="${firstPageClass}"><a title="First Page" class="route" href="${firstPageUrl}"><span class="fa fa-step-backward"></span></a></li>
        <li class="${prevPageClass}"><a  title="Prev Page" class="route" href="${prevPageUrl}"><span class="fa fa-arrow-left"></span></a></li>
        <li class="pagination-page">
            <input type="text" class="text-center pagination-input" data-url="${url}" value="${gPage}" data-totalpage="${totalPage}"> of ${totalPage}
        </li>
        <li class="${nextPageClass}"><a title="Next Page" class="route" href="${nextPageUrl}"><span class="fa fa-arrow-right"></span></a></li>
        <li class="${lastPageClass}"><a title="Last Page" class="route" href="${lastPageUrl}"><span class="fa fa-step-forward"></span></a></li>
    </ul>`;
    return html;
};


getPage = function (req) {
    gPage = isUndefined(req.query.page) ? 1 : toNumber(req.query.page);
    if (gPage <= 0)
        gPage = 1;
};

makeHash = function (str) {
    let secret = 'SecureBug12345$';
    return reverseString(crypto.createHmac('sha256', secret)
        .update(str)
        .digest('hex'));
};

makeKey = function (str) {
    let secret = 'SecureBug12345$';
    return reverseString(crypto.createHmac('md5', secret)
        .update(str)
        .digest('hex'));
};

makeTokenKey = function (secret, data) {
    return reverseString(crypto.createHmac('md5', secret)
        .update(data)
        .digest('hex'));
}

dateTime2j = function (strDate) {
    try {
        if (strDate) {
            let date = moment(strDate).format('YYYY-MM-DD HH:mm:ss');
            let d = date.split(' ');
            return jmoment(d[0]).format('jYYYY-jMM-jDD') + " " + d[1];
        } else
            return '';
    } catch (e) {
        return '';
    }
};

date2date = function (strDate) {
    try {
        if (strDate) {
            let date = moment(strDate).format('YYYY-MM-DD HH:mm:ss');
            return date;
        } else
            return '';
    } catch (e) {
        return '';
    }
};


isObjectID = function (str) {
    try {
        return mongoose.Types.ObjectId.isValid(str);
    } catch (e) {
        return false;
    }
};


isArray = function (obj) {
    return Array.isArray(obj);
};

isJson = function (obj) {
    try {
        return obj.constructor === ({}).constructor;
    } catch (e) {
        return false;
    }
};

isJSONorArray = function (obj) {
    return isArray(obj) || isJson(obj);
};

reverseString = function (str) {
    return str.split("").reverse().join("");
};

randomStr = function (len) {
    let str = "qwertyupasdfghjkzxcvbnmQWERTYUPASDFGHJKLZXCVBNM23456789";
    let password = '';
    for (let i = 0; i < len; i++) {
        let index = random(0, (str.length - 1));
        password += str[index];
    }
    return password;
};

tob64 = function (str) {
    return Buffer.from(str).toString('base64');
};

b642Str = function (str) {
    return Buffer.from(str, 'base64').toString('ascii')
};


getID = function () {
    let timestamp = getTimeStamp();
    let id = process.hrtime()[1];
    return timestamp + "" + id;
};

makeToken = async function (user_id, ip = '', user_agent = '') {
    try {
        let expireDate = getDate().add(10, 'hours').unix();
        var key = makeKey("SecureBug12345$");
        var iv = reverseString(key.substring(0, 16));
        var text = getID() + '#' + user_id + "#" + getID() + '#' + expireDate;
        var cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
        var encrypted = cipher.update(text, 'utf8', 'base64');
        encrypted += cipher.final('base64');
        let token = url64Encode(encrypted);
        await setHash('login:' + token, 'token', token, 'user_id', user_id, 'ip', safeString(ip), 'user_agent', safeString(user_agent), 'date_time', getDateTime());
        await setExpire('login:' + token, 36000);
        return token;
    } catch (e) {
        return '';
    }
};

encryptedToken = (secret_key, shared_secret, auth_token) => {
    const key = makeTokenKey(secret_key, shared_secret);
    const iv = reverseString(key.substring(0, 16));
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
    let encrypted = cipher.update(auth_token, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return url64Encode(encrypted);
};

decryptedToken = (secret_key, shared_secret, auth_token) => {
    let decoded_token = url64Decode(auth_token);
    const key = makeTokenKey(secret_key, shared_secret);
    const iv = reverseString(key.substring(0, 16));
    let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
    let decrypted = decipher.update(decoded_token, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
};

createTokens = async (user_id, current_token = undefined, ip = '', user_agent = '') => {
    try {
        if (current_token) {
            await setExpire(`login:${current_token}`, 5);
        }
        const expireDateTime = getDate().add(token_setting.expire_date_time, 'minutes').unix();
        const refreshDateTime = getDate().add(token_setting.refresh_date_time, 'minutes').unix();
        const token_key = makeTokenKey(token_setting.token_secret_key, user_id.toString());
        const refresh_token_key = makeTokenKey(token_setting.refresh_token_secret_key, user_id.toString());
        const token_iv = reverseString(token_key.substring(0, 16));
        const refresh_token_iv = reverseString(refresh_token_key.substring(0, 16));
        const token_text = `${getID()}#${user_id}#${getID()}#${expireDateTime}#${getID()}#${refreshDateTime}`;
        const refresh_token_text = `${getID()}#${user_id}#${getID()}#${refreshDateTime}`;
        const token_cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(token_key), token_iv);
        const refresh_token_cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(refresh_token_key), refresh_token_iv);
        let token_encrypted = token_cipher.update(token_text, 'utf8', 'base64');
        let refresh_token_encrypted = refresh_token_cipher.update(refresh_token_text, 'utf8', 'base64');
        token_encrypted += token_cipher.final('base64');
        refresh_token_encrypted += refresh_token_cipher.final('base64');
        const token = url64Encode(token_encrypted);
        const refresh_token = url64Encode(refresh_token_encrypted);
        await setHash(`login:${token}`, 'token', token, 'user_id', user_id, 'ip', safeString(ip), 'user_agent', safeString(user_agent), 'date_time', getDateTime(), 'refresh_token', refresh_token, "session_hash_id", randomStr(64));
        await setExpire(`login:${token}`, token_setting.expire_date_time * 60);
        return {token, refresh_token};
    } catch {
        return '';
    }
};

removeToken = async function (key) {
    try {
        let data = await getHash('login:' + key);
        if (checkKey(data, 'user_id')) {
            let del = await ioredis.del('login:' + key);
            return true;
        } else
            return false;
    } catch (e) {
        return true;
    }
};

unToken = async function (key) {
    try {
        let data = await getHash('login:' + key);
        if (checkKey(data, 'user_id')) {
            str = url64Decode(key);
            var key = makeKey("SecureBug12345$");
            var iv = reverseString(key.substring(0, 16));
            var decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
            var decrypted = decipher.update(str, 'base64', 'utf8');
            decrypted += decipher.final('utf8');
            return decrypted;
        } else
            return '';
    } catch (e) {
        return '';
    }
};

decryptToken = async function (token) {
    try {
        const data = await getHash(`login:${token}`);
        if (checkKey(data, 'user_id')) {
            let decoded_token = url64Decode(token);
            const key = makeTokenKey(token_setting.token_secret_key, data.user_id);
            const iv = reverseString(key.substring(0, 16));
            let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
            let decrypted = decipher.update(decoded_token, 'base64', 'utf8');
            decrypted += decipher.final('utf8');
            return decrypted;
        } else
            return '';
    } catch (e) {
        return '';
    }
};

url64Encode = function (unencoded) {
    return unencoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
};

url64Decode = function (encoded) {
    encoded = encoded.replace(/-/g, '+').replace(/_/g, '/');
    while (encoded.length % 4)
        encoded += '=';
    return encoded;
};

encryptionString = function (str) {
    try {
        var key = makeKey("SecureBug12345$");
        var iv = reverseString(key.substring(0, 16));
        var text = str + ':' + getTimeStamp();
        var cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
        var encrypted = cipher.update(text, 'utf8', 'base64');
        encrypted += cipher.final('base64');
        let data = url64Encode(encrypted);
        return data;
    } catch (e) {
        return '';
    }
};

decryptionString = function (str) {
    try {
        var key = makeKey("SecureBug12345$");
        var iv = reverseString(key.substring(0, 16));
        let str2 = url64Decode(str);
        let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
        let decrypted = decipher.update(str2, 'base64', 'utf8');
        decrypted += decipher.final('utf8');
        return url64Decode(decrypted);
    } catch (e) {
        return '';
    }
};


isNumber = function (obj) {
    if (typeof obj === 'number')
        return true;
    else
        return false;
};


decryptData = function (private_key, str) {
    try {
        let crypt = new Crypt();
        let decrypted = crypt.decrypt(private_key, str);
        let message = decrypted.message;
        return JSON.parse(message);
    } catch (e) {
        return {};
    }
};


toObjectID = function (str) {
    return isObjectID(str) ? str : '';
};

topObjectIDArray = function (array) {
    return array.map((item) => {
        return toObjectID(item)
    });
};


toFixed = function (num) {
    return parseInt('' + (num * 100)) / 100;
};

isFunction = function (functionToCheck) {
    return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
};


setCache = async function (key, obj) {
    try {
        let saveData = await ioredis.set(key, json2Str(obj));
        return 1;
    } catch (e) {
        return 0;
    }
};


getCache = async function (key) {
    try {
        let data = await ioredis.get(key);
        return toJSON(data);
    } catch (e) {
        return null;
    }
};

delCache = async function (key) {
    try {
        let data = await ioredis.del(key);
        return true;
    } catch (e) {
        return false;
    }
};

initApp = async function () {
    console.log('init app call');
    let result = await createID('user_id', 10000000);
    await ftDrop('sbloginIndex');
    await ftCreate('sbloginIndex', 'login:', 'token TEXT SORTABLE user_id TEXT SORTABLE session_hash_id TEXT SORTABLE ip TEXT SORTABLE user_agent TEXT SORTABLE date_time TEXT SORTABLE');
    io.attach(IO_PORT, {
        cors: {
            origin: "*",
            allowedHeaders: ["token"],
        }
    });
}

createID = async function (key, value) {
    try {
        let isExists = await SchemaModels.GlobalIDModel.findOne({"_id": key}).countDocuments();
        if (isExists == 0) {
            let i = SchemaModels.GlobalIDModel({
                "_id": key,
                "value": value
            });
            let r = await i.save();
            return r;
        }
    } catch (e) {
        return 0;
    }
};

nextID = async function (key) {
    try {
        var doc = await SchemaModels.GlobalIDModel.findOneAndUpdate({"_id": key}
            , {$inc: {'value': 1}}, {new: true, upsert: true});
        return doc.value;
    } catch (e) {
        return 0;
    }
};


getMonthNameByNumber = function (monthNumber) {
    switch (monthNumber) {
        case "01":
            return "Jan";
        case "02":
            return "Feb";
        case "03":
            return "Mar";
        case "04":
            return "Apr";
        case "05":
            return "May";
        case "06":
            return "Jun";
        case "07":
            return "Jul";
        case "08":
            return "Aug";
        case "09":
            return "Sept";
        case "10":
            return "Oct";
        case "11":
            return "Nov";
        case "12":
            return "Dec";
    }
}

getMonthNumberByName = function (monthName) {
    switch (monthName) {
        case "Jan":
            return 1;
        case "Feb":
            return 2;
        case "Mar":
            return 3;
        case "Apr":
            return 4;
        case "May":
            return 5;
        case "Jun":
            return 6;
        case "Jul":
            return 7;
        case "Aug":
            return 8;
        case "Sept":
            return 9;
        case "Oct":
            return 10;
        case "Nov":
            return 11;
        case "Dec":
            return 12;
    }
};

getHackerPrivilege = function (sb_coin, reputaion) {
    return (isUndefined(sb_coin) ? 0 : sb_coin) + (isUndefined(reputaion) ? 0 : reputaion);
};

setHackerRank = function (rank) {
    return (isUndefined(rank) || rank > 99) ? "+99" : rank;
};

ftCreate = async function (indexName, keySpace, schema) {
    try {
        let data = await ioredis.sendCommand(
            new Redis.Command(
                'FT.CREATE',
                [indexName, 'ON', 'HASH', 'PREFIX', 1, keySpace, 'SCHEMA', schema.split(' ')],
                'utf-8')
        );
        return true;
    } catch (e) {
        return e.toString();
    }
}

ftSearch = async function (indexName, command) {
    try {
        let result = await ioredis.call('FT.SEARCH', indexName, command);
        return toArrayObject(result);
    } catch (e) {
        return [];
    }
}

toArrayObject = async function (data) {
    try {
        if (data.length > 0) {
            let ret = [];
            data.shift();
            for (let i = 0; i < data.length; i += 2) {
                let row = {
                    "key": data[i],
                }
                let array = isArray(data[i + 1]) ? data[i + 1] : [];
                for (let j = 0; j < array.length; j += 2) {
                    row[array[j]] = array[j + 1];
                }
                ret.push(row);
            }
            return ret;
        } else
            return [];
    } catch (e) {
        return [];
    }
}

toArrayObjectWithoutKey = async function (data) {
    try {
        if (data.length > 0) {
            let ret = [];
            data.shift();
            for (let i = 0; i < data.length; i += 2) {
                let row = {};
                let array = isArray(data[i + 1]) ? data[i + 1] : [];
                for (let j = 0; j < array.length; j += 2) {
                    row[array[j]] = array[j + 1];
                }
                ret.push(row);
            }
            return ret;
        } else
            return [];
    } catch (e) {
        return [];
    }
}


ftDrop = async function (indexName) {
    try {
        let result = await ioredis.call('FT.DROP', indexName, 'KEEPDOCS');
        return result;
    } catch (e) {
        return '';
    }
}


ftSearchMultiArgs = async function (indexName, ...command) {
    try {
        let result = await ioredis.call('FT.SEARCH', indexName, command);
        return result;
    } catch (e) {
        return '';
    }
}


setHash = async function (key, ...values) {
    try {
        let data = await ioredis.hset(key, values);
        return true;
    } catch (e) {
        // log(e);
        return false;
    }
}

getHash = async function (key) {
    try {
        let data = await ioredis.hgetall(key);
        return data;
    } catch (e) {
        return {};
    }
}

setExpire = async function (key, time) {
    try {
        await ioredis.expire(key, time);
        return true;
    } catch (e) {
        return false;
    }
}

calculateChallengePoint = function (initial_point, minimum_point, decay, resolve_count) {
    return Math.ceil((((minimum_point - initial_point) / (decay ** 2)) * (resolve_count ** 2)) + initial_point);
}

getRandomColor = function (index) {
    const colors = ["#00b1ad", "#f44336", "#b83428", "#ffa300", "#f93500", "#3d78d9", "#b22d25", "#3abfbd"];
    return colors[index];
}
setBooleanStringValue = function (value) {
    return value === "true" || false;
}
checkUser = function (user) {
    if (!user.is_verify) {
        return 1;
    } else if (user.account_is_disable) {
        return 2;
    } else {
        return 0;
    }
}

setResponse = function (result, code = "0", is_login = "0") {
    return {code, result, is_login}
}
setPublicResponse = function (result, code = "0") {
    return {code, result}
}
emptyMsg = function (name) {
    return `${name} is empty`;
}
validityMsg = function (name) {
    return `${name} is not valid`;
}
verifyMsg = function (name) {
    return `${name} is not verified`;
}
maxLengthMsg = function (name, limit) {
    return `${name} must be equals or less than ${limit} characters`;
}
notCorrectMsg = function (name) {
    return `${name} is not correct`;
}
hasPermissionMsg = function () {
    return `You don't have permission for this action`;
}

expireMsg = function (name) {
    return `${name} is expired`;
}

disableMsg = function (name) {
    return `${name} is disabled`;
}


googleRecaptchaCheck = async function (req) {
    try {
        return true;//for local devlopment uncomment
        if (!isUndefined(req.body['g-recaptcha-response'])) {
            let secretKey = "6Lefz8obAAAAACrJUGaoJcspDNAgw2-yWvM2CMSJ";
            let verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + secretKey + "&response=" + req.body['g-recaptcha-response'] + "&remoteip=" + req.connection.remoteAddress;
            let result = await axios.get(verificationUrl);
            if (!isUndefined(result.data.success) && result.data.success)
                return true;
            else
                return false;
        } else {
            return false;
        }

    } catch (e) {
        return false;
    }
}
getLimits = function () {
    return [10, 25, 50, 100]
}

hasValue = function (value) {
    return value !== undefined && value !== '' && value !== null;
}
checkUserLevelAccessIsValid = function (user_level_access) {
    return [1, 2].includes(user_level_access);
}
setPaginationResponse = function (results, limit, page) {
    const response = {
        current_page: page,
        total_pages: 0,
        total_count: 0,
        rows: []
    };
    if (
        results && results[0] && results[0].rows &&
        results[0].total_count && results[0].total_count[0]
    ) {
        response.total_count = results[0].total_count[0].count;
        response.total_pages = Math.ceil(response.total_count / limit);
        response.rows = results[0].rows;
    }
    return response;
}

google2faCheck = function (google_towfa_secret_key, code) {
    try {
        const token = otplib.authenticator.generate(google_towfa_secret_key);
        if (token === code)
            return true;
        else
            return false;
    } catch (e) {
        return false;
    }
}


isImage = function (file) {
    try {
        var extension = file.substr((file.lastIndexOf('.') + 1));
        if (/(jpg|jpeg|png|gif)$/ig.test(extension)) {
            return true;
        } else {
            return false;
        }
    } catch (e) {
        return false;
    }
}

sortBy = (list, key = "", sortType = "ASC") => {
    return list && list.length > 0 ? key ? list.sort((a, b) => getDateValue(sortType === "ASC" ? a[key] : b[key]) - getDateValue(sortType === "ASC" ? b[key] : a[key]))
        : list.sort((a, b) => getDateValue(sortType === "ASC" ? a : b) - getDateValue(sortType === "ASC" ? b : a)) : [];
};

getDateValue = (value) => {
    return moment(value).valueOf();
};

arrayEquals = (_arr1, _arr2, equalBy) => {
    if (
        !Array.isArray(_arr1)
        || !Array.isArray(_arr2)
        || _arr1.length !== _arr2.length
    ) {
        return false;
    }

    const arr1 = equalBy ? _arr1.concat().sort((a, b) => a[equalBy] - b[equalBy]) : _arr1.concat().sort();
    const arr2 = equalBy ? _arr2.concat().sort((a, b) => a[equalBy] - b[equalBy]) : _arr1.concat().sort();

    for (let i = 0; i < arr1.length; i++) {
        if (equalBy) {
            if (arr1[i][equalBy] !== arr2[i][equalBy]) {
                return false;
            }
        } else {
            if (arr1[i] !== arr2[i]) {
                return false;
            }
        }
    }
    return true;
};


generateEmailTemplate = (temp_name, first_name, data, is_hacker) => {
    const headerEmailTemplate = emailTemplateHeader(first_name);
    let signEmailTemplate;
    if (is_hacker !== undefined) {
        signEmailTemplate = emailTemplateSign(is_hacker);
    }
    let contentEmailTemplate;
    if (temp_name === "hacker_register") {
        contentEmailTemplate = emailTemplateRegister(data.url, signEmailTemplate);
    } else if (temp_name === "company_register") {
        contentEmailTemplate = emailTemplateRegisterCompany(data.url, signEmailTemplate);
    } else if (temp_name === "hacker_verify_email") {
        contentEmailTemplate = emailTemplateVerify(data.url, signEmailTemplate);
    } else if (temp_name === "support") {
        contentEmailTemplate = emailTemplateSupport(data.subject, data.message, data.email);
    } else if (temp_name === "forget_password") {
        contentEmailTemplate = emailTemplateForgotPassword(data.url, data.url2, signEmailTemplate);
    } else if (temp_name === "hacker_get_invitation") {
        contentEmailTemplate = emailTemplateInvitationHacker(data.program_name, data.expire_date, data.invitations_url, signEmailTemplate);
    } else if (temp_name === "sales_verify_company") {
        contentEmailTemplate = emailTemplateForSalesPartsAfterVerificationCompany(data.email, data.role, data.organizationName, data.phone, data.country);
    } else if (temp_name === "support_register_company") {
        contentEmailTemplate = emailTemplateCompanyRegistrationForSupport(data.fn, data.ln, data.email, data.role, data.organization_name, data.phone, data.country_title);
    } else if (temp_name === "hacker_verify_identity") {
        contentEmailTemplate = emailTemplateVerifyIdentifyHacker(signEmailTemplate);
    } else if (temp_name === "hacker_verify_identity_for_support") {
        contentEmailTemplate = emailTemplateVerifyIdentifyHackerForSupport(data.identity, data.username, signEmailTemplate);
    } else if (temp_name === "hacker_reject_identity") {
        contentEmailTemplate = emailTemplateRejectIdentifyHacker(signEmailTemplate);
    } else if (temp_name === "company_admin_verify") {
        contentEmailTemplate = emailTemplateAfterCompanyVerifyByAdmin(signEmailTemplate);
    } else if (temp_name === "company_add_member_for_member") {
        contentEmailTemplate = emailTemplateCompanyInviteMemberForMember(data.company_name, data.role, data.url, signEmailTemplate);
    } else if (temp_name === "company_add_member_for_company") {
        contentEmailTemplate = emailTemplateCompanyInviteMemberForCompany(data.role, data.member_name, data.creator, signEmailTemplate);
    } else if (temp_name === "company_add_member_for_support") {
        contentEmailTemplate = emailTemplateCompanyInviteMemberForSupport(data.parent_display_name, data.creator_first_name, data.creator_last_name, data.fn, data.ln, data.email, data.role, signEmailTemplate);
    } else if (temp_name === "hacker_submit_report") {
        contentEmailTemplate = emailTemplateSubmitReportHacker(data.program_name, data.url, signEmailTemplate);
    } else if (temp_name === "company_submit_report") {
        contentEmailTemplate = emailTemplateSubmitReportCompany(data.program_name, data.url, signEmailTemplate);
    } else if (temp_name === "moderator_submit_report") {
        contentEmailTemplate = emailTemplateSubmitReportModerator(data.program_name, data.url, signEmailTemplate);
    } else if (temp_name === "hacker_submit_comment") {
        contentEmailTemplate = emailTemplateCommentForHacker(data.url, signEmailTemplate);
    } else if (temp_name === "company_submit_comment") {
        contentEmailTemplate = emailTemplateCommentForCompany(data.program_name, data.url, signEmailTemplate);
    } else if (temp_name === "moderator_submit_comment") {
        contentEmailTemplate = emailTemplateCommentForModerator(data.program_name, data.url, signEmailTemplate);
    } else if (temp_name === "hacker_change_report_status") {
        contentEmailTemplate = emailTemplateChangeReportStatusHacker(data.url, signEmailTemplate);
    } else if (temp_name === "company_change_report_status") {
        contentEmailTemplate = emailTemplateChangeReportStatusCompany(data.program_name, data.url, signEmailTemplate);
    } else if (temp_name === "moderator_change_report_status") {
        contentEmailTemplate = emailTemplateChangeReportStatusModerator(data.program_name, data.url, signEmailTemplate);
    } else if (temp_name === "hacker_add_report_reward") {
        contentEmailTemplate = emailTemplateAddRewardForHacker(data.url, signEmailTemplate);
    } else if (temp_name === "company_add_report_reward") {
        contentEmailTemplate = emailTemplateAddRewardForCompany(data.program_name, data.url, signEmailTemplate);
    } else if (temp_name === "moderator_add_report_reward") {
        contentEmailTemplate = emailTemplateAddRewardForModerator(data.program_name, data.url, signEmailTemplate);
    } else if (temp_name === "hacker_request_withdraw") {
        contentEmailTemplate = emailTemplateWithdrawRequestForHacker(data.bounty, data.tracking_code, signEmailTemplate);
    } else if (temp_name === "moderator_request_withdraw") {
        contentEmailTemplate = emailTemplateWithdrawRequestForSupport(data.username, data.bounty, data.tracking_code, signEmailTemplate);
    } else if (temp_name === "hacker_accept_withdraw") {
        contentEmailTemplate = emailTemplateWithdrawAcceptForHacker(data.amount, data.tracking_code, signEmailTemplate);
    }
    return emailTemplateLayout(headerEmailTemplate, contentEmailTemplate);
};

qsToJson = (qs,hasQuestionMark = false) => {
    if (hasQuestionMark) qs = qs.substring(1);
    return JSON.parse('{"' + decodeURI(qs).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}');
};