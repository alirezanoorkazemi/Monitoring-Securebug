require('../../init');
const model = require('./program.model');
const router = express.Router();

let uploadDirs = [];


/**
 * @swagger
 * /hacker/program/get-program/{program_id}:
 *   get:
 *     tags:
 *       - hacker - program
 *     description: get a program
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
 *               {"code":"-1","result":"token is empty","is_login":"-1"}
 *               {"code":"-1","result":"token invalid","is_login":"-1"}
 *               {"code":"-1","result":"token expire","is_login":"-1"}
 *               {"code":"-2","result":"account is not verify","is_login":"-2"}
 *               {"code":"-3","result":"account is disabled","is_login":"-3"}
 *               {"code":"0","result":{program_data},"is_login":"0"}
 *               {"code":"1","result":"program not found","is_login":"0"}
 *               {"code":"3","result":"kyc advanced is not active","is_login":"0"}
 *               {"code":"4","result":"you can not see this program","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.get('/get-program/:program_id', isAuth, async (req, res) => {
    try {
        let user = hacker.get('hackerUser');
        let program_id = safeString(req.params.program_id);
        let currentProgram = await model.getProgram(program_id);
        if (currentProgram.program_type === PROGRAM_TYPE.PRIVATE) {
            const checkAcceptedInvitationByHacker = await model.checkAcceptedInvitationByHacker(user._id, program_id);
            if (!checkAcceptedInvitationByHacker > 0) {
                return res.json({"result": "you can not see this program", "code": "4", "is_login": "0"});
            }
        }
        if (currentProgram && checkKey(currentProgram, '_id')) {
            if (currentProgram.program_type == 2) {
                let kycAdv = getHackerKycAdvanced(user);
                if (kycAdv) {
                    res.json({"result": currentProgram, "code": "0", "is_login": "0"});
                } else {
                    res.json({"result": "kyc advanced is not active", "code": "3", "is_login": "0"});
                }
            } else {
                //public
                res.json({"result": currentProgram, "code": "0", "is_login": "0"});
            }
        } else {
            res.json({"result": "program not found!", "code": "1", "is_login": "0"});
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
 * /hacker/program/list-program/:
 *   get:
 *     tags:
 *       - hacker - program
 *     description: list programs
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
 *       - name : program_type
 *         type : string
 *         in: query
 *         description : program_type   1,2
 *         required : true
 *       - name : is_next_generation
 *         type : number
 *         in: query
 *         description : is_next_generation  0 or 1 or 2
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
 *               {"code":"1","result":"program type is invalid","is_login":"0"}
 *               {"code":"2","result":"kyc advanced is not active","is_login":"0"}
 *               </pre>
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
router.get('/list-program', isAuth, async (req, res) => {
    try {
        let user = hacker.get('hackerUser');
        let program_type = toNumber(req.query.program_type);
        if (program_type <= 0 || program_type > 2) {
            res.json({"result": "program type is invalid", "code": "1", "is_login": "0"});
            return;
        }
        let is_next_generation = toNumber(req.query.is_next_generation);
        if (is_next_generation == 1)
            is_next_generation = 1;
        else if (is_next_generation == 2)
            is_next_generation = 2;
        else if (is_next_generation == 3)
            is_next_generation = 3;
        else
            is_next_generation = 0;

        if (program_type == 2 && is_next_generation !== PROGRAM_BOUNTY_TYPE.INTELLIGENCE_DISCOVERY) {
            let kycAdvanced = getHackerKycAdvanced(user);
            if (kycAdvanced == false) {
                res.json({"result": "kyc advanced is not active", "code": "2", "is_login": "0"});
                return;
            }
        }

        gSortColumns = ['_id'];
        let resultPagination = await model.getProgramList(program_type, user._id, is_next_generation,user);
      if (resultPagination === 1){
          res.json({"result": "user is not verified.", "code": "2", "is_login": "0"});
          return;
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


/**
 * @swagger
 * /hacker/program/get-program-history/:
 *   get:
 *     tags:
 *       - hacker - program
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
router.get('/get-program-history/:program_id', isAuth, async (req, res) => {
    try {
        let user = hacker.get('hackerUser');
        let program_id = safeString(req.params.program_id);
        let result = await model.getProgramHistory(program_id, user);
        if (typeof result !== 'number') {
            return res.json({"result": result, "code": "0", "is_login": "0"});
        } else {
            if (result === 2) {
                return res.json({"result": "progran not found", "code": "2", "is_login": "0"});
            } else if (result === 3) {
                return res.json({"result": "kyc advanced is not active", "code": "2", "is_login": "0"});
            }
            return
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
