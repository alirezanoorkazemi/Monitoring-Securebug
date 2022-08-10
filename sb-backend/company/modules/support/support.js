require('../../init');
const router = express.Router();


/**
 * @swagger
 * /company/support/send-email:
 *   post:
 *     tags:
 *       - company - support
 *     description: send email support
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : subject
 *         type : string
 *         in: formData
 *         required : true
 *         description : subject
 *       - name : message
 *         type : string
 *         in: formData
 *         required : true
 *         description : message
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
 *               {"code":"0","result":success,"is_login":"0"}
 *               {"code":"1","result":"subject is empty","is_login":"0"}
 *               {"code":"2","result":"message is empty","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/send-email', hasPermission(RESOURCE.SUPPORT, ACTIONS.CREATE), uploader.none(), [
    check.header('x-token').trim().not().isEmpty()
        .withMessage({"result": "token is empty", "code": "-1", "is_login": "-1"}),
    check.body('subject').trim().not().isEmpty()
        .withMessage({"result": "subject is empty", "code": "1", "is_login": "0"}),
    check.body('message').trim().not().isEmpty()
        .withMessage({"result": "message is empty", "code": "2", "is_login": "0"}),
], async (req, res) => {
    try {
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
            return;
        }
        let user = await getCompanyLogin(req.headers['x-token'], false);
        if (!isNumber(user)) {
            let message = safeString(req.body.message);
            let subject = safeString(req.body.subject);
            const email_template = generateEmailTemplate("support",`${user.fn} ${user.ln}`,{subject, message, email:user.email},undefined);
            const settings = await SchemaModels.SettingModel.find({key: {$in: ['reciever_email']}}).lean();
            let notifications_setting = {};
            if (isArray(settings)) {
                settings.forEach(setting => notifications_setting[`${setting.key}`] = setting.value);
            }
            if (notifications_setting && notifications_setting.reciever_email) {
                await sendMail(notifications_setting.reciever_email, "Support", email_template);
            }
            // const history_model = {
            //     sender_type: SENDER_TYPE.COMPANY,
            //     activity:ACTIVITY_TEXT_LOG.SEND_EMAIL,
            //     sender_id:user._id,
            //     register_date_time:getDateTime(),
            //     info_fields:[{key: "subject",value:subject},{key: "message",value:message}]
            // };
            // await SchemaModels.HistoryModel.create(history_model);
            res.json({"result": "success", "code": "0", "is_login": "0"});
        } else {
            res.json({"result": "auth error!", "code": "-1", "is_login": "-1"});
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
