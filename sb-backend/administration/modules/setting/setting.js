const express = require('express');
const {hasPermission, isAuthenticate} = require('../../init');
const {catchAsync} = require('../../../libs/error.helper');
const model = require('./setting.model');
const router = express.Router();
const checkValidations = require('../../validation');
const {setResponse} = require('../../../libs/message.helper');
const {ADMIN_RESOURCES, ACTIONS} = require('../../../libs/enum.helper');

/**
 * @swagger
 * /administration/setting:
 *   get:
 *     tags:
 *       - administration-setting
 *     description: setting administration
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
router.get('/',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.SETTING, ACTIONS.READ),
    catchAsync(async (req, res) => {
        return res.json(setResponse(await model.gets()));
    }));

/**
 * @swagger
 * /administration/setting:
 *   post:
 *     tags:
 *       - administration-setting
 *     description: setting administration
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : tab
 *         type : number
 *         in: formData
 *         required : true
 *         description : tab ...[0]
 *       - name : reciever_email
 *         type : string
 *         in: formData
 *         required : false
 *         description : reciever_email
 *       - name : reciever_sales_email
 *         type : string
 *         in: formData
 *         required : false
 *         description : reciever_sales_email
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
 *               {"code":"2","result":"tab number is empty","is_login":"0"}
 *               {"code":"3","result":"tab number is not valid","is_login":"0"}
 *               {"code":"2","result":"reciever_email is empty","is_login":"0"}
 *               {"code":"3","result":"reciever_email is not valid","is_login":"0"}
 *               {"code":"2","result":"reciever_sales_email is empty","is_login":"0"}
 *               {"code":"3","result":"reciever_sales_email is not valid","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.SETTING, ACTIONS.UPDATE),
    checkValidations("setting_update"),
    catchAsync(async (req, res) => {
        return res.json(setResponse(await model.update(req.body)));
    }));

/**
 * @swagger
 * /administration/setting/clear-catch:
 *   post:
 *     tags:
 *       - administration-setting
 *     description: setting administration
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
router.post('/clear-catch',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.SETTING, ACTIONS.UPDATE),
    catchAsync(async (req, res) => {
        return res.json(setResponse(await model.clearPredataCatch()));
    }));

module.exports = router;