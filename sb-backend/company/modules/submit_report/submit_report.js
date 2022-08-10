require("../../init");
const model = require("./submit_report.model");
const router = express.Router();
let cmdSubmit1 = {"dir": "hacker/report_files", "field": "file1", "type": "file_image"};
let cmdSubmit2 = {"dir": "hacker/report_files", "field": "file2", "type": "file_image"};
let cmdSubmit3 = {"dir": "hacker/report_files", "field": "file3", "type": "file_image"};

let uploadDirs = [
    cmdSubmit1, cmdSubmit2, cmdSubmit3
];

/**
 * @swagger
 * /company/submit_report/list-submit-report:
 *   get:
 *     tags:
 *       - company - submit
 *     description: company submit report list
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : page
 *         type : number
 *         in: query
 *         description : page
 *         required : false
 *       - name : title
 *         type : string
 *         in: query
 *         description : title
 *       - name : is_close
 *         type : string
 *         in: query
 *         description : is close
 *       - name : status
 *         type : number
 *         in: query
 *         description : status
 *       - name : severity
 *         type : number
 *         in: query
 *         description : severity
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
 *               {"code":"1","result":"Company is Not Valid","is_login":"0"}
 *               {"code":"0","result":[result],"is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.get("/list-submit-report", isAuth, hasPermission(RESOURCE.REPORT, ACTIONS.READ), uploader.none(), [
    check.query('from_date').optional({nullable: true})
        .isISO8601().withMessage({"code": "0", "result": [], "is_login": "0"}).bail()
        .toDate(),
    check.query('to_date').optional({nullable: true})
        .isISO8601().withMessage({"code": "0", "result": [], "is_login": "0"}).bail()
        .toDate(),
    check.query('program_type').optional({nullable: true})
        .isInt({gt: -1}).withMessage({"result": "program_type is not valid", "code": "2", "is_login": "0"}).bail()
        .isIn([0, 1, 2]).withMessage({"result": "program_type is not valid", "code": "2", "is_login": "0"}).toInt(),
    check.query('program_id').optional({nullable: true})
        .if(check.query('program_id').exists({checkFalsy: true}))
        .isMongoId().withMessage({"result": "program_id is not valid", "code": "2", "is_login": "0"}).bail()
], async (req, res) => {
    try {
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else {
            const user = company.get("companyUser");
            let title = safeString(req.query.title);
            let status = safeString(req.query.status);
            let severity = safeString(req.query.severity);
            let is_close = safeString(req.query.is_close);
            let report_id = safeString(req.query.report_id);
            let field = safeString(req.query.field);
            let vulnerability = safeString(req.query.vulnerability);
            let program_id = safeString(req.query.program_id);
            let program_type = req.query.program_type;
            let from_date = safeString(req.query.from_date);
            let page = safeString(req.query.page);
            let to_date = safeString(req.query.to_date);
            gSortColumns = ["send_date_time", "title"];
            const result = await model.getCompanyReportsList(getUserId(user), title, status, severity, is_close, vulnerability, field, report_id, user._id, from_date, to_date, user.user_level_access, user.can_see_approve, program_type, program_id, page, user.parent_user_id, user.access_program_list);
            if (result === "1") {
                return res.json({result: "Company is Not Valid", code: "1", is_login: "0"});
            }
            return res.json({result: result, code: "0", is_login: "0"});
        }
    } catch (e) {
        if (isSentry) Sentry.captureException(e);
        if (isDebug) res.status(500).json({result: e.toString()});
        else res.status(500).json({result: "Internal Server Error!"});
    }
});

/**
 * @swagger
 * /company/submit_report/get-report/{report_id}:
 *   get:
 *     tags:
 *       - company - submit
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
 *               {"code":"403","result":"You don't have permission for this action"}
 *               {"code":"-1","result":"token is empty","is_login":"-1"}
 *               {"code":"-1","result":"token invalid","is_login":"-1"}
 *               {"code":"-1","result":"token expire","is_login":"-1"}
 *               {"code":"-2","result":"account is not verify","is_login":"-2"}
 *               {"code":"-3","result":"account is disabled","is_login":"-3"}
 *               {"code":"0","result":{obj},"is_login":"0"}
 *               {"code":"1","result":"company is Not Valid","is_login":"0"}
 *               {"code":"2","result":"report is Not Valid","is_login":"0"}
 *               {"code":"3","result":"report not found","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.get("/get-report/:report_id", isAuth, hasPermission(RESOURCE.REPORT, ACTIONS.READ), async (req, res) => {
    try {
        const user = company.get("companyUser");
        let report_id = safeString(req.params.report_id);
        let result = await model.getReport(getUserId(user), report_id, user.user_level_access, user.can_see_approve, user.parent_user_id, user.access_program_list);
        if (result === "1") {
            return res.json({code: "1", result: "Company is Not Valid", is_login: "0"});
        } else if (result === "2") {
            return res.json({code: "2", result: "Report is Not Valid", is_login: "0"});
        } else if (result === "3") {
            return res.json({code: "3", result: "report not found", is_login: "0"});
        } else if (result === "4") {
            return res.json({code: "4", result: "You don't have permission for see this report", is_login: "0"});
        } else {
            return res.json({code: "0", result: result, is_login: "0"});
        }
    } catch (e) {
        if (isSentry) Sentry.captureException(e);
        if (isDebug) res.status(500).json({result: e.toString()});
        else res.status(500).json({result: "Internal Server Error!"});
    }
});

/**
 * @swagger
 * /company/submit_report/list-comment/{report_id}:
 *   get:
 *     tags:
 *       - company - submit
 *     description: list all comment for company
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
router.get('/list-comment/:report_id', isAuth, hasPermission(RESOURCE.COMMENT, ACTIONS.READ), async (req, res) => {
    try {
        const user = company.get("companyUser");
        gSortColumns = ['_id'];
        let report_id = safeString(req.params.report_id);
        let result = await model.getCommentList(getUserId(user), report_id, user._id, user.parent_user_id, user.access_program_list);
        if (result === "1") {
            return res.json({code: "3", result: "report not found", is_login: "0"});
        } else if (result === "2") {
            return res.json({code: "4", result: "You don't have permission for see this report", is_login: "0"});
        } else {
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
 * /company/submit_report/comment/{report_id}:
 *   post:
 *     tags:
 *       - company - submit
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
 *               {"code":"1","result":"company has not been approved","is_login":"0"}
 *               {"code":"2,"result":"report not found","is_login":"0"}
 *               {"code":"3","result":"report closed by admin","is_login":"0"}
 *               {"code":"4","result":"program not found","is_login":"0"}
 *               {"code":"5","result":"program is not verify","is_login":"0"}
 *               {"code":"6","result":"comment is empty","is_login":"0"}
 *               {"code":"7","result":"you can not send comment!","is_login":"0"}
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
        if (comment === "") {
            req.validationErrors = {"result": "comment is empty", "code": "6", "is_login": "0"};
            cb(null, false);
            return;
        }
        let user = company.get('companyUser');
        if (!(user.is_verify && user.admin_verify)) {
            req.validationErrors = {"result": "company has not been approved", "code": "1", "is_login": "0"};
            cb(null, false);
            return;
        }

        let report_id = safeString(req.params.report_id);
        const result = await model.checkForSubmitComment(getUserId(user), report_id, user.user_level_access,
            user.can_send_comment, user.parent_user_id, user.access_program_list);
        if (result !== 0) {
            if (result === 2) {
                req.validationErrors = {"result": "report not found!", "code": "2", "is_login": "0"};
            } else if (result === 3) {
                req.validationErrors = {"result": "report closed by admin!", "code": "3", "is_login": "0"};
            } else if (result === 4) {
                req.validationErrors = {"result": "program not found!", "code": "4", "is_login": "0"};
            } else if (result === 5) {
                req.validationErrors = {"result": "program is not verify!", "code": "5", "is_login": "0"};
            } else if (result === 7) {
                req.validationErrors = {"result": "you can not send comment!", "code": "7", "is_login": "0"};
            } else if (result === 8) {
                req.validationErrors = {
                    code: "4",
                    result: "You don't have permission submit comment to this report",
                    is_login: "0"
                };
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
};
const uploader_comment = multer({storage: storage, fileFilter: upload_comment_check});
let uploadFilesCmd = uploader_comment.fields([{name: 'file1', maxCount: 1}
    , {name: 'file2', maxCount: 1}, {name: 'file3', maxCount: 1}]);
router.post('/comment/:report_id', isAuth, hasPermission(RESOURCE.COMMENT, ACTIONS.CREATE), uploadFilesCmd
    , async (req, res) => {
        try {
            let report_id = safeString(req.params.report_id);
            let comment = safeString(req.body.comment);
            let is_internal = req.body.is_internal === "true";
            if (comment === "") {
                req.validationErrors = {"result": "comment is empty", "code": "6", "is_login": "0"};
            }
            let user = company.get('companyUser');
            if (!(user.is_verify && user.admin_verify)) {
                req.validationErrors = {"result": "company has not been approved", "code": "1", "is_login": "0"};
            }
            const result = await model.checkForSubmitComment(getUserId(user), report_id, user.user_level_access,
                user.can_send_comment, user.parent_user_id, user.access_program_list);
            if (result !== 0) {
                if (result === 2) {
                    req.validationErrors = {"result": "report not found!", "code": "2", "is_login": "0"};
                } else if (result === 3) {
                    req.validationErrors = {"result": "report closed by admin!", "code": "3", "is_login": "0"};
                } else if (result === 4) {
                    req.validationErrors = {"result": "program is not found!", "code": "4", "is_login": "0"};
                } else if (result === 5) {
                    req.validationErrors = {"result": "program is not verify!", "code": "5", "is_login": "0"};
                } else if (result === 8) {
                    req.validationErrors = {
                        "result": "You don't have permission submit comment to this report",
                        "code": "5",
                        "is_login": "0"
                    };
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
            let resultSave = await model.addCmdReport(user._id, report_id
                , file1, file1_original_name, file2, file2_original_name
                , file3, file3_original_name
                , comment, user.parent_user_id, is_internal);
            if (isNumber(resultSave)) {
                return res.json({"result": "program is not found!", "code": "4", "is_login": "0"});
            } else {
                return res.json({
                    "result": "success"
                    , "data": resultSave
                    , "code": "0", "is_login": "0"
                });
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
 * /company/submit_report/change-severity/{report_id}:
 *   post:
 *     tags:
 *       - company - submit
 *     description: change report severity
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
 *       - name : severity
 *         type : string
 *         in: formData
 *         description : severity
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
 *               {"code":"403","result":"You don't have permission for this action"}
 *               {"code":"-1","result":"token is empty","is_login":"-1"}
 *               {"code":"-1","result":"token invalid","is_login":"-1"}
 *               {"code":"-1","result":"token expire","is_login":"-1"}
 *               {"code":"-2","result":"account is not verify","is_login":"-2"}
 *               {"code":"-3","result":"account is disabled","is_login":"-3"}
 *               {"code":"0","result":"success","is_login":"0"}
 *               {"code":"1","result":"user is invalid","is_login":"0"}
 *               {"code":"2,"result":"report is invalid","is_login":"0"}
 *               {"code":"3","result":"severity is invalid","is_login":"0"}
 *               {"code":"4","result":"report is not found","is_login":"0"}
 *               {"code":"5","result":"report is closed","is_login":"0"}
 *               {"code":"6","result":"program is not found","is_login":"0"}
 *               {"code":"7","result":"program is not verify","is_login":"0"}
 *               {"code":"8","result":"company is fully manage","is_login":"0"}
 *               {"code":"9","result":"score is empty","is_login":"0"}
 *               {"code":"10","result":"score is not valid","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/change-severity/:report_id', isAuth, hasPermission(RESOURCE.REPORT, ACTIONS.UPDATE), [
    check.body('score').trim().not().isEmpty()
        .withMessage({"result": "score is empty", "code": "9", "is_login": "0"})
], async (req, res) => {
    try {
        const user = company.get("companyUser");
        const report_id = safeString(req.params.report_id);
        const severity = safeString(req.body.severity);
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
        const result = await model.changeSeverity(user, report_id, severity, score,
            user.parent_user_id, user.access_program_list);
        if (typeof result === 'number') {
            if (result === 1) {
                res.json({"result": "user is invalid", "code": "1", "is_login": "0"});
            } else if (result === 2) {
                res.json({"result": "report is invalid", "code": "2", "is_login": "0"});
            } else if (result === 3) {
                res.json({"result": "severity is invalid", "code": "3", "is_login": "0"});
            } else if (result === 4) {
                res.json({"result": "report is not found", "code": "4", "is_login": "0"});
            } else if (result === 5) {
                res.json({"result": "report is closed", "code": "5", "is_login": "0"});
            } else if (result === 6) {
                res.json({"result": "program is not found", "code": "6", "is_login": "0"});
            } else if (result === 7) {
                res.json({"result": "program is not verify", "code": "7", "is_login": "0"});
            } else if (result === 8) {
                res.json({"result": "company is fully manage", "code": "8", "is_login": "0"});
            } else if (result === 9) {
                res.json({"result": "You don't have permission to change this report", "code": "8", "is_login": "0"});
            }
            return;
        }
        return res.json({
            "result": {comment: result.comment, send_date_time: result.send_date_time},
            "code": "0",
            "is_login": "0"
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
 * /company/submit_report/change-status/{report_id}:
 *   post:
 *     tags:
 *       - company - submit
 *     description: change report status
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
 *       - name : severity
 *         type : number
 *         in: query
 *         description : status
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
 *               {"code":"1","result":"user is invalid","is_login":"0"}
 *               {"code":"2,"result":"report is invalid","is_login":"0"}
 *               {"code":"3","result":"status is invalid","is_login":"0"}
 *               {"code":"4","result":"report is not found","is_login":"0"}
 *               {"code":"5","result":"report is closed","is_login":"0"}
 *               {"code":"6","result":"program is not found","is_login":"0"}
 *               {"code":"7","result":"program is not verify","is_login":"0"}
 *               {"code":"8","result":"company is fully manage","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/change-status/:report_id', isAuth, hasPermission(RESOURCE.REPORT, ACTIONS.UPDATE), async (req, res) => {
    try {
        const user = company.get("companyUser");
        const report_id = safeString(req.params.report_id);
        const status = safeString(req.body.status);
        const result = await model.changeStatus(user, report_id, status, user.parent_user_id, user.access_program_list);
        if (typeof result === 'number') {
            if (result === 1) {
                res.json({"result": "user is invalid", "code": "1", "is_login": "0"});
            } else if (result === 2) {
                res.json({"result": "report is invalid", "code": "2", "is_login": "0"});
            } else if (result === 3) {
                res.json({"result": "status is invalid", "code": "3", "is_login": "0"});
            } else if (result === 4) {
                res.json({"result": "report is not found", "code": "4", "is_login": "0"});
            } else if (result === 5) {
                res.json({"result": "report is closed", "code": "5", "is_login": "0"});
            } else if (result === 6) {
                res.json({"result": "program is not found", "code": "6", "is_login": "0"});
            } else if (result === 7) {
                res.json({"result": "program is not verify", "code": "7", "is_login": "0"});
            } else if (result === 8) {
                res.json({"result": "company is fully manage", "code": "8", "is_login": "0"});
            } else if (result === 9) {
                res.json({"result": "You don't have permission to change this report", "code": "8", "is_login": "0"});
            }
            return;
        }
        return res.json({
            "result": {comment: result.comment, send_date_time: result.send_date_time},
            "code": "0",
            "is_login": "0"
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
 * /company/submit_report/issued-to-jira/{report_id}:
 *   post:
 *     tags:
 *       - company - submit
 *     description: issued-to-jira
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
 *       - name : jira_project_ids
 *         type : string
 *         in: body
 *         description : jira_project_ids
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
 *               {"code":"1","result":"user is invalid","is_login":"0"}
 *               {"code":"2,"result":"report is invalid","is_login":"0"}
 *               {"code":"3","result":"status is invalid","is_login":"0"}
 *               {"code":"4","result":"report is not found","is_login":"0"}
 *               {"code":"5","result":"report is closed","is_login":"0"}
 *               {"code":"6","result":"program is not found","is_login":"0"}
 *               {"code":"7","result":"program is not verify","is_login":"0"}
 *               {"code":"8","result":"company is fully manage","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/issued-to-jira/:report_id',
    isAuth,
    hasPermission(RESOURCE.INTEGRATION, ACTIONS.CREATE),
    [
        check.param('report_id').notEmpty({ignore_whitespace: true}).withMessage({
            "code": "1",
            "result": "report id is empty",
            "is_login": "0"
        }).bail()
            .isMongoId().withMessage({
            "code": "2",
            "result": "report id is not valid",
            "is_login": "0"
        }).customSanitizer(v => safeString(v)).bail(),
        check.body('jira_project_ids').notEmpty({ignore_whitespace: true}).withMessage({
            "code": "1",
            "result": "jira_project_ids is empty",
            "is_login": "0"
        }).bail()
            .custom((value) => {
                const jira_project_ids = JSON.parse(JSON.stringify(value));
                if (!isArray(jira_project_ids) || jira_project_ids.length === 0) {
                    return false;
                }
                return true;
            }).withMessage({
            "code": "1",
            "result": "jira_project_ids is not valid",
            "is_login": "0"
        }).bail()
            .customSanitizer(value => {
                const jira_project_ids = JSON.parse(JSON.stringify(value));
                for (let i = 0; i < jira_project_ids.length; i++) {
                    jira_project_ids[i] = safeString(jira_project_ids[i]);
                }
                return jira_project_ids;
            }),
    ],
    async (req, res) => {
        try {
            const errors = check.validationResult(req);
            if (!errors.isEmpty()) {
                res.json(errors.array()[0].msg);
            } else {
                const user = company.get("companyUser");
                const report_id = safeString(req.params.report_id);
                const jira_project_ids = req.body.jira_project_ids;
                const result = await model.issuedToJira(user, report_id, jira_project_ids);
                if (typeof result === 'number') {
                    if (result === 1) {
                        res.json({"result": "Jira integration not found!", "code": "1", "is_login": "0"});
                    } else if (result === 2) {
                        res.json({"result": "Report not found!", "code": "2", "is_login": "0"});
                    } else if (result === 3) {
                        res.json({"result": "program is nit exists!", "code": "3", "is_login": "0"});
                    } else if (result === 4) {
                        return res.json({
                            "result": "report status must be approve or resolve!",
                            "code": "1",
                            "is_login": "0"
                        });
                    }
                }
                if (result && result.jira_error) {
                    return res.json({"result": result.response, "code": "1", "is_login": "0"});
                }
                let message = "Report info successfully issued to Jira.";
                if (result && result.more_than_max_length_property && result.more_than_max_length_property.length > 0) {
                    message = `${result.more_than_max_length_property} was more than 32765 characters and we can only send the first 32765 number of character for this report to Jira (Notice: this limitation are from Jira ).`
                }
                return res.json({
                    "result": message,
                    "code": "0",
                    "is_login": "0"
                });
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
 * /company/submit_report/set-reference-id/{report_id}:
 *   post:
 *     tags:
 *       - company - submit
 *     description:  set report reference-id
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
 *       - name : reference_id
 *         type : string
 *         in: query
 *         description : reference_id
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
 *               {"code":"1","result":"user is invalid","is_login":"0"}
 *               {"code":"2,"result":"report is invalid","is_login":"0"}
 *               {"code":"3","result":"reference_id is invalid","is_login":"0"}
 *               {"code":"4","result":"report is not found","is_login":"0"}
 *               {"code":"6","result":"program is not found","is_login":"0"}
 *               {"code":"7","result":"program is not verify","is_login":"0"}
 *               {"code":"8","result":"company is fully manage","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/set-reference-id/:report_id',
    isAuth, hasPermission(RESOURCE.REPORT, ACTIONS.UPDATE),
    [
        check.param('report_id').notEmpty({ignore_whitespace: true}).withMessage({
            "code": "1",
            "result": "report id is empty",
            "is_login": "0"
        }).bail()
            .isMongoId().withMessage({
            "code": "2",
            "result": "report id is not valid",
            "is_login": "0"
        }).customSanitizer(v => safeString(v)).bail(),
        check.body('reference_id').optional({checkFalsy: true})
            .isMongoId().withMessage({
            "code": "3",
            "result": "reference id is not valid",
            "is_login": "0"
        }).customSanitizer(v => safeString(v)).bail()
    ],
    async (req, res) => {
        try {
            const errors = check.validationResult(req);
            if (!errors.isEmpty()) {
                return res.json(errors.array()[0].msg);
            }
            const user = company.get("companyUser");
            const report_id = safeString(req.params.report_id);
            const reference_id = safeString(req.body.reference_id);
            const result = await model.setReferenceId(user, report_id, reference_id, user.parent_user_id, user.access_program_list);
            if (typeof result === 'number') {
                if (result === 4) {
                    res.json({"result": "report is not found.", "code": "4", "is_login": "0"});
                } else if (result === 5) {
                    res.json({"result": "report is invalid.", "code": "5", "is_login": "0"});
                } else if (result === 6) {
                    res.json({"result": "program is not verify.", "code": "6", "is_login": "0"});
                } else if (result === 7) {
                    res.json({"result": "company is fully manage.", "code": "7", "is_login": "0"});
                } else if (result === 8) {
                    res.json({"result": "refrenced report not found.", "code": "8", "is_login": "0"});
                } else if (result === 9) {
                    res.json({
                        "result": "reference report status must be approve or resolve.",
                        "code": "7",
                        "is_login": "0"
                    });
                } else if (result === 10) {
                    res.json({
                        "result": "You don't have permission to change this report",
                        "code": "8",
                        "is_login": "0"
                    });
                }
                return;
            }
            return res.json({
                "result": "success",
                "code": "0",
                "is_login": "0"
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
 * /company/submit_report/change-report-activity/{report_id}:
 *   post:
 *     tags:
 *       - company - submit
 *     description: change report activity
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
 *       - name : is_close
 *         type : number
 *         in: query
 *         description : is_close
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
 *               {"code":"1","result":"user is invalid","is_login":"0"}
 *               {"code":"2,"result":"report is invalid","is_login":"0"}
 *               {"code":"3","result":"activity is invalid","is_login":"0"}
 *               {"code":"4","result":"report is not found","is_login":"0"}
 *               {"code":"5","result":"program is not found","is_login":"0"}
 *               {"code":"6","result":"program is not verify","is_login":"0"}
 *               {"code":"7","result":"company is fully manage","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/change-report-activity/:report_id', isAuth, hasPermission(RESOURCE.REPORT, ACTIONS.UPDATE), async (req, res) => {
    try {
        const user = company.get("companyUser");
        const report_id = safeString(req.params.report_id);
        const is_close = safeString(req.body.is_close);
        const result = await model.changeReportActivity(user, report_id, is_close, user.parent_user_id, user.access_program_list);
        if (typeof result === 'number') {
            if (result === 1) {
                res.json({"result": "user is invalid", "code": "1", "is_login": "0"});
            } else if (result === 2) {
                res.json({"result": "report is invalid", "code": "2", "is_login": "0"});
            } else if (result === 3) {
                res.json({"result": "activity is invalid", "code": "3", "is_login": "0"});
            } else if (result === 4) {
                res.json({"result": "report is not found", "code": "4", "is_login": "0"});
            } else if (result === 5) {
                res.json({"result": "program is not found", "code": "5", "is_login": "0"});
            } else if (result === 6) {
                res.json({"result": "program is not verify", "code": "6", "is_login": "0"});
            } else if (result === 7) {
                res.json({"result": "company is fully manage", "code": "7", "is_login": "0"});
            } else if (result === 8) {
                res.json({"result": "You don't have permission to change this report", "code": "8", "is_login": "0"});
            }
            return;
        }
        return res.json({
            "result": {comment: result.comment, send_date_time: result.send_date_time},
            "code": "0",
            "is_login": "0"
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
 * /company/user/approved-report-list:
 *   get:
 *     tags:
 *       - company
 *     description: get approved-report-list
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
 *               {"code":"0","result":{data},"is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.get('/approved-report-list', isAuth, hasPermission(RESOURCE.REPORT, ACTIONS.READ), uploader.none(), async (req, res) => {
    try {
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else {
            let user = company.get('companyUser');
            const page = toNumber(req.query.page);
            let data = await model.getApprovedReportList(getUserId(user), page, user.parent_user_id, user.access_program_list);
            res.json({"result": data, "code": "0", "is_login": "0"});
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
 * /company/user/report-count:
 *   get:
 *     tags:
 *       - company
 *     description: get approved-report-count
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : program_type
 *         type : number
 *         in: query
 *         required : true
 *         description : program_type
 *       - name : status
 *         type : string
 *         in: query
 *         required : true
 *         description : status
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
 *               {"code":"0","result":{data},"is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.get('/report-count', isAuth,
    hasPermission(RESOURCE.REPORT, ACTIONS.READ),
    uploader.none(),
    [check.query('program_type').optional({nullable: true})
        .isInt({gt: 0}).withMessage({"result": "program_type is not valid", "code": "2", "is_login": "0"}).bail()
        .isIn([1, 2, 3]).withMessage({"result": "program_type is not valid", "code": "2", "is_login": "0"}).toInt(),
        check.query('status').optional({nullable: true})
            .isString().withMessage({"result": "status is not valid", "code": "2", "is_login": "0"}).bail()
            .isIn(["approved", "resolved"]).withMessage({
            "result": "status is not valid",
            "code": "2",
            "is_login": "0"
        })],
    async (req, res) => {
        try {
            const errors = check.validationResult(req);
            if (!errors.isEmpty()) {
                res.json(errors.array()[0].msg);
            } else {
                let user = company.get('companyUser');
                const program_type = req.query.program_type - 1;
                const status = safeString(req.query.status);
                let data = await model.getApproveReportsCounts(getUserId(user), program_type, status, user.parent_user_id, user.access_program_list);
                res.json({"result": data, "code": "0", "is_login": "0"});
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
 * /company/user/status-report-count:
 *   get:
 *     tags:
 *       - company
 *     description: get status-report-count
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : program_type
 *         type : number
 *         in: query
 *         required : true
 *         description : program_type
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
 *               {"code":"0","result":{data},"is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.get('/status-report-count', isAuth,
    hasPermission(RESOURCE.REPORT, ACTIONS.READ),
    uploader.none(),
    [check.query('program_type').optional({nullable: true})
        .isInt({gt: 0}).withMessage({"result": "program_type is not valid", "code": "2", "is_login": "0"}).bail()
        .isIn([1, 2, 3]).withMessage({"result": "program_type is not valid", "code": "2", "is_login": "0"}).toInt()],
    async (req, res) => {
        try {
            const errors = check.validationResult(req);
            if (!errors.isEmpty()) {
                res.json(errors.array()[0].msg);
            } else {
                let user = company.get('companyUser');
                const program_type = req.query.program_type - 1;
                let data = await model.getReportsCountsBaseStatus(getUserId(user), program_type, user.parent_user_id, user.access_program_list);
                res.json({"result": data, "code": "0", "is_login": "0"});
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
 * /company/submit_report/approved-report-count:
 *   get:
 *     tags:
 *       - company - submit
 *     description: get approved-report-count
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
 *               {"code":"0","result":{data},"is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.get('/approved-report-count', isAuth, hasPermission(RESOURCE.REPORT, ACTIONS.READ), async (req, res) => {
    try {
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else {
            let user = company.get('companyUser');
            let data = await model.getApproveReportsCount(getUserId(user), user.parent_user_id, user.access_program_list);
            res.json({"result": data, "code": "0", "is_login": "0"});
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
