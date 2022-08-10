class HackerHackerModel {
    constructor() {
        this.collection = SchemaModels.HackerUserModel;
    }


    async getHacker(hacker_id) {
        if (!isObjectID(hacker_id))
            return null;
        let row = await this.collection.findOne({"is_verify": true, "status": true, "_id": hacker_id})
            .select('_id fn ln competency_profile username avatar_file sb_coin reputaion point')
            .populate('country_id')
            .populate('incoming_range_id')
        ;
        if (row) {
            let row2 = row.toObject();
            let sb_coin = isUndefined(row2.sb_coin) ? 0 : row2.sb_coin;
            let reputaion = isUndefined(row2.reputaion) ? 0 : row2.reputaion;
            let Reports = await this.getCountReport(hacker_id);
            row2.submit_reports = Reports;
            row2.privilage = (sb_coin + reputaion);
            row2.rank = setHackerRank(row2.rank);
            return row2;
        } else {
            return null;
        }
    }


    async getCountReport(hacker_id) {
        let L = await SchemaModels.SubmitReportModel.find({
            "hacker_user_id": hacker_id,
            "status": {$in: [4, 7]},
            "severity": 1
        }).countDocuments();
        let M = await SchemaModels.SubmitReportModel.find({
            "hacker_user_id": hacker_id,
            "status": {$in: [4, 7]},
            "severity": 2
        }).countDocuments();
        let H = await SchemaModels.SubmitReportModel.find({
            "hacker_user_id": hacker_id,
            "status": {$in: [4, 7]},
            "severity": 3
        }).countDocuments();
        let C = await SchemaModels.SubmitReportModel.find({
            "hacker_user_id": hacker_id,
            "status": {$in: [4, 7]},
            "severity": 4
        }).countDocuments();
        let ret = {
            "L": L,
            "M": M,
            "H": H,
            "C": C
        };
        return ret;
    }


    async getHackerList(username, competency, is_blue, fieldSort, sortSort) {


        let showPerPage = 12;
        let ret = {};
        ret.current_page = gPage;

        let match = {
            "is_verify": true,
            "status": true
        };

        let match2 = {};

        if (username != "") {
            match2["hacker_user.username"] = {$regex: '.*' + username + '.*', "$options": "i"};
        }

        if (competency > 0 && competency <= 3) {
            match2['hacker_user.competency_profile'] = competency;
        }
        if (is_blue != '') {
            is_blue = toNumber(is_blue);
            if (is_blue) {
                match2['$or'] = [{
                    "hacker_user.identity_passport_file_status": 1,
                }, {"hacker_user.identity_card_file_status": 1}, {"hacker_user.identity_driver_file_status": 1}]
            } else {
                match2['hacker_user.identity_passport_file_status'] = {$ne: 1};
                match2['hacker_user.identity_card_file_status'] = {$ne: 1};
                match2['hacker_user.identity_driver_file_status'] = {$ne: 1};
            }
        }

        let rowsCount = await SchemaModels.HackerUserModel.aggregate([
            {"$match": {"$and": [match]}},
            {
                $group:
                    {
                        _id: "$_id",
                    }
            }
            , {$lookup: {from: 'hacker_users', localField: '_id', foreignField: '_id', as: 'hacker_user'}}
            , {
                "$unwind": "$hacker_user"
            }
            , {$lookup: {from: 'countries', localField: 'hacker_user.country_id', foreignField: '_id', as: 'countries'}}
            , {
                $lookup: {
                    from: 'ranges',
                    localField: 'hacker_user.incoming_range_id',
                    foreignField: '_id',
                    as: 'ranges'
                }
            }
            , {"$match": {"$and": [match2]}}
            , {
                "$group": {
                    "_id": null,
                    "count": {"$sum": 1},
                }
            }
            , {
                $project: {
                    _id: 0,
                    "count": 1,
                }
            }
        ])
            .exec();
        let countRows = (rowsCount.length == 1) ? rowsCount[0]['count'] : 0;
        ret.totalRows = countRows;
        ret.totalPage = Math.ceil(ret.totalRows / showPerPage);
        let offset = (gPage * showPerPage) - showPerPage;
        var sort = {"$sort": {}};
        sort["$sort"][fieldSort] = sortSort;
        let match3 = {};

        if (username != "") {
            match3["username"] = {$regex: '.*' + username + '.*', "$options": "i"};
        }

        if (competency > 0 && competency <= 3) {
            match3['competency_profile'] = competency;
        }
        if (is_blue != '') {
            is_blue = toNumber(is_blue);
            is_blue = (is_blue == 1) ? 1 : 0;
            match3['is_blue'] = is_blue;
        }

        let rows = await SchemaModels.HackerUserModel.aggregate([
            {"$match": {"$and": [match]}}
            , {
                $group:
                    {
                        _id: "$_id",
                        privilage: {$sum: {$add: [{$ifNull: ["$sb_coin", 0]}, {$ifNull: ["$reputaion", 0]}]}},
                    }
            }
            , {$lookup: {from: 'hacker_users', localField: '_id', foreignField: '_id', as: 'hacker_user'}}
            , {
                "$unwind": "$hacker_user"
            }
            , {$lookup: {from: 'countries', localField: 'hacker_user.country_id', foreignField: '_id', as: 'countries'}}
            , {
                $lookup: {
                    from: 'ranges',
                    localField: 'hacker_user.incoming_range_id',
                    foreignField: '_id',
                    as: 'ranges'
                }
            }
            , {
                $lookup: {
                    from: 'submit_reports',
                    let: {id: '$hacker_user._id'},
                    pipeline: [
                        {
                            $group:
                                {
                                    '_id': null,
                                    "L": {
                                        "$sum": {
                                            $cond: [{
                                                $and: [{$eq: ["$hacker_user_id", "$$id"]},
                                                    {$in: ["$status", [4, 7]]},
                                                    {$eq: ["$severity", 1]}
                                                ]
                                            },
                                                1,
                                                0]
                                        }
                                    },
                                    "M": {
                                        "$sum": {
                                            $cond: [{
                                                $and: [{$eq: ["$hacker_user_id", "$$id"]},
                                                    {$in: ["$status", [4, 7]]},
                                                    {$eq: ["$severity", 2]}
                                                ]
                                            },
                                                1,
                                                0]
                                        }
                                    },
                                    "H": {
                                        "$sum": {
                                            $cond: [{
                                                $and: [{$eq: ["$hacker_user_id", "$$id"]},
                                                    {$in: ["$status", [4, 7]]},
                                                    {$eq: ["$severity", 3]}
                                                ]
                                            },
                                                1,
                                                0]
                                        }
                                    },
                                    "C": {
                                        "$sum": {
                                            $cond: [{
                                                $and: [{$eq: ["$hacker_user_id", "$$id"]},
                                                    {$in: ["$status", [4, 7]]},
                                                    {$eq: ["$severity", 4]}
                                                ]
                                            },
                                                1,
                                                0]
                                        }
                                    }

                                }
                        }
                    ],
                    as: 'submit_reports',
                }
            }
            , {
                "$unwind": "$submit_reports"
            }
            , {
                "$project": {
                    "privilage": 1,
                    "countries.title": 1,
                    "countries.code": 1,
                    "hacker_user": 1,
                    "ranges.title": 1,
                    "sb_coin_2": "$hacker_user.username",
                    "submit_reports": {
                        "L": "$submit_reports.L",
                        "M": "$submit_reports.M",
                        "H": "$submit_reports.H",
                        "C": "$submit_reports.C",
                    }
                }
            }
            , {
                $sort: {
                    privilage: -1,
                    "sb_coin_2": -1
                }
            }
            , {
                "$group": {
                    "_id": null, "results": {
                        "$push": {
                            "privilage": "$privilage"
                            , "username": "$hacker_user.username"
                            , "submit_reports": "$submit_reports"
                            , "hacker_id": "$hacker_user._id"
                            , "fn": "$hacker_user.fn"
                            , "ln": "$hacker_user.ln"
                            , "avatar_file": "$hacker_user.avatar_file"
                            , "sb_coin": "$hacker_user.sb_coin"
                            , "reputaion": "$hacker_user.reputaion"
                            , "point": "$hacker_user.point"
                            , "competency_profile": "$hacker_user.competency_profile"
                            , "identity_passport_file_status": "$hacker_user.identity_passport_file_status"
                            , "identity_card_file_status": "$hacker_user.identity_card_file_status"
                            , "identity_driver_file_status": "$hacker_user.identity_driver_file_status"
                            , "country": "$countries"
                            , "ranges": "$ranges"
                        }
                    }
                }
            }
            , {"$unwind": {"path": "$results", "includeArrayIndex": "rank"}}
            , {
                $project: {
                    _id: 0,
                    "submit_reports": "$results.submit_reports",
                    "privilage": "$results.privilage",
                    "hacker_id": "$results.hacker_id",
                    "competency_profile": "$results.competency_profile",
                    "fn": "$results.fn",
                    "ln": "$results.ln",
                    "sb_coin": "$results.sb_coin",
                    "reputaion": "$results.reputaion",
                    "point": "$results.point",
                    "avatar_file": "$results.avatar_file",
                    "username": "$results.username",
                    "ranges": "$results.ranges",
                    "country": "$results.country",
                    "rank": {"$add": ["$rank", 1]},
                    "is_blue": {
                        "$sum": {
                            "$cond":
                                {
                                    if: {
                                        $or: [{$eq: ["$results.identity_passport_file_status", 1]}
                                            , {$eq: ["$results.identity_card_file_status", 1]}
                                            , {$eq: ["$results.identity_driver_file_status", 1]}]
                                    }, then: 1, else: 0
                                }
                        }
                    }
                }
            }

            , {"$match": {"$and": [match3]}}
            , sort
            , {"$limit": offset + showPerPage}
            , {"$skip": offset}
        ])
            .exec();
        ret.rows = rows;
        return ret;
    }


    async getBountyData(user_id, report_severity, program_id, company_name) {
        if (!isObjectID(user_id))
            return 1;

        const ret = {};
        ret.rows = [];
        ret.totalRows = 0;
        ret.totalPage = 0;
        ret.currentPage = gPage;
        ret.program_list = [];
        ret.payments = [];
        ret.total_bounty = 0;
        ret.total_withdraw = 0;
        ret.maximum_bounty = 0;
        ret.average_bounty = 0;
        ret.total_paid = 0;
        ret.can_withdraw = false;
        ret.is_set_one_payment = false;
        ret.default_payment = 0;
        ret.payment_types = [];

        if (report_severity != '') {
            report_severity = toNumber(report_severity);
            if (report_severity <= 0 || report_severity >= 5)
                report_severity = 0;
        }
        const limit = 10;
        const skip = (gPage - 1) * limit;

        const result = await SchemaModels.PaymentHistoryModel.aggregate([
            {$match: {$and: [{hacker_user_id: user_id}, {type: 1}]}},
            {$lookup: {from: 'programs', localField: 'program_id', foreignField: '_id', as: 'program_id'}},
            {$unwind: {path: "$program_id", preserveNullAndEmptyArrays: true}},
            ...((program_id !== "")
                ? [{"$match": {"program_id._id": mongoose.Types.ObjectId(program_id)}}] : []),
            {
                $lookup: {
                    from: 'company_users',
                    localField: 'company_user_id',
                    foreignField: '_id',
                    as: 'company_user_id'
                }
            },
            {$unwind: {path: "$company_user_id", preserveNullAndEmptyArrays: true}},
            ...((company_name !== "")
                ? [{
                    "$match": {
                        "company_user_id.display_name": {
                            $regex: ".*" + company_name + ".*",
                            $options: "i"
                        }
                    }
                }] : []),
            {$lookup: {from: 'submit_reports', localField: 'report_id', foreignField: '_id', as: 'report_id'}},
            {$unwind: {path: "$report_id", preserveNullAndEmptyArrays: true}},
            ...((report_severity !== "") ? [{"$match": {"report_id.severity": report_severity}}] : []),
            {$sort: {"register_date_time": -1}},
            {
                $facet: {
                    totalRows: [{$count: "count"}],
                    rows: [{$skip: skip}, {$limit: limit},
                        {
                            $project: {
                                _id: 0,
                                register_date_time: 1,
                                amount: 1,
                                is_positive: 1,
                                program_id: {name: 1, _id: 1},
                                report_id: {severity: 1, _id: 1},
                                company_user_id: {display_name: 1},
                            }
                        }
                    ]
                }
            }
        ]);
        if (result && result.length > 0 && result[0].totalRows.length > 0) {
            ret.rows = result[0].rows;
            ret.totalRows = result[0].totalRows[0].count;
            ret.totalPage = Math.ceil(ret.totalRows / limit);
        }
        const transactions = await SchemaModels.PaymentHistoryModel
            .find({hacker_user_id: user_id}, {_id: 0, program_id: 1, amount: 1})
            .populate({
                path: "program_id",
                select: {_id: 1, name: 1}
            });
        if (transactions && transactions.length > 0) {
            ret.program_list = Array.from(new Set(transactions.map(d => d.program_id._id)))
                .map(id => {
                    return {_id: id, name: transactions.find(p => p.program_id._id === id).program_id.name}
                });
            const amounts = transactions.map(d => d.amount);
            ret.total_bounty = amounts.reduce((a, b) => a + b, 0);
            ret.maximum_bounty = Math.max(...amounts);
            ret.average_bounty = Math.round(ret.total_bounty / amounts.length);
        }
        const payments = await SchemaModels.PaymentModel
            .find({hacker_user_id: user_id}, {_id: 0, amount: 1, status: 1, register_date_time: 1})
            .sort({"register_date_time": -1});
        if (payments && payments.length > 0) {
            ret.payments = payments;
            const total_withdraw_amounts = payments.filter(d => d.status === 1 || d.status === 0).map(d => d.amount);
            const total_paid_amounts = payments.filter(d => d.status === 1).map(d => d.amount);
            ret.total_withdraw = total_withdraw_amounts.reduce((a, b) => a + b, 0);
            ret.total_paid = total_paid_amounts.reduce((a, b) => a + b, 0);
        }

        const user = await SchemaModels.HackerUserModel.findOne({_id: user_id})
            .select({
                payment_paypal_email: 1, payment_usdt_public_key: 1,
                payment_bank_transfer_account_holder: 1, payment_default: 1
            });
        if (user) {
            const payment_types = [];
            if (user.payment_paypal_email) {
                payment_types.push({title: "Paypal", value: PAYMENT_DEFAULT.PAYPAL});
            }
            if (user.payment_bank_transfer_account_holder) {
                payment_types.push({title: "Bank Transfer", value: PAYMENT_DEFAULT.BANK_TRANSFER});
            }
            ret.can_withdraw = ret.total_bounty > 0 && (ret.total_bounty - ret.total_withdraw) > 50;
            ret.is_set_one_payment = payment_types.length > 0;
            ret.default_payment = user.payment_default;
            ret.payment_types = payment_types;
        }
        return ret;
    }

    async saveClaimWithdraw(user, bounty, payment_type) {
        bounty = toNumber(bounty);
        if (bounty === 0) {
            return 5;
        }
        if (payment_type !== PAYMENT_DEFAULT.PAYPAL && payment_type !== PAYMENT_DEFAULT.BANK_TRANSFER) {
            return 5;
        }
        if (payment_type == PAYMENT_DEFAULT.PAYPAL && !user.payment_paypal_email) {
            return 5;
        } else if (payment_type == PAYMENT_DEFAULT.BANK_TRANSFER && !user.payment_bank_transfer_account_holder) {
            return 5;
        }
        if (bounty < 50) {
            return 2;
        }
        if (!isObjectID(user._id)) {
            return 4;
        }

        const transactions = await SchemaModels.PaymentHistoryModel.aggregate([
            {$match: {$and: [{hacker_user_id: user._id}, {type: 1}]}},
            {$project: {amount: 1, _id: 0}}
        ]);
        if (!transactions || transactions.length === 0) {
            return 3;
        }
        const amounts = transactions.map(d => d.amount);
        const total_bounty = amounts.reduce((a, b) => a + b, 0);
        const payments = await SchemaModels.PaymentModel.find({hacker_user_id: user._id});
        const withdraws = (payments && payments.length > 0) ? payments.filter(payment => payment.status === 1 || payment.status === 0).map(d => d.amount) : 0;
        const total_withdraw = withdraws !== 0 ? withdraws.reduce((a, b) => a + b, 0) : 0;
        if (bounty > (total_bounty - total_withdraw)) {
            return 3;
        }
        const tracking_code = randomStr(12);
        const payment_model = {
            hacker_user_id: user._id,
            amount: bounty,
            payment_type: payment_type,
            tracking_code: tracking_code,
            status: 0,
            register_date_time: getDateTime()
        };
        const payment = await SchemaModels.PaymentModel.create(payment_model);
        // const history_model = {
        //     sender_type: SENDER_TYPE.HACKER,
        //     activity:ACTIVITY_TEXT_LOG.WITHDRAW_REQUEST,
        //     sender_id:user._id,
        //     resource_type:RESOURCE_TYPE.PAYMENT,
        //     resource_id:payment._id,
        //     register_date_time:getDateTime()
        // };
        // await SchemaModels.HistoryModel.create(history_model);
        return {total_withdraw: total_withdraw + bounty, payment: payment_model, tracking_code};
    }

    async getSettingsByKey(keys) {
        const settings = await SchemaModels.SettingModel.find({key: {$in: keys}}).lean();
        let response = {};
        settings.forEach(setting => response[`${setting.key}`] = setting.value);
        return response;
    }

    async getNotifications(user_id, is_new, page) {
        const ret = {};
        const showPerPage = 12;
        if (is_new === "true") {
            const result = await SchemaModels.NotificationModel.aggregate([
                {
                    $match: {
                        $and: [{hacker_user_id: user_id}, {status: NOTIFICATION_STATUS.SEND},
                            {sender_type: {$ne: SENDER_TYPE.HACKER}}]
                    }
                },
                {$sort: {register_date_time: -1}},
                {
                    $facet: {
                        rows: [{$limit: showPerPage}, {
                            $project: {
                                title: 1,
                                text: 1,
                                status: 1,
                                message_type: 1,
                                _id: 1,
                                report_id: 1,
                                resource_type: 1,
                                field_type: 1,
                                register_date_time: 1,
                            }
                        }],
                        total_rows: [{$count: "count"}]
                    }
                }
            ]);
            if (result && result[0] && result[0].rows.length > 0) {
                return {
                    notifications: result[0].rows,
                    notifications_count: result[0].total_rows[0].count
                };
            }
            const notifications = await SchemaModels.NotificationModel.find({
                hacker_user_id: user_id, sender_type: {$ne: SENDER_TYPE.HACKER}
            }).sort({register_date_time: -1}).limit(3).select({
                title: 1,
                text: 1,
                message_type: 1,
                register_date_time: 1,
                status: 1,
                _id: 1,
                report_id: 1,
                resource_type: 1,
                field_type: 1,
            });
            return {notifications: notifications, notifications_count: 0};
        } else if (is_new === "false") {
            ret.current_page = page || 1;
            const where = {
                "hacker_user_id": mongoose.Types.ObjectId(user_id),
                sender_type: {$ne: SENDER_TYPE.HACKER}
            };
            const result = await SchemaModels.NotificationModel.aggregate([
                {$match: where},
                {$sort: {register_date_time: -1}},
                {
                    $facet: {
                        totalRows: [
                            {
                                $count: "count",
                            }
                        ],
                        rows: [
                            {
                                $skip: (ret.current_page - 1) * showPerPage,
                            },
                            {$limit: showPerPage},
                            {
                                $project: {
                                    _id: 1,
                                    title: 1,
                                    text: 1,
                                    message_type: 1,
                                    register_date_time: 1,
                                    resource_type: 1,
                                    field_type: 1,
                                    report_id: 1,
                                    status: 1
                                }
                            }
                        ],
                    },
                },
            ]).exec();
            if (result && result.length > 0 && result[0].totalRows.length > 0) {
                const notification_ids = result[0].rows.map(n => n._id.toString());
                await SchemaModels.NotificationModel.updateMany(
                    {
                        hacker_user_id: user_id,
                        _id: {$in: notification_ids}
                    },
                    {$set: {status: NOTIFICATION_STATUS.READ}});
                ret.rows = result[0].rows;
                ret.totalRows = result[0].totalRows[0].count;
                ret.totalPage = Math.ceil(ret.totalRows / showPerPage);
            } else {
                ret.rows = [];
                ret.totalRows = 0;
                ret.totalPage = 0;
            }
            return ret;
        } else {
            ret.rows = [];
            ret.totalRows = 0;
            ret.totalPage = 0;
            return ret;
        }
    }

    async updateNotificationStatus(user_id, notification_id, status) {
        if (isObjectID(user_id)) {
            if (isObjectID(notification_id)) {
                await SchemaModels.NotificationModel.updateOne(
                    {_id: notification_id, hacker_user_id: user_id}, {$set: {status}});
            } else if (notification_id === "read_all") {
                await SchemaModels.NotificationModel.updateMany(
                    {hacker_user_id: user_id, status: NOTIFICATION_STATUS.SEND, sender_type: {$ne: SENDER_TYPE.HACKER}}
                    , {$set: {status}});
            }
        }
    }
}

module.exports = new HackerHackerModel();