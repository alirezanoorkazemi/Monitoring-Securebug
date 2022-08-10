const express = require('express');
const {hasPermission, isAuthenticate} = require('../../init');
const {catchAsync} = require('../../../libs/error.helper');
const {
    safeString, isUndefined, checkKey, getTypeFile, appDir,
    validExtensionImage, validExtensionFile, validExtensionVideo,
    validExtensionFileImage, random2, fileFilter
} = require('../../../libs/methode.helper');
const model = require('./report.model');
const router = express.Router();
const multer = require('multer');
const checkValidations = require('../../validation');
const {setResponse} = require('../../../libs/message.helper');
const {makeHash} = require('../../../libs/token.helper');
const {getTimeStamp} = require('../../../libs/date.helper');
const {ADMIN_RESOURCES, ACTIONS, REPORT_NOTIFICATION_TYPE} = require('../../../libs/enum.helper');
let cmdSubmit1 = {"dir": "hacker/report_files", "field": "file1", "type": "file_image"};
let cmdSubmit2 = {"dir": "hacker/report_files", "field": "file2", "type": "file_image"};
let cmdSubmit3 = {"dir": "hacker/report_files", "field": "file3", "type": "file_image"};
let uploadDirs = [
    cmdSubmit1, cmdSubmit2, cmdSubmit3
];
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

/**
 * @swagger
 * /administration/report:
 *   get:
 *     tags:
 *       - administration-report
 *     description: report administration
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
 *       - name : order
 *         type : string
 *         in: query
 *         required : false
 *         description : order [date,title,last_modified]
 *       - name : limit
 *         type : number
 *         in: query
 *         required : true
 *         description : limit ... [10,25,50,100]
 *       - name : severity
 *         type : number
 *         in: query
 *         required : false
 *         description : severity ... [0,1,2,3,4]
 *       - name : status
 *         type : number
 *         in: query
 *         required : false
 *         description : status ... [1,2,3,4,5,6,7,8]
 *       - name : report_activity
 *         type : number
 *         in: query
 *         required : false
 *         description : report_activity ... [0,1]
 *       - name : is_next_generation
 *         type : number
 *         in: query
 *         required : false
 *         description : program bounty type  ... [0,1,2,3]
 *       - name : report_id
 *         type : string
 *         in: query
 *         required : false
 *         description : report_id
 *       - name : program_id
 *         type : string
 *         in: query
 *         required : false
 *         description : program_id
 *       - name : vulnerability_type_id
 *         type : string
 *         in: query
 *         required : false
 *         description : vulnerability_type_id
 *       - name : program_name
 *         type : string
 *         in: query
 *         required : false
 *         description : program_name
 *       - name : from_date
 *         type : string
 *         in: query
 *         required : false
 *         description : from_date
 *       - name : to_date
 *         type : string
 *         in: query
 *         required : false
 *         description : to_date
 *       - name : hacker_username
 *         type : string
 *         in: query
 *         required : false
 *         description : hacker_username
 *       - name : has_pay
 *         type : boolean
 *         in: query
 *         required : false
 *         description : has_pay [true,false]
 *       - name : comments
 *         type : boolean
 *         in: query
 *         required : false
 *         description : comments [true , false]
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
 *               {"code":"3","result":"severity is not valid","is_login":"0"}
 *               {"code":"3","result":"status is not valid","is_login":"0"}
 *               {"code":"3","result":"report_activity is not valid","is_login":"0"}
 *               {"code":"3","result":"program_bounty_type is not valid","is_login":"0"}
 *               {"code":"3","result":"report_id is not valid","is_login":"0"}
 *               {"code":"3","result":"program_id is not valid","is_login":"0"}
 *               {"code":"3","result":"program_name is not valid","is_login":"0"}
 *               {"code":"3","result":"hacker_username is not valid","is_login":"0"}
 *               {"code":"3","result":"order is not valid","is_login":"0"}
 *               {"code":"3","result":"vulnerability_type_id is not valid","is_login":"0"}
 *               {"code":"3","result":"user is not valid","is_login":"0"}
 *               {"code":"3","result":"from_date is not valid","is_login":"0"}
 *               {"code":"3","result":"to_date is not valid","is_login":"0"}
 *               {"code":"3","result":"has_pay is not valid","is_login":"0"}
 *               {"code":"3","result":"comments is not valid","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.get('/',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.REPORT, ACTIONS.READ),
    checkValidations("report_gets"),
    catchAsync(async (req, res) => {
        const user_info = {user_id: req.user._id, user_level_access: req.user.user_level_access};
        const data = Object.assign({
            report_activity: "",
            has_pay: null,
            comments: null,
            report_fields: null,
            from_date: null,
            to_date: null
        }, req.query, user_info);
        return res.json(setResponse(await model.gets(data)));
    }));

/**
 * @swagger
 * /administration/report/prepare-update:
 *   get:
 *     tags:
 *       - administration-report
 *     description: prepare-update report administration
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
router.get('/prepare-update',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.REPORT, ACTIONS.READ),
    catchAsync(async (req, res) => {
        return res.json(setResponse(await model.prepareUpdate()));
    }));


/**
 * @swagger
 * /administration/report/{id}:
 *   get:
 *     tags:
 *       - administration-report
 *     description: get report administration
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
 *               {"code":"5","result":"report is not found","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.get('/:id',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.REPORT, ACTIONS.READ),
    checkValidations("report_get"),
    catchAsync(async (req, res) => {
        const user_info = {user_id: req.user._id, user_level_access: req.user.user_level_access};
        const data = Object.assign({}, req.params, user_info);
        return res.json(setResponse(await model.get(data)));
    }));

/**
 * @swagger
 * /administration/report/{id}:
 *   put:
 *     tags:
 *       - administration-report
 *     description: update report administration
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
 *         description : report id
 *       - name : title
 *         type : string
 *         in: formData
 *         required : true
 *         description : title
 *       - name : proof_url
 *         type : string
 *         in: formData
 *         required : true
 *         description : proof_url
 *       - name : proof_concept
 *         type : string
 *         in: formData
 *         required : true
 *         description : proof_concept
 *       - name : proof_recommendation
 *         type : string
 *         in: formData
 *         required : false
 *         description : proof_recommendation
 *       - name : vulnerability_type
 *         type : string
 *         in: formData
 *         required : true
 *         description : vulnerability_type
 *       - name : security_impact
 *         type : string
 *         in: formData
 *         required : false
 *         description : security_impact
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
 *               {"code":"2","result":"title is empty","is_login":"0"}
 *               {"code":"2","result":"proof_concept is empty","is_login":"0"}
 *               {"code":"2","result":"proof_url is empty","is_login":"0"}
 *               {"code":"2","result":"vulnerability_type is empty","is_login":"0"}
 *               {"code":"3","result":"title is not valid","is_login":"0"}
 *               {"code":"3","result":"proof_concept is not valid","is_login":"0"}
 *               {"code":"3","result":"proof_url is not valid","is_login":"0"}
 *               {"code":"3","result":"proof_recommendation is not valid","is_login":"0"}
 *               {"code":"3","result":"vulnerability_type is not valid","is_login":"0"}
 *               {"code":"3","result":"security_impact is not valid","is_login":"0"}
 *               {"code":"1","result":"report is not found","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.put('/:id',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.REPORT, ACTIONS.UPDATE),
    checkValidations("report_update"),
    catchAsync(async (req, res) => {
        const user_info = {user_id: req.user._id, user_level_access: req.user.user_level_access};
        const data = Object.assign({}, req.body, req.params, user_info);
        return res.json(setResponse(await model.update(data)));
    }));

/**
 * @swagger
 * /administration/report/{id}:
 *   delete:
 *     tags:
 *       - administration-report
 *     description: delete report administration
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
 *               {"code":"1","result":"report is not found","is_login":"0"}
 *               {"code":"20","result":"report is close","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.delete('/:id',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.REPORT, ACTIONS.DELETE),
    checkValidations("report_delete"),
    catchAsync(async (req, res) => {
        await model.delete(req.params.id, req.user._id);
        return res.json(setResponse());
    }));

/**
 * @swagger
 * /administration/report/change-status/{id}:
 *   patch:
 *     tags:
 *       - administration-report
 *     description: change-status report administration
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
 *         description : report id
 *       - name : status
 *         type : number
 *         in: formData
 *         required : true
 *         description : status [1, 2, 3, 4, 5, 6, 7, 8]
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
 *               {"code":"1","result":"report is not found","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.patch('/change-status/:id',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.REPORT_DETAILS, ACTIONS.UPDATE),
    checkValidations("report_change-status"),
    catchAsync(async (req, res) => {
        const user_info = {user_id: req.user._id, user_level_access: req.user.user_level_access};
        const data = Object.assign({}, req.body, req.params, user_info);
        await model.changeStatus(data);
        return res.json(setResponse());
    }));

/**
 * @swagger
 * /administration/report/change-severity/{id}:
 *   patch:
 *     tags:
 *       - administration-report
 *     description: change-severity report administration
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
 *         description : report id
 *       - name : severity
 *         type : number
 *         in: formData
 *         required : true
 *         description : severity [0, 1, 2, 3, 4]
 *       - name : score
 *         type : any
 *         in: formData
 *         required : true
 *         description : score
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
 *               {"code":"2","result":"severity is empty","is_login":"0"}
 *               {"code":"2","result":"score is empty","is_login":"0"}
 *               {"code":"3","result":"severity is not valid","is_login":"0"}
 *               {"code":"3","result":"score is not valid","is_login":"0"}
 *               {"code":"1","result":"report is not found","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.patch('/change-severity/:id',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.REPORT_DETAILS, ACTIONS.UPDATE),
    checkValidations("report_change-severity"),
    catchAsync(async (req, res) => {
        const user_info = {user_id: req.user._id, user_level_access: req.user.user_level_access};
        const data = Object.assign({}, req.body, req.params, user_info);
        await model.changeSeverity(data);
        return res.json(setResponse());
    }));

/**
 * @swagger
 * /administration/report/change-activity/{id}:
 *   patch:
 *     tags:
 *       - administration-report
 *     description: change-activity report administration
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
 *         description : report id
 *       - name : is_close
 *         type : number
 *         in: formData
 *         required : true
 *         description : is_close
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
 *               {"code":"2","result":"is_close is empty","is_login":"0"}
 *               {"code":"3","result":"is_close is not valid","is_login":"0"}
 *               {"code":"1","result":"report is not found","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.patch('/change-activity/:id',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.REPORT_DETAILS, ACTIONS.UPDATE),
    checkValidations("report_change-activity"),
    catchAsync(async (req, res) => {
        const user_info = {user_id: req.user._id, user_level_access: req.user.user_level_access};
        const data = Object.assign({}, req.body, req.params, user_info);
        await model.changeActivity(data);
        return res.json(setResponse());
    }));

/**
 * @swagger
 * /administration/report/pay-price/{id}:
 *   post:
 *     tags:
 *       - administration-report
 *     description: pay-price report administration
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
 *         description : report id
 *       - name : pay_price
 *         type : number
 *         in: formData
 *         required : true
 *         description : pay_price
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
 *               {"code":"2","result":"pay_price is empty","is_login":"0"}
 *               {"code":"3","result":"pay_price is not valid","is_login":"0"}
 *               {"code":"1","result":"report is not found","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/pay-price/:id',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.REPORT, ACTIONS.UPDATE),
    checkValidations("report_pay-price"),
    catchAsync(async (req, res) => {
        const user_info = {user_id: req.user._id, user_level_access: req.user.user_level_access};
        const data = Object.assign({}, req.body, req.params, user_info);
        await model.payPrice(data);
        return res.json(setResponse());
    }));

/**
 * @swagger
 * /administration/report/reference-id/{id}:
 *   post:
 *     tags:
 *       - administration-report
 *     description: pay-price report administration
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
 *         description : report id
 *       - name : reference_id
 *         type : string
 *         in: formData
 *         required : false
 *         description : reference_id
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
 *               {"code":"2","result":"pay_price is empty","is_login":"0"}
 *               {"code":"3","result":"pay_price is not valid","is_login":"0"}
 *               {"code":"1","result":"report is not found","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/reference-id/:id',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.REPORT, ACTIONS.UPDATE),
    checkValidations("report_reference-id"),
    catchAsync(async (req, res) => {
        const user_info = {user_id: req.user._id, user_level_access: req.user.user_level_access};
        const data = Object.assign({}, req.body, req.params, user_info);
        return res.json(setResponse(await model.setReferenceId(data)));
    }));

/**
 * @swagger
 * /administration/report/{id}/comments:
 *   get:
 *     tags:
 *       - administration-report
 *     description: comment report administration
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
 *       - name : id
 *         type : string
 *         in: path
 *         required : true
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
 *               {"code":"0","result":{obj},"is_login":"0"}
 *               {"code":"2","result":"page number is empty","is_login":"0"}
 *               {"code":"3","result":"page number is not valid","is_login":"0"}
 *               {"code":"2","result":"limit is empty","is_login":"0"}
 *               {"code":"2","result":"id is empty","is_login":"0"}
 *               {"code":"3","result":"limit is not valid","is_login":"0"}
 *               {"code":"3","result":"id is not valid","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.get('/:id/comments',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.COMMENT, ACTIONS.READ),
    checkValidations("report_get-comments"),
    catchAsync(async (req, res) => {
        const user_info = {user_id: req.user._id, user_level_access: req.user.user_level_access};
        const data = Object.assign({}, req.query, req.params, user_info);
        return res.json(setResponse(await model.getComments(data)));
    }));

/**
 * @swagger
 * /administration/report/{id}/comments/{comment_id}:
 *   delete:
 *     tags:
 *       - administration-report
 *     description: delete report comment administration
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
 *         description : report id
 *       - name : comment_id
 *         type : string
 *         in: path
 *         required : true
 *         description : comment-id
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
 *               {"code":"2","result":"comment_id is empty","is_login":"0"}
 *               {"code":"3","result":"id is not valid","is_login":"0"}
 *               {"code":"3","result":"comment_id is not valid","is_login":"0"}
 *               {"code":"1","result":"report is not found","is_login":"0"}
 *               {"code":"1","result":"comment is not found","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.delete('/:id/comments/:comment_id',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.COMMENT, ACTIONS.DELETE),
    checkValidations("report_delete-comment"),
    catchAsync(async (req, res) => {
        const user_info = {user_id: req.user._id, user_level_access: req.user.user_level_access};
        const data = Object.assign({comment_id: ""}, req.params, user_info);
        await model.deleteComment(data);
        return res.json(setResponse());
    }));

/**
 * @swagger
 * /administration/report/{id}/comments:
 *   post:
 *     tags:
 *       - administration-report
 *     description: add comment for report
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : id
 *         type : string
 *         in: path
 *         description : report_id
 *         required : true
 *       - name : comment
 *         type : string
 *         in: formData
 *         description : comment
 *         required : true
 *       - name : is_internal
 *         type : boolean
 *         in: formData
 *         description : is_internal
 *         required : true
 *       - name : file1
 *         type : file
 *         in: formData
 *       - name : file2
 *         type : file
 *         in: formData
 *       - name : file3
 *         type : file
 *         in: formData
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
 *               {"code":"0","result":"success","data":{},"is_login":"0","report_files":[]}
 *               {"code":"1","result":"company has not been approved","is_login":"0"}
 *               {"code":"2,"result":"report not found","is_login":"0"}
 *               {"code":"3","result":"report closed by admin","is_login":"0"}
 *               {"code":"4","result":"program not found","is_login":"0"}
 *               {"code":"5","result":"program is not verify","is_login":"0"}
 *               {"code":"6","result":"comment is empty","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
async function upload_comment_check(req, file, cb) {
    try {
        req.uploadDirs = uploadDirs;
        let comment = safeString(req.body.comment);
        if (comment === "" || comment === "undefined") {
            req.validationErrors = {"result": "comment is empty", "code": "6", "is_login": "0"};
            cb(null, false);
            return;
        }
        let report_id = safeString(req.params.id);
        const result = await model.checkForSubmitComment(report_id);
        if (result !== 0) {
            if (result === 2) {
                req.validationErrors = {"result": "report not found!", "code": "2", "is_login": "0"};
            } else if (result === 3) {
                req.validationErrors = {"result": "report closed by admin!", "code": "3", "is_login": "0"};
            } else if (result === 4) {
                req.validationErrors = {"result": "program not found!", "code": "4", "is_login": "0"};
            } else if (result === 5) {
                req.validationErrors = {"result": "program is not verify!", "code": "5", "is_login": "0"};
            }
            cb(null, false);
            return;
        }
        fileFilter(req, file, cb);
    } catch (e) {
        if (isDebug)
            req.validationErrors = {"result": e.toString()};
        else
            req.validationErrors = {"result": "Internal Server Error!"};
        cb(null, false);
    }
}

const uploader_comment = multer({storage: storage, fileFilter: upload_comment_check});
let uploadFilesCmd = uploader_comment.fields([{name: 'file1', maxCount: 1}
    , {name: 'file2', maxCount: 1}, {name: 'file3', maxCount: 1}]);
router.post(
    '/:id/comments',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.COMMENT, ACTIONS.CREATE),
    checkValidations("report_add-comment"),
    uploadFilesCmd,
    catchAsync(async (req, res) => {
        let report_id = safeString(req.params.id);
        let comment = safeString(req.body.comment);
        let is_internal = safeString(req.body.is_internal);
        is_internal = !(is_internal !== "true");
        if (comment === "") {
            req.validationErrors = {"result": "comment is empty", "code": "6", "is_login": "0"};
        }

        const result = await model.checkForSubmitComment(report_id);
        if (result !== 0) {
            if (result === 2) {
                req.validationErrors = {"result": "report not found!", "code": "2", "is_login": "0"};
            } else if (result === 3) {
                req.validationErrors = {"result": "report closed by admin!", "code": "3", "is_login": "0"};
            } else if (result === 4) {
                req.validationErrors = {"result": "program not found!", "code": "4", "is_login": "0"};
            } else if (result === 5) {
                req.validationErrors = {"result": "program is not verify!", "code": "5", "is_login": "0"};
            }
        }
        if (!isUndefined(req.validationErrors)) {
            res.json(req.validationErrors);
            return;
        }
        let file1 = '';
        let file2 = '';
        let file3 = '';
        let file1_original_name = '';
        let filename1 = "";
        if (req.files && Object.keys(req.files).length > 0 && !isUndefined(req.files.file1)) {
            filename1 = req.files.file1[0].filename;
            file1 = `hacker/report_files/${filename1}`;
            file1_original_name = safeString(req.files.file1[0].originalname);
        }
        let file2_original_name = '';
        let filename2 = "";
        if (req.files && Object.keys(req.files).length > 0 && !isUndefined(req.files.file2)) {
            filename2 = req.files.file2[0].filename;
            file2 = `hacker/report_files/${filename2}`;
            file2_original_name = safeString(req.files.file2[0].originalname);
        }
        let file3_original_name = '';
        let filename3 = "";
        if (req.files && Object.keys(req.files).length > 0 && !isUndefined(req.files.file3)) {
            filename3 = req.files.file3[0].filename;
            file3 = `hacker/report_files/${filename3}`;
            file3_original_name = safeString(req.files.file3[0].originalname);
        }
        let resultSave = await model.addCmdReport(req.user._id, req.user.user_level_access, report_id
            , file1, file1_original_name, file2, file2_original_name
            , file3, file3_original_name
            , comment, is_internal);
        res.json({
            "result": resultSave
            , "code": "0", "is_login": "0"
        });


    }));

module.exports = router;