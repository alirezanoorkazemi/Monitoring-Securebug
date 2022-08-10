const express = require('express');
const {ErrorHelper} = require('../../../libs/error.helper');
const {hasPermission, isAuthenticate} = require('../../init');
const {catchAsync} = require('../../../libs/error.helper');
const {ADMIN_RESOURCES, ACTIONS} = require('../../../libs/enum.helper');
const {setResponse} = require('../../../libs/message.helper');
const {makeHash} = require('../../../libs/token.helper');
const {getTimeStamp} = require('../../../libs/date.helper');
const {
    safeString, isUndefined, checkKey, getTypeFile, appDir,
    validExtensionImage, validExtensionFile, validExtensionVideo,
    validExtensionFileImage, random2, fileFilter
} = require('../../../libs/methode.helper');
const model = require('./program.model');
const router = express.Router();
const checkValidations = require('../../validation');
const multer = require('multer');
const fs = require('fs');
let fileLogo = {"dir": "company/program_logo", "field": "logo", "type": "image"};
let uploadDirs = [fileLogo];
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
 * /administration/program:
 *   get:
 *     tags:
 *       - administration-program
 *     description: program administration
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
 *       - name : name
 *         type : string
 *         in: query
 *         required : false
 *         description : name
 *       - name : program_type
 *         type : number
 *         in: query
 *         required : false
 *         description : program type ... [1,2,3]
 *       - name : status
 *         type : number
 *         in: query
 *         required : false
 *         description : status ... [0,1,2,3,4]
 *       - name : is_verify
 *         type : boolean
 *         in: query
 *         required : false
 *         description : is_verify
 *       - name : is_next_generation
 *         type : number
 *         in: query
 *         required : false
 *         description : program bounty type  ... [0,1,2,3]
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
 *               {"code":"3","result":"name is not valid","is_login":"0"}
 *               {"code":"3","result":"program type is not valid","is_login":"0"}
 *               {"code":"3","result":"status is not valid","is_login":"0"}
 *               {"code":"3","result":"is_verify is not valid","is_login":"0"}
 *               {"code":"3","result":"program_bounty_type is not valid","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.get('/',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.PROGRAM, ACTIONS.READ),
    checkValidations("program_gets"),
    catchAsync(async (req, res) => {
        const user_info = {user_id: req.user._id, user_level_access: req.user.user_level_access};
        const data = Object.assign({}, req.query, user_info);
        return res.json(setResponse(await model.gets(data)));
    }));

/**
 * @swagger
 * /administration/program/{id}:
 *   get:
 *     tags:
 *       - administration-program
 *     description: get program administration
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
 *         description : program id
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
 *               {"code":"5","result":"program is not found","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.get('/:id',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.PROGRAM, ACTIONS.READ),
    checkValidations("program_get"),
    catchAsync(async (req, res) => {
        const user_info = {user_id: req.user._id, user_level_access: req.user.user_level_access};
        const data = Object.assign({}, req.params, user_info);
        return res.json(setResponse(await model.get(data)));
    }));

/**
 * @swagger
 * /administration/program/{id}/history:
 *   get:
 *     tags:
 *       - administration-program
 *     description: get program history administration
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
 *         description : program id
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
 *               {"code":"5","result":"program is not found","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.get('/:id/history',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.PROGRAM, ACTIONS.READ),
    checkValidations("program_get-history"),
    catchAsync(async (req, res) => {
        const user_info = {user_id: req.user._id, user_level_access: req.user.user_level_access};
        const data = Object.assign({}, req.params, user_info);
        return res.json(setResponse(await model.getHistory(data)));
    }));

/**
 * @swagger
 * /administration/program/{id}/hackers:
 *   get:
 *     tags:
 *       - administration-program
 *     description: get program hackers administration
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
 *         description : program id
 *       - name : page
 *         type : number
 *         in: query
 *         required : true
 *         description : page
 *       - name : order
 *         type : string
 *         in: query
 *         description : order [rank,username,register_date_time,privilage]
 *       - name : sort_type
 *         type : number
 *         in: query
 *         description : sort_type [1,-1]
 *       - name : invitation_list
 *         type : boolean
 *         in: query
 *         description : invitation_list
 *       - name : username
 *         type : string
 *         in: query
 *         description : username
 *       - name : is_blue
 *         type : boolean
 *         in: query
 *         description : is_blue
 *       - name : competency
 *         type : number
 *         in: query
 *         description : competency [1,2,3]
 *       - name : tag
 *         type : number
 *         in: query
 *         description : tag [1,2]
 *       - name : invited_hacker_list
 *         type : boolean
 *         in: query
 *         description : invited_hacker_list
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
 *               {"code":"3","result":"invitation_list is not valid","is_login":"0"}
 *               {"code":"3","result":"invited_hacker_list is not valid","is_login":"0"}
 *               {"code":"5","result":"program is not found","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.get('/:id/hackers',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.PROGRAM_INVITATION, ACTIONS.READ),
    checkValidations("program_get-hackers"),
    catchAsync(async (req, res) => {
        const user_info = {user_id: req.user._id, user_level_access: req.user.user_level_access};
        const data = Object.assign({
            invitation_list: false,
            invited_hacker_list: false,
            user_verify: undefined,
            competency: null,
            order: "rank",
            sort_type: 1
        }, req.params, req.query, user_info);
        return res.json(setResponse(await model.getHackers(data)));
    }));

/**
 * @swagger
 * /administration/program/{id}/hackers:
 *   post:
 *     tags:
 *       - administration-program
 *     description: add program hackers administration
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
 *         description : program id
 *       - name : hacker_ids
 *         type : object
 *         in: formData
 *         description : |
 *          <pre>["hacker_id_1","hacker_id_2","hacker_id_3",...]</pre>
 *       - name : expire_day
 *         type : number
 *         in: formData
 *         description : expire_day
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
 *               {"code":"2","result":"expire_day is empty","is_login":"0"}
 *               {"code":"2","result":"hacker_ids is empty","is_login":"0"}
 *               {"code":"3","result":"id is not valid","is_login":"0"}
 *               {"code":"3","result":"expire_day is not valid","is_login":"0"}
 *               {"code":"3","result":"hacker_ids is not valid","is_login":"0"}
 *               {"code":"5","result":"program is not found","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/:id/hackers',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.PROGRAM_INVITATION, ACTIONS.CREATE),
    checkValidations("program_add-hackers"),
    catchAsync(async (req, res) => {
        const user_info = {user_id: req.user._id, user_level_access: req.user.user_level_access};
        const data = Object.assign({}, req.params, req.body, user_info, {hacker_ids: JSON.parse(JSON.stringify(req.body.hacker_ids))});
        return res.json(setResponse(await model.addHackers(data)));
    }));

/**
 * @swagger
 * /administration/program/{id}/hackers/{hacker_id}:
 *   delete:
 *     tags:
 *       - administration-program
 *     description: delete program hackers administration
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
 *         description : program id
 *       - name : hacker_id
 *         type : string
 *         in: path
 *         description: hacker_id
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
 *               {"code":"2","result":"hacker_id is empty","is_login":"0"}
 *               {"code":"3","result":"id is not valid","is_login":"0"}
 *               {"code":"3","result":"hacker_id is not valid","is_login":"0"}
 *               {"code":"5","result":"program is not found","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.delete('/:id/hackers/:hacker_id',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.PROGRAM_INVITATION, ACTIONS.DELETE),
    checkValidations("program_delete-hacker"),
    catchAsync(async (req, res) => {
        const user_info = {user_id: req.user._id, user_level_access: req.user.user_level_access};
        const data = Object.assign({}, req.params, user_info);
        return res.json(setResponse(await model.deleteHackers(data)));
    }));

/**
 * @swagger
 * /administration/program/{id}:
 *   put:
 *     tags:
 *       - administration-program
 *     description: update program administration
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
 *         description : program id
 *       - name : tab
 *         type : number
 *         in: formData
 *         required : true
 *         description : tab
 *       - name : name
 *         type : string
 *         in: formData
 *         description : name
 *       - name : tagline
 *         type : string
 *         in: formData
 *         description : tagline
 *       - name : policy
 *         type : string
 *         in: formData
 *         description : policy
 *       - name : logo
 *         type : file
 *         in: formData
 *         description : logo
 *       - name : compliance1
 *         type : number
 *         in: formData
 *         description : 0 or 1
 *       - name : compliance2
 *         type : number
 *         in: formData
 *         description : 0 or 1
 *       - name : compliance3
 *         type : number
 *         in: formData
 *         description : 0 or 1
 *       - name : compliance4
 *         type : number
 *         in: formData
 *         description : 0 or 1
 *       - name : compliance5
 *         type : number
 *         in: formData
 *         description : 0 or 1
 *       - name : compliance6
 *         type : number
 *         in: formData
 *         description : 0 or 1
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
 *               {"code":"2","result":"program_type is empty","is_login":"0"}
 *               {"code":"2","result":"product_type is empty","is_login":"0"}
 *               {"code":"2","result":"name is empty","is_login":"0"}
 *               {"code":"2","result":"tagline is empty","is_login":"0"}
 *               {"code":"2","result":"policy is empty","is_login":"0"}
 *               {"code":"2","result":"is_next_generation is empty","is_login":"0"}
 *               {"code":"3","result":"id is not valid","is_login":"0"}
 *               {"code":"3","result":"program_type is not valid","is_login":"0"}
 *               {"code":"3","result":"product_type is not valid","is_login":"0"}
 *               {"code":"3","result":"name is not valid","is_login":"0"}
 *               {"code":"3","result":"tagline is not valid","is_login":"0"}
 *               {"code":"3","result":"policy is not valid","is_login":"0"}
 *               {"code":"3","result":"logo is not valid","is_login":"0"}
 *               {"code":"3","result":"is_next_generation is not valid","is_login":"0"}
 *               {"code":"3","result":"compliance1 is not valid","is_login":"0"}
 *               {"code":"3","result":"compliance2 is not valid","is_login":"0"}
 *               {"code":"3","result":"compliance3 is not valid","is_login":"0"}
 *               {"code":"3","result":"compliance4 is not valid","is_login":"0"}
 *               {"code":"3","result":"compliance5 is not valid","is_login":"0"}
 *               {"code":"3","result":"compliance6 is not valid","is_login":"0"}
 *               {"code":"5","result":"program is not found","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
async function upload_program_edit_check(req, file, cb) {
    try {
        let user = req.user;
        req.uploadDirs = uploadDirs;
        const program_id = safeString(req.params.id);
        const currentProgram = await model.get({
            id: program_id,
            user_level_access: user.user_level_access,
            user_id: user._id
        });
        if (req.files && Object.keys(req.files).length > 0 && !isUndefined(req.files.logo)) {
            let path = appDir + 'media/' + currentProgram['logo_file'];
            fs.stat(path, async (err, stats) => {
                if (!err && stats.isFile())
                    fs.unlinkSync(path);
            });
            await model.removeLogoFile(currentProgram.company_user_id, program_id);
            fileFilter(req, file, cb);
        } else {
            cb(null, false);
        }
    } catch (e) {
        if (isDebug)
            throw new ErrorHelper(e);
        else {
            cb(null, false);
            throw new ErrorHelper();
        }
    }
}

const uploader_prgram_edit = multer({storage: storage, fileFilter: upload_program_edit_check});
const uploadPrgramEdit = uploader_prgram_edit.fields([{name: 'logo', maxCount: 1}]);
router.put('/:id',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.PROGRAM, ACTIONS.UPDATE),
    uploadPrgramEdit,
    catchAsync(async (req, res) => {
        const data = Object.assign({files: req.files}, req.body, req.params);
        return res.json(setResponse(await model.update(data)));
    }));

/**
 * @swagger
 * /administration/program/status/{id}:
 *   patch:
 *     tags:
 *       - administration-program
 *     description: change-status program administration
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
 *         description : program id
 *       - name : status
 *         type : number
 *         in: formData
 *         required : true
 *         description : status [0, 1, 2, 3, 4]
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
 *               {"code":"1","result":"program is not found","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.patch('/status/:id',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.PROGRAM, ACTIONS.UPDATE),
    checkValidations("program_change-status"),
    catchAsync(async (req, res) => {
        const user_info = {user_id: req.user._id, user_level_access: req.user.user_level_access};
        const data = Object.assign({}, req.body, req.params, user_info);
        return res.json(setResponse(await model.changeStatus(data)));
    }));

/**
 * @swagger
 * /administration/program/program-type/{id}:
 *   patch:
 *     tags:
 *       - administration-program
 *     description: change-program-type program administration
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
 *         description : program id
 *       - name : program_type
 *         type : number
 *         in: formData
 *         required : true
 *         description : program_type [1, 2]
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
 *               {"code":"2","result":"program_type is empty","is_login":"0"}
 *               {"code":"3","result":"program_type is not valid","is_login":"0"}
 *               {"code":"1","result":"program is not  found","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.patch('/program-type/:id',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.PROGRAM, ACTIONS.UPDATE),
    checkValidations("program_change-program-type"),
    catchAsync(async (req, res) => {
        const data = Object.assign({}, req.body, req.params);
        await model.changeProgramType(data);
        return res.json(setResponse());
    }));

/**
 * @swagger
 * /administration/program/product-type/{id}:
 *   patch:
 *     tags:
 *       - administration-program
 *     description: change-product-type program administration
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
 *         description : program id
 *       - name : product_type
 *         type : number
 *         in: formData
 *         required : true
 *         description : product_type [1, 2, 3]
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
 *               {"code":"2","result":"product_type is empty","is_login":"0"}
 *               {"code":"3","result":"product_type is not valid","is_login":"0"}
 *               {"code":"1","result":"program is not found","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.patch('/product-type/:id',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.PROGRAM, ACTIONS.UPDATE),
    checkValidations("program_change-product-type"),
    catchAsync(async (req, res) => {
        const data = Object.assign({}, req.body, req.params);
        await model.changeProductType(data);
        return res.json(setResponse());
    }));

/**
 * @swagger
 * /administration/program/program-bounty-type/{id}:
 *   patch:
 *     tags:
 *       - administration-program
 *     description: change-program-bounty-type program administration
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
 *         description : program id
 *       - name : is_next_generation
 *         type : number
 *         in: formData
 *         required : true
 *         description : is_next_generation [0, 1, 2, 3]
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
 *               {"code":"2","result":"is_next_generation is empty","is_login":"0"}
 *               {"code":"3","result":"is_next_generation is not valid","is_login":"0"}
 *               {"code":"1","result":"program is not found","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.patch('/program-bounty-type/:id',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.PROGRAM, ACTIONS.UPDATE),
    checkValidations("program_change-program-bounty-type"),
    catchAsync(async (req, res) => {
        const data = Object.assign({}, req.body, req.params);
        await model.changeProgramBountyType(data);
        return res.json(setResponse());
    }));

/**
 * @swagger
 * /administration/program/{id}:
 *   delete:
 *     tags:
 *       - administration-program
 *     description: delete program administration
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
 *         description : program id
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
 *               {"code":"1","result":"program is not found","is_login":"0"}
 *               {"code":"20","result":"program status is {status}","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.delete('/:id',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.PROGRAM, ACTIONS.DELETE),
    checkValidations("program_delete"),
    catchAsync(async (req, res) => {
        await model.delete(req.params.id);
        return res.json(setResponse());
    }));

/**
 * @swagger
 * /administration/program/{id}/moderators:
 *   get:
 *     tags:
 *       - administration-program
 *     description: moderators program administration
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
 *         description : program id
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
 *               {"code":"1","result":"program is not found","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.get('/:id/moderators',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.PROGRAM_MODERATOR, ACTIONS.READ),
    checkValidations("program_get-moderators"),
    catchAsync(async (req, res) => {
        const user_info = {user_id: req.user._id, user_level_access: req.user.user_level_access};
        const data = Object.assign({}, req.params, user_info);
        return res.json(setResponse(await model.getModerators(data)));
    }));

/**
 * @swagger
 * /administration/program/{id}/moderators:
 *   post:
 *     tags:
 *       - administration-program
 *     description: assign moderator to program administration
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
 *         description : program id
 *       - name : moderator_user_id
 *         type : string
 *         in: formData
 *         required : true
 *         description : moderator_user_id
 *       - name : user_access
 *         type : string
 *         in: formData
 *         required : true
 *         description : user_access
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
 *               {"code":"2","result":"moderator_user_id is empty","is_login":"0"}
 *               {"code":"2","result":"user_access is empty","is_login":"0"}
 *               {"code":"3","result":"id is not valid","is_login":"0"}
 *               {"code":"3","result":"moderator_user_id is not valid","is_login":"0"}
 *               {"code":"3","result":"user_access is not valid","is_login":"0"}
 *               {"code":"1","result":"program is not found","is_login":"0"}
 *               {"code":"1","result":"moderator is not found","is_login":"0"}
 *               {"code":"20","result":"moderator is assigned to this program","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/:id/moderators',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.PROGRAM_MODERATOR, ACTIONS.CREATE),
    checkValidations("program_assign-moderator"),
    catchAsync(async (req, res) => {
        const data = Object.assign({user_access: ""}, req.params, req.body);
        return res.json(setResponse(await model.assignModerator(data)));
    }));

/**
 * @swagger
 * /administration/program/{id}/moderators/{moderator_user_id}:
 *   put:
 *     tags:
 *       - administration-program
 *     description: assign moderator to program administration
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : id
 *         type : string
 *         in: path
 *         required : false
 *         description : program id
 *       - name : moderator_user_id
 *         type : string
 *         in: path
 *         required : true
 *         description : moderator_user_id
 *       - name : user_access
 *         type : string
 *         in: formData
 *         required : false
 *         description : user_access
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
 *               {"code":"2","result":"moderator_user_id is empty","is_login":"0"}
 *               {"code":"2","result":"user_access is empty","is_login":"0"}
 *               {"code":"3","result":"id is not valid","is_login":"0"}
 *               {"code":"3","result":"moderator_user_id is not valid","is_login":"0"}
 *               {"code":"3","result":"user_access is not valid","is_login":"0"}
 *               {"code":"1","result":"program is not found","is_login":"0"}
 *               {"code":"1","result":"moderator is not found","is_login":"0"}
 *               {"code":"20","result":"moderator is assigned to this program","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.put('/:id/moderators/:moderator_user_id',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.PROGRAM_MODERATOR, ACTIONS.UPDATE),
    checkValidations("program_update-assigned-moderator"),
    catchAsync(async (req, res) => {
        const data = Object.assign({}, req.params, req.body);
        return res.json(setResponse(await model.updateAssignedModerator(data)));
    }));

/**
 * @swagger
 * /administration/program/{id}/moderators/{moderator_user_id}:
 *   delete:
 *     tags:
 *       - administration-program
 *     description: delete moderators program administration
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
 *         description : program id
 *       - name : moderator_user_id
 *         type : string
 *         in: path
 *         required : true
 *         description : moderator_user_id
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
 *               {"code":"2","result":"moderator_user_id is empty","is_login":"0"}
 *               {"code":"3","result":"id is not valid","is_login":"0"}
 *               {"code":"3","result":"moderator_user_id is not valid","is_login":"0"}
 *               {"code":"1","result":"program is not found","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.delete('/:id/moderators/:moderator_user_id',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.PROGRAM_MODERATOR, ACTIONS.DELETE),
    checkValidations("program_delete-moderator"),
    catchAsync(async (req, res) => {
        await model.deleteModerator(req.params);
        return res.json(setResponse());
    }));

/**
 * @swagger
 * /administration/program/maximum-reward/{id}:
 *   patch:
 *     tags:
 *       - administration-program
 *     description: update-reward program administration
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
 *         description : program id
 *       - name : maximum_reward
 *         type : number
 *         in: formData
 *         required : true
 *         description : maximum_reward
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
 *               {"code":"2","result":"maximum_reward is empty","is_login":"0"}
 *               {"code":"3","result":"maximum_reward is not valid","is_login":"0"}
 *               {"code":"1","result":"program is not found","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.patch('/maximum-reward/:id',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.PROGRAM, ACTIONS.UPDATE),
    checkValidations("program_update-maximum-reward"),
    catchAsync(async (req, res) => {
        const user_info = {user_id: req.user._id, user_level_access: req.user.user_level_access};
        const data = Object.assign({}, req.params, req.body, user_info);
        await model.updateMaximumReward(data);
        return res.json(setResponse());
    }));

/**
 * @swagger
 * /administration/program/verify/{id}:
 *   patch:
 *     tags:
 *       - administration-program
 *     description: change-status program administration
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
 *         description : program id
 *       - name : is_verify
 *         type : boolean
 *         in: formData
 *         required : true
 *         description : is_verify [true,false]
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
 *               {"code":"1","result":"program is not found","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.patch('/verify/:id',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.PROGRAM, ACTIONS.UPDATE),
    checkValidations("program_change-verify"),
    catchAsync(async (req, res) => {
        const user_info = {user_id: req.user._id, user_level_access: req.user.user_level_access};
        const data = Object.assign({}, req.body, req.params, user_info);
        await model.changeVerify(data);
        return res.json(setResponse());
    }));

/**
 * @swagger
 * /administration/program/{id}:
 *   patch:
 *     tags:
 *       - administration-program
 *     description: set expire program administration
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
 *         description : program id
 *       - name : expire_day
 *         type : number
 *         in: formData
 *         required : true
 *         description : expire_day
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
 *               {"code":"2","result":"expire_day is empty","is_login":"0"}
 *               {"code":"3","result":"expire_day is not valid","is_login":"0"}
 *               {"code":"1","result":"program is not found","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.patch('/:id',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.PROGRAM, ACTIONS.UPDATE),
    checkValidations("program_set-expire-day"),
    catchAsync(async (req, res) => {
        const user_info = {user_id: req.user._id, user_level_access: req.user.user_level_access};
        const data = Object.assign({}, req.params, req.body, user_info);
        await model.setExpireDay(data);
        return res.json(setResponse());
    }));

/**
 * @swagger
 * /administration/program/{id}/targets:
 *   post:
 *     tags:
 *       - administration-program
 *     description: create target to program administration
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
 *         description : program id
 *       - name : identifier
 *         type : string
 *         in: formData
 *         required : true
 *         description : identifier
 *       - name : target_type_id
 *         type : string
 *         in: formData
 *         required : true
 *         description : target_type_id
 *       - name : maturity
 *         type : string
 *         enum: [0,1,2,3,4]
 *         in: formData
 *         description : |
 *              <pre>
 *               0 -> None
 *               1 -> Basic
 *               2 -> Intermediate
 *               3 -> Advanced
 *               4 -> Complex
 *              </pre>
 *       - name : language_id
 *         type : object
 *         in: formData
 *         description : |
 *          <pre>["lang_id_1","lang_id_2","lang_id_3",...]</pre>
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
 *               {"code":"2","result":"identifier is empty","is_login":"0"}
 *               {"code":"2","result":"target_type_id is empty","is_login":"0"}
 *               {"code":"2","result":"language_id is empty","is_login":"0"}
 *               {"code":"2","result":"maturity is empty","is_login":"0"}
 *               {"code":"3","result":"id is not valid","is_login":"0"}
 *               {"code":"3","result":"identifier is not valid","is_login":"0"}
 *               {"code":"3","result":"target_type_id is not valid","is_login":"0"}
 *               {"code":"3","result":"language_id is not valid","is_login":"0"}
 *               {"code":"3","result":"maturity is not valid","is_login":"0"}
 *               {"code":"5","result":"program is not found","is_login":"0"}
 *               {"code":"5","result":"currency is not found","is_login":"0"}
 *               {"code":"20","result":"identifier already exists","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/:id/targets',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.PROGRAM, ACTIONS.UPDATE),
    checkValidations("program_create-target"),
    catchAsync(async (req, res) => {
        const data = Object.assign({}, req.params, req.body, {language_id: JSON.parse(JSON.stringify(req.body.language_id))});
        return res.json(setResponse(await model.createTarget(data)));
    }));

/**
 * @swagger
 * /administration/program/{id}/targets/{target_id}:
 *   delete:
 *     tags:
 *       - administration-program
 *     description: delete target to program administration
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
 *         description : program id
 *       - name : target_id
 *         type : string
 *         in: path
 *         required : true
 *         description : target id
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
 *               {"code":"2","result":"target_id is empty","is_login":"0"}
 *               {"code":"3","result":"id is not valid","is_login":"0"}
 *               {"code":"3","result":"target_id is not valid","is_login":"0"}
 *               {"code":"5","result":"program is not found","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.delete('/:id/targets/:target_id',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.PROGRAM, ACTIONS.UPDATE),
    checkValidations("program_delete-target"),
    catchAsync(async (req, res) => {
        const data = Object.assign({}, req.params);
        return res.json(setResponse(await model.deleteTarget(data)));
    }));

/**
 * @swagger
 * /administration/program/{id}/targets/{target_id}:
 *   put:
 *     tags:
 *       - administration-program
 *     description: update target to program administration
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
 *         description : program id
 *       - name : target_id
 *         type : string
 *         in: path
 *         required : true
 *         description : target id
 *       - name : identifier
 *         type : string
 *         in: formData
 *         required : true
 *         description : identifier
 *       - name : target_type_id
 *         type : string
 *         in: formData
 *         required : true
 *         description : target_type_id
 *       - name : maturity
 *         type : string
 *         enum: [0,1,2,3,4]
 *         in: formData
 *         description : |
 *              <pre>
 *               0 -> None
 *               1 -> Basic
 *               2 -> Intermediate
 *               3 -> Advanced
 *               4 -> Complex
 *              </pre>
 *       - name : language_id
 *         type : object
 *         in: formData
 *         description : |
 *          <pre>["lang_id_1","lang_id_2","lang_id_3",...]</pre>
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
 *               {"code":"2","result":"target_id is empty","is_login":"0"}
 *               {"code":"2","result":"identifier is empty","is_login":"0"}
 *               {"code":"2","result":"target_type_id is empty","is_login":"0"}
 *               {"code":"2","result":"language_id is empty","is_login":"0"}
 *               {"code":"2","result":"maturity is empty","is_login":"0"}
 *               {"code":"3","result":"id is not valid","is_login":"0"}
 *               {"code":"3","result":"target_id is not valid","is_login":"0"}
 *               {"code":"3","result":"identifier is not valid","is_login":"0"}
 *               {"code":"3","result":"target_type_id is not valid","is_login":"0"}
 *               {"code":"3","result":"language_id is not valid","is_login":"0"}
 *               {"code":"3","result":"maturity is not valid","is_login":"0"}
 *               {"code":"5","result":"program is not found","is_login":"0"}
 *               {"code":"5","result":"currency is not found","is_login":"0"}
 *               {"code":"16","result":"reward is already exist","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.put('/:id/targets/:target_id',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.PROGRAM, ACTIONS.UPDATE),
    checkValidations("program_update-target"),
    catchAsync(async (req, res) => {
        const data = Object.assign({}, req.params, req.body, {language_id: JSON.parse(JSON.stringify(req.body.language_id))});
        return res.json(setResponse(await model.updateTarget(data)));
    }));

/**
 * @swagger
 * /administration/program/{id}/rewards:
 *   post:
 *     tags:
 *       - administration-program
 *     description: create reward to program administration
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : id
 *         type : string
 *         in: path
 *         description : program_id
 *         required : true
 *       - name : target_id
 *         type : string
 *         in: formData
 *         description: target_id
 *         required : true
 *       - name : currency_id
 *         type : string
 *         in: formData
 *         description : currency_id
 *         required : true
 *       - name : critical_price
 *         type : string
 *         in: formData
 *         description : critical_price
 *         required : true
 *       - name : high_price
 *         type : string
 *         in: formData
 *         description : high_price
 *         required : true
 *       - name : medium_price
 *         type : string
 *         in: formData
 *         description : medium_price
 *         required : true
 *       - name : low_price
 *         type : string
 *         in: formData
 *         description : low_price
 *         required : true
 *       - name : none_price
 *         type : string
 *         in: formData
 *         description : none_price
 *         required : true
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
 *               {"code":"0","result":{program_data},"is_login":"0"}
 *               {"code":"2","result":"program_id is empty","is_login":"0"}
 *               {"code":"2","result":"target_id is empty","is_login":"0"}
 *               {"code":"2","result":"currency_id is empty","is_login":"0"}
 *               {"code":"2","result":"critical_price is empty","is_login":"0"}
 *               {"code":"2","result":"high_price is empty","is_login":"0"}
 *               {"code":"2","result":"medium_price is empty","is_login":"0"}
 *               {"code":"2","result":"low_price is empty","is_login":"0"}
 *               {"code":"2","result":"none_price is empty","is_login":"0"}
 *               {"code":"5","result":"currency not found!","is_login":"0"}
 *               {"code":"3","result":"critical_price is invalid!","is_login":"0"}
 *               {"code":"3","result":"high_price is invalid!","is_login":"0"}
 *               {"code":"3","result":"medium_price is invalid!","is_login":"0"}
 *               {"code":"3","result":"low_price is invalid!","is_login":"0"}
 *               {"code":"3","result":"none_price is invalid!","is_login":"0"}
 *               {"code":"3","result":"program_id is invalid","is_login":"0"}
 *               {"code":"3","result":"target_id is invalid","is_login":"0"}
 *               {"code":"16","result":"reward for this target exists!","is_login":"0"}
 *               {"code":"20","result":"you can not add reward for this program","is_login":"0"}
 *               {"code":"3","result":"currency is invalid","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/:id/rewards',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.PROGRAM, ACTIONS.UPDATE),
    checkValidations("program_create-reward"),
    catchAsync(async (req, res) => {
        const data = Object.assign({}, req.params, req.body);
        return res.json(setResponse(await model.createReward(data)));
    }));

/**
 * @swagger
 * /administration/program/{id}/rewards/all-targets:
 *   post:
 *     tags:
 *       - administration-program
 *     description: create reward for all targets to program administration
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : id
 *         type : string
 *         in: path
 *         description : program_id
 *         required : true
 *       - name : currency_id
 *         type : string
 *         in: formData
 *         description : currency_id
 *         required : true
 *       - name : critical_price
 *         type : string
 *         in: formData
 *         description : critical_price
 *         required : true
 *       - name : high_price
 *         type : string
 *         in: formData
 *         description : high_price
 *         required : true
 *       - name : medium_price
 *         type : string
 *         in: formData
 *         description : medium_price
 *         required : true
 *       - name : low_price
 *         type : string
 *         in: formData
 *         description : low_price
 *         required : true
 *       - name : none_price
 *         type : string
 *         in: formData
 *         description : none_price
 *         required : true
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
 *               {"code":"0","result":{program_data},"is_login":"0"}
 *               {"code":"2","result":"program_id is empty","is_login":"0"}
 *               {"code":"2","result":"currency_id is empty","is_login":"0"}
 *               {"code":"2","result":"critical_price is empty","is_login":"0"}
 *               {"code":"2","result":"high_price is empty","is_login":"0"}
 *               {"code":"2","result":"medium_price is empty","is_login":"0"}
 *               {"code":"2","result":"low_price is empty","is_login":"0"}
 *               {"code":"2","result":"none_price is empty","is_login":"0"}
 *               {"code":"5","result":"currency not found!","is_login":"0"}
 *               {"code":"3","result":"critical_price is invalid!","is_login":"0"}
 *               {"code":"3","result":"high_price is invalid!","is_login":"0"}
 *               {"code":"3","result":"medium_price is invalid!","is_login":"0"}
 *               {"code":"3","result":"low_price is invalid!","is_login":"0"}
 *               {"code":"3","result":"none_price is invalid!","is_login":"0"}
 *               {"code":"3","result":"program_id is invalid","is_login":"0"}
 *               {"code":"16","result":"reward for this target exists!","is_login":"0"}
 *               {"code":"20","result":"you can not add reward for this program","is_login":"0"}
 *               {"code":"3","result":"currency is invalid","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/:id/rewards/all-targets',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.PROGRAM, ACTIONS.UPDATE),
    checkValidations("program_create-reward-for-all-targets"),
    catchAsync(async (req, res) => {
        const data = Object.assign({}, req.params, req.body);
        return res.json(setResponse(await model.createRewardForAllTargets(data)));
    }));

/**
 * @swagger
 * /administration/program/{id}/rewards/{reward_id}:
 *   put:
 *     tags:
 *       - administration-program
 *     description: update reward to program administration
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : id
 *         type : string
 *         in: path
 *         description : program_id
 *         required : true
 *       - name : reward_id
 *         type : string
 *         in: path
 *         description : reward_id
 *         required : true
 *       - name : target_id
 *         type : string
 *         in: formData
 *         description: target_id
 *         required : true
 *       - name : currency_id
 *         type : string
 *         in: formData
 *         description : currency_id
 *         required : true
 *       - name : critical_price
 *         type : string
 *         in: formData
 *         description : critical_price
 *         required : true
 *       - name : high_price
 *         type : string
 *         in: formData
 *         description : high_price
 *         required : true
 *       - name : medium_price
 *         type : string
 *         in: formData
 *         description : medium_price
 *         required : true
 *       - name : low_price
 *         type : string
 *         in: formData
 *         description : low_price
 *         required : true
 *       - name : none_price
 *         type : string
 *         in: formData
 *         description : none_price
 *         required : true
 *       - name : all_target
 *         type : boolean
 *         in: formData
 *         description : all_target
 *         required : false
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
 *               {"code":"0","result":{program_data},"is_login":"0"}
 *               {"code":"2","result":"program_id is empty","is_login":"0"}
 *               {"code":"2","result":"target_id is empty","is_login":"0"}
 *               {"code":"2","result":"currency_id is empty","is_login":"0"}
 *               {"code":"2","result":"critical_price is empty","is_login":"0"}
 *               {"code":"2","result":"high_price is empty","is_login":"0"}
 *               {"code":"2","result":"medium_price is empty","is_login":"0"}
 *               {"code":"2","result":"low_price is empty","is_login":"0"}
 *               {"code":"2","result":"none_price is empty","is_login":"0"}
 *               {"code":"2","result":"reward_id is empty","is_login":"0"}
 *               {"code":"5","result":"currency not found!","is_login":"0"}
 *               {"code":"3","result":"critical_price is invalid!","is_login":"0"}
 *               {"code":"3","result":"high_price is invalid!","is_login":"0"}
 *               {"code":"3","result":"medium_price is invalid!","is_login":"0"}
 *               {"code":"3","result":"low_price is invalid!","is_login":"0"}
 *               {"code":"3","result":"none_price is invalid!","is_login":"0"}
 *               {"code":"3","result":"reward_id is invalid!","is_login":"0"}
 *               {"code":"3","result":"program_id is invalid","is_login":"0"}
 *               {"code":"3","result":"target_id is invalid","is_login":"0"}
 *               {"code":"16","result":"reward for this target exists!","is_login":"0"}
 *               {"code":"20","result":"you can not update reward for this program","is_login":"0"}
 *               {"code":"3","result":"currency is invalid","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.put('/:id/rewards/:reward_id',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.PROGRAM, ACTIONS.UPDATE),
    checkValidations("program_update-reward"),
    catchAsync(async (req, res) => {
        const data = Object.assign({reward_id: "", all_target: false}, req.params, req.body);
        return res.json(setResponse(await model.updateReward(data)));
    }));

/**
 * @swagger
 * /administration/program/{id}/rewards/{reward_id}:
 *   delete:
 *     tags:
 *       - administration-program
 *     description: delete reward to program administration
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : id
 *         type : string
 *         in: path
 *         description : program_id
 *         required : true
 *       - name : reward_id
 *         type : string
 *         in: path
 *         description : reward_id
 *         required : true
 *       - name : all_target
 *         type : boolean
 *         in: body
 *         description : all_target
 *         required : false
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
 *               {"code":"0","result":{program_data},"is_login":"0"}
 *               {"code":"2","result":"program_id is empty","is_login":"0"}
 *               {"code":"2","result":"reward_id is empty","is_login":"0"}
 *               {"code":"3","result":"reward_id is invalid!","is_login":"0"}
 *               {"code":"3","result":"program_id is invalid","is_login":"0"}
 *               {"code":"3","result":"all_target is invalid","is_login":"0"}
 *               {"code":"20","result":"you can not delete reward for this program","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.delete('/:id/rewards/:reward_id',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.PROGRAM, ACTIONS.UPDATE),
    checkValidations("program_delete-reward"),
    catchAsync(async (req, res) => {
        const data = Object.assign({user_id: req.user._id, all_target: false}, req.params, req.body);
        return res.json(setResponse(await model.deleteReward(data)));
    }));

/**
 * @swagger
 * /administration/program/{id}/policy:
 *   post:
 *     tags:
 *       - administration-program
 *     description:  create policy to program administration
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : id
 *         type : string
 *         in: path
 *         description : program_id
 *         required : true
 *       - name : target_id
 *         type : string
 *         in: formData
 *         description: target_id
 *         required : true
 *       - name : out_of_target
 *         type : string
 *         in: formData
 *         description : out_of_target
 *       - name : is_next_generation
 *         type : number
 *         in: formData
 *         required : true
 *         description : is_next_generation
 *       - name : item1
 *         type : boolean
 *         in: formData
 *         description : Do you consider this asset eligible for submission?
 *       - name : item2
 *         type : boolean
 *         in: formData
 *         description : Do you consider this asset eligible for bounty?
 *       - name : item3
 *         type : boolean
 *         in: formData
 *         description : Is this asset only accessible for users in a specific country (e.g. because it requires a SSID)?
 *       - name : target_information
 *         type : string
 *         in: formData
 *         description : Target information
 *         required : true
 *       - name : qualifying_vulnerabilities
 *         type : string
 *         in: formData
 *         description : Qualifying Vulnerabilities
 *       - name : non_qualifying_vulnerabilities
 *         type : string
 *         in: formData
 *         description : NON-Qualifying Vulnerabilities
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
 *               {"code":"0","result":{program_data},"is_login":"0"}
 *               {"code":"2","result":"program_id is empty","is_login":"0"}
 *               {"code":"2","result":"is_next_generation is empty","is_login":"0"}
 *               {"code":"3","result":"program_id is invalid","is_login":"0"}
 *               {"code":"3","result":"is_next_generation is invalid","is_login":"0"}
 *               {"code":"2","result":"target_id is empty","is_login":"0"}
 *               {"code":"3","result":"target_id is invalid","is_login":"0"}
 *               {"code":"2","result":"target_information is empty","is_login":"0"}
 *               {"code":"3","result":"target_information is invalid","is_login":"0"}
 *               {"code":"2","result":"qualifying_vulnerabilities is empty","is_login":"0"}
 *               {"code":"3","result":"qualifying_vulnerabilities is invalid","is_login":"0"}
 *               {"code":"2","result":"non_qualifying_vulnerabilities is empty","is_login":"0"}
 *               {"code":"3","result":"non_qualifying_vulnerabilities is invalid","is_login":"0"}
 *               {"code":"5","result":"program is not found","is_login":"0"}
 *               {"code":"16","result":"policy for this target exists!","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/:id/policy',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.PROGRAM, ACTIONS.UPDATE),
    checkValidations("program_create-policy"),
    catchAsync(async (req, res) => {
        const data = Object.assign({}, req.params, req.body);
        return res.json(setResponse(await model.createPolicy(data)));
    }));

/**
 * @swagger
 * /administration/program/{id}/policy/all-targets:
 *   post:
 *     tags:
 *       - administration-program
 *     description:  create policy for all targets to program administration
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : id
 *         type : string
 *         in: path
 *         description : program_id
 *         required : true
 *       - name : out_of_target
 *         type : string
 *         in: formData
 *         description : out_of_target
 *       - name : is_next_generation
 *         type : number
 *         in: formData
 *         required : true
 *         description : is_next_generation
 *       - name : item1
 *         type : boolean
 *         in: formData
 *         description : Do you consider this asset eligible for submission?
 *       - name : item2
 *         type : boolean
 *         in: formData
 *         description : Do you consider this asset eligible for bounty?
 *       - name : item3
 *         type : boolean
 *         in: formData
 *         description : Is this asset only accessible for users in a specific country (e.g. because it requires a SSID)?
 *       - name : target_information
 *         type : string
 *         in: formData
 *         description : Target information
 *         required : true
 *       - name : qualifying_vulnerabilities
 *         type : string
 *         in: formData
 *         description : Qualifying Vulnerabilities
 *       - name : non_qualifying_vulnerabilities
 *         type : string
 *         in: formData
 *         description : NON-Qualifying Vulnerabilities
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
 *               {"code":"0","result":{program_data},"is_login":"0"}
 *               {"code":"2","result":"program_id is empty","is_login":"0"}
 *               {"code":"2","result":"is_next_generation is empty","is_login":"0"}
 *               {"code":"3","result":"program_id is invalid","is_login":"0"}
 *               {"code":"3","result":"is_next_generation is invalid","is_login":"0"}
 *               {"code":"2","result":"target_information is empty","is_login":"0"}
 *               {"code":"3","result":"target_information is invalid","is_login":"0"}
 *               {"code":"2","result":"qualifying_vulnerabilities is empty","is_login":"0"}
 *               {"code":"3","result":"qualifying_vulnerabilities is invalid","is_login":"0"}
 *               {"code":"2","result":"non_qualifying_vulnerabilities is empty","is_login":"0"}
 *               {"code":"3","result":"non_qualifying_vulnerabilities is invalid","is_login":"0"}
 *               {"code":"5","result":"program is not found","is_login":"0"}
 *               {"code":"16","result":"policy for this target exists!","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/:id/policy/all-targets',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.PROGRAM, ACTIONS.UPDATE),
    checkValidations("program_create-policy-for-all-targets"),
    catchAsync(async (req, res) => {
        const data = Object.assign({}, req.params, req.body);
        return res.json(setResponse(await model.createPolicyForAllTargets(data)));
    }));

/**
 * @swagger
 * /administration/program/{id}/policy/{policy_id}:
 *   put:
 *     tags:
 *       - administration-program
 *     description:  update policy to program administration
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : id
 *         type : string
 *         in: path
 *         description : program_id
 *         required : true
 *       - name : policy_id
 *         type : string
 *         in: path
 *         description : policy_id
 *         required : true
 *       - name : target_id
 *         type : string
 *         in: formData
 *         description: target_id
 *         required : true
 *       - name : is_next_generation
 *         type : number
 *         in: formData
 *         description: is_next_generation
 *         required : true
 *       - name : out_of_target
 *         type : string
 *         in: formData
 *         description : out_of_target
 *       - name : item1
 *         type : boolean
 *         in: formData
 *         description : Do you consider this asset eligible for submission?
 *       - name : item2
 *         type : boolean
 *         in: formData
 *         description : Do you consider this asset eligible for bounty?
 *       - name : item3
 *         type : boolean
 *         in: formData
 *         description : Is this asset only accessible for users in a specific country (e.g. because it requires a SSID)?
 *       - name : target_information
 *         type : string
 *         in: formData
 *         description : Target information
 *         required : true
 *       - name : qualifying_vulnerabilities
 *         type : string
 *         in: formData
 *         description : Qualifying Vulnerabilities
 *       - name : non_qualifying_vulnerabilities
 *         type : string
 *         in: formData
 *         description : NON-Qualifying Vulnerabilities
 *       - name : all_target
 *         type : boolean
 *         in: formData
 *         description : all_target
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
 *               {"code":"0","result":{program_data},"is_login":"0"}
 *               {"code":"2","result":"program_id is empty","is_login":"0"}
 *               {"code":"2","result":"is_next_generation is empty","is_login":"0"}
 *               {"code":"2","result":"policy_id is empty","is_login":"0"}
 *               {"code":"3","result":"program_id is invalid","is_login":"0"}
 *               {"code":"3","result":"is_next_generation is invalid","is_login":"0"}
 *               {"code":"3","result":"policy_id is invalid","is_login":"0"}
 *               {"code":"2","result":"target_id is empty","is_login":"0"}
 *               {"code":"3","result":"target_id is invalid","is_login":"0"}
 *               {"code":"2","result":"target_information is empty","is_login":"0"}
 *               {"code":"3","result":"target_information is invalid","is_login":"0"}
 *               {"code":"2","result":"qualifying_vulnerabilities is empty","is_login":"0"}
 *               {"code":"3","result":"qualifying_vulnerabilities is invalid","is_login":"0"}
 *               {"code":"2","result":"non_qualifying_vulnerabilities is empty","is_login":"0"}
 *               {"code":"3","result":"non_qualifying_vulnerabilities is invalid","is_login":"0"}
 *               {"code":"5","result":"program is not found","is_login":"0"}
 *               {"code":"16","result":"policy for this target exists!","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.put('/:id/policy/:policy_id',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.PROGRAM, ACTIONS.UPDATE),
    checkValidations("program_update-policy"),
    catchAsync(async (req, res) => {
        const data = Object.assign({policy_id: "", all_target: false}, req.params, req.body);
        return res.json(setResponse(await model.updatePolicy(data)));
    }));

/**
 * @swagger
 * /administration/program/{id}/policy/{policy_id}:
 *   delete:
 *     tags:
 *       - administration-program
 *     description: delete policy to program administration
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : id
 *         type : string
 *         in: path
 *         description : program_id
 *         required : true
 *       - name : policy_id
 *         type : string
 *         in: path
 *         description : policy_id
 *         required : true
 *       - name : all_target
 *         type : boolean
 *         in: body
 *         description : all_target
 *         required : false
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
 *               {"code":"0","result":{program_data},"is_login":"0"}
 *               {"code":"2","result":"program_id is empty","is_login":"0"}
 *               {"code":"2","result":"policy_id is empty","is_login":"0"}
 *               {"code":"3","result":"reward_id is invalid!","is_login":"0"}
 *               {"code":"3","result":"policy_id is invalid","is_login":"0"}
 *               {"code":"3","result":"all_target is invalid","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.delete('/:id/policy/:policy_id',
    isAuthenticate,
    hasPermission(ADMIN_RESOURCES.PROGRAM, ACTIONS.UPDATE),
    checkValidations("program_delete-policy"),
    catchAsync(async (req, res) => {
        const data = Object.assign({user_id: req.user._id, all_target: false}, req.params, req.body);
        return res.json(setResponse(await model.deletePolicy(data)));
    }));

    /**
 * @swagger
 * /administration/program/{id}/budgeting:
 *   post:
 *     tags:
 *       - administration-program 
 *     description: set hours per month
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
 *         description : program_id
 *       - name : duration_type
 *         type : number
 *         in: formData
 *         required : true
 *         description : duration_type ...[6,12]
 *       - name : hourly_price
 *         type : number
 *         in: formData
 *         required : true
 *         description : hourly_price 
 *       - name : monthly_hours
 *         type : object
 *         in: formData
 *         required : true
 *         description : monthly_hours ...[month-day-year,hours] 
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
 *               {"code":"5","result":"program is not defined","is_login":"0"}
 *               {"code":"3","result":"product type is not valid","is_login":"0"}
 *               {"code":"0","result":{company_data},"is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
 router.post('/:id/budgeting',
 isAuthenticate, 
 hasPermission(ADMIN_RESOURCES.PROGRAM, ACTIONS.UPDATE),
 checkValidations("program_budgeting"),
 catchAsync(async (req, res) => {
     const data = Object.assign({} , req.params, req.body);
     return res.json(setResponse(await model.setBudgeting(data)));
 })
);

module.exports = router;