const express = require('express');
const {hasPermission, isAuthenticate} = require('../../../init');
const {catchAsync} = require('../../../../libs/error.helper');
const model = require('./currency.model');
const router = express.Router();
const checkValidations = require('../../../validation');
const {setResponse} = require('../../../../libs/message.helper');
const {ADMIN_RESOURCES, ACTIONS} = require('../../../../libs/enum.helper');

/**
 * @swagger
 * /administration/currency:
 *   get:
 *     tags:
 *       - administration-currency
 *     description: currency administration
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
 *       - name : title
 *         type : string
 *         in: query
 *         required : false
 *         description : title
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
 *               {"code":"3","result":"title is not valid","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.get('/',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.CURRENCY, ACTIONS.READ),
    checkValidations("currency_gets"),
    catchAsync(async (req, res) => {
        return res.json(setResponse(await model.gets(req.query)));
    }));

/**
 * @swagger
 * /administration/currency:
 *   post:
 *     tags:
 *       - administration-currency
 *     description: currency administration
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : title
 *         type : string
 *         in: formData
 *         required : true
 *         description : title
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
 *               {"code":"0","result":{obj},"is_login":"0"}
 *               {"code":"2","result":"title is empty","is_login":"0"}
 *               {"code":"3","result":"title is not valid","is_login":"0"}
 *               {"code":"16","result":"title is already exists","is_login":"0"}
 *               {"code":"2","result":"status is empty","is_login":"0"}
 *               {"code":"3","result":"status is not valid","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.CURRENCY, ACTIONS.CREATE),
    checkValidations("currency_create"),
    catchAsync(async (req, res) => {
        return res.json(setResponse(await model.create(req.body)));
    }));

/**
 * @swagger
 * /administration/currency/{id}:
 *   put:
 *     tags:
 *       - administration-currency
 *     description: currency administration
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
 *         description : currency id
 *       - name : title
 *         type : string
 *         in: formData
 *         required : true
 *         description : title
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
 *               {"code":"0","result":{obj},"is_login":"0"}
 *               {"code":"2","result":"id is empty","is_login":"0"}
 *               {"code":"2","result":"title is empty","is_login":"0"}
 *               {"code":"3","result":"title is not valid","is_login":"0"}
 *               {"code":"16","result":"title is already exists","is_login":"0"}
 *               {"code":"3","result":"id is not valid","is_login":"0"}
 *               {"code":"2","result":"status is empty","is_login":"0"}
 *               {"code":"3","result":"status is not valid","is_login":"0"}
 *               {"code":"1","result":"currency not found","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.put('/:id',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.CURRENCY, ACTIONS.UPDATE),
    checkValidations("currency_update"),
    catchAsync(async (req, res) => {
        const data = {id: req.params.id, currency: req.body};
        return res.json(setResponse(await model.update(data)));
    }));

/**
 * @swagger
 * /administration/currency/{id}:
 *   delete:
 *     tags:
 *       - administration-currency
 *     description: currency administration
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
 *         description : currency id
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
 *               {"code":"1","result":"currency not found","is_login":"0"}
 *               {"code":"20","result":"currency used in hacker","is_login":"0"}
 *               {"code":"20","result":"currency used in company","is_login":"0"}
 *               {"code":"20","result":"currency used in program","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.delete('/:id',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.CURRENCY, ACTIONS.DELETE),
    checkValidations("currency_delete"),
    catchAsync(async (req, res) => {
        return res.json(setResponse(await model.delete(req.params.id)));
    }));

/**
 * @swagger
 * /administration/currency/select-list:
 *   get:
 *     tags:
 *       - administration-currency
 *     description: select-list currency administration
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
router.get('/select-list',
    isAuthenticate,
    catchAsync(async (req, res) => {
        return res.json(setResponse(await model.selectList()));
    }));

module.exports = router;