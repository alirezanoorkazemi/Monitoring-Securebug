require('../../init');
const model = require('./ctf.model');
const router = express.Router();

let uploadDirs = [
];

/**
 * @swagger
 * /hacker/ctf/list-ctf/:
 *   get:
 *     tags:
 *       - hacker - ctf
 *     description: list all ctf
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
 *               {"code":"0","result":[],"is_login":"0"} 
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.get('/list-ctf',isAuth,async (req,res)=>{
    try {
        let user = hacker.get('hackerUser');
        let data = await model.getListCtf();
        res.json({"result":data,"code":"0","is_login":"0"});    
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
 * /hacker/ctf/list-challenge/{ctf_id}:
 *   get:
 *     tags:
 *       - hacker - ctf
 *     description: list all challenge
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : ctf_id
 *         type : string
 *         in: path
 *         description : ctf_id   
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
 *               {"code":"0","result":[],"is_login":"0"} 
 *               {"code":"2","result":"ctf not found","is_login":"0"} 
 *               level_id -> 1 -> Easy
 *                           2 -> Medium
 *                           3 -> Hard
 *               category_id -> 1 -> Web
 *                              2 -> Forensics
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.get('/list-challenge/:ctf_id',isAuth,async (req,res)=>{
    try {
        let user = hacker.get('hackerUser');
        let ctf_id = safeString(req.params.ctf_id);
        let ctf = await model.getCtf(ctf_id);
        if(ctf)
        {
            let data = await model.getListChallenge(user._id,ctf_id);
            res.json({"result":data,"code":"0","is_login":"0"});        
        }
        else
        {
            res.json({"result":"ctf not found!","code":"2","is_login":"0"});        
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
 * /hacker/ctf/submit-flag/{ctf_id}/{challenge_id}:
 *   post:
 *     tags:
 *       - hacker - ctf
 *     description: submit flag
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : ctf_id
 *         type : string
 *         in: path
 *         description : ctf_id   
 *         required : true 
 *       - name : challenge_id
 *         type : string
 *         in: path
 *         description : challenge_id   
 *         required : true
 *       - name : flag
 *         type : string
 *         in: formData
 *         description : flag   
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
 *               {"code":"0","result":"success","is_login":"0"} 
 *               {"code":"2","result":"ctf not found","is_login":"0"} 
 *               {"code":"3","result":"challenge not found","is_login":"0"} 
 *               {"code":"4","result":"flag is incorret","is_login":"0"} 
 *               {"code":"5","result":"flag already submit","is_login":"0"} 
 *               {"code":"6","result":"flag is empty","is_login":"0"} 
 *               {"code":"7","result":"data is invalid","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.post('/submit-flag/:ctf_id/:challenge_id',isAuth,uploader.none(),
[
    check.body('flag').trim().not().isEmpty()
        .withMessage({"result": "flag is empty", "code": "6", "is_login": "0"}),
]
,async (req,res)=>{
    try {
        let user = hacker.get('hackerUser');
        if (user.tag && user.tag.length > 0 && user.tag.includes(HACKER_TAGS.INTERNAL_USER)){
            return  res.json({"result":"you are internal user","code":"8","is_login":"0"});
        }
        let ctf_id = safeString(req.params.ctf_id);
        let challenge_id = safeString(req.params.challenge_id);
        let flag = safeString(req.body.flag);
        let ctf = await model.getCtf(ctf_id);
        if(ctf)
        {
            let challenge = await model.getChallenge(ctf_id,challenge_id);
            if(challenge)
            {
                let isSubmit = await model.getHackerSubmiFlag(user._id,ctf_id,challenge_id);
                if(isSubmit == 0)
                {
                    if(challenge.flag === flag)
                    {
                      const result = await model.submitFlag(user._id,ctf,challenge_id,flag);
                      if (result === 7){
                          return  res.json({"result":"data is invalid","code":"7","is_login":"0"});
                      } else if (result === 2){
                          return  res.json({"result":"ctf not found","code":"2","is_login":"0"});
                      }
                        res.json({"result":"success","code":"0","is_login":"0"});
                    }
                    else
                    {
                        res.json({"result":"flag is incorrect","code":"4","is_login":"0"});
                    }
                }
                else
                {
                    res.json({"result":"flag already submit","code":"5","is_login":"0"});
                }
            }
            else
            {
                res.json({"result":"challenge not found!","code":"3","is_login":"0"});        
            }
        }
        else
        {
            res.json({"result":"ctf not found!","code":"2","is_login":"0"});        
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
 * /hacker/ctf/scoreboard/{ctf_id}:
 *   get:
 *     tags:
 *       - hacker - ctf
 *     description: list all scoreboard
 *     parameters:
 *       - name : X-TOKEN
 *         type : string
 *         in: header
 *         required : true
 *         description : token
 *       - name : ctf_id
 *         type : string
 *         in: path
 *         description : ctf_id   
 *         required : true 
 *       - name : page
 *         type : string
 *         in: query
 *         description : list by page  ->  page=1 or page=2 ... 
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
 *               {"code":"0","result":[],"is_login":"0"} 
 *               {"code":"2","result":"ctf not found","is_login":"0"} 
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.get('/scoreboard/:ctf_id',isAuth,async (req,res)=>{
    try {
        let user = hacker.get('hackerUser');
        let ctf_id = safeString(req.params.ctf_id);
        let ctf = await model.getCtf2(ctf_id);
        if(ctf)
        {
            let result = await model.getScoreboard(ctf_id,user._id);

            res.json({"result":result,"code":"0","is_login":"0"});
        }
        else
        {
            res.json({"result":"ctf not found!","code":"2","is_login":"0"});        
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
