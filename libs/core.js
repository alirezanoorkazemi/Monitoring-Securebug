asiaTimeZone = new Date().toLocaleString("en-US", {timeZone: "Asia/Tehran"});
modelInstance = [];
gSortColumns = [];
gUrlQuery = null;
gPage = 1;
gLimit = 10;
gSortType = 'DESC';
gSortType2 = -1;
gSortColumn = '_id';
// swaggerJsdoc = require('swagger-jsdoc');
// swaggerUi = require('swagger-ui-express');
// axios = require('axios');
// exceljs = require('exceljs');
// nodemailer = require("nodemailer");
// numeral = require('numeral');
// numbro = require('numbro');
moment = require('moment');
// RSA = require('hybrid-crypto-js').RSA;
// Crypt = require('hybrid-crypto-js').Crypt;
moment.suppressDeprecationWarnings = true;
momenttz = require('moment-timezone').tz("Asia/Tehran");
// jmoment = require('moment-jalaali');
crypto = require('crypto');
http = require('http');
https = require('https'); 
Q = require('q');
fs = require('fs');
path = require('path');
const Redis = require("ioredis");
ioredis = new Redis();
appDir = path.dirname(require.main.filename) + '/';
express = require('express');
session = require('express-session');
const redis = require('redis');
RedisStore = require('connect-redis')(session);
RedisClient = redis.createClient();
svgCaptcha = require('svg-captcha');
bodyParser = require('body-parser');
const Entities = require('html-entities').XmlEntities;
const entities = new Entities();
check = require('express-validator');
const multer = require('multer');
io = require('socket.io')(IO_PORT);
// io.origins(['*:*']);
adminIO = io.of('/admin');
userIO = io.of('/user');


function getLine(offset) {
    try{
        var stack = new Error().stack.split('\n'),
            line = stack[(offset || 1) + 1].split(':');
        return parseInt(line[line.length - 2], 10);
    }
    catch (e) {
        return 0;
    }
}

global.__defineGetter__('__line', function () {
    return getLine(2);
});


function fileFilter(req, file, cb) {
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

}


const storage = multer.diskStorage({
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
        cb(null, file.fieldname.replace('[]','') + new Date().getTime()
            + random(1, 99999999) + '.'
            + typeFile);
    }
});


uploader = multer({storage: storage, fileFilter: fileFilter});


function validExtensionImage(str) {
    if (str === 'image/jpeg' || str === 'image/jpg')
        return 'jpg';
    else if (str === 'image/png')
        return 'png';
    else if (str === 'image/gif')
        return 'gif';
    else
        return '';
}

function validExtensionFile(str) {
    if (str === 'application/pdf')
        return 'pdf';
    else if (str === 'application/msword')
        return 'dox';
    else if (str === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
        return 'docx';
    else
        return '';
}

function validExtensionVideo(str) {
    if (str === 'video/mp4')
        return 'mp4';
    else
        return '';
}

function validExtensionFileImage(str) {
    if (str === 'application/pdf')
        return 'pdf';
    else if (str === 'image/jpeg' || str === 'image/jpg')
        return 'jpg';
    else if (str === 'image/png')
        return 'png';
    else if (str === 'image/gif')
        return 'gif';
    else
        return '';
}



function getTypeFile(file, uploadDirs) {
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
mongoose.connect('mongodb://localhost:27017/logger');





tob64 = function (str) {
    return Buffer.from(str).toString('base64');
};

b642Str = function (str) {
    return Buffer.from(str, 'base64').toString('ascii')
};


sessionConfig = session({
    store: new RedisStore({"client": RedisClient}),
    secret: AppConfig.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    name: AppConfig.SESSION_NAME,
    cookie: {httpOnly: true, secure: AppConfig.SESSION_SECURE}
});


log = function (obj) {
    if(isDebug)
        console.log(obj);
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

safeStringArray = function(array)
{
    return array.map((item)=> {return safeString(item)});
};



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
        if(strDate)
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


getID = function () {
    let timestamp = new Date().getTime();
    let id = process.hrtime()[1];
    return timestamp + "" + id;
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
        <li class="page-item ${firstPageClass}"><a data-toggle="tooltip" title="اولین صفحه" class="page-link" href="${firstPageUrl}"><span class="fa fa-step-backward"></span></a></li>
        <li class="page-item ${prevPageClass}"><a  data-toggle="tooltip" title="صفحه قبل" class="page-link" href="${prevPageUrl}"><span class="fa fa-arrow-left"></span></a></li>
        <li class="page-item pagination-page">
            <input type="text" class="text-center pagination-input" data-url="${url}" value="${gPage}" data-totalpage="${totalPage}"> of ${totalPage}
            &nbsp;<select name="limit" id="limit" data-url="${url}">${opt}</select>
        </li>
        <li class="page-item ${nextPageClass}"><a data-toggle="tooltip" title="صفحه بعد" class="page-link" href="${nextPageUrl}"><span class="fa fa-arrow-right"></span></a></li>
        <li class="page-item ${lastPageClass}"><a data-toggle="tooltip" title="آخرین صفحه" class="page-link" href="${lastPageUrl}"><span class="fa fa-step-forward"></span></a></li>
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
    return Object.keys(data).map(key => key + '=' + data[key]).join('&');
};

toJSON = function (str) {
    try{
        return JSON.parse(str);
    }
    catch(e){
        return {};
    }
    
};

json2Str = function (obj) {
    try{
        return JSON.stringify(obj);
    }
    catch(e)
    {
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

getDate = function () {
    var d = new Date(asiaTimeZone),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
};


getTime = function () {
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
    return getDate() + " " + getTime();
};

sendMail = async function (to, subject, body) {
    try{
        let transporter = nodemailer.createTransport({
            host: AppConfig.SMTP_HOST,
            port: AppConfig.SMTP_PORT,
            secure: AppConfig.SMTP_IS_SECURE,
            auth: {
                user: AppConfig.SMTP_USERNAME,
                pass: AppConfig.SMTP_PASSWORD
            },
            tls: {
                rejectUnauthorized:false
            }
        });

        let mailOptions = {
            from: AppConfig.SMTP_FROM,
            "to": to,
            "subject": subject,
            text: "",
            html: body
        };

        let info = await transporter.sendMail(mailOptions);
        return info;
    }
    catch (e) {
        return e;
    }
};

nl2br = function (str) {
    if(str) {
        let html = str.replace(/\r\n/g, '<br>');
        return html.replace(/\n/g, '<br>');
    }
    else
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
    return reverseString(crypto.createHmac('sha256', AppConfig.SECRET_KEY)
        .update(str)
        .digest('hex'));
};

makeKey = function (str) {
    return reverseString(crypto.createHmac('md5', AppConfig.SECRET_KEY)
        .update(str)
        .digest('hex'));
};

dateTime2j = function (strDate) {
    try {
        if(strDate)
        {
            let date = moment(strDate).format('YYYY-MM-DD HH:mm:ss');
            let d = date.split(' ');
            return jmoment(d[0]).format('jYYYY-jMM-jDD') + " " + d[1];    
        }
        else
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
    try{
        return obj.constructor === ({}).constructor;
    }   
    catch(e){
        return false;
    }
};

isJSONorArray = function (obj) {
    return isArray(obj) || isJson(obj);
};

reverseString = function (str) {
    return str.split("").reverse().join("");
};

randomStr = function(len){
    let str = "qwertyupasdfghjkzxcvbnmQWERTYUPASDFGHJKLZXCVBNM23456789";
    let password = '';
    for(let i = 0;i < len;i++)
    {
        let index = random(0,(str.length-1));
        password += str[index];
    }
    return password;
};


makeToken = function (user_id,hour = 10) {
    try {
        let expireDate = new Date(new Date().getTime() + (hour * 60 * 60 * 1000));
        var key = makeKey(AppConfig.SECRET_KEY);
        var iv = reverseString(key.substring(0,16));
        var text = getID()+'#'+user_id+"#"+getID()+'#'+expireDate.getTime();
        var cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key),iv);
        var encrypted = cipher.update(text, 'utf8', 'base64');
        encrypted += cipher.final('base64');
        let data =  url64Encode(encrypted);
        return data;
    } catch (e) {
        return '';
    }
};


unToken = function (str) {
    try {
        str = url64Decode(str);
        var key = makeKey(AppConfig.SECRET_KEY);
        var iv = reverseString(key.substring(0,16));
        var decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
        var decrypted = decipher.update(str, 'base64', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (e) {
        return '';
    }
};

url64Encode = function(unencoded) {
    return unencoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
};
  
url64Decode = function(encoded) {
    encoded = encoded.replace(/-/g, '+').replace(/_/g, '/');
    while (encoded.length % 4)
      encoded += '=';
    return encoded;
};




isNumber = function (obj) {
  if(typeof obj === 'number')
      return true;
  else
      return false;
};


decryptData = function(private_key,str){
    try{
        let crypt = new Crypt();
        let decrypted = crypt.decrypt(private_key, str);
        let message = decrypted.message; 
        return JSON.parse(message);  
    }
    catch(e){
        return {};
    }
};


toObjectID = function (str)
{
    return isObjectID(str) ? str : '';
};

topObjectIDArray = function (array)
{
    return array.map((item)=> {return toObjectID(item)});
};


toFixed = function(num) {
    return parseInt('' + (num * 100)) / 100;
};

isFunction = function(functionToCheck)
{
    return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
};


setCache = async function(key,obj){
    try{
        let saveData = await ioredis.set(key,json2Str(obj));    
        return 1;
    }
    catch(e){
        return 0;
    }
};

getCache = async function(key){
    try{
        let data = await ioredis.get(key);    
        return toJSON(data);
    }
    catch(e){
        return null;
    }
};

delCache = async function(key){
    try{
        let data = await ioredis.del(key);    
        return true;
    }
    catch(e){
        console.log(e);
        return false;
    }
};


createID = async function(key,value)
{
    try{
        let isExists = await SchemaModels.GlobalIDModel.findOne({"_id": key}).countDocuments();
        if(isExists == 0)
        {
            let i = SchemaModels.GlobalIDModel({
                "_id":key,
                "value":value
            });
            let r = await i.save();
            return r;    
        }
    }
    catch (e) {
        return 0;
    }
};

nextID = async function(key)
{
    try{
        var doc = await SchemaModels.GlobalIDModel.findOneAndUpdate({"_id":key}
        ,{$inc:{'value':1}},{new:true,upsert:true});
        return doc.value;
    }
    catch (e) {
        return 0;
    }
};


initApp = async function()
{
    console.log('init app call');
    //let result = await createID('user_id',10000000);
}