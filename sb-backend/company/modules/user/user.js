require('../../init');

const model = require('./user.model');
const router = express.Router();
let fileAvatar = {"dir": "avatars", "field": "avatar", "type": "image"};
let fileTAX = {"dir": "company/tax", "field": "tax", "type": "file"};
const fs = require('fs');
const path = require('path');

let uploadDirs = [
    fileAvatar, fileTAX
];


/**
 * @swagger
 * /company/user/get-jira-authentications:
 *   get:
 *     tags:
 *       - company - user
 *     description: get-jira-authentications
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
 *               {"code":"0","result":{obj},"is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.get('/get-jira-authentications',
    isAuth, hasPermission(RESOURCE.INTEGRATION, ACTIONS.READ),
    async (req, res) => {
        try {
            let user = company.get('companyUser');
            let result = await model.getJiraAuthentications(getUserId(user));
            res.json({"result": result, "code": "0", "is_login": "0"});
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
 * /company/user/get-jira-projects/{authentication_id}:
 *   get:
 *     tags:
 *       - company - user
 *     description: get-jira-projects
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : authentication_id
 *         type : string
 *         in: path
 *         required : true
 *         description : authentication_id
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
router.get('/get-jira-projects/:authentication_id',
    isAuth, hasPermission(RESOURCE.INTEGRATION, ACTIONS.CREATE),
    [
        check.param('authentication_id').trim().not().isEmpty()
            .withMessage({"result": "authentication_id is empty", "code": "1", "is_login": "0"})
            .isMongoId().withMessage({"result": "authentication_id is invalid", "code": "1", "is_login": "0"})
    ],
    async (req, res) => {
        try {
            const errors = check.validationResult(req);
            if (!errors.isEmpty()) {
                res.json(errors.array()[0].msg);
            } else {
                let user = company.get('companyUser');
                const authentication_id = safeString(req.params.authentication_id);
                let result = await model.getJiraProjects(getUserId(user), authentication_id, user.parent_user_id, user.access_program_list);
                if (result === 1) {
                    return res.json({
                        "result": "Valid Jira authentication is not exists!",
                        "code": "1",
                        "is_login": "0"
                    });
                } else if (result === 2) {
                    return res.json({
                        "result": "There is not valid program!",
                        "code": "1",
                        "is_login": "0"
                    });
                }
                if (result.jira_error) {
                    return res.json({"result": result.response, "code": "1", "is_login": "0"});
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
 * /company/user/get-jira-fields/{authentication_id}:
 *   get:
 *     tags:
 *       - company - user
 *     description: get-jira-fields
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : authentication_id
 *         type : string
 *         in: path
 *         required : true
 *         description : authentication_id
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
router.get('/get-jira-fields/:authentication_id',
    isAuth, hasPermission(RESOURCE.INTEGRATION, ACTIONS.CREATE),
    [
        check.param('authentication_id').trim().not().isEmpty()
            .withMessage({"result": "authentication_id is empty", "code": "1", "is_login": "0"})
            .isMongoId().withMessage({"result": "authentication_id is invalid", "code": "1", "is_login": "0"})
    ],
    async (req, res) => {
        try {
            const errors = check.validationResult(req);
            if (!errors.isEmpty()) {
                res.json(errors.array()[0].msg);
            } else {
                let user = company.get('companyUser');
                const authentication_id = safeString(req.params.authentication_id);
                let result = await model.getJiraFields(getUserId(user), authentication_id);
                if (result === 1) {
                    return res.json({
                        "result": "Valid Jira autentication is not exists!",
                        "code": "1",
                        "is_login": "0"
                    });
                }
                if (result.jira_error) {
                    return res.json({"result": result.response, "code": "1", "is_login": "0"});
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
 * /company/user/get-jira-priorities/{authentication_id}:
 *   get:
 *     tags:
 *       - company - user
 *     description: get-jira-priorities
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : authentication_id
 *         type : string
 *         in: path
 *         required : true
 *         description : authentication_id
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
router.get('/get-jira-priorities/:authentication_id',
    isAuth,
    hasPermission(RESOURCE.INTEGRATION, ACTIONS.CREATE),
    [
        check.param('authentication_id').trim().not().isEmpty()
            .withMessage({"result": "authentication_id is empty", "code": "1", "is_login": "0"})
            .isMongoId().withMessage({"result": "authentication_id is invalid", "code": "1", "is_login": "0"})
    ],
    async (req, res) => {
        try {
            const errors = check.validationResult(req);
            if (!errors.isEmpty()) {
                res.json(errors.array()[0].msg);
            } else {
                let user = company.get('companyUser');
                const authentication_id = safeString(req.params.authentication_id);
                let result = await model.getJiraPriorities(getUserId(user), authentication_id);
                if (result === 1) {
                    return res.json({
                        "result": "Valid Jira autentication is not exists!",
                        "code": "1",
                        "is_login": "0"
                    });
                }
                if (result.jira_error) {
                    return res.json({"result": result.response, "code": "1", "is_login": "0"});
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
 * /company/user/delete-integration/{integration_id}:
 *   delete:
 *     tags:
 *       - company - user
 *     description: delete-integration
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : integration_id
 *         type : string
 *         in: path
 *         required : true
 *         description : integration_id
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
router.delete('/delete-integration/:integration_id',
    isAuth, hasPermission(RESOURCE.INTEGRATION, ACTIONS.DELETE),
    [
        check.param('integration_id').trim().not().isEmpty()
            .withMessage({"result": "integration_id is empty", "code": "1", "is_login": "0"})
            .isMongoId().withMessage({"result": "integration_id is invalid", "code": "1", "is_login": "0"})
    ],
    async (req, res) => {
        try {
            const errors = check.validationResult(req);
            if (!errors.isEmpty()) {
                res.json(errors.array()[0].msg);
            } else {
                let user = company.get('companyUser');
                const integration_id = safeString(req.params.integration_id);
                let result = await model.deleteIntegration(getUserId(user), integration_id, user.parent_user_id, user.access_program_list);
                if (result === 1) {
                    return res.json({"result": "Integration is not found!", "code": "1", "is_login": "0"});
                } else if (result === 2) {
                    return res.json({
                        "result": "you don't have access to delete this integration",
                        "code": "1",
                        "is_login": "0"
                    });
                }
                res.json({"result": result, "code": "0", "is_login": "0"});
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
 * /company/user/delete-integration/{integration_id}:
 *   delete:
 *     tags:
 *       - company - user
 *     description: delete-integration
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : authentication_id
 *         type : string
 *         in: path
 *         required : true
 *         description : authentication_id
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
router.delete('/delete-integration-authentication/:authentication_id',
    isAuth, hasPermission(RESOURCE.INTEGRATION, ACTIONS.DELETE),
    [
        check.param('authentication_id').trim().not().isEmpty()
            .withMessage({"result": "authentication_id is empty", "code": "1", "is_login": "0"})
            .isMongoId().withMessage({"result": "authentication_id is invalid", "code": "1", "is_login": "0"})
    ],
    async (req, res) => {
        try {
            const errors = check.validationResult(req);
            if (!errors.isEmpty()) {
                res.json(errors.array()[0].msg);
            } else {
                let user = company.get('companyUser');
                const authentication_id = safeString(req.params.authentication_id);
                let result = await model.deleteJiraAuthentication(getUserId(user), authentication_id);
                if (result === 1) {
                    return res.json({"result": "Authentication is not found!", "code": "1", "is_login": "0"});
                } else if (result === 2) {
                    return res.json({
                        "result": "This authentication is used in active integration. You cannot delete it!",
                        "code": "2",
                        "is_login": "0"
                    });
                }
                res.json({"result": result, "code": "0", "is_login": "0"});
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
 * /company/user/change-integration-activity/{integration_id}:
 *   post:
 *     tags:
 *       - company - user
 *     description: change-integration-activity
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : integration_id
 *         type : string
 *         in: path
 *         required : true
 *         description : integration_id
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
router.post('/change-integration-activity/:integration_id',
    isAuth, hasPermission(RESOURCE.INTEGRATION, ACTIONS.UPDATE),
    [
        check.param('integration_id').trim().not().isEmpty()
            .withMessage({"result": "integration_id is empty", "code": "1", "is_login": "0"})
            .isMongoId().withMessage({"result": "integration_id is invalid", "code": "1", "is_login": "0"})
    ],
    async (req, res) => {
        try {
            const errors = check.validationResult(req);
            if (!errors.isEmpty()) {
                res.json(errors.array()[0].msg);
            } else {
                let user = company.get('companyUser');
                const integration_id = safeString(req.params.integration_id);
                let result = await model.changeIntegrationActivity(getUserId(user), integration_id, user.parent_user_id, user.access_program_list);
                if (result === 1) {
                    return res.json({"result": "Integration is not found!", "code": "1", "is_login": "0"});
                } else if (result === 2) {
                    return res.json({
                        "result": "you don't have access to change this integration",
                        "code": "1",
                        "is_login": "0"
                    });
                }
                res.json({"result": result, "code": "0", "is_login": "0"});
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
 * /company/user/get-jira-integrations:
 *   get:
 *     tags:
 *       - company - user
 *     description: get-jira-integrations
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
 *               {"code":"0","result":{obj},"is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.get('/get-jira-integrations',
    isAuth, hasPermission(RESOURCE.INTEGRATION, ACTIONS.READ),
    async (req, res) => {
        try {
            let user = company.get('companyUser');
            let result = await model.getJiraIntegrations(getUserId(user), user.parent_user_id, user.access_program_list);
            res.json({"result": result, "code": "0", "is_login": "0"});
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
 * /company/user/create-jira-authentication:
 *   post:
 *     tags:
 *       - company - user
 *     description: create-jira-authentications
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
 *       - name : jira_url
 *         type : string
 *         in: formData
 *         required : true
 *         description : jira_url
 *       - name : shared_secret
 *         type : string
 *         in: formData
 *         required : true
 *         description : shared_secret
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
router.post('/create-jira-authentication',
    isAuth,
    hasPermission(RESOURCE.INTEGRATION, ACTIONS.CREATE),
    [
        check.body('title').trim().not().isEmpty()
            .withMessage({"result": "title is empty", "code": "1", "is_login": "0"})
            .isString().withMessage({"result": "title is not valid", "code": "3", "is_login": "0"})
            .isLength({max: 100}).withMessage({
            "result": "title must be between 1 and 100 characters",
            "code": "15",
            "is_login": "0"
        })
            .matches('^[a-zA-ZäåöÄÅÖ0-9\\s]+$').withMessage({
            "result": "Only use letters, numbers and '_'",
            "code": "14",
            "is_login": "0"
        }),
        check.body('jira_url').trim().not().isEmpty()
            .withMessage({"result": "jira_url is empty", "code": "1", "is_login": "0"})
            .isString().withMessage({"result": "jira_url is not valid", "code": "3", "is_login": "0"})
            .isURL().withMessage({"result": "jira_url is not a valid url", "code": "3", "is_login": "0"})
            .isLength({max: 512}).withMessage({
            "result": "jira_url must be between 1 and 512 characters",
            "code": "15",
            "is_login": "0"
        }),
        check.body('shared_secret').trim().not().isEmpty()
            .withMessage({"result": "shared_secret is empty", "code": "1", "is_login": "0"})
            .isString().withMessage({"result": "shared_secret is not valid", "code": "3", "is_login": "0"})
            .isLength({max: 100}).withMessage({
            "result": "jira_url must be between 1 and 100 characters",
            "code": "15",
            "is_login": "0"
        }),
    ],
    async (req, res) => {
        try {
            const errors = check.validationResult(req);
            if (!errors.isEmpty()) {
                res.json(errors.array()[0].msg);
            } else {
                let user = company.get('companyUser');
                const title = safeString(req.body.title);
                const jira_url = safeString(req.body.jira_url);
                const shared_secret = safeString(req.body.shared_secret);
                let result = await model.createJiraAuth(getUserId(user), title, jira_url, shared_secret);
                if (typeof result === 'number') {
                    if (result === 1) {
                        return res.json({"result": "Title is already exists", "code": "1", "is_login": "0"});
                    } else if (result === 2) {
                        return res.json({
                            "result": "Auth token not found. please try again!",
                            "code": "1",
                            "is_login": "0"
                        });
                    }
                }
                if (result.jira_error) {
                    return res.json({"result": result.response, "code": "1", "is_login": "0"});
                }
                res.json({"result": result, "code": "0", "is_login": "0"});
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
 * /company/user/create-jira-integration:
 *   post:
 *     tags:
 *       - company - user
 *     description: create-jira-integration
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
 *       - name : description
 *         type : string
 *         in: formData
 *         description : description
 *       - name : authentication_id
 *         type : string
 *         in: formData
 *         required : true
 *         description : authentication_id
 *       - name : project_id
 *         type : string
 *         in: formData
 *         required : true
 *         description : project_id
 *       - name : issue_id
 *         type : string
 *         in: formData
 *         required : true
 *         description : issue_id
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
router.post('/create-jira-integration',
    isAuth, hasPermission(RESOURCE.INTEGRATION, ACTIONS.CREATE),
    [
        check.body('title').trim().not().isEmpty()
            .withMessage({"result": "title is empty", "code": "1", "is_login": "0"})
            .isString().withMessage({"result": "title is not valid", "code": "3", "is_login": "0"})
            .isLength({max: 100}).withMessage({
            "result": "title must be between 1 and 100 characters",
            "code": "15",
            "is_login": "0"
        })
            .matches('^[a-zA-ZäåöÄÅÖ0-9\\s]+$').withMessage({
            "result": "Only use letters, numbers and '_'",
            "code": "14",
            "is_login": "0"
        }),
        check.body('authentication_id').trim().not().isEmpty()
            .withMessage({"result": "authentication_id is empty", "code": "1", "is_login": "0"})
            .isMongoId().withMessage({"result": "authentication_id is invalid", "code": "1", "is_login": "0"}),
        check.body('project_id').trim().not().isEmpty()
            .withMessage({"result": "project_id is empty", "code": "1", "is_login": "0"}).bail()
            .isString().withMessage({"result": "project_id is not valid", "code": "1", "is_login": "0"}).bail(),
        check.body('programs').notEmpty({ignore_whitespace: true})
            .withMessage({"result": "authentication_id is empty", "code": "1", "is_login": "0"})
            .customSanitizer(value => JSON.parse(JSON.stringify(value)))
            .custom(programs => {
                if (!isArray(programs) || programs.length === 0) {
                    return false;
                }
                for (let i = 0; i < programs.length; i++) {
                    if (!programs[i].title || !programs[i].value || !isObjectID(programs[i].value)) {
                        return false;
                    }
                }
                return true;
            }).withMessage({"result": "program is not valid", "code": "1", "is_login": "0"}).bail()
            .customSanitizer(programs => {
                const new_programs = [];
                for (let i = 0; i < programs.length; i++) {
                    const _id = safeString(programs[i].value);
                    const name = safeString(programs[i].title);
                    new_programs.push({_id, name});
                }
                return new_programs;
            }),
        check.body('priorities').notEmpty({ignore_whitespace: true})
            .withMessage({"result": "priorities is empty", "code": "1", "is_login": "0"})
            .customSanitizer(value => JSON.parse(JSON.stringify(value)))
            .custom(priorities => {
                if (!isArray(priorities) || priorities.length === 0) {
                    return false;
                }
                for (let i = 0; i < priorities.length; i++) {
                    if (!priorities[i].title ||
                        !priorities[i].jiraKey ||
                        !isNumber(priorities[i].sbKey) ||
                        priorities[i].sbKey < 0 ||
                        priorities[i].sbKey > 4) {
                        return false;
                    }
                }
                return true;
            }).withMessage({"result": "priorities is not valid", "code": "1", "is_login": "0"}).bail()
            .customSanitizer(priorities => {
                const new_priorities = [];
                for (let i = 0; i < priorities.length; i++) {
                    const jira_key = safeString(priorities[i].jiraKey);
                    const sb_key = toNumber(priorities[i].sbKey);
                    new_priorities.push({jira_key, sb_key});
                }
                return new_priorities;
            }),
        check.body('properties').notEmpty({ignore_whitespace: true})
            .withMessage({"result": "properties is empty", "code": "1", "is_login": "0"})
            .customSanitizer(value => JSON.parse(JSON.stringify(value)))
            .custom(properties => {
                if (!isArray(properties) || properties.length === 0) {
                    return false;
                }
                for (let i = 0; i < properties.length; i++) {
                    if (!properties[i].sb_property ||
                        !properties[i].sb_property.value ||
                        !properties[i].jira_property ||
                        !properties[i].jira_property.value
                    ) {
                        return false;
                    }
                }
                return true;
            }).withMessage({"result": "properties is not valid", "code": "1", "is_login": "0"}).bail()
            .customSanitizer(properties => {
                const new_properties = [];
                for (let i = 0; i < properties.length; i++) {
                    const jira_key = safeString(properties[i].jira_property.value);
                    const jira_title = safeString(properties[i].jira_property.title);
                    const sb_key = safeString(properties[i].sb_property.value);
                    new_properties.push({jira_key, jira_title, sb_key});
                }
                return new_properties;
            }),
        check.body('issue_id').trim().not().isEmpty()
            .withMessage({"result": "issue_id is empty", "code": "1", "is_login": "0"}).bail()
            .isString().withMessage({"result": "issue_id is not valid", "code": "1", "is_login": "0"}).bail(),
    ],
    async (req, res) => {
        try {
            const errors = check.validationResult(req);
            if (!errors.isEmpty()) {
                res.json(errors.array()[0].msg);
            } else {
                let user = company.get('companyUser');
                const title = safeString(req.body.title);
                const description = safeString(req.body.description);
                let programs = req.body.programs;
                let properties = req.body.properties;
                let priorities = req.body.priorities;
                const project_id = safeString(req.body.project_id);
                const issue_id = safeString(req.body.issue_id);
                const authentication_id = safeString(req.body.authentication_id);
                let result = await model.createJiraIntegration(getUserId(user), title, description, issue_id, authentication_id, project_id, programs, properties, priorities, user.parent_user_id, user.access_program_list);
                if (typeof result === 'number') {
                    if (result === 1) {
                        return res.json({"result": "Title already exists!", "code": "1", "is_login": "0"});
                    } else if (result === 2) {
                        return res.json({
                            "result": "Selected Jira authentication is not exists!",
                            "code": "1",
                            "is_login": "0"
                        });
                    } else if (result === 3) {
                        return res.json({
                            "result": "Selected Jira authentication is not Active!",
                            "code": "1",
                            "is_login": "0"
                        });
                    } else if (result === 4) {
                        return res.json({
                            "result": "you already add integration for this jira project!",
                            "code": "1",
                            "is_login": "0"
                        });
                    } else if (result === 5) {
                        return res.json({
                            "result": "programs is not valid!",
                            "code": "1",
                            "is_login": "0"
                        });
                    } else if (result === 6) {
                        return res.json({
                            "result": "project_id is not valid!",
                            "code": "1",
                            "is_login": "0"
                        });
                    } else if (result === 7) {
                        return res.json({
                            "result": "issue_type is not valid!",
                            "code": "1",
                            "is_login": "0"
                        });
                    } else if (result === 8) {
                        return res.json({
                            "result": "properties is not valid!",
                            "code": "1",
                            "is_login": "0"
                        });
                    } else if (result === 9) {
                        return res.json({
                            "result": "priorities is not valid!",
                            "code": "1",
                            "is_login": "0"
                        });
                    }
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
 * /company/user/get-jira-authentication/{authentication_id}:
 *   get:
 *     tags:
 *       - company - user
 *     description: get-jira-authentication
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : authentication_id
 *         type : string
 *         in: path
 *         required : true
 *         description : authentication_id
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
router.get('/get-jira-authentication/:authentication_id',
    isAuth, hasPermission(RESOURCE.INTEGRATION, ACTIONS.READ),
    [
        check.param('authentication_id').trim().not().isEmpty()
            .withMessage({"result": "authentication_id is empty", "code": "1", "is_login": "0"})
            .isMongoId().withMessage({"result": "authentication_id is invalid", "code": "1", "is_login": "0"}),
    ],
    async (req, res) => {
        try {
            const errors = check.validationResult(req);
            if (!errors.isEmpty()) {
                res.json(errors.array()[0].msg);
            } else {
                let user = company.get('companyUser');
                const authentication_id = safeString(req.params.authentication_id);
                let result = await model.getJiraAuthentication(getUserId(user), authentication_id);
                if (result === 1) {
                    return res.json({"result": "jira Authentication is not exist.", "code": "1", "is_login": "0"});
                } else if (result === 2) {
                    return res.json({
                        "result": "jira Authentication is already activated.",
                        "code": "2",
                        "is_login": "0"
                    });
                } else if (result === 3) {
                    return res.json({
                        "result": "Auth token not found. please try again!",
                        "code": "2",
                        "is_login": "0"
                    });
                }
                if (result && result.jira_error) {
                    return res.json({"result": result.response, "code": "1", "is_login": "0"});
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
 * /company/user/verify-jira-access-token":
 *   post:
 *     tags:
 *       - company - user
 *     description: verify-jira-access-token"
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : oauth_token
 *         type : string
 *         in: formData
 *         required : true
 *         description : oauth_token
 *       - name : oauth_verifier
 *         type : string
 *         in: formData
 *         required : true
 *         description : oauth_verifier
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
router.post('/verify-jira-access-token',
    isAuth, hasPermission(RESOURCE.INTEGRATION, ACTIONS.CREATE),
    [
        check.body('oauth_token').trim().not().isEmpty()
            .withMessage({"result": "oauth_token is empty", "code": "1", "is_login": "0"}),
        check.body('oauth_verifier').trim().not().isEmpty()
            .withMessage({"result": "oauth_verifier is empty", "code": "1", "is_login": "0"})
    ],
    async (req, res) => {
        try {
            const errors = check.validationResult(req);
            if (!errors.isEmpty()) {
                res.json(errors.array()[0].msg);
            } else {
                let user = company.get('companyUser');
                const oauth_token = safeString(req.body.oauth_token);
                const oauth_verifier = safeString(req.body.oauth_verifier);
                let result = await model.verifyJiraAuth(getUserId(user), oauth_token, oauth_verifier);
                if (result === 1) {
                    return res.json({"result": "Jira Authentication not found", "code": "1", "is_login": "0"});
                }
                if (result && result.jira_error) {
                    return res.json({"result": result.response, "code": "1", "is_login": "0"});
                }
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
 * /company/user/register:
 *   post:
 *     tags:
 *       - company
 *     description: register company
 *     parameters:
 *       - name : organization_name
 *         type : string
 *         in: formData
 *         required : true
 *         description : organization_name
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
 *       - name : password1
 *         type : string
 *         in: formData
 *         required : true
 *         description : password
 *       - name : password2
 *         type : string
 *         in: formData
 *         required : true
 *         description : confirm password
 *       - name : email
 *         type : string
 *         in: formData
 *         required : true
 *         description : email
 *       - name : role
 *         type : string
 *         in: formData
 *         required : true
 *         description : role
 *       - name : company_country_id
 *         type : string
 *         in: formData
 *         description : company_country_id
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: |
 *               <pre>
 *               {"code":"0","result":"register success"}
 *               {"code":"1","result":"organization_name is empty"}
 *               {"code":"2","result":"first name is empty"}
 *               {"code":"3","result":"last name is empty"}
 *               {"code":"4","result":"role is empty"}
 *               {"code":"5","result":"email is empty"}
 *               {"code":"6","result":"email is not valid"}
 *               {"code":"7","result":"password1 is empty"}
 *               {"code":"8","result":"password2 is empty"}
 *               {"code":"9","result":"confirm password is not matched"}
 *               {"code":"10","result":"email is exist"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/register', uploader.none(), [
    check.body('organization_name').trim().not().isEmpty()
        .withMessage({"result": "organization_name is empty", "code": "1"}),
    check.body('fn').trim().not().isEmpty()
        .withMessage({"result": "first name is empty", "code": "2"}),
    check.body('ln').trim().not().isEmpty()
        .withMessage({"result": "last name is empty", "code": "3"}),
    check.body('role').trim().not().isEmpty()
        .withMessage({"result": "role is empty", "code": "4"}),
    check.body('email').trim().not().isEmpty()
        .withMessage({"result": "email is empty", "code": "5"})
        .isEmail().withMessage({"result": "email is not valid", "code": "6"}),
    check.body('password1').trim().not().isEmpty()
        .withMessage({"result": "password1 is empty", "code": "7"}),
    check.body('password2').trim().not().isEmpty()
        .withMessage({"result": "password2 is empty", "code": "8"}),
], async (req, res) => {
    try {
        let phone = safeString(req.body.phone);
        let email = safeString(req.body.email);
        email = email.toLowerCase();
        let password1 = safeString(req.body.password1);
        let password2 = safeString(req.body.password2);
        let organization_name = safeString(req.body.organization_name);
        let fn = safeString(req.body.fn);
        let ln = safeString(req.body.ln);
        let role = safeString(req.body.role);
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else if (password1 !== password2) {
            res.json({"result": "confirm password is not matched ", "code": "9"});
        } else if (password1.trim().toLowerCase() === email.trim().toLowerCase()) {
            res.json({"result": "email and password are same", "code": "10"});
        } else {
            let company_country_id = safeString(req.body.company_country_id);
            let country_id = '';
            let country_title = '';
            if (company_country_id != '') {
                let country = await model.getCountryRow(company_country_id);
                if (country) {
                    country_id = country._id;
                    country_title = country.title;
                }
            }

            let checkEmail = await model.checkEmail(email);
            if (checkEmail === 0) {
                let resultRegister = await model.register(email, password2
                    , organization_name, fn, ln, role, phone, country_id);
                let url = `${AppConfig.FRONTEND_URL}company/register/verification?token=${resultRegister}`;
                let htmlTemplate = generateEmailTemplate("company_register", fn, {url}, false);
                let email_name = "New Company with the following information Has been Registered";
                let htmlTemplateSupport = generateEmailTemplate("support_register_company", email_name, {
                    fn, ln, email, role, organization_name, phone, country_title
                }, undefined);
                let saleTemplate = generateEmailTemplate("sales_verify_company", `${fn} ${ln}`, {
                    email, role
                    , organization_name, phone, country_title
                }, undefined);
                sendMail(email, "Verify your email and complete your registration", htmlTemplate);
                const notifications_setting = await model.getSettingsByKey(['reciever_email', 'reciever_sales_email']);
                if (notifications_setting) {
                    if (notifications_setting.reciever_email) {
                        sendMail(notifications_setting.reciever_email, "New Company Registration", htmlTemplateSupport);
                    }
                    if (notifications_setting.reciever_sales_email) {
                        sendMail(notifications_setting.reciever_sales_email, 'Notice!! New Company Has been Registered in Securebug', saleTemplate);
                    }
                }
                res.json({"result": "register success", "code": "0"});
            } else {
                res.json({"result": "email is exist!", "code": "10"});
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
 * /company/user/add_member:
 *   post:
 *     tags:
 *       - company
 *     description: add_member company
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
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
 *       - name : email
 *         type : string
 *         in: formData
 *         required : true
 *         description : email
 *       - name : can_see_approve
 *         type : boolean
 *         in: formData
 *         required : true
 *         description : can_see_approve
 *       - name : access_level
 *         type : string
 *         in: formData
 *         required : true
 *         description : access level
 *       - name : comment
 *         type : boolean
 *         in: formData
 *         required : true
 *         description : comment
 *       - name : access_program_list
 *         type : object
 *         in: formData
 *         required : true
 *         description : access_program_list e.g.:["60703d430b4e6d48cc7dc4c9","60703d430b4e6d48cc7dc4c9"]
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: |
 *               <pre>
 *               {"code":"0","result":"add member success"}
 *               {"code":"1","result":"first name is empty"}
 *               {"code":"2","result":"last name is empty"}
 *               {"code":"3","result":"access_level is empty"}
 *               {"code":"4","result":"email is empty"}
 *               {"code":"5","result":"email is not valid"}
 *               {"code":"6","result":"email is exist"}
 *               {"code":"7","result":"parent company is not exist"}
 *               {"code":"8","result":"program id is not valid"}
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
router.post('/add_member', isAuth, hasPermission(RESOURCE.INVITE_MEMBER, ACTIONS.CREATE), uploader.none(), [
    check.body('fn').trim().not().isEmpty()
        .withMessage({"result": "first name is empty", "code": "1"}),
    check.body('ln').trim().not().isEmpty()
        .withMessage({"result": "last name is empty", "code": "2"}),
    check.body('access_level').trim().not().isEmpty()
        .withMessage({"result": "access_level is empty", "code": "3"})
        .isIn(ROLES.VALUES).withMessage({"result": "access_level is not valid", "code": "1"}).bail()
        .toInt(),
    check.body('comment').not().isEmpty().withMessage({"result": "comment is empty", "code": "1"}).bail()
        .isIn([true, false]).withMessage({"result": "comment name is not valid", "code": "1"}).bail()
        .toBoolean(),
    check.body('can_see_approve').not().isEmpty().withMessage({
        "result": "can_see_approve is empty",
        "code": "1"
    }).bail()
        .isIn([true, false]).withMessage({"result": "can_see_approve name is not valid", "code": "1"}).bail()
        .toBoolean(),
    check.body('email').trim().not().isEmpty()
        .withMessage({"result": "email is empty", "code": "4"}),
    check.body('access_program_list').custom((value) => {
        const access_program_list = JSON.parse(value);
        if (!isArray(access_program_list) || access_program_list.length === 0) {
            return false;
        }
        for (let i = 0; i < access_program_list.length; i++) {
            if (!isObjectID(access_program_list[i]._id) || !access_program_list[i].name) {
                return false;
            }
        }
        return true;
    }).withMessage({"result": "access_program_list is not valid", "code": "1"}).bail()
        .customSanitizer((value) => {
            const access_program_list = JSON.parse(value);
            for (let i = 0; i < access_program_list.length; i++) {
                access_program_list[i]._id = safeString(access_program_list[i]._id);
                access_program_list[i].name = safeString(access_program_list[i].name);
            }
            return access_program_list;
        })

], async (req, res) => {
    try {
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else {
            const access_program_list = req.body.access_program_list;
            let email = safeString(req.body.email);
            email = email.toLowerCase();
            let fn = safeString(req.body.fn);
            let ln = safeString(req.body.ln);
            let can_send_comment = Boolean(req.body.comment);
            let can_see_approve = Boolean(req.body.can_see_approve);
            let access_level = req.body.access_level;
            let role = access_level === 1 ? "Admin" : access_level === 2 ? "Viewer" : access_level === 3 ? "Observer" : "";
            let parent_user;
            let member_creator = "you";
            let user = company.get('companyUser');
            let creator_first_name = user.fn;
            let creator_last_name = user.ln;
            if (user.user_level_access === toNumber(ROLES.ADMIN)) {
                parent_user = await model.getRow(user.parent_user_id);
                member_creator = `your admin member ( ${user.fn} ${user.ln} )`;
            } else {
                parent_user = user;
            }
            if (!parent_user) {
                return res.json({"result": "parent company is not exist", "code": "7", "is_login": "0"});
            }

            const program_counts = await SchemaModels.ProgramModel.countDocuments(
                {
                    company_user_id: parent_user._id,
                    _id: {$in: access_program_list.map(p => p._id)}
                }
            );
            if (program_counts !== access_program_list.length) {
                return res.json({"result": "program id is not valid", "code": "8", "is_login": "0"});
            }

            let checkEmail = await model.checkEmail(email);
            if (checkEmail === 0) {
                let result = await model.addMember(parent_user, email,
                    access_level, fn, ln, can_send_comment, can_see_approve,
                    access_program_list, user.parent_user_id, user.access_program_list);

                if (result === 7) {
                    return res.json({"result": "parent company is not exist", "code": "7", "is_login": "0"});
                } else if (result === 1) {
                    return res.json({
                        "result": "you can't access to assigned member progams!",
                        "code": "7",
                        "is_login": "0"
                    });
                }

                let url = `${AppConfig.FRONTEND_URL}company/set-member-password?token=${result.code}`;

                let htmlTemplate = generateEmailTemplate("company_add_member_for_member", fn, {
                    company_name: parent_user.display_name || parent_user.fn,
                    role,
                    url
                }, false);
                let htmlTemplateCompany = generateEmailTemplate("company_add_member_for_company", parent_user.display_name || parent_user.fn, {
                    role,
                    member_name: `${fn} ${ln}`,
                    creator: member_creator
                }, false);
                let htmlTemplateSupport = generateEmailTemplate("company_add_member_for_support", "", {
                    parent_display_name: parent_user.display_name,
                    creator_first_name,
                    creator_last_name,
                    fn,
                    ln,
                    email,
                    role
                }, false);
                sendMail(email, "You have been invited to join the team", htmlTemplate);
                sendMail(parent_user.email, "Invitation to joining the team has been sent", htmlTemplateCompany);
                const notifications_setting = await model.getSettingsByKey(['reciever_email']);
                if (notifications_setting && notifications_setting.reciever_email) {
                    sendMail(notifications_setting.reciever_email, "Team Member has been added", htmlTemplateSupport);
                }
                res.json({"result": {"user_id": result.user_id}, "code": "0", "is_login": "0"});
            } else {
                res.json({"result": "email is exist!", "code": "6"});
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
 * /company/user/edit_member:
 *   post:
 *     tags:
 *       - company
 *     description: edit member company
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : user_id
 *         type : string
 *         in: formData
 *         required : true
 *         description : user id
 *       - name : fn
 *         type : string
 *         in: formData
 *         required : true
 *         description : first name
 *       - name : comment
 *         type : boolean
 *         in: formData
 *         required : true
 *         description : comment
 *       - name : access_program_list
 *         type : object
 *         in: formData
 *         required : true
 *         description : access_program_list
 *       - name : ln
 *         type : string
 *         in: formData
 *         required : true
 *         description : last name
 *       - name : email
 *         type : string
 *         in: formData
 *         required : true
 *         description : email
 *       - name : can_see_approve
 *         type : boolean
 *         in: formData
 *         required : true
 *         description : can_see_approve
 *       - name : access_level
 *         type : string
 *         in: formData
 *         required : true
 *         description : access level
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: |
 *               <pre>
 *               {"code":"0","result":"edit member success","is_login":"0"}
 *               {"code":"1","result":"first name is empty"}
 *               {"code":"2","result":"last name is empty"}
 *               {"code":"3","result":"access_level is empty"}
 *               {"code":"4","result":"email is empty"}
 *               {"code":"4","result":"comment is empty"}
 *               {"code":"5","result":"email is not valid"}
 *               {"code":"6","result":"email is exist"}
 *               {"code":"7","result":"user id is empty"}
 *               {"code":"8","result":"user id not valid"}
 *               {"code":"9","result":"user not found"}
 *               {"code":"10","result":"This member's email is not editable"}
 *               {"code":"403","result":"You don't have permission for this action"}
 *               {"code":"-1","result":"token is empty","is_login":"-1"}
 *               {"code":"-1","result":"token invalid","is_login":"-1"}
 *               {"code":"-1","result":"token expire","is_login":"-1"}
 *               {"code":"-2","result":"account is not verify","is_login":"-2"}
 *               {"code":"-3","result":"account is disabled","is_login":"-3"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/edit_member', isAuth, hasPermission(RESOURCE.INVITE_MEMBER, ACTIONS.UPDATE), uploader.none(), [

    check.body('fn').trim().not().isEmpty()
        .withMessage({"result": "first name is empty", "code": "1"}),
    check.body('ln').trim().not().isEmpty()
        .withMessage({"result": "last name is empty", "code": "2"}),
    check.body('access_level').trim().not().isEmpty()
        .withMessage({"result": "access_level is empty", "code": "3"})
        .isIn(ROLES.VALUES).withMessage({"result": "access_level is not valid", "code": "1"}).bail()
        .toInt(),
    check.body('email').trim().not().isEmpty()
        .withMessage({"result": "email is empty", "code": "4"}),
    check.body('comment').not().isEmpty().withMessage({"result": "comment name is empty", "code": "1"}).bail()
        .isIn([true, false]).withMessage({"result": "comment name is not valid", "code": "1"}).bail()
        .toBoolean(),
    check.body('can_see_approve').not().isEmpty().withMessage({
        "result": "can_see_approve name is empty",
        "code": "1"
    }).bail()
        .isIn([true, false]).withMessage({"result": "can_see_approve name is not valid", "code": "1"}).bail()
        .toBoolean(),
    check.body('user_id').trim().not().isEmpty()
        .withMessage({"result": "user id is empty", "code": "7"}),
    check.body('access_program_list').custom((value) => {
        const access_program_list = JSON.parse(value);
        if (!isArray(access_program_list) || access_program_list.length === 0) {
            return false;
        }
        for (let i = 0; i < access_program_list.length; i++) {
            if (!isObjectID(access_program_list[i]._id) || !access_program_list[i].name) {
                return false;
            }
        }
        return true;
    }).withMessage({"result": "access_program_list is not valid", "code": "1"}).bail()
        .customSanitizer((value) => {
            const access_program_list = JSON.parse(value);
            for (let i = 0; i < access_program_list.length; i++) {
                access_program_list[i]._id = safeString(access_program_list[i]._id);
                access_program_list[i].name = safeString(access_program_list[i].name);
            }
            return access_program_list;
        })
], async (req, res) => {
    try {
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else {
            let email = safeString(req.body.email);
            let parent_user;
            let member_creator = "you";
            let user = company.get('companyUser');
            let creator_first_name = user.fn;
            let creator_last_name = user.ln;
            const access_program_list = req.body.access_program_list;
            if (user.user_level_access === toNumber(ROLES.ADMIN)) {
                parent_user = await model.getRow(user.parent_user_id);
                member_creator = `your admin member ( ${user.fn} ${user.ln} )`;
            } else {
                parent_user = user;
            }
            if (!parent_user) {
                return res.json({"result": "parent company is not exist", "code": "7", "is_login": "0"});
            }
            email = email.toLowerCase();
            let fn = safeString(req.body.fn);
            let ln = safeString(req.body.ln);
            let can_send_comment = Boolean(req.body.comment);
            let can_see_approve = Boolean(req.body.can_see_approve);
            let access_level = req.body.access_level;
            let role = access_level === 1 ? "Admin" : access_level === 2 ? "Viewer" : access_level === 3 ? "Observer" : "";
            let user_id = safeString(req.body.user_id);
            const program_counts = await SchemaModels.ProgramModel.countDocuments(
                {
                    company_user_id: parent_user._id,
                    _id: {$in: access_program_list.map(p => p._id)}
                }
            );
            if (program_counts !== access_program_list.length) {
                return res.json({"result": "program id is not valid", "code": "8", "is_login": "0"});
            }
            let checkEmail = await model.checkEmailForEdit(user_id, email);
            if (checkEmail === 0) {
                let result = await model.editMember(email, access_level,
                    fn, ln, user_id, parent_user._id,
                    can_send_comment, can_see_approve, access_program_list,
                    user.parent_user_id, user.access_program_list);
                if (result === 8) {
                    return res.json({"result": "user id not valid", "code": "8"});
                } else if (result === 9) {
                    return res.json({"result": "user not found", "code": "9"});
                } else if (result === 10) {
                    return res.json({"result": "This member's email is not editable", "code": "10"});
                } else if (result === 1) {
                    return res.json({
                        "result": "you can't access to assigned member progams!",
                        "code": "7",
                        "is_login": "0"
                    });
                } else if (result.code) {
                    let url = `${AppConfig.FRONTEND_URL}company/set-member-password?token=${result.code}`;
                    let htmlTemplate = generateEmailTemplate("company_add_member_for_member", fn, {
                        company_name: parent_user.display_name || parent_user.fn,
                        role,
                        url
                    }, false);
                    let htmlTemplateCompany = generateEmailTemplate("company_add_member_for_company", parent_user.display_name || parent_user.fn, {
                        role,
                        member_name: `${fn} ${ln}`,
                        creator: member_creator
                    }, false);
                    let htmlTemplateSupport = generateEmailTemplate("company_add_member_for_support", "", {
                        parent_display_name: parent_user.display_name,
                        creator_first_name,
                        creator_last_name,
                        fn,
                        ln,
                        email,
                        role
                    }, false);
                    sendMail(email, "You have been invited to join the team", htmlTemplate);
                    sendMail(parent_user.email, "Invitation to joining the team has been sent", htmlTemplateCompany);
                    const notifications_setting = await model.getSettingsByKey(['reciever_email']);
                    if (notifications_setting && notifications_setting.reciever_email) {
                        sendMail(notifications_setting.reciever_email, "Team Member has been added", htmlTemplateSupport);
                    }
                }
                return res.json({
                    "result": {has_2fa: result.has_2fa, user_id: result.user_id},
                    "code": "0",
                    "is_login": "0"
                });
            } else {
                res.json({"result": "email is exist!", "code": "6"});
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
 * /company/user/check_member_password_token:
 *   post:
 *     tags:
 *       - company
 *     description: check member password token company
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : member_password_token
 *         type : string
 *         in: formData
 *         required : true
 *         description : member password token
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: |
 *               <pre>
 *               {"code":"0","result":"token is valid"}
 *               {"code":"1","result":"member password token is empty"}
 *               {"code":"2","result":"token is not valid"}
 *               {"code":"403","result":"You don't have permission for this action"}
 *               {"code":"-1","result":"token is empty","is_login":"-1"}
 *               {"code":"-1","result":"token invalid","is_login":"-1"}
 *               {"code":"-1","result":"token expire","is_login":"-1"}
 *               {"code":"-2","result":"account is not verify","is_login":"-2"}
 *               {"code":"-3","result":"account is disabled","is_login":"-3"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/check_member_password_token', uploader.none(), [
    check.body('member_password_token').trim().not().isEmpty()
        .withMessage({"result": "member password token is empty", "code": "1"})
], async (req, res) => {
    try {
        let member_password_token = safeString(req.body.member_password_token);
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else {
            let result = await model.checkMemberPasswordToken(member_password_token);
            if (result === 2) {
                return res.json({"result": "token is not valid", "code": "2"});
            }
            return res.json({"result": "token is valid", "code": "0"});
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
 * /company/user/set_member_password:
 *   post:
 *     tags:
 *       - company
 *     description: set password company member
 *     parameters:
 *       - name : code
 *         type : string
 *         in: formData
 *         required : true
 *         description : code
 *       - name : password1
 *         type : string
 *         in: formData
 *         required : true
 *         description : new password
 *       - name : password2
 *         type : string
 *         in: formData
 *         required : true
 *         description : confirm new password
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: |
 *               <pre>
 *               {"code":"0","result":"change password ok"}
 *               {"code":"1","result":"code is empty"}
 *               {"code":"2","result":"new password is empty"}
 *               {"code":"3","result":"confirm new password is empty"}
 *               {"code":"4","result":"confirm new password is not matched"}
 *               {"code":"5","result":"code not found"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/set_member_password', uploader.none(), [
    check.body('code').trim().not().isEmpty()
        .withMessage({"result": "code is empty", "code": "1"}),
    check.body('password1').trim().not().isEmpty()
        .withMessage({"result": "password1 is empty", "code": "2"}),
    check.body('password2').trim().not().isEmpty()
        .withMessage({"result": "password2 is empty", "code": "3"}),
], async (req, res) => {
    try {
        let password1 = safeString(req.body.password1);
        let password2 = safeString(req.body.password2);
        let code = safeString(req.body.code);
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else if (password1 !== password2) {
            res.json({"result": "confirm password is not matched ", "code": "4"});
        } else {
            const setPasswordResult = await model.setCompanyMemberPassword(code, password2);
            if (setPasswordResult === 2) {
                return res.json({"result": "code not found", "code": "2"});
            }
            res.json({"result": "change password ok", "code": "0"});
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
 * /company/user/delete_member:
 *   post:
 *     tags:
 *       - company
 *     description: delete member company
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : user_id
 *         type : string
 *         in: formData
 *         required : true
 *         description : user id
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: |
 *               <pre>
 *               {"code":"0","result":"delete member success","is_login":"0"}
 *               {"code":"1","result":"user id is empty"}
 *               {"code":"2","result":"user id is invalid"}
 *               {"code":"3","result":"user not found"}
 *               {"code":"403","result":"You don't have permission for this action"}
 *               {"code":"-1","result":"token is empty","is_login":"-1"}
 *               {"code":"-1","result":"token invalid","is_login":"-1"}
 *               {"code":"-1","result":"token expire","is_login":"-1"}
 *               {"code":"-2","result":"account is not verify","is_login":"-2"}
 *               {"code":"-3","result":"account is disabled","is_login":"-3"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.delete('/delete_member', isAuth, hasPermission(RESOURCE.INVITE_MEMBER, ACTIONS.DELETE), uploader.none(), [
    check.body('user_id').trim().not().isEmpty()
        .withMessage({"result": "user id is empty", "code": "1"}),
], async (req, res) => {
    try {
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else {
            let user_id = safeString(req.body.user_id);
            let parent_user;
            let user = company.get('companyUser');
            if (user.user_level_access === toNumber(ROLES.ADMIN)) {
                parent_user = await model.getRow(user.parent_user_id);
            } else {
                parent_user = user;
            }
            if (!parent_user) {
                return res.json({"result": "parent company is not exist", "code": "7", "is_login": "0"});
            }
            let result = await model.deleteMember(user_id, parent_user._id, user.parent_user_id, user.access_program_list);
            if (result === 1) {
                return res.json({"result": "You don't access to all member's programs!", "code": "2", "is_login": "0"});
            } else if (result === 2) {
                return res.json({"result": "user id is invalid", "code": "2", "is_login": "0"});
            } else if (result === 3) {
                return res.json({"result": "user not found", "code": "3", "is_login": "0"});
            }
            return res.json({"result": "delete member success", "code": "0", "is_login": "0"});
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
 * /company/user/team_member_list/:
 *   get:
 *     tags:
 *       - company - user
 *     description: team member list
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
 *               {"code":"0","result":{obj},"is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.get('/team_member_list', isAuth, hasPermission(RESOURCE.INVITE_MEMBER, ACTIONS.READ), async (req, res) => {
    try {
        let user = company.get('companyUser');
        let result = await model.getTeamMember(getUserId(user), user.user_level_access, user._id, user.parent_user_id, user.access_program_list);
        res.json({"result": result, "code": "0", "is_login": "0"});
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
 * /company/user/verify:
 *   post:
 *     tags:
 *       - company
 *     description: verify company
 *     parameters:
 *       - name : code
 *         type : string
 *         in: formData
 *         required : true
 *         description : verify code
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: |
 *               <pre>
 *               {"code":"0","result":"verify success"}
 *               {"code":"1","result":"code is empty"}
 *               {"code":"2","result":"invalid code"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/verify', uploader.none(), [
    check.body('code').trim().not().isEmpty()
        .withMessage({"result": "code is empty", "code": "1"}),
], async (req, res) => {
    try {
        let code = safeString(req.body.code);
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else {
            let currentUser = await model.getUserByVerifyCode(code);
            if (currentUser) {
                await model.updateVerifyUser(currentUser._id);
                res.json({"result": "verify success!", "code": "0"});
            } else {
                res.json({"result": "invalid code!", "code": "2"});
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
 * /company/user/refresh-token:
 *   post:
 *     tags:
 *       - company
 *     description: refresh-token company
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
router.post('/refresh-token', uploader.none(), [
    check.header('x-token').trim().not().isEmpty()
        .withMessage({"result": "token is empty", "code": "1", "is_login": "0"}),
    check.body('x-refresh-token').trim().not().isEmpty()
        .withMessage({"result": "refresh-token is empty", "code": "2", "is_login": "0"})
], async (req, res) => {
    try {
        let refresh_token = safeString(req.body['x-refresh-token']);
        let token = safeString(req.headers['x-token']);
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else {
            let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            ip = ip.replace(/::ffff:/g, '');
            let user_agent = req.headers['user-agent'];
            const result = await model.refreshToken(token, refresh_token, user_agent, ip);
            if (result === 1) {
                return res.json({"result": "token is invalid", "code": "-1", "is_login": "0"});
            } else if (result === 2) {
                return res.json({"result": "refresh token is invalid", "code": "-1", "is_login": "0"});
            } else {
                return res.json({"result": result, "code": "0", "is_login": "0"});
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
 * /company/user/login:
 *   post:
 *     tags:
 *       - company
 *     description: login company
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
 *               {"code":"-2","result":"account is not verify"}
 *               {"code":"-3","result":"account is disabled"}
 *               {"code":"-4","result":"admin not verify"}
 *               {"code":"0","result":"login success","token":"company token",{company data object}}
 *               {"code":"1","result":"email is empty"}
 *               {"code":"2","result":"email is not valid"}
 *               {"code":"3","result":"password is empty"}
 *               {"code":"4","result":"email or password is not correct"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/login', uploader.none(), [
    check.body('email').trim().not().isEmpty()
        .withMessage({"result": "email is empty", "code": "1"})
        .isEmail().withMessage({"result": "email is not valid", "code": "2"}),
    check.body('password').trim().not().isEmpty()
        .withMessage({"result": "password is empty", "code": "3"}),
], async (req, res) => {
    try {
        let email = safeString(req.body.email);
        email = email.toLowerCase();
        let password = safeString(req.body.password);
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else {
            let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            ip = ip.replace(/::ffff:/g, '');
            let user_agent = req.headers['user-agent'];
            let captchaResult = await googleRecaptchaCheck(req);
            if (captchaResult) {
                let resultLogin = await model.login(email, password);
                if (resultLogin === -1) {
                    return res.json({"result": "email or password is not correct!", "code": "4"});
                } else if (resultLogin === -2) {
                    return res.json({"result": "account is not verify", "code": "2"});
                } else if (resultLogin === -3) {
                    return res.json({"result": "account is disabled", "code": "3"});
                } else {
                    let userData = await model.getUserData(resultLogin);
                    if (userData.google_auth) {
                        return res.json({"result": "google auth required", "code": "0", "google_auth": true});
                    } else {
                        const tokens = await createTokens(resultLogin['_id'], null, ip, user_agent);
                        userData['token'] = tokens.token;
                        userData['refresh_token'] = tokens.refresh_token;
                        userData["result"] = "login ok!";
                        userData["code"] = "0";
                        res.json(userData);
                    }
                }
            } else {
                res.json({"result": "Failed captcha verification", "code": "7"});
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
 * /company/user/get-notifications:
 *   get:
 *     tags:
 *       - company - user
 *     description: get notifications
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : is_new
 *         type : boolean
 *         in: query
 *         required : false
 *         description : is_new
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
router.get('/get-notifications', isAuth,
    hasPermission(RESOURCE.NOTIFICATION, ACTIONS.READ),
    [
        check.query('is_new').trim().not().isEmpty()
            .withMessage({"result": "is_new is empty", "code": "2", "is_login": "0"}),
    ], async (req, res) => {
        try {
            const user = company.get('companyUser');
            const is_new = safeString(req.query.is_new);
            const page = safeString(req.query.page);
            let result = await model.getNotifications(user._id, is_new, page);
            res.json({"result": result, "code": "0", "is_login": "0"});
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
 * /company/user/update-notification-status:
 *   post:
 *     tags:
 *       - company - user
 *     description: update-notification-status
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : status
 *         type : number
 *         in: body
 *         required : true
 *         description : status
 *       - name : notification_id
 *         type : string
 *         in: body
 *         required : true
 *         description : notification_id
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
router.post('/update-notification-status',
    [
        check.body('status').trim().not().isEmpty()
            .withMessage({"result": "status is empty", "code": "2", "is_login": "0"}),
        check.body('notification_id').trim().not().isEmpty()
            .withMessage({"result": "notification_id is empty", "code": "2", "is_login": "0"}),
    ], async (req, res) => {
        try {
            const user = await getCompanyLogin(req.headers['x-token'], false, false);
            if (isNumber(user)) {
                return res.json({"result": "token is invalid", "code": "-1", "is_login": "0"});
            }
            const status = safeString(req.body.status);
            const notification_id = safeString(req.body.notification_id);
            await model.updateNotificationStatus(user._id, notification_id, status);
            res.json({"result": "success", "code": "0", "is_login": "0"});
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
 * /company/user/login_with_google_authenticator:
 *   post:
 *     tags:
 *       - company
 *     description: login with google authenticator
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
 *       - name : code
 *         type : string
 *         in: formData
 *         required : true
 *         description : code
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: |
 *               <pre>
 *               {"code":"-2","result":"account is not verify"}
 *               {"code":"-3","result":"account is disabled"}
 *               {"code":"0","result":"login success","token":"hacker token",{hacker data object}}
 *               {"code":"1","result":"email is empty"}
 *               {"code":"2","result":"email is not valid"}
 *               {"code":"3","result":"password is empty"}
 *               {"code":"4","result":"email or password is not correct"}
 *               {"code":"5","result":"email must be less that 65 characters."}
 *               {"code":"6","result":"password must be between 3 and 100 characters"}
 *               {"code":"7","result":"code is empty"}
 *               {"code":"8","result":"user not enable google 2fa"}
 *               {"code":"9","result":"code is invalid"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/login_with_google_authenticator', uploader.none(), [
    check.body('email').trim().not().isEmpty()
        .withMessage({"result": "email is empty", "code": "1"})
        .isString().withMessage({"result": "email is not valid", "code": "2"})
        .isEmail().withMessage({"result": "email is not valid", "code": "2"})
        .isLength({min: 5, max: 65}).withMessage({"result": "email must be between 5 and 65 characters", "code": "5"}),
    check.body('password').trim().not().isEmpty()
        .withMessage({"result": "password is empty", "code": "3"})
        .isLength({min: 3, max: 100}).withMessage({
        "result": "password must be between 3 and 100 characters",
        "code": "6"
    }),
    check.body('code').trim().not().isEmpty()
        .withMessage({"result": "code is empty", "code": "7"})
], async (req, res) => {
    try {
        let email = safeString(req.body.email);
        email = email.toLowerCase();
        let password = safeString(req.body.password);
        let code = safeString(req.body.code);
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else {
            let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            ip = ip.replace(/::ffff:/g, '');
            let user_agent = req.headers['user-agent'];
            let resultLogin = await model.login(email, password);
            if (resultLogin === -1) {
                return res.json({"result": "email or password is not correct", "code": "4"});
            } else if (resultLogin === -2) {
                return res.json({"result": "your account is not verify", "code": "2"});
            } else if (resultLogin === -3) {
                return res.json({"result": "your account disabled by admin", "code": "3"});
            } else {
                let userData = await model.getUserData(resultLogin);
                if (!userData.google_auth) {
                    return res.json({"result": "google auth not enable can not use this login method", "code": "8"});
                } else {
                    let googleKey = decryptionString(resultLogin.google_towfa_secret_key).split(":");

                    let checkOpt = google2faCheck(googleKey[0], code);
                    if (checkOpt) {
                        const tokens = await createTokens(resultLogin['_id'], null, ip, user_agent);
                        userData['token'] = tokens.token;
                        userData['refresh_token'] = tokens.refresh_token;
                        userData['result'] = "login ok";
                        userData['code'] = "0";
                        return res.json(userData);
                    } else {
                        return res.json({"result": "code is invalid", "code": "9"});
                    }
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


/**
 * @swagger
 * /company/user/profile:
 *   get:
 *     tags:
 *       - company
 *     description: get company profile
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
router.get('/profile', isAuth, hasPermission(RESOURCE.USER_PROFILE, ACTIONS.READ), uploader.none(), async (req, res) => {
    try {
        let user = company.get('companyUser');
        let userData = await model.getUserData(user);
        res.json({"result": userData, "code": "0", "is_login": "0"});
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
 * /company/user/resend_verify:
 *   post:
 *     tags:
 *       - company
 *     description: resend verify company
 *     parameters:
 *       - name : email
 *         type : string
 *         in: formData
 *         required : true
 *         description : email
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: |
 *               <pre>
 *               {"code":"0","result":"send new active code"}
 *               {"code":"1","result":"email is empty"}
 *               {"code":"2","result":"email is not valid"}
 *               {"code":"3","result":"email not found or account is verified"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/resend_verify', uploader.none(), [
    check.body('email').trim().not().isEmpty()
        .withMessage({"result": "email is empty", "code": "1"})
        .isEmail().withMessage({"result": "email is not valid", "code": "2"}),
], async (req, res) => {
    try {
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else {
            let email = safeString(req.body.email);
            let emailIsFound = await model.checkEmailForResend(email);
            if (emailIsFound) {
                let newCode = await model.updateNewVerifyCode(emailIsFound._id);
                let url = `${AppConfig.FRONTEND_URL}company/register/verification?token=${newCode}`;
                let htmlTemplate = generateEmailTemplate("company_register", emailIsFound.fn, {url}, false);
                //send email verification
                let sendMailResult = await sendMail(email, "Verify your email and complete your registration", htmlTemplate);
                res.json({"result": "send new active code", "code": "0"});
            } else {
                res.json({"result": "Email not found or already verified", "code": "3"});
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
 * /company/user/forgot_password:
 *   post:
 *     tags:
 *       - company
 *     description: forgot password company
 *     parameters:
 *       - name : email
 *         type : string
 *         in: formData
 *         required : true
 *         description : email
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: |
 *               <pre>
 *               {"code":"0","result":"send new password"}
 *               {"code":"1","result":"email is empty"}
 *               {"code":"2","result":"email is not valid"}
 *               {"code":"3","result":"email not found"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/forgot_password', uploader.none(), [
    check.body('email').trim().not().isEmpty()
        .withMessage({"result": "email is empty", "code": "1"})
        .isEmail().withMessage({"result": "email is not valid", "code": "2"}),
], async (req, res) => {
    try {
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else {
            let email = safeString(req.body.email);
            email = email.toLowerCase();
            let emailIsFound = await model.checkEmailForReset(email);
            if (emailIsFound) {
                let newCode = await model.updateNewResetCode(emailIsFound._id);
                let url = `${AppConfig.FRONTEND_URL}company/recovery?token=${newCode}`;
                let url2 = AppConfig.FRONTEND_URL;
                let htmlTemplate = generateEmailTemplate("forget_password", emailIsFound.fn, {url, url2}, false);
                //send email reset password
                sendMail(email, "Request to reset your password", htmlTemplate);
                res.json({"result": "If we find a match. we will send to you reset password code", "code": "0"});
            } else {
                res.json({"result": "If we find a match. we will send to you reset password code", "code": "3"});
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
 * /company/user/reset_password:
 *   post:
 *     tags:
 *       - company
 *     description: reset password company
 *     parameters:
 *       - name : code
 *         type : string
 *         in: formData
 *         required : true
 *         description : code
 *       - name : password1
 *         type : string
 *         in: formData
 *         required : true
 *         description : new password
 *       - name : password2
 *         type : string
 *         in: formData
 *         required : true
 *         description : confirm new password
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: |
 *               <pre>
 *               {"code":"0","result":"change password ok"}
 *               {"code":"1","result":"code is empty"}
 *               {"code":"2","result":"new password is empty"}
 *               {"code":"3","result":"confirm new password is empty"}
 *               {"code":"4","result":"confirm new password is not matched"}
 *               {"code":"5","result":"code not found"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/reset_password', uploader.none(), [
    check.body('code').trim().not().isEmpty()
        .withMessage({"result": "code is empty", "code": "1"}),
    check.body('password1').trim().not().isEmpty()
        .withMessage({"result": "password1 is empty", "code": "2"}),
    check.body('password2').trim().not().isEmpty()
        .withMessage({"result": "password2 is empty", "code": "3"}),
], async (req, res) => {
    try {
        let password1 = safeString(req.body.password1);
        let password2 = safeString(req.body.password2);
        let code = safeString(req.body.code);
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else if (password1 !== password2) {
            res.json({"result": "confirm password is not matched ", "code": "4"});
        } else {
            let userFound = await model.getUserByResetCode(makeKey(code));
            if (userFound) {
                let resultSave = await model.updateNewPassword(userFound._id, password2);
                //remove all token
                let allToken = await ftSearch('sbloginIndex', `@user_id:${userFound._id}`);
                for (let row of allToken) {
                    await ioredis.del(row.key);
                }
                res.json({"result": "change password ok", "code": "0"});
            } else {
                res.json({"result": "code not found", "code": "5"});
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
 * /company/user/change_password:
 *   post:
 *     tags:
 *       - company
 *     description: change password company
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : current_password
 *         type : string
 *         in: formData
 *         required : true
 *         description : current password
 *       - name : new_password
 *         type : string
 *         in: formData
 *         required : true
 *         description : new password
 *       - name : confirm_password
 *         type : string
 *         in: formData
 *         required : true
 *         description : confirm new password
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
 *               {"code":"0","result":"saved","is_login":"0"}
 *               {"code":"1","result":"current_password is empty","is_login":"0"}
 *               {"code":"2","result":"new_password is empty","is_login":"0"}
 *               {"code":"3","result":"confirm new password is empty","is_login":"0"}
 *               {"code":"4","result":"confirm new password is not match","is_login":"0"}
 *               {"code":"5","result":"current password is not correct","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/change_password', isAuth, hasPermission(RESOURCE.PASSWORD, ACTIONS.UPDATE), uploader.none(), [
    check.body('current_password').trim().not().isEmpty()
        .withMessage({"result": "current_password is empty", "code": "1", "is_login": "0"}),
    check.body('new_password').trim().not().isEmpty()
        .withMessage({"result": "new_password is empty", "code": "2", "is_login": "0"}),
    check.body('confirm_password').trim().not().isEmpty()
        .withMessage({"result": "confirm_password is empty", "code": "3", "is_login": "0"}),
], async (req, res) => {
    try {
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else {
            let user = company.get('companyUser');
            let current_password = safeString(req.body.current_password);
            let new_password = safeString(req.body.new_password);
            let confirm_password = safeString(req.body.confirm_password);
            if (user.password === makeHash(current_password)) {
                if (new_password === confirm_password) {
                    let resultSave = await model.updateNewPassword(user._id, confirm_password);
                    //remove all token
                    let allToken = await ftSearch('sbloginIndex', `@user_id:${user._id}`);
                    for (let row of allToken) {
                        await ioredis.del(row.key);
                    }
                    res.json({"result": "saved!", "code": "0", "is_login": "0"});
                } else {
                    res.json({"result": "confirm password is not matched", "code": "4", "is_login": "0"});
                }
            } else {
                res.json({"result": "current password is incorrect!", "code": "5", "is_login": "0"});
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
 * /company/user/token_isvalid:
 *   get:
 *     tags:
 *       - company
 *     description: get company token is valid
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
 *               {"code":"0","result":{company_data},"is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.get('/token_isvalid', uploader.none(), async (req, res) => {
    try {
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else {
            let user = await getCompanyLogin(req.headers['x-token'], false, false, true);
            if (typeof user === 'number') {
                return res.json({"result": "token is invalid", "code": "-1", "is_login": "0"});
            }
            let userData = await model.getUserData(user);
            res.json({"result": userData, "code": "0", "is_login": "0"});
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
 * /company/user/UploadAvatar:
 *   post:
 *     tags:
 *       - company
 *     description: upload avatar file company
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
 *               {"code":"1","result":"already file upload","is_login":"0"}
 *               {"code":"2","result":"file not send","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
async function upload_avatar_check(req, file, cb) {
    try {
        req.uploadDirs = uploadDirs
        let user = company.get('companyUser');
        if (!isUndefined(user.avatar_file) && user.avatar_file !== "") {
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
};
const uploader_avatar = multer({storage: storage, fileFilter: upload_avatar_check});
let uploadFilesAvatar = uploader_avatar.fields([{name: 'avatar', maxCount: 1}]);
router.post('/UploadAvatar', isAuth, hasPermission(RESOURCE.UPLOAD_AVATAR, ACTIONS.CREATE), uploadFilesAvatar, async (req, res) => {
    try {
        let user = company.get('companyUser');
        if (!isUndefined(req.validationErrors) && req.validationErrors != "") {
            res.json(req.validationErrors);
            return;
        }
        var isUpload = Object.keys(req.files).length;
        if (isUpload == 0) {
            res.json({"result": "file not send", "code": "2", "is_login": "0"});
            return;
        } else {
            let img;
            if (req.files && Object.keys(req.files).length > 0 && !isUndefined(req.files.avatar)) {
                let filename = req.files.avatar[0].filename;
                img = `avatars/${filename}`;
            }
            let resultSave = await model.updateAvatar(getUserId(user), img);
            let avatar_file = AppConfig.API_URL + img;
            res.json({"result": "save!", "avatar_file": avatar_file, "code": "0", "is_login": "0"});
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
 * /company/user/DeleteAvatar:
 *   delete:
 *     tags:
 *       - company
 *     description: delete Avatar file company
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
router.delete('/DeleteAvatar', isAuth, hasPermission(RESOURCE.UPLOAD_AVATAR, ACTIONS.DELETE), uploader.none(), async (req, res) => {
    try {
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else {
            let user = company.get('companyUser');
            let path = appDir + 'media/' + user['avatar_file'];
            fs.stat(path, async (err, stats) => {
                if (!err && stats.isFile())
                    fs.unlinkSync(path);
            });
            let resultSave = await model.deleteAvatar(getUserId(user));
            res.json({"result": "delete ok!", "code": "0", "is_login": "0"});
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
 * /company/user/update_profile_details:
 *   post:
 *     tags:
 *       - company
 *     description: update_profile_details company
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
 *         description : last_name
 *       - name : short_introduction
 *         type : string
 *         in: formData
 *         description : short_introduction
 *       - name : organization_name
 *         type : string
 *         in: formData
 *         description : organization_name
 *       - name : role
 *         type : string
 *         in: formData
 *         description : role
 *       - name : profile_visibility
 *         type : string
 *         in: formData
 *         description : profile_visibility  true or false
 *       - name : about
 *         type : string
 *         in: formData
 *         description : about
 *       - name : github_url
 *         type : string
 *         in: formData
 *         description : github_url
 *       - name : twitter_url
 *         type : string
 *         in: formData
 *         description : twitter_url
 *       - name : linkedin_url
 *         type : string
 *         in: formData
 *         description : linkedin_url
 *       - name : website_url
 *         type : string
 *         in: formData
 *         description : website_url
 *       - name : display_name
 *         type : string
 *         in: formData
 *         description : display_name
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
 *               {"code":"0","result":"saved","is_login":"0"}
 *               {"code":"1","result":"first_name is empty","is_login":"0"}
 *               {"code":"2","result":"last_name is empty","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/update_profile_details', isAuth, hasPermission(RESOURCE.USER_PROFILE, ACTIONS.UPDATE), uploader.none(), [
    check.body('first_name').trim().not().isEmpty()
        .withMessage({"result": "first_name is empty", "code": "1", "is_login": "0"}),
    check.body('last_name').trim().not().isEmpty()
        .withMessage({"result": "last_name is empty", "code": "2", "is_login": "0"}),
], async (req, res) => {
    try {
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else {
            let user = company.get('companyUser');
            let display_name = safeString(req.body.display_name);
            let short_introduction = safeString(req.body.short_introduction);
            let organization_name = safeString(req.body.organization_name);
            let role = safeString(req.body.role);
            let fn = safeString(req.body.first_name);
            let ln = safeString(req.body.last_name);
            let profile_visibility = safeString(req.body.profile_visibility);
            profile_visibility = (profile_visibility === "true") ? true : false;
            let about = cleanXSS(req.body.about);
            about = safeString(about);
            let github_url = safeString(req.body.github_url);
            let twitter_url = safeString(req.body.twitter_url);
            let linkedin_url = safeString(req.body.linkedin_url);
            let website_url = safeString(req.body.website_url);
            let resultSave = await model.updateProfileDetails(user._id, profile_visibility
                , about, github_url, twitter_url, linkedin_url, website_url, fn, ln
                , organization_name, role, short_introduction, display_name, user.parent_user_id,
                user.user_level_access);
            res.json({"result": "saved!", "code": "0", "is_login": "0"});
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
 * /company/user/update_details:
 *   post:
 *     tags:
 *       - company
 *     description: update_details company
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : company_country_id
 *         type : string
 *         in: formData
 *         description : company_country_id
 *       - name : organization_no
 *         type : string
 *         in: formData
 *         description : organization_no
 *       - name : address1
 *         type : string
 *         in: formData
 *         description : address1
 *       - name : address2
 *         type : string
 *         in: formData
 *         description : address2
 *       - name : city
 *         type : string
 *         in: formData
 *         description : city
 *       - name : region
 *         type : string
 *         in: formData
 *         description : region
 *       - name : postal_code
 *         type : string
 *         in: formData
 *         description : postal_code
 *       - name : phone
 *         type : string
 *         in: formData
 *         description : phone
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
 *               {"code":"0","result":"saved","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/update_details', isAuth, hasPermission(RESOURCE.USER_DETAILS, ACTIONS.UPDATE), uploader.none(), async (req, res) => {
    try {
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else {
            let user = company.get('companyUser');
            let country_id = '';
            let organization_no = safeString(req.body.organization_no);
            let company_country_id = safeString(req.body.company_country_id);
            if (company_country_id != '') {
                let country = await model.getCountry(company_country_id);
                if (country > 0) {
                    country_id = company_country_id;
                }
            }

            let address1 = safeString(req.body.address1);
            let address2 = safeString(req.body.address2);
            let city = safeString(req.body.city);
            let region = safeString(req.body.region);
            let postal_code = safeString(req.body.postal_code);
            let phone = safeString(req.body.phone);
            await model.updateDetails(getUserId(user), organization_no
                , country_id, address1, address2, city, region, postal_code, phone);
            res.json({"result": "saved!", "code": "0", "is_login": "0"});
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
 * /company/user/change_email:
 *   post:
 *     tags:
 *       - company
 *     description: change email company
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : new_email
 *         type : string
 *         in: formData
 *         required : true
 *         description : new_email
 *       - name : current_password
 *         type : string
 *         in: formData
 *         required : true
 *         description : current_password
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
 *               {"code":"0","result":"send verify email","is_login":"0"}
 *               {"code":"1","result":"new_email is empty","is_login":"0"}
 *               {"code":"2","result":"new_email is not valid","is_login":"0"}
 *               {"code":"3","result":"current_password is empty","is_login":"0"}
 *               {"code":"4","result":"current password is not valid","is_login":"0"}
 *               {"code":"5","result":"email is exist","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/change_email', isAuth, uploader.none(), [
    check.body('new_email').trim().not().isEmpty()
        .withMessage({"result": "new_email is empty", "code": "1", "is_login": "0"})
        .isEmail().withMessage({"result": "new_email is not valid", "code": "2", "is_login": "0"}),
    check.body('current_password').trim().not().isEmpty()
        .withMessage({"result": "current_password is empty", "code": "3", "is_login": "0"})
], async (req, res) => {
    try {
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else {
            let user = company.get('companyUser');
            let new_email = safeString(req.body.new_email);
            new_email = new_email.toLowerCase();
            let current_password = safeString(req.body.current_password);
            if (user.password === makeHash(current_password)) {
                let checkEmail = await model.checkEmail(new_email);
                if (checkEmail > 0) {
                    res.json({"result": "email is exist !", "code": "5", "is_login": "0"});
                    return;
                }
                let resultTemp = await model.updateEmailTemp(user._id, new_email);
                let url = `${AppConfig.FRONTEND_URL}company-register/change_email?token=${resultTemp}`;
                let htmlTemplate = generateEmailTemplate("company_register", user.fn, {url}, false);
                //send email
                let sendMailResult = await sendMail(new_email, "Request to change email confirmation", htmlTemplate);
                res.json({"result": "send verify email", "code": "0", "is_login": "0"});

            } else {
                res.json({"result": "current password is not valid!", "code": "4", "is_login": "0"});
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
 * /company/user/verify_change_email:
 *   post:
 *     tags:
 *       - company
 *     description: verify change email company
 *     parameters:
 *       - name : code
 *         type : string
 *         in: formData
 *         required : true
 *         description : code
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: |
 *               <pre>
 *               {"code":"0","result":"change email is success","is_login":"0"}
 *               {"code":"1","result":"code is empty","is_login":"0"}
 *               {"code":"2","result":"email is exist","is_login":"0"}
 *               {"code":"3","result":"invalid code","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/verify_change_email', uploader.none(), [
    check.body('code').trim().not().isEmpty()
        .withMessage({"result": "code is empty", "code": "1"}),
], async (req, res) => {
    try {
        let code = safeString(req.body.code);
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else {
            let currentUser = await model.getFoundChangeEmailTempCode(code);
            if (currentUser) {
                let checkEmail = await model.checkEmail(currentUser.email_temp);
                if (checkEmail > 0) {
                    let r = await model.updateEmailChangeFail(currentUser._id);
                    res.json({"result": "email is exist !", "code": "2"});
                    return;
                }

                let result = await model.updateEmailChange(currentUser._id, currentUser.email
                    , currentUser.email_temp, currentUser.activity_log);
                //remove all token
                let allToken = await ftSearch('sbloginIndex', `@user_id:${currentUser._id}`);
                for (let row of allToken) {
                    await ioredis.del(row.key);
                }
                let url = AppConfig.FRONTEND_URL;
                let htmlTemplate = emailTemplateVerify(url, currentUser.fn);
                let sendMailResult = await sendMail(currentUser.email_temp, "Email Verification Success", htmlTemplate);
                res.json({"result": "change email is success", "code": "0"});
            } else {
                res.json({"result": "invalid code!", "code": "3"});
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
 * /company/user/disabled_account:
 *   post:
 *     tags:
 *       - company
 *     description: disable account company
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : current_password
 *         type : string
 *         in: formData
 *         required : true
 *         description : current password
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
 *               {"code":"0","result":"ok","is_login":"0","account_is_disable":bool}
 *               {"code":"1","result":"current password is empty","is_login":"0"}
 *               {"code":"2","result":"current password is not valid","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/disabled_account', isAuth, hasPermission(RESOURCE.USER_PROFILE, ACTIONS.UPDATE), uploader.none(), async (req, res) => {
    try {
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else {
            let user = company.get('companyUser');
            if (!user.account_is_disable) {
                let current_password = safeString(req.body.current_password);
                if (current_password === "") {
                    res.json({"result": "current password is empty!", "code": "1", "is_login": "0"});
                    return;
                }
                if (user.password === makeHash(current_password)) {
                    let resultSave = await model.disabledAccount(user._id, true);
                    let allToken = await ftSearch('sbloginIndex', `@user_id:${user._id}`);
                    for (let row of allToken) {
                        await ioredis.del(row.key);
                    }
                    res.json({"result": "ok!", "account_is_disable": true, "code": "0", "is_login": "0"});
                } else {
                    res.json({"result": "current password is not valid!", "code": "2", "is_login": "0"});
                }
            } else {
                let resultSave = await model.disabledAccount(user._id, false);
                res.json({"result": "ok!", "account_is_disable": false, "code": "0", "is_login": "0"});
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
 * /company/user/disabled_member_account/{member_id}:
 *   post:
 *     tags:
 *       - company
 *     description: disable account member company
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : member_id
 *         type : string
 *         in: params
 *         required : true
 *         description : member_id
 *       - name : account_is_disable
 *         type : boolean
 *         in: body
 *         required : true
 *         description : account_is_disable
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
 *               {"code":"0","result":"ok","is_login":"0","account_is_disable":bool}
 *               {"code":"1","result":"current password is empty","is_login":"0"}
 *               {"code":"2","result":"current password is not valid","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/disabled_member_account/:member_id',
    isAuth, hasPermission(RESOURCE.MEMBER, ACTIONS.UPDATE),
    uploader.none(), [
        check.param('member_id').trim().not().isEmpty()
            .withMessage({"result": "member_id is empty", "code": "2"}),
        check.body('account_is_disable').not().isEmpty()
            .withMessage({"result": "account_is_disable is empty", "code": "3"})
            .isIn([true, false]).withMessage({"result": "account_is_disable is not valid", "code": "4"}).toBoolean(),
    ],
    async (req, res) => {
        try {
            const errors = check.validationResult(req);
            if (!errors.isEmpty()) {
                res.json(errors.array()[0].msg);
            } else {
                let user = company.get('companyUser');
                let member_id = safeString(req.params.member_id);
                let account_is_disable = safeString(req.body.account_is_disable);
                if (isObjectID(user.parent_user_id)) {
                    return res.json({
                        "result": "you can't access for change this member!",
                        "code": "1",
                        "is_login": "0"
                    });
                }
                let result = await model.disabledMemberAccount(user._id, member_id, account_is_disable);
                if (result === 1) {
                    return res.json({"result": "company not found", "code": "1", "is_login": "0"});
                }
                let allToken = await ftSearch('sbloginIndex', `@user_id:${member_id}`);
                for (let row of allToken) {
                    await ioredis.del(row.key);
                }
                return res.json({"result": "ok!", "code": "0", "is_login": "0"});
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
 * /company/user/UploadTAX:
 *   post:
 *     tags:
 *       - company
 *     description: upload tax file company
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : tax
 *         type : file
 *         in: formData
 *         required : true
 *         description : tax
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
 *               {"code":"0","result":"saved","is_login":"0","tax_file":"tax_file_address"}
 *               {"code":"1","result":"already file upload","is_login":"0"}
 *               {"code":"2","result":"file not send","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
async function upload_tax_check(req, file, cb) {
    try {
        req.uploadDirs = uploadDirs
        let user = company.get('companyUser');
        if (!isUndefined(user.tax_file) && user.tax_file !== "") {
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
};
const uploader_tax = multer({storage: storage, fileFilter: upload_tax_check});
let uploadFilesTAX = uploader_tax.fields([{name: 'tax', maxCount: 1}]);
router.post('/UploadTAX', isAuth, hasPermission(RESOURCE.USER_PAYMENT, ACTIONS.CREATE), uploadFilesTAX, async (req, res) => {
    try {
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
            return;
        }
        if (!isUndefined(req.validationErrors) && req.validationErrors != "") {
            res.json(req.validationErrors);
            return;
        }
        let user = company.get('companyUser');
        var isUpload = Object.keys(req.files).length;
        if (isUpload == 0) {
            res.json({"result": "file not send", "code": "2", "is_login": "0"});
            return;
        } else {
            let tax;
            if (req.files && Object.keys(req.files).length > 0 && !isUndefined(req.files.tax)) {
                let filename = req.files.tax[0].filename;
                tax = `company/tax/${filename}`;
            }
            let resultSave = await model.updateTAX(user._id, tax);
            let tax_file = AppConfig.API_URL + tax;
            res.json({"result": "save!", "tax_file": tax_file, "code": "0", "is_login": "0"});
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
 * /company/user/DeleteTAX:
 *   delete:
 *     tags:
 *       - company
 *     description: delete tax file company
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
router.delete('/DeleteTAX', isAuth, hasPermission(RESOURCE.USER_PAYMENT, ACTIONS.DELETE), uploader.none(), async (req, res) => {
    try {
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else {
            let user = company.get('companyUser');
            let path = appDir + 'media/' + user['tax_file'];
            fs.stat(path, async (err, stats) => {
                if (!err && stats.isFile())
                    fs.unlinkSync(path);
            });
            let resultSave = await model.deleteTAX(user._id);
            res.json({"result": "delete ok!", "code": "0", "is_login": "0"});
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
 * /company/user/payment_paypal:
 *   post:
 *     tags:
 *       - company
 *     description: save payment paypal company
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : email
 *         type : string
 *         in: formData
 *         description : email
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
 *               {"code":"0","result":"saved","is_login":"0"}
 *               {"code":"1","result":"email is empty","is_login":"0"}
 *               {"code":"2","result":"email is not valid","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/payment_paypal', isAuth, hasPermission(RESOURCE.USER_PAYMENT, ACTIONS.CREATE), uploader.none(), [
    check.body('email').trim().not().isEmpty()
        .withMessage({"result": "email is empty", "code": "1", "is_login": "0"})
        .isEmail().withMessage({"result": "email is not valid", "code": "2", "is_login": "0"}),
], async (req, res) => {
    try {
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else {
            let user = company.get('companyUser');
            let email = safeString(req.body.email);
            await model.updatePaymentPaypal(getUserId(user), email);
            res.json({"result": "save!", "code": "0", "is_login": "0"});
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
 * /company/user/payment_clear_paypal:
 *   delete:
 *     tags:
 *       - company
 *     description: payment clear paypal company
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
 *               {"code":"0","result":"saved","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.delete('/payment_clear_paypal', isAuth, hasPermission(RESOURCE.USER_PAYMENT, ACTIONS.DELETE), uploader.none(), async (req, res) => {
    try {
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else {
            let user = company.get('companyUser');
            await model.clearPaymentPaypal(getUserId(user));
            res.json({"result": "save!", "code": "0", "is_login": "0"});
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
 * /company/user/save_invoice_address:
 *   post:
 *     tags:
 *       - company
 *     description: save invoice address company
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : country_id
 *         type : string
 *         in: formData
 *         description : country_id
 *       - name : company_name
 *         type : string
 *         in: formData
 *         description : company_name
 *       - name : address1
 *         type : string
 *         in: formData
 *         description : address1
 *       - name : address2
 *         type : string
 *         in: formData
 *         description : address2
 *       - name : city
 *         type : string
 *         in: formData
 *         description : city
 *       - name : reference
 *         type : string
 *         in: formData
 *         description : reference
 *       - name : email
 *         type : string
 *         in: formData
 *         description : email
 *       - name : zip_code
 *         type : string
 *         in: formData
 *         description : zip_code
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
 *               {"code":"0","result":"saved","is_login":"0"}
 *               {"code":"1","result":"country not found","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/save_invoice_address', isAuth, hasPermission(RESOURCE.USER_PAYMENT, ACTIONS.CREATE), uploader.none(), async (req, res) => {
    try {
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else {
            let user = company.get('companyUser');
            let country_id = safeString(req.body.country_id);
            let reference = safeString(req.body.reference);
            let address1 = safeString(req.body.address1);
            let address2 = safeString(req.body.address2);
            let city = safeString(req.body.city);
            let email = safeString(req.body.email);
            let company_name = safeString(req.body.company_name);
            let zip_code = safeString(req.body.zip_code);
            if (country_id && isObjectID(country_id)) {
                //check country_id is valid?
                let country = await model.getCountry(country_id);
                if (country == 0) {
                    res.json({"result": "country not found!", "code": "1", "is_login": "0"});
                    return;
                }
            }

            await model.saveInvoiceAddress(getUserId(user), country_id
                , reference, address1, address2, city
                , email, company_name, zip_code);
            res.json({"result": "save!", "code": "0", "is_login": "0"});
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
 * /company/user/save_credit_card:
 *   post:
 *     tags:
 *       - company
 *     description: save credit card company
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : currency_id
 *         type : string
 *         in: formData
 *         description : currency_id
 *       - name : card_number
 *         type : string
 *         in: formData
 *         description : card_number
 *       - name : credit_date
 *         type : string
 *         in: formData
 *         description : credit_date
 *       - name : credit_cvc
 *         type : string
 *         in: formData
 *         description : credit_cvc
 *       - name : credit_bank_holder_name
 *         type : string
 *         in: formData
 *         description : credit_bank_holder_name
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
 *               {"code":"0","result":"saved","is_login":"0"}
 *               {"code":"1","result":"currency not found","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/save_credit_card', isAuth, hasPermission(RESOURCE.USER_PAYMENT, ACTIONS.CREATE), uploader.none(), async (req, res) => {
    try {
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else {
            let user = company.get('companyUser');
            let currency_id = safeString(req.body.currency_id);
            let card_number = safeString(req.body.card_number);
            let credit_date = safeString(req.body.credit_date);
            let credit_cvc = safeString(req.body.credit_cvc);
            let credit_bank_holder_name = safeString(req.body.credit_bank_holder_name);
            if (currency_id != '') {
                //check currency_id is valid?
                let currency = await model.getCurrency(currency_id);
                if (currency == 0) {
                    res.json({"result": "currency not found!", "code": "1", "is_login": "0"});
                    return;
                }
            }

            await model.saveCreditCard(getUserId(user), currency_id
                , card_number, credit_date, credit_cvc, credit_bank_holder_name);
            res.json({"result": "save!", "code": "0", "is_login": "0"});
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
 * /company/user/statisticsSubmitReport:
 *   get:
 *     tags:
 *       - company
 *     description: get statistics submit report
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
router.get('/statisticsSubmitReport',
    isAuth, hasPermission(RESOURCE.USER, ACTIONS.READ), uploader.none(),
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
                const program_type = req.query.program_type;
                let data = await model.statisticsSubmitReport(getUserId(user), program_type, user.parent_user_id, user.access_program_list);
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
 * /company/user/statisticsRewardTimeline:
 *   get:
 *     tags:
 *       - company
 *     description: get statistics reward timeline
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
router.get('/statisticsRewardTimeline', isAuth, hasPermission(RESOURCE.USER, ACTIONS.READ), uploader.none(), async (req, res) => {
    try {
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else {
            let user = company.get('companyUser');
            let data = await model.statisticsRewardTimeline(getUserId(user), user.parent_user_id, user.access_program_list);
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
 * /company/user/statisticsSeverityReport:
 *   get:
 *     tags:
 *       - company
 *     description: get statistics severity report
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
router.get('/statisticsSeverityReport', isAuth, hasPermission(RESOURCE.USER, ACTIONS.READ), uploader.none(),
    [check.query('program_type').optional({nullable: true})
        .isInt({gt: 0}).withMessage({"result": "program_type is not valid", "code": "2", "is_login": "0"}).bail()
        .isIn([1, 2, 3]).withMessage({"result": "program_type is not valid", "code": "2", "is_login": "0"}).toInt(),
        check.query('status').optional({nullable: true})
            .isString().withMessage({"result": "status is not valid", "code": "2", "is_login": "0"}).bail()
            .isIn(["approved"]).withMessage({"result": "status is not valid", "code": "2", "is_login": "0"})
    ],
    async (req, res) => {
        try {
            const errors = check.validationResult(req);
            if (!errors.isEmpty()) {
                res.json(errors.array()[0].msg);
            } else {
                let user = company.get('companyUser');
                const program_type = req.query.program_type;
                const status = safeString(req.query.status);
                let data = await model.statisticsSeverityReport(getUserId(user), program_type, status, user.parent_user_id, user.access_program_list);
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
 * /company/user/statisticsVulnerabilityReport:
 *   get:
 *     tags:
 *       - company
 *     description: get statistics vulnerability report
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
router.get('/statisticsVulnerabilityReport', isAuth, hasPermission(RESOURCE.USER, ACTIONS.READ), uploader.none(),
    [check.query('status').optional({nullable: true})
        .isString().withMessage({"result": "status is not valid", "code": "2", "is_login": "0"}).bail()
        .isIn(["approved"]).withMessage({"result": "status is not valid", "code": "2", "is_login": "0"})],
    async (req, res) => {
        try {
            const errors = check.validationResult(req);
            if (!errors.isEmpty()) {
                res.json(errors.array()[0].msg);
            } else {
                let user = company.get('companyUser');
                const status = safeString(req.query.status);
                let data = await model.statisticsVulnerabilityReport(getUserId(user), status, user.parent_user_id, user.access_program_list);
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
 * /company/user/update_report_notification_setting:
 *   get:
 *     tags:
 *       - company
 *     description: set report notification type
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : report_notification_setting
 *         type : Array[number]
 *         in: formData
 *         required : true
 *         description : report notification setting
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: |
 *               <pre>
 *               {"code":"403","result":"You don't have permission for this action"}
 *               {"code":"1","result":"data is invalid","is_login":"0"}
 *               {"code":"2","result":"user is invalid","is_login":"0"}
 *               {"code":"3","result":"user not found","is_login":"0"}
 *               {"code":"-1","result":"token is empty","is_login":"-1"}
 *               {"code":"-1","result":"token invalid","is_login":"-1"}
 *               {"code":"-1","result":"token expire","is_login":"-1"}
 *               {"code":"-2","result":"account is not verify","is_login":"-2"}
 *               {"code":"-3","result":"account is disabled","is_login":"-3"}
 *               {"code":"0","result":"report notification successfully updated","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/update_report_notification_setting', isAuth, hasPermission(RESOURCE.USER, ACTIONS.READ), uploader.none(), async (req, res) => {
    try {
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else {
            let report_notification_setting = req.body.report_notification_setting;
            if (!report_notification_setting) {
                return res.json({"result": "data is invalid", "code": "1", "is_login": "0"});
            }
            report_notification_setting = JSON.parse(JSON.stringify(report_notification_setting));
            for (const setting in report_notification_setting) {
                if (setting.indexOf('advance') === -1) {
                    if (!(report_notification_setting[setting] >= 0 && report_notification_setting[setting] < 5)) {
                        return res.json({"result": "data is invalid", "code": "1", "is_login": "0"});
                    }
                } else {
                    if (
                        !isArray(report_notification_setting[setting])
                        || !report_notification_setting[setting].every(type => {
                            return type >= 0 && type < 5
                        })
                        || report_notification_setting[setting].some(x => report_notification_setting[setting].indexOf(x) !== report_notification_setting[setting].lastIndexOf(x))
                    ) {
                        return res.json({"result": "data is invalid", "code": "1", "is_login": "0"});
                    }
                }
            }

            let user = company.get('companyUser');
            let result = await model.setReportNotificationType(user._id, report_notification_setting);
            if (result === 3) {
                return res.json({"result": "user not found", "code": "3", "is_login": "0"});
            }
            res.json({"result": "report notification successfully updated", "code": "0", "is_login": "0"});
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
 * /company/user/logout:
 *   post:
 *     tags:
 *       - company
 *     description: logout company
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
 *               {"code":"0","result":"success","is_login":"0"}
 *               {"code":"0","result":"error!","is_login":"1"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/logout', [
    check.header('x-token').trim().not().isEmpty()
        .withMessage({"result": "token is empty", "code": "-1", "is_login": "-1"}),
], async (req, res) => {
    try {
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else {
            let user = await getCompanyLogin(req.headers['x-token'], false, false);
            if (!isNumber(user)) {
                let del = await removeToken(req.headers['x-token']);
                if (del)
                    res.json({"result": "success", "code": "0", "is_login": "0"});
                else
                    res.json({"result": "token not exist", "code": "0", "is_login": "0"});
            } else
                res.json({"result": "token invalid", "code": "0", "is_login": "0"});
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
 * /company/user/transaction-history-list:
 *   get:
 *     tags:
 *       - company
 *     description: transaction history list company
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : program
 *         type : string
 *         in: query
 *         required : false
 *         description : program id
 *       - name : hacker
 *         type : string
 *         in: query
 *         required : false
 *         description : hacker user name
 *       - name : severity
 *         type : number
 *         in: query
 *         required : false
 *         description : severity
 *       - name : page
 *         type : number
 *         in: query
 *         required : false
 *         description : page
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description:
 *               <pre>
 *               {"code":"403","result":"You don't have permission for this action"}
 *               {"code":"-1","result":"token is empty","is_login":"-1"}
 *               {"code":"-1","result":"token invalid","is_login":"-1"}
 *               {"code":"-1","result":"token expire","is_login":"-1"}
 *               {"code":"-2","result":"account is not verify","is_login":"-2"}
 *               {"code":"-3","result":"account is disabled","is_login":"-3"}
 *               {"code":"0","result":"{result}","is_login":"0"}
 *               {"code":"1","result":"user is not valid","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.get('/transaction-history-list', isAuth, hasPermission(RESOURCE.USER_PAYMENT, ACTIONS.READ), async (req, res) => {
    try {
        const user = company.get('companyUser');
        let program_id = safeString(req.query.program);
        let hacker_user_name = safeString(req.query.hacker);
        let report_severity = safeString(req.query.severity);
        const result = await model.getTransactionHistoryList(getUserId(user), program_id, hacker_user_name, report_severity, user.parent_user_id, user.access_program_list);
        if (result === 1) {
            return res.json({"result": "user is not valid", "code": "1", "is_login": "0"});
        }
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
 * /company/user/enable_google_authenticator_step1:
 *   post:
 *     tags:
 *       - company
 *     description: enable google authenticator
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
 *               {"code":"1","result":"alredy enable","is_login":"0"}
 *               {"code":"0","result":"success","image":"base64image...","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/enable_google_authenticator_step1', isAuth, uploader.none(), async (req, res) => {
    try {
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else {
            let user = company.get('companyUser');
            if (!isUndefined(user.google_towfa_status) && user.google_towfa_status == 1) {
                res.json({"result": "alredy enable!", "code": "1", "is_login": "0"});
            } else {
                let secret2FaKey = otplib.authenticator.generateSecret(40);
                let encryptSecret2FaKey = encryptionString(secret2FaKey);
                await model.save2faKey(user._id, encryptSecret2FaKey);
                let svg = new QRCode({
                    content: `otpauth://totp/${user.email}?secret=${secret2FaKey}&issuer=SecureBug&algorithm=SHA1&digits=6&period=30`,
                    padding: 4,
                    width: 256,
                    height: 256,
                    color: "#000000",
                    background: "#ffffff",
                    ecl: "M",
                }).svg();
                res.json({"result": "success", "qrcode": tob64(svg), "code": "0", "is_login": "0"});
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
 * /company/user/enable_google_authenticator_step2:
 *   post:
 *     tags:
 *       - company
 *     description: enable google authenticator
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : code
 *         type : string
 *         in: formData
 *         required : true
 *         description : code
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
 *               {"code":"1","result":"alredy enable","is_login":"0"}
 *               {"code":"7","result":"code is empty"}
 *               {"code":"8","result":"user not enable google 2fa"}
 *               {"code":"9","result":"code is invalid"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/enable_google_authenticator_step2', uploader.none(),
    [
        check.body('code').trim().not().isEmpty()
            .withMessage({"result": "code is empty", "code": "7"})
    ]
    , async (req, res) => {
        try {
            const errors = check.validationResult(req);
            if (!errors.isEmpty()) {
                res.json(errors.array()[0].msg);
            } else {
                const user = await getCompanyLogin(req.headers['x-token'], false);
                if (isNumber(user)) {
                    return res.json({"result": "token is invalid", "code": "-1", "is_login": "0"});
                }
                if (!isUndefined(user.google_towfa_status) && user.google_towfa_status == 1) {
                    res.json({"result": "alredy enable!", "code": "8", "is_login": "0"});
                } else {
                    let code = safeString(req.body.code);
                    if (!isUndefined(user.google_towfa_secret_key) && user.google_towfa_secret_key.length > 0) {
                        let googleKey = decryptionString(user.google_towfa_secret_key).split(":");
                        let checkOpt = google2faCheck(googleKey[0], code);
                        if (checkOpt) {
                            await model.active2fa(user._id);
                            //remove all token
                            let allToken = await ftSearch('sbloginIndex', `@user_id:${user._id}`);
                            for (let row of allToken) {
                                await ioredis.del(row.key);
                            }
                            res.json({"result": "success", "code": "0"});
                        } else {
                            res.json({"result": "code is invalid", "code": "9"});
                        }
                    } else {
                        res.json({"result": "2fa is not active", "code": "10"});
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


/**
 * @swagger
 * /company/user/disabled_google_authenticator:
 *   post:
 *     tags:
 *       - company
 *     description: disabled google authenticator
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : code
 *         type : string
 *         in: formData
 *         required : true
 *         description : code
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
 *               {"code":"1","result":"code is empty","is_login":"0"}
 *               {"code":"2","result":"not enable 2fa","is_login":"0"}
 *               {"code":"3","result":"code is invalid","is_login":"0"}
 *               {"code":"0","result":"success","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/disabled_google_authenticator', isAuth, uploader.none()
    , [
        check.body('code').trim().not().isEmpty()
            .withMessage({"result": "code is empty", "code": "1", "is_login": "0"}),
    ]
    , async (req, res) => {
        try {
            const errors = check.validationResult(req);
            if (!errors.isEmpty()) {
                res.json(errors.array()[0].msg);
            } else {
                let user = company.get('companyUser');
                if (!isUndefined(user.google_towfa_secret_key) && user.google_towfa_secret_key.length > 0) {
                    let code = safeString(req.body.code);
                    let googleKey = decryptionString(user.google_towfa_secret_key).split(":");

                    let checkOpt = google2faCheck(googleKey[0], code);
                    if (checkOpt) {
                        await model.reset2aKey(user._id);
                        res.json({"result": "success", "code": "0", "is_login": "0"});
                    } else {
                        res.json({"result": "code is invalid", "code": "3", "is_login": "0"});
                    }
                } else {
                    res.json({"result": "not enable 2fa", "code": "2", "is_login": "0"});
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
 * /company/user/list_session:
 *   get:
 *     tags:
 *       - company
 *     description: list of session for user
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
 *               {"code":"0","result":[data],"is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.get('/list_session', uploader.none(), async (req, res) => {
    try {
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
        } else {
            let user = await getCompanyLogin(req.headers['x-token'], false);
            if (isNumber(user)) {
                res.json({"result": "token is invalid", "code": "-1", "is_login": "0"});
            }
            let sessions = await model.listSession(user._id, req.headers['x-token']);
            res.json({"result": sessions, "code": "0", "is_login": "0"});
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
 * /company/user/delete_user_session:
 *   post:
 *     tags:
 *       - company
 *     description: delete user session
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : token_key
 *         type : string
 *         in: formData
 *         required : true
 *         description : token_key
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
 *               {"code":"0","result":"success","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/delete_user_session', uploader.none()
    , [
        check.body('session_hash_id').trim().not().isEmpty()
            .withMessage({"result": "session_hash_id is empty", "code": "1", "is_login": "0"}),
    ]
    , async (req, res) => {
        try {
            const errors = check.validationResult(req);
            if (!errors.isEmpty()) {
                res.json(errors.array()[0].msg);
            } else {
                const session_hash_id = safeString(req.body.session_hash_id);
                let user = await getCompanyLogin(req.headers['x-token'], false);
                if (isNumber(user)) {
                    res.json({"result": "token is invalid", "code": "-1", "is_login": "0"});
                }
                let rows = await ftSearch('sbloginIndex', `@session_hash_id:${session_hash_id}`, 'sortby', 'date_time', 'DESC', 'RETURN', '4', 'date_time', 'user_agent', 'ip', 'session_hash_id');
                if (rows && rows.length > 0) {
                    const result = rows[0];
                    if (checkKey(result, 'user_id') && result.user_id == user._id && result.token !== safeString(req.headers['x-token'])) {
                        //delete redis key
                        await delCache('login:' + result.token);
                        res.json({"code": "0", "result": "success", "is_login": "0"});
                    } else {
                        res.json({"code": "2", "result": "can not delete current token!", "is_login": "0"});
                    }
                } else {
                    res.json({
                        "code": "2",
                        "result": "this token is refreshed please get session list and try again",
                        "is_login": "0"
                    });
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
 * /hacker/user/download:
 *   post:
 *     tags:
 *       - company
 *     description: download
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : name
 *         type : string
 *         in: formData
 *         required : true
 *         description : name
 *       - name : type
 *         type : string
 *         in: formData
 *         required : true
 *         description : download
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
 *               {"code":"0","result":"success","is_login":"0"}
 *               {"code":"1","result":"name is empty","is_login":"0"}
 *               {"code":"2","result":"type is empty","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/download', uploader.none()
    , [
        check.body('name').trim().not().isEmpty()
            .withMessage({"result": "name is empty", "code": "1", "is_login": "0"}),
        check.body('type').trim().not().isEmpty()
            .withMessage({"result": "type is empty", "code": "2", "is_login": "0"}),
    ]
    , async (req, res) => {
        try {
            const errors = check.validationResult(req);
            if (!errors.isEmpty()) {
                res.json(errors.array()[0].msg);
            } else {
                let user = await getCompanyLogin(req.headers['x-token'], false);
                if (isNumber(user)) {
                    res.status(400).json({"result": "token is invalid", "code": "-1", "is_login": "0"});
                }
                const name = safeString(req.body.name);
                const type = safeString(req.body.type);
                const id = safeString(req.body.id);
                const is_file_owner = await model.checkIsFileOwner(getUserId(user), name, type, id);
                if (!is_file_owner) {
                    return res.status(400).json({
                        result: 'you can not download this file.',
                        "code": "1",
                        "is_login": "0"
                    });
                }
                const directory_file = path.join(__dirname, `../../../media/${name}`);
                fs.access(directory_file, fs.F_OK, (err) => {
                    if (err) {
                        return res.status(400).json({result: 'file not exist.', "code": "2", "is_login": "0"});
                    }

                    return res.download(directory_file);
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


module.exports = router;
