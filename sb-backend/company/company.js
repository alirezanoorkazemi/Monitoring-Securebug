require('./init');

const User = require('./modules/user/user');
company.use('/user',User);
const Program = require('./modules/program/program');
company.use('/program',Program);
const hackerUsers = require('./modules/hacker/hacker');
company.use('/hacker',hackerUsers);
const support = require('./modules/support/support');
company.use('/support',support);
const submitReport = require('./modules/submit_report/submit_report');
company.use('/submit_report',submitReport);


company.get('/',async (req,res)=>{
    try{
        res.json({});
    }
    catch (e) {
        if(isSentry)
            Sentry.captureException(e);
        if(isDebug)
            res.status(500).json({"result":e.toString()});
        else
            res.status(500).json({"result":"Internal Server Error!"});
    }
});




//500
company.use(function(err, req, res, next) {
    if(isSentry)
        Sentry.captureException(err);
    res.status(500).json({"result":"Internal Server Error!"});
});


//404
company.use((req,res)=>{
    res.status(404).json({"result":"404 Page not found!"});
});




module.exports = company;