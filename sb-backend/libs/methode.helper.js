const mongoose = require('mongoose');
const nodemailer = require("nodemailer");
const {ADMIN_ROLES, ADMIN_ROLES_NAME} = require('./enum.helper');
const {getTimeStamp,getDateValue} = require('./date.helper');
const sanitizeHtml = require('sanitize-html');
const Entities = require('html-entities').XmlEntities;
const entities = new Entities();
const path = require('path');
const appDir = path.dirname(require.main.filename) + '/';

const isObjectID = str => {
    try {
        return mongoose.Types.ObjectId.isValid(str);
    } catch {
        return false;
    }
};

const toArrayObject = async (data) => {
    try {
        if (data.length > 0) {
            let ret = [];
            data.shift();
            for (let i = 0; i < data.length; i += 2) {
                let row = {
                    "key": data[i],
                };
                let array = isArray(data[i + 1]) ? data[i + 1] : [];
                for (let j = 0; j < array.length; j += 2) {
                    row[array[j]] = array[j + 1];
                }
                ret.push(row);
            }
            return ret;
        } else
            return [];
    } catch {
        return [];
    }
};

const cleanXSS = (str) =>  {
    try {
        str = text2html(str);
        str = DOMPurify.sanitize(str);
        return sanitizeHtml(str, {
            allowedTags: ['strong', 'i', 'ul', 'li', 'ol', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p'],
            allowedAttributes: {},
            allowedIframeHostnames: []
        });
    } catch {
        return '';
    }
};

const isJSONorArray = obj => {
    return isArray(obj) || isJson(obj);
};

const isArray = obj => {
    return Array.isArray(obj);
};

const isUndefined = obj => {
    return typeof obj === 'undefined';
};

const isJson = obj => {
    try {
        return obj.constructor === ({}).constructor;
    } catch {
        return false;
    }
};

const safeString = str => {
    if (!isUndefined(str) && !isJSONorArray(str)) {
        return entities.encode(str + "").trim();
    } else
        return '';
};

const checkUserLevelAccessIsValid = (user_level_access) => {
    return [1, 2].includes(user_level_access);
};

const getAdministrationUserAccessLevel = access_level => {
    switch (access_level) {
        case ADMIN_ROLES.ADMIN:
            return ADMIN_ROLES_NAME.ADMIN;
        case ADMIN_ROLES.MODERATOR:
            return ADMIN_ROLES_NAME.MODERATOR;
    }
};

const hasValue = function (value) {
    return value !== undefined && value !== '' && value !== null;
};

const sortBy = (list, key = "", sortType = "ASC") => {
    return list && list.length > 0 ?  key ? list.sort((a, b) => getDateValue(sortType === "ASC" ? a[key] : b[key]) - getDateValue(sortType === "ASC" ? b[key] : a[key]))
        : list.sort((a, b) => getDateValue(sortType === "ASC" ? a : b) - getDateValue(sortType === "ASC" ? b : a)) : [];
};

const arrayEquals = (_arr1, _arr2,equalBy) => {
    if (
        !Array.isArray(_arr1)
        || !Array.isArray(_arr2)
        || _arr1.length !== _arr2.length
    ) {
        return false;
    }

    const arr1 = equalBy ?  _arr1.concat().sort((a,b) => a[equalBy] - b[equalBy]) : _arr1.concat().sort();
    const arr2 = equalBy ?  _arr2.concat().sort((a,b) => a[equalBy] - b[equalBy]) : _arr1.concat().sort();

    for (let i = 0; i < arr1.length; i++) {
        if(equalBy){
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

const getMonthNameByNumber = function (monthNumber) {
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
};

const setPaginationResponse = function (results, limit, page) {
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
};

const toNumber = str => {
    let nStr = Number(str);
    if (isNaN(nStr))
        return 0;
    else
        return nStr;
};

const getID = function () {
    let timestamp = getTimeStamp();
    let id = process.hrtime()[1];
    return timestamp + "" + id;
};

const sendMail = async (to, subject, body, from = AppConfig.SMTP_FROM) => {
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
                name: AppConfig.MAIL_FROM ,
                address: from
            },
            "to": to,
            "subject": subject,
            text: "",
            html: body
        };

        return await transporter.sendMail(mailOptions);
    } catch (e) {
        return e;
    }
};

const getMemberFields = function () {
    return ["tax_file", "avatar_file", "role", "organization_name", "display_name", "status", "is_verify", "admin_verify", "company_country_id", "address1", "address2",
        "city", "region", "postal_code", "payment_paypal_email",
        "invoice_address_country_id", "invoice_address_email", "invoice_address_company_name", "invoice_address_address1",
        "invoice_address_address2", "invoice_address_city", "invoice_address_reference",
        "invoice_address_zip_code", "credit_card_number", "credit_date", "credit_cvc", "credit_bank_holder_name",
        "credit_currency_id", "member_users", "is_fully_manage"];
};

const get_valid_hacker_fields = () => {
    return [{name: "fn", tab: 0}, {name: "ln", tab: 0}, {name: "email", tab: 0}, {
        name: "username",
        tab: 0
    }, {name: "invitation", tab: 0},
        {name: "profile_visibility", tab: 1}, {name: "github_url", tab: 1}, {name: "linkedin_url", tab: 1},
        {name: "twitter_url", tab: 1}, {name: "website_url", tab: 1}, {name: "country_id", tab: 1},
        {name: "country_id_residence", tab: 1}, {name: "incoming_range_id", tab: 1}, {name: "city", tab: 1},
        {name: "competency_profile", tab: 1}, {name: "region", tab: 1}, {
            name: "postal_code",
            tab: 1
        }, {name: "address1", tab: 1},
        {name: "address2", tab: 1}, {name: "payment_default", tab: 3}, {name: "payment_bank_transfer_type", tab: 3},
        {name: "payment_paypal_email", tab: 3}, {
            name: "payment_bank_transfer_account_holder",
            tab: 3
        }, {name: "payment_bank_transfer_bic", tab: 3},
        {name: "payment_bank_transfer_iban", tab: 3}, {
            name: "payment_usdt_public_key",
            tab: 3
        }, {name: "payment_bank_transfer_country_id", tab: 3},
        {name: "payment_bank_transfer_country_id_residence", tab: 3}, {
            name: "payment_bank_transfer_currency_id",
            tab: 3
        }];
};

const getHackerPrivilege = function (sb_coin, reputaion) {
    return (isUndefined(sb_coin) ? 0 : sb_coin) + (isUndefined(reputaion) ? 0 : reputaion);
};

const toObjectID = (id) => {
    return mongoose.Types.ObjectId.isValid(id) ? mongoose.Types.ObjectId(id) : '';
};

const convertSetOrMapToArray = data => {
    const response = [];
    data.size > 0 && data.forEach(value => response.push({data: value.data, id: value.id}));
    return response;
};

const checkKey = function (obj, key) {
    return !isUndefined(obj) && obj.hasOwnProperty(key);
};

const getTypeFile = function (file, uploadDirs) {
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
};

const validExtensionImage = function (str) {
    if (str === 'image/jpeg' || str === 'image/jpg')
        return 'jpg';
    else if (str === 'image/png')
        return 'png';
    else if (str === 'image/gif')
        return 'gif';
    else
        return '';
};

const validExtensionFile = function (str) {
    if (str === 'application/pdf')
        return 'pdf';
    else if (str === 'application/msword')
        return 'dox';
    else if (str === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
        return 'docx';
    else
        return '';
};

const validExtensionVideo = function (str) {
    if (str === 'video/mp4')
        return 'mp4';
    else
        return '';
};

const validExtensionFileImage = function (str) {
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
};

const fileFilter = function (req, file, cb) {
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
    } catch {
        cb(null, false);
    }
};

const random2 = function (max) {
    return Math.floor(Math.random() * max);
};

const isImage = function (file) {
    try {
        const extension = file.substr((file.lastIndexOf('.') + 1));
        return /(jpg|jpeg|png|gif)$/ig.test(extension);
    } catch {
        return false;
    }
};

const text2html = (str) => {
    return entities.decode(str);
};

const generateObjectId = () => {
    return mongoose.Types.ObjectId();
};

module.exports = {
    isObjectID,
    generateObjectId,
    isJSONorArray,
    isArray,
    isUndefined,
    checkUserLevelAccessIsValid,
    isJson,
    safeString,
    getAdministrationUserAccessLevel,
    hasValue,
    setPaginationResponse,
    toNumber,
    getID,
    sendMail,
    getMemberFields,
    get_valid_hacker_fields,
    getHackerPrivilege,
    toObjectID,
    convertSetOrMapToArray,
    fileFilter,
    appDir,
    isImage,
    random2,
    checkKey,
    getTypeFile,
    validExtensionImage,
    validExtensionFile,
    validExtensionVideo,
    validExtensionFileImage,
    cleanXSS,
    arrayEquals,
    toArrayObject,
    sortBy,
    getMonthNameByNumber,
    text2html
};