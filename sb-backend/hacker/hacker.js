require('./init');

const User = require('./modules/user/user');
const Program = require('./modules/program/program');
const SubmitReport = require('./modules/submit_report/submit_report');
const HackerUsers = require('./modules/hacker/hacker');
const Support = require('./modules/support/support');
const CTF = require('./modules/ctf/ctf');

hacker.use('/user',User);
hacker.use('/program',Program);
hacker.use('/submit_report',SubmitReport);
hacker.use('/hacker',HackerUsers);
hacker.use('/support',Support);
hacker.use('/ctf',CTF);

hacker.get('/',async (req,res)=>{
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
hacker.use(function(err, req, res, next) {
    if(isSentry)
        Sentry.captureException(err.toString());
    res.status(500).json({"result":"Internal Server Error!"});
});


//404
hacker.use((req,res)=>{
    res.status(404).json({"result":"404 Page not found!"});
});




module.exports = hacker;