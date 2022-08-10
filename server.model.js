require('./libs/core');


class LoggerModel {
    constructor() {
        this.collection = Models.LogModel;
    }

    async insertLog(data) {
        let i = this.collection({
            "user": data.user,
            "status_code":data.status_code,
            "method": data.method,
            "page": data.page,
            "get_data": json2Str(data.get_data),
            "post_data": json2Str(data.post_data),
            "header_data":json2Str(data.header_data),
            "user_agent": data.user_agent,
            "ip": data.ip,
            "referer": data.referer,
            "date_time": data.date + " " + data.time,
            "server_ip": data.server_ip,
            "server_name":data.server_name,
            "type":data.type,
        });
        let r = await i.save();
        return 1;
    }

    async logSearch(user, status_code, method
        , page, date_time_from, date_time_to, user_agent, ip, referer) {
        let showPerPage = gLimit;
        let ret = {};
        let where = {};
        if (user !== "") {
            where['user'] = { $regex: '.*' + user + '.*', "$options": "i" };
        }

        if (status_code !== "") {
            where['status_code'] = status_code;
        }
        if (method !== "") {
            where['method'] = { $regex: '.*' + method + '.*', "$options": "i" };
        }
        if (page !== "") {
            where['page'] = { $regex: '.*' + page + '.*', "$options": "i" };
        }
        if (user_agent !== "") {
            where['user_agent'] = { $regex: '.*' + user_agent + '.*', "$options": "i" };
        }

        if (ip !== "") {
            where['ip'] = { $regex: '.*' + ip + '.*', "$options": "i" };
        }

        if (referer !== "") {
            where['referer'] = { $regex: '.*' + referer + '.*', "$options": "i" };
        }

        if (date_time_from !== "" && date_time_to !== "") {
            where['date_time'] = {
                $gte: new Date(Date.parse(date_time_from)).setHours(0, 0, 0)
                , $lte: new Date(Date.parse(date_time_to)).setHours(23, 59, 59)
            };
        }

        let countRows = await this.collection.find(where).countDocuments();
        ret.totalRows = countRows;
        ret.page = gPage;
        ret.limit = showPerPage;
        ret.totalPage = Math.ceil(ret.totalRows / showPerPage);
        let offset = (gPage * showPerPage) - showPerPage;
        ret.rows = await this.collection.find(where)
            .sort([[gSortColumn, gSortType2]]).skip(offset).limit(showPerPage);
        return ret;
    }


}

module.exports = new LoggerModel();