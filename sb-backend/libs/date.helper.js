const momentTimeZone = require('moment-timezone');
const moment = require('moment');

const getTimeStamp = () => {
    return momentTimeZone.tz('Europe/Stockholm').unix();
};

const getYear = date => moment(date).year();

const getDate = () => {
    return momentTimeZone.tz('Europe/Stockholm');
};

const getDateTime = function () {
    return momentTimeZone.tz('Europe/Stockholm').format('YYYY-MM-DD HH:mm:ss');
};

const getUtcLessDateTime = function () {
    return moment().utcOffset(0,true).format('YYYY-MM-DD HH:mm:ss');
};

const getDateValue = (value) => {
    return moment(value).valueOf();
};

const getCurrentDate = function () {
    return moment().utcOffset(0,false).startOf('day').format('YYYY-MM-DD HH:mm:ss');
};
const getDiffDays = function (date) {
    const a = moment(date);
    const b = moment(getDateTime());
    return a.diff(b, 'days');

}

const getOnlyDays = function (date1, date2) {
    const a = moment(date1);
    const b = moment(date2);
    return b.diff(a, 'days');

}
const getDay = function () {
    var now = new Date();
    return now.getDate();
}
const getDayOfMonth = function (date) {
    return moment(date).format('DD');

}
module.exports = {
    getTimeStamp,getDate,getDateTime,getUtcLessDateTime,getCurrentDate,getDateValue,
    getYear, getDiffDays, getOnlyDays, getDay, getDayOfMonth
};