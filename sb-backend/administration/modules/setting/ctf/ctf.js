const express = require('express');
const {hasPermission, isAuthenticate} = require('../../../init');
const {catchAsync} = require('../../../../libs/error.helper');
const model = require('./ctf.model');
const router = express.Router();
const checkValidations = require('../../../validation');
const {setResponse} = require('../../../../libs/message.helper');
const {ADMIN_RESOURCES, ACTIONS} = require('../../../../libs/enum.helper');

/**
 * @swagger
 * /administration/ctf:
 *   get:
 *     tags:
 *       - administration-ctf
 *     description: ctf administration
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
    hasPermission(ADMIN_RESOURCES.CTF, ACTIONS.READ),
    checkValidations("ctf_gets"),
    catchAsync(async (req, res) => {
        return res.json(setResponse(await model.gets(req.query)));
    }));

/**
 * @swagger
 * /administration/ctf/{id}/challenges:
 *   get:
 *     tags:
 *       - administration-ctf
 *     description: get ctf challenges administration
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
 *         description : ctf id
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
 *               {"code":"1","result":"ctf is not found","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.get('/:id/challenges',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.CTF, ACTIONS.READ),
    checkValidations("ctf_get-challenges"),
    catchAsync(async (req, res) => {
        return res.json(setResponse(await model.getChallenges(req.params.id)));
    }));

/**
 * @swagger
 * /administration/ctf/{id}/statistic:
 *   get:
 *     tags:
 *       - administration-ctf
 *     description: get ctf statistic administration
 *     parameters:
 *       - name : token
 *         type : string
 *         in: query
 *         required : true
 *         description : token
 *       - name : id
 *         type : string
 *         in: path
 *         required : true
 *         description : ctf id
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
 *               {"code":"1","result":"ctf is not found","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.get('/:id/statistic',
    checkValidations("ctf_get-statistic"),
    catchAsync(async (req, res) => {
        const data = {ctf_id: req.params.id, token: req.query.token};
        return res.json(await model.statistic(data));
    }));

/**
 * @swagger
 * /administration/ctf:
 *   post:
 *     tags:
 *       - administration-ctf
 *     description: ctf administration
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
 *         description : status ... [true,false]
 *       - name : start_date_time
 *         type : string
 *         in: formData
 *         required : true
 *         description : start_date_time
 *       - name : end_date_time
 *         type : string
 *         in: formData
 *         required : true
 *         description : end_date_time
 *       - name : initial_point
 *         type : number
 *         in: formData
 *         required : false
 *         description : initial_point
 *       - name : minimum_point
 *         type : number
 *         in: formData
 *         required : false
 *         description : minimum_point
 *       - name : decay
 *         type : number
 *         in: formData
 *         required : false
 *         description : decay
 *       - name : coins
 *         type : number
 *         in: formData
 *         required : false
 *         description : coins
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
 *               {"code":"2","result":"status is empty","is_login":"0"}
 *               {"code":"2","result":"start_date_time is empty","is_login":"0"}
 *               {"code":"2","result":"end_date_time is empty","is_login":"0"}
 *               {"code":"3","result":"status is not valid","is_login":"0"}
 *               {"code":"3","result":"start_date_time is not valid","is_login":"0"}
 *               {"code":"3","result":"end_date_time is not valid","is_login":"0"}
 *               {"code":"3","result":"minimum_point is not valid","is_login":"0"}
 *               {"code":"3","result":"decay is not valid","is_login":"0"}
 *               {"code":"3","result":"coins is not valid","is_login":"0"}
 *               {"code":"3","result":"initial_point is not valid","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.CTF, ACTIONS.CREATE),
    checkValidations("ctf_create"),
    catchAsync(async (req, res) => {
        return res.json(setResponse(await model.create(req.body)));
    }));

/**
 * @swagger
 * /administration/ctf/{id}/challenges:
 *   post:
 *     tags:
 *       - administration-ctf
 *     description: add ctf challenges administration
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
 *         description : ctf id
 *       - name : name
 *         type : string
 *         in: formData
 *         required : true
 *         description : name
 *       - name : category_id
 *         type : number
 *         in: formData
 *         required : true
 *         description : category_id
 *       - name : level_id
 *         type : number
 *         in: formData
 *         required : true
 *         description : level_id
 *       - name : point
 *         type : number
 *         in: formData
 *         required : true
 *         description : point
 *       - name : coin
 *         type : number
 *         in: formData
 *         required : true
 *         description : coin
 *       - name : flag
 *         type : string
 *         in: formData
 *         required : true
 *         description : flag
 *       - name : link
 *         type : string
 *         in: formData
 *         required : true
 *         description : link
 *       - name : description
 *         type : string
 *         in: formData
 *         required : true
 *         description : description
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
 *               {"code":"2","result":"name is empty","is_login":"0"}
 *               {"code":"2","result":"category_id is empty","is_login":"0"}
 *               {"code":"2","result":"level_id is empty","is_login":"0"}
 *               {"code":"2","result":"point is empty","is_login":"0"}
 *               {"code":"2","result":"coin is empty","is_login":"0"}
 *               {"code":"2","result":"flag is empty","is_login":"0"}
 *               {"code":"2","result":"link is empty","is_login":"0"}
 *               {"code":"3","result":"id is not valid","is_login":"0"}
 *               {"code":"3","result":"name is not valid","is_login":"0"}
 *               {"code":"3","result":"category_id is not valid","is_login":"0"}
 *               {"code":"3","result":"level_id is not valid","is_login":"0"}
 *               {"code":"3","result":"point is not valid","is_login":"0"}
 *               {"code":"3","result":"coin is not valid","is_login":"0"}
 *               {"code":"3","result":"flag is not valid","is_login":"0"}
 *               {"code":"3","result":"link is not valid","is_login":"0"}
 *               {"code":"3","result":"description is not valid","is_login":"0"}
 *               {"code":"1","result":"ctf is not found","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/:id/challenges',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.CTF, ACTIONS.CREATE),
    checkValidations("ctf_add-challenge"),
    catchAsync(async (req, res) => {
        const data = {id: req.params.id, challenge: req.body};
        return res.json(setResponse(await model.addChallenge(data)));
    }));

/**
 * @swagger
 * /administration/ctf/{id}/challenges/{challenge_id}:
 *   put:
 *     tags:
 *       - administration-ctf
 *     description: update ctf challenges administration
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : challenge_id
 *         type : string
 *         in: path
 *         required : true
 *         description : challenge id
 *       - name : id
 *         type : string
 *         in: path
 *         required : true
 *         description : ctf id
 *       - name : name
 *         type : string
 *         in: formData
 *         required : true
 *         description : name
 *       - name : status
 *         type : boolean
 *         in: formData
 *         required : true
 *         description : status
 *       - name : category_id
 *         type : number
 *         in: formData
 *         required : true
 *         description : category_id
 *       - name : level_id
 *         type : number
 *         in: formData
 *         required : true
 *         description : level_id
 *       - name : point
 *         type : number
 *         in: formData
 *         required : true
 *         description : point
 *       - name : coin
 *         type : number
 *         in: formData
 *         required : true
 *         description : coin
 *       - name : flag
 *         type : string
 *         in: formData
 *         required : true
 *         description : flag
 *       - name : link
 *         type : string
 *         in: formData
 *         required : true
 *         description : link
 *       - name : description
 *         type : string
 *         in: formData
 *         required : true
 *         description : description
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
 *               {"code":"2","result":"name is empty","is_login":"0"}
 *               {"code":"2","result":"category_id is empty","is_login":"0"}
 *               {"code":"2","result":"level_id is empty","is_login":"0"}
 *               {"code":"2","result":"challenge_id is empty","is_login":"0"}
 *               {"code":"2","result":"status is empty","is_login":"0"}
 *               {"code":"2","result":"point is empty","is_login":"0"}
 *               {"code":"2","result":"coin is empty","is_login":"0"}
 *               {"code":"2","result":"flag is empty","is_login":"0"}
 *               {"code":"2","result":"link is empty","is_login":"0"}
 *               {"code":"3","result":"id is not valid","is_login":"0"}
 *               {"code":"3","result":"name is not valid","is_login":"0"}
 *               {"code":"3","result":"challenge_id is not valid","is_login":"0"}
 *               {"code":"3","result":"status is not valid","is_login":"0"}
 *               {"code":"3","result":"category_id is not valid","is_login":"0"}
 *               {"code":"3","result":"level_id is not valid","is_login":"0"}
 *               {"code":"3","result":"point is not valid","is_login":"0"}
 *               {"code":"3","result":"coin is not valid","is_login":"0"}
 *               {"code":"3","result":"flag is not valid","is_login":"0"}
 *               {"code":"3","result":"link is not valid","is_login":"0"}
 *               {"code":"3","result":"description is not valid","is_login":"0"}
 *               {"code":"1","result":"ctf is not found","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.put('/:id/challenges/:challenge_id',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.CTF, ACTIONS.UPDATE),
    checkValidations("ctf_update-challenge"),
    catchAsync(async (req, res) => {
        const data = {id: req.params.id, challenge_id: req.params.challenge_id, challenge: req.body};
        return res.json(setResponse(await model.updateChallenge(data)));
    }));

/**
 * @swagger
 * /administration/ctf/{id}/challenges:
 *   patch:
 *     tags:
 *       - administration-ctf
 *     description: set-challenge-coins
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
 *         description : ctf id
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
 *               {"code":"1","result":"ctf is not found","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.patch('/:id/challenges',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.CTF, ACTIONS.UPDATE),
    checkValidations("ctf_set-challenge-coins"),
    catchAsync(async (req, res) => {
        return res.json(setResponse(await model.setChallengeCoins(req.params.id)));
    }));

/**
 * @swagger
 * /administration/ctf/{id}/challenges/{challenge_id}:
 *   delete:
 *     tags:
 *       - administration-ctf
 *     description: delete ctf challenges administration
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
 *         description : ctf id
 *       - name : challenge_id
 *         type : string
 *         in: path
 *         required : true
 *         description : challenge id
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
 *               {"code":"2","result":"challenge_id is empty","is_login":"0"}
 *               {"code":"3","result":"id is not valid","is_login":"0"}
 *               {"code":"3","result":"challenge_id is not valid","is_login":"0"}
 *               {"code":"1","result":"ctf is not found","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.delete('/:id/challenges/:challenge_id',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.CTF, ACTIONS.DELETE),
    checkValidations("ctf_delete-challenge"),
    catchAsync(async (req, res) => {
        const data = {id: req.params.id, challenge_id: req.params.challenge_id};
        await model.deleteChallenge(data);
        return res.json(setResponse());
    }));

/**
 * @swagger
 * /administration/ctf/{id}:
 *   put:
 *     tags:
 *       - administration-ctf
 *     description: ctf administration
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
 *         description : CTF id
 *       - name : title
 *         type : string
 *         in: formData
 *         required : true
 *         description : title
 *       - name : status
 *         type : boolean
 *         in: formData
 *         required : true
 *         description : status ... [true,false]
 *       - name : start_date_time
 *         type : string
 *         in: formData
 *         required : true
 *         description : start_date_time
 *       - name : end_date_time
 *         type : string
 *         in: formData
 *         required : true
 *         description : end_date_time
 *       - name : initial_point
 *         type : number
 *         in: formData
 *         required : false
 *         description : initial_point
 *       - name : minimum_point
 *         type : number
 *         in: formData
 *         required : false
 *         description : minimum_point
 *       - name : decay
 *         type : number
 *         in: formData
 *         required : false
 *         description : decay
 *       - name : coins
 *         type : number
 *         in: formData
 *         required : false
 *         description : coins
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
 *               {"code":"3","result":"id is not valid","is_login":"0"}
 *               {"code":"3","result":"title is not valid","is_login":"0"}
 *               {"code":"2","result":"status is empty","is_login":"0"}
 *               {"code":"2","result":"start_date_time is empty","is_login":"0"}
 *               {"code":"2","result":"end_date_time is empty","is_login":"0"}
 *               {"code":"3","result":"status is not valid","is_login":"0"}
 *               {"code":"3","result":"start_date_time is not valid","is_login":"0"}
 *               {"code":"3","result":"end_date_time is not valid","is_login":"0"}
 *               {"code":"3","result":"minimum_point is not valid","is_login":"0"}
 *               {"code":"3","result":"decay is not valid","is_login":"0"}
 *               {"code":"3","result":"coins is not valid","is_login":"0"}
 *               {"code":"3","result":"initial_point is not valid","is_login":"0"}
 *               {"code":"1","result":"ctf not found","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.put('/:id',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.CTF, ACTIONS.DELETE),
    checkValidations("ctf_update"),
    catchAsync(async (req, res) => {
        const data = {id: req.params.id, ctf: req.body};
        return res.json(setResponse(await model.update(data)));
    }));

/**
 * @swagger
 * /administration/ctf/{id}:
 *   delete:
 *     tags:
 *       - administration-ctf
 *     description: ctf administration
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
 *         description : ctf id
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
 *               {"code":"1","result":"ctf not found","is_login":"0"}
 *               {"code":"20","result":"ctf used in challenge","is_login":"0"}
 *               {"code":"20","result":"ctf used in flag","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.delete('/:id',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.CTF, ACTIONS.DELETE),
    checkValidations("user_delete"),
    catchAsync(async (req, res) => {
        return res.json(setResponse(await model.delete(req.params.id)));
    }));

module.exports = router;