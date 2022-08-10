require('../../init');
const model = require('./submit_report.model');
const router = express.Router();
let fileSubmit = {"dir": "hacker/report_files", "field": "file", "type": "file_image"};
let cmdSubmit1 = {"dir": "hacker/report_files", "field": "file1", "type": "file_image"};
let cmdSubmit2 = {"dir": "hacker/report_files", "field": "file2", "type": "file_image"};
let cmdSubmit3 = {"dir": "hacker/report_files", "field": "file3", "type": "file_image"};

let uploadDirs = [
    fileSubmit, cmdSubmit1, cmdSubmit2, cmdSubmit3
];

async function check_submit_comment(req) {
    try {
        let user = hacker.get('hackerUser');
        let report_id = safeString(req.params.report_id);
        let row = await model.getRow(user._id, report_id);
        if (!row) {
            req.validationErrors = {"result": "report not found!", "code": "1", "is_login": "0"};
            return false;
        }

        if (row.is_close == 0) {
            req.validationErrors = {"result": "closed by admin", "code": "5", "is_login": "0"};
            return false;
        }
        let currentProgram = await model.getProgram(row.program_id._id);
        if (!currentProgram) {
            req.validationErrors = {"result": "program not found!", "code": "1", "is_login": "0"};
            return false;
        }
        if (currentProgram.program_type == 2) {
            let kycAdv = getHackerKycAdvanced(user);
            if (!kycAdv) {
                req.validationErrors = {"result": "kyc advanced is not active", "code": "3", "is_login": "0"};
                return false;
            }
        }

        let comment = safeString(req.body.comment);
        if (comment === "") {
            req.validationErrors = {"result": "comment is empty", "code": "4", "is_login": "0"};
            return false;
        }
        req.validationErrors = "";
        return currentProgram.company_user_id;
    } catch (e) {
        if (isDebug)
            req.validationErrors = {"result": e.toString()};
        else
            req.validationErrors = {"result": "Internal Server Error!"};
        return false;
    }


}

/**
 * @swagger
 * /hacker/submit_report/submit_step1:
 *   post:
 *     tags:
 *       - hacker - submit
 *     description: hacker submit report step 1
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
 *               {"code":"-1","result":"token is empty","is_login":"-1"}
 *               {"code":"-1","result":"token invalid","is_login":"-1"}
 *               {"code":"-1","result":"token expire","is_login":"-1"}
 *               {"code":"-2","result":"account is not verify","is_login":"-2"}
 *               {"code":"-3","result":"account is disabled","is_login":"-3"}
 *               {"code":"1","result":"program_id is empty","is_login":"0"}
 *               {"code":"2","result":"program not found!","is_login":"0"}
 *               {"code":"4","result":"kyc advanced is not active","is_login":"0"}
 *               {"code":"5","result":"submit error!","is_login":"0"}
 *               {"code":"0","result":{"report_id":"report_id"},"is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/submit_step1', isAuth, uploader.none(), [
    check.body('program_id').trim().not().isEmpty()
        .withMessage({"result": "program_id is empty", "code": "1", "is_login": "0"}),
], async (req, res) => {
    try {
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
            return;
        }
        let user = hacker.get('hackerUser');
        let program_id = safeString(req.body.program_id);

        let currentProgram = await model.getProgram(program_id);
        if (currentProgram.program_type === PROGRAM_TYPE.PRIVATE) {
            const checkAcceptedInvitationByHacker = await model.checkAcceptedInvitationByHacker(user._id,program_id);
            if (!checkAcceptedInvitationByHacker > 0) {
                return res.json({"result": "you can not see this program", "code": "4", "is_login": "0"});
            }
        }
        if (!currentProgram) {
            res.json({"result": "program not found!", "code": "2", "is_login": "0"});
            return;
        }

        if (currentProgram.program_type == 2) {
            let kycAdv = getHackerKycAdvanced(user);
            if (!kycAdv) {
                res.json({"result": "kyc advanced is not active", "code": "3", "is_login": "0"});
                return;
            }
        }

        let resultAdd = await model.addSubmit(user._id, program_id);
        if (resultAdd !== 0) {
            res.json({"result": {"report_id": resultAdd._id}, "code": "0", "is_login": "0"});
        } else {
            res.json({"result": "submit error!", "code": "5", "is_login": "0"});
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
 * /hacker/submit_report/submit_step2/:
 *   post:
 *     tags:
 *       - hacker - submit
 *     description: submit report for program step2
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : report_id
 *         type : string
 *         in: formData
 *         description : report_id
 *         required : true
 *       - name : target_id
 *         type : string
 *         in: formData
 *         description : target_id
 *         required : true
 *       - name : vulnerability_type_id
 *         type : string
 *         in: formData
 *         description : vulnerability_type_id
 *         required : true
 *       - name : severity
 *         type : int
 *         in: formData
 *         description : severity
 *       - name : title
 *         type : string
 *         in: formData
 *         description : title
 *         required : true
 *       - name : proof_url
 *         type : string
 *         in: formData
 *         description : proof_url
 *         required : true
 *       - name : proof_concept
 *         type : string
 *         in: formData
 *         description : proof_concept
 *         required : true
 *       - name : proof_recommendation
 *         type : string
 *         in: formData
 *         description : proof_recommendation
 *       - name : security_impact
 *         type : string
 *         in: formData
 *         description : security_impact
 *       - name : is_next_generation
 *         type : number
 *         in: formData
 *         description : is_next_generation  0 or 1 or 2
 *       - name : score
 *         type : any
 *         in: formData
 *         description : score
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
 *               {"code":"0","result":{submit_report_data},"is_login":"0"}
 *               {"code":"1","result":"report_id is empty","is_login":"0"}
 *               {"code":"2","result":"summery title is empty","is_login":"0"}
 *               {"code":"3","result":"target_id is empty","is_login":"0"}
 *               {"code":"4","result":"vulnerability_type_id is empty","is_login":"0"}
 *               {"code":"5","result":"proof_url is empty","is_login":"0"}
 *               {"code":"6","result":"proof_concept is empty","is_login":"0"}
 *               {"code":"7","result":"target_id not found!","is_login":"0"}
 *               {"code":"8","result":"vulnerability_type_id not found!","is_login":"0"}
 *               {"code":"11","result":"kyc advanced is not active","is_login":"0"}
 *               {"code":"12","result":"report_id not found","is_login":"0"}
 *               {"code":"13","result":"report can not edit","is_login":"0"}
 *               {"code":"14","result":"summery title must be between 6 and 50 characters","is_login":"0"}
 *               {"code":"15","result":"proof url must be between 6 and 150 characters","is_login":"0"}
 *               {"code":"16","result":"severity is empty","is_login":"0"}
 *               {"code":"17","result":"security impact must be between 10 and 100 characters","is_login":"0"}
 *               {"code":"18","result":"score is empty","is_login":"0"}
 *               {"code":"19","result":"score is not valid","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */


router.post('/submit_step2', isAuth, uploader.none(),
    [
        check.body('report_id').trim().not().isEmpty()
            .withMessage({"result": "report_id is empty", "code": "1", "is_login": "0"}),
        check.body('score').trim().not().isEmpty()
            .withMessage({"result": "score is empty", "code": "18", "is_login": "0"}),
        check.body('severity').trim().not().isEmpty()
            .withMessage({"result": "severity is empty", "code": "16", "is_login": "0"}),
        check.body('title').trim().not().isEmpty()
            .withMessage({"result": "summery title is empty", "code": "2", "is_login": "0"})
            .isLength({min: 6, max: 150}).withMessage({
            "result": "summery title must be between 6 and 50 characters",
            "code": "14"
        }),
        check.body('security_impact').optional({checkFalsy: true})
            .isLength({
                min: 10,
                max: 1000
            }).withMessage({"result": "security impact must be between 10 and 100 characters", "code": "17"}),
        check.body('target_id').trim().not().isEmpty()
            .withMessage({"result": "target_id is empty", "code": "3", "is_login": "0"}),
        check.body('vulnerability_type_id').trim().not().isEmpty()
            .withMessage({"result": "vulnerability_type_id is empty", "code": "4", "is_login": "0"}),
        check.body('proof_url').trim().not().isEmpty()
            .withMessage({"result": "proof url is empty", "code": "5", "is_login": "0"})
            .isLength({min: 6, max: 150}).withMessage({
            "result": "proof url must be between 6 and 150 characters",
            "code": "15"
        }),
        check.body('proof_concept').trim().not().isEmpty()
            .withMessage({"result": "proof_concept is empty", "code": "6", "is_login": "0"})
    ], async (req, res) => {
        try {
            let user = hacker.get('hackerUser');
            const errors = check.validationResult(req);
            if (!errors.isEmpty()) {
                res.json(errors.array()[0].msg);
                return;
            }
            let captchaResult = await googleRecaptchaCheck(req);
            if (captchaResult) {
            let report_id = safeString(req.body.report_id);
            let target_id = safeString(req.body.target_id);
            let vulnerability_type_id = safeString(req.body.vulnerability_type_id);
            let severity = toNumber(req.body.severity);
            if (severity <= 0 || severity >= 5)
                severity = 0;
            let title = safeString(req.body.title);
            let proof_url = safeString(req.body.proof_url);
            let proof_concept = safeString(req.body.proof_concept);
            let proof_recommendation = safeString(req.body.proof_recommendation);
            let security_impact = safeString(req.body.security_impact);
                let score = "";
                try {
                    score = JSON.parse(req.body.score);
                } catch {
                    return res.json({"result": "score is not valid", "code": "19", "is_login": "0"});
                }
            if (!hasValue(score) || !hasValue(score.A) || !hasValue(score.AC) ||
                !hasValue(score.AV) || !hasValue(score.C) ||
                !hasValue(score.I) || !hasValue(score.PR) ||
                !hasValue(score.S) || !hasValue(score.UI)) {
                return res.json({"result": "score is not valid", "code": "19", "is_login": "0"});
            }
            for (let item in score) {
                score[item] = safeString(score[item])
            }
            let currentReport = await model.getRow(user._id, report_id);
            let is_next_generation = toNumber(req.body.is_next_generation);
            if (is_next_generation == 1)
                is_next_generation = 1;
            else if (is_next_generation == 2)
                is_next_generation = 2;
            else
                is_next_generation = 0;

            if (currentReport) {
                if (currentReport.status > 2) {
                    res.json({"result": "report can not edit!", "code": "13", "is_login": "0"});
                    return;
                }

                let checkTypeVulnerability = await model.getTypeVulnerability(vulnerability_type_id);
                if (checkTypeVulnerability == 0) {
                    res.json({"result": "vulnerability_type_id not found!", "code": "8", "is_login": "0"});
                    return;
                }

                let currentProgram = await model.getProgram(currentReport.program_id._id);
                if (currentProgram.program_type == 2) {
                    let kycAdv = getHackerKycAdvanced(user);
                    if (!kycAdv) {
                        res.json({"result": "kyc advanced is not active", "code": "11", "is_login": "0"});
                        return;
                    }
                }
                let checkTargetResult = await model.checkTarget(currentReport.program_id._id, target_id);
                if (checkTargetResult == 0) {
                    res.json({"result": "target_id not found!", "code": "7", "is_login": "0"});
                    return;
                }

                let save = await model.saveStep2(user._id, report_id, target_id, vulnerability_type_id
                    , severity, title, proof_url, proof_concept, proof_recommendation, security_impact,
                    is_next_generation, currentProgram.company_user_id, score,user.report_notification_setting,currentProgram._id);
                let data = await model.getRow(user._id, report_id);
                res.json({"result": data, "code": "0", "is_login": "0"});
            } else {
                res.json({"result": "report_id not found", "code": "12", "is_login": "0"});
            }
            } else {
                return res.json({"result": "Failed captcha verification", "code": "7"});
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
 * /hacker/submit_report/upload_doc_submit/{report_id}:
 *   post:
 *     tags:
 *       - hacker - submit
 *     description: upload document file for submit report
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : report_id
 *         type : string
 *         in: path
 *         description : report_id
 *         required : true
 *       - name : file
 *         type : file
 *         in: formData
 *         required : true
 *         description : document file
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
 *               {"code":"0","result":"file success upload","is_login":"0","report_files":[]}
 *               {"code":"1","result":"max file upload","is_login":"0"}
 *               {"code":"2","result":"invalid file","is_login":"0"}
 *               {"code":"3","result":"report not found","is_login":"0"}
 *               {"code":"4","result":"kyc is not active","is_login":"0"}
 *               {"code":"5","result":"kyc advanced is not active","is_login":"0"}
 *               {"code":"6","result":"report can not edit!","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */


async function upload_submit_check(req, file, cb) {
    try {
        let user = hacker.get('hackerUser');
        let report_id = safeString(req.params.report_id);
        let row = await model.getRow(user._id, report_id);
        if (!row) {
            req.validationErrors = {"result": "report not found!", "code": "3", "is_login": "0"};
            cb(null, false);
            return;
        }
        if (row.status > 2) {
            req.validationErrors = {"result": "report can not edit!", "code": "5", "is_login": "0"};
            cb(null, false);
            return;
        }
        if (row.report_files && row.report_files.length >= 10){
            req.validationErrors = {"result": "You can not upload more than 10 files!", "code": "5", "is_login": "0"};
            cb(null, false);
            return;
        }
        let currentProgram = await model.getProgram(row.program_id._id);
        if (currentProgram.program_type == 2) {
            let kycAdv = getHackerKycAdvanced(user);
            if (!kycAdv) {
                req.validationErrors = {"result": "kyc advanced is not active", "code": "11", "is_login": "0"};
                cb(null, false);
                return;
            }
        }


        req.uploadDirs = uploadDirs
        req.validationErrors = "";
        fileFilter(req, file, cb);
    } catch (e) {
        if (isDebug)
            req.validationErrors = {"result": e.toString()};
        else
            req.validationErrors = {"result": "Internal Server Error!"};
        cb(null, false);
    }
};
const uploader_submit_file = multer({storage: storage, fileFilter: upload_submit_check});
let uploadFilesDoc = uploader_submit_file.fields([{name: 'file', maxCount: 1}]);
router.post('/upload_doc_submit/:report_id', isAuth, uploadFilesDoc
    , async (req, res) => {
        try {
            let user = hacker.get('hackerUser');
            let report_id = safeString(req.params.report_id);
            if (!isUndefined(req.validationErrors) && req.validationErrors != "") {
                res.json(req.validationErrors);
                return;
            }

            var isUpload = Object.keys(req.files).length;
            if (isUpload == 0) {
                res.json({"result": "file not send", "code": "2", "is_login": "0"});
                return;
            }
            let file_original_name = '';
            let filename = "";
            if (req.files && Object.keys(req.files).length > 0 && !isUndefined(req.files.file)) {
                filename = req.files.file[0].filename;
                file = `hacker/report_files/${filename}`;
                file_original_name = safeString(req.files.file[0].originalname);
                if (isImage(filename)) {
                    let path = appDir + 'media/' + file;
                    file = `hacker/report_files/update_${filename}`;
                    let newFile = appDir + `media/hacker/report_files/update_${filename}`;
                    const imageFile = await sharp(path).toFile(newFile);
                    fs.stat(path, async (err, stats) => {
                        if (!err && stats.isFile())
                            fs.unlinkSync(path);
                    });
                }
            }
            let resultSave = await model.addReportFile(user._id, report_id, file, file_original_name);
        if (resultSave === 2){
           return res.json({"result": "You can not upload more than 10 files!", "code": "5", "is_login": "0"});
        }
            let result2 = await model.getRow(user._id, report_id);
            let files = result2.report_files.map(item => {
                item.file_name = AppConfig.API_URL + item.file_name
                return item;
            });
            res.json({
                "result": "file success upload"
                , "report_files": files
                , "code": "0", "is_login": "0"
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
 * /hacker/submit_report/delete_doc_submit/{report_id}:
 *   delete:
 *     tags:
 *       - hacker - submit
 *     description: delete document file for submit report
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : report_id
 *         type : string
 *         in: path
 *         description : report_id
 *       - name : file_id
 *         type : string
 *         in: formData
 *         required : true
 *         description : file_id
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
 *               {"code":"0","result":"file success delete","is_login":"0"}
 *               {"code":"1","result":"report not found","is_login":"0"}
 *               {"code":"2","result":"kyc is not active","is_login":"0"}
 *               {"code":"3","result":"kyc advanced is not active","is_login":"0"}
 *               {"code":"4","result":"report can not edit!","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.delete('/delete_doc_submit/:report_id/', isAuth
    , uploader.none()
    , async (req, res) => {
        try {
            let user = hacker.get('hackerUser');
            let report_id = safeString(req.params.report_id);
            let file_id = safeString(req.body.file_id);
            let current = await model.getRow(user._id, report_id);
            if (current) {
                if (current.status > 2) {
                    res.json({"result": "report can not edit!", "code": "4", "is_login": "0"});
                    return;
                }
                let currentProgram = await model.getProgram(current.program_id._id);
                if (currentProgram.program_type == 2) {
                    let kycAdv = getHackerKycAdvanced(user);
                    if (!kycAdv) {
                        res.json({"result": "kyc advanced is not active", "code": "11", "is_login": "0"});
                        return;
                    }
                }

                let _file = {};
                if (current.report_files.length > 0) {
                    _file = current.report_files.find((file) => {

                        return file._id.equals(file_id);
                    });
                }
                if (!isUndefined(_file) && !isUndefined(_file.file_name) && _file.file_name !== "") {
                    let path = appDir + 'media/' + _file.file_name;
                    fs.stat(path, async (err, stats) => {
                        if (!err && stats.isFile())
                            fs.unlinkSync(path);
                    });
                    let resultSave = await model.deleteReportFile(user._id, report_id, file_id);
                }
                let result2 = await model.getRow(user._id, report_id);
                let files = result2.report_files.map(item => {
                    item.file_name = AppConfig.API_URL + item.file_name
                    return item;
                });
                res.json({
                    "result": "file success delete"
                    , "report_files": files
                    , "code": "0", "is_login": "0"
                });
            } else {
                res.json({"result": "report not found!", "code": "1", "is_login": "0"});
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
 * /hacker/submit_report/list-submit-report/:
 *   get:
 *     tags:
 *       - hacker - submit
 *     description: list all submit for hacker
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : page
 *         type : string
 *         in: query
 *         description : list by page  ->  page=1 or page=2 ...
 *       - name : field
 *         type : string
 *         in: query
 *         description : feild for sort field -> _id,severity,status,send_date_time,title
 *       - name : sort
 *         type : string
 *         in: query
 *         description : sort only ASC or DESC
 *       - name : limit
 *         type : string
 *         in: query
 *         description : limit show rows per page
 *       - name : title
 *         type : string
 *         in: query
 *         description : search title
 *       - name : is_close
 *         type : string
 *         in: query
 *         description : is close
 *       - name : status
 *         type : string
 *         in: query
 *         description : search status
 *       - name : severity
 *         type : string
 *         in: query
 *         description : search severity
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
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.get('/list-submit-report', isAuth,[
    check.query('from_date').optional({nullable: true})
        .isISO8601().withMessage({"code":"0","result":[],"is_login":"0"}).bail()
        .toDate(),
    check.query('to_date').optional({nullable: true})
        .isISO8601().withMessage({"code":"0","result":[],"is_login":"0"}).bail()
        .toDate()
], async (req, res) => {
    try {
        let user = hacker.get('hackerUser');
        let title = safeString(req.query.title);
        let status = safeString(req.query.status);
        let severity = safeString(req.query.severity);
        let is_close = safeString(req.query.is_close);
        let from_date = safeString(req.query.from_date);
        let to_date = safeString(req.query.to_date);
        let report_id = safeString(req.query.report_id);
        let field = safeString(req.query.field);
        gSortColumns = ['_id', 'severity', 'status', 'send_date_time', 'title'];
        let resultPagination = await model.getReportList(user._id, title, status, severity, is_close, field, report_id,from_date,to_date);
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
 * /hacker/submit_report/get-report/{report_id}:
 *   get:
 *     tags:
 *       - hacker - submit
 *     description: get report info
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : report_id
 *         type : string
 *         in: path
 *         description : report_id
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
 *               {"code":"1","result":"report not found","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.get('/get-report/:report_id', isAuth, async (req, res) => {
    try {
        let user = hacker.get('hackerUser');
        let report_id = safeString(req.params.report_id);
        let current = await model.getRow(user._id, report_id);
        if (current) {
            res.json({"code": "0", "result": current, "is_login": "0"});
        } else {
            res.json({"code": "1", "result": "report not found", "is_login": "0"});
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
 * /hacker/submit_report/comment/{report_id}:
 *   post:
 *     tags:
 *       - hacker - submit
 *     description: net comment for report
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : report_id
 *         type : string
 *         in: path
 *         description : report_id
 *         required : true
 *       - name : comment
 *         type : string
 *         in: formData
 *         description : comment
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
 *               {"code":"1","result":"report not found","is_login":"0"}
 *               {"code":"2,"result":"kyc is not active","is_login":"0"}
 *               {"code":"3","result":"kyc advanced is not active","is_login":"0"}
 *               {"result":"comment is empty","code":"4","is_login":"0"})
 *               {"result":"closed by admin","code":"5","is_login":"0"})
 *               {"result":"comment must be less that 2048 characters.","code":"6","is_login":"0"})
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */

async function upload_comment_check(req, file, cb) {
    try {
        req.uploadDirs = uploadDirs
        let user = hacker.get('hackerUser');
        let report_id = safeString(req.params.report_id);
        let row = await model.getRow(user._id, report_id);
        if (!row) {
            req.validationErrors = {"result": "report not found!", "code": "1", "is_login": "0"};
            cb(null, false);
            return;
        }

        if (row.is_close == 0) {
            req.validationErrors = {"result": "closed by admin", "code": "5", "is_login": "0"};
            cb(null, false);
            return;
        }
        let currentProgram = await model.getProgram(row.program_id._id);
        if (currentProgram.program_type == 2) {
            let kycAdv = getHackerKycAdvanced(user);
            if (!kycAdv) {
                req.validationErrors = {"result": "kyc advanced is not active", "code": "3", "is_login": "0"};
                cb(null, false);
                return;
            }
        }

        let comment = safeString(req.body.comment);
        if (comment === "") {
            req.validationErrors = {"result": "comment is empty", "code": "4", "is_login": "0"};
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
};
const uploader_comment = multer({storage: storage, fileFilter: upload_comment_check});
let uploadFilesCmd = uploader_comment.fields([{name: 'file1', maxCount: 1}
    , {name: 'file2', maxCount: 1}, {name: 'file3', maxCount: 1}]);
router.post('/comment/:report_id', isAuth, uploadFilesCmd, [
        check.body('comment').trim().not().isEmpty()
            .withMessage({"result": "comment is empty", "code": "4", "is_login": "0"})
            .isLength({max: 2048}).withMessage({"result": "comment must be less that 2048 characters.", "code": "6"})
    ]
    , async (req, res) => {
        try {
            let user = hacker.get('hackerUser');
            let captchaResult = await googleRecaptchaCheck(req);
            if (captchaResult) {
                let comment = safeString(req.body.comment);
                let report_id = safeString(req.params.report_id);
                if (!isUndefined(req.validationErrors) && req.validationErrors != "") {
                    res.json(req.validationErrors);
                    return;
                }
                let company_user = await check_submit_comment(req);
                if (!company_user) {
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
                    if (isImage(filename1)) {
                        let path = appDir + 'media/' + file1;
                        file1 = `hacker/report_files/update_${filename1}`;
                        let newFile = appDir + `media/hacker/report_files/update_${filename1}`;
                        const imageFile = await sharp(path).toFile(newFile);
                        fs.stat(path, async (err, stats) => {
                            if (!err && stats.isFile())
                                fs.unlinkSync(path);
                        });
                    }
                }
                let file2_original_name = '';
                let filename2 = "";
                if (req.files && Object.keys(req.files).length > 0 && !isUndefined(req.files.file2)) {
                    filename2 = req.files.file2[0].filename;
                    file2 = `hacker/report_files/${filename2}`;
                    file2_original_name = safeString(req.files.file2[0].originalname);
                    if (isImage(filename2)) {
                        let path = appDir + 'media/' + file2;
                        file2 = `hacker/report_files/update_${filename2}`;
                        let newFile = appDir + `media/hacker/report_files/update_${filename2}`;
                        const imageFile = await sharp(path).toFile(newFile);
                        fs.stat(path, async (err, stats) => {
                            if (!err && stats.isFile())
                                fs.unlinkSync(path);
                        });
                    }

                }
                let file3_original_name = '';
                let filename3 = "";
                if (req.files && Object.keys(req.files).length > 0 && !isUndefined(req.files.file3)) {
                    filename3 = req.files.file3[0].filename;
                    file3 = `hacker/report_files/${filename3}`;
                    file3_original_name = safeString(req.files.file3[0].originalname);
                    if (isImage(filename3)) {
                        let path = appDir + 'media/' + file3;
                        file3 = `hacker/report_files/update_${filename3}`;
                        let newFile = appDir + `media/hacker/report_files/update_${filename3}`;
                        const imageFile = await sharp(path).toFile(newFile);
                        fs.stat(path, async (err, stats) => {
                            if (!err && stats.isFile())
                                fs.unlinkSync(path);
                        });
                    }

                }
                let resultSave = await model.addCmdReport(user._id, report_id
                    , file1, file1_original_name, file2, file2_original_name
                    , file3, file3_original_name, company_user
                    , comment,user.report_notification_setting);

                res.json({
                    "result": "success"
                    , "data": resultSave
                    , "code": "0", "is_login": "0"
                });
            } else {
                return res.json({"result": "Failed captcha verification", "code": "7"});
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
 * /hacker/submit_report/list-comment/{report_id}:
 *   get:
 *     tags:
 *       - hacker - submit
 *     description: list all comment for hacker
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : report_id
 *         type : string
 *         in: path
 *         description : report_id
 *         required : true
 *       - name : page
 *         type : string
 *         in: query
 *         description : list by page  ->  page=1 or page=2 ...
 *       - name : limit
 *         type : string
 *         in: query
 *         description : limit show rows per page
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: |
 *               <pre>
 *               {"code":"1","result":"report is not valid","is_login":"0"}
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
router.get('/list-comment/:report_id', isAuth, async (req, res) => {
    try {
        let user = hacker.get('hackerUser');
        gSortColumns = ['_id'];
        let report_id = safeString(req.params.report_id);
        let resultPagination = await model.getCommentList(user._id, report_id);
        if (resultPagination === 1) {
            return res.json({"result": "report is not valid", "code": "1", "is_login": "0"});
        }
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

module.exports = router;
