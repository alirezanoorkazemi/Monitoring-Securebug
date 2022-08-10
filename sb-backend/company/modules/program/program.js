require('../../init');
const model = require('./program.model');
const moment = require('moment');
const router = express.Router();
let fileLogo = {"dir": "company/program_logo", "field": "logo", "type": "image"};

let uploadDirs = [
    fileLogo
];
const {
    checkKey, appDir,
    fileFilter, toNumber, safeString
} = require('../../../libs/methode.helper');
const {getDateTime, getDiffDays, getDayOfMonth, getOnlyDays} = require('../../../libs/date.helper');

let uploadLogo = uploader.fields([{name: 'logo', maxCount: 1}]);
/**
 * @swagger
 * /company/program/step1:
 *   post:
 *     tags:
 *       - company - program
 *     description: program step1
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : logo
 *         type : file
 *         in: formData
 *         description : logo
 *         required : true
 *       - name : program_type
 *         type : string
 *         in: formData
 *         description : program_type
 *         required : true
 *       - name : name
 *         type : string
 *         in: formData
 *         description : name
 *         required : true
 *       - name : tagline
 *         type : string
 *         in: formData
 *         description : tagline
 *         required : true
 *       - name : policy
 *         type : string
 *         in: formData
 *         description : policy
 *         required : true
 *       - name : is_next_generation
 *         type : number
 *         in: formData
 *         description : is_next_generation -> 1 is next generation  , 2 -> is classic pentest  , 0 is bug bounty
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
 *               {"code":"403","result":"You don't have permission for this action"}
 *               {"code":"-1","result":"token is empty","is_login":"-1"}
 *               {"code":"-1","result":"token invalid","is_login":"-1"}
 *               {"code":"-1","result":"token expire","is_login":"-1"}
 *               {"code":"-2","result":"account is not verify","is_login":"-2"}
 *               {"code":"-3","result":"account is disabled","is_login":"-3"}
 *               {"code":"0","result":{program_data},"is_login":"0"}
 *               {"code":"1","result":"program_type is empty","is_login":"0"}
 *               {"code":"2","result":"name is empty","is_login":"0"}
 *               {"code":"3","result":"tagline is empty","is_login":"0"}
 *               {"code":"4","result":"policy is empty","is_login":"0"}
 *               {"code":"5","result":"logo is empty","is_login":"0"}
 *               {"code":"6","result":"program_type value is invalid","is_login":"0"}
 *               {"code":"7","result":"error insert please try again","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/step1', isAuth, hasPermission(RESOURCE.PROGRAM, ACTIONS.CREATE), async (req, res) => {
    try {
        let user = company.get('companyUser');
        var keyCache = 'program_log_' + user._id;
        let cacheLogo = await getCache(keyCache);
        let logoFile = '';
        if (cacheLogo) {
            let indexDel = uploadDirs.findIndex(x => x.field === 'logo');
            if (indexDel >= 0)
                uploadDirs.splice(indexDel, 1);
            logoFile = cacheLogo['program_log'];
        } else {
            let indexDel = uploadDirs.findIndex(x => x.field === 'logo');
            if (indexDel === -1) {
                uploadDirs.push(fileLogo);
            }
        }

        req.uploadDirs = uploadDirs;
        uploadLogo(req, res, async (err) => {
            if (err) {
                if (isSentry)
                    Sentry.captureException(e);
                if (isDebug)
                    res.status(500).json({"result": err.toString()});
                else
                    res.status(500).json({"result": "Internal Server Error!"});
            } else {

                if (req.files && Object.keys(req.files).length > 0 && !isUndefined(req.files.logo)) {
                    let filename = req.files.logo[0].filename.toLowerCase();
                    logoFile = `company/program_logo/${filename}`;
                    let cacheResult = await setCache(keyCache, {"program_log": logoFile});
                }


                await check.body('program_type').trim().not().isEmpty()
                    .withMessage({"result": "program_type is empty", "code": "1", "is_login": "0"}).run(req);
                await check.body('product_type').trim().if(check.body('is_next_generation').not().equals("2")).notEmpty({ignore_whitespace: true})
                    .withMessage({"result": "product_type is empty", "code": "8", "is_login": "0"}).run(req);
                await check.body('name').trim().not().isEmpty()
                    .withMessage({"result": "name is empty", "code": "2", "is_login": "0"}).run(req);
                await check.body('tagline').trim().not().isEmpty()
                    .withMessage({"result": "tagline is empty", "code": "3", "is_login": "0"}).run(req);
                await check.body('policy').trim().not().isEmpty()
                    .withMessage({"result": "policy is empty", "code": "4", "is_login": "0"}).run(req);

                const errors = check.validationResult(req);
                if (!errors.isEmpty()) {
                    res.json(errors.array()[0].msg);
                    return;
                }


                if (logoFile == '') {
                    res.json({"result": "logo is empty", "code": "5", "is_login": "0"});
                    return;
                }

                let is_next_generation = toNumber(req.body.is_next_generation);
                if (is_next_generation == 1)
                    is_next_generation = 1;
                else if (is_next_generation == 2)
                    is_next_generation = 2;
                else
                    is_next_generation = 0;

                let compliance1 = toNumber(req.body.compliance1);
                compliance1 = (compliance1 == 1) ? 1 : 0;
                let compliance2 = toNumber(req.body.compliance2);
                compliance2 = (compliance2 == 1) ? 1 : 0;
                let compliance3 = toNumber(req.body.compliance3);
                compliance3 = (compliance3 == 1) ? 1 : 0;
                let compliance4 = toNumber(req.body.compliance4);
                compliance4 = (compliance4 == 1) ? 1 : 0;
                let compliance5 = toNumber(req.body.compliance5);
                compliance5 = (compliance5 == 1) ? 1 : 0;
                let compliance6 = toNumber(req.body.compliance6);
                compliance6 = (compliance6 == 1) ? 1 : 0;


                let program_type = toNumber(req.body.program_type);
                let product_type = toNumber(req.body.product_type);
                let name = safeString(req.body.name);
                let tagline = safeString(req.body.tagline);
                let policy = cleanXSS(req.body.policy);
                policy = safeString(policy);

                if (is_next_generation !== 2 && (product_type <= 0 || product_type > 3)) {
                    res.json({"result": "product_type value is invalid", "code": "8", "is_login": "0"});
                    return;
                }
                if (program_type <= 0 || program_type > 2) {
                    res.json({"result": "program_type value is invalid", "code": "6", "is_login": "0"});
                    return;
                }
                let addStep1 = await model.addStep1(getUserId(user), logoFile, name
                    , program_type, tagline, policy, is_next_generation, compliance1,
                    compliance2, compliance3, compliance4, compliance5, compliance6,
                    product_type, user._id);
                if (!isUndefined(addStep1) && checkKey(addStep1.toObject(), '_id')) {
                    let delCacheResult = await delCache(keyCache);
                    var ret = addStep1.toObject();
                    ret['logo_file'] = AppConfig.API_URL + logoFile;
                    ret['program_id'] = addStep1['_id'];
                    delete ret._id;
                    delete ret.__v;
                    delete ret.company_user_id;
                    delete ret.is_verify;
                    res.json({"result": ret, "code": "0", "is_login": "0"});
                } else {
                    res.json({"result": "error insert please try again", "code": "7", "is_login": "0"});
                }

            }
        });
    } catch (e) {
        if (isSentry)
            Sentry.captureException(e);
        if (isDebug)
            res.status(500).json({"result": e.toString()});
        else
            res.status(500).json({"result": "Internal Server Error!"});
    }

});

/**
 * @swagger
 * /company/program/edit_step1:
 *   post:
 *     tags:
 *       - company - program
 *     description: program edit step1
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : program_id
 *         type : string
 *         in: formData
 *         description : program_id
 *         required : true
 *       - name : program_type
 *         type : string
 *         in: formData
 *         description : program_type
 *         required : true
 *       - name : name
 *         type : string
 *         in: formData
 *         description : name
 *         required : true
 *       - name : tagline
 *         type : string
 *         in: formData
 *         description : tagline
 *         required : true
 *       - name : policy
 *         type : string
 *         in: formData
 *         description : policy
 *         required : true
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
 *               {"code":"403","result":"You don't have permission for this action"}
 *               {"code":"-1","result":"token is empty","is_login":"-1"}
 *               {"code":"-1","result":"token invalid","is_login":"-1"}
 *               {"code":"-1","result":"token expire","is_login":"-1"}
 *               {"code":"-2","result":"account is not verify","is_login":"-2"}
 *               {"code":"-3","result":"account is disabled","is_login":"-3"}
 *               {"code":"0","result":{program_data},"is_login":"0"}
 *               {"code":"1","result":"program_id is invalid","is_login":"0"}
 *               {"code":"2","result":"program_type is empty","is_login":"0"}
 *               {"code":"3","result":"name is empty","is_login":"0"}
 *               {"code":"4","result":"tagline is empty","is_login":"0"}
 *               {"code":"5","result":"policy is empty","is_login":"0"}
 *               {"code":"6","result":"program_type value is invalid","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
async function upload_program_edit_check(req, file, cb) {
    try {
        let user = company.get('companyUser');
        req.uploadDirs = uploadDirs;
        const program_id = safeString(req.body.program_id);
        const is_program_owner = await model.hasAccessToProgram(user, program_id);
        if (!is_program_owner) {
            req.validationErrors = {"result": "program_id is invalid", "code": "1", "is_login": "0"};
            cb(null, false);
            return;
        }
        let currentProgram = await model.getRow(getUserId(user), program_id);
        req.program = Object.assign({}, currentProgram);
        if (currentProgram.status > 0) {
            req.validationErrors = {"result": "program can not edit", "code": "7", "is_login": "0"};
            cb(null, false);
            return;
        }

        await check.body('program_type').trim().not().isEmpty()
            .withMessage({"result": "program_type2 is empty", "code": "2", "is_login": "0"}).run(req);
        await check.body('name').trim().not().isEmpty()
            .withMessage({"result": "name2 is empty", "code": "3", "is_login": "0"}).run(req);
        await check.body('tagline').trim().not().isEmpty()
            .withMessage({"result": "tagline is empty", "code": "4", "is_login": "0"}).run(req);
        await check.body('policy').trim().not().isEmpty()
            .withMessage({"result": "policy is empty", "code": "5", "is_login": "0"}).run(req);

        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            req.validationErrors = {"result": errors.array()[0].msg};
            cb(null, false);
            return;
        }
        let program_type = toNumber(req.body.program_type);
        if (program_type <= 0 || program_type > 2) {
            req.validationErrors = {"result": "program_type value is invalid", "code": "6", "is_login": "0"};
            cb(null, false);
            return;
        }
        req.validationErrors = "";
        if (req.files && Object.keys(req.files).length > 0 && !isUndefined(req.files.logo)) {
            let path = appDir + 'media/' + currentProgram['logo_file'];
            fs.stat(path, async (err, stats) => {
                if (!err && stats.isFile()) {
                    fs.unlinkSync(path);
                }
            });
            await model.removeLogoFile(getUserId(user), program_id, req.program, user._id);
            fileFilter(req, file, cb);
        } else {
            cb(null, false);
        }
    } catch (e) {
        if (isDebug)
            req.validationErrors = {"result": e.toString()};
        else
            req.validationErrors = {"result": "Internal Server Error!"};
        cb(null, false);
    }
};

const uploader_prgram_edit = multer({storage: storage, fileFilter: upload_program_edit_check});
let uploadPrgramEdit = uploader_prgram_edit.fields([{name: 'logo', maxCount: 1}]);
router.post('/edit_step1', isAuth, hasPermission(RESOURCE.PROGRAM, ACTIONS.UPDATE), uploadPrgramEdit, async (req, res) => {
    try {
        let user = company.get('companyUser');
        const program_id = safeString(req.body.program_id);
        const is_program_owner = await model.hasAccessToProgram(user, program_id);
        if (!is_program_owner) {
            return res.json({
                "result": "program_id is invalid or you don't have access to it!",
                "code": "1",
                "is_login": "0"
            });
        }
        let currentProgram = await model.getRow(getUserId(user), program_id);
        if (currentProgram.status !== 0 && currentProgram.status !== 3) {
            res.json({"result": "program can not edit", "code": "7", "is_login": "0"});
            return;
        }

        await check.body('program_type').trim().not().isEmpty()
            .withMessage({"result": "program_type is empty", "code": "2", "is_login": "0"}).run(req);
        if (currentProgram.is_next_generation !== 2) {
            await check.body('product_type').trim().notEmpty({ignore_whitespace: true})
                .withMessage({"result": "product_type is empty", "code": "8", "is_login": "0"}).run(req);
        }
        await check.body('name').trim().not().isEmpty()
            .withMessage({"result": "name is empty", "code": "3", "is_login": "0"}).run(req);
        await check.body('tagline').trim().not().isEmpty()
            .withMessage({"result": "tagline is empty", "code": "4", "is_login": "0"}).run(req);
        await check.body('policy').trim().not().isEmpty()
            .withMessage({"result": "policy is empty", "code": "5", "is_login": "0"}).run(req);

        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json({"result": errors.array()[0].msg});
            return;
        }
        let program_type = toNumber(req.body.program_type);
        let product_type = toNumber(req.body.product_type);
        let name = safeString(req.body.name);
        let tagline = safeString(req.body.tagline);
        let policy = cleanXSS(req.body.policy);
        policy = safeString(policy);

        if (program_type <= 0 || program_type > 2) {
            res.json({"result": "program_type value is invalid", "code": "6", "is_login": "0"});
            return;
        }
        if (currentProgram.is_next_generation !== 2 && (product_type <= 0 || product_type > 3)) {
            res.json({"result": "product_type value is invalid", "code": "8", "is_login": "0"});
            return;
        }
        if (!isUndefined(req.validationErrors) && req.validationErrors != "") {
            res.json(req.validationErrors);
            return;
        }
        let logoFile = '';
        if (currentProgram['logo_file'] != "") {
            logoFile = currentProgram['logo_file'];
        } else {
            if (req.files && Object.keys(req.files).length > 0 && !isUndefined(req.files.logo)) {
                let filename = req.files.logo[0].filename.toLowerCase();
                logoFile = `company/program_logo/${filename}`;
            } else {
                res.json({"result": "file not send!", "code": "8", "is_login": "0"});
                return;
            }
        }
        let compliance1 = toNumber(req.body.compliance1);
        compliance1 = (compliance1 == 1) ? 1 : 0;
        let compliance2 = toNumber(req.body.compliance2);
        compliance2 = (compliance2 == 1) ? 1 : 0;
        let compliance3 = toNumber(req.body.compliance3);
        compliance3 = (compliance3 == 1) ? 1 : 0;
        let compliance4 = toNumber(req.body.compliance4);
        compliance4 = (compliance4 == 1) ? 1 : 0;
        let compliance5 = toNumber(req.body.compliance5);
        compliance5 = (compliance5 == 1) ? 1 : 0;
        let compliance6 = toNumber(req.body.compliance6);
        compliance6 = (compliance6 == 1) ? 1 : 0;


        await model.saveStep1(getUserId(user), program_id
            , logoFile, name, program_type, tagline, policy, compliance1, compliance2,
            compliance3, compliance4, compliance5, compliance6, product_type, currentProgram.is_next_generation, currentProgram, user._id);
        let currentProgram2 = await model.getRow(getUserId(user), program_id);
        currentProgram2 = currentProgram2.toObject();
        delete currentProgram2['company_user_id'];
        currentProgram2['logo_file'] = AppConfig.API_URL + logoFile;
        delete currentProgram2['_id'];
        currentProgram2['program_id'] = program_id;
        res.json({"result": currentProgram2, "code": "0", "is_login": "0"});
    } catch (e) {
        if (isSentry)
            Sentry.captureException(e);
        if (isDebug)
            res.status(500).json({"result": e.toString()});
        else
            res.status(500).json({"result": "Internal Server Error!"});
    }

});

/**
 * @swagger
 * /company/program/get_program/{program_id}:
 *   get:
 *     tags:
 *       - company - program
 *     description: get_program
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : program_id
 *         type : string
 *         in: path
 *         description : program_id
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
 *               {"code":"1","result":"program not found","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.get('/get_program/:program_id', isAuth, hasPermission(RESOURCE.PROGRAM, ACTIONS.READ), async (req, res) => {
    try {
        let user = company.get('companyUser');
        let program_id = safeString(req.params.program_id);
        let currentProgram = await model.getProgram(getUserId(user), program_id, user.parent_user_id, user.access_program_list);
        if (currentProgram) {
            res.json({"result": currentProgram, "code": "0", "is_login": "0"});
        } else {
            res.json({"result": "program not found or you don't have access to it!", "code": "1", "is_login": "0"});
        }
    } catch (e) {
        if (isSentry)
            Sentry.captureException(e);
        if (isDebug)
            res.status(500).json({"result": e.toString()});
        else
            res.status(500).json({"result": "Internal Server Error!"});
    }

});

/**
 * @swagger
 * /company/program/get-program-history/:
 *   get:
 *     tags:
 *       - company - program
 *     description: get-program-history
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : program_id
 *         type : string
 *         in: params
 *         description : program_id
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
 *               {"code":"0","result":{obj},"is_login":"0"}
 *               {"code":"1","result":"program_id is empty","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.get('/get-program-history/:program_id', isAuth, hasPermission(RESOURCE.PROGRAM, ACTIONS.READ), async (req, res) => {
    try {
        let user = company.get('companyUser');
        let program_id = safeString(req.params.program_id);
        let result = await model.getProgramHistory(program_id, getUserId(user), user.parent_user_id, user.access_program_list);
        if (typeof result !== 'number') {
            return res.json({"result": result, "code": "0", "is_login": "0"});
        } else {
            if (result === 2) {
                return res.json({"result": "program is not found", "code": "2", "is_login": "0"});
            } else if (result === 3) {
                return res.json({"result": "kyc advanced is not active", "code": "2", "is_login": "0"});
            }
        }

    } catch (e) {
        if (isSentry)
            Sentry.captureException(e);
        if (isDebug)
            res.status(500).json({"result": e.toString()});
        else
            res.status(500).json({"result": "Internal Server Error!"});
    }

});

/**
 * @swagger
 * /company/program/get-programs-info:
 *   get:
 *     tags:
 *       - company - program
 *     description: get-programs-info
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
 *               {"code":"-1","result":"token is empty","is_login":"-1"}
 *               {"code":"-1","result":"token invalid","is_login":"-1"}
 *               {"code":"-1","result":"token expire","is_login":"-1"}
 *               {"code":"-2","result":"account is not verify","is_login":"-2"}
 *               {"code":"-3","result":"account is disabled","is_login":"-3"}
 *               {"code":"0","result":{obj},"is_login":"0"}
 *               {"code":"1","result":"program_id is empty","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.get('/get-programs-info', isAuth, hasPermission(RESOURCE.PROGRAM, ACTIONS.READ), async (req, res) => {
    try {
        let user = company.get('companyUser');
        let result = await model.getProgramsInfo(getUserId(user), user.parent_user_id, user.access_program_list);
        return res.json({"result": result, "code": "0", "is_login": "0"});
    } catch (e) {
        if (isSentry)
            Sentry.captureException(e);
        if (isDebug)
            res.status(500).json({"result": e.toString()});
        else
            res.status(500).json({"result": "Internal Server Error!"});
    }

});

/**
 * @swagger
 * /company/program/add_target:
 *   post:
 *     tags:
 *       - company - program
 *     description: program add_target
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : identifier
 *         type : string
 *         in: formData
 *         description : identifier
 *         required : true
 *       - name : program_id
 *         type : string
 *         in: formData
 *         description : program_id
 *         required : true
 *       - name : target_type_id
 *         type : string
 *         in: formData
 *         description : target_type_id
 *         required : true
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
 *       - name : language
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
 *               {"code":"-1","result":"token is empty","is_login":"-1"}
 *               {"code":"-1","result":"token invalid","is_login":"-1"}
 *               {"code":"-1","result":"token expire","is_login":"-1"}
 *               {"code":"-2","result":"account is not verify","is_login":"-2"}
 *               {"code":"-3","result":"account is disabled","is_login":"-3"}
 *               {"code":"0","result":{program_data},"is_login":"0"}
 *               {"code":"403","result":"You don't have permission for this action"}
 *               {"code":"1","result":"identifier is empty","is_login":"0"}
 *               {"code":"2","result":"program_id is empty","is_login":"0"}
 *               {"code":"3","result":"target_type_id is empty","is_login":"0"}
 *               {"code":"4","result":"identifier is exists","is_login":"0"}
 *               {"code":"5","result":"maturity is invalid","is_login":"0"}
 *               {"code":"6","result":"target_type_id is invalid","is_login":"0"}
 *               {"code":"7","result":"program_id is invalid","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/add_target', isAuth, hasPermission(RESOURCE.PROGRAM, ACTIONS.CREATE), uploader.none(), [
    check.body('identifier').trim().not().isEmpty()
        .withMessage({"result": "identifier is empty", "code": "1", "is_login": "0"}),
    check.body('program_id').trim().not().isEmpty()
        .withMessage({"result": "program_id is empty", "code": "2", "is_login": "0"}),
    check.body('target_type_id').trim().not().isEmpty()
        .withMessage({"result": "target_type_id is empty", "code": "3", "is_login": "0"}),
], async (req, res) => {
    try {
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else {
            let user = company.get('companyUser');
            //check program_id for owner
            const program_id = safeString(req.body.program_id);
            const is_program_owner = await model.hasAccessToProgram(user, program_id);
            if (!is_program_owner) {
                return res.json({
                    "result": "program_id is invalid or you don't have access to it!",
                    "code": "1",
                    "is_login": "0"
                });
            }
            let currentProgram2 = await model.getRow(getUserId(user), program_id);
            if (currentProgram2.status !== 0 && currentProgram2.status !== 3) {
                res.json({"result": "program can not edit", "code": "8", "is_login": "0"});
                return;
            }
            //check target_type_id is valid
            const target_type_id = safeString(req.body.target_type_id);
            const resultTypeTest = await model.getTypeTest(target_type_id);
            if (resultTypeTest > 0) {
                const maturity = toNumber(req.body.maturity);
                if (maturity >= 0 && maturity <= 4) {
                    const langArray = isUndefined(req.body.language) ? [] : req.body.language;
                    const languageArray = [];
                    if (langArray.length > 0) {
                        //check lang item is valid
                        for (let lang_id of langArray) {
                            lang_id = safeString(lang_id);
                            const resultLangIsValid = await model.getLang(lang_id);
                            if (resultLangIsValid > 0)
                                languageArray.push(lang_id);
                        }
                    }
                    const identifier = safeString(req.body.identifier);
                    let isCheckExists = await model.checkExistsTarget(getUserId(user), target_type_id, identifier, program_id);
                    if (isCheckExists == 0) {
                        const result = await model.addTarget(
                            getUserId(user), program_id, identifier, target_type_id, languageArray, maturity, user._id, currentProgram2
                        );
                        if (result === 1) {
                            let currentProgram = await model.getRow(getUserId(user), program_id);
                            res.json({"result": currentProgram, "code": "0", "is_login": "0"});
                        } else {
                            return res.json({"result": "program not found", "code": "4", "is_login": "0"});
                        }
                    } else {
                        res.json({"result": "identifier is exists", "code": "4", "is_login": "0"});
                    }
                } else {
                    res.json({"result": "maturity is invalid", "code": "5", "is_login": "0"});
                }
            } else {
                res.json({"result": "target_type_id is invalid", "code": "6", "is_login": "0"});
            }
        }
    } catch (e) {
        if (isSentry)
            Sentry.captureException(e);
        if (isDebug)
            res.status(500).json({"result": e.toString()});
        else
            res.status(500).json({"result": "Internal Server Error!"});
    }

});

/**
 * @swagger
 * /company/program/edit_target:
 *   post:
 *     tags:
 *       - company - program
 *     description: program edit_target
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : identifier
 *         type : string
 *         in: formData
 *         description : identifier
 *         required : true
 *       - name : program_id
 *         type : string
 *         in: formData
 *         description : program_id
 *         required : true
 *       - name : target_type_id
 *         type : string
 *         in: formData
 *         description : target_type_id
 *         required : true
 *       - name : target_id
 *         type : string
 *         in: formData
 *         description : target_id
 *         required : true
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
 *       - name : language
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
 *               {"code":"403","result":"You don't have permission for this action"}
 *               {"code":"-1","result":"token is empty","is_login":"-1"}
 *               {"code":"-1","result":"token invalid","is_login":"-1"}
 *               {"code":"-1","result":"token expire","is_login":"-1"}
 *               {"code":"-2","result":"account is not verify","is_login":"-2"}
 *               {"code":"-3","result":"account is disabled","is_login":"-3"}
 *               {"code":"0","result":{program_data},"is_login":"0"}
 *               {"code":"1","result":"identifier is empty","is_login":"0"}
 *               {"code":"2","result":"program_id is empty","is_login":"0"}
 *               {"code":"3","result":"target_type_id is empty","is_login":"0"}
 *               {"code":"4","result":"target_id is empty","is_login":"0"}
 *               {"code":"5","result":"identifier is exists","is_login":"0"}
 *               {"code":"6","result":"target_id is invalid","is_login":"0"}
 *               {"code":"7","result":"maturity is invalid","is_login":"0"}
 *               {"code":"8","result":"target_type_id is invalid","is_login":"0"}
 *               {"code":"9","result":"program_id is invalid","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/edit_target', isAuth, hasPermission(RESOURCE.PROGRAM, ACTIONS.UPDATE), uploader.none(), [
    check.body('identifier').trim().not().isEmpty()
        .withMessage({"result": "identifier is empty", "code": "1", "is_login": "0"}),
    check.body('program_id').trim().not().isEmpty()
        .withMessage({"result": "program_id is empty", "code": "2", "is_login": "0"}),
    check.body('target_type_id').trim().not().isEmpty()
        .withMessage({"result": "target_type_id is empty", "code": "3", "is_login": "0"}),
    check.body('target_id').trim().not().isEmpty()
        .withMessage({"result": "target_id is empty", "code": "4", "is_login": "0"}),
], async (req, res) => {
    try {
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else {
            let user = company.get('companyUser');
            //check program_id for owner
            const program_id = safeString(req.body.program_id);
            const is_program_owner = await model.hasAccessToProgram(user, program_id);
            if (!is_program_owner) {
                return res.json({
                    "result": "program_id is invalid or you don't have access to it!",
                    "code": "1",
                    "is_login": "0"
                });
            }
            let currentProgram2 = await model.getRow(getUserId(user), program_id);
            if (currentProgram2.status !== 0 && currentProgram2.status !== 3) {
                res.json({"result": "program can not edit", "code": "10", "is_login": "0"});
                return;
            }
            //check target_type_id is valid
            const target_type_id = safeString(req.body.target_type_id);
            const resultTypeTest = await model.getTypeTest(target_type_id);
            if (resultTypeTest > 0) {
                const maturity = toNumber(req.body.maturity);
                if (maturity >= 0 && maturity <= 4) {
                    const langArray = isUndefined(req.body.language) ? [] : req.body.language;
                    const languageArray = [];
                    if (langArray.length > 0) {
                        //check lang item is valid
                        for (let lang_id of langArray) {
                            lang_id = safeString(lang_id);
                            var resultLangIsValid = await model.getLang(lang_id);
                            if (resultLangIsValid > 0)
                                languageArray.push(lang_id);
                        }
                    }
                    const identifier = safeString(req.body.identifier);
                    const target_id = safeString(req.body.target_id);
                    let isTarget = await model.getTarget(getUserId(user), program_id, target_id);
                    if (!isUndefined(isTarget) && checkKey(isTarget.toObject(), '_id')) {
                        let resutlSave = await model.saveTarget(
                            getUserId(user), program_id, target_id, identifier, target_type_id, languageArray, maturity, currentProgram2, user._id
                        );
                        if (resutlSave == 1) {
                            let currentProgram = await model.getRow(getUserId(user), program_id);
                            res.json({"result": currentProgram, "code": "0", "is_login": "0"});
                        } else {
                            res.json({"result": "identifier is exists", "code": "5", "is_login": "0"});
                        }
                    } else {
                        res.json({"result": "target_id is invalid", "code": "6", "is_login": "0"});
                    }
                } else {
                    res.json({"result": "maturity is invalid", "code": "7", "is_login": "0"});
                }
            } else {
                res.json({"result": "target_type_id is invalid", "code": "8", "is_login": "0"});
            }
        }
    } catch (e) {
        if (isSentry)
            Sentry.captureException(e);
        if (isDebug)
            res.status(500).json({"result": e.toString()});
        else
            res.status(500).json({"result": "Internal Server Error!"});
    }

});

/**
 * @swagger
 * /company/program/delete_target:
 *   delete:
 *     tags:
 *       - company - program
 *     description: delete target
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : program_id
 *         type : string
 *         in: formData
 *         description : program_id
 *         required : true
 *       - name : target_id
 *         type : string
 *         in: formData
 *         description : target_id
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
 *               {"code":"1","result":"program_id is empty","is_login":"0"}
 *               {"code":"2","result":"target_id is empty","is_login":"0"}
 *               {"code":"3","result":"delete error","is_login":"0"}
 *               {"code":"4","result":"program_id is invalid","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.delete('/delete_target', isAuth, hasPermission(RESOURCE.PROGRAM, ACTIONS.DELETE), uploader.none(), [
    check.body('program_id').trim().not().isEmpty()
        .withMessage({"result": "program_id is empty", "code": "1", "is_login": "0"}),
    check.body('target_id').trim().not().isEmpty()
        .withMessage({"result": "target_id is empty", "code": "2", "is_login": "0"}),
], async (req, res) => {
    try {
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else {
            let user = company.get('companyUser');
            const program_id = safeString(req.body.program_id);
            const is_program_owner = await model.hasAccessToProgram(user, program_id);
            if (!is_program_owner) {
                return res.json({
                    "result": "program_id is invalid or you don't have access to it!",
                    "code": "1",
                    "is_login": "0"
                });
            }
            const target_id = safeString(req.body.target_id);
            let currentProgram = await model.getRow(getUserId(user), program_id);
            if (currentProgram && checkKey(currentProgram.toObject(), '_id')) {
                if (currentProgram.status !== 0 && currentProgram.status !== 3) {
                    res.json({"result": "program can not edit", "code": "5", "is_login": "0"});
                    return;
                }
                let delTarget = await model.deleteTarget(getUserId(user), program_id, target_id, currentProgram, user._id);
                if (delTarget == 1) {
                    let currentProgram2 = await model.getRow(getUserId(user), program_id);
                    res.json({"result": currentProgram2, "code": "0", "is_login": "0"});
                } else {
                    res.json({"result": "delete error!", "code": "3", "is_login": "0"});
                }
            } else {
                res.json({"result": "program_id is invalid", "code": "4", "is_login": "0"});
            }
        }
    } catch (e) {
        if (isSentry)
            Sentry.captureException(e);
        if (isDebug)
            res.status(500).json({"result": e.toString()});
        else
            res.status(500).json({"result": "Internal Server Error!"});
    }

});

/**
 * @swagger
 * /company/program/save_maximum_reward:
 *   post:
 *     tags:
 *       - company - program
 *     description: save maximum reward program
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : maximum_reward
 *         type : string
 *         in: formData
 *         description : maximum_reward
 *         required : true
 *       - name : program_id
 *         type : string
 *         in: formData
 *         description : program_id
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
 *               {"code":"1","result":"maximum_reward is empty","is_login":"0"}
 *               {"code":"2","result":"program_id is empty","is_login":"0"}
 *               {"code":"3","result":"program_id is invalid","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/save_maximum_reward', isAuth, hasPermission(RESOURCE.PROGRAM, ACTIONS.CREATE), uploader.none(), [
    check.body('maximum_reward').trim().not().isEmpty()
        .withMessage({"result": "maximum_reward is empty", "code": "1", "is_login": "0"}),
    check.body('program_id').trim().not().isEmpty()
        .withMessage({"result": "program_id is empty", "code": "2", "is_login": "0"}),
], async (req, res) => {
    try {
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else {
            let user = company.get('companyUser');
            let program_id = safeString(req.body.program_id);
            let maximum_reward = toNumber(req.body.maximum_reward);
            const is_program_owner = await model.hasAccessToProgram(user, program_id);
            if (!is_program_owner) {
                return res.json({
                    "result": "program_id is invalid or you don't have access to it!",
                    "code": "1",
                    "is_login": "0"
                });
            }
            let currentProgram2 = await model.getRow(getUserId(user), program_id);
            if (currentProgram2.status !== 0 && currentProgram2.status !== 3) {
                res.json({"result": "program can not edit", "code": "4", "is_login": "0"});
                return;
            }
            let save = await model.save_maximum_reward(getUserId(user), program_id, maximum_reward, currentProgram2, user._id);
            let currentProgram = await model.getRow(getUserId(user), program_id);
            res.json({"result": currentProgram, "code": "0", "is_login": "0"});
        }
    } catch (e) {
        if (isSentry)
            Sentry.captureException(e);
        if (isDebug)
            res.status(500).json({"result": e.toString()});
        else
            res.status(500).json({"result": "Internal Server Error!"});
    }

});

/**
 * @swagger
 * /company/program/list_program/:
 *   get:
 *     tags:
 *       - company - program
 *     description: list_program
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : page
 *         type : string
 *         in: query
 *         description : page
 *       - name : status
 *         type : string
 *         in: query
 *         description : filter by status 2-> Accept , other value (0,1,3,4) => In progress - Pending - Reject - Close
 *       - name : is_next_generation
 *         type : number
 *         in: query
 *         description : filter by is_next_generation 1  , 2 classic pentest or bug bounty 0
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
 *               {"code":"0","result":{obj},"is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.get('/list_program', isAuth, hasPermission(RESOURCE.PROGRAM, ACTIONS.READ), async (req, res) => {
    try {
        let user = company.get('companyUser');
        gSortColumns = ['_id'];
        let status = toNumber(req.query.status);
        let is_next_generation = toNumber(req.query.is_next_generation);
        let resultPagination = await model.getProgramList(getUserId(user), status, is_next_generation, user.parent_user_id, user.access_program_list);
        res.json({"result": resultPagination, "code": "0", "is_login": "0"});
    } catch (e) {
        if (isSentry)
            Sentry.captureException(e);
        if (isDebug)
            res.status(500).json({"result": e.toString()});
        else
            res.status(500).json({"result": "Internal Server Error!"});
    }

});

/**
 * @swagger
 * /company/program/save_all_reward:
 *   post:
 *     tags:
 *       - company - program
 *     description: program save all reward
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : program_id
 *         type : string
 *         in: formData
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
 *               {"code":"1","result":"program_id is empty","is_login":"0"}
 *               {"code":"2","result":"currency_id is empty","is_login":"0"}
 *               {"code":"3","result":"critical_price is empty","is_login":"0"}
 *               {"code":"4","result":"high_price is empty","is_login":"0"}
 *               {"code":"5","result":"medium_price is empty","is_login":"0"}
 *               {"code":"6","result":"low_price is empty","is_login":"0"}
 *               {"code":"7","result":"none_price is empty","is_login":"0"}
 *               {"code":"8","result":"currency not found!","is_login":"0"}
 *               {"code":"9","result":"critical_price value not negative!","is_login":"0"}
 *               {"code":"10","result":"high_price value not negative!","is_login":"0"}
 *               {"code":"11","result":"medium_price value not negative!","is_login":"0"}
 *               {"code":"12","result":"low_price value not negative!","is_login":"0"}
 *               {"code":"13","result":"none_price value not negative!","is_login":"0"}
 *               {"code":"14","result":"program_id is invalid","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/save_all_reward', isAuth, hasPermission(RESOURCE.PROGRAM, ACTIONS.CREATE), uploader.none(), [
    check.body('program_id').trim().not().isEmpty()
        .withMessage({"result": "program_id is empty", "code": "1", "is_login": "0"}),
    check.body('currency_id').trim().not().isEmpty()
        .withMessage({"result": "currency_id is empty", "code": "2", "is_login": "0"}),
    check.body('critical_price').trim().not().isEmpty()
        .withMessage({"result": "critical_price is empty", "code": "3", "is_login": "0"}),
    check.body('high_price').trim().not().isEmpty()
        .withMessage({"result": "high_price is empty", "code": "4", "is_login": "0"}),
    check.body('medium_price').trim().not().isEmpty()
        .withMessage({"result": "medium_price is empty", "code": "5", "is_login": "0"}),
    check.body('low_price').trim().not().isEmpty()
        .withMessage({"result": "low_price is empty", "code": "6", "is_login": "0"}),
    check.body('none_price').trim().not().isEmpty()
        .withMessage({"result": "none_price is empty", "code": "7", "is_login": "0"}),

], async (req, res) => {
    try {
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else {
            let user = company.get('companyUser');
            const program_id = safeString(req.body.program_id);
            const currency_id = safeString(req.body.currency_id);
            const critical_price = toNumber(req.body.critical_price);
            const high_price = toNumber(req.body.high_price);
            const medium_price = toNumber(req.body.medium_price);
            const low_price = toNumber(req.body.low_price);
            const none_price = toNumber(req.body.none_price);
            const is_program_owner = await model.hasAccessToProgram(user, program_id);
            if (!is_program_owner) {
                return res.json({
                    "result": "program_id is invalid or you don't have access to it!",
                    "code": "1",
                    "is_login": "0"
                });
            }
            let currentProgram2 = await model.getRow(getUserId(user), program_id);
            if (currentProgram2.status !== 0 && currentProgram2.status !== 3) {
                res.json({"result": "program can not edit", "code": "15", "is_login": "0"});
                return;
            }
            //check currency_id is valid?
            let currency = await model.getCurrency(currency_id);
            if (currency == 0) {
                res.json({"result": "currency not found!", "code": "8", "is_login": "0"});
                return;
            }

            if (critical_price < 0) {
                res.json({"result": "critical_price value not negative!", "code": "9", "is_login": "0"});
                return;
            }

            if (high_price < 0) {
                res.json({"result": "high_price value not negative!", "code": "10", "is_login": "0"});
                return;
            }

            if (medium_price < 0) {
                res.json({"result": "medium_price value not negative!", "code": "11", "is_login": "0"});
                return;
            }

            if (low_price < 0) {
                res.json({"result": "low_price value not negative!", "code": "12", "is_login": "0"});
                return;
            }

            if (none_price < 0) {
                res.json({"result": "none_price value not negative!", "code": "13", "is_login": "0"});
                return;
            }

            //set all reward
            let result = await model.saveAllReward(getUserId(user)
                , program_id, currency_id, critical_price
                , high_price, medium_price, low_price, none_price, currentProgram2, user._id);
            let currentProgram = await model.getRow(getUserId(user), program_id);
            if (result !== 1) {
                return res.json({"result": "program is invalid", "code": "5", "is_login": "0"});
            }
            res.json({"result": currentProgram, "code": "0", "is_login": "0"});
        }
    } catch (e) {
        if (isSentry)
            Sentry.captureException(e);
        if (isDebug)
            res.status(500).json({"result": e.toString()});
        else
            res.status(500).json({"result": "Internal Server Error!"});
    }

});

/**
 * @swagger
 * /company/program/add_reward:
 *   post:
 *     tags:
 *       - company - program
 *     description: program add reward
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : program_id
 *         type : string
 *         in: formData
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
 *               {"code":"1","result":"program_id is empty","is_login":"0"}
 *               {"code":"2","result":"target_id is empty","is_login":"0"}
 *               {"code":"3","result":"currency_id is empty","is_login":"0"}
 *               {"code":"4","result":"critical_price is empty","is_login":"0"}
 *               {"code":"5","result":"high_price is empty","is_login":"0"}
 *               {"code":"6","result":"medium_price is empty","is_login":"0"}
 *               {"code":"7","result":"low_price is empty","is_login":"0"}
 *               {"code":"8","result":"none_price is empty","is_login":"0"}
 *               {"code":"9","result":"currency not found!","is_login":"0"}
 *               {"code":"10","result":"critical_price value not negative!","is_login":"0"}
 *               {"code":"11","result":"high_price value not negative!","is_login":"0"}
 *               {"code":"12","result":"medium_price value not negative!","is_login":"0"}
 *               {"code":"13","result":"low_price value not negative!","is_login":"0"}
 *               {"code":"14","result":"none_price value not negative!","is_login":"0"}
 *               {"code":"15","result":"program_id is invalid","is_login":"0"}
 *               {"code":"16","result":"target_id is invalid","is_login":"0"}
 *               {"code":"17","result":"reward for this target exists!","is_login":"0"}
 *               {"code":"18","result":"program can not edit","is_login":"0"}
 *               {"code":"19","result":"this is type can not add reward","is_login":"0"}
 *               {"code":"20","result":"currency not valid","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/add_reward', isAuth, hasPermission(RESOURCE.PROGRAM, ACTIONS.CREATE), uploader.none(), [
    check.body('program_id').trim().not().isEmpty()
        .withMessage({"result": "program_id is empty", "code": "1", "is_login": "0"}),
    check.body('target_id').trim().not().isEmpty()
        .withMessage({"result": "target_id is empty", "code": "2", "is_login": "0"}),
    check.body('currency_id').trim().not().isEmpty()
        .withMessage({"result": "currency_id is empty", "code": "3", "is_login": "0"}),
    check.body('critical_price').trim().not().isEmpty()
        .withMessage({"result": "critical_price is empty", "code": "4", "is_login": "0"}),
    check.body('high_price').trim().not().isEmpty()
        .withMessage({"result": "high_price is empty", "code": "5", "is_login": "0"}),
    check.body('medium_price').trim().not().isEmpty()
        .withMessage({"result": "medium_price is empty", "code": "6", "is_login": "0"}),
    check.body('low_price').trim().not().isEmpty()
        .withMessage({"result": "low_price is empty", "code": "7", "is_login": "0"}),
    check.body('none_price').trim().not().isEmpty()
        .withMessage({"result": "none_price is empty", "code": "8", "is_login": "0"}),

], async (req, res) => {
    try {
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else {
            let user = company.get('companyUser');
            let program_id = safeString(req.body.program_id);
            const is_program_owner = await model.hasAccessToProgram(user, program_id);
            if (!is_program_owner) {
                return res.json({
                    "result": "program_id is invalid or you don't have access to it!",
                    "code": "1",
                    "is_login": "0"
                });
            }
            let target_id = safeString(req.body.target_id);
            let currency_id = safeString(req.body.currency_id);
            let critical_price = toNumber(req.body.critical_price);
            let high_price = toNumber(req.body.high_price);
            let medium_price = toNumber(req.body.medium_price);
            let low_price = toNumber(req.body.low_price);
            let none_price = toNumber(req.body.none_price);
            let currentProgram2 = await model.getRow(getUserId(user), program_id);
            if (currentProgram2.rewards && isArray(currentProgram2.rewards) && currentProgram2.rewards.length > 0) {
                const currency_ids = currentProgram2.rewards.map(d => d.currency_id._id);
                const is_same_currency = currency_ids.every(id => id.toString() === currency_id);
                if (!is_same_currency) {
                    return res.json({"result": "currency not valid", "code": "20", "is_login": "0"});
                }
            }
            if (currentProgram2.is_next_generation == 2) {
                res.json({"result": "this is type can not add reward", "code": "19", "is_login": "0"});
                return;
            }
            if (currentProgram2.status !== 0 && currentProgram2.status !== 3) {
                res.json({"result": "program can not edit", "code": "18", "is_login": "0"});
                return;
            }
            //check currency_id is valid?
            let currency = await model.getCurrency(currency_id);
            if (currency == 0) {
                res.json({"result": "currency not found!", "code": "9", "is_login": "0"});
                return;
            }

            if (critical_price < 0) {
                res.json({"result": "critical_price value not negative!", "code": "10", "is_login": "0"});
                return;
            }

            if (high_price < 0) {
                res.json({"result": "high_price value not negative!", "code": "11", "is_login": "0"});
                return;
            }

            if (medium_price < 0) {
                res.json({"result": "medium_price value not negative!", "code": "12", "is_login": "0"});
                return;
            }

            if (low_price < 0) {
                res.json({"result": "low_price value not negative!", "code": "13", "is_login": "0"});
                return;
            }

            if (none_price < 0) {
                res.json({"result": "none_price value not negative!", "code": "14", "is_login": "0"});
                return;
            }

            //append rewards item for per target
            let checkTarget = await model.checkTarget(getUserId(user), program_id, target_id);
            if (checkTarget > 0) {
                let resultChcekReward = await model.checkExistsReward(getUserId(user)
                    , program_id, target_id);
                if (resultChcekReward == 0) {
                    await model.addReward(getUserId(user), program_id
                        , target_id, currency_id, critical_price
                        , high_price, medium_price, low_price, none_price, currentProgram2, user._id);
                    let currentProgram = await model.getRow(getUserId(user), program_id);
                    res.json({"result": currentProgram, "code": "0", "is_login": "0"});
                } else {
                    res.json({"result": "reward for this target exists!", "code": "17", "is_login": "0"});
                }
            } else {
                res.json({"result": "target_id is invalid", "code": "16", "is_login": "0"});
            }
        }
    } catch (e) {
        if (isSentry)
            Sentry.captureException(e);
        if (isDebug)
            res.status(500).json({"result": e.toString()});
        else
            res.status(500).json({"result": "Internal Server Error!"});
    }

});

/**
 * @swagger
 * /company/program/edit_reward:
 *   post:
 *     tags:
 *       - company - program
 *     description: program edit for reward
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : program_id
 *         type : string
 *         in: formData
 *         description : program_id
 *         required : true
 *       - name : target_id
 *         type : string
 *         in: formData
 *         description: target_id
 *         required : true
 *       - name : reward_id
 *         type : string
 *         in: formData
 *         description: reward_id
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
 *               {"code":"1","result":"program_id is empty","is_login":"0"}
 *               {"code":"2","result":"target_id is empty","is_login":"0"}
 *               {"code":"3","result":"reward_id is empty","is_login":"0"}
 *               {"code":"4","result":"currency_id is empty","is_login":"0"}
 *               {"code":"5","result":"critical_price is empty","is_login":"0"}
 *               {"code":"6","result":"high_price is empty","is_login":"0"}
 *               {"code":"7","result":"medium_price is empty","is_login":"0"}
 *               {"code":"8","result":"low_price is empty","is_login":"0"}
 *               {"code":"9","result":"none_price is empty","is_login":"0"}
 *               {"code":"10","result":"currency not found!","is_login":"0"}
 *               {"code":"11","result":"critical_price value not negative!","is_login":"0"}
 *               {"code":"12","result":"high_price value not negative!","is_login":"0"}
 *               {"code":"13","result":"medium_price value not negative!","is_login":"0"}
 *               {"code":"14","result":"low_price value not negative!","is_login":"0"}
 *               {"code":"15","result":"none_price value not negative!","is_login":"0"}
 *               {"code":"16","result":"program_id is invalid","is_login":"0"}
 *               {"code":"17","result":"target_id is invalid","is_login":"0"}
 *               {"code":"18","result":"reward_id is invalid","is_login":"0"}
 *               {"code":"19","result":"reward for this target exists!","is_login":"0"}
 *               {"code":"20","result":"program can not edit","is_login":"0"}
 *               {"code":"21","result":"this is type can not add reward","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/edit_reward', isAuth, hasPermission(RESOURCE.PROGRAM, ACTIONS.UPDATE), uploader.none(), [
    check.body('program_id').trim().not().isEmpty()
        .withMessage({"result": "program_id is empty", "code": "1", "is_login": "0"}),
    check.body('target_id').trim().not().isEmpty()
        .withMessage({"result": "target_id is empty", "code": "2", "is_login": "0"}),
    check.body('reward_id').trim().not().isEmpty()
        .withMessage({"result": "reward_id is empty", "code": "3", "is_login": "0"}),
    check.body('currency_id').trim().not().isEmpty()
        .withMessage({"result": "currency_id is empty", "code": "4", "is_login": "0"}),
    check.body('critical_price').trim().not().isEmpty()
        .withMessage({"result": "critical_price is empty", "code": "5", "is_login": "0"}),
    check.body('high_price').trim().not().isEmpty()
        .withMessage({"result": "high_price is empty", "code": "6", "is_login": "0"}),
    check.body('medium_price').trim().not().isEmpty()
        .withMessage({"result": "medium_price is empty", "code": "7", "is_login": "0"}),
    check.body('low_price').trim().not().isEmpty()
        .withMessage({"result": "low_price is empty", "code": "8", "is_login": "0"}),
    check.body('none_price').trim().not().isEmpty()
        .withMessage({"result": "none_price is empty", "code": "9", "is_login": "0"}),

], async (req, res) => {
    try {
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else {
            let user = company.get('companyUser');
            const program_id = safeString(req.body.program_id);
            const is_program_owner = await model.hasAccessToProgram(user, program_id);
            if (!is_program_owner) {
                return res.json({
                    "result": "program_id is invalid or you don't have access to it!",
                    "code": "1",
                    "is_login": "0"
                });
            }
            const target_id = safeString(req.body.target_id);
            const reward_id = safeString(req.body.reward_id);
            const currency_id = safeString(req.body.currency_id);
            const critical_price = toNumber(req.body.critical_price);
            const high_price = toNumber(req.body.high_price);
            const medium_price = toNumber(req.body.medium_price);
            const low_price = toNumber(req.body.low_price);
            const none_price = toNumber(req.body.none_price);
            let currentProgram2 = await model.getRow(getUserId(user), program_id);
            if (currentProgram2.is_next_generation == 2) {
                res.json({"result": "this is type can not add reward", "code": "21", "is_login": "0"});
                return;
            }
            if (currentProgram2.status !== 0 && currentProgram2.status !== 3) {
                res.json({"result": "program can not edit", "code": "20", "is_login": "0"});
                return;
            }

            //check currency_id is valid?
            let currency = await model.getCurrency(currency_id);
            if (currency == 0) {
                res.json({"result": "currency not found!", "code": "10", "is_login": "0"});
                return;
            }

            if (critical_price < 0) {
                res.json({"result": "critical_price value not negative!", "code": "11", "is_login": "0"});
                return;
            }

            if (high_price < 0) {
                res.json({"result": "high_price value not negative!", "code": "12", "is_login": "0"});
                return;
            }

            if (medium_price < 0) {
                res.json({"result": "medium_price value not negative!", "code": "13", "is_login": "0"});
                return;
            }

            if (low_price < 0) {
                res.json({"result": "low_price value not negative!", "code": "14", "is_login": "0"});
                return;
            }

            if (none_price < 0) {
                res.json({"result": "none_price value not negative!", "code": "15", "is_login": "0"});
                return;
            }

            //append rewards item for per target
            let checkTarget = await model.checkTarget(getUserId(user), program_id, target_id);
            if (checkTarget > 0) {
                let save_reward_result = await model.saveReward(getUserId(user), program_id, reward_id
                    , target_id, currency_id, critical_price
                    , high_price, medium_price, low_price, none_price, currentProgram2.targets, currentProgram2.rewards, user._id);
                if (save_reward_result === 3) {
                    return res.json({"result": "reward_id is invalid", "code": "18", "is_login": "0"});
                } else if (save_reward_result === 2) {
                    return res.json({"result": "reward for this target exists!", "code": "19", "is_login": "0"});
                } else {
                    let currentProgram = await model.getRow(getUserId(user), program_id);
                    res.json({"result": currentProgram, "code": "0", "is_login": "0"});
                }
            } else {
                res.json({"result": "target_id is invalid", "code": "17", "is_login": "0"});
            }
        }
    } catch (e) {
        if (isSentry)
            Sentry.captureException(e);
        if (isDebug)
            res.status(500).json({"result": e.toString()});
        else
            res.status(500).json({"result": "Internal Server Error!"});
    }

});

/**
 * @swagger
 * /company/program/delete_reward:
 *   delete:
 *     tags:
 *       - company - program
 *     description: delete reward
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : program_id
 *         type : string
 *         in: formData
 *         description : program_id
 *         required : true
 *       - name : reward_id
 *         type : string
 *         in: formData
 *         description : reward_id
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
 *               {"code":"1","result":"program_id is empty","is_login":"0"}
 *               {"code":"2","result":"reward_id is empty","is_login":"0"}
 *               {"code":"3","result":"delete error","is_login":"0"}
 *               {"code":"4","result":"program_id is invalid","is_login":"0"}
 *               {"code":"5","result":"program can not edit","is_login":"0"}
 *               {"code":"6","result":"this is type can not add reward","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.delete('/delete_reward', isAuth, hasPermission(RESOURCE.PROGRAM, ACTIONS.DELETE), uploader.none(), [
    check.body('program_id').trim().not().isEmpty()
        .withMessage({"result": "program_id is empty", "code": "1", "is_login": "0"}),
    check.body('reward_id').trim().not().isEmpty()
        .withMessage({"result": "reward_id is empty", "code": "2", "is_login": "0"}),
], async (req, res) => {
    try {
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else {
            let user = company.get('companyUser');
            const program_id = safeString(req.body.program_id);
            const is_program_owner = await model.hasAccessToProgram(user, program_id);
            if (!is_program_owner) {
                return res.json({
                    "result": "program_id is invalid or you don't have access to it!",
                    "code": "1",
                    "is_login": "0"
                });
            }
            const reward_id = safeString(req.body.reward_id);
            let currentProgram = await model.getRow(getUserId(user), program_id);
            if (currentProgram && checkKey(currentProgram.toObject(), '_id')) {
                if (currentProgram.is_next_generation == 2) {
                    res.json({"result": "this is type can not add reward", "code": "6", "is_login": "0"});
                    return;
                }
                if (currentProgram.status !== 0 && currentProgram.status !== 3) {
                    res.json({"result": "program can not edit", "code": "5", "is_login": "0"});
                    return;
                }
                let delReward = await model.deleteReward(getUserId(user), program_id, reward_id, user._id, currentProgram);
                if (delReward == 1) {
                    let currentProgram2 = await model.getRow(getUserId(user), program_id);
                    res.json({"result": currentProgram2, "code": "0", "is_login": "0"});
                } else {
                    res.json({"result": "delete error!", "code": "3", "is_login": "0"});
                }
            } else {
                res.json({"result": "program_id is invalid", "code": "4", "is_login": "0"});
            }
        }
    } catch (e) {
        if (isSentry)
            Sentry.captureException(e);
        if (isDebug)
            res.status(500).json({"result": e.toString()});
        else
            res.status(500).json({"result": "Internal Server Error!"});
    }

});

/**
 * @swagger
 * /company/program/save_all_policy:
 *   post:
 *     tags:
 *       - company - program
 *     description: program save all policy
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : program_id
 *         type : string
 *         in: formData
 *         description : program_id
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
 *               {"code":"1","result":"program_id is empty","is_login":"0"}
 *               {"code":"2","result":"target_information is empty","is_login":"0"}
 *               {"code":"3","result":"qualifying_vulnerabilities is empty","is_login":"0"}
 *               {"code":"4","result":"non_qualifying_vulnerabilities is empty","is_login":"0"}
 *               {"code":"5","result":"program_id is invalid","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/save_all_policy', isAuth, hasPermission(RESOURCE.PROGRAM, ACTIONS.CREATE), uploader.none(), [
    check.body('program_id').trim().not().isEmpty()
        .withMessage({"result": "program_id is empty", "code": "1", "is_login": "0"}),
    check.body('target_information').trim().not().isEmpty()
        .withMessage({"result": "target_information is empty", "code": "2", "is_login": "0"}),
], async (req, res) => {
    try {
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else {
            let user = company.get('companyUser');
            const program_id = safeString(req.body.program_id);
            const is_program_owner = await model.hasAccessToProgram(user, program_id);
            if (!is_program_owner) {
                return res.json({
                    "result": "program_id is invalid or you don't have access to it!",
                    "code": "1",
                    "is_login": "0"
                });
            }
            const out_of_target = safeString(req.body.out_of_target);
            let item1 = safeString(req.body.item1);
            item1 = (item1 === "true") ? true : false;
            let item2 = safeString(req.body.item2);
            item2 = (item2 === "true") ? true : false;
            let item3 = safeString(req.body.item3);
            item3 = (item3 === "true") ? true : false;
            let target_information = cleanXSS(req.body.target_information);
            target_information = safeString(target_information);
            let currentProgram2 = await model.getRow(getUserId(user), program_id);
            if (currentProgram2.status !== 0 && currentProgram2.status !== 3) {
                res.json({"result": "program can not edit", "code": "6", "is_login": "0"});
                return;
            }
            let qualifying_vulnerabilities = '';
            let non_qualifying_vulnerabilities = '';

            if (currentProgram2.is_next_generation != 2) {
                if (req.body.qualifying_vulnerabilities == '') {
                    res.json({"result": "qualifying_vulnerabilities is empty", "code": "3", "is_login": "0"});
                    return;
                }
                if (req.body.non_qualifying_vulnerabilities == '') {
                    res.json({"result": "non_qualifying_vulnerabilities is empty", "code": "4", "is_login": "0"});
                    return;
                }
                qualifying_vulnerabilities = cleanXSS(req.body.qualifying_vulnerabilities);
                qualifying_vulnerabilities = safeString(qualifying_vulnerabilities);

                non_qualifying_vulnerabilities = cleanXSS(req.body.non_qualifying_vulnerabilities);
                non_qualifying_vulnerabilities = safeString(non_qualifying_vulnerabilities);
            }

            //save all policy
            let result = await model.saveAllPolicy(getUserId(user)
                , program_id, out_of_target, item1, item2, item3
                , target_information, qualifying_vulnerabilities
                , non_qualifying_vulnerabilities, currentProgram2, user._id);
            if (result !== 1) {
                return res.json({"result": "program_id is invalid", "code": "5", "is_login": "0"});
            }
            let currentProgram = await model.getRow(getUserId(user), program_id);
            res.json({"result": currentProgram, "code": "0", "is_login": "0"});
        }
    } catch (e) {
        if (isSentry)
            Sentry.captureException(e);
        if (isDebug)
            res.status(500).json({"result": e.toString()});
        else
            res.status(500).json({"result": "Internal Server Error!"});
    }

});

/**
 * @swagger
 * /company/program/add_policy:
 *   post:
 *     tags:
 *       - company - program
 *     description: program add policy
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : program_id
 *         type : string
 *         in: formData
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
 *               {"code":"1","result":"program_id is empty","is_login":"0"}
 *               {"code":"2","result":"target_id is empty","is_login":"0"}
 *               {"code":"3","result":"target_information is empty","is_login":"0"}
 *               {"code":"4","result":"qualifying_vulnerabilities is empty","is_login":"0"}
 *               {"code":"5","result":"non_qualifying_vulnerabilities is empty","is_login":"0"}
 *               {"code":"6","result":"program_id is invalid","is_login":"0"}
 *               {"code":"7","result":"target_id is invalid","is_login":"0"}
 *               {"code":"8","result":"policy for this target exists!","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/add_policy', isAuth, hasPermission(RESOURCE.PROGRAM, ACTIONS.CREATE), uploader.none(), [
    check.body('program_id').trim().not().isEmpty()
        .withMessage({"result": "program_id is empty", "code": "1", "is_login": "0"}),
    check.body('target_id').trim().not().isEmpty()
        .withMessage({"result": "target_id is empty", "code": "2", "is_login": "0"}),
    check.body('target_information').trim().not().isEmpty()
        .withMessage({"result": "target_information is empty", "code": "3", "is_login": "0"}),
], async (req, res) => {
    try {
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else {
            let user = company.get('companyUser');
            const program_id = safeString(req.body.program_id);
            const is_program_owner = await model.hasAccessToProgram(user, program_id);
            if (!is_program_owner) {
                return res.json({
                    "result": "program_id is invalid or you don't have access to it!",
                    "code": "1",
                    "is_login": "0"
                });
            }
            const target_id = safeString(req.body.target_id);
            const out_of_target = safeString(req.body.out_of_target);
            let item1 = safeString(req.body.item1);
            item1 = (item1 === "true") ? true : false;
            let item2 = safeString(req.body.item2);
            item2 = (item2 === "true") ? true : false;
            let item3 = safeString(req.body.item3);
            item3 = (item3 === "true") ? true : false;
            let target_information = cleanXSS(req.body.target_information);
            target_information = safeString(target_information);
            let currentProgram2 = await model.getRow(getUserId(user), program_id);
            if (currentProgram2.status !== 0 && currentProgram2.status !== 3) {
                res.json({"result": "program can not edit", "code": "9", "is_login": "0"});
                return;
            }

            let qualifying_vulnerabilities = '';
            let non_qualifying_vulnerabilities = '';

            if (currentProgram2.is_next_generation != 2) {
                if (req.body.qualifying_vulnerabilities == '') {
                    res.json({"result": "qualifying_vulnerabilities is empty", "code": "3", "is_login": "0"});
                    return;
                }
                if (req.body.non_qualifying_vulnerabilities == '') {
                    res.json({"result": "non_qualifying_vulnerabilities is empty", "code": "4", "is_login": "0"});
                    return;
                }
                qualifying_vulnerabilities = cleanXSS(req.body.qualifying_vulnerabilities);
                qualifying_vulnerabilities = safeString(qualifying_vulnerabilities);

                non_qualifying_vulnerabilities = cleanXSS(req.body.non_qualifying_vulnerabilities);
                non_qualifying_vulnerabilities = safeString(non_qualifying_vulnerabilities);
            }


            //append policy item for per target
            let checkTarget = await model.checkTarget(getUserId(user), program_id, target_id);
            if (checkTarget > 0) {
                let resultChcekPolicy = await model.checkExistsPolicy(getUserId(user)
                    , program_id, target_id);
                if (resultChcekPolicy == 0) {
                    let add_policy_result = await model.addPolicy(getUserId(user), program_id
                        , target_id, out_of_target, item1, item2, item3
                        , target_information, qualifying_vulnerabilities
                        , non_qualifying_vulnerabilities, currentProgram2, user._id);
                    let currentProgram = await model.getRow(getUserId(user), program_id);
                    res.json({"result": currentProgram, "code": "0", "is_login": "0"});
                } else {
                    res.json({"result": "policy for this target exists!", "code": "8", "is_login": "0"});
                }
            } else {
                res.json({"result": "target_id is invalid", "code": "7", "is_login": "0"});
            }
        }
    } catch (e) {
        if (isSentry)
            Sentry.captureException(e);
        if (isDebug)
            res.status(500).json({"result": e.toString()});
        else
            res.status(500).json({"result": "Internal Server Error!"});
    }

});

/**
 * @swagger
 * /company/program/edit_policy:
 *   post:
 *     tags:
 *       - company - program
 *     description: program edit for policy
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : program_id
 *         type : string
 *         in: formData
 *         description : program_id
 *         required : true
 *       - name : target_id
 *         type : string
 *         in: formData
 *         description: target_id
 *         required : true
 *       - name : policy_id
 *         type : string
 *         in: formData
 *         description: policy_id
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
 *               {"code":"1","result":"program_id is empty","is_login":"0"}
 *               {"code":"2","result":"target_id is empty","is_login":"0"}
 *               {"code":"3","result":"policy_id is empty","is_login":"0"}
 *               {"code":"4","result":"target_information is empty","is_login":"0"}
 *               {"code":"5","result":"qualifying_vulnerabilities is empty","is_login":"0"}
 *               {"code":"6","result":"non_qualifying_vulnerabilities is empty","is_login":"0"}
 *               {"code":"7","result":"program_id is invalid","is_login":"0"}
 *               {"code":"8","result":"target_id is invalid","is_login":"0"}
 *               {"code":"9","result":"policy_id is invalid","is_login":"0"}
 *               {"code":"10","result":"policy for this target exists!","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/edit_policy', isAuth, hasPermission(RESOURCE.PROGRAM, ACTIONS.UPDATE), uploader.none(), [
    check.body('program_id').trim().not().isEmpty()
        .withMessage({"result": "program_id is empty", "code": "1", "is_login": "0"}),
    check.body('target_id').trim().not().isEmpty()
        .withMessage({"result": "target_id is empty", "code": "2", "is_login": "0"}),
    check.body('policy_id').trim().not().isEmpty()
        .withMessage({"result": "policy_id is empty", "code": "3", "is_login": "0"}),
    check.body('target_information').trim().not().isEmpty()
        .withMessage({"result": "target_information is empty", "code": "4", "is_login": "0"}),
], async (req, res) => {
    try {
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else {
            let user = company.get('companyUser');
            const program_id = safeString(req.body.program_id);
            const is_program_owner = await model.hasAccessToProgram(user, program_id);
            if (!is_program_owner) {
                return res.json({
                    "result": "program_id is invalid or you don't have access to it!",
                    "code": "1",
                    "is_login": "0"
                });
            }
            const target_id = safeString(req.body.target_id);
            const policy_id = safeString(req.body.policy_id);
            const out_of_target = safeString(req.body.out_of_target);
            let item1 = safeString(req.body.item1);
            item1 = (item1 === "true") ? true : false;
            let item2 = safeString(req.body.item2);
            item2 = (item2 === "true") ? true : false;
            let item3 = safeString(req.body.item3);
            item3 = (item3 === "true") ? true : false;
            let target_information = cleanXSS(req.body.target_information);
            target_information = safeString(target_information);
            let currentProgram2 = await model.getRow(getUserId(user), program_id);
            if (currentProgram2.status !== 0 && currentProgram2.status !== 3) {
                res.json({"result": "program can not edit", "code": "11", "is_login": "0"});
                return;
            }

            let qualifying_vulnerabilities = '';
            let non_qualifying_vulnerabilities = '';

            if (currentProgram2.is_next_generation != 2) {
                if (req.body.qualifying_vulnerabilities == '') {
                    res.json({"result": "qualifying_vulnerabilities is empty", "code": "3", "is_login": "0"});
                    return;
                }
                if (req.body.non_qualifying_vulnerabilities == '') {
                    res.json({"result": "non_qualifying_vulnerabilities is empty", "code": "4", "is_login": "0"});
                    return;
                }
                qualifying_vulnerabilities = cleanXSS(req.body.qualifying_vulnerabilities);
                qualifying_vulnerabilities = safeString(qualifying_vulnerabilities);

                non_qualifying_vulnerabilities = cleanXSS(req.body.non_qualifying_vulnerabilities);
                non_qualifying_vulnerabilities = safeString(non_qualifying_vulnerabilities);
            }

            //append policy item for per target
            let checkTarget = await model.checkTarget(getUserId(user), program_id, target_id);
            if (checkTarget > 0) {
                let save_policy_result = await model.savePolicy(getUserId(user), program_id, policy_id
                    , target_id, out_of_target, item1, item2, item3
                    , target_information, qualifying_vulnerabilities
                    , non_qualifying_vulnerabilities, currentProgram2.targets, currentProgram2.policies, user._id);
                if (save_policy_result === 1) {
                    return res.json({"result": "policy_id is invalid", "code": "9", "is_login": "0"});
                } else if (save_policy_result === 2) {
                    return res.json({"result": "policy not exist", "code": "10", "is_login": "0"});
                } else if (save_policy_result === 3) {
                    return res.json({"result": "policy for this target exists!", "code": "10", "is_login": "0"});
                } else {
                    let currentProgram = await model.getRow(getUserId(user), program_id);
                    res.json({"result": currentProgram, "code": "0", "is_login": "0"});
                }
            } else {
                res.json({"result": "target_id is invalid", "code": "8", "is_login": "0"});
            }
        }
    } catch (e) {
        if (isSentry)
            Sentry.captureException(e);
        if (isDebug)
            res.status(500).json({"result": e.toString()});
        else
            res.status(500).json({"result": "Internal Server Error!"});
    }

});

/**
 * @swagger
 * /company/program/delete_policy:
 *   delete:
 *     tags:
 *       - company - program
 *     description: delete policy
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : program_id
 *         type : string
 *         in: formData
 *         description : program_id
 *         required : true
 *       - name : policy_id
 *         type : string
 *         in: formData
 *         description : policy_id
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
 *               {"code":"1","result":"program_id is empty","is_login":"0"}
 *               {"code":"2","result":"policy_id is empty","is_login":"0"}
 *               {"code":"3","result":"delete error","is_login":"0"}
 *               {"code":"4","result":"program_id is invalid","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.delete('/delete_policy', isAuth, hasPermission(RESOURCE.PROGRAM, ACTIONS.DELETE), uploader.none(), [
    check.body('program_id').trim().not().isEmpty()
        .withMessage({"result": "program_id is empty", "code": "1", "is_login": "0"}),
    check.body('policy_id').trim().not().isEmpty()
        .withMessage({"result": "policy_id is empty", "code": "2", "is_login": "0"}),
], async (req, res) => {
    try {
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else {
            let user = company.get('companyUser');
            const program_id = safeString(req.body.program_id);
            const is_program_owner = await model.hasAccessToProgram(user, program_id);
            if (!is_program_owner) {
                return res.json({
                    "result": "program_id is invalid or you don't have access to it!",
                    "code": "1",
                    "is_login": "0"
                });
            }
            const policy_id = safeString(req.body.policy_id);
            let currentProgram = await model.getRow(getUserId(user), program_id);
            if (currentProgram && checkKey(currentProgram.toObject(), '_id')) {
                if (currentProgram.status !== 0 && currentProgram.status !== 3) {
                    res.json({"result": "program can not edit", "code": "5", "is_login": "0"});
                    return;
                }
                let del = await model.deletePolicy(getUserId(user), program_id, policy_id, user._id, currentProgram);
                if (del == 1) {
                    let currentProgram2 = await model.getRow(getUserId(user), program_id);
                    res.json({"result": currentProgram2, "code": "0", "is_login": "0"});
                } else {
                    res.json({"result": "delete error!", "code": "3", "is_login": "0"});
                }
            } else {
                res.json({"result": "program_id is invalid", "code": "4", "is_login": "0"});
            }
        }
    } catch (e) {
        if (isSentry)
            Sentry.captureException(e);
        if (isDebug)
            res.status(500).json({"result": e.toString()});
        else
            res.status(500).json({"result": "Internal Server Error!"});
    }

});

/**
 * @swagger
 * /company/program/save_launch_timeline:
 *   post:
 *     tags:
 *       - company - program
 *     description: save launch timeline program
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : launch_timeline
 *         type : string
 *         in: formData
 *         description : 0 1 2
 *         required : true
 *       - name : program_id
 *         type : string
 *         in: formData
 *         description : program_id
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
 *               {"code":"1","result":"launch_timeline is empty","is_login":"0"}
 *               {"code":"2","result":"program_id is empty","is_login":"0"}
 *               {"code":"3","result":"program_id is invalid","is_login":"0"}
 *               {"code":"4","result":"display_name in user profile is empty","is_login":"0"}
 *               {"code":"5","result":"user not found","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/save_launch_timeline', isAuth, hasPermission(RESOURCE.PROGRAM, ACTIONS.CREATE), uploader.none(), [
    check.body('launch_timeline').trim().not().isEmpty()
        .withMessage({"result": "launch_timeline is empty", "code": "1", "is_login": "0"}),
    check.body('program_id').trim().not().isEmpty()
        .withMessage({"result": "program_id is empty", "code": "2", "is_login": "0"}),
], async (req, res) => {
    try {
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else {
            let user = company.get('companyUser');
            //check program_id for owner
            const program_id = safeString(req.body.program_id);
            const is_program_owner = await model.hasAccessToProgram(user, program_id);
            if (!is_program_owner) {
                return res.json({
                    "result": "program_id is invalid or you don't have access to it!",
                    "code": "1",
                    "is_login": "0"
                });
            }
            let launch_timeline = toNumber(req.body.launch_timeline);
            let currentProgram2 = await model.getRow(getUserId(user), program_id);
            if (currentProgram2.status !== 0 && currentProgram2.status !== 3) {
                res.json({"result": "program can not edit", "code": "4", "is_login": "0"});
                return;
            }
            if (launch_timeline <= -1 || launch_timeline >= 3)
                launch_timeline = 0;
            let result = await model.saveLaunchTimeline(getUserId(user), program_id, launch_timeline, currentProgram2, user._id);
            if (result === 4) {
                return res.json({"result": "display_name in user profile is empty", "code": "4", "is_login": "0"});
            } else if (result === 5) {
                return res.json({"result": "user not found", "code": "5", "is_login": "0"});
            }
            let currentProgram = await model.getRow(getUserId(user), program_id);
            res.json({"result": currentProgram, "code": "0", "is_login": "0"});
        }
    } catch (e) {
        if (isSentry)
            Sentry.captureException(e);
        if (isDebug)
            res.status(500).json({"result": e.toString()});
        else
            res.status(500).json({"result": "Internal Server Error!"});
    }

});

/**
 * @swagger
 * /company/program/invite-hackers:
 *   post:
 *     tags:
 *       - company - program
 *     description:  invite hacker to program
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : expire_day
 *         type : string
 *         in: formData
 *         description : 1 2 3 4 ... 30
 *         required : true
 *       - name : program_id
 *         type : string
 *         in: formData
 *         description : program_id
 *         required : true
 *       - name : hacker_id
 *         type: object
 *         example: ["hacker_id_1", "hacker_id_2", "hacker_id_3"]
 *         in: formData
 *         description : hacker_id
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
 *               {"code":"0","result":"success","is_login":"0"}
 *               {"code":"1","result":"expire_day is empty","is_login":"0"}
 *               {"code":"2","result":"program_id is empty","is_login":"0"}
 *               {"code":"3","result":"program_id is invalid","is_login":"0"}
 *               {"code":"4","result":"program is not private or challenge","is_login":"0"}
 *               {"code":"5","result":"program is not active","is_login":"0"}
 *               {"code":"6","result":"program is not verify","is_login":"0"}
 *               {"code":"7","result":"hacker_id is invalid","is_login":"0"}
 *               {"code":"8","result":"hacker not selected","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/invite-hackers', isAuth, hasPermission(RESOURCE.PROGRAM, ACTIONS.CREATE), uploader.none(), [
    check.body('expire_day').trim().not().isEmpty()
        .withMessage({"result": "expire_day is empty", "code": "1", "is_login": "0"}),
    check.body('program_id').trim().not().isEmpty()
        .withMessage({"result": "program_id is empty", "code": "2", "is_login": "0"}),
], async (req, res) => {
    try {
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else {
            let user = company.get('companyUser');
            const program_id = safeString(req.body.program_id);
            const is_program_owner = await model.hasAccessToProgram(user, program_id);
            if (!is_program_owner) {
                return res.json({
                    "result": "program_id is invalid or you don't have access to it!",
                    "code": "1",
                    "is_login": "0"
                });
            }
            let expire_day = toNumber(req.body.expire_day);
            let hacker_id = JSON.parse(req.body.hacker_id);

            if (expire_day <= 0 || expire_day > 31)
                expire_day = 1;

            let currentProgram = await model.getRow(getUserId(user), program_id);
            if (!currentProgram.is_verify) {
                res.json({"result": "program is not verify", "code": "6", "is_login": "0"});
                return;
            }
            if (currentProgram.program_type == 1) {
                res.json({"result": "program is not private or challenge", "code": "4", "is_login": "0"});
                return;
            }

            if (currentProgram.status != 2) {
                res.json({"result": "program is not accept", "code": "5", "is_login": "0"});
                return;
            }

            if (currentProgram.is_next_generation !== PROGRAM_BOUNTY_TYPE.BUG_BOUNTY) {
                return res.json({
                    "result": "you can not invite hackers for this program",
                    "code": "2",
                    "is_login": "0"
                });
            }

            if (isArray(hacker_id)) {
                var hackers = [];
                for (let h_id of hacker_id) {
                    if (isObjectID(h_id)) {
                        //check hacker
                        h_id = safeString(h_id);
                        let hackerUser = await model.getHackerById(h_id);
                        if (hackerUser) {
                            if (!(isArray(hackerUser.tag) && hackerUser.tag.includes(HACKER_TAGS.INTERNAL_USER))) {
                                hackers.push(hackerUser);
                            }
                        }
                    }
                }

                if (hackers.length > 0) {
                    for (let hacker_final of hackers) {
                        let add = await model.inviteAdd(getUserId(user), program_id, hacker_final, expire_day);
                    }
                    res.json({"result": "success", "code": "0", "is_login": "0"});
                } else {
                    res.json({"result": "hacker not selected", "code": "8", "is_login": "0"});
                }

            } else {
                res.json({"result": "hacker_id is invalid", "code": "7", "is_login": "0"});
            }
        }
    } catch (e) {
        if (isSentry)
            Sentry.captureException(e);
        if (isDebug)
            res.status(500).json({"result": e.toString()});
        else
            res.status(500).json({"result": "Internal Server Error!"});
    }

});

/**
 * @swagger
 * /company/program/invite-hackers-list:
 *   post:
 *     tags:
 *       - company - program
 *     description:  list invited hacker
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : program_id
 *         type : string
 *         in: formData
 *         description : program_id
 *         required : true
 *       - name : page
 *         type : string
 *         in: query
 *         description : page
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
 *               {"code":"0","result":[data],"is_login":"0"}
 *               {"code":"1","result":"program_id is empty","is_login":"0"}
 *               {"code":"2","result":"program_id is invalid","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/invite-hackers-list', isAuth, hasPermission(RESOURCE.PROGRAM, ACTIONS.READ), uploader.none(), [
    check.body('program_id').trim().not().isEmpty()
        .withMessage({"result": "program_id is empty", "code": "1", "is_login": "0"}),
], async (req, res) => {
    try {
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else {
            let user = company.get('companyUser');
            const program_id = safeString(req.body.program_id);
            const is_program_owner = await model.hasAccessToProgram(user, program_id);
            if (!is_program_owner) {
                return res.json({
                    "result": "program_id is invalid or you don't have access to it!",
                    "code": "1",
                    "is_login": "0"
                });
            }
            let currentProgram = await model.getRow(getUserId(user), program_id);

            if (!currentProgram.is_verify) {
                res.json({"result": "program is not verify", "code": "6", "is_login": "0"});
                return;
            }

            if (currentProgram.status != 2) {
                res.json({"result": "program is not accept", "code": "5", "is_login": "0"});
                return;
            }

            if (currentProgram.is_next_generation !== PROGRAM_BOUNTY_TYPE.BUG_BOUNTY) {
                return res.json({
                    "result": "you can not invite hackers for this program",
                    "code": "2",
                    "is_login": "0"
                });
            }
            gSortColumns = ['_id'];
            let resultPagination = await model.getInviteHackerList(getUserId(user), program_id);
            res.json({"result": resultPagination, "code": "0", "is_login": "0"});
        }
    } catch (e) {
        if (isSentry)
            Sentry.captureException(e);
        if (isDebug)
            res.status(500).json({"result": e.toString()});
        else
            res.status(500).json({"result": "Internal Server Error!"});
    }

});

/**
 * @swagger
 * /company/program/delete:
 *   delete:
 *     tags:
 *       - company - program
 *     description: delete program
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : program_id
 *         type : string
 *         in: formData
 *         description : program_id
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
 *               {"code":"1","result":"program_id is empty","is_login":"0"}
 *               {"code":"2","result":"program_id is invalid","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.delete('/delete', isAuth, hasPermission(RESOURCE.PROGRAM, ACTIONS.DELETE), uploader.none(), [
    check.body('program_id').trim().not().isEmpty()
        .withMessage({"result": "program_id is empty", "code": "1", "is_login": "0"}),
], async (req, res) => {
    try {
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else {
            let user = company.get('companyUser');
            const program_id = safeString(req.body.program_id);
            const is_program_owner = await model.hasAccessToProgram(user, program_id);
            if (!is_program_owner) {
                return res.json({
                    "result": "program_id is invalid or you don't have access to it!",
                    "code": "1",
                    "is_login": "0"
                });
            }
            let currentProgram2 = await model.getRow(getUserId(user), program_id);
            if (currentProgram2.status !== 0 && currentProgram2.status !== 3) {
                res.json({"result": "program can not delete", "code": "3", "is_login": "0"});
                return;
            }
            let del = await model.deleteProgram(getUserId(user), program_id, user._id);
            res.json({"result": "success", "code": "0", "is_login": "0"});
        }
    } catch (e) {
        if (isSentry)
            Sentry.captureException(e);
        if (isDebug)
            res.status(500).json({"result": e.toString()});
        else
            res.status(500).json({"result": "Internal Server Error!"});
    }

});

/**
 * @swagger
 * /company/program/generate-pdf:
 *   get:
 *     tags:
 *       - company - program
 *     description: delete program
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : program_id
 *         type : string
 *         in: query
 *         description : program_id
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
 *               {"code":"1","result":"program_id is empty","is_login":"0"}
 *               {"code":"2","result":"program_id is invalid","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.get('/generate-pdf', isAuth, hasPermission(RESOURCE.PROGRAM_STATISTICS, ACTIONS.READ), uploader.none(), [
    check.query('from_date').optional({nullable: true})
        .isISO8601().withMessage({"code": "0", "result": [], "is_login": "0"}).bail()
        .toDate(),
    check.query('to_date').optional({nullable: true})
        .isISO8601().withMessage({"code": "0", "result": [], "is_login": "0"}).bail()
        .toDate(),
    check.query('report_ids').optional({nullable: true}).custom((value) => {
        const report_ids = JSON.parse(JSON.stringify(value));
        if (!isArray(report_ids)) {
            return false;
        }
        if (report_ids.length > 0) {
            report_ids.forEach(item => {
                if (!mongoose.Types.ObjectId.isValid(safeString(item))) {
                    return false;
                }
            })
        }
        return true;
    }).withMessage({"result": "report_ids is invalid", "code": "1", "is_login": "0"}).bail()
        .customSanitizer(value => JSON.parse(JSON.stringify(safeString(value)))),
    check.query('status').optional({nullable: true}).custom((value) => {
        const status = JSON.parse(JSON.stringify(value));
        if (!isArray(status)) {
            return false;
        }
        if (status.length > 0) {
            status.forEach(item => {
                if (!REPORT_STATUS.VALUES.includes(toNumber(item))) {
                    return false;
                }
            })
        }
        return true;
    }).withMessage({"result": "status is invalid", "code": "1", "is_login": "0"}).bail()
        .customSanitizer(value => {
            const result = JSON.parse(JSON.stringify(value));
            if (result && result.length > 0) {
                return result.map(item => toNumber(item));
            }
            return [];
        }),
    check.query('severity').optional({nullable: true}).custom((value) => {
        const severity = JSON.parse(JSON.stringify(value));
        if (!isArray(severity)) {
            return false;
        }
        if (severity.length > 0) {
            severity.forEach(item => {
                if (!REPORT_SEVERITY.VALUES.includes(toNumber(item))) {
                    return false;
                }
            })
        }
        return true;
    }).withMessage({"result": "severity is invalid", "code": "1", "is_login": "0"}).bail()
        .customSanitizer(value => {
            const result = JSON.parse(JSON.stringify(value));
            if (result && result.length > 0) {
                return result.map(item => toNumber(item));
            }
            return [];
        }),
    check.query('program_id').trim().not().isEmpty()
        .withMessage({"result": "program_id is empty", "code": "1", "is_login": "0"}),
], async (req, res) => {
    try {
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            return res.json(errors.array()[0].msg);
        } else {
            let user = company.get('companyUser');
            const program_id = safeString(req.query.program_id);
            const is_program_owner = await model.hasAccessToProgram(user, program_id);
            if (!is_program_owner) {
                return res.json({
                    "result": "program_id is invalid or you don't have access to it!",
                    "code": "1",
                    "is_login": "0"
                });
            }
            let from_date = safeString(req.query.from_date);
            let to_date = safeString(req.query.to_date);
            let status = req.query.status;
            let severity = req.query.severity;
            let report_ids = req.query.report_ids;
            const result = await model.generatePdf(getUserId(user), program_id, from_date, to_date, status, severity, report_ids);
            if (result === 1) {
                return res.json({"result": "program_id is invalid", "code": "2", "is_login": "0"});
            }
            return res.json({"result": result, "code": "0", "is_login": "0"});
        }
    } catch (e) {
        if (isSentry)
            Sentry.captureException(e);
        if (isDebug)
            res.status(500).json({"result": e.toString()});
        else
            res.status(500).json({"result": "Internal Server Error!"});
    }

});

/**
 * @swagger
 * /company/program/{id}/cancel-invitation/{hacker_id}:
 *   post:
 *     tags:
 *       - company - program
 *     description: cancel program invitation
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
 *       - name : hacker_id
 *         type : string
 *         in: path
 *         description : hacker_id
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
 *               {"code":"1","result":"program_id is empty","is_login":"0"}
 *               {"code":"2","result":"program_id is invalid","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/:id/cancel-invitation/:hacker_id', isAuth, hasPermission(RESOURCE.PROGRAM_INVITATION, ACTIONS.DELETE), uploader.none(), [
    check.param('id').trim().not().isEmpty()
        .withMessage({"result": "program_id is empty", "code": "1", "is_login": "0"}),
    check.param('hacker_id').trim().not().isEmpty()
        .withMessage({"result": "hacker_id is empty", "code": "1", "is_login": "0"}),
], async (req, res) => {
    try {
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else {
            let user = company.get('companyUser');
            const program_id = safeString(req.params.id);
            const is_program_owner = await model.hasAccessToProgram(user, program_id);
            if (!is_program_owner) {
                return res.json({
                    "result": "program_id is invalid or you don't have access to it!",
                    "code": "1",
                    "is_login": "0"
                });
            }
            const hacker_id = safeString(req.params.hacker_id);
            const result = await model.cancelInvitation(getUserId(user), program_id, hacker_id);
            if (result === 1) {
                return res.json({"result": "program is not exist", "code": "2", "is_login": "0"});
            } else if (result === 2) {
                return res.json({"result": "invitation is not exist", "code": "2", "is_login": "0"});
            }
            return res.json({"result": "Invitation successfully canceled", "code": "0", "is_login": "0"});
        }
    } catch (e) {
        if (isSentry)
            Sentry.captureException(e);
        if (isDebug)
            res.status(500).json({"result": e.toString()});
        else
            res.status(500).json({"result": "Internal Server Error!"});
    }

});

/**
 * @swagger
 * /company/program/get-select-list:
 *   get:
 *     tags:
 *       - company - program
 *     description: get company programs
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
 *               {"code":"0","result":"company data","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.get('/get-select-list', isAuth, hasPermission(RESOURCE.PROGRAM, ACTIONS.READ), uploader.none(), async (req, res) => {
    try {
        let user = company.get('companyUser');
        let get_company_programs = await model.getCompanyProgramsList(getUserId(user), user.parent_user_id, user.access_program_list);
        res.json({"result": get_company_programs, "code": "0", "is_login": "0"});
    } catch (e) {
        if (isSentry)
            Sentry.captureException(e);
        if (isDebug)
            res.status(500).json({"result": e.toString()});
        else
            res.status(500).json({"result": "Internal Server Error!"});
    }

});

/**
 * @swagger
 * /company/program/next-gen-pentest-budgeting/:
 *   post:
 *     tags:
 *       - company - program
 *     description: next generation of pentest monthly program
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : false
 *         description : token
 *       - name : program_id
 *         type : string
 *         in: formData
 *         description : program_id
 *       - name : hourly_price
 *         type : string
 *         in: formData
 *         description : hourly_price
 *       - name : duration_type
 *         type : string
 *         in: formData
 *         description : type-> 1->6 month ,2->12 month
 *       - name : maximum_reward
 *         type : string
 *         in: formData
 *         description : maximum_reward
 *       - name : data
 *         type : object
 *         in: formData
 *         required : false
 *         description : data
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
 *               {"code":"1","result":"program_id is empty","is_login":"0"}
 *               {"code":"2","result":"program_id is invalid","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/next-gen-pentest-budgeting', isAuth, uploader.none(), [
    check.body('program_id').trim().not().isEmpty()
        .withMessage({"result": "program_id is empty", "code": "1", "is_login": "0"}),
    check.body('maximum_reward').trim().not().isEmpty()
        .withMessage({"result": "maximum_reward is empty", "code": "2", "is_login": "0"}).isNumeric()
        .withMessage({"result": "maximum_reward is not numeric", "code": "3", "is_login": "0"}),
    check.body('hourly_price').trim().not().isEmpty()
        .withMessage({"result": "hourly_price is empty", "code": "4", "is_login": "0"}).isNumeric()
        .withMessage({"result": "hourly_price is not numeric", "code": "5", "is_login": "0"}),
    check.body('duration_type').trim().not().isEmpty()
        .withMessage({"result": "duration_type is empty", "code": "6", "is_login": "0"}).isNumeric()
        .withMessage({"result": "duration_type is not numeric", "code": "7", "is_login": "0"}),
], async (req, res) => {
    try {
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else {
            let user = company.get('companyUser');
            const program_id = safeString(req.body.program_id);
            const is_program_owner = await model.hasAccessToProgram(user, program_id);
            if (!is_program_owner) {
                return res.json({
                    "result": "program_id is invalid or you don't have access to it!",
                    "code": "1",
                    "is_login": "0"
                });
            }
            const hourly_price = safeString(req.body.hourly_price);
            const duration_type = safeString(req.body.duration_type);
            const maximum_reward = safeString(req.body.maximum_reward);
            let data = req.body.data;
            if (!data) {
                return res.json({"result": "Data is not valid", "code": "3", "is_login": "0"});
            }
            const monthly_hours = JSON.parse(data);
            if (!(Array.isArray(monthly_hours) && monthly_hours.length > 0)) {
                return res.json({"result": "Array is is not valid", "code": "4", "is_login": "0"});
            }
            if (req.body.duration_type === NEXT_GEN_DURATION_TYPE.SIX_MONTH && monthly_hours.length !== NEXT_GEN_DURATION_TYPE.SIX_MONTH) {
                return res.json({"result": "Please enter 6 months ", "code": "8", "is_login": "0"});
            }
            if (req.body.duration_type === NEXT_GEN_DURATION_TYPE.TWELVE_MONTH && monthly_hours.length !== NEXT_GEN_DURATION_TYPE.TWELVE_MONTH) {
                return res.json({"result": "Please enter 12 months ", "code": "7", "is_login": "0"});
            }
            const total_hours = monthly_hours.reduce((total, currentItem) => total + toNumber(currentItem.hours), 0);
            const total_price = total_hours * toNumber(hourly_price);
            if (maximum_reward < total_price) {
                return res.json({"result": "Please Add Valid Maximum Rewards", "code": "30", "is_login": "0"});
            }
            const months = [];
            for (let row of monthly_hours) {
                if (checkKey(row, 'hours') && checkKey(row, 'date')) {
                    if (!(row.hours >= 0 && row.hours <= 240)) {
                        return res.json({"result": "Hours Is Not  Valid", "code": "5", "is_login": "0"});
                    }
                    const is_repeated_date = monthly_hours.filter(m => m.date === row.date);
                    if (is_repeated_date.length > 1) {
                        return res.json({"result": "monthly_hours is not valid!", "code": "10", "is_login": "0"});
                    }
                    const day = getDayOfMonth(row.date);
                    if (day !== '01') {
                        return res.json({
                            "result": "please add valid date of starter month '01'",
                            "code": "10",
                            "is_login": "0"
                        });
                    }
                    const diff = getDiffDays(row.date);
                    if (diff < 15) {
                        return res.json({
                            "result": "You can't Select this Month. Please choose atleast next month",
                            "code": "5",
                            "is_login": "0"
                        });
                    }
                    if (!moment(row.date, "yyyy-MM-01", true).isValid()) {
                        return res.json({
                            "result": `${row.date} is not valid!`,
                            "code": "5",
                            "is_login": "0"
                        });
                    }
                    const obj = {
                        "hours": safeString(row.hours),
                        "date": safeString(row.date),
                    };
                    months.push(obj);
                }
            }
            if (months.length > 0) {
                const result = await model.setNextGenPentBudgeting(getUserId(user), program_id, hourly_price, duration_type, maximum_reward, months, user.access_program_list);
                if (typeof result === 'number') {
                    if (result === 1) {
                        return res.json({"result": "program is not exist", "code": "11", "is_login": "0"});
                    } else if (result === 2) {
                        return res.json({"result": "You can't change hourly_price", "code": "11", "is_login": "0"});
                    } else if (result === 3) {
                        return res.json({"result": "Program Is  Not  ENTERPRISE", "code": "12", "is_login": "0"});
                    }
                }
                return res.json({"result": result, "code": "0", "is_login": "0"});
            } else {
                res.json({"result": "months are Empty", "code": "5", "is_login": "0"});
            }
        }
    } catch (e) {
        if (isSentry)
            Sentry.captureException(e);
        if (isDebug)
            res.status(500).json({"result": e.toString()});
        else
            res.status(500).json({"result": "Internal Server Error!"});
    }

});

/**
 * @swagger
 * /company/program/edit-netx-gen-pentest-monthly/:
 *   post:
 *     tags:
 *       - company - program
 *     description: edit  next generation of pentest monthly program
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : false
 *         description : token
 *       - name : program_id
 *         type : string
 *         in: formData
 *         description : program_id
 *       - name : hourly_price
 *         type : string
 *         in: formData
 *         description : hourly_price
 *       - name : duration_type
 *         type : string
 *         in: formData
 *         description : type-> 6->6 month ,12->12 month
 *       - name : maximum_reward
 *         type : string
 *         in: formData
 *         description : maximum_reward
 *       - name : data
 *         type : object
 *         in: formData
 *         required : false
 *         description : data
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
 *               {"code":"1","result":"program_id is empty","is_login":"0"}
 *               {"code":"2","result":"program_id is invalid","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/edit-netx-gen-pentest-monthly', isAuth, uploader.none(), [
        check.body('program_id').trim().not().isEmpty()
            .withMessage({"result": "program_id is empty", "code": "1", "is_login": "0"}),
        check.body('maximum_reward').trim().not().isEmpty()
            .withMessage({"result": "maximum_reward is empty", "code": "2", "is_login": "0"}).isNumeric()
            .withMessage({"result": "maximum_reward is not numeric", "code": "3", "is_login": "0"}),
        check.body('hourly_price').trim().not().isEmpty()
            .withMessage({"result": "hourly_price is empty", "code": "4", "is_login": "0"}).isNumeric()
            .withMessage({"result": "hourly_price is not numeric", "code": "5", "is_login": "0"}),
        check.body('duration_type').trim().not().isEmpty()
            .withMessage({"result": "duration_type is empty", "code": "6", "is_login": "0"}).isNumeric()
            .withMessage({"result": "duration_type is not numeric", "code": "7", "is_login": "0"}),


    ],
    async (req, res) => {
        try {

            const errors = check.validationResult(req);
            if (!errors.isEmpty()) {
                res.json(errors.array()[0].msg);
            } else {

                let user = company.get('companyUser');
                const program_id = safeString(req.body.program_id);
                const checkProgramId = await model.checkProgramId(getUserId(user), program_id);
                if (checkProgramId === 0) {
                    return res.json({
                        "result": "program_id and is company    is not find",
                        "code": "11",
                        "is_login": "0"
                    });
                }
                const hourly_price = safeString(req.body.hourly_price);
                const duration_type = safeString(req.body.duration_type);
                const maximum_reward = safeString(req.body.maximum_reward);


                let data = req.body;
                if (!checkKey(data, 'data')) {
                    res.json({"result": "Data is not valid", "code": "3", "is_login": "0"});

                } else {
                    var rows = JSON.parse(data['data']);
                    if (req.body.duration_type === '6' && rows.length !== 6) {
                        res.json({"result": "Please enter 6 months ", "code": "8", "is_login": "0"});
                        return;


                    } else if (req.body.duration_type === '12' && rows.length !== 12) {
                        res.json({"result": "Please enter 12 months ", "code": "7", "is_login": "0"});
                        return;
                    }
                    if (Array.isArray(rows) && rows.length > 0) {

                        const program = await model.getnextGenPentMonthly(program_id);
                        const total = await model.getTotalPriceNgp(getUserId(user), program_id);
                        const TotalpriceNgp = total.TotalpriceNgp;

                        let i = 0;
                        const months = [];
                        for (let item of program.monthly_hours) {
                            const date = item.date;
                            const hours = item.hours;
                            const currentHorse = rows[i].hours;
                            const currentDate = rows[i].date;
                            const checkDay = getOnlyDays(currentDate, date);
                            if (checkKey(rows[i], 'hours') && checkKey(rows[i], 'date')) {
                                console.log(rows[i]);

                                if (checkDay > 0 || currentHorse !== hours) {

                                    if (maximum_reward < TotalpriceNgp) //Check for maximum-reward_data
                                    {
                                        res.json({
                                            "result": "Please Add Valid Maximum Rewards",
                                            "code": "30",
                                            "is_login": "0"
                                        });
                                        return;

                                    }


                                    if (rows[i].hours >= 30 && rows[i].hours <= 168 || rows[i].hours == 0) {

                                        const day = getDayOfMonth(rows[i].date);
                                        if (day !== '01') {
                                            res.json({
                                                "result": "please add valid date of starter month '01'",
                                                "code": "10",
                                                "is_login": "0"
                                            });
                                        }
                                        const diff = getDiffDays(rows[i].date)
                                        if (diff < 15) {
                                            res.json({
                                                "result": "You can't Cheng this Month Becuse After 15 days",
                                                "code": "5",
                                                "is_login": "0"
                                            });
                                            return;
                                        }

                                        const obj = {
                                            "hours": safeString(rows[i].hours),
                                            "date": safeString(rows[i].date),
                                        };
                                        months.push(obj);
                                    } else {
                                        return res.json({
                                            "result": "please add 30=<clock <=168",
                                            "code": "6",
                                            "is_login": "0"
                                        });
                                    }
                                } else {
                                    months.push(item);
                                }
                            }
                            i++;
                        }
                        if (months.length > 0) {
                            const result = await model.setNextGenPentBudgeting(getUserId(user), program_id, hourly_price, duration_type, maximum_reward, months);
                            return res.json({
                                "result": "Next generation pentest montly save successfully",
                                "code": "0",
                                "is_login": "0",
                                "maximum_reward": maximum_reward,
                                "hourly_price": hourly_price,
                                "monthly_hours": months,
                                "duration_type": duration_type
                            });
                        } else {
                            res.json({"result": "Array is Empty", "code": "5", "is_login": "0"});
                        }
                    } else {
                        res.json({"result": "Array is is not valid", "code": "4", "is_login": "0"});
                    }
                }
            }
        } catch (e) {
            if (isSentry)
                Sentry.captureException(e);
            if (isDebug)
                res.status(500).json({"result": e.toString()});
            else
                res.status(500).json({"result": "Internal Server Error!"});
        }
    });

module.exports = router;
