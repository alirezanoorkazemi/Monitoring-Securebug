const {hasPermission, isAuthenticate} = require('../../init');
const {catchAsync} = require('../../../libs/error.helper');
const {ADMIN_RESOURCES, ACTIONS} = require('../../../libs/enum.helper');
const {setResponse} = require('../../../libs/message.helper');
const model = require('./hacker.model');
const checkValidations = require('../../validation');
const express = require('express');
const router = express.Router();
const {makeHash} = require('../../../libs/token.helper');
const {getTimeStamp} = require('../../../libs/date.helper');
const {
    hasValue, isUndefined, checkKey, getTypeFile, appDir,
    validExtensionImage, validExtensionFile, validExtensionVideo,
    validExtensionFileImage, random2, fileFilter
} = require('../../../libs/methode.helper');
const multer = require('multer');
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
 * /administration/hacker:
 *   get:
 *     tags:
 *       - administration-hacker
 *     description: get hackers administration
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
 *       - name : username
 *         type : string
 *         in: query
 *         required : false
 *         description : username
 *       - name : status
 *         type : boolean
 *         in: query
 *         required : false
 *         description : status
 *       - name : is_verify
 *         type : boolean
 *         in: query
 *         required : false
 *         description : is_verify [true,false]
 *       - name : identity
 *         type : number
 *         in: query
 *         required : false
 *         description : identity ... [0,1,2]
 *       - name : withdraw
 *         type : string
 *         in: query
 *         required : false
 *         description : withdraw ... [all_withdraw,pending_withdraw,paid_withdraw]
 *       - name : tag
 *         type : number
 *         in: query
 *         required : false
 *         description : tag ... [1,2]
 *       - name : select_term
 *         type : sting
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
 *               {"code":"3","result":"username is not valid","is_login":"0"}
 *               {"code":"3","result":"status is not valid","is_login":"0"}
 *               {"code":"3","result":"is_verify is not valid","is_login":"0"}
 *               {"code":"3","result":"identity is not valid","is_login":"0"}
 *               {"code":"3","result":"withdraw is not valid","is_login":"0"}
 *               {"code":"3","result":"tag is not valid","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.get('/',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.HACKER, ACTIONS.READ),
    checkValidations("hacker_gets"),
    catchAsync(async (req, res) => {
        const user_info = {user_level_access: req.user.user_level_access};
        const data = Object.assign({withdraw: "", user_verify: undefined, select_term: ""}, req.query, user_info);
        return res.json(setResponse(await model.gets(data)));
    }));

/**
 * @swagger
 * /administration/hacker/chart/user-trend:
 *   get:
 *     tags:
 *       - administration-hacker
 *     description: hacker administration
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
router.get('/chart/user-trend',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.HACKER_CHART, ACTIONS.READ),
    catchAsync(async (req, res) => {
        return res.json(setResponse(await model.userTrendChart()));
    }));

/**
 * @swagger
 * /administration/hacker/{id}:
 *   get:
 *     tags:
 *       - administration-hacker
 *     description: get hacker administration
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
 *       - name : report_id
 *         type : string
 *         in: query
 *         required : false
 *         description : report id
 *       - name : hacker_card
 *         type : boolean
 *         in: query
 *         required : false
 *         description : hacker_card
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
 *               {"code":"5","result":"Hacker is not found","is_login":"0"}
 *               {"code":"5","result":"report is not found","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.get('/:id',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.HACKER, ACTIONS.READ),
    checkValidations("hacker_get"),
    catchAsync(async (req, res) => {
        const user_info = {id: req.params.id, user_id: req.user._id, user_level_access: req.user.user_level_access};
        const data = Object.assign({hacker_card:false}, req.query, user_info);
        return res.json(setResponse(await model.get(data)));
    }));

/**
 * @swagger
 * /administration/hacker/{id}/payments:
 *   get:
 *     tags:
 *       - administration-hacker
 *     description: get payments hacker administration
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
 *               {"code":"1","result":"id is empty","is_login":"0"}
 *               {"code":"2","result":"id is not valid","is_login":"0"}
 *               {"code":"3","result":"Hacker is not found","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.get('/:id/payments',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.HACKER, ACTIONS.READ),
    checkValidations("hacker_get-payments"),
    catchAsync(async (req, res) => {
        return res.json(setResponse(await model.getPayments(req.params.id)));
    }));

/**
 * @swagger
 * /administration/hacker/add-coin/{id}:
 *   post:
 *     tags:
 *       - administration-hacker
 *     description: add or subtract hacker administration
 *     --- socket method name : UpdateCoins
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
 *       - name : coin
 *         type : number
 *         in: formData
 *         required : true
 *         description : coins count
 *       - name : text
 *         type : string
 *         in: formData
 *         required : true
 *         description : text
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
 *               {"code":"2","result":"coin is empty","is_login":"0"}
 *               {"code":"3","result":"coin is not valid","is_login":"0"}
 *               {"code":"2","result":"text is empty","is_login":"0"}
 *               {"code":"3","result":"text is not valid","is_login":"0"}
 *               {"code":"1","result":"Hacker is not found","is_login":"0"}
 *               {"code":"20","result":"text is repeated","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/add-coin/:id',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.HACKER, ACTIONS.UPDATE),
    checkValidations("hacker_add-coin"),
    catchAsync(async (req, res) => {
        const data = {id: req.params.id, coin: req.body.coin, text: req.body.text, user_id: req.user._id};
        await model.addCoin(data);
        return res.json(setResponse());
    }));


/**
 * @swagger
 * /administration/hacker/disable-2fa/{id}:
 *   get:
 *     tags:
 *       - administration-hacker
 *     description: disable-2fa hacker administration
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
 *               {"code":"1","result":"id is empty","is_login":"0"}
 *               {"code":"2","result":"id is not valid","is_login":"0"}
 *               {"code":"3","result":"Hacker is not found","is_login":"0"}
 *               {"code":"20","result":"2fa already disabled","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/disable-2fa/:id',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.HACKER, ACTIONS.UPDATE),
    checkValidations("hacker_disable-2fa"),
    catchAsync(async (req, res) => {
        const data = {id: req.params.id, user_id: req.user._id};
        await model.disable2FA(data);
        return res.json(setResponse());
    }));

/**
 * @swagger
 * /administration/hacker/{id}:
 *   put:
 *     tags:
 *       - administration-hacker
 *     description: update hacker administration
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
 *       - name : email
 *         type : string
 *         in: formData
 *         required : false
 *         description : email
 *       - name : username
 *         type : string
 *         in: formData
 *         required : false
 *         description : username
 *       - name : invitation
 *         type : boolean
 *         in: formData
 *         required : false
 *         description : invitation
 *       - name : profile_visibility
 *         type : boolean
 *         in: formData
 *         required : false
 *         description : profile_visibility
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
 *       - name : country_id
 *         type : string
 *         in: formData
 *         required : false
 *         description : country_id
 *       - name : country_id_residence
 *         type : string
 *         in: formData
 *         required : false
 *         description : country_id_residence
 *       - name : incoming_range_id
 *         type : string
 *         in: formData
 *         required : false
 *         description : incoming_range_id
 *       - name : competency_profile
 *         type : number
 *         in: formData
 *         required : false
 *         description : competency_profile ...  [1, 2, 3]
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
 *       - name : postal_code
 *         type : string
 *         in: formData
 *         required : false
 *         description : postal_code
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
 *       - name : payment_default
 *         type : number
 *         in: formData
 *         required : false
 *         description : payment_default ... [0, 1, 2, 3, 4]
 *       - name : payment_bank_transfer_type
 *         type : number
 *         in: formData
 *         required : false
 *         description : payment_bank_transfer_type ... [1, 2]
 *       - name : payment_paypal_email
 *         type : string
 *         in: formData
 *         required : false
 *         description : payment_paypal_email
 *       - name : payment_bank_transfer_account_holder
 *         type : string
 *         in: formData
 *         required : false
 *         description : payment_bank_transfer_account_holder
 *       - name : payment_bank_transfer_bic
 *         type : string
 *         in: formData
 *         required : false
 *         description : payment_bank_transfer_bic
 *       - name : payment_bank_transfer_iban
 *         type : string
 *         in: formData
 *         required : false
 *         description : payment_bank_transfer_iban
 *       - name : payment_usdt_public_key
 *         type : string
 *         in: formData
 *         required : false
 *         description : payment_usdt_public_key
 *       - name : payment_bank_transfer_country_id
 *         type : string
 *         in: formData
 *         required : false
 *         description : payment_bank_transfer_country_id
 *       - name : payment_bank_transfer_country_id_residence
 *         type : string
 *         in: formData
 *         required : false
 *         description : payment_bank_transfer_country_id_residence
 *       - name : payment_bank_transfer_currency_id
 *         type : string
 *         in: formData
 *         required : false
 *         description : payment_bank_transfer_currency_id
 *       - name : review_application
 *         type : boolean
 *         in: formData
 *         required : false
 *         description : review_application
 *       - name : video_recorded_interview
 *         type : boolean
 *         in: formData
 *         required : false
 *         description : video_recorded_interview
 *       - name : technical_interview
 *         type : boolean
 *         in: formData
 *         required : false
 *         description : technical_interview
 *       - name : mobile_address_verification
 *         type : boolean
 *         in: formData
 *         required : false
 *         description : mobile_address_verification
 *       - name : verification_of_two_references
 *         type : boolean
 *         in: formData
 *         required : false
 *         description : verification_of_two_references
 *       - name : contract_agreement
 *         type : boolean
 *         in: formData
 *         required : false
 *         description : contract_agreement
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
 *               {"code":"2","result":"email is empty","is_login":"0"}
 *               {"code":"2","result":"username is empty","is_login":"0"}
 *               {"code":"2","result":"invitation is empty","is_login":"0"}
 *               {"code":"2","result":"tab is empty","is_login":"0"}
 *               {"code":"2","result":"profile_visibility is empty","is_login":"0"}
 *               {"code":"2","result":"country_id is empty","is_login":"0"}
 *               {"code":"2","result":"country_id_residence is empty","is_login":"0"}
 *               {"code":"2","result":"incoming_range_id is empty","is_login":"0"}
 *               {"code":"2","result":"competency_profile is empty","is_login":"0"}
 *               {"code":"3","result":"id is not valid","is_login":"0"}
 *               {"code":"3","result":"first_name is not valid","is_login":"0"}
 *               {"code":"3","result":"last_name is not valid","is_login":"0"}
 *               {"code":"3","result":"email is not valid","is_login":"0"}
 *               {"code":"3","result":"username is not valid","is_login":"0"}
 *               {"code":"3","result":"invitation is not valid","is_login":"0"}
 *               {"code":"3","result":"tab is not valid","is_login":"0"}
 *               {"code":"3","result":"competency_profile is not valid","is_login":"0"}
 *               {"code":"3","result":"github_url is not valid","is_login":"0"}
 *               {"code":"3","result":"linkedin_url is not valid","is_login":"0"}
 *               {"code":"3","result":"twitter_url is not valid","is_login":"0"}
 *               {"code":"3","result":"website_url is not valid","is_login":"0"}
 *               {"code":"3","result":"country_id is not valid","is_login":"0"}
 *               {"code":"3","result":"country_id_residence is not valid","is_login":"0"}
 *               {"code":"3","result":"incoming_range_id is not valid","is_login":"0"}
 *               {"code":"3","result":"competency_profile is not valid","is_login":"0"}
 *               {"code":"3","result":"city is not valid","is_login":"0"}
 *               {"code":"3","result":"region is not valid","is_login":"0"}
 *               {"code":"3","result":"postal_code is not valid","is_login":"0"}
 *               {"code":"3","result":"address1 is not valid","is_login":"0"}
 *               {"code":"3","result":"address2 is not valid","is_login":"0"}
 *               {"code":"3","result":"payment_default is not valid","is_login":"0"}
 *               {"code":"3","result":"payment_bank_transfer_type is not valid","is_login":"0"}
 *               {"code":"3","result":"payment_paypal_email is not valid","is_login":"0"}
 *               {"code":"3","result":"payment_bank_transfer_account_holder is not valid","is_login":"0"}
 *               {"code":"3","result":"payment_bank_transfer_bic is not valid","is_login":"0"}
 *               {"code":"3","result":"payment_bank_transfer_iban is not valid","is_login":"0"}
 *               {"code":"3","result":"payment_usdt_public_key is not valid","is_login":"0"}
 *               {"code":"3","result":"payment_bank_transfer_country_id is not valid","is_login":"0"}
 *               {"code":"3","result":"payment_bank_transfer_country_id_residence is not valid","is_login":"0"}
 *               {"code":"3","result":"payment_bank_transfer_currency_id is not valid","is_login":"0"}
 *               {"code":"1","result":"Hacker is not found","is_login":"0"}
 *               {"code":"16","result":"email is already exists","is_login":"0"}
 *               {"code":"16","result":"username is already exists","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.put('/:id',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.HACKER, ACTIONS.UPDATE),
    checkValidations("hacker_update"),
    catchAsync(async (req, res) => {
        const data = {id: req.params.id, hacker: req.body, user_id: req.user._id};
        return res.json(setResponse(await model.update(data)));
    }));

/**
 * @swagger
 * /administration/hacker/change-identity-status/{id}:
 *   patch:
 *     tags:
 *       - administration-hacker
 *     description: change-identity-status hacker administration
 *     --- socket method name : changePassportIdentityStatus | changeCardIdentityStatus | changeDriverIdentityStatus
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
 *       - name : status
 *         type : number
 *         in: formData
 *         required : true
 *         description : status [0,1,2]
 *       - name : type
 *         type : number
 *         in: formData
 *         required : true
 *         description : 1 = passport, 2 = card , 3 = driver
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
 *               {"code":"2","result":"type is empty","is_login":"0"}
 *               {"code":"3","result":"type is not valid","is_login":"0"}
 *               {"code":"1","result":"Hacker is not found","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.patch('/change-identity-status/:id',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.HACKER, ACTIONS.UPDATE),
    checkValidations("hacker_change-identity-status"),
    catchAsync(async (req, res) => {
        const data = {id: req.params.id, status: req.body.status, type: req.body.type, user_id: req.user._id};
        await model.changeIdentityStatus(data);
        return res.json(setResponse());
    }));

/**
 * @swagger
 * /administration/hacker/change-password/{id}:
 *   post:
 *     tags:
 *       - administration-hacker
 *     description: change-password hacker administration
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
 *               {"code":"1","result":"Hacker is not found","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/change-password/:id',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.HACKER, ACTIONS.UPDATE),
    checkValidations("hacker_change-password"),
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
 * /administration/hacker/change-status/{id}:
 *   patch:
 *     tags:
 *       - administration-hacker
 *     description: change-status hacker administration
 *     ---- socket method name : changeStatus
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
 *               {"code":"1","result":"Hacker is not found","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.patch('/change-status/:id',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.HACKER, ACTIONS.UPDATE),
    checkValidations("hacker_change-status"),
    catchAsync(async (req, res) => {
        const data = {id: req.params.id, status: req.body.status, user_id: req.user._id};
        await model.changeStatus(data);
        return res.json(setResponse());
    }));

/**
 * @swagger
 * /administration/hacker/change-verify/{id}:
 *   patch:
 *     tags:
 *       - administration-hacker
 *     description: change-verify hacker administration
 *     --- socket method name : changeVerification
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
 *               {"code":"1","result":"Hacker is not found","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.patch('/change-verify/:id',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.HACKER, ACTIONS.UPDATE),
    checkValidations("hacker_change-verify"),
    catchAsync(async (req, res) => {
        const data = {id: req.params.id, is_verify: req.body.is_verify, user_id: req.user._id};
        await model.changeVerify(data);
        return res.json(setResponse());
    }));

/**
 * @swagger
 * /administration/hacker/change-account-activity/{id}:
 *   patch:
 *     tags:
 *       - administration-hacker
 *     description: change-account-activity hacker administration
 *     --- socket method name : changeActivity
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
 *               {"code":"1","result":"Hacker is not found","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.patch('/change-account-activity/:id',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.HACKER, ACTIONS.UPDATE),
    checkValidations("hacker_change-account-activity"),
    catchAsync(async (req, res) => {
        const data = {id: req.params.id, account_is_disable: req.body.account_is_disable, user_id: req.user._id};
        await model.changeActivity(data);
        return res.json(setResponse());
    }));

/**
 * @swagger
 * /administration/hacker:
 *   patch:
 *     tags:
 *       - administration-hacker
 *     description:  set hacker ranks
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
 *               {"code":"0","result":"success","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.patch('/',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.HACKER, ACTIONS.UPDATE),
    catchAsync(async (req, res) => {
        return res.json(setResponse(await model.setHackersRank()));
    }));

/**
 * @swagger
 * /administration/hacker/assign-tag/{id}:
 *   patch:
 *     tags:
 *       - administration-hacker
 *     description:  assign hacker tag
 *     --- socket method name : hacker:assign-tag
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
 *       - name : tag
 *         type : number
 *         in: formData
 *         required : true
 *         description : status [0,1]
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
 *               {"code":"2","result":"tag is empty","is_login":"0"}
 *               {"code":"3","result":"tag is not valid","is_login":"0"}
 *               {"code":"1","result":"Hacker is not found","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.patch('/assign-tag/:id',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.HACKER, ACTIONS.UPDATE),
    checkValidations("hacker_assign-tag"),
    catchAsync(async (req, res) => {
        const data = {id: req.params.id, tag: JSON.parse(req.body.tag), user_id: req.user._id};
        await model.assignTag(data);
        return res.json(setResponse());
    }));

/**
 * @swagger
 * /administration/hacker/{id}/payments/{payment_id}:
 *   patch:
 *     tags:
 *       - administration-hacker
 *     description: change-payment-status hacker administration
 *     --- socket method name : PaidWithdraw
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
 *       - name : payment_id
 *         type : string
 *         in: path
 *         required : true
 *         description : payment id
 *       - name : status
 *         type : number
 *         in: formData
 *         required : true
 *         description : status [0,1,2]
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
 *               {"code":"2","result":"payment_id is empty","is_login":"0"}
 *               {"code":"3","result":"payment_id is not valid","is_login":"0"}
 *               {"code":"2","result":"status is empty","is_login":"0"}
 *               {"code":"3","result":"status is not valid","is_login":"0"}
 *               {"code":"1","result":"Hacker is not found","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.patch('/:id/payments/:payment_id',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.HACKER, ACTIONS.UPDATE),
    checkValidations("hacker_change-payment-status"),
    catchAsync(async (req, res) => {
        const data = {
            id: req.params.id,
            payment_id: req.params.payment_id,
            status: req.body.status,
            user_id: req.user._id
        };
        await model.changePaymentStatus(data);
        return res.json(setResponse());
    }));

/**
 * @swagger
 * /administration/hacker/{id}:
 *   delete:
 *     tags:
 *       - administration-hacker
 *     description: delete hacker administration
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
 *               {"code":"1","result":"Hacker is not found","is_login":"0"}
 *               {"code":"20","result":"hacker submitted challenge flag","is_login":"0"}
 *               {"code":"20","result":"hacker has payment","is_login":"0"}
 *               {"code":"20","result":"hacker get paid","is_login":"0"}
 *               {"code":"20","result":"hacker has current invitation","is_login":"0"}
 *               {"code":"20","result":"hacker has report","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.delete('/:id',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.HACKER, ACTIONS.DELETE),
    checkValidations("hacker_delete"),
    catchAsync(async (req, res) => {
        await model.delete(req.params.id, req.user._id);
        return res.json(setResponse());
    }));

/**
 * @swagger
 * /administration/hacker/avatar/{id}:
 *   patch:
 *     tags:
 *       - hacker
 *     description: upload avatar file hacker
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
 *               {"code":"2","result":"hacker id is empty","is_login":"0"}
 *               {"code":"2","result":"already file upload","is_login":"0"}
 *               {"code":"3","result":"file not send","is_login":"0"}
 *               {"code":"3","result":"hacker id is not valid","is_login":"0"}
 *               {"code":"1","result":"hacker not found","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
async function upload_avatar_check(req, file, cb) {
    try {
        req.uploadDirs = uploadDirs;
        let hacker = await model.getHacker(req.params.id);
        if (!hacker) {
            req.validationErrors = {"result": "hacker not found", "code": "1", "is_login": "0"};
            cb(null, false);
            return;
        }
        if (hasValue(hacker.avatar_file)) {
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
    hasPermission(ADMIN_RESOURCES.HACKER, ACTIONS.UPDATE),
    checkValidations("hacker_upload-avatar"),
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
                return res.json({"result": img, "code": "0", "is_login": "0"});
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
 * /administration/hacker/avatar/{id}:
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
 *               {"code":"403","result":"You don't have permission for this action"}
 *               {"code":"-1","result":"token is empty","is_login":"-1"}
 *               {"code":"-1","result":"token invalid","is_login":"-1"}
 *               {"code":"-1","result":"token expire","is_login":"-1"}
 *               {"code":"-2","result":"account is not verify","is_login":"-2"}
 *               {"code":"-3","result":"account is disabled","is_login":"-3"}
 *               {"code":"0","result":"delete ok","is_login":"0"}
 *               {"code":"2","result":"hacker id is empty","is_login":"0"}
 *               {"code":"3","result":"hacker id is not valid","is_login":"0"}
 *               {"code":"1","result":"hacker not found","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.delete('/avatar/:id',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.HACKER, ACTIONS.DELETE),
    checkValidations("hacker_delete-avatar"),
    async (req, res) => {
        try {
            const hacker = await model.getHacker(req.params.id);
            let path = appDir + 'media/' + hacker['avatar_file'];
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