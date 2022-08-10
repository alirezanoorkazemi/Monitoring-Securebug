const companyIO = require("../../../io/company");
const adminIO = require("../../../io/admin");
const moment = require('moment');

class SubmitReportHackerModel {
    constructor() {
        this.collection = SchemaModels.SubmitReportModel;
    }


    async getProgram(program_id) {
        if (!isObjectID(program_id))
            return null;
        return SchemaModels.ProgramModel.findOne({"_id": program_id})
            .populate('company_user_id', '_id fn ln display_name is_fully_manage')
            .populate('targets.target_type_id')
            .populate('targets.language_id')
            .populate('rewards.currency_id')
            ;
    }

    async checkTarget(program_id, target_id) {
        if (!isObjectID(program_id) || !isObjectID(target_id))
            return 0;
        return SchemaModels.ProgramModel.countDocuments({
            "_id": program_id
            , "targets._id": target_id
        });
    }

    async getTypeVulnerability(id) {
        if (!isObjectID(id))
            return 0;
        return SchemaModels.TypeVulnerabilityModel.findOne({"_id": id, "status": true}).countDocuments();
    }

    async addSubmit(hacker_user_id, program_id) {
        if (!isObjectID(hacker_user_id) || !isObjectID(program_id))
            return 0;
        let i = this.collection({
            "hacker_user_id": hacker_user_id,
            "program_id": program_id,
            "status": 0,
        });
        let r = await i.save();
        return r;
    }


    async saveStep2(hacker_user_id, report_id, target_id, vulnerability_type_id
        , severity, title, proof_url, proof_concept, proof_recommendation,
                    security_impact, is_next_generation, company_user, score, report_notification_setting, program_id) {
        if (!isObjectID(hacker_user_id) || !isObjectID(report_id))
            return 0;

        const severity_score = {
            A: score.A,
            AC: score.AC,
            AV: score.AV,
            C: score.C,
            I: score.I,
            PR: score.PR,
            S: score.S,
            UI: score.UI
        };
        let report_status = REPORT_STATUS.PENDING;
        if (company_user.is_fully_manage && (is_next_generation === PROGRAM_BOUNTY_TYPE.INTELLIGENCE_DISCOVERY ||
            is_next_generation === PROGRAM_BOUNTY_TYPE.NEXT_GEN_PEN_TEST)) {
            report_status = REPORT_STATUS.IN_PROGRESS_BY_ADMIN;
        }
        let data = {
            "vulnerability_type_id": vulnerability_type_id,
            "severity": severity,
            severity_score,
            "title": title,
            "proof_url": proof_url,
            "proof_concept": proof_concept,
            "proof_recommendation": proof_recommendation,
            "target_id": target_id,
            "security_impact": security_impact,
            "submit_date_time": getDateTime(),
            "last_modify_date_time": getDateTime(),
            "status": report_status,
            "is_next_generation": is_next_generation
        };
        let x = await this.collection.updateOne({
                "_id": report_id
                , "hacker_user_id": hacker_user_id
            }, {
                $set: data
            }
        );

        //add comment log for activity
        let i = SchemaModels.CommentSubmitReportModel({
            "hacker_user_id": hacker_user_id,
            "report_id": report_id,
            "send_date_time": getDateTime(),
            "reading_status": {
                read_by_moderator: [],
                read_by_hacker: true,
                read_by_company: []
            },
            "comment": "Create the submission",
            "send_type": 0,
        });
        let r = await i.save();
        await this.sendNotificationBaseOnSetting("new_report", program_id, report_id, hacker_user_id,
            severity, report_notification_setting, REPORT_NOTIFICATION_TYPE.SUBMIT_REPORT, is_next_generation,
            report_status,company_user.is_fully_manage);

        // const history_model = {
        //     sender_type: SENDER_TYPE.HACKER,
        //     activity:ACTIVITY_TEXT_LOG.SUBMIT_REPORT,
        //     sender_id:hacker_user_id,
        //     resource_type:RESOURCE_TYPE.REPORT,
        //     resource_id:x._id,
        //     register_date_time:getDateTime()
        // };
        // await SchemaModels.HistoryModel.create(history_model);
        return x;
    }

    async addReportFile(hacker_user_id, report_id, file, file_original_name) {
        if (!isObjectID(hacker_user_id) || !isObjectID(report_id))
            return 0;
        let data = {
            "file_name": file,
            "file_original_name": file_original_name
        };
        let report = await this.collection.findOneAndUpdate({
                "_id": report_id,
                "hacker_user_id": hacker_user_id
            }
            , {$push: {report_files: data}}
            , {new: true});
        if (report.report_files && report.report_files.length > 10) {
            await this.collection.updateOne({
                    "_id": report_id,
                    "hacker_user_id": hacker_user_id, "status": 0
                },
                {
                    $pull:
                        {
                            report_files: {file_name: file, file_original_name},
                        }
                },
            ).exec();

            return 2;
        }
        return 1;
    }

    async getRow(hacker_user_id, report_id) {
        if (!isObjectID(hacker_user_id) || !isObjectID(report_id))
            return null;

        let row = await this.collection.findOne({
            "hacker_user_id": hacker_user_id
            , "_id": report_id
        })
            .populate({
                path: 'program_id',
                populate: {
                    path: 'company_user_id',
                    select: {_id: 1, display_name: 1, avatar_file: 1}
                },
            })
            .populate('vulnerability_type_id');
        if (row) {
            let row2 = row.toObject();
            row2['count_comments'] = await SchemaModels.CommentSubmitReportModel.countDocuments(
                {"report_id": report_id, "hacker_user_id": hacker_user_id});

            const severity_history = await SchemaModels.HistoryModel.aggregate([
                {
                    $match: {
                        $and: [
                            {activity: ACTIVITY_TEXT_LOG.CHANGE_SEVERITY},
                            {resource_type: RESOURCE_TYPE.REPORT},
                            {resource_id: mongoose.Types.ObjectId(report_id)},
                        ]
                    }
                },
                {
                    $lookup: {
                        from: "company_users",
                        let: {sender_type: "$sender_type", company_id: "$sender_id"},
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $cond: [
                                            {
                                                $and: [
                                                    {$eq: ["$$sender_type", SENDER_TYPE.COMPANY]},
                                                    {$eq: ["$$company_id", "$_id"]},
                                                ]
                                            }, true, false
                                        ]
                                    }
                                }
                            }
                        ],
                        as: "sender_id"
                    }
                },
                {$unwind: {path: "$sender_id", preserveNullAndEmptyArrays: true}},
                {$sort: {register_date_time: 1}},
                {
                    $project: {
                        _id: 1,
                        sender_type: 1,
                        sender_id: {display_name: 1, avatar_file: 1},
                        fields: 1,
                        register_date_time: 1
                    }
                }
            ]);
            row2.severity_history = severity_history || [];
            return row2;
        } else {
            return null;
        }
    }

    async deleteReportFile(hacker_user_id, report_id, file_id) {
        if (!isObjectID(hacker_user_id) || !isObjectID(report_id) || !isObjectID(file_id))
            return 0;

        let ret = await this.collection.updateOne({
                "_id": report_id,
                "hacker_user_id": hacker_user_id, "status": 0
            },
            {
                $pull:
                    {
                        report_files: {_id: file_id},
                    }
            },
        ).exec();

        return 1;

    }


    async getReportList(hacker_user_id, title, status, severity, is_close, field, report_id, from_date, to_date) {
        if (!isObjectID(hacker_user_id))
            return 0;

        let showPerPage = gLimit;
        let ret = {};
        ret.current_page = gPage;
        let where = {
            "hacker_user_id": mongoose.Types.ObjectId(hacker_user_id),
            "status": {$gte: 1}
        };
        if (title !== "") {
            where['title'] = {$regex: '.*' + title + '.*', "$options": "i"};
        }
        if (status != '') {
            let s = toNumber(status);
            if (s > 0)
                where['status'] = toNumber(status);
        }
        if (severity != '') {
            severity = toNumber(severity);
            if (severity <= 0 || severity >= 5)
                severity = 0;
            where['severity'] = severity;
        }
        if (from_date && to_date) {
            where['submit_date_time'] = {
                $gte: moment(from_date).toDate(),
                $lt: moment(to_date).add(86399, 'seconds').toDate()
            }
        } else if (from_date) {
            where['submit_date_time'] = {'$gte': moment(from_date).toDate()};
        } else if (to_date) {
            where['submit_date_time'] = {'$lte': moment(to_date).add(86399, 'seconds').toDate()};
        }
        if (is_close != '') {
            is_close = toNumber(is_close);
            if (is_close == 0 || is_close == 1) {
                where['is_close'] = is_close;
            }
        }
        if (report_id && isObjectID(report_id)) {
            where['_id'] = mongoose.Types.ObjectId(report_id);
        }
        let countRows = await this.collection.find(where).countDocuments();
        ret.totalRows = countRows;
        ret.totalPage = Math.ceil(ret.totalRows / showPerPage);
        let offset = (gPage * showPerPage) - showPerPage;
        const sort_by = this.setSortBy(field);
        let newRows = await this.collection.find(where)
            .sort({[sort_by]: -1, submit_date_time: -1}).skip(offset).limit(showPerPage)
            .populate({
                path: 'program_id',
                select: {
                    _id: 0,
                    name: 1,
                    logo_file: 1,
                    expire_date_program: 1,
                    start_date_program: 1,
                    is_next_generation: 1
                },
                populate: {
                    path: 'company_user_id',
                    select: {_id: 0, display_name: 1, avatar_file: 1}
                }
            })
            .select({
                status: 1,
                severity: 1,
                hacker_user_id: 1,
                program_id: 1,
                title: 1,
                submit_date_time: 1,
                is_close: 1
            }).lean();
        if (newRows && newRows.length > 0) {
            const comments = await SchemaModels.CommentSubmitReportModel.aggregate([
                {$match: {report_id: {$in: newRows.map(d => d._id)}, is_internal: {$ne: true}}},
                {
                    $facet: {
                        all_comment_count: [
                            {$group: {_id: "$report_id", count: {$sum: 1}}}
                        ],
                        unread_comment_count: [
                            {$match: {$and: [{reading_status: {$ne: null}}]}},
                            {
                                $group: {
                                    _id: "$report_id",
                                    count: {$sum: {$cond: [{$eq: [false, "$reading_status.read_by_hacker"]}, 1, 0]}}
                                }
                            }
                        ]
                    }
                }
            ]);
            newRows.forEach(item => {
                const all_comment_count = comments[0].all_comment_count.find(f => f._id.toString() === item._id.toString());
                const unread_comment_count = comments[0].unread_comment_count.find(f => f._id.toString() === item._id.toString());
                if (all_comment_count) {
                    item.count_comments = all_comment_count.count;
                } else {
                    item.count_comments = 0;
                }
                if (unread_comment_count) {
                    item.unread_comment_count = unread_comment_count.count;
                } else {
                    item.unread_comment_count = 0;
                }
            });
        }
        ret.rows = newRows;
        return ret;
    }


    async addCmdReport(hacker_user_id, report_id
        , file1, file1_original_name, file2, file2_original_name
        , file3, file3_original_name, company_user
        , comment, report_notification_setting) {

        if (!isObjectID(hacker_user_id) || !isObjectID(report_id))
            return 0;

        const report = await this.collection.findOne({_id: report_id, hacker_user_id})
            .populate({
                path: 'program_id',
                select: {is_next_generation: 1, _id: 1},
                populate: {
                    path: 'company_user_id',
                    select: {is_fully_manage: 1}
                }
            }).select({program_id: 1, _id: 1, status: 1, severity: 1});

        if (!report) {
            return 0;
        }

        let i = SchemaModels.CommentSubmitReportModel({
            "hacker_user_id": hacker_user_id,
            "report_id": report_id,
            "file1": file1,
            "file1_original_name": file1_original_name,
            "file2": file2,
            "file2_original_name": file2_original_name,
            "file3": file3,
            "file3_original_name": file3_original_name,
            "send_date_time": getDateTime(),
            "comment": comment,
            "reading_status": {
                read_by_moderator: [],
                read_by_hacker: true,
                read_by_company: []
            },
            "send_type": 0
        });
        await this.collection.updateOne({_id: report_id}, {$set: {last_modify_date_time: getDateTime()}});
        let r = await i.save();
        let is_next_generation = null;
        let is_fully_manage = false;
        if (report.program_id && report.program_id.company_user_id) {
            is_next_generation = report.program_id.is_next_generation;
            is_fully_manage = report.program_id.company_user_id.is_fully_manage;
        }
        await this.sendNotificationBaseOnSetting("comments_by_hacker", report.program_id._id, report_id, hacker_user_id, report.severity,
            report_notification_setting, REPORT_NOTIFICATION_TYPE.SUBMIT_COMMENT,
            is_next_generation, report.status, is_fully_manage);

        // const history_model = {
        //     sender_type: SENDER_TYPE.HACKER,
        //     activity:ACTIVITY_TEXT_LOG.SUBMIT_COMMENT,
        //     sender_id:hacker_user_id,
        //     resource_type:RESOURCE_TYPE.COMMENT,
        //     resource_id:r._id,
        //     register_date_time:getDateTime()
        // };
        // await SchemaModels.HistoryModel.create(history_model);
        return r;
    }


    async getCommentList(hacker_user_id, report_id) {
        if (!isObjectID(hacker_user_id) || !isObjectID(report_id))
            return {
                "current_page": 1,
                "totalRows": 0,
                "totalPage": 0,
                "rows": []
            };
        const ret = {};
        const report = await this.collection.findOne({"_id": report_id}).populate({
            path: 'program_id',
            select: {company_user_id: 1, _id: 0}
        }).select({program_id: 1, _id: 0});

        if (!(report && report.program_id && report.program_id.company_user_id)) {
            return 1;
        }

        const result = await SchemaModels.CommentSubmitReportModel.aggregate([
            {$match: {'report_id': mongoose.Types.ObjectId(report_id), is_internal: {$ne: true}}},
            {
                $lookup: {
                    from: "company_users",
                    localField: "company_user_id",
                    foreignField: "_id",
                    as: "company_user_id",
                }
            },
            {
                $unwind: {
                    path: "$company_user_id",
                    "preserveNullAndEmptyArrays": true
                }
            },
            {
                $lookup: {
                    from: "company_users",
                    localField: "company_user_id.parent_user_id",
                    foreignField: "_id",
                    as: "parent_company_user_id",
                }
            },
            {
                $unwind: {
                    path: "$parent_company_user_id",
                    "preserveNullAndEmptyArrays": true
                }
            },
            {
                $match: {
                    $or: [
                        {"hacker_user_id": hacker_user_id},
                        {"company_user_id._id": report.program_id.company_user_id},
                        {"company_user_id.parent_user_id": report.program_id.company_user_id}
                    ]
                }
            },
            {$sort: {"send_date_time": 1}},
            {
                $facet: {
                    totalRows: [
                        {
                            $count: "count",
                        },
                    ],
                    rows: [
                        {
                            $skip: (gPage - 1) * gLimit,
                        },
                        {$limit: gLimit},
                        {
                            $project: {
                                comment: 1,
                                type: 1,
                                send_type: 1,
                                send_date_time: 1,
                                file1: 1,
                                file2: 1,
                                file3: 1,
                                file1_original_name: 1,
                                file2_original_name: 1,
                                file3_original_name: 1,
                                submit_date_time: 1,
                                full_name: {$concat: [{$ifNull: ["$parent_company_user_id.fn", "$company_user_id.fn"]}, " ", {$ifNull: ["$parent_company_user_id.ln", "$company_user_id.ln"]}]},
                                company_user_name: {$ifNull: ["$parent_company_user_id.display_name", "$company_user_id.display_name"]},
                                company_avatar_url: {$ifNull: ["$parent_company_user_id.avatar_file", "$company_user_id.avatar_file"]}
                            },
                        },
                    ],
                },
            }
        ]).exec();
        if (result && result.length > 0 && result[0].totalRows.length > 0) {
            await SchemaModels.CommentSubmitReportModel.updateMany({
                $and: [{report_id: report_id}, {reading_status: {$exists: true}},
                    {_id: {$in: result[0].rows.map(d => d._id.toString())}}]
            }, {$set: {"reading_status.read_by_hacker": true}});
            ret.rows = result[0].rows;
            ret.totalRows = result[0].totalRows[0].count;
            ret.totalPage = Math.ceil(ret.totalRows / gLimit);
        } else {
            ret.rows = [];
            ret.totalRows = 0;
            ret.totalPage = 0;
        }
        return ret;
    }

    async sendNotificationBaseOnSetting(setting_key_name, program_id, report_id, hacker_user_id, severity, hacker_report_notifications_setting, type, is_next_generation, status, is_fully_manage) {
        const setting_key_name_advance = `${setting_key_name}_advance`;
        const program = await SchemaModels.ProgramModel.aggregate([
            {
                $match: {"_id": program_id}
            },
            {
                $lookup: {
                    from: "company_users",
                    let: {"company_user_id": "$company_user_id"},
                    pipeline: [
                        {
                            $match:
                                {
                                    $expr:
                                        {
                                            $or:
                                                [
                                                    {$eq: ["$_id", "$$company_user_id"]},
                                                    {$eq: ["$parent_user_id", "$$company_user_id"]}
                                                ]
                                        }

                                }
                        },
                        {
                            $project: {_id: 1, fn: 1, display_name: 1, report_notification_setting: 1, access_program_list:1}
                        }
                    ],
                    as: "company_users"
                }
            },
            {
                $project: {
                    "_id": 0,
                    "company_users": 1,
                    "moderator_users": 1
                }
            },
        ]).exec();
        let companyUserIds = [];
        let moderatorUserIds = [];
        let notification_company_users = [];
        if (program && program[0]) {
            const companies = program[0].company_users.filter(d => (!d.access_program_list ||
                d.access_program_list.length === 0 ||
                d.access_program_list.map(p => p._id.toString()).includes(program_id.toString())) &&
                !!d.report_notification_setting &&
                !!d.report_notification_setting[setting_key_name_advance] &&
                d.report_notification_setting[setting_key_name_advance].includes(severity) &&
                (d.report_notification_setting[setting_key_name] === NORIFICATION_SETTING.EMAIL ||
                    d.report_notification_setting[setting_key_name] === NORIFICATION_SETTING.EMAIL_WEB));
            if (companies) {
                companyUserIds = companies.map(d => d._id);
            }

            const notification_companies = program[0].company_users.filter(d => (!d.access_program_list ||
                d.access_program_list.length === 0 ||
                d.access_program_list.map(p => p._id.toString()).includes(program_id.toString())) &&
                !!d.report_notification_setting &&
                !!d.report_notification_setting[setting_key_name_advance] &&
                d.report_notification_setting[setting_key_name_advance].includes(severity) &&
                (d.report_notification_setting[setting_key_name] === NORIFICATION_SETTING.WEB ||
                    d.report_notification_setting[setting_key_name] === NORIFICATION_SETTING.EMAIL_WEB));
            if (notification_companies) {
                notification_company_users = notification_companies.map(d => ({
                    _id: d._id,
                    display_name: d.display_name,
                    fn: d.fn
                }));
            }
            const moderators = program[0].moderator_users;
            if (moderators && isArray(moderators)) {
                moderatorUserIds = moderators.map(d => d.moderator_user_id);
            }
        }
        let data = [];
        if (hacker_report_notifications_setting &&
            isArray(hacker_report_notifications_setting[setting_key_name_advance]) &&
            hacker_report_notifications_setting[setting_key_name_advance] &&
            hacker_report_notifications_setting[setting_key_name_advance].includes(severity) &&
            (hacker_report_notifications_setting[setting_key_name] === NORIFICATION_SETTING.EMAIL_WEB ||
                hacker_report_notifications_setting[setting_key_name] === NORIFICATION_SETTING.EMAIL)
        ) {
            data.push({
                "program_id": program_id,
                "hacker_user_id": hacker_user_id,
                "report_id": report_id,
                "type": type,
                "register_date_time": getDateTime()
            });
        }
        if ((setting_key_name === "new_report" && is_fully_manage &&
            (is_next_generation === PROGRAM_BOUNTY_TYPE.INTELLIGENCE_DISCOVERY ||
                is_next_generation === PROGRAM_BOUNTY_TYPE.NEXT_GEN_PEN_TEST)) ||
            (setting_key_name === "comments_by_hacker" && status === REPORT_STATUS.IN_PROGRESS_BY_ADMIN)) {
            companyUserIds = [];
            notification_company_users = [];
        }
        companyUserIds.forEach(id => {
            data.push({
                "program_id": program_id,
                "report_id": report_id,
                "company_user_id": id,
                "type": type,
                "register_date_time": getDateTime()
            })
        });
        moderatorUserIds.forEach(id => {
            data.push({
                "program_id": program_id,
                "report_id": report_id,
                "moderator_user_id": id,
                "type": type,
                "register_date_time": getDateTime()
            })
        });

        await SchemaModels.ReportNotificationModel.insertMany(data);
        if (setting_key_name === "new_report") {
            if (isArray(notification_company_users) && notification_company_users.length > 0) {
                const company_notifications = await this.createNotifications("Submit Report",
                    notification_company_users, null, FIELD_TYPE.OTHER, hacker_user_id, MESSAGE_TYPE.INFO,
                    report_id, ACTION_TYPE.CREATE, RESOURCE_TYPE.REPORT, SENDER_TYPE.COMPANY);
                this.sendNotification("notification", company_notifications, companyIO, "company_user_id");
            }
            const notification_moderator_users = await this.getModeratorsByIds(moderatorUserIds);
            if (isArray(notification_moderator_users) && notification_moderator_users.length > 0) {
                const moderator_notifications = await this.createNotifications("Submit Report",
                    notification_moderator_users, null, FIELD_TYPE.OTHER, hacker_user_id, MESSAGE_TYPE.INFO,
                    report_id, ACTION_TYPE.CREATE, RESOURCE_TYPE.REPORT, SENDER_TYPE.MODERATOR);
                this.sendNotification("notification", moderator_notifications, adminIO, "moderator_user_id");
            }
        } else if (setting_key_name === "comments_by_hacker") {
            if (isArray(notification_company_users) && notification_company_users.length > 0) {
                const company_notifications = await this.createNotifications("New Comment",
                    notification_company_users, null, FIELD_TYPE.OTHER, hacker_user_id, MESSAGE_TYPE.INFO,
                    report_id, ACTION_TYPE.CREATE, RESOURCE_TYPE.COMMENT, SENDER_TYPE.COMPANY);
                this.sendNotification("notification", company_notifications, companyIO, "company_user_id");
            }
            const notification_moderator_users = await this.getModeratorsByIds(moderatorUserIds);
            if (isArray(notification_moderator_users) && notification_moderator_users.length > 0) {
                const moderator_notifications = await this.createNotifications("New Comment",
                    notification_moderator_users, null, FIELD_TYPE.OTHER, hacker_user_id, MESSAGE_TYPE.INFO,
                    report_id, ACTION_TYPE.CREATE, RESOURCE_TYPE.COMMENT, SENDER_TYPE.MODERATOR);
                this.sendNotification("notification", moderator_notifications, adminIO, "moderator_user_id");
            }
        }
    }

    sendNotification(emit_name, notifications, socketIIO, id_name) {
        if (socketIIO && socketIIO["sockets"] && socketIIO["sockets"].size > 0 && socketIIO["to"]) {
            const sockets_info = convertSetOrMapToArray(socketIIO["sockets"]);
            if (sockets_info.length > 0) {
                sockets_info.forEach(s => {
                    if (s.data && s.data._id) {
                        const notification = notifications.find(n => n[id_name].toString() === s.data._id.toString());
                        if (notification) {
                            socketIIO["to"](s.id.toString()).emit(emit_name, {
                                title: notification.title,
                                text: notification.text,
                                id: notification._id,
                                date: notification.register_date_time,
                                message_type: notification.message_type,
                                report_id: notification.report_id,
                                resource_type: notification.resource_type
                            });
                        }
                    }
                });
            }
        }
    }

    async createNotifications(title, users, value, field_type, hacker_user_id, message_type, report_id, action_type, resource_type, reciever_type) {
        const notifications = [];
        users.forEach(c => {
            let text = "";
            if (reciever_type === SENDER_TYPE.COMPANY) {
                if (resource_type === RESOURCE_TYPE.COMMENT) {
                    text = `${c.display_name || c.fn}, You have received a comment regarding your program`;
                } else if (resource_type === RESOURCE_TYPE.REPORT) {
                    text = `${c.display_name || c.fn}, You have received a report regarding your program`;
                }
            } else if (reciever_type === SENDER_TYPE.MODERATOR) {
                if (resource_type === RESOURCE_TYPE.COMMENT) {
                    text = `${c.alias || c.fn}, The Hacker has added a comment on a report`;
                } else if (resource_type === RESOURCE_TYPE.REPORT) {
                    text = `${c.alias || c.fn}, The Hacker has added a report regarding a program`;
                }
            }
            const notification = {
                title,
                text,
                status: NOTIFICATION_STATUS.SEND,
                register_date_time: getDateTime(),
                sender_type: SENDER_TYPE.HACKER,
                field_type,
                resource_type,
                action_type,
                message_type,
                report_id,
                hacker_user_id,
            };
            if (reciever_type === SENDER_TYPE.COMPANY) {
                notification.company_user_id = c._id
            } else if (reciever_type === SENDER_TYPE.MODERATOR) {
                notification.moderator_user_id = c._id
            }
            notifications.push(notification);
        });
        return SchemaModels.NotificationModel.insertMany(notifications);
    }

    async getModeratorsByIds(moderatorUserIds) {
        return await SchemaModels.ModeratorUserModel.aggregate([
            {
                $match: {
                    $and: [{status: true}, {
                        $or: [{user_level_access: toNumber(ADMIN_ROLES.ADMIN)},
                            {_id: {$in: moderatorUserIds.map(id => mongoose.Types.ObjectId(id))}}]
                    }]
                }
            },
            {$project: {fn: 1, ln: 1, alias: 1, _id: 1}}
        ]);
    }

    setSortBy(field) {
        switch (field) {
            case "date":
                return "submit_date_time";
            case "title":
                return "title";
            case "last_modified":
                return "last_modify_date_time";
            default:
                return "submit_date_time";
        }
    }

    async checkAcceptedInvitationByHacker(user_id, program_id) {
        return await SchemaModels.ProgramInviteModel.countDocuments({
            program_id,
            hacker_user_id: user_id,
            status_invite: INVITE_HACKER_STATUS.ACCEPT
        });
    }
}

module.exports = new SubmitReportHackerModel();