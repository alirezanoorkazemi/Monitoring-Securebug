const {hasPermission, isAuthenticate} = require('../../init');
const {catchAsync} = require('../../../libs/error.helper');
const {makeHash} = require('../../../libs/token.helper');
const {getTimeStamp} = require('../../../libs/date.helper');
const {setPublicResponse, setResponse} = require('../../../libs/message.helper');
const {ADMIN_RESOURCES, ACTIONS, STATIC_VARIABLES} = require('../../../libs/enum.helper');
const {
    hasValue, isUndefined, checkKey, getTypeFile, appDir,
    validExtensionImage, validExtensionFile, validExtensionVideo,
    validExtensionFileImage, random2, fileFilter
} = require('../../../libs/methode.helper');
const model = require('./user.model');
const checkValidations = require('../../validation');
const express = require('express');
const router = express.Router();
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
 * /administration/user/login:
 *   post:
 *     tags:
 *       - administration-user
 *     description: login administration
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
 *               {"code":"0","result":"login success","token":"administration token",{administration data object}}
 *               {"code":"2","result":"email is empty"}
 *               {"code":"3","result":"email is not valid"}
 *               {"code":"2","result":"password is empty"}
 *               {"code":"12","result":"email or password is not correct"}
 *               {"code":"6","result":"email must be equals or less than 100 characters"}
 *               {"code":"6","result":"password must be equals or less than 100 characters"}
 *               {"code":"3","result":"password is not valid"}
 *               {"code":"5","result":"account is disabled"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/login',
    checkValidations("user_login"),
    catchAsync(async (req, res) => {
        const result = await model.login(req.body);
        const userData = await model.getUserData(result.user_info);
        userData.token = result.token;
        userData.refresh_token = result.refresh_token;
        userData.result = "login success!";
        userData.code = STATIC_VARIABLES.ERROR_CODE.SUCCESS;
        return res.json(userData);
    }));

/**
 * @swagger
 * /administration/user/refresh-token:
 *   post:
 *     tags:
 *       - administration-user
 *     description: refresh-token administration
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
router.post('/refresh-token',
    checkValidations("user_refresh-token"),
    catchAsync(async (req, res) => {
        const data = {token: req.headers['x-token'], refresh_token: req.body['x-refresh-token']};
        return res.json(setPublicResponse(await model.refreshToken(data)));
    }));

/**
 * @swagger
 * /administration/user/statistics:
 *   get:
 *     tags:
 *       - administration-user
 *     description: user statistics
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
router.get('/statistics',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.STATISTICS, ACTIONS.READ),
    catchAsync(async (req, res) => {
        const result = await model.statistics(req.user._id, req.user.user_level_access);
        return res.json(setResponse(result));
    }));

/**
 * @swagger
 * /administration/user/predata:
 *   get:
 *     tags:
 *       - administration-user
 *     description: user predata
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
router.get('/predata',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.PREDATA, ACTIONS.READ),
    catchAsync(async (req, res) => {
        return res.json(setResponse(await model.predata()));
    }));

/**
 * @swagger
 * /administration/user:
 *   get:
 *     tags:
 *       - administration-user
 *     description: user list
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
 *       - name : is_dashboard
 *         type : boolean
 *         in: query
 *         required : false
 *         description : is_dashboard
 *       - name : email
 *         type : string
 *         in: query
 *         required : false
 *         description : email
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
 *               {"code":"2","result":"page number is empty","is_login":"0"}
 *               {"code":"2","result":"is_dashboard is empty","is_login":"0"}
 *               {"code":"3","result":"page number is not valid","is_login":"0"}
 *               {"code":"3","result":"is_dashboard is not valid","is_login":"0"}
 *               {"code":"2","result":"limit is empty","is_login":"0"}
 *               {"code":"3","result":"limit is not valid","is_login":"0"}
 *               {"code":"3","result":"email is not valid","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.get('/',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.USER, ACTIONS.READ),
    checkValidations("user_gets"),
    catchAsync(async (req, res) => {
        const data = Object.assign({user_id: req.user._id, is_dashboard: false}, req.query);
        return res.json(setResponse(await model.gets(data)));
    }));

/**
 * @swagger
 * /administration/user/notification:
 *   get:
 *     tags:
 *       - administration-user
 *     description: user notification list
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
 *       - name : is_new
 *         type : boolean
 *         in: query
 *         required : false
 *         description : is_new
 *       - name : only_count
 *         type : boolean
 *         in: query
 *         required : true
 *         description : only_count
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
 *               {"code":"2","result":"page number is empty","is_login":"0"}
 *               {"code":"2","result":"is_new is empty","is_login":"0"}
 *               {"code":"2","result":"only_count is empty","is_login":"0"}
 *               {"code":"3","result":"page number is not valid","is_login":"0"}
 *               {"code":"3","result":"is_new is not valid","is_login":"0"}
 *               {"code":"3","result":"only_count is not valid","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.get('/notification',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.NOTIFICATION, ACTIONS.READ),
    checkValidations("user_get-notifications"),
    catchAsync(async (req, res) => {
        const data = Object.assign({
            user_id: req.user._id,
            user_level_access: req.user.user_level_access,
            is_new: false,
            only_count: false
        }, req.query);
        return res.json(setResponse(await model.getNotifications(data)));
    }));

/**
 * @swagger
 * /administration/user/notification:
 *   patch:
 *     tags:
 *       - administration-user
 *     description: user notification list
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : notification_ids
 *         type : Array
 *         in: body
 *         required : true
 *         description : notification_ids
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
 *               {"code":"2","result":"notification_ids is empty","is_login":"0"}
 *               {"code":"3","result":"notification_ids is not valid","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.patch('/notification',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.NOTIFICATION, ACTIONS.UPDATE),
    checkValidations("user_update-notification-status"),
    catchAsync(async (req, res) => {
        const data = {
            user_id: req.user._id,
            user_level_access: req.user.user_level_access,
            notification_ids: JSON.parse(req.body.notification_ids)
        };
        return res.json(setResponse(await model.updateNotificationsStatus(data)));
    }));

/**
 * @swagger
 * /administration/user/notification:
 *   post:
 *     tags:
 *       - administration-user
 *     description: user notification list
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : type
 *         type : string
 *         in: body
 *         required : true
 *         description : message type
 *       - name : title
 *         type : string
 *         in: body
 *         required : true
 *         description : title
 *       - name : message
 *         type : string
 *         in: body
 *         required : true
 *         description : message
 *       - name : is_company
 *         type : boolean
 *         in: body
 *         required : true
 *         description : is_company
 *       - name : user_ids
 *         type : Array
 *         in: body
 *         required : true
 *         description : user_ids
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
 *               {"code":"2","result":"notification_ids is empty","is_login":"0"}
 *               {"code":"3","result":"notification_ids is not valid","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/notification',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.NOTIFICATION, ACTIONS.CREATE),
    checkValidations("user_create-notification"),
    catchAsync(async (req, res) => {
        const data = Object.assign({
            user_id: req.user._id,
            user_level_access: req.user.user_level_access,
            is_company: false
        }, req.body, {user_ids: JSON.parse(req.body.user_ids)});
        return res.json(setResponse(await model.createNotifications(data)));
    }));

/**
 * @swagger
 * /administration/user:
 *   post:
 *     tags:
 *       - administration-user
 *     description: user administration
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : email
 *         type : string
 *         in: formData
 *         required : true
 *         description : email
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
 *       - name : alias
 *         type : string
 *         in: formData
 *         required : true
 *         description : alias
 *       - name : status
 *         type : boolean
 *         in: formData
 *         required : true
 *         description : status
 *       - name : user_level_access
 *         type : number
 *         in: formData
 *         required : true
 *         description : user_level_access ...[1,2]
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
 *               {"code":"0","result":{obj},"is_login":"0"}
 *               {"code":"2","result":"email is empty","is_login":"0"}
 *               {"code":"3","result":"email is not valid","is_login":"0"}
 *               {"code":"2","result":"first name is empty","is_login":"0"}
 *               {"code":"2","result":"last name is empty","is_login":"0"}
 *               {"code":"2","result":"alias is empty","is_login":"0"}
 *               {"code":"2","result":"user_level_access is empty","is_login":"0"}
 *               {"code":"2","result":"password is empty","is_login":"0"}
 *               {"code":"2","result":"confirm_password is empty","is_login":"0"}
 *               {"code":"3","result":"first name is not valid","is_login":"0"}
 *               {"code":"3","result":"last name is not valid","is_login":"0"}
 *               {"code":"3","result":"alias is not valid","is_login":"0"}
 *               {"code":"3","result":"user_level_access is not valid","is_login":"0"}
 *               {"code":"3","result":"password is not valid","is_login":"0"}
 *               {"code":"3","result":"confirm_password is not valid","is_login":"0"}
 *               {"code":"14","result":"confirm_password is not equal with password","is_login":"0"}
 *               {"code":"16","result":"email is already exists","is_login":"0"}
 *               {"code":"16","result":"alias is already exists","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.USER, ACTIONS.CREATE),
    checkValidations("user_create"),
    catchAsync(async (req, res) => {
        const data = Object.assign({user_id: req.user._id}, req.body);
        return res.json(setResponse(await model.create(data)));
    }));

/**
 * @swagger
 * /administration/user/{id}:
 *   put:
 *     tags:
 *       - administration-user
 *     description: user administration
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
 *         description : user id
 *       - name : email
 *         type : string
 *         in: formData
 *         required : true
 *         description : email
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
 *       - name : alias
 *         type : string
 *         in: formData
 *         required : true
 *         description : alias
 *       - name : status
 *         type : boolean
 *         in: formData
 *         required : true
 *         description : status
 *       - name : user_level_access
 *         type : number
 *         in: formData
 *         required : true
 *         description : user_level_access ...[1,2]
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
 *               {"code":"0","result":{obj},"is_login":"0"}
 *               {"code":"2","result":"id is empty","is_login":"0"}
 *               {"code":"2","result":"email is empty","is_login":"0"}
 *               {"code":"3","result":"email is not valid","is_login":"0"}
 *               {"code":"2","result":"first name is empty","is_login":"0"}
 *               {"code":"2","result":"last name is empty","is_login":"0"}
 *               {"code":"2","result":"alias is empty","is_login":"0"}
 *               {"code":"2","result":"user_level_access is empty","is_login":"0"}
 *               {"code":"3","result":"id is not valid","is_login":"0"}
 *               {"code":"3","result":"first name is not valid","is_login":"0"}
 *               {"code":"3","result":"last name is not valid","is_login":"0"}
 *               {"code":"3","result":"alias is not valid","is_login":"0"}
 *               {"code":"3","result":"password is not valid","is_login":"0"}
 *               {"code":"3","result":"confirm_password is not valid","is_login":"0"}
 *               {"code":"3","result":"user_level_access is not valid","is_login":"0"}
 *               {"code":"1","result":"user is not found","is_login":"0"}
 *               {"code":"16","result":"email is already exists","is_login":"0"}
 *               {"code":"16","result":"alias is already exists","is_login":"0"}
 *               {"code":"14","result":"confirm_password is not equal with password","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.put('/:id',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.USER, ACTIONS.UPDATE),
    checkValidations("user_update"),
    catchAsync(async (req, res) => {
        const data = {id: req.params.id, user: req.body, user_id: req.user._id};
        return res.json(setResponse(await model.update(data)));
    }));

/**
 * @swagger
 * /administration/user/select-list:
 *   get:
 *     tags:
 *       - administration-user
 *     description: select-list user administration
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : program_id
 *         type : string
 *         in: query
 *         required : false
 *         description : program_id
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
 *                 {"code":"3","result":"program_id is not valid","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.get('/select-list',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.USER, ACTIONS.READ),
    checkValidations("user_select-list"),
    catchAsync(async (req, res) => {
        return res.json(setResponse(await model.selectList({program_id: req.query.program_id})));
    }));

/**
 * @swagger
 * /administration/user/avatar:
 *   patch:
 *     tags:
 *       - administration-user
 *     description: upload avatar file user
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
        const user = req.user;
        if (hasValue(user.avatar)) {
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
router.patch('/avatar',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.PROFILE, ACTIONS.UPDATE),
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
                await model.updateAvatar(req.user._id, img);
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
 * /administration/user/avatar:
 *   delete:
 *     tags:
 *       - administration-user
 *     description: delete Avatar file user
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
 *               {"code":"403","result":"You don't have permission for this action"}
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
router.delete('/avatar',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.PROFILE, ACTIONS.DELETE),
    async (req, res) => {
        try {
            const user = req.user;
            let path = appDir + 'media/' + user['avatar'];
            fs.stat(path, async (err, stats) => {
                if (!err && stats.isFile())
                    fs.unlinkSync(path);
            });
            await model.deleteAvatar(user._id);
            res.json({"result": "delete ok!", "code": "0", "is_login": "0"});
        } catch (e) {
            if (isDebug)
                res.status(500).json({"result": e.toString()});
            else
                res.status(500).json({"result": "Internal Server Error!"});
        }

    });

/**
 * @swagger
 * /administration/user/profile:
 *   post:
 *     tags:
 *       - administration-user
 *     description: user profile administration
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : first_name
 *         type : string
 *         in: formData
 *         required : true
 *         description : first_name
 *       - name : last_name
 *         type : string
 *         in: formData
 *         required : true
 *         description : last name
 *       - name : alias
 *         type : string
 *         in: formData
 *         required : true
 *         description : alias
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
 *               {"code":"0","result":{obj},"is_login":"0"}
 *               {"code":"2","result":"first name is empty","is_login":"0"}
 *               {"code":"2","result":"last name is empty","is_login":"0"}
 *               {"code":"2","result":"alias is empty","is_login":"0"}
 *               {"code":"2","result":"password is empty","is_login":"0"}
 *               {"code":"2","result":"confirm_password is empty","is_login":"0"}
 *               {"code":"3","result":"first name is not valid","is_login":"0"}
 *               {"code":"3","result":"last name is not valid","is_login":"0"}
 *               {"code":"3","result":"alias is not valid","is_login":"0"}
 *               {"code":"3","result":"password is not valid","is_login":"0"}
 *               {"code":"3","result":"confirm_password is not valid","is_login":"0"}
 *               {"code":"14","result":"confirm_password is not equal with password","is_login":"0"}
 *               {"code":"16","result":"alias is already exists","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/profile',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.PROFILE, ACTIONS.UPDATE),
    checkValidations("user_profile"),
    catchAsync(async (req, res) => {
        const data = Object.assign({user_id: req.user._id}, req.body);
        return res.json(setResponse(await model.updateProfile(data)));
    }));

/**
 * @swagger
 * /administration/user/{id}:
 *   delete:
 *     tags:
 *       - administration-user
 *     description: user administration
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
 *         description : user id
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
 *               {"code":"2","result":"id is empty","is_login":"0"}
 *               {"code":"3","result":"id is not valid","is_login":"0"}
 *               {"code":"1","result":"user not found","is_login":"0"}
 *               {"code":"20","result":"user used in program","is_login":"0"}
 *               {"code":"20","result":"user used in comment","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.delete('/:id',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.USER, ACTIONS.DELETE),
    checkValidations("user_delete"),
    catchAsync(async (req, res) => {
        return res.json(setResponse(await model.delete(req.params.id, req.user._id)));
    }));

module.exports = router;