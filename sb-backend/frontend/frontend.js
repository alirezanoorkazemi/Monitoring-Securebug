require('./init');
const model = require('./frontend.model');


/**
 * @swagger
 * /program_pre_data:
 *   get:
 *     tags:
 *       - frontend
 *     description: get pre data for program
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: success
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
frontend.get('/program_pre_data',uploader.none(),[
],async (req,res)=>{
    try{
        let cacheDataTest = await getCache('type_test');
        let dataTest = [];
        if(cacheDataTest)
        {
            dataTest = cacheDataTest;
        }
        else
        {
            let dataDBTest = await model.getListTypeTest();
            let cacheResultTest = await setCache('type_test',dataDBTest);
            dataTest = dataDBTest;
        }
        let cacheData = await getCache('lang');
        let data = [];
        if(cacheData)
        {
            data = cacheData;
        }
        else
        {
            let dataDB = await model.getListLang();
            let cacheResult = await setCache('lang',dataDB);
            data = dataDB;
        }

        let cacheDataCur = await getCache('currency');
        let dataCur = [];
        if(cacheDataCur)
        {
            dataCur = cacheDataCur;
        }
        else
        {
            let dataDBCur = await model.getListCurrency();
            let cacheResultCur = await setCache('currency',dataDBCur);
            dataCur = dataDBCur;
        }

        res.json({
            "type_test":dataTest,
            "lang":data,
            "currency":dataCur,
        });
    }
    catch (e) {
        if(isDebug)
            res.status(500).json({"result":e.toString()});
        else
            res.status(500).json({"result":"Internal Server Error!"});
    }

});



/**
 * @swagger
 * /getListTypeTest:
 *   get:
 *     tags:
 *       - frontend
 *     description: get list all type of target
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: success
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
frontend.get('/getListTypeTest',uploader.none(),[
],async (req,res)=>{
    try{
        let cacheData = await getCache('type_test');
        let data = [];
        if(cacheData)
        {
            data = cacheData;
        }
        else
        {
            let dataDB = await model.getListTypeTest();
            let cacheResult = await setCache('type_test',dataDB);
            data = dataDB;
        }
        res.json(data);
    }
    catch (e) {
        if(isDebug)
            res.status(500).json({"result":e.toString()});
        else
            res.status(500).json({"result":"Internal Server Error!"});
    }

});

/**
 * @swagger
 * /getListLang:
 *   get:
 *     tags:
 *       - frontend
 *     description: get list all of language
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: success
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
frontend.get('/getListLang',uploader.none(),[
],async (req,res)=>{
    try{
        let cacheData = await getCache('lang');
        let data = [];
        if(cacheData)
        {
            data = cacheData;
        }
        else
        {
            let dataDB = await model.getListLang();
            let cacheResult = await setCache('lang',dataDB);
            data = dataDB;
        }
        res.json(data);
    }
    catch (e) {
        if(isDebug)
            res.status(500).json({"result":e.toString()});
        else
            res.status(500).json({"result":"Internal Server Error!"});
    }

});



/**
 * @swagger
 * /getListCurrency:
 *   get:
 *     tags:
 *       - frontend
 *     description: get list all of Currency
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: success
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
frontend.get('/getListCurrency',uploader.none(),[
],async (req,res)=>{
    try{
        let cacheData = await getCache('currency');
        let data = [];
        if(cacheData)
        {
            data = cacheData;
        }
        else
        {
            let dataDB = await model.getListCurrency();
            let cacheResult = await setCache('currency',dataDB);
            data = dataDB;
        }
        res.json(data);
    }
    catch (e) {
        if(isDebug)
            res.status(500).json({"result":e.toString()});
        else
            res.status(500).json({"result":"Internal Server Error!"});
    }

});

/**
 * @swagger
 * /getListRange:
 *   get:
 *     tags:
 *       - frontend
 *     description: get list all of range
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: success
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
frontend.get('/getListRange',uploader.none(),[
],async (req,res)=>{
    try{
        let cacheData = await getCache('range');
        let data = [];
        if(cacheData)
        {
            data = cacheData;
        }
        else
        {
            let dataDB = await model.getListRange();
            let cacheResult = await setCache('range',dataDB);
            data = dataDB;
        }
        res.json(data);
    }
    catch (e) {
        if(isDebug)
            res.status(500).json({"result":e.toString()});
        else
            res.status(500).json({"result":"Internal Server Error!"});
    }

});

/**
 * @swagger
 * /getListCountries:
 *   get:
 *     tags:
 *       - frontend
 *     description: get list all of Countries
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: success
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
frontend.get('/getListCountries',uploader.none(),[
],async (req,res)=>{
    try{
        let cacheData = await getCache('countries');
        let data = [];
        if(cacheData)
        {
            data = cacheData;
        }
        else
        {
            let dataDB = await model.getListCountries();
            let cacheResult = await setCache('countries',dataDB);
            data = dataDB;
        }
        res.json(data);
    }
    catch (e) {
        if(isDebug)
            res.status(500).json({"result":e.toString()});
        else
            res.status(500).json({"result":"Internal Server Error!"});
    }

});

/**
 * @swagger
 * /getAllSkills:
 *   get:
 *     tags:
 *       - frontend
 *     description: get list all of Skills
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: success
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
frontend.get('/getAllSkills',uploader.none(),[
],async (req,res)=>{
    try{
        let cacheData = await getCache('skills');
        let data = [];
        if(cacheData)
        {
            data = cacheData;
        }
        else
        {
            let dataDB = await model.getListSkills();
            let cacheResult = await setCache('skills',dataDB);
            data = dataDB;
        }
        res.json(data);
    }
    catch (e) {
        if(isDebug)
            res.status(500).json({"result":e.toString()});
        else
            res.status(500).json({"result":"Internal Server Error!"});
    }

});


frontend.get('/',async (req,res)=>{
    try{
        res.json({}); 
    }
    catch (e) {
        if(isDebug)
            res.status(500).json({"result":e.toString()});
        else
            res.status(500).json({"result":"Internal Server Error!"});
    }
});


frontend.post('/email_subscription',uploader.none(),[
    check.body('email').trim().not().isEmpty()
        .withMessage({"result":"email err1","code":"-1"})
        .isEmail().withMessage({"result":"email err2","code":"-2"})
],async (req,res)=>{
    try{
        let email = safeString(req.body.email);
        const errors = check.validationResult(req);
        if (!errors.isEmpty())
        {
            res.json(errors.array()[0].msg);
        }
        else
        {
            let checkEmail = await model.checkEmail(email);
            if(checkEmail === 0)
            {
                let resultRegister = await model.register(email);
                res.json({"result":"register success","code":"0"});
            }
            else
            {
                res.json({"result":"email is already !","code":"-3"});
            }
        }

    }
    catch (e) {
        if(isDebug)
            res.status(500).json({"result":e.toString()});
        else
            res.status(500).json({"result":"Internal Server Error!"});
    }

});



/**
 * @swagger
 * /getListTypeVulnerability:
 *   get:
 *     tags:
 *       - frontend
 *     description: get list all type of vulnerability
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: success
 *       404:
 *         description: not found
 *       500:
 *         description: server error
 */
frontend.get('/getListTypeVulnerability',uploader.none(),[
],async (req,res)=>{
    try{
        let cacheData = await getCache('type_vulnerability');
        let data = [];
        if(cacheData)
        {
            data = cacheData;
        }
        else
        {
            let dataDB = await model.getListTypeVulnerability();
            let cacheResult = await setCache('type_vulnerability',dataDB);
            data = dataDB;
        }
        res.json(data);
    }
    catch (e) {
        if(isDebug)
            res.status(500).json({"result":e.toString()});
        else
            res.status(500).json({"result":"Internal Server Error!"});
    }

});

//404
frontend.use((req,res)=>{
    res.status(404).json({"result":"404 Page not found!"});
});




module.exports = frontend;