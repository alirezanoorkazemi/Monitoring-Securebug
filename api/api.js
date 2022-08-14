require('./init');
require('./lang/fa');

const User = require('./modules/user/user');
api.use('/user', User);
const Logger = require('./modules/logger/logger');
api.use('/logger', Logger);


api.get('/', async (req, res) => {
    try {
        res.json({});
    }
    catch (e) {
        if (isDebug)
            res.status(500).json({ "result": e.toString() });
        else
            res.status(500).json({ "result": "Internal Server Error!" });
    }
});

//500
api.use(function (err, req, res, next) {
    res.status(500).json({ "result": "Internal Server Error!" });
});


//404
api.use((req, res) => {
    res.status(404).json({ "result": "404 Page not found!" });
});

module.exports = api;