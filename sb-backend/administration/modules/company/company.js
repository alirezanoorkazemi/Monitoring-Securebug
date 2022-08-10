const express = require('express');
const {hasPermission, isAuthenticate} = require('../../init');
const {makeHash} = require('../../../libs/token.helper');
const {getTimeStamp} = require('../../../libs/date.helper');
const {catchAsync} = require('../../../libs/error.helper');
const {setResponse} = require('../../../libs/message.helper');
const {
    hasValue, isUndefined, checkKey, getTypeFile, appDir,
    validExtensionImage, validExtensionFile, validExtensionVideo,
    validExtensionFileImage, random2, fileFilter
} = require('../../../libs/methode.helper');
const {ADMIN_RESOURCES, ACTIONS} = require('../../../libs/enum.helper');
const model = require('./company.model');
const router = express.Router();
const multer = require('multer');
const checkValidations = require('../../validation');
const fs = require('fs');
let fileAvatar = {"dir": "avatars", "field": "avatar", "type": "image"};
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        try {
            let dirResult = req.uploadDirs.find(o => o.field === file.fieldname);
            if (!isUndefined(dirResult) && checkKey(dirResult, 'dir'))
                cb(null, appDir + `media/${dirResult.dir}/`);
            else
                cb(null, appDir + 'media/');
        } catch {
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

let uploadDirs = [fileAvatar];

/**
 * @swagger
 * /administration/company:
 *   get:
 *     tags:
 *       - administration-company
 *     description: company administration
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : page
 *         type : number
 *         in: query
 *         required : true
 *         description : page
 *       - name : limit
 *         type : number
 *         in: query
 *         required : true
 *         description : limit ... [10,25,50,100]
 *       - name : email
 *         type : string
 *         in: query
 *         required : false
 *         description : email
 *       - name : is_verify
 *         type : boolean
 *         in: query
 *         required : false
 *         description : is_verify [true,false]
 *       - name : admin_verify
 *         type : boolean
 *         in: query
 *         required : false
 *         description : admin_verify [true,false]
 *       - name : select_term
 *         type : string
 *         in: query
 *         required : false
 *         description : select_term
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: |
 *               <pre>
 *               {"code":"403","result":"You don't have permission for this action","is_login":"0"}
 *               {"code":"-1","result":"token is empty","is_login":"-1"}
 *               {"code":"-1","result":"token invalid","is_login":"-1"}
 *               {"code":"-2","result":"user is not verified","is_login":"-2"}
 *               {"code":"-3","result":"user is not valid","is_login":"-3"}
 *               {"code":"401","result":"token is expired","is_login":"-4"}
 *               {"code":"4001","result":"refresh token is expired"}
 *               {"code":"0","result":{obj},"is_login":"0"}
 *               {"code":"2","result":"page number is empty","is_login":"0"}
 *               {"code":"3","result":"page number is not valid","is_login":"0"}
 *               {"code":"2","result":"limit is empty","is_login":"0"}
 *               {"code":"3","result":"limit is not valid","is_login":"0"}
 *               {"code":"3","result":"email is not valid","is_login":"0"}
 *               {"code":"3","result":"is_verify  is not valid","is_login":"0"}
 *               {"code":"3","result":"admin_verify is not valid","is_login":"0"}
 *               {"code":"3","result":"select_term is not valid","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.get('/',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.COMPANY, ACTIONS.READ),
    checkValidations("company_gets"),
    catchAsync(async (req, res) => {
        const user_info = {user_level_access: req.user.user_level_access};
        const data = Object.assign({}, req.query, user_info);
        return res.json(setResponse(await model.gets(data)));
    }));

/**
 * @swagger
 * /administration/company/chart/user-trend:
 *   get:
 *     tags:
 *       - administration-company
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
 *               {"code":"403","result":"You don't have permission for this action","is_login":"0"}
 *               {"code":"-1","result":"token is empty","is_login":"-1"}
 *               {"code":"-1","result":"token invalid","is_login":"-1"}
 *               {"code":"-2","result":"user is not verified","is_login":"-2"}
 *               {"code":"-3","result":"user is not valid","is_login":"-3"}
 *               {"code":"401","result":"token is expired","is_login":"-4"}
 *               {"code":"4001","result":"refresh token is expired"}
 *               {"code":"0","result":{obj},"is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.get('/chart/user-trend',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.COMPANY_CHART, ACTIONS.READ),
    catchAsync(async (req, res) => {
        return res.json(setResponse(await model.userTrendChart()));
    }));


/**
 * @swagger
 * /administration/company/online:
 *   get:
 *     tags:
 *       - administration-company
 *     description: company administration
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
 *               {"code":"403","result":"You don't have permission for this action","is_login":"0"}
 *               {"code":"-1","result":"token is empty","is_login":"-1"}
 *               {"code":"-1","result":"token invalid","is_login":"-1"}
 *               {"code":"-2","result":"user is not verified","is_login":"-2"}
 *               {"code":"-3","result":"user is not valid","is_login":"-3"}
 *               {"code":"401","result":"token is expired","is_login":"-4"}
 *               {"code":"4001","result":"refresh token is expired"}
 *               {"code":"0","result":{obj},"is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.get('/online',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.COMPANY, ACTIONS.READ),
    catchAsync(async (req, res) => {
        const user_info = {user_id: req.user._id, user_level_access: req.user.user_level_access};
        const data = Object.assign({}, user_info);
        return res.json(setResponse(await model.getOnlines(data)));
    }));

/**
 * @swagger
 * /administration/company/{id}:
 *   get:
 *     tags:
 *       - administration-company
 *     description: get company administration
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : id
 *         type : string
 *         in: path
 *         required : true
 *         description : company id
 *       - name : report_id
 *         type : string
 *         in: query
 *         required : false
 *         description : report id
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: |
 *               <pre>
 *               {"code":"403","result":"You don't have permission for this action","is_login":"0"}
 *               {"code":"-1","result":"token is empty","is_login":"-1"}
 *               {"code":"-1","result":"token invalid","is_login":"-1"}
 *               {"code":"-2","result":"user is not verified","is_login":"-2"}
 *               {"code":"-3","result":"user is not valid","is_login":"-3"}
 *               {"code":"401","result":"token is expired","is_login":"-4"}
 *               {"code":"4001","result":"refresh token is expired"}
 *               {"code":"0","result":"success","is_login":"0"}
 *               {"code":"2","result":"id is empty","is_login":"0"}
 *               {"code":"3","result":"id is not valid","is_login":"0"}
 *               {"code":"3","result":"report id is not valid","is_login":"0"}
 *               {"code":"1","result":"company is not found","is_login":"0"}
 *               {"code":"1","result":"report is not found","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.get('/:id',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.COMPANY, ACTIONS.READ),
    checkValidations("company_get"),
    catchAsync(async (req, res) => {
        const user_info = {id: req.params.id, user_id: req.user._id, user_level_access: req.user.user_level_access};
        const data = Object.assign({}, req.query, user_info);
        return res.json(setResponse(await model.get(data)));
    }));


/**
 * @swagger
 * /administration/company/{id}/reports:
 *   get:
 *     tags:
 *       - administration-company
 *     description: get company administration
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : id
 *         type : string
 *         in: path
 *         required : true
 *         description : company id
 *       - name : page
 *         type : number
 *         in: query
 *         required : true
 *         description : page
 *       - name : approved_reports_count
 *         type : boolean
 *         in: query
 *         required : false
 *         description : approved_reports_count
 *       - name : approved_reports_list
 *         type : boolean
 *         in: query
 *         required : false
 *         description : approved_reports_list
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: |
 *               <pre>
 *               {"code":"403","result":"You don't have permission for this action","is_login":"0"}
 *               {"code":"-1","result":"token is empty","is_login":"-1"}
 *               {"code":"-1","result":"token invalid","is_login":"-1"}
 *               {"code":"-2","result":"user is not verified","is_login":"-2"}
 *               {"code":"-3","result":"user is not valid","is_login":"-3"}
 *               {"code":"401","result":"token is expired","is_login":"-4"}
 *               {"code":"4001","result":"refresh token is expired"}
 *               {"code":"0","result":"success","is_login":"0"}
 *               {"code":"2","result":"id is empty","is_login":"0"}
 *               {"code":"3","result":"id is not valid","is_login":"0"}
 *               {"code":"3","result":"approved_reports_count id is not valid","is_login":"0"}
 *               {"code":"3","result":"approved_reports_list id is not valid","is_login":"0"}
 *               {"code":"1","result":"company is not found","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.get('/:id/reports',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.COMPANY, ACTIONS.READ),
    checkValidations("company_get-dashboard"),
    catchAsync(async (req, res) => {
        const user_info = {id: req.params.id, user_id: req.user._id, user_level_access: req.user.user_level_access};
        const data = Object.assign({approved_reports_count: false, approved_reports_list: false}, req.query, user_info);
        return res.json(setResponse(await model.getDashboard(data)));
    }));

/**
 * @swagger
 * /administration/company/{id}/payments:
 *   get:
 *     tags:
 *       - administration-company
 *     description: get company payments administration
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : page
 *         type : number
 *         in: query
 *         required : false
 *         description : page
 *       - name : limit
 *         type : number
 *         in: query
 *         required : false
 *         description : limit ... [10,25,50,100]
 *       - name : id
 *         type : string
 *         in: path
 *         required : true
 *         description : company id
 *       - name : transactions_history
 *         type : boolean
 *         in: query
 *         required : false
 *         description : transactions_history
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: |
 *               <pre>
 *               {"code":"403","result":"You don't have permission for this action","is_login":"0"}
 *               {"code":"-1","result":"token is empty","is_login":"-1"}
 *               {"code":"-1","result":"token invalid","is_login":"-1"}
 *               {"code":"-2","result":"user is not verified","is_login":"-2"}
 *               {"code":"-3","result":"user is not valid","is_login":"-3"}
 *               {"code":"401","result":"token is expired","is_login":"-4"}
 *               {"code":"4001","result":"refresh token is expired"}
 *               {"code":"0","result":"success","is_login":"0"}
 *               {"code":"2","result":"id is empty","is_login":"0"}
 *               {"code":"3","result":"id is not valid","is_login":"0"}
 *               {"code":"3","result":"transactions_history is not valid","is_login":"0"}
 *               {"code":"1","result":"company is not found","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.get('/:id/payments',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.COMPANY, ACTIONS.READ),
    checkValidations("company_get-payments"),
    catchAsync(async (req, res) => {
        const user_info = {id: req.params.id, user_id: req.user._id, user_level_access: req.user.user_level_access};
        const data = Object.assign({transactions_history: false}, req.query, user_info);
        return res.json(setResponse(await model.getPayments(data)));
    }));

/**
 * @swagger
 * /administration/company/{id}/programs:
 *   get:
 *     tags:
 *       - administration-company
 *     description: get company programs administration
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : reports_count
 *         type : boolean
 *         in: query
 *         required : false
 *         description : reports_count
 *       - name : id
 *         type : string
 *         in: path
 *         required : true
 *         description : company id
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: |
 *               <pre>
 *               {"code":"403","result":"You don't have permission for this action","is_login":"0"}
 *               {"code":"-1","result":"token is empty","is_login":"-1"}
 *               {"code":"-1","result":"token invalid","is_login":"-1"}
 *               {"code":"-2","result":"user is not verified","is_login":"-2"}
 *               {"code":"-3","result":"user is not valid","is_login":"-3"}
 *               {"code":"401","result":"token is expired","is_login":"-4"}
 *               {"code":"4001","result":"refresh token is expired"}
 *               {"code":"0","result":"success","is_login":"0"}
 *               {"code":"2","result":"id is empty","is_login":"0"}
 *               {"code":"3","result":"id is not valid","is_login":"0"}
 *               {"code":"3","result":"reports_count is not valid","is_login":"0"}
 *               {"code":"1","result":"company is not found","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.get('/:id/programs',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.COMPANY, ACTIONS.READ),
    checkValidations("company_get-programs"),
    catchAsync(async (req, res) => {
        const user_info = {id: req.params.id, user_id: req.user._id, user_level_access: req.user.user_level_access};
        const data = Object.assign({reports_count: false}, req.query, user_info);
        return res.json(setResponse(await model.getPrograms(data)));
    }));

/**
 * @swagger
 * /administration/company/{id}/charts:
 *   get:
 *     tags:
 *       - administration-company
 *     description: get company charts
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : id
 *         type : string
 *         in: path
 *         required : true
 *         description : company id
 *       - name : reports_status
 *         type : boolean
 *         in: query
 *         required : false
 *         description : reports_status
 *       - name : reports_severity
 *         type : boolean
 *         in: query
 *         required : false
 *         description : reports_severity
 *       - name : programs
 *         type : boolean
 *         in: query
 *         required : false
 *         description : programs
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: |
 *               <pre>
 *               {"code":"403","result":"You don't have permission for this action","is_login":"0"}
 *               {"code":"-1","result":"token is empty","is_login":"-1"}
 *               {"code":"-1","result":"token invalid","is_login":"-1"}
 *               {"code":"-2","result":"user is not verified","is_login":"-2"}
 *               {"code":"-3","result":"user is not valid","is_login":"-3"}
 *               {"code":"401","result":"token is expired","is_login":"-4"}
 *               {"code":"4001","result":"refresh token is expired"}
 *               {"code":"0","result":"success","is_login":"0"}
 *               {"code":"2","result":"id is empty","is_login":"0"}
 *               {"code":"3","result":"id is not valid","is_login":"0"}
 *               {"code":"3","result":"reports_severity is not valid","is_login":"0"}
 *               {"code":"3","result":"reports_status is not valid","is_login":"0"}
 *               {"code":"3","result":"programs is not valid","is_login":"0"}
 *               {"code":"1","result":"company is not found","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.get('/:id/charts',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.COMPANY, ACTIONS.READ),
    checkValidations("company_get-charts"),
    catchAsync(async (req, res) => {
        const user_info = {id: req.params.id, user_id: req.user._id, user_level_access: req.user.user_level_access};
        const data = Object.assign({
            programs: false,
            reports_severity: false,
            reports_status: false
        }, req.query, user_info);
        return res.json(setResponse(await model.getCharts(data)));
    }));

/**
 * @swagger
 * /administration/company/{id}/members:
 *   get:
 *     tags:
 *       - administration-company
 *     description: get company members administration
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : id
 *         type : string
 *         in: path
 *         required : true
 *         description : company id
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: |
 *               <pre>
 *               {"code":"403","result":"You don't have permission for this action","is_login":"0"}
 *               {"code":"-1","result":"token is empty","is_login":"-1"}
 *               {"code":"-1","result":"token invalid","is_login":"-1"}
 *               {"code":"-2","result":"user is not verified","is_login":"-2"}
 *               {"code":"-3","result":"user is not valid","is_login":"-3"}
 *               {"code":"401","result":"token is expired","is_login":"-4"}
 *               {"code":"4001","result":"refresh token is expired"}
 *               {"code":"0","result":"success","is_login":"0"}
 *               {"code":"2","result":"id is empty","is_login":"0"}
 *               {"code":"3","result":"id is not valid","is_login":"0"}
 *               {"code":"1","result":"company is not found","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.get('/:id/members',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.COMPANY_MEMBER, ACTIONS.READ),
    checkValidations("company_get-members"),
    catchAsync(async (req, res) => {
        return res.json(setResponse(await model.getMembers(req.params.id)));
    }));

/**
 * @swagger
 * /administration/company/{id}:
 *   put:
 *     tags:
 *       - administration-company
 *     description: update company administration
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : id
 *         type : string
 *         in: path
 *         required : true
 *         description : company id
 *       - name : tab
 *         type : number
 *         in: formData
 *         required : true
 *         description : tab
 *       - name : fn
 *         type : string
 *         in: formData
 *         required : false
 *         description : first name
 *       - name : ln
 *         type : string
 *         in: formData
 *         required : false
 *         description : last name
 *       - name : organization_name
 *         type : string
 *         in: formData
 *         required : false
 *         description : organization_name
 *       - name : display_name
 *         type : string
 *         in: formData
 *         required : false
 *         description : display_name
 *       - name : role
 *         type : string
 *         in: formData
 *         required : false
 *         description : role
 *       - name : short_introduction
 *         type : string
 *         in: formData
 *         required : false
 *         description : short_introduction
 *       - name : github_url
 *         type : string
 *         in: formData
 *         required : false
 *         description : github_url
 *       - name : linkedin_url
 *         type : string
 *         in: formData
 *         required : false
 *         description : linkedin_url
 *       - name : twitter_url
 *         type : string
 *         in: formData
 *         required : false
 *         description : twitter_url
 *       - name : website_url
 *         type : string
 *         in: formData
 *         required : false
 *         description : website_url
 *       - name : linkedin_url
 *         type : string
 *         in: formData
 *         required : false
 *         description : linkedin_url
 *       - name : company_country_id
 *         type : string
 *         in: formData
 *         required : false
 *         description : company_country_id
 *       - name : about
 *         type : string
 *         in: formData
 *         required : false
 *         description : about
 *       - name : postal_code
 *         type : string
 *         in: formData
 *         required : false
 *         description : postal_code
 *       - name : phone
 *         type : string
 *         in: formData
 *         required : false
 *         description : phone
 *       - name : city
 *         type : string
 *         in: formData
 *         required : false
 *         description : city
 *       - name : region
 *         type : string
 *         in: formData
 *         required : false
 *         description : region
 *       - name : profile_visibility
 *         type : boolean
 *         in: formData
 *         required : false
 *         description : profile_visibility
 *       - name : address1
 *         type : string
 *         in: formData
 *         required : false
 *         description : address1
 *       - name : address2
 *         type : string
 *         in: formData
 *         required : false
 *         description : address2
 *       - name : invoice_address_reference
 *         type : string
 *         in: formData
 *         required : false
 *         description : invoice_address_reference
 *       - name : invoice_address_email
 *         type : string
 *         in: formData
 *         required : false
 *         description : invoice_address_email
 *       - name : invoice_address_address1
 *         type : string
 *         in: formData
 *         required : false
 *         description : invoice_address_address1
 *       - name : invoice_address_address2
 *         type : string
 *         in: formData
 *         required : false
 *         description : invoice_address_address2
 *       - name : invoice_address_country_id
 *         type : string
 *         in: formData
 *         required : false
 *         description : invoice_address_country_id
 *       - name : invoice_address_zip_code
 *         type : string
 *         in: formData
 *         required : false
 *         description : invoice_address_zip_code
 *       - name : invoice_address_city
 *         type : string
 *         in: formData
 *         required : false
 *         description : invoice_address_city
 *       - name : credit_card_number
 *         type : string
 *         in: formData
 *         required : false
 *         description : credit_card_number
 *       - name : credit_date
 *         type : string
 *         in: formData
 *         required : false
 *         description : credit_date
 *       - name : credit_cvc
 *         type : string
 *         in: formData
 *         required : false
 *         description : credit_cvc
 *       - name : credit_bank_holder_name
 *         type : string
 *         in: formData
 *         required : false
 *         description : credit_bank_holder_name
 *       - name : credit_currency_id
 *         type : string
 *         in: formData
 *         required : false
 *         description : credit_currency_id
 *       - name : payment_paypal_email
 *         type : string
 *         in: formData
 *         required : false
 *         description : payment_paypal_email
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: |
 *               <pre>
 *               {"code":"403","result":"You don't have permission for this action","is_login":"0"}
 *               {"code":"-1","result":"token is empty","is_login":"-1"}
 *               {"code":"-1","result":"token invalid","is_login":"-1"}
 *               {"code":"-2","result":"user is not verified","is_login":"-2"}
 *               {"code":"-3","result":"user is not valid","is_login":"-3"}
 *               {"code":"401","result":"token is expired","is_login":"-4"}
 *               {"code":"4001","result":"refresh token is expired"}
 *               {"code":"0","result":"success","is_login":"0"}
 *               {"code":"2","result":"id is empty","is_login":"0"}
 *               {"code":"2","result":"first_name is empty","is_login":"0"}
 *               {"code":"2","result":"last_name is empty","is_login":"0"}
 *               {"code":"2","result":"profile_visibility is empty","is_login":"0"}
 *               {"code":"2","result":"tab is empty","is_login":"0"}
 *               {"code":"3","result":"id is not valid","is_login":"0"}
 *               {"code":"3","result":"profile_visibility is not valid","is_login":"0"}
 *               {"code":"3","result":"first_name is not valid","is_login":"0"}
 *               {"code":"3","result":"last_name is not valid","is_login":"0"}
 *               {"code":"3","result":"organization_name is not valid","is_login":"0"}
 *               {"code":"3","result":"display_name is not valid","is_login":"0"}
 *               {"code":"3","result":"role is not valid","is_login":"0"}
 *               {"code":"3","result":"tab is not valid","is_login":"0"}
 *               {"code":"3","result":"short_introduction is not valid","is_login":"0"}
 *               {"code":"3","result":"github_url is not valid","is_login":"0"}
 *               {"code":"3","result":"linkedin_url is not valid","is_login":"0"}
 *               {"code":"3","result":"twitter_url is not valid","is_login":"0"}
 *               {"code":"3","result":"website_url is not valid","is_login":"0"}
 *               {"code":"3","result":"about is not valid","is_login":"0"}
 *               {"code":"3","result":"company_country_id is not valid","is_login":"0"}
 *               {"code":"3","result":"phone is not valid","is_login":"0"}
 *               {"code":"3","result":"invoice_address_reference is not valid","is_login":"0"}
 *               {"code":"3","result":"city is not valid","is_login":"0"}
 *               {"code":"3","result":"region is not valid","is_login":"0"}
 *               {"code":"3","result":"postal_code is not valid","is_login":"0"}
 *               {"code":"3","result":"address1 is not valid","is_login":"0"}
 *               {"code":"3","result":"address2 is not valid","is_login":"0"}
 *               {"code":"3","result":"invoice_address_email is not valid","is_login":"0"}
 *               {"code":"3","result":"invoice_address_address1 is not valid","is_login":"0"}
 *               {"code":"3","result":"invoice_address_address2 is not valid","is_login":"0"}
 *               {"code":"3","result":"invoice_address_country_id is not valid","is_login":"0"}
 *               {"code":"3","result":"invoice_address_zip_code is not valid","is_login":"0"}
 *               {"code":"3","result":"invoice_address_city is not valid","is_login":"0"}
 *               {"code":"3","result":"credit_card_number is not valid","is_login":"0"}
 *               {"code":"3","result":"credit_date is not valid","is_login":"0"}
 *               {"code":"3","result":"credit_cvc is not valid","is_login":"0"}
 *               {"code":"3","result":"credit_bank_holder_name is not valid","is_login":"0"}
 *               {"code":"3","result":"credit_currency_id is not valid","is_login":"0"}
 *               {"code":"3","result":"payment_paypal_email is not valid","is_login":"0"}
 *               {"code":"1","result":"company is not found","is_login":"0"}
 *               {"code":"16","result":"display_name is already exists","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.put('/:id',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.COMPANY, ACTIONS.UPDATE),
    checkValidations("company_update"),
    catchAsync(async (req, res) => {
        const user_info = {id: req.user._id};
        const data = {id: req.params.id, company: req.body, user_info};
        return res.json(setResponse(await model.update(data)));
    }));

/**
 * @swagger
 * /administration/company/{id}:
 *   delete:
 *     tags:
 *       - administration-company
 *     description: delete company administration
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : id
 *         type : string
 *         in: path
 *         required : true
 *         description : hacker id
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: |
 *               <pre>
 *               {"code":"403","result":"You don't have permission for this action","is_login":"0"}
 *               {"code":"-1","result":"token is empty","is_login":"-1"}
 *               {"code":"-1","result":"token invalid","is_login":"-1"}
 *               {"code":"-2","result":"user is not verified","is_login":"-2"}
 *               {"code":"-3","result":"user is not valid","is_login":"-3"}
 *               {"code":"401","result":"token is expired","is_login":"-4"}
 *               {"code":"4001","result":"refresh token is expired"}
 *               {"code":"0","result":"success","is_login":"0"}
 *               {"code":"2","result":"id is empty","is_login":"0"}
 *               {"code":"3","result":"id is not valid","is_login":"0"}
 *               {"code":"1","result":"company is not found","is_login":"0"}
 *               {"code":"20","result":"company is verify by admin","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.delete('/:id',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.COMPANY, ACTIONS.DELETE),
    checkValidations("company_delete"),
    catchAsync(async (req, res) => {
        const user_info = {id: req.user._id};
        await model.delete(req.params.id, user_info);
        return res.json(setResponse());
    }));

/**
 * @swagger
 * /administration/company/{id}/members:
 *   post:
 *     tags:
 *       - administration-company
 *     description: add company members administration
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : id
 *         type : string
 *         in: path
 *         required : true
 *         description : company id
 *       - name : access_program_list
 *         type : object
 *         in: formData
 *         required : true
 *         description : access_program_list
 *       - name : user_level_access
 *         type : number
 *         in: formData
 *         required : true
 *         description : user_level_access ...[1,2]
 *       - name : status
 *         type : boolean
 *         in: formData
 *         required : true
 *         description : status
 *       - name : comment
 *         type : boolean
 *         in: formData
 *         required : true
 *         description : comment
 *       - name : fn
 *         type : string
 *         in: formData
 *         required : true
 *         description : first name
 *       - name : ln
 *         type : string
 *         in: formData
 *         required : true
 *         description : last name
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
 *       - name : confirm_password
 *         type : string
 *         in: formData
 *         required : true
 *         description : confirm_password
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: |
 *               <pre>
 *               {"code":"403","result":"You don't have permission for this action","is_login":"0"}
 *               {"code":"-1","result":"token is empty","is_login":"-1"}
 *               {"code":"-1","result":"token invalid","is_login":"-1"}
 *               {"code":"-2","result":"user is not verified","is_login":"-2"}
 *               {"code":"-3","result":"user is not valid","is_login":"-3"}
 *               {"code":"401","result":"token is expired","is_login":"-4"}
 *               {"code":"4001","result":"refresh token is expired"}
 *               {"code":"0","result":"success","is_login":"0"}
 *               {"code":"2","result":"id is empty","is_login":"0"}
 *               {"code":"2","result":"comment is empty","is_login":"0"}
 *               {"code":"2","result":"fn is empty","is_login":"0"}
 *               {"code":"2","result":"ln is empty","is_login":"0"}
 *               {"code":"2","result":"email is empty","is_login":"0"}
 *               {"code":"2","result":"status is empty","is_login":"0"}
 *               {"code":"2","result":"user_level_access is empty","is_login":"0"}
 *               {"code":"2","result":"confirm_password is empty","is_login":"0"}
 *               {"code":"2","result":"password is empty","is_login":"0"}
 *               {"code":"3","result":"id is not valid","is_login":"0"}
 *               {"code":"3","result":"comment is not valid","is_login":"0"}
 *               {"code":"3","result":"fn is not valid","is_login":"0"}
 *               {"code":"3","result":"ln is not valid","is_login":"0"}
 *               {"code":"3","result":"email is not valid","is_login":"0"}
 *               {"code":"3","result":"status is not valid","is_login":"0"}
 *               {"code":"3","result":"user_level_access is not valid","is_login":"0"}
 *               {"code":"3","result":"confirm_password is not valid","is_login":"0"}
 *               {"code":"3","result":"password is not valid","is_login":"0"}
 *               {"code":"1","result":"company is not found","is_login":"0"}
 *               {"code":"14","result":"confirm_password is not equal with password","is_login":"0"}
 *               {"code":"15","result":"email is exist","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/:id/members',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.COMPANY_MEMBER, ACTIONS.CREATE),
    checkValidations("company_add-member"),
    catchAsync(async (req, res) => {
        const user_info = {id: req.user._id};
        const data = {id: req.params.id, member: req.body, user_info};
        return res.json(setResponse(await model.addMember(data)));
    }));

/**
 * @swagger
 * /administration/company/{id}/members/{member_id}:
 *   put:
 *     tags:
 *       - administration-company
 *     description: update company members administration
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : id
 *         type : string
 *         in: path
 *         required : true
 *         description : company id
 *       - name : member_id
 *         type : string
 *         in: path
 *         required : true
 *         description : member-id
 *       - name : access_program_list
 *         type : object
 *         in: formData
 *         required : true
 *         description : access_program_list
 *       - name : user_level_access
 *         type : number
 *         in: formData
 *         required : true
 *         description : user_level_access ...[1,2]
 *       - name : status
 *         type : boolean
 *         in: formData
 *         required : true
 *         description : status
 *       - name : comment
 *         type : boolean
 *         in: formData
 *         required : true
 *         description : comment
 *       - name : fn
 *         type : string
 *         in: formData
 *         required : true
 *         description : first name
 *       - name : ln
 *         type : string
 *         in: formData
 *         required : true
 *         description : last name
 *       - name : email
 *         type : string
 *         in: formData
 *         required : true
 *         description : email
 *       - name : password
 *         type : string
 *         in: formData
 *         required : false
 *         description : password
 *       - name : confirm_password
 *         type : string
 *         in: formData
 *         required : false
 *         description : confirm_password
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: |
 *               <pre>
 *               {"code":"403","result":"You don't have permission for this action","is_login":"0"}
 *               {"code":"-1","result":"token is empty","is_login":"-1"}
 *               {"code":"-1","result":"token invalid","is_login":"-1"}
 *               {"code":"-2","result":"user is not verified","is_login":"-2"}
 *               {"code":"-3","result":"user is not valid","is_login":"-3"}
 *               {"code":"401","result":"token is expired","is_login":"-4"}
 *               {"code":"4001","result":"refresh token is expired"}
 *               {"code":"0","result":"success","is_login":"0"}
 *               {"code":"2","result":"id is empty","is_login":"0"}
 *               {"code":"2","result":"member_id is empty","is_login":"0"}
 *               {"code":"2","result":"fn is empty","is_login":"0"}
 *               {"code":"2","result":"ln is empty","is_login":"0"}
 *               {"code":"2","result":"comment is empty","is_login":"0"}
 *               {"code":"2","result":"email is empty","is_login":"0"}
 *               {"code":"2","result":"status is empty","is_login":"0"}
 *               {"code":"2","result":"user_level_access is empty","is_login":"0"}
 *               {"code":"3","result":"id is not valid","is_login":"0"}
 *               {"code":"3","result":"id is not valid","is_login":"0"}
 *               {"code":"3","result":"comment is not valid","is_login":"0"}
 *               {"code":"3","result":"member_id is not valid","is_login":"0"}
 *               {"code":"3","result":"ln is not valid","is_login":"0"}
 *               {"code":"3","result":"email is not valid","is_login":"0"}
 *               {"code":"3","result":"status is not valid","is_login":"0"}
 *               {"code":"3","result":"user_level_access is not valid","is_login":"0"}
 *               {"code":"3","result":"confirm_password is not valid","is_login":"0"}
 *               {"code":"3","result":"password is not valid","is_login":"0"}
 *               {"code":"1","result":"company is not found","is_login":"0"}
 *               {"code":"14","result":"confirm_password is not equal with password","is_login":"0"}
 *               {"code":"15","result":"email is exist","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.put('/:id/members/:member_id',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.COMPANY_MEMBER, ACTIONS.UPDATE),
    checkValidations("company_update-member"),
    catchAsync(async (req, res) => {
        const user_info = {id: req.user._id};
        const data = {id: req.params.id, member_id: req.params.member_id, member: req.body, user_info};
        await model.updateMember(data);
        return res.json(setResponse());
    }));

/**
 * @swagger
 * /administration/company/{id}/members/{member_id}:
 *   delete:
 *     tags:
 *       - administration-company
 *     description: delete company members administration
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : id
 *         type : string
 *         in: path
 *         required : true
 *         description : company id
 *       - name : member_id
 *         type : string
 *         in: path
 *         required : true
 *         description : member-id
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: |
 *               <pre>
 *               {"code":"403","result":"You don't have permission for this action","is_login":"0"}
 *               {"code":"-1","result":"token is empty","is_login":"-1"}
 *               {"code":"-1","result":"token invalid","is_login":"-1"}
 *               {"code":"-2","result":"user is not verified","is_login":"-2"}
 *               {"code":"-3","result":"user is not valid","is_login":"-3"}
 *               {"code":"401","result":"token is expired","is_login":"-4"}
 *               {"code":"4001","result":"refresh token is expired"}
 *               {"code":"0","result":"success","is_login":"0"}
 *               {"code":"2","result":"id is empty","is_login":"0"}
 *               {"code":"2","result":"member_id is empty","is_login":"0"}
 *               {"code":"3","result":"id is not valid","is_login":"0"}
 *               {"code":"3","result":"member_id is not valid","is_login":"0"}
 *               {"code":"1","result":"company is not found","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.delete('/:id/members/:member_id',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.COMPANY_MEMBER, ACTIONS.DELETE),
    checkValidations("company_delete-member"),
    catchAsync(async (req, res) => {
        const user_info = {id: req.user._id};
        const data = {id: req.params.id, member_id: req.params.member_id, user_info};
        await model.deleteMember(data);
        return res.json(setResponse());
    }));

/**
 * @swagger
 * /administration/company/{id}/members/activity/{member_id}:
 *   put:
 *     tags:
 *       - administration-company
 *     description: change activity company members administration
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : id
 *         type : string
 *         in: path
 *         required : true
 *         description : company id
 *       - name : member_id
 *         type : string
 *         in: path
 *         required : true
 *         description : member-id
 *       - name : account_is_disable
 *         type : boolean
 *         in: body
 *         required : true
 *         description : account_is_disable member
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: |
 *               <pre>
 *               {"code":"403","result":"You don't have permission for this action","is_login":"0"}
 *               {"code":"-1","result":"token is empty","is_login":"-1"}
 *               {"code":"-1","result":"token invalid","is_login":"-1"}
 *               {"code":"-2","result":"user is not verified","is_login":"-2"}
 *               {"code":"-3","result":"user is not valid","is_login":"-3"}
 *               {"code":"401","result":"token is expired","is_login":"-4"}
 *               {"code":"4001","result":"refresh token is expired"}
 *               {"code":"0","result":"success","is_login":"0"}
 *               {"code":"2","result":"id is empty","is_login":"0"}
 *               {"code":"2","result":"member_id is empty","is_login":"0"}
 *               {"code":"3","result":"id is not valid","is_login":"0"}
 *               {"code":"3","result":"member_id is not valid","is_login":"0"}
 *               {"code":"1","result":"company is not found","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.put('/:id/members/activity/:member_id',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.COMPANY_MEMBER, ACTIONS.UPDATE),
    checkValidations("company_change-activity-member"),
    catchAsync(async (req, res) => {
        const data = {
            id: req.params.id,
            member_id: req.params.member_id,
            account_is_disable: req.body.account_is_disable
        };
        await model.changeMemberActivity(data);
        return res.json(setResponse());
    }));

/**
 * @swagger
 * /administration/company/status/{id}:
 *   patch:
 *     tags:
 *       - administration-company
 *     description: change-status company administration
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : id
 *         type : string
 *         in: path
 *         required : true
 *         description : company id
 *       - name : status
 *         type : boolean
 *         in: formData
 *         required : true
 *         description : status
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: |
 *               <pre>
 *               {"code":"403","result":"You don't have permission for this action","is_login":"0"}
 *               {"code":"-1","result":"token is empty","is_login":"-1"}
 *               {"code":"-1","result":"token invalid","is_login":"-1"}
 *               {"code":"-2","result":"user is not verified","is_login":"-2"}
 *               {"code":"-3","result":"user is not valid","is_login":"-3"}
 *               {"code":"401","result":"token is expired","is_login":"-4"}
 *               {"code":"4001","result":"refresh token is expired"}
 *               {"code":"0","result":"success","is_login":"0"}
 *               {"code":"2","result":"id is empty","is_login":"0"}
 *               {"code":"3","result":"id is not valid","is_login":"0"}
 *               {"code":"2","result":"status is empty","is_login":"0"}
 *               {"code":"3","result":"status is not valid","is_login":"0"}
 *               {"code":"1","result":"company is not found","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.patch('/status/:id',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.COMPANY, ACTIONS.UPDATE),
    checkValidations("company_change-status"),
    catchAsync(async (req, res) => {
        const data = {id: req.params.id, status: req.body.status, user_id: req.user._id};
        await model.changeStatus(data);
        return res.json(setResponse());
    }));

/**
 * @swagger
 * /administration/company/disable-2fa/{id}:
 *   patch:
 *     tags:
 *       - administration-company
 *     description: disable-2fa company administration
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : id
 *         type : string
 *         in: path
 *         required : true
 *         description : company id
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: |
 *               <pre>
 *               {"code":"403","result":"You don't have permission for this action","is_login":"0"}
 *               {"code":"-1","result":"token is empty","is_login":"-1"}
 *               {"code":"-1","result":"token invalid","is_login":"-1"}
 *               {"code":"-2","result":"user is not verified","is_login":"-2"}
 *               {"code":"-3","result":"user is not valid","is_login":"-3"}
 *               {"code":"401","result":"token is expired","is_login":"-4"}
 *               {"code":"4001","result":"refresh token is expired"}
 *               {"code":"0","result":"success","is_login":"0"}
 *               {"code":"2","result":"id is empty","is_login":"0"}
 *               {"code":"3","result":"id is not valid","is_login":"0"}
 *               {"code":"1","result":"company is not found","is_login":"0"}
 *               {"code":"20","result":"2fa already disabled","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/disable-2fa/:id',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.COMPANY, ACTIONS.UPDATE),
    checkValidations("company_disable-2fa"),
    catchAsync(async (req, res) => {
        const data = {id: req.params.id, user_id: req.user._id};
        await model.disable2FA(data);
        return res.json(setResponse());
    }));

/**
 * @swagger
 * /administration/company/password/{id}:
 *   patch:
 *     tags:
 *       - administration-company
 *     description: change-password company administration
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : id
 *         type : string
 *         in: path
 *         required : true
 *         description : company id
 *       - name : password
 *         type : string
 *         in: formData
 *         required : true
 *         description : new password
 *       - name : confirm_password
 *         type : string
 *         in: formData
 *         required : true
 *         description : confirm_password
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: |
 *               <pre>
 *               {"code":"403","result":"You don't have permission for this action","is_login":"0"}
 *               {"code":"-1","result":"token is empty","is_login":"-1"}
 *               {"code":"-1","result":"token invalid","is_login":"-1"}
 *               {"code":"-2","result":"user is not verified","is_login":"-2"}
 *               {"code":"-3","result":"user is not valid","is_login":"-3"}
 *               {"code":"401","result":"token is expired","is_login":"-4"}
 *               {"code":"4001","result":"refresh token is expired"}
 *               {"code":"0","result":"success","is_login":"0"}
 *               {"code":"2","result":"id is empty","is_login":"0"}
 *               {"code":"3","result":"id is not valid","is_login":"0"}
 *               {"code":"2","result":"password is empty","is_login":"0"}
 *               {"code":"3","result":"password is not valid","is_login":"0"}
 *               {"code":"2","result":"confirm_password is empty","is_login":"0"}
 *               {"code":"3","result":"confirm_password is not valid","is_login":"0"}
 *               {"code":"1","result":"company is not found","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.patch('/password/:id',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.COMPANY, ACTIONS.UPDATE),
    checkValidations("company_change-password"),
    catchAsync(async (req, res) => {
        const data = {
            id: req.params.id,
            password: req.body.password,
            confirm_password: req.body.confirm_password,
            user_id: req.user._id
        };
        await model.changePassword(data);
        return res.json(setResponse());
    }));

/**
 * @swagger
 * /administration/company/is-verify/{id}:
 *   patch:
 *     tags:
 *       - administration-company
 *     description: change-verify company administration
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : id
 *         type : string
 *         in: path
 *         required : true
 *         description : company id
 *       - name : is_verify
 *         type : boolean
 *         in: formData
 *         required : true
 *         description : is_verify
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: |
 *               <pre>
 *               {"code":"403","result":"You don't have permission for this action","is_login":"0"}
 *               {"code":"-1","result":"token is empty","is_login":"-1"}
 *               {"code":"-1","result":"token invalid","is_login":"-1"}
 *               {"code":"-2","result":"user is not verified","is_login":"-2"}
 *               {"code":"-3","result":"user is not valid","is_login":"-3"}
 *               {"code":"401","result":"token is expired","is_login":"-4"}
 *               {"code":"4001","result":"refresh token is expired"}
 *               {"code":"0","result":"success","is_login":"0"}
 *               {"code":"2","result":"id is empty","is_login":"0"}
 *               {"code":"3","result":"id is not valid","is_login":"0"}
 *               {"code":"2","result":"is_verify is empty","is_login":"0"}
 *               {"code":"3","result":"is_verify is not valid","is_login":"0"}
 *               {"code":"1","result":"company is not found","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.patch('/is-verify/:id',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.COMPANY, ACTIONS.UPDATE),
    checkValidations("company_change-verify"),
    catchAsync(async (req, res) => {
        const data = {id: req.params.id, is_verify: req.body.is_verify, user_id: req.user._id};
        await model.changeVerify(data);
        return res.json(setResponse());
    }));

/**
 * @swagger
 * /administration/company/account-activity/{id}:
 *   patch:
 *     tags:
 *       - administration-company
 *     description: change-account-activity company administration
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : id
 *         type : string
 *         in: path
 *         required : true
 *         description : company id
 *       - name : account_is_disable
 *         type : boolean
 *         in: formData
 *         required : true
 *         description : account_is_disable
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: |
 *               <pre>
 *               {"code":"403","result":"You don't have permission for this action","is_login":"0"}
 *               {"code":"-1","result":"token is empty","is_login":"-1"}
 *               {"code":"-1","result":"token invalid","is_login":"-1"}
 *               {"code":"-2","result":"user is not verified","is_login":"-2"}
 *               {"code":"-3","result":"user is not valid","is_login":"-3"}
 *               {"code":"401","result":"token is expired","is_login":"-4"}
 *               {"code":"4001","result":"refresh token is expired"}
 *               {"code":"0","result":"success","is_login":"0"}
 *               {"code":"2","result":"id is empty","is_login":"0"}
 *               {"code":"3","result":"id is not valid","is_login":"0"}
 *               {"code":"2","result":"account_is_disable is empty","is_login":"0"}
 *               {"code":"3","result":"account_is_disable is not valid","is_login":"0"}
 *               {"code":"1","result":"company is not found","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.patch('/account-activity/:id',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.COMPANY, ACTIONS.UPDATE),
    checkValidations("company_change-account-activity"),
    catchAsync(async (req, res) => {
        const data = {id: req.params.id, account_is_disable: req.body.account_is_disable, user_id: req.user._id};
        await model.changeActivity(data);
        return res.json(setResponse());
    }));

/**
 * @swagger
 * /administration/company/admin-verify/{id}:
 *   patch:
 *     tags:
 *       - administration-company
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : id
 *         type : string
 *         in: path
 *         required : true
 *         description : company id
 *       - name : admin_verify
 *         type : boolean
 *         in: formData
 *         required : true
 *         description : admin_verify
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: |
 *               <pre>
 *               {"code":"403","result":"You don't have permission for this action","is_login":"0"}
 *               {"code":"-1","result":"token is empty","is_login":"-1"}
 *               {"code":"-1","result":"token invalid","is_login":"-1"}
 *               {"code":"-2","result":"user is not verified","is_login":"-2"}
 *               {"code":"-3","result":"user is not valid","is_login":"-3"}
 *               {"code":"401","result":"token is expired","is_login":"-4"}
 *               {"code":"4001","result":"refresh token is expired"}
 *               {"code":"0","result":"success","is_login":"0"}
 *               {"code":"2","result":"id is empty","is_login":"0"}
 *               {"code":"3","result":"id is not valid","is_login":"0"}
 *               {"code":"2","result":"admin_verify is empty","is_login":"0"}
 *               {"code":"3","result":"admin_verify is not valid","is_login":"0"}
 *               {"code":"1","result":"company is not found","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.patch('/admin-verify/:id',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.COMPANY, ACTIONS.UPDATE),
    checkValidations("company_change-admin-verify"),
    catchAsync(async (req, res) => {
        const data = {id: req.params.id, admin_verify: req.body.admin_verify, user_id: req.user._id};
        await model.changeAdminVerify(data);
        return res.json(setResponse());
    }));

/**
 * @swagger
 * /administration/company/is-fully-manage/{id}:
 *   patch:
 *     tags:
 *       - administration-company
 *     description: change-is-fully-manage company administration
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : id
 *         type : string
 *         in: path
 *         required : true
 *         description : company id
 *       - name : is_fully_manage
 *         type : boolean
 *         in: formData
 *         required : true
 *         description : is_fully_manage
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: |
 *               <pre>
 *               {"code":"403","result":"You don't have permission for this action","is_login":"0"}
 *               {"code":"-1","result":"token is empty","is_login":"-1"}
 *               {"code":"-1","result":"token invalid","is_login":"-1"}
 *               {"code":"-2","result":"user is not verified","is_login":"-2"}
 *               {"code":"-3","result":"user is not valid","is_login":"-3"}
 *               {"code":"401","result":"token is expired","is_login":"-4"}
 *               {"code":"4001","result":"refresh token is expired"}
 *               {"code":"0","result":"success","is_login":"0"}
 *               {"code":"2","result":"id is empty","is_login":"0"}
 *               {"code":"3","result":"id is not valid","is_login":"0"}
 *               {"code":"2","result":"is_fully_manage is empty","is_login":"0"}
 *               {"code":"3","result":"is_fully_manage is not valid","is_login":"0"}
 *               {"code":"1","result":"company is not found","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.patch('/is-fully-manage/:id',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.COMPANY, ACTIONS.UPDATE),
    checkValidations("company_change-is-fully-manage"),
    catchAsync(async (req, res) => {
        const data = {id: req.params.id, is_fully_manage: req.body.is_fully_manage, user_id: req.user._id};
        await model.changeIsFullyManage(data);
        return res.json(setResponse());
    }));

/**
 * @swagger
 * /administration/company/avatar/{id}:
 *   patch:
 *     tags:
 *       - company
 *     description: upload avatar file company
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : id
 *         type : string
 *         in: path
 *         required : true
 *         description : company id
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
 *               {"code":"403","result":"You don't have permission for this action"}
 *               {"code":"-1","result":"token is empty","is_login":"-1"}
 *               {"code":"-1","result":"token invalid","is_login":"-1"}
 *               {"code":"-1","result":"token expire","is_login":"-1"}
 *               {"code":"-2","result":"account is not verify","is_login":"-2"}
 *               {"code":"-3","result":"account is disabled","is_login":"-3"}
 *               {"code":"0","result":"saved","is_login":"0","avatar_file":"avatar_file_address"}
 *               {"code":"2","result":"company id is empty","is_login":"0"}
 *               {"code":"2","result":"already file upload","is_login":"0"}
 *               {"code":"3","result":"file not send","is_login":"0"}
 *               {"code":"3","result":"company id is not valid","is_login":"0"}
 *               {"code":"1","result":"company not found","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
async function upload_avatar_check(req, file, cb) {
    try {
        req.uploadDirs = uploadDirs;
        let company = await model.getCompany(req.params.id);
        if (!company) {
            req.validationErrors = {"result": "company not found", "code": "1", "is_login": "0"};
            cb(null, false);
            return;
        }
        if (hasValue(company.avatar_file)) {
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
}

const uploader_avatar = multer({storage: storage, fileFilter: upload_avatar_check});
let uploadFilesAvatar = uploader_avatar.fields([{name: 'avatar', maxCount: 1}]);
router.patch('/avatar/:id',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.COMPANY, ACTIONS.UPDATE),
    checkValidations("company_upload-avatar"),
    uploadFilesAvatar,
    async (req, res) => {
        try {
            if (hasValue(req.validationErrors)) {
                res.json(req.validationErrors);
                return;
            }
            const isUpload = Object.keys(req.files).length;
            if (isUpload === 0) {
                return res.json({"result": "file not send", "code": "2", "is_login": "0"});
            } else {
                let img;
                if (req.files && Object.keys(req.files).length > 0 && !isUndefined(req.files.avatar)) {
                    let filename = req.files.avatar[0].filename;
                    img = `avatars/${filename}`;
                }
                await model.updateAvatar(req.params.id, img);
                return res.json({"result": {"avatar_file": img}, "code": "0", "is_login": "0"});
            }
        } catch (e) {
            if (isDebug)
                res.status(500).json({"result": e.toString()});
            else
                res.status(500).json({"result": "Internal Server Error!"});
        }
    });

/**
 * @swagger
 * /administration/company/avatar/{id}:
 *   delete:
 *     tags:
 *       - company
 *     description: delete Avatar file company
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : id
 *         type : string
 *         in: path
 *         required : true
 *         description : company id
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: |
 *               <pre>
 *               {"code":"403","result":"You don't have permission for this action"}
 *               {"code":"-1","result":"token is empty","is_login":"-1"}
 *               {"code":"-1","result":"token invalid","is_login":"-1"}
 *               {"code":"-1","result":"token expire","is_login":"-1"}
 *               {"code":"-2","result":"account is not verify","is_login":"-2"}
 *               {"code":"-3","result":"account is disabled","is_login":"-3"}
 *               {"code":"0","result":"delete ok","is_login":"0"}
 *               {"code":"2","result":"company id is empty","is_login":"0"}
 *               {"code":"3","result":"company id is not valid","is_login":"0"}
 *               {"code":"1","result":"company not found","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.delete('/avatar/:id',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.COMPANY, ACTIONS.DELETE),
    checkValidations("company_delete-avatar"),
    async (req, res) => {
        try {
            const company = await model.getCompany(req.params.id);
            let path = appDir + 'media/' + company['avatar_file'];
            fs.stat(path, async (err, stats) => {
                if (!err && stats.isFile())
                    fs.unlinkSync(path);
            });
            await model.deleteAvatar(req.params.id);
            res.json({"result": "delete ok!", "code": "0", "is_login": "0"});
        } catch (e) {
            if (isDebug)
                res.status(500).json({"result": e.toString()});
            else
                res.status(500).json({"result": "Internal Server Error!"});
        }

    });


module.exports = router;