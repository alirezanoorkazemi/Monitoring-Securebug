const moment = require('moment');
const {
    toNumber, hasValue, setPaginationResponse, isArray,
    isObjectID, toObjectID, convertSetOrMapToArray, safeString
} = require('../../../libs/methode.helper');
const {getDateTime} = require('../../../libs/date.helper');
const {updateHackerRank, getModeratorProgramIds, checkUserAccess} = require('../../init');
const {
    REPORT_STATUS, ADMIN_ROLES, PROGRAM_STATUS, STATIC_VARIABLES,
    REPORT_NOTIFICATION_TYPE, REPORT_SEVERITY, REPORT_ACTIVITY,
    COMMENT_SEND_TYPE, COMMENT_SYSTEM_TYPE, PAYMENT_HISTORY_TYPE,
    MESSAGE_TYPE, NOTIFICATION_STATUS, ACTION_TYPE, ACTIVITY_TEXT_LOG,
    RESOURCE_TYPE, SENDER_TYPE, FIELD_TYPE, HISTORY_TYPE, HACKER_TAGS,
    NORIFICATION_SETTING
} = require('../../../libs/enum.helper');
const {ErrorHelper} = require('../../../libs/error.helper');
const hackerIO = require("../../../io/hacker");
const companyIO = require("../../../io/company");

class SubmitReportModel {
    constructor() {
        this.collection = SchemaModels.SubmitReportModel;
    }

    async gets(data) {
        const filters = [];
        filters.push({status: {$gt: REPORT_STATUS.NONE}});
        if (data.user_level_access === toNumber(ADMIN_ROLES.MODERATOR)) {
            const program_ids = await getModeratorProgramIds(data.user_id);
            filters.push({program_id: {$in: program_ids.map(d => toObjectID(d))}});
        }
        if (hasValue(data.severity)) {
            filters.push({severity: data.severity});
        }
        if (hasValue(data.report_id)) {
            filters.push({_id: toObjectID(data.report_id)});
        }
        if (hasValue(data.vulnerability_type_id)) {
            filters.push({vulnerability_type_id: toObjectID(data.vulnerability_type_id)});
        }
        if (hasValue(data.status)) {
            filters.push({status: data.status});
        }
        if (hasValue(data.has_pay)) {
            if (data.has_pay === false) {
                filters.push({$or: [{pay_price: {$eq: null}}, {pay_price: {$eq: 0}}]});
            } else if (data.has_pay === true) {
                filters.push({pay_price: {$ne: null}});
                filters.push({pay_price: {$gt: 0}});
            }
        }
        let unread_comment_report_ids = [];
        if (hasValue(data.comments)) {
            const comments_report = await SchemaModels.CommentSubmitReportModel.aggregate([
                {$match: {$and: [{reading_status: {$ne: null}}]}},
                {$addFields: {is_read: {$cond: [{$in: [toObjectID(data.user_id), "$reading_status.read_by_moderator"]}, true, false]}}},
                {$project: {_id: 0, report_id: 1, send_type: 1, is_read: 1}}
            ]).exec();
            if (data.comments === "read" || data.comments === "unread") {
                unread_comment_report_ids = isArray(comments_report) ?
                    comments_report.filter(comment => comment.is_read === false).map(d => toObjectID(d.report_id)) : [];
            }
            if (data.comments === "read") {
                filters.push({_id: {$nin: unread_comment_report_ids}});
            } else if (data.comments === "unread") {
                filters.push({_id: {$in: unread_comment_report_ids}});
            } else if (data.comments === "company") {
                const company_report_ids = comments_report.filter(comment => comment.send_type === COMMENT_SEND_TYPE.COMPANY)
                    .map(d => toObjectID(d.report_id));
                filters.push({_id: {$in: company_report_ids}});
            } else if (data.comments === "unread-company") {
                const unread_company_report_ids = comments_report.filter(comment => comment.send_type === COMMENT_SEND_TYPE.COMPANY && comment.is_read === false)
                    .map(d => toObjectID(d.report_id));
                filters.push({_id: {$in: unread_company_report_ids}});
            }
        }
        if (hasValue(data.report_activity)) {
            filters.push({is_close: data.report_activity});
        }
        if (hasValue(data.is_next_generation)) {
            filters.push({is_next_generation: data.is_next_generation});
        }
        const order = this.setSortBy(data.order);
        const reports = await this.collection.aggregate([
            ...(filters.length > 0 ? [{$match: {$and: filters}}] : []),
            ...(hasValue(data.from_date) ? [{
                $match: {
                    submit_date_time: {$gte: data.from_date}
                }
            }] : []),
            ...(hasValue(data.to_date) ? [{
                $match: {
                    submit_date_time: {$lte: moment(data.to_date).add(86399, 'seconds').toDate()}
                }
            }] : []),
            {
                $lookup: {
                    from: "hacker_users",
                    localField: "hacker_user_id",
                    foreignField: "_id",
                    as: "hacker_user_id"
                }
            },
            {$unwind: {path: "$hacker_user_id", preserveNullAndEmptyArrays: true}},
            {
                $lookup: {
                    from: "programs",
                    localField: "program_id",
                    foreignField: "_id",
                    as: "program_id"
                }
            },
            {$unwind: {path: "$program_id", preserveNullAndEmptyArrays: true}},
            {
                $lookup: {
                    from: "type_vulnerabilities",
                    localField: "vulnerability_type_id",
                    foreignField: "_id",
                    as: "vulnerability_type_id"
                }
            },
            {$unwind: {path: "$vulnerability_type_id", preserveNullAndEmptyArrays: true}},
            ...(data.hacker_username ?
                [{$match: {"hacker_user_id.username": {$regex: ".*" + data.hacker_username + ".*", $options: "i"}}}]
                : []),
            ...(data.program_id ? [{$match: {"program_id._id": toObjectID(data.program_id)}}] : []),
            ...(data.program_name ?
                [{$match: {"program_id.name": {$regex: ".*" + data.program_name + ".*", $options: "i"}}}]
                : []),
            ...(data.report_fields ?
                [{
                    $match: {
                        $or: [
                            {'vulnerability_type_id.title': {$regex: ".*" + data.report_fields + ".*", $options: "i"}},
                            {'proof_concept': {$regex: ".*" + data.report_fields + ".*", $options: "i"}},
                            {'proof_recommendation': {$regex: ".*" + data.report_fields + ".*", $options: "i"}},
                            {'proof_url': {$regex: ".*" + data.report_fields + ".*", $options: "i"}},
                            {'security_impact': {$regex: ".*" + data.report_fields + ".*", $options: "i"}}
                        ]
                    }
                }]
                : []),
            {$sort: {[order]: -1, submit_date_time: -1}},
            {
                $facet: {
                    total_count: [{$count: "count"}],
                    rows: [{$skip: (data.page - 1) * data.limit}, {$limit: data.limit},
                        {
                            $project: {
                                _id: 1,
                                reward: {$ifNull: ["$pay_price", 0]},
                                hacker_username: "$hacker_user_id.username",
                                hacker_avatar: "$hacker_user_id.avatar_file",
                                program_name: "$program_id.name",
                                target: {
                                    $arrayElemAt: [{
                                        $map: {
                                            input: {
                                                $filter: {
                                                    input: "$program_id.targets",
                                                    as: "target",
                                                    cond: {$eq: ["$$target._id", "$target_id"]}
                                                }
                                            },
                                            as: "el",
                                            in: "$$el.identifier"
                                        }
                                    }, 0]
                                },
                                vulnerability_type: "$vulnerability_type_id.title",
                                severity: 1,
                                submit_date_time: 1,
                                status: 1,
                                is_close: 1,
                                title: 1,
                                is_next_generation: 1
                            }
                        }]
                }
            }
        ]);
        if (reports[0].rows && reports[0].rows.length > 0) {
            const comments = await SchemaModels.CommentSubmitReportModel.aggregate([
                {$match: {report_id: {$in: reports[0].rows.map(d => d._id)}}},
                {
                    $facet: {
                        all_comment_count: [
                            {
                                $group: {
                                    _id: "$report_id",
                                    count: {$sum: 1},
                                    company_count: {$sum: {$cond: [{$eq: [COMMENT_SEND_TYPE.COMPANY, "$send_type"]}, 1, 0]}}
                                }
                            }
                        ],
                        unread_comment_count: [
                            {$match: {$and: [{reading_status: {$ne: null}}]}},
                            {$addFields: {is_read: {$cond: [{$in: [toObjectID(data.user_id), "$reading_status.read_by_moderator"]}, true, false]}}},
                            {
                                $group: {
                                    _id: "$report_id", count: {$sum: {$cond: [{$eq: [false, "$is_read"]}, 1, 0]}},
                                    company_count: {$sum: {$cond: [{$and: [{$eq: [false, "$is_read"]}, {$eq: [COMMENT_SEND_TYPE.COMPANY, "$send_type"]}]}, 1, 0]}}
                                }
                            }
                        ]
                    }
                }
            ]);
            reports[0].rows.forEach(item => {
                const all_comment_count = comments[0].all_comment_count.find(f => f._id.toString() === item._id.toString());
                const unread_comment_count = comments[0].unread_comment_count.find(f => f._id.toString() === item._id.toString());
                if (all_comment_count && all_comment_count.count) {
                    item.comment_count = all_comment_count.count;
                } else {
                    item.comment_count = 0;
                }
                if (all_comment_count && all_comment_count.company_count) {
                    item.company_comment_count = all_comment_count.company_count;
                } else {
                    item.company_comment_count = 0;
                }

                if (unread_comment_count && unread_comment_count.count) {
                    item.unread_comment_count = unread_comment_count.count;
                } else {
                    item.unread_comment_count = 0;
                }
                if (unread_comment_count && unread_comment_count.company_count) {
                    item.company_unread_comment_count = unread_comment_count.company_count;
                } else {
                    item.company_unread_comment_count = 0;
                }
            });
        }
        return setPaginationResponse(reports, data.limit, data.page);
    }

    async get(data) {
        const report = await this.collection.aggregate([
            {$match: {$and: [{_id: toObjectID(data.id)}]}},
            {$lookup: {from: 'hacker_users', localField: 'hacker_user_id', foreignField: '_id', as: 'hacker_user'}},
            {$unwind: {path: "$hacker_user", preserveNullAndEmptyArrays: true}},
            {$lookup: {from: 'programs', localField: 'program_id', foreignField: '_id', as: 'program'}},
            {$unwind: {path: "$program", preserveNullAndEmptyArrays: true}},
            {
                $lookup: {
                    from: "type_vulnerabilities",
                    localField: "vulnerability_type_id",
                    foreignField: "_id",
                    as: "vulnerability_type"
                }
            },
            {$unwind: {path: "$vulnerability_type", preserveNullAndEmptyArrays: true}},
            {
                $lookup: {
                    from: "comment_submit_reports",
                    let: {"report_id": "$_id"},
                    pipeline: [{
                        $match: {
                            $expr: {
                                $eq: ["$report_id", "$$report_id"]
                            }
                        }
                    }, {
                        $facet: {
                            all_comment_count: [
                                {$group: {_id: null, count: {$sum: 1}}}
                            ],
                            unread_comment_count: [
                                {$match: {$and: [{reading_status: {$ne: null}}]}},
                                {$addFields: {is_read: {$cond: [{$in: [toObjectID(data.user_id), "$reading_status.read_by_moderator"]}, true, false]}}},
                                {$group: {_id: null, count: {$sum: {$cond: [{$eq: [false, "$is_read"]}, 1, 0]}}}}
                            ]
                        }
                    }, {
                        $project: {
                            all_comment_count: {$arrayElemAt: ["$all_comment_count.count", 0]},
                            unread_comment_count: {$arrayElemAt: ["$unread_comment_count.count", 0]}
                        }
                    }],
                    as: "comments"
                }
            }, {$unwind: {path: "$comments", preserveNullAndEmptyArrays: true}},
            {
                $lookup: {
                    from: "payment_histories",
                    let: {"program_id": "$program_id"},
                    pipeline: [{
                        $match: {
                            $expr: {
                                $and: [{$eq: ["$program_id", "$$program_id"]}, {$eq: ["$is_positive", false]},
                                    {$eq: ["$type", PAYMENT_HISTORY_TYPE.PAY_PRICE]}]
                            }
                        }
                    }, {$group: {_id: null, amount: {$sum: "$amount"}}}, {
                        $project: {
                            amount: 1
                        }
                    }],
                    as: "reward_payment"
                }
            }, {$unwind: {path: "$reward_payment", preserveNullAndEmptyArrays: true}},
            {
                $project: {
                    _id: 1,
                    severity: 1,
                    reference_id: 1,
                    severity_score: 1,
                    comment_count: "$comments.all_comment_count",
                    unread_comment_count: "$comments.unread_comment_count",
                    title: 1,
                    reward_payment: "$reward_payment.amount",
                    proof_url: 1,
                    proof_concept: 1,
                    proof_recommendation: 1,
                    hacker_user: {_id: 1, username: 1, reputaion: 1, reputaion_log: 1, avatar_file: 1},
                    program: {
                        _id: 1,
                        name: 1,
                        targets: 1,
                        rewards: 1,
                        maximum_reward: 1,
                        policy: 1,
                        company_user_id: 1
                    },
                    is_next_generation: 1,
                    vulnerability_type: {_id: 1, title: 1},
                    security_impact: 1,
                    submit_date_time: 1,
                    status: 1,
                    is_close: 1,
                    pay_price: 1,
                    report_files: 1,
                    pay_date_time: 1,
                    target: {
                        $arrayElemAt: [{
                            $map: {
                                input: {
                                    $filter: {
                                        input: "$program.targets",
                                        as: "target",
                                        cond: {$eq: ["$$target._id", "$target_id"]}
                                    }
                                },
                                as: "el",
                                in: "$$el.identifier"
                            }
                        }, 0]
                    }
                }
            }
        ]);
        if (!(report && report[0])) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_FOUND, "report");
        }
        await checkUserAccess(data.user_level_access, data.user_id, report[0].program._id, false);
        const severity_history = await SchemaModels.HistoryModel.aggregate([
            {
                $match: {
                    $and: [
                        {activity: ACTIVITY_TEXT_LOG.CHANGE_SEVERITY},
                        {resource_type: RESOURCE_TYPE.REPORT},
                        {resource_id: toObjectID(data.id)},
                    ]
                }
            },
            {$sort: {register_date_time: 1}},
            {
                $project: {
                    _id: 1,
                    sender_type: 1,
                    sender_id: 1,
                    fields: 1,
                    register_date_time: 1
                }
            }
        ]);
        report[0].severity_history = [];
        if (isArray(severity_history) && severity_history.length > 0) {
            let company_users = [];
            const company_user_ids = [];
            let moderator_users = [];
            const moderator_user_ids = [];
            severity_history.forEach(history => {
                if (history.sender_type === SENDER_TYPE.COMPANY) {
                    company_user_ids.push(history.sender_id.toString());
                } else if (history.sender_type === SENDER_TYPE.MODERATOR || history.sender_type === SENDER_TYPE.ADMIN) {
                    moderator_user_ids.push(history.sender_id.toString());
                }
            });
            if (company_user_ids.length > 0) {
                company_users = await SchemaModels.CompanyUserModel.find({_id: {$in: company_user_ids}})
                    .select({display_name: 1, avatar_file: 1, fn: 1, ln: 1, user_level_access: 1, _id: 1}).lean();
            }
            if (moderator_user_ids.length > 0) {
                moderator_users = await SchemaModels.ModeratorUserModel.find({_id: {$in: moderator_user_ids}})
                    .select({alias: 1, avatar: 1, fn: 1, ln: 1, user_level_access: 1, _id: 1}).lean();
            }
            severity_history.forEach(history => {
                if (history.sender_type === SENDER_TYPE.COMPANY) {
                    history.sender_id = company_users.find(c => c._id.toString() === history.sender_id.toString());
                } else if (history.sender_type === SENDER_TYPE.MODERATOR || history.sender_type === SENDER_TYPE.ADMIN) {
                    history.sender_id = moderator_users.find(m => m._id.toString() === history.sender_id.toString());
                }
            });
            report[0].severity_history = severity_history;
        }
        return report[0];
    }

    async update(data) {
        const report = await this.collection.findOne({_id: data.id});
        if (!report) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_FOUND, "report");
        }
        if (report.status !== REPORT_STATUS.PENDING && report.status !== REPORT_STATUS.IN_PROGRESS_BY_ADMIN && data.user_level_access === toNumber(ADMIN_ROLES.MODERATOR)) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_PERMISSON);
        } else if (data.user_level_access === toNumber(ADMIN_ROLES.MODERATOR)) {
            await checkUserAccess(data.user_level_access, data.user_id, report.program_id._id, true, true);
        }
        const updated_data = {
            title: data.title,
            proof_url: data.proof_url,
            proof_concept: data.proof_concept,
            proof_recommendation: data.proof_recommendation,
            vulnerability_type_id: data.vulnerability_type,
            last_modify_date_time: getDateTime(),
            security_impact: data.security_impact
        };
        await this.collection.updateOne({_id: data.id}, {$set: updated_data});
        const new_report = await this.collection.aggregate([
            {$match: {_id: toObjectID(data.id)}},
            {
                $lookup: {
                    from: "type_vulnerabilities", localField: "vulnerability_type_id",
                    foreignField: "_id", as: "vulnerability_type"
                }
            },
            {
                $project: {
                    title: 1,
                    proof_url: 1,
                    proof_concept: 1,
                    proof_recommendation: 1,
                    vulnerability_type: 1,
                    security_impact: 1
                }
            }
        ]);
        // const fields = [];
        // for (const key in updated_data) {
        //     if ((report[key] === undefined && hasValue(updated_data[key])) || report[key].toString() !== updated_data[key].toString()) {
        //         fields.push({key, old_value: report[key], new_value: updated_data[key]});
        //     }
        // }
        // if (fields.length > 0){
        //     const history_model = {
        //         sender_type: data.user_level_access === toNumber(ADMIN_ROLES.MODERATOR) ?
        //             SENDER_TYPE.MODERATOR : SENDER_TYPE.ADMIN,
        //         activity: ACTIVITY_TEXT_LOG.UPDATE_REPORT,
        //         sender_id: data.user_id,
        //         resource_type: RESOURCE_TYPE.REPORT,
        //         type:HISTORY_TYPE.REPORT_CHANGE,
        //         resource_id: report._id,
        //         fields,
        //         register_date_time: getDateTime()
        //     };
        //     await SchemaModels.HistoryModel.create(history_model);
        // }
        return new_report[0];
    }

    async delete(id, user_id) {
        const report = await this.collection.findOne({_id: id});
        if (!report) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_RESOURCE_FOUND, "report");
        }
        if (report.is_close === 0) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.CUSTOM, "report is close");
        }
        await SchemaModels.NotificationModel.deleteMany({report_id: id});
        await this.collection.deleteOne({_id: id});
        // const history_model = {
        //     sender_type: SENDER_TYPE.ADMIN,
        //     activity: ACTIVITY_TEXT_LOG.DELETE_REPORT,
        //     sender_id: user_id,
        //     resource_type: RESOURCE_TYPE.REPORT,
        //     resource_id: report._id,
        //     info_fields:[{key: "report",value:report}],
        //     register_date_time: getDateTime()
        // };
        // await SchemaModels.HistoryModel.create(history_model);
    }

    async changeStatus(data) {
        const report = await this.getById(data.id);
        if (!report) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_RESOURCE_FOUND, "report");
        }
        await checkUserAccess(data.user_level_access, data.user_id, report.program_id._id, true);
        if (data.status === REPORT_STATUS.RESOLVED && report.status !== REPORT_STATUS.APPROVE) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.CUSTOM, "Report status not approved");
        }
        if (data.status === REPORT_STATUS.APPROVE || data.status === REPORT_STATUS.REJECT ||
            ((report.status === REPORT_STATUS.APPROVE && data.status !== REPORT_STATUS.RESOLVED)
                || report.status === REPORT_STATUS.REJECT || report.status === REPORT_STATUS.RESOLVED)) {
            const hacker = await SchemaModels.HackerUserModel.findOne({_id: toObjectID(report.hacker_user_id._id)})
                .select({_id: 1, reputaion_log: 1, reputaion: 1, tag: 1});
            if (!hacker) {
                throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_RESOURCE_FOUND, "hacker");
            }
            if (!hacker.tag.includes(HACKER_TAGS.INTERNAL_USER)) {
                const status_reputation_value = this.getStatusReputationValue(toNumber(data.status));
                const severity_reputation_value = this.getSeverityReputationValue(report.severity);
                const text = `report_${data.id}_${this.getStatusTitle(data.status)}_${this.getSeverityTitle(report.severity)}`;
                let hacker_data = {};
                let reputation_value = status_reputation_value;
                if (data.status === REPORT_STATUS.APPROVE) {
                    reputation_value += severity_reputation_value;
                }
                let reputaion_log = hacker.reputaion_log && isArray(hacker.reputaion_log) ? hacker.reputaion_log : [];
                const reports_log = reputaion_log.filter((item) => item.report_id.toString() === data.id.toString());
                const current_reports_log = reports_log.find(d => d.text.includes("Approve") || d.text.includes("Reject"));
                let reputaion = hasValue(hacker.reputaion) ? hacker.reputaion : 0;
                if (current_reports_log) {
                    if (!current_reports_log.value) current_reports_log.value = 0;
                    reputaion_log = reputaion_log.filter(d => d.text !== current_reports_log.text);
                    reputaion -= current_reports_log.value;
                }
                if (data.status === REPORT_STATUS.APPROVE || data.status === REPORT_STATUS.REJECT) {
                    reputaion_log.push({text, date_time: getDateTime(), value: reputation_value, report_id: data.id});
                }

                hacker_data["reputaion_log"] = reputaion_log;
                hacker_data["reputaion"] = reputaion + reputation_value;
                const updated_hacker = await SchemaModels.HackerUserModel.findOneAndUpdate({_id: report.hacker_user_id._id}, {
                    $set: hacker_data
                }, {new: true, projection: {sb_coin: 1, reputaion: 1, rank: 1}});
                let is_additive = reputation_value > 0;
                if (current_reports_log && current_reports_log.value) {
                    is_additive = (reputation_value + current_reports_log.value) > 0
                }
                await updateHackerRank(updated_hacker, is_additive);
            }
        }

        let socket_data = undefined;
        let socket_data_status = undefined;
        if (data.status === REPORT_STATUS.APPROVE) {
            socket_data_status = data.status;
            socket_data = this.setCountReport(report.severity, undefined);
        } else if (report.status === REPORT_STATUS.APPROVE) {
            socket_data_status = report.status;
            socket_data = this.setCountReport(undefined, report.severity);
        }
        if (socket_data) {
            await this.sendReportCountNotification(report.program_id.company_user_id, socket_data, report.program_id.is_next_generation, socket_data_status);
        }
        socket_data = undefined;
        socket_data_status = undefined;
        if (data.status === REPORT_STATUS.RESOLVED) {
            socket_data_status = data.status;
            socket_data = this.setCountReport(report.severity, undefined);
        } else if (report.status === REPORT_STATUS.RESOLVED) {
            socket_data_status = report.status;
            socket_data = this.setCountReport(undefined, report.severity);
        }
        if (socket_data) {
            await this.sendReportCountNotification(report.program_id.company_user_id, socket_data, report.program_id.is_next_generation, socket_data_status);
        }
        await SchemaModels.CommentSubmitReportModel.create({
            moderator_user_id: data.user_id,
            hacker_user_id: report.hacker_user_id._id,
            report_id: data.id,
            send_date_time: getDateTime(),
            reading_status: {
                read_by_moderator: [data.user_id],
                read_by_hacker: false,
                read_by_company: []
            },
            send_type: data.user_level_access === toNumber(ADMIN_ROLES.MODERATOR) ?
                COMMENT_SEND_TYPE.MODERATOR : COMMENT_SEND_TYPE.ADMIN,
            comment: "Change status to " + this.getStatusTitle(data.status)
        });
        const update_report_data = {
            last_modify_date_time: getDateTime(),
            status: data.status
        };
        if (report.status === REPORT_STATUS.IN_PROGRESS_BY_ADMIN) {
            update_report_data.status = REPORT_STATUS.PENDING;
            update_report_data.after_inprogress_date_time = getDateTime();
        }
        await this.collection.updateOne({_id: data.id}, {
            $set: update_report_data,
            $unset: {reference_id: 1}
        });
        // if (report.status !== data.status){
        //     const history_model = {
        //         sender_type: data.user_level_access === toNumber(ADMIN_ROLES.MODERATOR) ?
        //             SENDER_TYPE.MODERATOR : SENDER_TYPE.ADMIN,
        //         activity: ACTIVITY_TEXT_LOG.CHANGE_STATUS,
        //         sender_id: data.user_id,
        //         type: HISTORY_TYPE.REPORT_CHANGE,
        //         resource_type: RESOURCE_TYPE.REPORT,
        //         resource_id: report._id,
        //         fields:[{key:"status",old_value:report.status, new_value:data.status}],
        //         register_date_time: getDateTime()
        //     };
        //     await SchemaModels.HistoryModel.create(history_model);
        // }
        await this.sendNotificationBaseOnSetting("update_report", report.program_id._id, data.id, report.hacker_user_id._id,
            report.severity, report.hacker_user_id.report_notification_setting, REPORT_NOTIFICATION_TYPE.CHANGE_STATUS_REPORT, false, report.status);

        if (report.status === REPORT_STATUS.IN_PROGRESS_BY_ADMIN) {
            let companies = await SchemaModels.CompanyUserModel
                .find({
                    $or: [{_id: report.program_id.company_user_id},
                        {parent_user_id: report.program_id.company_user_id}]
                })
                .select({
                    _id: 1,
                    report_notification_setting: 1,
                    display_name: 1,
                    fn: 1,
                    parent_user_id: 1,
                    access_program_list: 1
                });

            companies = companies.filter(company => {
                return !company.parent_user_id ||
                    !company.access_program_list ||
                    company.access_program_list.length === 0 ||
                    company.access_program_list.map(p => p._id.toString())
                        .includes(report.program_id._id.toString())
            });
            const setting_key_name = "new_report";
            const setting_key_name_advance = `${setting_key_name}_advance`;
            let notification_company_users = [];
            const notification_companies = companies.filter(d => !!d.report_notification_setting &&
                !!d.report_notification_setting[setting_key_name_advance] &&
                d.report_notification_setting[setting_key_name_advance].includes(report.severity) &&
                (d.report_notification_setting[setting_key_name] === NORIFICATION_SETTING.WEB ||
                    d.report_notification_setting[setting_key_name] === NORIFICATION_SETTING.EMAIL_WEB));
            if (notification_companies) {
                notification_company_users = notification_companies.map(d => ({
                    _id: d._id,
                    display_name: d.display_name,
                    fn: d.fn
                }));
            }

            if (isArray(notification_company_users) && notification_company_users.length > 0) {
                const company_notifications = await this.createNotificationForCompany("Submit Report",
                    notification_company_users, null, FIELD_TYPE.OTHER, report.hacker_user_id._id, MESSAGE_TYPE.INFO,
                    report._id, ACTION_TYPE.CREATE, RESOURCE_TYPE.REPORT, SENDER_TYPE.COMPANY);
                this.sendNotificationForCompany("notification", company_notifications, companyIO, "company_user_id");
            }
        }
        if (report.hacker_user_id.report_notification_setting &&
            isArray(report.hacker_user_id.report_notification_setting.update_report_advance) &&
            report.hacker_user_id.report_notification_setting.update_report_advance.includes(report.severity)) {
            if (report.hacker_user_id.report_notification_setting.update_report === NORIFICATION_SETTING.WEB ||
                report.hacker_user_id.report_notification_setting.update_report === NORIFICATION_SETTING.EMAIL_WEB) {
                const notification = await this.createNotification("Report Status",
                    `${report.hacker_user_id.fn}, Admin has changed your report status to ${this.getStatusTitle(data.status)}`,
                    FIELD_TYPE.STATUS, report.hacker_user_id._id, MESSAGE_TYPE.INFO,
                    data.user_level_access === toNumber(ADMIN_ROLES.MODERATOR) ? SENDER_TYPE.MODERATOR
                        : SENDER_TYPE.ADMIN, data.user_id, report._id);

                this.sendNotification("notification", report.hacker_user_id._id, notification.title,
                    notification.text, notification.register_date_time, notification.message_type,
                    notification._id, notification.resource_type, notification.report_id);
            }
        }
    }

    async sendNotificationBaseOnSetting(setting_key_name, program_id, report_id, hacker_user_id, severity, hacker_report_notifications_setting, type, is_internal, status) {
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
                            $project: {_id: 1, fn: 1, display_name: 1, report_notification_setting: 1}
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
        if (program && program[0]) {
            const companies = program[0].company_users.filter(d => !!d.report_notification_setting &&
                !!d.report_notification_setting[setting_key_name_advance] &&
                d.report_notification_setting[setting_key_name_advance].includes(severity) &&
                (d.report_notification_setting[setting_key_name] === NORIFICATION_SETTING.EMAIL ||
                    d.report_notification_setting[setting_key_name] === NORIFICATION_SETTING.EMAIL_WEB));
            if (companies) {
                companyUserIds = companies.map(d => d._id);
            }

            const moderators = program[0].moderator_users;
            if (moderators && isArray(moderators)) {
                moderatorUserIds = moderators.map(d => d.moderator_user_id);
            }
        }
        let data = [];
        if ((!is_internal || type !== REPORT_NOTIFICATION_TYPE.SUBMIT_COMMENT) && hacker_report_notifications_setting && isArray(hacker_report_notifications_setting[setting_key_name_advance]) &&
            hacker_report_notifications_setting[setting_key_name_advance].includes(severity) &&
            (hacker_report_notifications_setting[setting_key_name] === NORIFICATION_SETTING.EMAIL_WEB ||
                hacker_report_notifications_setting[setting_key_name] === NORIFICATION_SETTING.EMAIL)) {
            data.push({
                "program_id": program_id,
                "hacker_user_id": hacker_user_id,
                "report_id": report_id,
                "type": type,
                "register_date_time": getDateTime()
            });
        }
        let company_type = type;
        if (type === REPORT_NOTIFICATION_TYPE.CHANGE_STATUS_REPORT &&
            status === REPORT_STATUS.IN_PROGRESS_BY_ADMIN) {
            company_type = REPORT_NOTIFICATION_TYPE.SUBMIT_REPORT;
        }
        if (status !== REPORT_STATUS.IN_PROGRESS_BY_ADMIN ||
            company_type === REPORT_NOTIFICATION_TYPE.SUBMIT_REPORT) {
            companyUserIds.forEach(id => {
                data.push({
                    "program_id": program_id,
                    "report_id": report_id,
                    "company_user_id": id,
                    "type": company_type,
                    "register_date_time": getDateTime(),
                })
            });
        }
        if (setting_key_name !== "comments_by_admin") {
            moderatorUserIds.forEach(id => {
                data.push({
                    "program_id": program_id,
                    "report_id": report_id,
                    "moderator_user_id": id,
                    "type": type,
                    "register_date_time": getDateTime(),
                })
            });
        }
        await SchemaModels.ReportNotificationModel.insertMany(
            data
        );
    }

    setCountReport(add, subtract) {
        const count_report = {N: 0, L: 0, M: 0, H: 0, C: 0};
        if (add >= 0) {
            switch (add) {
                case 0:
                    count_report.N += 1;
                    break;
                case 1:
                    count_report.L += 1;
                    break;
                case 2:
                    count_report.M += 1;
                    break;
                case 3:
                    count_report.H += 1;
                    break;
                case 4:
                    count_report.C += 1;
                    break;

            }
        }
        if (subtract >= 0) {
            switch (subtract) {
                case 0:
                    count_report.N -= 1;
                    break;
                case 1:
                    count_report.L -= 1;
                    break;
                case 2:
                    count_report.M -= 1;
                    break;
                case 3:
                    count_report.H -= 1;
                    break;
                case 4:
                    count_report.C -= 1;
                    break;
            }
        }
        return count_report;
    }

    async changeSeverity(data) {
        const report = await this.getById(data.id);
        if (!report) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_RESOURCE_FOUND, "report");
        }
        await checkUserAccess(data.user_level_access, data.user_id, report.program_id._id, true);
        try {
            data.score = JSON.parse(data.score);
        } catch {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_VALID, "score");
        }
        if (!hasValue(data.score.A) || !hasValue(data.score.AC) ||
            !hasValue(data.score.AV) || !hasValue(data.score.C) ||
            !hasValue(data.score.I) || !hasValue(data.score.PR) ||
            !hasValue(data.score.S) || !hasValue(data.score.UI)) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_VALID, "score");
        }
        for (let item in data.score) {
            if (data.score.hasOwnProperty(item)) {
                data.score[item] = safeString(data.score[item])
            }
        }
        const severity_score = {
            A: data.score.A,
            AC: data.score.AC,
            AV: data.score.AV,
            C: data.score.C,
            I: data.score.I,
            PR: data.score.PR,
            S: data.score.S,
            UI: data.score.UI
        };
        await this.collection.updateOne({_id: data.id}, {
            $set: {
                last_modify_date_time: getDateTime(),
                severity: data.severity,
                severity_score
            }
        });
        if (report.status === REPORT_STATUS.APPROVE || report.status === REPORT_STATUS.RESOLVED) {
            const socket_data = this.setCountReport(data.severity, report.severity);
            this.sendReportCountNotification(report.program_id.company_user_id, socket_data, report.program_id.is_next_generation, report.status);
        }
        await SchemaModels.CommentSubmitReportModel.create({
            moderator_user_id: data.user_id,
            hacker_user_id: report.hacker_user_id._id,
            report_id: data.id,
            reading_status: {
                read_by_moderator: [data.user_id],
                read_by_hacker: false,
                read_by_company: []
            },
            send_date_time: getDateTime(),
            send_type: data.user_level_access === toNumber(ADMIN_ROLES.MODERATOR) ?
                COMMENT_SEND_TYPE.MODERATOR : COMMENT_SEND_TYPE.ADMIN,
            comment: "Change severity to " + this.getSeverityTitle(data.severity)
        });
        if (report.severity !== data.severity) {
            const fields = [
                {key: "severity", old_value: report.severity, new_value: data.severity},
                {key: "severity_score", old_value: report.severity_score, new_value: severity_score}
            ];
            const history_model = {
                sender_type: data.user_level_access === toNumber(ADMIN_ROLES.MODERATOR) ?
                    SENDER_TYPE.MODERATOR : SENDER_TYPE.ADMIN,
                activity: ACTIVITY_TEXT_LOG.CHANGE_SEVERITY,
                sender_id: data.user_id,
                type: HISTORY_TYPE.REPORT_CHANGE,
                resource_type: RESOURCE_TYPE.REPORT,
                resource_id: report._id,
                fields,
                register_date_time: getDateTime()
            };
            await SchemaModels.HistoryModel.create(history_model);
        }

        await this.sendNotificationBaseOnSetting("update_report", report.program_id._id, data.id, report.hacker_user_id._id,
            data.severity, report.hacker_user_id.report_notification_setting, REPORT_NOTIFICATION_TYPE.SUBMIT_COMMENT, false, report.status);

        if (report.hacker_user_id.report_notification_setting &&
            isArray(report.hacker_user_id.report_notification_setting.update_report_advance) &&
            report.hacker_user_id.report_notification_setting.update_report_advance.includes(data.severity)) {
            if (report.hacker_user_id.report_notification_setting.update_report === NORIFICATION_SETTING.WEB ||
                report.hacker_user_id.report_notification_setting.update_report === NORIFICATION_SETTING.EMAIL_WEB) {
                const notification = await this.createNotification("Report Severity",
                    `${report.hacker_user_id.fn}, The severity of your report has changed to ${this.getSeverityTitle(data.severity)}`,
                    FIELD_TYPE.SEVERITY, report.hacker_user_id._id, MESSAGE_TYPE.INFO,
                    data.user_level_access === toNumber(ADMIN_ROLES.MODERATOR) ? SENDER_TYPE.MODERATOR
                        : SENDER_TYPE.ADMIN, data.user_id, report._id);

                this.sendNotification("notification", report.hacker_user_id._id, notification.title,
                    notification.text, notification.register_date_time, notification.message_type,
                    notification._id, notification.resource_type, notification.report_id);
            }
        }

    }

    async changeActivity(data) {
        const report = await this.getById(data.id);
        if (!report) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_RESOURCE_FOUND, "report");
        }
        await checkUserAccess(data.user_level_access, data.user_id, report.program_id._id, true);
        await this.collection.updateOne({_id: data.id}, {
            $set: {
                last_modify_date_time: getDateTime(),
                is_close: data.is_close
            }
        });
        let msg = `Change report Activity to ${this.getActivityTitle(data.is_close)}`;
        await SchemaModels.CommentSubmitReportModel.create({
            moderator_user_id: data.user_id,
            hacker_user_id: report.hacker_user_id._id,
            report_id: data.id,
            reading_status: {
                read_by_moderator: [data.user_id],
                read_by_hacker: false,
                read_by_company: []
            },
            send_date_time: getDateTime(),
            comment: msg,
            send_type: data.user_level_access === toNumber(ADMIN_ROLES.MODERATOR) ?
                COMMENT_SEND_TYPE.MODERATOR : COMMENT_SEND_TYPE.ADMIN
        });
        // if (report.is_close !== data.is_close){
        //     const history_model = {
        //         sender_type: data.user_level_access === toNumber(ADMIN_ROLES.MODERATOR) ?
        //             SENDER_TYPE.MODERATOR : SENDER_TYPE.ADMIN,
        //         activity:ACTIVITY_TEXT_LOG.CHANGE_ACTIVITY,
        //         sender_id:data.user_id,
        //         type:HISTORY_TYPE.REPORT_CHANGE,
        //         resource_type:RESOURCE_TYPE.REPORT,
        //         resource_id:report._id,
        //         fields:[{key:"is_close",old_value:report.is_close,new_value:data.is_close}],
        //         register_date_time:getDateTime()
        //     };
        //     await SchemaModels.HistoryModel.create(history_model);
        // }
        await this.sendNotificationBaseOnSetting("update_report", report.program_id._id, data.id, report.hacker_user_id._id,
            report.severity, report.hacker_user_id.report_notification_setting, REPORT_NOTIFICATION_TYPE.SUBMIT_COMMENT, false, report.status);

        if (report.hacker_user_id.report_notification_setting &&
            isArray(report.hacker_user_id.report_notification_setting.update_report_advance) &&
            report.hacker_user_id.report_notification_setting.update_report_advance.includes(report.severity)) {
            if (report.hacker_user_id.report_notification_setting.update_report === NORIFICATION_SETTING.WEB ||
                report.hacker_user_id.report_notification_setting.update_report === NORIFICATION_SETTING.EMAIL_WEB) {
                const notification = await this.createNotification("Report Status",
                    `${report.hacker_user_id.fn}, Admin has changed your report status to ${data.is_close === REPORT_ACTIVITY.OPEN ? "active" : "close"}`,
                    FIELD_TYPE.ACTIVITY, report.hacker_user_id._id, data.is_close === REPORT_ACTIVITY.OPEN ?
                        MESSAGE_TYPE.SUCCESS : MESSAGE_TYPE.DANGER,
                    data.user_level_access === toNumber(ADMIN_ROLES.MODERATOR) ? SENDER_TYPE.MODERATOR
                        : SENDER_TYPE.ADMIN, data.user_id, report._id);

                this.sendNotification("notification", report.hacker_user_id._id, notification.title,
                    notification.text, notification.register_date_time, notification.message_type,
                    notification._id, notification.resource_type, notification.report_id);
            }
        }
    }

    async setReferenceId(data) {
        const report = await this.getById(data.id);
        if (!report) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_RESOURCE_FOUND, "report");
        }
        if (report.status !== REPORT_STATUS.DUPLICATE) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.CUSTOM, " report status must be duplicate");
        }
        await checkUserAccess(data.user_level_access, data.user_id, report.program_id._id, true);
        if (data.reference_id) {
            const reference_report = await this.collection.findOne({_id: data.reference_id}).select({status: 1});
            if (!reference_report) {
                throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_RESOURCE_FOUND, "reference report");
            }
            if (reference_report.status !== REPORT_STATUS.APPROVE && reference_report.status !== REPORT_STATUS.RESOLVED) {
                throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.CUSTOM, "Reference report status must be approve or resolve.");
            }
            await this.collection.updateOne({_id: data.id}, {$set: {reference_id: data.reference_id}});
        } else {
            await this.collection.updateOne({_id: data.id}, {$unset: {reference_id: 1}});
        }
    }

    async payPrice(data) {
        if (data.user_level_access === toNumber(ADMIN_ROLES.MODERATOR)) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_PERMISSON);
        }
        const report = await this.getById(data.id);
        if (!report) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_RESOURCE_FOUND, "report");
        }
        const minimum_reward = report.program_id.maximum_reward * (15 / 100);
        const total_pay_price = await this.getTotalPayPrice(report.program_id._id);
        const current_balance = report.program_id.maximum_reward - total_pay_price;
        if (data.pay_price >= current_balance) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.CUSTOM, "pay_price is more than remain money.");
        }
        const new_balance = report.program_id.maximum_reward - (total_pay_price + data.pay_price);
        let rewards_max_critical = 0;
        if (report.program_id.rewards && report.program_id.rewards.length > 0) {
            rewards_max_critical = Math.max(...report.program_id.rewards.map(reward => reward.critical_price));
        }
        const should_close = new_balance <= minimum_reward || new_balance <= rewards_max_critical;
        let report_data;
        if (report.pay_price && report.pay_price > 0) {
            report_data = {
                $inc: {pay_price: data.pay_price},
                $set: {
                    last_modify_date_time: getDateTime(),
                    pay_date_time: getDateTime()
                }
            }
        } else {
            report_data = {
                $set: {
                    last_modify_date_time: getDateTime(),
                    pay_date_time: getDateTime(), pay_price: data.pay_price
                }
            }
        }
        const new_report = await this.collection.findOneAndUpdate({"_id": data.id}, report_data, {
            new: true, projection: {pay_price: 1}
        });
        const payment_model = {
            hacker_user_id: report.hacker_user_id._id,
            report_id: report._id,
            program_id: report.program_id._id,
            company_user_id: report.program_id.company_user_id,
            amount: new_report.pay_price,
            is_positive: false,
            type: 1,
            register_date_time: getDateTime()
        };
        const payment_history = await SchemaModels.PaymentHistoryModel.findOneAndUpdate({report_id: report._id}, {$set: payment_model}, {
            upsert: true,
            new: true
        });
        let msg = `Your reward confirmed with ${new_report.pay_price} € bounty`;
        const comment_model = {
            moderator_user_id: data.user_id,
            hacker_user_id: report.hacker_user_id._id,
            report_id: data.id,
            reading_status: {
                read_by_moderator: [data.user_id],
                read_by_hacker: false,
                read_by_company: []
            },
            payment_history_id: payment_history._id,
            send_date_time: getDateTime(),
            comment: msg,
            send_type: COMMENT_SEND_TYPE.ADMIN
        };
        await SchemaModels.CommentSubmitReportModel.updateOne({
            report_id: report._id,
            payment_history_id: payment_history._id
        }, {$set: comment_model}, {upsert: true});

        if ((should_close && report.program_id.status === PROGRAM_STATUS.APPROVED) || (should_close === false && report.program_id.status === PROGRAM_STATUS.CLOSE)) {
            const new_status = should_close ? PROGRAM_STATUS.CLOSE : PROGRAM_STATUS.APPROVED;
            await SchemaModels.ProgramModel.updateOne({_id: report.program_id._id}, {$set: {status: new_status}});
        }
        // const history_model = {
        //     sender_type: SENDER_TYPE.ADMIN,
        //     activity: ACTIVITY_TEXT_LOG.PAY_PRICE,
        //     sender_id: data.user_id,
        //     resource_type: RESOURCE_TYPE.REPORT,
        //     type: HISTORY_TYPE.REPORT_CHANGE,
        //     resource_id: report._id,
        //     info_fields:[{key:"pay_price",value:data.pay_price}],
        //     fields:[{key:"pay_price",old_value:report.pay_price, new_value:new_report.pay_price}],
        //     register_date_time: getDateTime()
        // };
        // await SchemaModels.HistoryModel.create(history_model);
        await this.sendNotificationBaseOnSetting("reward_activity", report.program_id._id, report._id, report.hacker_user_id._id,
            report.severity, report.hacker_user_id.report_notification_setting, REPORT_NOTIFICATION_TYPE.ADD_PRICE);
        if (report.hacker_user_id.report_notification_setting &&
            isArray(report.hacker_user_id.report_notification_setting.reward_activity_advance) &&
            report.hacker_user_id.report_notification_setting.reward_activity_advance.includes(report.severity)) {
            if (report.hacker_user_id.report_notification_setting.reward_activity === NORIFICATION_SETTING.WEB ||
                report.hacker_user_id.report_notification_setting.reward_activity === NORIFICATION_SETTING.EMAIL_WEB) {
                const notification = await this.createNotification("Report Reward",
                    `${report.hacker_user_id.fn}, Admin has confirmed ${data.pay_price} € as reward.`,
                    FIELD_TYPE.REWARD, report.hacker_user_id._id, MESSAGE_TYPE.SUCCESS,
                    SENDER_TYPE.ADMIN, data.user_id, report._id);

                this.sendNotification("notification", report.hacker_user_id._id, notification.title,
                    notification.text, notification.register_date_time, notification.message_type,
                    notification._id, notification.resource_type, notification.report_id);
            }
        }
    }

    async getComments(data) {
        const report = await this.getById(data.id);
        if (!report) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_RESOURCE_FOUND, "report");
        }
        await checkUserAccess(data.user_level_access, data.user_id, report.program_id._id, false);
        const comments = await SchemaModels.CommentSubmitReportModel.aggregate([
            {$match: {report_id: toObjectID(data.id)}},
            {
                $lookup: {
                    from: "submit_reports",
                    localField: "report_id",
                    foreignField: "_id",
                    as: "report_id"
                }
            },
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
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "moderator_users",
                    localField: "moderator_user_id",
                    foreignField: "_id",
                    as: "moderator_user_id",
                }
            },
            {
                $unwind: {
                    path: "$moderator_user_id",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "hacker_users",
                    localField: "hacker_user_id",
                    foreignField: "_id",
                    as: "hacker_user_id",
                }
            },
            {
                $unwind: {
                    path: "$hacker_user_id",
                    preserveNullAndEmptyArrays: true
                }
            },
            {$sort: {"send_date_time": -1}},
            {
                $facet: {
                    total_count: [
                        {
                            $count: "count"
                        }
                    ],
                    rows: [
                        {
                            $skip: (data.page - 1) * data.limit
                        },
                        {$limit: data.limit},
                        {
                            $project: {
                                comment: 1,
                                type: 1,
                                send_type: 1,
                                send_date_time: 1,
                                file1: 1,
                                file2: 1,
                                file3: 1,
                                is_internal: 1,
                                file1_original_name: 1,
                                file2_original_name: 1,
                                file3_original_name: 1,
                                submit_date_time: 1,
                                company_user_id: {
                                    "display_name": 1,
                                    "fn": 1,
                                    "ln": 1,
                                    "avatar_file": 1,
                                    "user_level_access": 1,
                                },
                                hacker_user_id: {"username": 1, "avatar_file": 1, "tag": 1},
                                moderator_user_id: {"alias": 1, "user_level_access": 1, "avatar": 1, "fn": 1, "ln": 1}
                            }
                        }
                    ]
                }
            }
        ]);
        if (comments && comments[0] && comments[0].rows && comments[0].rows.length > 0) {
            await SchemaModels.CommentSubmitReportModel.updateMany({
                $and: [{report_id: report._id}, {reading_status: {$exists: true}},
                    {_id: {$in: comments[0].rows.map(d => d._id.toString())}}]
            }, {$addToSet: {"reading_status.read_by_moderator": data.user_id}});
        }
        return setPaginationResponse(comments, data.limit, data.page);
    }

    async deleteComment(data) {
        const report = await this.getById(data.id);
        if (!report) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_RESOURCE_FOUND, "report");
        }
        await checkUserAccess(data.user_level_access, data.user_id, report.program_id._id, true);
        const deleted_comment = await SchemaModels.CommentSubmitReportModel.findOneAndDelete(
            {report_id: data.id, _id: data.comment_id}
        );
        if (!deleted_comment) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_RESOURCE_FOUND, "comment");
        }
        if (isObjectID(deleted_comment.payment_history_id)) {
            await this.collection.updateOne({_id: data.id}, {
                $set: {
                    pay_price: null,
                    pay_date_time: null,
                    last_modify_date_time: getDateTime()
                }
            });
            await SchemaModels.PaymentHistoryModel.deleteOne({_id: deleted_comment.payment_history_id});
        } else {
            await this.collection.updateOne({_id: data.id}, {$set: {last_modify_date_time: getDateTime()}});
        }
        // const history_model = {
        //     sender_type: data.user_level_access === toNumber(ADMIN_ROLES.MODERATOR) ?
        //         SENDER_TYPE.MODERATOR : SENDER_TYPE.ADMIN,
        //     activity: ACTIVITY_TEXT_LOG.DELETE_COMMENT,
        //     sender_id: data.user_id,
        //     resource_type: RESOURCE_TYPE.COMMENT,
        //     resource_id: deleted_comment._id,
        //     info_fields:[{key:"comment",value:deleted_comment}],
        //     register_date_time: getDateTime()
        // };
        // await SchemaModels.HistoryModel.create(history_model);
    }

    async prepareUpdate() {
        const response = {};
        response.vulnerabilities = await SchemaModels.TypeVulnerabilityModel.find({status: true}).select({
            _id: 1,
            title: 1
        });
        return response;
    }

    async createNotification(title, text, field_type, hacker_user_id, message_type,
                             sender_type, moderator_user_id, report_id, resource_type) {
        const notification = {
            title,
            text,
            status: NOTIFICATION_STATUS.SEND,
            register_date_time: getDateTime(),
            sender_type,
            field_type,
            resource_type: resource_type || RESOURCE_TYPE.REPORT,
            action_type: ACTION_TYPE.UPDATE,
            message_type,
            moderator_user_id,
            report_id,
            hacker_user_id
        };
        return SchemaModels.NotificationModel.create(notification);
    }

    sendNotification(emit_name, id, title, text, date, message_type, notification_id, resource_type, report_id) {
        if (hackerIO && hackerIO["sockets"] && hackerIO["sockets"].size > 0 && hackerIO["to"]) {
            const sockets_info = convertSetOrMapToArray(hackerIO["sockets"]);
            sockets_info.length > 0 && sockets_info.forEach(s => {
                if (s.data && s.data._id && s.data._id.toString() === id.toString()) {
                    hackerIO["to"](s.id.toString()).emit(emit_name, {
                        title,
                        text,
                        date,
                        resource_type,
                        report_id,
                        message_type,
                        id: notification_id
                    });
                }
            });
        }
    }

    async createNotificationForCompany(title, users, value, field_type, hacker_user_id, message_type, report_id, action_type, resource_type, reciever_type) {
        const notifications = [];
        users.forEach(c => {
            let text = "";
            if (reciever_type === SENDER_TYPE.COMPANY) {
                if (resource_type === RESOURCE_TYPE.COMMENT) {
                    text = `${c.display_name || c.fn}, You have received a comment regarding your program`;
                } else if (resource_type === RESOURCE_TYPE.REPORT) {
                    text = `${c.display_name || c.fn}, You have received a report regarding your program`;
                }
            }
            const notification = {
                title,
                text,
                status: NOTIFICATION_STATUS.SEND,
                register_date_time: getDateTime(),
                sender_type: SENDER_TYPE.ADMIN,
                field_type,
                resource_type,
                action_type,
                message_type,
                report_id
            };
            if (reciever_type === SENDER_TYPE.COMPANY) {
                notification.company_user_id = c._id
            }
            notifications.push(notification);
        });
        return SchemaModels.NotificationModel.insertMany(notifications);
    }

    sendNotificationForCompany(emit_name, notifications, socketIIO, id_name) {
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

    async sendReportCountNotification(company_user_id, socket_data, program_type, status) {
        if (companyIO && companyIO["sockets"] && companyIO["sockets"].size > 0 && companyIO["to"]) {
            const company_members = await SchemaModels.CompanyUserModel.find({parent_user_id: company_user_id}, {_id: 1}).lean();
            let company_ids = [];
            if (company_members && company_members.length > 0) {
                company_ids = company_members.map(d => d._id.toString());
            }
            company_ids.push(company_user_id.toString());
            const sockets_info = convertSetOrMapToArray(companyIO["sockets"]);
            sockets_info.length > 0 && sockets_info.forEach(s => {
                if (s.data && s.data._id && company_ids.includes(s.data._id.toString())) {
                    companyIO["to"](s.id.toString()).emit("countReport", {socket_data, program_type, status});
                }
            });
        }
    }

    async checkForSubmitComment(report_id) {
        const result = await this.collection.findOne({"_id": report_id}, {
            _id: 0,
            is_close: 1,
            program_id: 1
        }).populate({
            path: 'program_id',
            select: {is_verify: 1}
        });
        if (!result) {
            return 2;
        }
        if (result.is_close === 0) {
            return 3;
        }
        if (!result.program_id) {
            return 4;
        }
        if (!result.program_id.is_verify) {
            return 5;
        }
        return 0;
    }

    async addCmdReport(user_id, user_level_access, report_id
        , file1, file1_original_name, file2, file2_original_name
        , file3, file3_original_name
        , comment, is_internal) {
        const report = await this.getById(report_id);
        if (!report) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_RESOURCE_FOUND, "report");
        }
        await checkUserAccess(user_level_access, user_id, report.program_id._id, true);
        await this.collection.updateOne({_id: report_id}, {$set: {last_modify_date_time: getDateTime()}});
        const new_comment = await SchemaModels.CommentSubmitReportModel.create({
            "moderator_user_id": user_id,
            "hacker_user_id": report.hacker_user_id._id,
            "report_id": report_id,
            "reading_status": {
                read_by_moderator: [user_id],
                read_by_hacker: false,
                read_by_company: []
            },
            is_internal,
            "file1": file1,
            "file1_original_name": file1_original_name,
            "file2": file2,
            "file2_original_name": file2_original_name,
            "file3": file3,
            "file3_original_name": file3_original_name,
            "send_date_time": getDateTime(),
            "comment": comment,
            "send_type": user_level_access === toNumber(ADMIN_ROLES.MODERATOR) ?
                COMMENT_SEND_TYPE.MODERATOR : COMMENT_SEND_TYPE.ADMIN,
            "type": COMMENT_SYSTEM_TYPE.NONE
        });
        await this.sendNotificationBaseOnSetting("comments_by_admin", report.program_id._id, report._id, report.hacker_user_id._id,
            report.severity, report.hacker_user_id.report_notification_setting, REPORT_NOTIFICATION_TYPE.SUBMIT_COMMENT, is_internal, report.status);

        if (!is_internal && report.hacker_user_id.report_notification_setting &&
            isArray(report.hacker_user_id.report_notification_setting.comments_by_admin_advance) &&
            report.hacker_user_id.report_notification_setting.comments_by_admin_advance.includes(report.severity)) {
            if (report.hacker_user_id.report_notification_setting.comments_by_admin === NORIFICATION_SETTING.WEB ||
                report.hacker_user_id.report_notification_setting.comments_by_admin === NORIFICATION_SETTING.EMAIL_WEB) {
                const notification = await this.createNotification("New Comment",
                    `${report.hacker_user_id.fn}, Admin has added a comment on one of your reports`,
                    FIELD_TYPE.COMMENT, report.hacker_user_id._id, MESSAGE_TYPE.INFO,
                    user_level_access === toNumber(ADMIN_ROLES.MODERATOR) ? SENDER_TYPE.MODERATOR
                        : SENDER_TYPE.ADMIN, user_id, report_id, RESOURCE_TYPE.COMMENT);

                this.sendNotification("notification", report.hacker_user_id._id, notification.title,
                    notification.text, notification.register_date_time, notification.message_type,
                    notification._id, notification.resource_type, notification.report_id);
            }
        }
        // const history_model = {
        //     sender_type: user_level_access === toNumber(ADMIN_ROLES.MODERATOR) ?
        //         SENDER_TYPE.MODERATOR : SENDER_TYPE.ADMIN,
        //     activity:ACTIVITY_TEXT_LOG.SUBMIT_COMMENT,
        //     sender_id:user_id,
        //     resource_type:RESOURCE_TYPE.COMMENT,
        //     resource_id:new_comment._id,
        //     register_date_time:getDateTime()
        // };
        // await SchemaModels.HistoryModel.create(history_model);
        return {
            moderator_user_id: new_comment.moderator_user_id,
            hacker_user_id: new_comment.hacker_user_id,
            report_id: new_comment.report_id,
            file1: new_comment.file1,
            is_internal: new_comment.is_internal,
            file1_original_name: new_comment.file1_original_name,
            file2: new_comment.file2,
            file2_original_name: new_comment.file2_original_name,
            file3: new_comment.file3,
            file3_original_name: new_comment.file3_original_name,
            send_date_time: new_comment.send_date_time,
            comment: new_comment.comment,
            send_type: new_comment.send_type,
            type: new_comment.type,
            _id: new_comment._id
        };
    };

    async getTotalPayPrice(program_id) {
        let rows = await SchemaModels.SubmitReportModel.aggregate([
            {$match: {$and: [{program_id: program_id.toString()}, {status: {$gt: 0}}, {pay_price: {$ne: null}}]}},
            {$group: {_id: 0, total: {$sum: "$pay_price"}}}
        ]);
        return rows.length > 0 ? rows[0].total : 0;
    }

    async getById(id) {
        return await this.collection.findOne({_id: id})
            .populate({
                path: "hacker_user_id",
                select: {_id: 1, report_notification_setting: 1, fn: 1}
            }).populate({
                path: "program_id",
                select: {_id: 1, maximum_reward: 1, rewards: 1, company_user_id: 1, status: 1, is_next_generation: 1}
            }).select({
                _id: 1, program_id: 1, pay_price: 1, hacker_user_id: 1, target_id: 1,
                severity: 1, severity_score: 1, status: 1, is_close: 1
            });
    }

    getSeverityReputationValue(severity) {
        switch (severity) {
            case REPORT_SEVERITY.NONE:
                return 2;
            case REPORT_SEVERITY.LOW:
                return 10;
            case REPORT_SEVERITY.MEDIUM:
                return 20;
            case REPORT_SEVERITY.HIGH:
                return 30;
            case REPORT_SEVERITY.CRITICAL:
                return 40;
        }
    }

    getStatusReputationValue(status) {
        switch (status) {
            case REPORT_STATUS.APPROVE:
                return 8;
            case REPORT_STATUS.REJECT:
                return -8;
            default:
                return 0;
        }
    }

    getStatusTitle(status) {
        switch (status) {
            case REPORT_STATUS.PENDING:
                return 'Pending';
            case REPORT_STATUS.MODIFICATION:
                return 'Modification';
            case REPORT_STATUS.TRIAGE:
                return 'Triage';
            case REPORT_STATUS.APPROVE:
                return 'Approve';
            case REPORT_STATUS.REJECT:
                return 'Reject';
            case REPORT_STATUS.DUPLICATE:
                return 'Duplicate';
            case REPORT_STATUS.RESOLVED:
                return 'Resolved';
            case REPORT_STATUS.NOT_APPLICABLE:
                return 'Not Applicable';
            default:
                return '';
        }
    }

    getSeverityTitle(severity) {
        switch (severity) {
            case REPORT_SEVERITY.NONE:
                return 'None';
            case REPORT_SEVERITY.LOW:
                return 'Low';
            case REPORT_SEVERITY.MEDIUM:
                return 'Medium';
            case REPORT_SEVERITY.HIGH:
                return 'High';
            case REPORT_SEVERITY.CRITICAL:
                return 'Critical';
            default:
                return '';
        }
    }

    getActivityTitle(activity) {
        switch (activity) {
            case REPORT_ACTIVITY.OPEN:
                return 'OPEN';
            case REPORT_ACTIVITY.CLOSE:
                return 'CLOSE';
            default:
                return '';
        }
    }

    setSortBy(order) {
        switch (order) {
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

}

module.exports = new SubmitReportModel();