require('../../init');
const model = require('./hacker.model');
const router = express.Router();

let uploadDirs = [
];


/**
 * @swagger
 * /company/hacker/get-hacker/{hacker_id}:
 *   get:
 *     tags:
 *       - company - hacker
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
 *               {"code":"403","result":"You don't have permission for this action"}
 *               {"code":"-1","result":"token is empty","is_login":"-1"}
 *               {"code":"-1","result":"token invalid","is_login":"-1"}
 *               {"code":"-1","result":"token expire","is_login":"-1"}
 *               {"code":"-2","result":"account is not verify","is_login":"-2"}
 *               {"code":"-3","result":"account is disabled","is_login":"-3"}
 *               {"code":"0","result":{hacker_data},"is_login":"0"} 
 *               {"code":"1","result":"hacker not found","is_login":"0"} 
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.get('/get-hacker/:hacker_id',isAuth,hasPermission(RESOURCE.HACKER,ACTIONS.READ), async (req,res)=>{
    try {
        let user = company.get('companyUser');
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
 * /company/hacker/list-hacker/:
 *   get:
 *     tags:
 *       - company - hacker
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
 *       - name : is_blue
 *         type : string
 *         in: query
 *         description : is_blue   
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
 *               {"code":"1","result":"program_id is invalid","is_login":"0"}
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
router.get('/list-hacker',isAuth,hasPermission(RESOURCE.HACKER,ACTIONS.READ),async (req,res)=>{
    try {
        let user = company.get('companyUser');
        let program_id = safeString(req.query.program_id);
        let username = safeString(req.query.username);
        let competency = toNumber(req.query.competency);
        let is_blue = safeString(req.query.is_blue);
        let champion = safeString(req.query.champion);
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

        let resultPagination = await model.getHackerList(username,competency,is_blue,fieldSort,sortSort,program_id,getUserId(user),champion);
        if(resultPagination === 1)
        {
          return res.json({"result":"program_id is invalid","code":"1","is_login":"0"});   
        } 
        if(resultPagination === 2)
        {
          return res.json({"result":"you can not invite hackers for this program","code":"2","is_login":"0"});
        }
        res.json({"result":resultPagination,"code":"0","is_login":"0"});
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
 * /company/hacker/top-hackers/:
 *   get:
 *     tags:
 *       - company - hacker
 *     description: top hackers
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
 router.get('/top-hackers',isAuth,hasPermission(RESOURCE.HACKER,ACTIONS.READ), async (req,res)=>{
    try {
        let user = company.get('companyUser');
        let result = await model.getTopHacker();
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






module.exports = router;
