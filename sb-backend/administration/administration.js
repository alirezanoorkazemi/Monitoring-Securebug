const {administration} = require('./init');
const {handleError} = require('../libs/error.helper');
const {toNumber} = require('../libs/methode.helper');
const {STATIC_VARIABLES} = require('../libs/enum.helper');

const User = require('./modules/user/user');
const Company = require('./modules/company/company');
const Program = require('./modules/program/program');
const Hacker = require('./modules/hacker/hacker');
const Report = require('./modules/report/report');
const Setting = require('./modules/setting/setting');
const Ctf = require('./modules/setting/ctf/ctf');
const Country = require('./modules/setting/country/country');
const Language = require('./modules/setting/language/language');
const Currency = require('./modules/setting/currency/currency');
const Range = require('./modules/setting/range/range');
const Skill = require('./modules/setting/skill/skill');
const Target_Type = require('./modules/setting/target_type/target_type');

administration.use('/user', User);
administration.use('/company', Company);
administration.use('/hacker', Hacker);
administration.use('/program', Program);
administration.use('/report', Report);
administration.use('/ctf', Ctf);
administration.use('/country', Country);
administration.use('/language', Language);
administration.use('/currency', Currency);
administration.use('/range', Range);
administration.use('/target-type', Target_Type);
administration.use('/skill', Skill);
administration.use('/setting', Setting);

administration.all('*', (req, res) => {
    res.status(toNumber(STATIC_VARIABLES.ERROR_CODE.NOT_ROUTE_FOUND)).json({"result": `${STATIC_VARIABLES.ERROR_CODE.NOT_ROUTE_FOUND} Page not found!`});
});

administration.use((error, req, res, next) => {
    handleError(error, res);
});

module.exports = administration;