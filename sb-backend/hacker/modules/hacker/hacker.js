require('../../init');
const model = require('./hacker.model');
const router = express.Router();

let uploadDirs = [
];


/**
 * @swagger
 * /hacker/hacker/get-hacker/{hacker_id}:
 *   get:
 *     tags:
 *       - hacker - hacker
 *     description: get a hacker_id
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
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
 *               {"code":"-1","result":"token is empty","is_login":"-1"}
 *               {"code":"-1","result":"token invalid","is_login":"-1"}
 *               {"code":"-1","result":"token expire","is_login":"-1"}
 *               {"code":"-2","result":"account is not verify","is_login":"-2"}
 *               {"code":"-3","result":"account is disabled","is_login":"-3"}
 *               {"code":"0","result":{hacker_data},"is_login":"0"} 
 *               {"code":"1","result":"hacker not found","is_login":"0"} 
 *               {"code":"2","result":"kyc is not active","is_login":"0"} 
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.get('/get-hacker/:hacker_id',isAuth,async (req,res)=>{
    try {
        let user = hacker.get('hackerUser');
        let kycBasic = getHackerKycBasic(user);
        if(kycBasic)
        {
            let hacker_id = safeString(req.params.hacker_id);
            let hacker = await model.getHacker(hacker_id);
            if(hacker && checkKey(hacker,'_id'))
            {
                res.json({"result":hacker,"code":"0","is_login":"0"});
            }
            else
            {
                res.json({"result":"hacker not found!","code":"1","is_login":"0"});
            }    
        }
        else
        {
            res.json({"result":"kyc is not active","code":"2","is_login":"0"});
        }
        
    }
    catch (e)
    {
        if(isSentry)
            Sentry.captureException(e);
        if(isDebug)
            res.status(500).json({"result":e.toString()});
        else
            res.status(500).json({"result":"Internal Server Error!"});
    }

});






/**
 * @swagger
 * /hacker/hacker/list-hacker/:
 *   get:
 *     tags:
 *       - hacker - hacker
 *     description: list hacker
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
 *       - name : username
 *         type : string
 *         in: query
 *         description : username   
 *       - name : competency
 *         type : string
 *         in: query
 *         description : competency   
 *       - name : limit
 *         type : string
 *         in: query
 *         description : limit   
 *       - name : field
 *         type : string
 *         in: query
 *         description : field   
 *       - name : sort
 *         type : string
 *         in: query
 *         description : sort -> ASC OR DESC   
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
 *               {"code":"1","result":"kyc is not active","is_login":"0"} 
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.get('/list-hacker',isAuth,async (req,res)=>{
    try {
        let user = hacker.get('hackerUser');
        let kycBasic = getHackerKycBasic(user);
        if(kycBasic)
        {
            let username = safeString(req.query.username);
            let competency = toNumber(req.query.competency);
            let is_blue = safeString(req.query.is_blue);
            gSortColumns = ['username','competency_profile','sb_coin','reputaion','point','register_date_time','privilage','rank','is_blue'];
            let field = safeString(req.query.field);
            let sort = safeString(req.query.sort);
            let fieldSort = 'rank';
            let sortSort = 1;
            if(sort != '')
            {
                if(sort == 'ASC')
                {
                    sortSort = 1;
                }
                else
                {
                    sortSort = -1;
                }    
            }
    
            if(field !== '')
            {
                let indexField = gSortColumns.indexOf(field);
                if(indexField !== -1)
                {
                    fieldSort = field;
                }
                else
                {
                    fieldSort = 'rank';
                    gSortType2 = 1;
                }
            }
    
            let resultPagination = await model.getHackerList(username,competency,is_blue,fieldSort,sortSort);
            res.json({"result":resultPagination,"code":"0","is_login":"0"});        
        }
        else
        {
            res.json({"result":"kyc is not active","code":"1","is_login":"0"});    
        }
    }
    catch (e)
    {
        if(isSentry)
            Sentry.captureException(e);
        if(isDebug)
            res.status(500).json({"result":e.toString()});
        else
            res.status(500).json({"result":"Internal Server Error!"});
    }

});


/**
 * @swagger
 * /hacker/hacker/get-bounty-data/:
 *   get:
 *     tags:
 *       - hacker - hacker
 *     description: get bounty data
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
router.get('/get-bounty-data',isAuth,async (req,res)=>{
    try {
        let user = hacker.get('hackerUser');
        let program_id = safeString(req.query.program);
        let company_name = safeString(req.query.company);
        let report_severity = safeString(req.query.severity);
            let result = await model.getBountyData(user._id,report_severity,program_id,company_name);
            res.json({"result":result,"code":"0","is_login":"0"});
    }
    catch (e)
    {
        if(isSentry)
            Sentry.captureException(e);
        if(isDebug)
            res.status(500).json({"result":e.toString()});
        else
            res.status(500).json({"result":"Internal Server Error!"});
    }

});


/**
 * @swagger
 * /hacker/hacker/get-notifications:
 *   get:
 *     tags:
 *       - hacker - hacker
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
router.get('/get-notifications',isAuth,[
 check.body('is_new').trim().not().isEmpty()
        .withMessage({"result":"is_new is empty","code":"2","is_login":"0"}),
],async (req,res)=>{
    try {
        const user = hacker.get('hackerUser');
        const is_new = safeString(req.query.is_new);
        const page = safeString(req.query.page);
            let result = await model.getNotifications(user._id,is_new,page);
            res.json({"result":result,"code":"0","is_login":"0"});
    }
    catch (e)
    {
        if(isSentry)
            Sentry.captureException(e);
        if(isDebug)
            res.status(500).json({"result":e.toString()});
        else
            res.status(500).json({"result":"Internal Server Error!"});
    }

});


/**
 * @swagger
 * /hacker/hacker/update-notification-status:
 *   post:
 *     tags:
 *       - hacker - hacker
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
            .withMessage({"result":"status is empty","code":"2","is_login":"0"}),
        check.body('notification_id').trim().not().isEmpty()
            .withMessage({"result":"notification_id is empty","code":"2","is_login":"0"}),
    ],async (req,res)=>{
        try {
            const user = await getHackerLogin(req.headers['x-token'],false,false);
            if (isNumber(user)){
                return res.json({"result":"token is invalid","code":"-1","is_login":"0"});
            }
            const status = safeString(req.body.status);
            const notification_id = safeString(req.body.notification_id);
             await model.updateNotificationStatus(user._id,notification_id,status);
            res.json({"result":"success","code":"0","is_login":"0"});
        }
        catch (e)
        {
            if(isSentry)
                Sentry.captureException(e);
            if(isDebug)
                res.status(500).json({"result":e.toString()});
            else
                res.status(500).json({"result":"Internal Server Error!"});
        }

    });

/**
 * @swagger
 * /hacker/hacker/save-claim-withdraw/:
 *   post:
 *     tags:
 *       - hacker - hacker
 *     description: save-claim-withdraw
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : bounty
 *         type : number
 *         in: formData
 *         description : bounty
 *         required : true
 *       - name : payment_type
 *         type : number
 *         in: formData
 *         description : payment type
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
 *               {"code":"0","result":{program_data},"is_login":"0"}
 *               {"code":"1","result":"withdraw value is empty","is_login":"0"}
 *               {"code":"2","result":"withdraw value must be more than 500","is_login":"0"}
 *               {"code":"3","result":"withdraw value is more than your total bounty ","is_login":"0"}
 *               {"code":"4","result":"user is not valid ","is_login":"0"}
 *               {"code":"5","result":"data is invalid ","is_login":"0"}
 *               {"code":"6","result":"payment type is empty","is_login":"0"}
 *               {"code":"7","result":"kyc advanced is not active","is_login":"0"}
 *               {"code":"8","result":"your account is disable","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/save-claim-withdraw',isAuth,uploader.none(),[
    check.body('bounty').trim().not().isEmpty()
        .withMessage({"result":"withdraw value is empty","code":"1","is_login":"0"}),
    check.body('payment_type').trim().not().isEmpty()
        .withMessage({"result":"payment type is empty","code":"6","is_login":"0"})
],async (req,res)=>{
    try {
        const errors = check.validationResult(req);
        if (!errors.isEmpty())
        {
            res.json(errors.array()[0].msg);
        }
        else
        {
            let user = hacker.get('hackerUser');
            if(user.account_is_disable)
            {
                return res.json({"result":"your account is disable","code":"8","is_login":"0"})
            }
            let kycAdv = getHackerKycAdvanced(user);
            if(!kycAdv)
            {
                return res.json({"result":"kyc advanced is not active","code":"7","is_login":"0"})
            }
            let bounty = safeString(req.body.bounty);
            let payment_type = safeString(req.body.payment_type);
                let result = await model.saveClaimWithdraw(user,bounty,payment_type);
                if (!result.total_withdraw){
                    if (result === 2){
                        return res.json({"result":"withdraw value must be more than 500","code":"2","is_login":"0"})
                    }
                    if (result === 3){
                        return res.json({"result":"withdraw value is more than your total bounty","code":"3","is_login":"0"})
                    }
                   if (result === 4){
                        return res.json({"result":"user is not valid","code":"4","is_login":"0"})
                    }
                 if (result === 5){
                        return res.json({"result":"data is invalid","code":"5","is_login":"0"})
                    }
                }
            let htmlTemplateHacker= generateEmailTemplate("hacker_request_withdraw",user.fn, { bounty, tracking_code: result.tracking_code},true);
            let htmlTemplateSupport = generateEmailTemplate("moderator_request_withdraw","",{username:user.username,bounty,tracking_code:result.tracking_code},false);
            sendMail(user.email,"Withdrawal Requested",htmlTemplateHacker);
            const notifications_setting = await model.getSettingsByKey(['reciever_email']);
            if (notifications_setting && notifications_setting.reciever_email) {
                sendMail(notifications_setting.reciever_email,"New withdrawal request Received",htmlTemplateSupport);
            }
                res.json({"result": {total_withdraw:result.total_withdraw,payment:result.payment},"code":"0","is_login":"0"});
        }
    }
    catch (e)
    {
        if(isSentry)
            Sentry.captureException(e);
        if(isDebug)
            res.status(500).json({"result":e.toString()});
        else
            res.status(500).json({"result":"Internal Server Error!"});
    }

});






module.exports = router;
