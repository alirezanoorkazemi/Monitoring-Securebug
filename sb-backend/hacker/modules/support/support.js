require('../../init');
const router = express.Router();

/**
 * @swagger
 * /hacker/support/send-email:
 *   post:
 *     tags:
 *       - hacker - support
 *     description: send email support
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
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
 *               {"code":"-1","result":"token is empty","is_login":"-1"}
 *               {"code":"-1","result":"token invalid","is_login":"-1"}
 *               {"code":"-1","result":"token expire","is_login":"-1"}
 *               {"code":"-2","result":"account is not verify","is_login":"-2"}
 *               {"code":"-3","result":"account is disabled","is_login":"-3"}
 *               {"code":"0","result":success,"is_login":"0"}
 *               {"code":"1","result":"message is empty","is_login":"0"}
 *               {"code":"2","result":"subject is empty","is_login":"0"}
 *               {"code":"3","result":"message must be between 6 and 1024 characters","is_login":"0"}
 *               {"code":"4","subject must be between 3 and 124 characters","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/send-email', isAuth, uploader.none(), [
    check.body('subject').trim().not().isEmpty()
        .withMessage({"result": "subject is empty", "code": "2", "is_login": "0"})
        .isLength({min: 3, max: 124}).withMessage({
        "result": "subject must be between 3 and 124 characters",
        "code": "4"
    }),
    check.body('message').trim().not().isEmpty()
        .withMessage({"result": "message is empty", "code": "1", "is_login": "0"})
        .isLength({min: 6, max: 1024}).withMessage({
        "result": "message must be between 6 and 1024 characters",
        "code": "3"
    }),
], async (req, res) => {
    try {
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            res.json(errors.array()[0].msg);
            return;
        }
        const user = hacker.get('hackerUser');
        let captchaResult = await googleRecaptchaCheck(req);
        if (captchaResult) {
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
            //     sender_type: SENDER_TYPE.HACKER,
            //     activity:ACTIVITY_TEXT_LOG.SEND_EMAIL,
            //     sender_id:user._id,
            //     register_date_time:getDateTime(),
            //     info_fields:[{key: "subject",value:subject},{key: "message",value:message}]
            // };
            // await SchemaModels.HistoryModel.create(history_model);
            res.json({"result": "success", "code": "0", "is_login": "0"});
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


module.exports = router;
