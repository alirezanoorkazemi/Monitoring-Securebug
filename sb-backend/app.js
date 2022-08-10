require('./appConfig');
require('./emailTemplate');
require('./libs/core');
require('./schema');  
require('./io/io');  

const swaggerJsdoc = require('swagger-jsdoc');
const options = {
  apis: [
    './frontend/frontend.js',
    './hacker/modules/user/user.js',    
    './administration/modules/user/user.js',
    './administration/modules/company/company.js',
    './administration/modules/program/program.js',
    './administration/modules/hacker/hacker.js',
    './administration/modules/setting/ctf/ctf.js',
    './administration/modules/setting/country/country.js',
    './administration/modules/setting/language/language.js',
    './administration/modules/setting/currency/currency.js',
    './administration/modules/setting/range/range.js',
    './administration/modules/setting/target_type/target_type.js',
    './administration/modules/setting/skill/skill.js',
    './administration/modules/setting/setting.js',
    './administration/modules/report/report.js',
    './company/modules/user/user.js',
    './company/modules/support/support.js',
    './company/modules/program/program.js',
    './hacker/modules/program/program.js',
    './hacker/modules/submit_report/submit_report.js',
    './hacker/modules/hacker/hacker.js',
    './hacker/modules/support/support.js',
    './hacker/modules/ctf/ctf.js',
    './company/modules/hacker/hacker.js',
    './company/modules/support/support.js',
    './company/modules/submit_report/submit_report.js',
  ],
  basePath: '/',
  swaggerDefinition: {
    info: {
      description: 'securebug.se API Document',
      title: 'securebug.se API',
      version: '1.0.0',
      servers: [AppConfig.API_URL]      
    },    
  },
};
const specs = swaggerJsdoc(options);
const swaggerUi = require('swagger-ui-express');
const app = express();
if(isDebug)
    app.use('/api-docs-2020', swaggerUi.serve, swaggerUi.setup(specs));
app.disable('x-powered-by');
app.use(sessionConfig);
app.use(bodyParser.json({limit: '2mb'}));

//monitoring socket.io
        const { Socket } = require("socket.io");

        const
            ioc = require("socket.io-client"),
            ioClient = ioc.connect("http://localhost:8000");
//end 


app.use (async(error, req, res, next) => {
    if(isSentry)
        Sentry.captureException(error.toString());
    if(isDebug)
        res.status(500).json({"result":error.toString()});
    else
        res.status(500).json({"result":"Internal Server Error!"});
});


app.use(async (req,res,next)=>{
    const origin = req.headers.origin;
    if (AppConfig.ALLOW_ORIGIN.includes(origin)) 
    {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, X-TOKEN");
    next();
});

app.use(bodyParser.urlencoded({limit: '2mb', extended: true}));
app.use(async (req, res, next) => {
        try{

            const payload = {
                status_code: res.statusCode,
                ip: req.ip,
                server_name: process.env.SERVER_NAME,
                server_ip: req.get('host'),
                page: req.originalUrl.replace('/api/v1', ''),
                type: 'EXCH',
                user_agent: req.header('user-agent'),
                method: req.method,
                time: new Date().toLocaleTimeString(),
                date: new Date().toLocaleDateString(),
                user: req.accessToken
                    ? req.accessToken.adminId
                        ? req.accessToken.username.slice(0, 3) + '*'.repeat(req.accessToken.username.length - 3)
                        : req.accessToken.username
                    : 'Anonymous',
                get_data: req.query,
                post_data: req.body,
                header_data: req.headers,
                referer: req.header('referer'),
            };

            ioClient.emit('log', payload);
                next();
        }catch(e){
            console.log(e);
                    next();
            }

});
app.use(async (req,res,next)=>{
    try{
        let ip = req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress
        log("All GET Requests Data : " + req.path + " ip : " + ip + " " , req.query,__filename,__line);
        log("All POST Requests Data : " + req.path + " ip : " + ip + " " , req.body,__filename,__line);
        gUrlQuery = req.query;
        gPage = isUndefined(req.query.page) ? 1 : toNumber(req.query.page);
        if(gPage <= 0)
            gPage = 1;
    
        if(!req.session.limit)
            req.session.limit = gLimit;
    
        if(!req.session.sortColumn)
            req.session.sortColumn = gSortColumn;
    
        if(!req.session.sortType)
            req.session.sortType = gSortType;
    
    
        let field = safeString(req.query.field);
        if(field !== '')
        {
            let indexField = gSortColumns.indexOf(field);
            if(indexField !== -1)
            {
                gSortColumn = field;
                req.session.sortColumn = field;
            }
            else
            {
                gSortColumn = '_id';
                req.session.sortColumn = '_id';
            }
        }

        let sort = safeString(req.query.sort);
        if(sort !== '')
        {
            gSortType = (sort === "ASC") ? "ASC" : "DESC";
            req.session.sortType = gSortType;
            req.session.sortType2 = (sort === "ASC") ? 1 : -1;
            gSortType3 = (sort === "ASC") ? 1 : -1;
        }
        
    
        let limit = toNumber(req.query.limit);
        if(limit > 0 && limit <= 100)
        {
            gLimit = limit;
            req.session.limit = gLimit;
        }
    
        gLimit = req.session.limit;
        gSortColumn = req.session.sortColumn;
        gSortType = req.session.sortType;
        gSortType2 = isUndefined(req.session.sortType2) ? -1 : req.session.sortType2;
    
    }
    catch(e)
    {
        if(isSentry)
            Sentry.captureException(e);
    }
    next();
});

const company = require('./company/company');
const hacker = require('./hacker/hacker');
const {getAdministrationLogin} = require('./administration/init');
const administration = require('./administration/administration');
app.use ('*.jpg|*.png|*.gif|*.mp4|*.pdf|*.doc|*.docx',async(req, res, next) => {
    try{
        const user_admin = await getAdministrationLogin(req.query.token,false);
        if (user_admin && isObjectID(user_admin._id)){
            next();
            return;
        }
        const pathReq = req.originalUrl.split('/');
        pathReq.shift();
         if(!isUndefined(pathReq[0]) && pathReq[0] == 'avatars')
        {
            next();
            return;
        }
        else if(!isUndefined(pathReq[0]) && pathReq[0] == 'company')
        {
          let fileUrl = req.originalUrl.split('?')[0];
          const fileParse = path.parse(fileUrl);
          const fileFullAddress = fileParse['dir']+'/'+fileParse['base'];
          if(fileFullAddress.startsWith('/company/program_logo/'))
          {
            next();
            return;
          }
        }
        res.status(404).send("404!");
    }
    catch(e)
    {
        if(isSentry)
            Sentry.captureException(e);
        if(isDebug)
            res.status(500).json({"result":e.toString()});
        else
            res.status(500).json({"result":"Internal Server Error!"});
    }

});
app.use(express.static('media'));
app.use('/company', company);
app.use('/hacker', hacker);
app.use('/administration', administration);
const Frontend = require('./frontend/frontend');
const { async } = require('q');
app.use('/', Frontend);


//404
app.use((req,res)=>{
    res.status(404).send("404!");
});


app.listen(PORT,async (err)=>{
    let resultInitApp = await initApp();
    log(`${PORT} is running ...`,'',__filename,__line);
    if(err)
        log(`Error : ${err}`,'',__filename,__line);
});
