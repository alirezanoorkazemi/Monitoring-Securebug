const hackerIO = require("../../../io/hacker");
const adminIO = require("../../../io/admin");
const companyIO = require("../../../io/company");
const moment = require('moment');
const {HTML2Jira} = require('html2jira');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

class SubmitReportCompanyModel {
    constructor() {
        this.collection = SchemaModels.SubmitReportModel;
    }

    async getCompanyReportsList(user_id, title, status, severity, is_close, vulnerability, field, report_id, current_user_id, from_date, to_date, user_level_access, can_see_approve, program_type, program_id, page, parent_user_id, access_program_list) {
        if (!isObjectID(user_id)) {
            return "1";
        }
        const ret = {};
        const where = {status: {$gt: 0, $lt: 9}};
        const is_member = !!(parent_user_id && access_program_list && access_program_list.length > 0);
        let access_program_ids = [];
        if (is_member) {
            access_program_ids = access_program_list.map(program => program._id);
            where['program_id'] = {$in: access_program_ids};
        }
        if (status != '') {
            let s = toNumber(status);
            if (s > 0 && s < 9)
                where['status'] = toNumber(status);
        }
        if (program_id && isObjectID(program_id)) {
            where['program_id'] = mongoose.Types.ObjectId(program_id);
        }
        if (severity != '') {
            severity = toNumber(severity);
            if (severity <= 0 || severity >= 5)
                severity = 0;
            where['severity'] = severity;
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

        const sort_by = this.setSortBy(field);
        ret.current_page = toNumber(page) || 1;
        const result = await this.collection
            .aggregate([
                {$match: where},
                ...((vulnerability === "") ? [] : [{
                    $match: {
                        $and: [{status: {$in: [REPORT_STATUS.APPROVE, REPORT_STATUS.RESOLVED]}},
                            ...((vulnerability === "A1") ?
                                [{
                                    vulnerability_type_id: {
                                        $in: [
                                            mongoose.Types.ObjectId("5ff55b7c695b06059753dd19"),
                                            mongoose.Types.ObjectId("5ff55b82695b06059753dd1a"),
                                            mongoose.Types.ObjectId("5ff59afb695b06059753dd5d"),
                                            mongoose.Types.ObjectId("5ff59b24695b06059753dd66"),
                                            mongoose.Types.ObjectId("5ff5a403695b06059753dd7a"),
                                            mongoose.Types.ObjectId("5ff5a4f7695b06059753dd9a")
                                        ]
                                    }
                                }] :
                                (vulnerability === "A2") ?
                                    [{
                                        vulnerability_type_id: {
                                            $in: [
                                                mongoose.Types.ObjectId("604ddc5b402ee72fea15450f"),
                                                mongoose.Types.ObjectId("5ff59ae6695b06059753dd59"),
                                                mongoose.Types.ObjectId("5ff59b4d695b06059753dd6e"),
                                                mongoose.Types.ObjectId("5ff5a40f695b06059753dd7d"),
                                                mongoose.Types.ObjectId("5ff5a457695b06059753dd85"),
                                                mongoose.Types.ObjectId("5ff5a48a695b06059753dd87"),
                                                mongoose.Types.ObjectId("5ff5a49e695b06059753dd8b"),
                                                mongoose.Types.ObjectId("5ff5a4cd695b06059753dd95"),
                                                mongoose.Types.ObjectId("5ff55cd4695b06059753dd3d")
                                            ]
                                        }
                                    }] :
                                    (vulnerability === "A3") ?
                                        [{
                                            vulnerability_type_id: {
                                                $in: [
                                                    mongoose.Types.ObjectId("5ff55ceb695b06059753dd3f"),
                                                    mongoose.Types.ObjectId("5ff59acc695b06059753dd56"),
                                                    mongoose.Types.ObjectId("5ff59b12695b06059753dd62"),
                                                    mongoose.Types.ObjectId("5ff59b17695b06059753dd63"),
                                                    mongoose.Types.ObjectId("5ff59b53695b06059753dd6f"),
                                                    mongoose.Types.ObjectId("5ff59b6e695b06059753dd74"),
                                                    mongoose.Types.ObjectId("5ff5a3fd695b06059753dd79"),
                                                    mongoose.Types.ObjectId("5ff5a4b6695b06059753dd90"),
                                                    mongoose.Types.ObjectId("5ff5a4bc695b06059753dd91")
                                                ]
                                            }
                                        }] :
                                        (vulnerability === "A4") ?
                                            [{
                                                vulnerability_type_id: {
                                                    $in: [
                                                        mongoose.Types.ObjectId("5ff5a4ee695b06059753dd98"),
                                                        mongoose.Types.ObjectId("5ff5a4f3695b06059753dd99")
                                                    ]
                                                }
                                            }] :
                                            (vulnerability === "A5") ?
                                                [{
                                                    vulnerability_type_id: {
                                                        $in: [
                                                            mongoose.Types.ObjectId("5ff55c0f695b06059753dd2b"),
                                                            mongoose.Types.ObjectId("5ff55c2c695b06059753dd2f"),
                                                            mongoose.Types.ObjectId("5ff55c34695b06059753dd30"),
                                                            mongoose.Types.ObjectId("5ff55c3d695b06059753dd31"),
                                                            mongoose.Types.ObjectId("5ff59ac7695b06059753dd55"),
                                                            mongoose.Types.ObjectId("5ff59b3f695b06059753dd6b"),
                                                            mongoose.Types.ObjectId("5ff59b58695b06059753dd70")
                                                        ]
                                                    }
                                                }] :
                                                (vulnerability === "A6") ?
                                                    [{
                                                        vulnerability_type_id: {
                                                            $in: [
                                                                mongoose.Types.ObjectId("5ff55d1f695b06059753dd44"),
                                                                mongoose.Types.ObjectId("5ff55d52695b06059753dd48")
                                                            ]
                                                        }
                                                    }] :
                                                    (vulnerability === "A7") ?
                                                        [{
                                                            vulnerability_type_id: {
                                                                $in: [
                                                                    mongoose.Types.ObjectId("5ff55b98695b06059753dd1d"),
                                                                    mongoose.Types.ObjectId("5ff55b9e695b06059753dd1e"),
                                                                    mongoose.Types.ObjectId("5ff55ba4695b06059753dd1f"),
                                                                    mongoose.Types.ObjectId("5ff55baa695b06059753dd20")
                                                                ]
                                                            }
                                                        }] :
                                                        (vulnerability === "A8") ?
                                                            [{
                                                                vulnerability_type_id: {
                                                                    $in: [
                                                                        mongoose.Types.ObjectId("5ff55bbc695b06059753dd23"),
                                                                        mongoose.Types.ObjectId("5ff5a499695b06059753dd8a")
                                                                    ]
                                                                }
                                                            }] :
                                                            (vulnerability === "A9") ?
                                                                [{
                                                                    vulnerability_type_id: {
                                                                        $in: [
                                                                            mongoose.Types.ObjectId("5ff59aeb695b06059753dd5a"),
                                                                            mongoose.Types.ObjectId("5ff5a4b6695b06059753dd90"),
                                                                            mongoose.Types.ObjectId("5ff5a4c5695b06059753dd93")
                                                                        ]
                                                                    }
                                                                }] : [])]
                    }
                }]),
                {
                    $addFields: {
                        filter_date_time: {$ifNull: ["$after_inprogress_date_time", "$submit_date_time"]}
                    }
                },
                ...(hasValue(from_date) ? [{
                    $match: {
                        filter_date_time: {$gte: moment(from_date).toDate()}
                    }
                }] : []),
                ...(hasValue(to_date) ? [{
                    $match: {
                        filter_date_time: {$lte: moment(to_date).add(86399, 'seconds').toDate()}
                    }
                }] : []),
                ...(user_level_access === toNumber(ROLES.OBSERVER) ? can_see_approve ? [{
                    $match: {
                        status: {$in: [REPORT_STATUS.APPROVE, REPORT_STATUS.RESOLVED]}
                    }
                }] : [{
                    $match: {
                        status: {$in: [REPORT_STATUS.RESOLVED]}
                    }
                }] : []),
                {
                    $lookup: {
                        from: "programs",
                        localField: "program_id",
                        foreignField: "_id",
                        as: "program_id",
                    },
                }, {
                    $lookup: {
                        from: "type_vulnerabilities",
                        localField: "vulnerability_type_id",
                        foreignField: "_id",
                        as: "vulnerability_type_id",
                    },
                },
                {"$unwind": {path: "$vulnerability_type_id", preserveNullAndEmptyArrays: true}},
                {
                    $lookup: {
                        from: "hacker_users",
                        localField: "hacker_user_id",
                        foreignField: "_id",
                        as: "hacker_user_id",
                    },
                },
                {
                    "$unwind": "$hacker_user_id"
                },
                {
                    "$unwind": "$program_id"
                },
                ...(program_type !== undefined && program_type !== '' && program_type > -1 ? [
                    {$match: {"program_id.is_next_generation": program_type}}
                ] : []),
                {
                    $match: {
                        $and: [{
                            "program_id.company_user_id": user_id,
                        },
                            {
                                $or: [{"program_id.status": PROGRAM_STATUS.APPROVED},
                                    {"program_id.status": PROGRAM_STATUS.CLOSE}]
                            },
                            {
                                $or: [{
                                    'title': {
                                        $regex: ".*" + title + ".*",
                                        $options: "i"
                                    }
                                }, {'program_id.name': {$regex: ".*" + title + ".*", $options: "i"}},
                                    {'vulnerability_type_id.title': {$regex: ".*" + title + ".*", $options: "i"}},
                                    {'proof_concept': {$regex: ".*" + title + ".*", $options: "i"}},
                                    {'proof_recommendation': {$regex: ".*" + title + ".*", $options: "i"}},
                                    {'proof_url': {$regex: ".*" + title + ".*", $options: "i"}},
                                    {'security_impact': {$regex: ".*" + title + ".*", $options: "i"}}
                                ]
                            }
                        ]
                    }
                },
                {$sort: {[sort_by]: -1, submit_date_time: -1}},
                {
                    $facet: {
                        totalRows: [
                            {
                                $count: "count",
                            },
                        ],
                        rows: [
                            {
                                $skip: (ret.current_page - 1) * 10,
                            },
                            {$limit: 10},
                            {
                                $project: {
                                    title: 1,
                                    status: 1,
                                    is_close: 1,
                                    severity: 1,
                                    submit_date_time: "$filter_date_time",
                                    "program_id": {"name": 1, "is_next_generation": 1},
                                    "hacker_user_id": {"username": 1, "avatar_file": 1, "tag": 1}
                                },
                            },
                        ],
                    },
                },
            ])
            .exec();
        if (result && result.length > 0 && result[0].totalRows.length > 0) {
            const comments = await SchemaModels.CommentSubmitReportModel.aggregate([
                {$match: {report_id: {$in: result[0].rows.map(d => d._id)}}},
                {
                    $facet: {
                        all_comment_count: [
                            {$group: {_id: "$report_id", count: {$sum: 1}}}
                        ],
                        unread_comment_count: [
                            {$match: {$and: [{reading_status: {$ne: null}}]}},
                            {$addFields: {is_read: {$cond: [{$in: [mongoose.Types.ObjectId(current_user_id), "$reading_status.read_by_company"]}, true, false]}}},
                            {$group: {_id: "$report_id", count: {$sum: {$cond: [{$eq: [false, "$is_read"]}, 1, 0]}}}}
                        ]
                    }
                }
            ]);
            result[0].rows.forEach(item => {
                if (!item.hacker_user_id.tag) {
                    item.hacker_user_id.tag = [];
                }
                const all_comment_count = comments[0].all_comment_count.find(f => f._id.toString() === item._id.toString());
                const unread_comment_count = comments[0].unread_comment_count.find(f => f._id.toString() === item._id.toString());
                if (all_comment_count) {
                    item.comment_count = all_comment_count.count;
                } else {
                    item.comment_count = 0;
                }
                if (unread_comment_count) {
                    item.unread_comment_count = unread_comment_count.count;
                } else {
                    item.unread_comment_count = 0;
                }
            });
            ret.rows = result[0].rows;
            ret.totalRows = result[0].totalRows[0].count;
            ret.totalPage = Math.ceil(ret.totalRows / gLimit);
        } else {
            ret.rows = [];
            ret.totalRows = 0;
            ret.totalPage = 0;
        }
        const filters = [{company_user_id: user_id},
            {
                $or: [{status: PROGRAM_STATUS.APPROVED},
                    {status: PROGRAM_STATUS.CLOSE}]
            }];
        if (is_member) {
            filters.push({_id: {$in: access_program_ids}});
        }
        ret.programs = await SchemaModels.ProgramModel.find(
            {
                $and: filters
            }, {_id: 1, name: 1});
        return ret;
    }

    async getReport(user_id, report_id, user_level_access, can_see_approve, parent_user_id, access_program_list) {
        if (!isObjectID(user_id)) {
            return "1";
        }
        if (!isObjectID(report_id)) {
            return "2";
        }
        const result = await this.collection.aggregate([
            {
                $match: {_id: mongoose.Types.ObjectId(report_id)},
            },
            {
                $lookup: {
                    from: "programs",
                    localField: "program_id",
                    foreignField: "_id",
                    as: "program_id",
                },
            },
            {
                $lookup: {
                    from: "hacker_users",
                    localField: "hacker_user_id",
                    foreignField: "_id",
                    as: "hacker_user_id",
                },
            },
            {
                "$unwind": {path: "$hacker_user_id", preserveNullAndEmptyArrays: true}
            },
            {
                "$unwind": {path: "$program_id", preserveNullAndEmptyArrays: true}
            },
            {
                $lookup: {
                    from: "type_vulnerabilities",
                    localField: "vulnerability_type_id",
                    foreignField: "_id",
                    as: "vulnerability_type_id",
                },
            },
            {
                "$unwind": {path: "$vulnerability_type_id", preserveNullAndEmptyArrays: true}
            },
            {
                $match: {
                    "program_id.company_user_id": user_id,
                },
            },
            {
                $project: {
                    "is_close": 1,
                    "severity_score": 1,
                    "status": 1,
                    "reference_id": 1,
                    "severity": 1,
                    "title": 1,
                    "proof_concept": 1,
                    "proof_recommendation": 1,
                    "proof_url": 1,
                    "security_impact": 1,
                    "submit_date_time": {$ifNull: ["$after_inprogress_date_time", "$submit_date_time"]},
                    "report_files": 1,
                    "target_id": {
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
                    "program_id": {
                        "_id": 1, "name": 1, "register_date_time": 1, "expire_date_program": 1, "start_date_program": 1
                        , "logo_file": 1, "rewards": 1, "status": 1, "program_type": 1, "targets": 1
                    },
                    "hacker_user_id": {"_id": 1, "username": 1, "avatar_file": 1, "tag": 1},
                    "vulnerability_type_id": {"title": 1},
                }
            }
        ]).exec();

        if (!result || !result[0]) {
            return "3";
        }

        if (result[0].status === REPORT_STATUS.IN_PROGRESS_BY_ADMIN) {
            return "4";
        }

        if (user_level_access === toNumber(ROLES.OBSERVER) &&
            result[0].status !== REPORT_STATUS.APPROVE &&
            result[0].status !== REPORT_STATUS.RESOLVED) {
            return "4";
        }
        if (user_level_access === toNumber(ROLES.OBSERVER) &&
            result[0].status === REPORT_STATUS.APPROVE &&
            !can_see_approve) {
            return "4";
        }
        if (parent_user_id && access_program_list && access_program_list.length > 0 &&
            !access_program_list.map(d => d._id.toString()).includes(result[0].program_id._id.toString())) {
            return "4";
        }
        if (result && result[0]) {
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
                        sender_id: {display_name: 1, avatar_file: 1, fn: 1, ln: 1, user_level_access: 1},
                        fields: 1,
                        register_date_time: 1
                    }
                }
            ]);
            let has_jira_integration = false;
            let integrations = [];
            let jira_projects = null;
            const projects_info = [];
            if ((user_level_access === toNumber(ROLES.ADMIN)) ||
                user_level_access === toNumber(ROLES.SUPPER_ADMIN)) {
                if (access_program_list && access_program_list.length > 0 && !access_program_list.map(p => p._id.toString()).includes(result[0].program_id._id.toString())) {
                    integrations = []
                } else {
                    integrations = await SchemaModels.IntegrationModel.find({
                        company_user_id: user_id,
                        type: INTEGRATION_TYPE.JIRA,
                        status: INTEGRATION_AUTH_STATUS.ACTIVE,
                        "programs._id": result[0].program_id._id
                    });
                }
            }
            has_jira_integration = integrations && integrations.length > 0;
            if (has_jira_integration) {
                for (let index = 0; index < integrations.length; index++) {
                    const integration = integrations[index];
                    jira_projects = await this.getJiraProjects(user_id, integration.integration_authentication_id);
                    if (jira_projects && jira_projects.length > 0) {
                        const project = jira_projects.find(project => project.id.toString() === integration.project_id.toString());
                        if (project && project.name) {
                            const item = {
                                project_id: project.id,
                                project_name: project.name,
                                is_report_sended: integration.reports.includes(result[0]._id)
                            };
                            if (!projects_info.map(it => it.project_id).includes(item.project_id)) {
                                projects_info.push(item);
                            }
                        }
                    }
                }
            }
            result[0].severity_history = severity_history || [];
            result[0].has_jira_integration = projects_info && projects_info.length > 0;
            result[0].projects_info = projects_info;
        }
        return result[0];
    }

    async getJiraProjects(company_user_id, authentication_id) {
        let projects = null;
        const authentication = await SchemaModels.IntegrationAuthenticationModel
            .findOne({
                company_user_id,
                type: INTEGRATION_TYPE.JIRA,
                status: INTEGRATION_AUTH_STATUS.ACTIVE,
                _id: authentication_id
            })
            .select({url: 1, shared_secret: 1, oauth_token: 1, _id: 1});

        if (!authentication || !authentication.url || !authentication.oauth_token) return null;
        const shared_secret = decryptedToken(OAUTH_1A.SECRET_KEY, company_user_id.toString(), authentication.shared_secret);
        const oauth_token = decryptedToken(OAUTH_1A.SECRET_KEY, shared_secret, authentication.oauth_token);
        if (!authentication.oauth_token) return null;

        const jira_projects = await this.getJiraResponse(createRequestForJiraApis(
            `${authentication.url}/rest/api/2/project`,
            'GET', {oauth_token: oauth_token}
        ));

        if (jira_projects.jira_error) return null;
        if (jira_projects.response.length > 0) {
            projects = jira_projects.response.map(project => ({name: project.name, id: project.id}));
        }
        return projects;
    }

    async getCommentList(user_id, report_id, current_user_id, parent_user_id, access_program_list) {
        if (!isObjectID(user_id) || !isObjectID(report_id))
            return {
                "current_page": 1,
                "totalRows": 0,
                "totalPage": 0,
                "rows": []
            };
        const ret = {};
        const report = await this.collection.findOne({_id: report_id}).select({program_id: 1});
        if (!report || !report.program_id) {
            return "1";
        }
        if (parent_user_id && access_program_list && access_program_list.length > 0 &&
            !access_program_list.map(access_program => access_program._id.toString())
                .includes(report.program_id.toString())) {
            return "2";
        }
        const result = await SchemaModels.CommentSubmitReportModel.aggregate([
            {$match: {'report_id': mongoose.Types.ObjectId(report_id)}},
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
                    from: "programs",
                    localField: "report_id.program_id",
                    foreignField: "_id",
                    as: "program_id"
                }
            },
            {
                $match: {
                    $and: [{'program_id.company_user_id': user_id},
                        {$or: [{payment_history_id: {$exists: false}}, {'program_id.is_next_generation': PROGRAM_BOUNTY_TYPE.BUG_BOUNTY}]}]
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
                    "preserveNullAndEmptyArrays": true
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
                    "preserveNullAndEmptyArrays": true
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
                                _id: 1,
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
                                hacker_user_id: {"username": 1, "avatar_file": 1, "tag": 1}
                            }
                        }
                    ]
                }
            }
        ]).exec();
        if (result && result.length > 0 && result[0].totalRows.length > 0) {
            await SchemaModels.CommentSubmitReportModel.updateMany({
                $and: [{report_id: report_id}, {reading_status: {$exists: true}},
                    {_id: {$in: result[0].rows.map(d => d._id.toString())}}]
            }, {$addToSet: {"reading_status.read_by_company": current_user_id}});
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

    async checkForSubmitComment(user_id, report_id, member_access_level = undefined, can_send_comment = false, parent_user_id, access_program_list) {

        if (member_access_level && (member_access_level === toNumber(ROLES.VIEWER) || member_access_level === toNumber(ROLES.OBSERVER))) {
            if (member_access_level === toNumber(ROLES.OBSERVER) || !can_send_comment) return 7;
        }
        const result = await this.collection.findOne({"_id": report_id}, {
            _id: 0,
            is_close: 1,
            program_id: 1
        }).populate({
            path: 'program_id',
            match: {company_user_id: user_id},
            select: {is_verify: 1, _id: 1}
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
        if (parent_user_id && access_program_list && access_program_list.length > 0 &&
            !access_program_list.map(p => p._id.toString()).includes(result.program_id._id.toString())) {
            return 8;
        }
        return 0;
    }

    async addCmdReport(user_id, report_id
        , file1, file1_original_name, file2, file2_original_name
        , file3, file3_original_name
        , comment, parent_user_id, is_internal) {
        if (!isObjectID(user_id) || !isObjectID(report_id))
            return 7;

        let i = SchemaModels.CommentSubmitReportModel({
            "company_user_id": user_id,
            "report_id": report_id,
            "file1": file1,
            "file1_original_name": file1_original_name,
            "file2": file2,
            "file2_original_name": file2_original_name,
            "file3": file3,
            "is_internal": is_internal || false,
            "reading_status": {
                read_by_moderator: [],
                read_by_hacker: false,
                read_by_company: [user_id]
            },
            "file3_original_name": file3_original_name,
            "send_date_time": getDateTime(),
            "comment": comment,
            "send_type": 2
        });
        await this.collection.updateOne({_id: report_id}, {$set: {last_modify_date_time: getDateTime()}});
        let r = await i.save();
        let report = await this.getReportForNotification(parent_user_id || user_id, report_id);
        if (!report || !report.program_id || !isObjectID(report.program_id._id)) {
            return 8;
        }
        await this.sendNotificationBaseOnSetting("comments_by_company", report.program_id._id, report_id, report.hacker_user_id._id,
            report.severity, report.hacker_user_id.report_notification_setting, REPORT_NOTIFICATION_TYPE.SUBMIT_COMMENT, is_internal);
        if (!is_internal && report.hacker_user_id.report_notification_setting &&
            isArray(report.hacker_user_id.report_notification_setting.comments_by_company_advance) &&
            report.hacker_user_id.report_notification_setting.comments_by_company_advance.includes(report.severity)) {
            if (report.hacker_user_id.report_notification_setting.comments_by_company === NORIFICATION_SETTING.WEB ||
                report.hacker_user_id.report_notification_setting.comments_by_company === NORIFICATION_SETTING.EMAIL_WEB) {
                const notification = await this.createNotification("New Comment",
                    `${report.hacker_user_id.fn}, The company has added a comment on your report`,
                    FIELD_TYPE.COMMENT, report.hacker_user_id._id, MESSAGE_TYPE.INFO, user_id,
                    report_id, ACTION_TYPE.CREATE, RESOURCE_TYPE.COMMENT);

                this.sendNotification("notification", report.hacker_user_id._id, notification.title,
                    notification.text, notification.register_date_time, notification.message_type, notification.resource_type,
                    notification._id, notification.report_id);
            }
        }
        const moderators = await this.getAssignedModerators(report_id);
        const moderators_notification = await this.createModeratorsNotification("New Comment",
            FIELD_TYPE.COMMENT, moderators, MESSAGE_TYPE.INFO, user_id,
            report_id, ACTION_TYPE.CREATE, RESOURCE_TYPE.COMMENT);
        this.sendModeratorsNotification("notification", moderators_notification);
        // const history_model = {
        //     sender_type: SENDER_TYPE.COMPANY,
        //     activity:ACTIVITY_TEXT_LOG.SUBMIT_COMMENT,
        //     sender_id:user_id,
        //     resource_type:RESOURCE_TYPE.COMMENT,
        //     resource_id:r._id,
        //     register_date_time:getDateTime()
        // };
        // await SchemaModels.HistoryModel.create(history_model);
        return r;
    }

    async getReportsCountGroupBySeverity(programs, program_type, group_by_program_type, status) {
        const filters = {program_id: {$in: programs.map(program => toObjectID(program._id))}};
        if (status === 'approved') {
            filters.status = REPORT_STATUS.APPROVE;
        } else if (status === 'resolved') {
            filters.status = REPORT_STATUS.RESOLVED;
        } else {
            filters.status = {$gte: 1, $lt: 10}
        }
        return await SchemaModels.SubmitReportModel.aggregate([
            {$match: filters},
            ...((program_type > -1 && group_by_program_type) ? [{
                    $match: {program_id: {$in: programs.filter(program => program.is_next_generation === program_type).map(program => toObjectID(program._id))}},
                }] :
                []),
            {
                $group: {
                    _id: null,
                    N: {$sum: {$cond: [{$eq: ["$severity", REPORT_SEVERITY.NONE]}, 1, 0]}},
                    L: {$sum: {$cond: [{$eq: ["$severity", REPORT_SEVERITY.LOW]}, 1, 0]}},
                    M: {$sum: {$cond: [{$eq: ["$severity", REPORT_SEVERITY.MEDIUM]}, 1, 0]}},
                    H: {$sum: {$cond: [{$eq: ["$severity", REPORT_SEVERITY.HIGH]}, 1, 0]}},
                    C: {$sum: {$cond: [{$eq: ["$severity", REPORT_SEVERITY.CRITICAL]}, 1, 0]}}
                }
            },
            {$project: {_id: 0, N: 1, L: 1, M: 1, H: 1, C: 1}}
        ]).exec();
    }

    async getReportsCountGroupByStatus(programs, program_type, group_by_program_type, status) {
        const filters = {program_id: {$in: programs.map(program => toObjectID(program._id))}};
        return await SchemaModels.SubmitReportModel.aggregate([
            {$match: filters},
            ...((program_type > -1 && group_by_program_type) ? [{
                    $match: {program_id: {$in: programs.filter(program => program.is_next_generation === program_type).map(program => toObjectID(program._id))}},
                }] :
                []),
            {
                $group: {
                    _id: null,
                    Pen: {$sum: {$cond: [{$eq: ["$status", REPORT_STATUS.PENDING]}, 1, 0]}},
                    Tri: {$sum: {$cond: [{$eq: ["$status", REPORT_STATUS.TRIAGE]}, 1, 0]}},
                    Dub: {$sum: {$cond: [{$eq: ["$status", REPORT_STATUS.DUPLICATE]}, 1, 0]}},
                    App: {$sum: {$cond: [{$eq: ["$status", REPORT_STATUS.APPROVE]}, 1, 0]}},
                    Res: {$sum: {$cond: [{$eq: ["$status", REPORT_STATUS.RESOLVED]}, 1, 0]}},
                    Rej: {$sum: {$cond: [{$eq: ["$status", REPORT_STATUS.REJECT]}, 1, 0]}},
                }
            },
            {$project: {_id: 0, Pen: 1, Tri: 1, Dub: 1, App: 1, Res: 1, Rej: 1}}
        ]).exec();
    }

    setReportsCountByStatus(item, reports) {
        if (reports && reports[0] && item.reports_count) {
            item.reports_count.forEach(report_count => {
                switch (report_count.key) {
                    case "Pen" :
                        report_count.value = reports[0].Pen;
                        break;
                    case "Tri" :
                        report_count.value = reports[0].Tri;
                        break;
                    case "Dub" :
                        report_count.value = reports[0].Dub;
                        break;
                    case "App" :
                        report_count.value = reports[0].App;
                        break;
                    case "Res" :
                        report_count.value = reports[0].Res;
                        break;
                    case "Rej" :
                        report_count.value = reports[0].Rej;
                        break;
                }
            });
        }
    }

    setReportsCountBySeverity(item, reports) {
        if (reports && reports[0] && item.reports_count) {
            item.reports_count.forEach(report_count => {
                switch (report_count.key) {
                    case "N" :
                        report_count.value = reports[0].N;
                        break;
                    case "L" :
                        report_count.value = reports[0].L;
                        break;
                    case "M" :
                        report_count.value = reports[0].M;
                        break;
                    case "H" :
                        report_count.value = reports[0].H;
                        break;
                    case "C" :
                        report_count.value = reports[0].C;
                        break;
                }
            });
        }
    }

    setReportsCountByProgramType(reports, item, program_type) {
        switch (program_type) {
            case 'all' :
                this.setReportsCountBySeverity(item, reports);
                break;
            case 'bug_bounty' :
                this.setReportsCountBySeverity(item, reports);
                break;
            case 'next_gen' :
                this.setReportsCountBySeverity(item, reports);
                break;
            case 'intelligence' :
                this.setReportsCountBySeverity(item, reports);
                break;
        }
    }

    setStatusReportsCountByProgramType(reports, item, program_type) {
        switch (program_type) {
            case 'all' :
                this.setReportsCountByStatus(item, reports);
                break;
            case 'bug_bounty' :
                this.setReportsCountByStatus(item, reports);
                break;
            case 'next_gen' :
                this.setReportsCountByStatus(item, reports);
                break;
            case 'intelligence' :
                this.setReportsCountByStatus(item, reports);
                break;
        }
    }

    setReportsCountResponse(reports, group_by_program_type, program_type) {
        let result;
        if (!group_by_program_type) {
            result = [
                {
                    label: "all",
                    title: "All",
                    reports_count: [{key: "N", value: 0}, {key: "L", value: 0}, {key: "M", value: 0}, {
                        key: "H",
                        value: 0
                    }, {
                        key: "C",
                        value: 0
                    }]
                }
            ];
        } else {
            switch (program_type) {
                case PROGRAM_BOUNTY_TYPE.BUG_BOUNTY:
                    result = [
                        {
                            label: "bug_bounty",
                            title: "Bug Bounty",
                            reports_count: [{key: "N", value: 0}, {key: "L", value: 0}, {key: "M", value: 0}, {
                                key: "H",
                                value: 0
                            }, {
                                key: "C",
                                value: 0
                            }]
                        }
                    ];
                    break;
                case PROGRAM_BOUNTY_TYPE.INTELLIGENCE_DISCOVERY:
                    result = [
                        {
                            label: "intelligence",
                            title: "Intelligence",
                            reports_count: [{key: "N", value: 0}, {key: "L", value: 0}, {key: "M", value: 0}, {
                                key: "H",
                                value: 0
                            }, {
                                key: "C",
                                value: 0
                            }]
                        }
                    ];
                    break;
                case PROGRAM_BOUNTY_TYPE.NEXT_GEN_PEN_TEST:
                    result = [
                        {
                            label: "next_gen",
                            title: "Next Gen",
                            reports_count: [{key: "N", value: 0}, {key: "L", value: 0}, {key: "M", value: 0}, {
                                key: "H",
                                value: 0
                            }, {
                                key: "C",
                                value: 0
                            }]
                        }
                    ];
                    break;
                default:
                    result = [
                        {
                            label: "all",
                            title: "All",
                            reports_count: [{key: "N", value: 0}, {key: "L", value: 0}, {key: "M", value: 0}, {
                                key: "H",
                                value: 0
                            }, {
                                key: "C",
                                value: 0
                            }]
                        }
                    ];
                    break;
            }
        }

        if (reports) {
            result.forEach(item => {
                switch (item.label) {
                    case 'all' :
                        this.setReportsCountByProgramType(reports, item, "all");
                        break;
                    case 'bug_bounty' :
                        this.setReportsCountByProgramType(reports, item, "bug_bounty");
                        break;
                    case 'next_gen' :
                        this.setReportsCountByProgramType(reports, item, "next_gen");
                        break;
                    case 'intelligence' :
                        this.setReportsCountByProgramType(reports, item, "intelligence");
                        break;
                }
            });
        }
        return result;
    }

    setReportsCountResponseBaseStatus(reports, group_by_program_type, program_type) {
        let result;
        if (!group_by_program_type) {
            result = [
                {
                    label: "all",
                    title: "All",
                    reports_count: [{key: "Pen", value: 0}, {key: "Tri", value: 0},
                        {key: "Dub", value: 0}, {key: "App", value: 0}, {key: "Res", value: 0}, {
                            key: "Rej",
                            value: 0
                        }]
                }
            ];
        } else {
            switch (program_type) {
                case PROGRAM_BOUNTY_TYPE.BUG_BOUNTY:
                    result = [
                        {
                            label: "bug_bounty",
                            title: "Bug Bounty",
                            reports_count: [{key: "Pen", value: 0}, {key: "Tri", value: 0},
                                {key: "Dub", value: 0}, {key: "App", value: 0}, {key: "Res", value: 0}, {
                                    key: "Rej",
                                    value: 0
                                }]
                        }
                    ];
                    break;
                case PROGRAM_BOUNTY_TYPE.INTELLIGENCE_DISCOVERY:
                    result = [
                        {
                            label: "intelligence",
                            title: "Intelligence",
                            reports_count: [{key: "Pen", value: 0}, {key: "Tri", value: 0},
                                {key: "Dub", value: 0}, {key: "App", value: 0}, {key: "Res", value: 0}, {
                                    key: "Rej",
                                    value: 0
                                }]
                        }
                    ];
                    break;
                case PROGRAM_BOUNTY_TYPE.NEXT_GEN_PEN_TEST:
                    result = [
                        {
                            label: "next_gen",
                            title: "Next Gen",
                            reports_count: [{key: "Pen", value: 0}, {key: "Tri", value: 0},
                                {key: "Dub", value: 0}, {key: "App", value: 0}, {key: "Res", value: 0}, {
                                    key: "Rej",
                                    value: 0
                                }]
                        }
                    ];
                    break;
                default:
                    result = [
                        {
                            label: "all",
                            title: "All",
                            reports_count: [{key: "Pen", value: 0}, {key: "Tri", value: 0},
                                {key: "Dub", value: 0}, {key: "App", value: 0}, {key: "Res", value: 0}, {
                                    key: "Rej",
                                    value: 0
                                }]
                        }
                    ];
                    break;
            }
        }

        if (reports) {
            result.forEach(item => {
                switch (item.label) {
                    case 'all' :
                        this.setStatusReportsCountByProgramType(reports, item, "all");
                        break;
                    case 'bug_bounty' :
                        this.setStatusReportsCountByProgramType(reports, item, "bug_bounty");
                        break;
                    case 'next_gen' :
                        this.setStatusReportsCountByProgramType(reports, item, "next_gen");
                        break;
                    case 'intelligence' :
                        this.setStatusReportsCountByProgramType(reports, item, "intelligence");
                        break;
                }
            });
        }
        return result;
    }

    setApproveReportsData(item, reports_rows, reports_count, showPerPage, page) {
        if (reports_rows && reports_rows.length > 0 && reports_count && reports_count[0]) {
            item.reports.rows = reports_rows;
            item.reports.total_rows = reports_count[0].count;
            item.reports.current_page = page;
            item.reports.total_pages = Math.ceil(reports_count[0].count / showPerPage);
        }
    }

    setApproveReportsByProgramType(reports, item, program_type, showPerPage, page) {
        switch (program_type) {
            case 'all' :
                this.setApproveReportsData(item, reports[0].all_rows, reports[0].all_total_count, showPerPage, page);
                break;
            case 'bug_bounty' :
                this.setApproveReportsData(item, reports[0].bug_bounty_rows, reports[0].bug_bounty_total_count, showPerPage, page);
                break;
            case 'next_gen' :
                this.setApproveReportsData(item, reports[0].next_gen_rows, reports[0].next_gen_total_count, showPerPage, page);
                break;
            case 'intelligence' :
                this.setApproveReportsData(item, reports[0].intelligence_rows, reports[0].intelligence_total_count, showPerPage, page);
                break;
        }
    }

    async getApproveReportsCounts(company_user_id, program_type, status, parent_user_id, access_program_list) {
        let programs = await this.getAllValidPrograms(company_user_id);
        if (!(programs && programs.length > 0)) {
            return [];
        }
        if (parent_user_id && access_program_list && access_program_list.length > 0) {
            const access_program_ids = access_program_list.map(access_program => access_program._id.toString());
            programs = programs.filter(program => access_program_ids.includes(program._id.toString()));
        }
        const group_by_program_type = programs.map(program => program.is_next_generation).filter((value, index, self) => self.indexOf(value) === index).length > 1;
        const result = {group_by_program_type};
        const reports = await this.getReportsCountGroupBySeverity(programs, program_type, group_by_program_type, status);
        result.approved_reports_count = this.setReportsCountResponse(reports, group_by_program_type, program_type);
        return result;
    }

    async getReportsCountsBaseStatus(company_user_id, program_type, parent_user_id, access_program_list) {
        let programs = await this.getAllValidPrograms(company_user_id);
        if (!(programs && programs.length > 0)) {
            return [];
        }
        if (parent_user_id && access_program_list && access_program_list.length > 0) {
            const access_program_ids = access_program_list.map(access_program => access_program._id.toString());
            programs = programs.filter(program => access_program_ids.includes(program._id.toString()));
        }
        const group_by_program_type = programs.map(program => program.is_next_generation).filter((value, index, self) => self.indexOf(value) === index).length > 1;
        const result = {group_by_program_type};
        const reports = await this.getReportsCountGroupByStatus(programs, program_type, group_by_program_type);
        result.status_reports_count = this.setReportsCountResponseBaseStatus(reports, group_by_program_type, program_type);
        return result;
    }

    async getApprovedReports(programs, page, showPerPage) {
        return await SchemaModels.SubmitReportModel.aggregate([
            {$match: {status: REPORT_STATUS.APPROVE}},
            {
                $facet: {
                    all_total_count: [{
                        $match: {program_id: {$in: programs.map(program => toObjectID(program._id))}},
                    }, {$count: "count"}],
                    all_rows: [{
                        $match: {program_id: {$in: programs.map(program => toObjectID(program._id))}},
                    }, {$sort: {severity: -1, submit_date_time: -1}},
                        {$skip: (page - 1) * showPerPage},
                        {$limit: showPerPage},
                        {$project: {_id: 1, severity: 1, title: 1}}],
                    bug_bounty_total_count: [{
                        $match: {program_id: {$in: programs.filter(program => program.is_next_generation === PROGRAM_BOUNTY_TYPE.BUG_BOUNTY).map(program => toObjectID(program._id))}},
                    }, {$count: "count"}],
                    bug_bounty_rows: [{
                        $match: {program_id: {$in: programs.filter(program => program.is_next_generation === PROGRAM_BOUNTY_TYPE.BUG_BOUNTY).map(program => toObjectID(program._id))}},
                    }, {$sort: {severity: -1, submit_date_time: -1}},
                        {$skip: (page - 1) * showPerPage},
                        {$limit: showPerPage},
                        {$project: {_id: 1, severity: 1, title: 1}}],
                    next_gen_total_count: [{
                        $match: {program_id: {$in: programs.filter(program => program.is_next_generation === PROGRAM_BOUNTY_TYPE.NEXT_GEN_PEN_TEST).map(program => toObjectID(program._id))}},
                    }, {$count: "count"}],
                    next_gen_rows: [{
                        $match: {program_id: {$in: programs.filter(program => program.is_next_generation === PROGRAM_BOUNTY_TYPE.NEXT_GEN_PEN_TEST).map(program => toObjectID(program._id))}},
                    }, {$sort: {severity: -1, submit_date_time: -1}},
                        {$skip: (page - 1) * showPerPage},
                        {$limit: showPerPage},
                        {$project: {_id: 1, severity: 1, title: 1}}],
                    intelligence_total_count: [{
                        $match: {program_id: {$in: programs.filter(program => program.is_next_generation === PROGRAM_BOUNTY_TYPE.INTELLIGENCE_DISCOVERY).map(program => toObjectID(program._id))}},
                    }, {$count: "count"}],
                    intelligence_rows: [{
                        $match: {program_id: {$in: programs.filter(program => program.is_next_generation === PROGRAM_BOUNTY_TYPE.INTELLIGENCE_DISCOVERY).map(program => toObjectID(program._id))}},
                    }, {$sort: {severity: -1, submit_date_time: -1}},
                        {$skip: (page - 1) * showPerPage},
                        {$limit: showPerPage},
                        {$project: {_id: 1, severity: 1, title: 1}}]
                }
            }
        ]).exec();
    }

    setApprovedReportsResponse(reports, showPerPage, page, group_by_program_type) {
        let result = [
            {label: "all", title: "All", reports: {rows: [], total_rows: 0, total_pages: 0, current_page: 0}},
            {
                label: "bug_bounty",
                title: "Bug Bounty",
                reports: {rows: [], total_rows: 0, total_pages: 0, current_page: 0}
            },
            {label: "next_gen", title: "Next Gen", reports: {rows: [], total_rows: 0, total_pages: 0, current_page: 0}},
            {
                label: "intelligence",
                title: "Intelligence",
                reports: {rows: [], total_rows: 0, total_pages: 0, current_page: 0}
            }
        ];
        if (!group_by_program_type) {
            result = [
                {label: "all", title: "All", reports: {rows: [], total_rows: 0, total_pages: 0, current_page: 0}},
            ];
        }
        if (reports && reports[0]) {
            result.forEach(item => {
                switch (item.label) {
                    case 'all' :
                        this.setApproveReportsByProgramType(reports, item, "all", showPerPage, page);
                        break;
                    case 'bug_bounty' :
                        this.setApproveReportsByProgramType(reports, item, "bug_bounty", showPerPage, page);
                        break;
                    case 'next_gen' :
                        this.setApproveReportsByProgramType(reports, item, "next_gen", showPerPage, page);
                        break;
                    case 'intelligence' :
                        this.setApproveReportsByProgramType(reports, item, "intelligence", showPerPage, page);
                        break;
                }
            });
        }
        return result;
    }

    async getAllValidPrograms(company_user_id) {
        return await SchemaModels.ProgramModel.find({$and: [{company_user_id}, {$or: [{status: PROGRAM_STATUS.APPROVED}, {status: PROGRAM_STATUS.CLOSE}]}]})
            .select({_id: 1, is_next_generation: 1}).lean();
    }

    async getApprovedReportList(company_user_id, page, parent_user_id, access_program_list) {
        let programs = await this.getAllValidPrograms(company_user_id);
        if (!(programs && programs.length > 0)) {
            return [];
        }
        if (parent_user_id && access_program_list && access_program_list.length > 0) {
            const access_program_ids = access_program_list.map(access_program => access_program._id.toString());
            programs = programs.filter(program => access_program_ids.includes(program._id.toString()));
        }
        const group_by_program_type = programs.map(program => program.is_next_generation).filter((value, index, self) => self.indexOf(value) === index).length > 1;
        const result = {group_by_program_type};
        const showPerPage = 10;
        const reports = await this.getApprovedReports(programs, page, showPerPage);
        result.approved_reports_list = this.setApprovedReportsResponse(reports, showPerPage, page, group_by_program_type);
        return result;
    }

    getStatus(status) {
        let ret = '';
        switch (status) {
            case 1:
                ret = 'Pending';
                break;
            case 2:
                ret = 'Modification';
                break;
            case 3:
                ret = 'Triage';
                break;
            case 4:
                ret = 'Approve';
                break;
            case 5:
                ret = 'Reject';
                break;
            case 6:
                ret = 'Duplicate';
                break;
            case 7:
                ret = 'Resolved';
                break;
            case 8:
                ret = 'Not Applicable';
                break;

        }

        return ret;
    }

    getSeverity(s) {
        let ret = '';
        switch (s) {
            case 0:
                ret = 'None';
                break;
            case 1:
                ret = 'Low';
                break;
            case 2:
                ret = 'Medium';
                break;
            case 3:
                ret = 'High';
                break;
            case 4:
                ret = 'Critical';
                break;

        }

        return ret;
    }

    getIsClose(isClose) {
        let ret = '';
        switch (isClose) {
            case 1:
                ret = 'Active';
                break;
            case 0:
                ret = 'Close';
                break;
        }

        return ret;
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

    async changeSeverity(user, report_id, severity, score, parent_user_id, access_program_list) {
        if (!isObjectID(getUserId(user))) {
            return 1;
        }

        if (!isObjectID(report_id)) {
            return 2;
        }
        severity = toNumber(severity);
        if (severity < 0 || severity > 5) {
            return 3;
        }

        const result = await this.collection.findOne({"_id": report_id}, {
            _id: 0,
            hacker_user_id: 1,
            is_close: 1,
            severity_score: 1,
            program_id: 1,
            status: 1,
            severity: 1
        })
            .populate({
                path: 'hacker_user_id',
                select: {report_notification_setting: 1, _id: 1, fn: 1}
            }).populate({
                path: 'program_id',
                match: {company_user_id: getUserId(user)},
                select: {is_verify: 1, company_user_id: 1, is_next_generation: 1, _id: 1},
                populate: {
                    path: 'company_user_id',
                    select: {is_fully_manage: 1, _id: 1}
                }
            });
        if (!result) {
            return 4;
        }
        if (result.severity === severity) {
            return 3;
        }
        if (result.is_close === 0) {
            return 5;
        }
        if (!result.program_id) {
            return 6;
        }
        if (!result.program_id.is_verify) {
            return 7;
        }

        if (result.program_id.company_user_id && result.program_id.company_user_id.is_fully_manage) {
            return 8;
        }
        if (parent_user_id && access_program_list && access_program_list.length > 0 &&
            !access_program_list.map(p => p._id.toString()).includes(result.program_id._id.toString())) {
            return 9;
        }
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
        await this.collection.updateOne({"_id": report_id}, {
            $set: {
                last_modify_date_time: getDateTime(),
                severity,
                severity_score
            }
        });

        await this.sendNotificationBaseOnSetting("update_report", result.program_id._id, report_id, result.hacker_user_id._id,
            severity, result.hacker_user_id.report_notification_setting, REPORT_NOTIFICATION_TYPE.SUBMIT_COMMENT);
        if (result.hacker_user_id.report_notification_setting &&
            isArray(result.hacker_user_id.report_notification_setting.update_report_advance) &&
            result.hacker_user_id.report_notification_setting.update_report_advance.includes(severity)) {
            if (result.hacker_user_id.report_notification_setting.update_report === NORIFICATION_SETTING.WEB ||
                result.hacker_user_id.report_notification_setting.update_report === NORIFICATION_SETTING.EMAIL_WEB) {
                const notification = await this.createNotification("Report Severity",
                    `${result.hacker_user_id.fn}, The severity of your report has changed to ${this.getSeverity(severity)}`,
                    FIELD_TYPE.SEVERITY, result.hacker_user_id._id, MESSAGE_TYPE.INFO, user._id, report_id,
                    ACTION_TYPE.UPDATE, RESOURCE_TYPE.REPORT);

                this.sendNotification("notification", result.hacker_user_id._id, notification.title,
                    notification.text, notification.register_date_time, notification.message_type, notification.resource_type,
                    notification._id, notification.report_id);
            }
        }


        const comment = {
            "company_user_id": user._id,
            "report_id": report_id,
            "send_date_time": getDateTime(),
            "comment": `Change severity to  ${this.getSeverity(severity)}`,
            "send_type": 2,
            "reading_status": {
                read_by_moderator: [],
                read_by_hacker: false,
                read_by_company: [user._id]
            },
            "type": 2
        };

        SchemaModels.CommentSubmitReportModel.create(comment);
        const fields = [
            {key: "severity", old_value: result.severity, new_value: severity},
            {key: "severity_score", old_value: result.severity_score, new_value: severity_score}
        ];
        if (result.status === REPORT_STATUS.APPROVE || result.status === REPORT_STATUS.RESOLVED) {
            if (result.program_id.company_user_id._id) {
                const socket_data = this.setCountReport(severity, result.severity);
                this.sendReportCountNotification(result.program_id.company_user_id._id, socket_data, result.program_id.is_next_generation, result.status);
            }
        }
        const history_model = {
            sender_type: SENDER_TYPE.COMPANY,
            activity: ACTIVITY_TEXT_LOG.CHANGE_SEVERITY,
            sender_id: user._id,
            type: HISTORY_TYPE.REPORT_CHANGE,
            resource_type: RESOURCE_TYPE.REPORT,
            resource_id: report_id,
            fields,
            register_date_time: getDateTime()
        };
        await SchemaModels.HistoryModel.create(history_model);
        return comment;
    }

    async sendNotificationBaseOnSetting(setting_key_name, program_id, report_id, hacker_user_id, severity, hacker_report_notifications_setting, type, is_internal) {
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
                    d.report_notification_setting[setting_key_name] === NORIFICATION_SETTING.EMAIL_WEB))
            if (companies) {
                companyUserIds = companies.map(d => d._id);
            }

            const moderators = program[0].moderator_users;
            if (moderators && isArray(moderators)) {
                moderatorUserIds = moderators.map(d => d.moderator_user_id);
            }
        }
        let data = [];
        if ((!is_internal || type !== REPORT_NOTIFICATION_TYPE.SUBMIT_COMMENT) && hacker_report_notifications_setting && isArray(hacker_report_notifications_setting[setting_key_name_advance]) && hacker_report_notifications_setting[setting_key_name_advance].includes(severity) &&
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
        companyUserIds.forEach(id => {
            data.push({
                "program_id": program_id,
                "report_id": report_id,
                "company_user_id": id,
                "type": type,
                "register_date_time": getDateTime(),
            })
        });
        moderatorUserIds.forEach(id => {
            data.push({
                "program_id": program_id,
                "report_id": report_id,
                "moderator_user_id": id,
                "type": type,
                "register_date_time": getDateTime(),
            })
        });

        await SchemaModels.ReportNotificationModel.insertMany(
            data
        );
    }

    async changeStatus(user, report_id, status, parent_user_id, access_program_list) {
        if (!isObjectID(getUserId(user))) {
            return 1;
        }

        if (!isObjectID(report_id)) {
            return 2;
        }
        status = toNumber(status);
        if (status < 1 || status > 9) {
            return 3;
        }

        const result = await this.collection.findOne({"_id": report_id}, {
            _id: 0,
            is_close: 1,
            program_id: 1,
            severity: 1,
            status: 1,
            hacker_user_id: 1
        })
            .populate({
                path: 'hacker_user_id',
                select: {report_notification_setting: 1, _id: 1, fn: 1}
            }).populate({
                path: 'program_id',
                match: {company_user_id: getUserId(user)},
                select: {is_verify: 1, company_user_id: 1, is_next_generation: 1, _id: 1},
                populate: {
                    path: 'company_user_id',
                    select: {is_fully_manage: 1, _id: 1}
                }
            });
        if (!result) {
            return 4;
        }
        if (result.status === status) {
            return 3;
        }

        if (!result.program_id) {
            return 6;
        }
        if (!result.program_id.is_verify) {
            return 7;
        }
        if (!((result.status === REPORT_STATUS.APPROVE && status === REPORT_STATUS.RESOLVED) ||
            (result.status === REPORT_STATUS.RESOLVED && status === REPORT_STATUS.APPROVE))) {
            if (result.is_close === 0) {
                return 5;
            }
            if (result.program_id.company_user_id && result.program_id.company_user_id.is_fully_manage) {
                return 8;
            }
            if (parent_user_id && access_program_list && access_program_list.length > 0 &&
                !access_program_list.map(p => p._id.toString()).includes(result.program_id._id.toString())) {
                return 9;
            }
        }

        await this.collection.updateOne({"_id": report_id}, {
            $set: {
                last_modify_date_time: getDateTime(),
                status: status
            }
        });
        const comment = {
            "company_user_id": user._id,
            "report_id": report_id,
            "send_date_time": getDateTime(),
            "comment": `Change status to ${this.getStatus(status)}`,
            "send_type": 2,
            "reading_status": {
                read_by_moderator: [],
                read_by_hacker: false,
                read_by_company: [user._id]
            },
            "type": 2
        };
        SchemaModels.CommentSubmitReportModel.create(comment);
        // const history_model = {
        //     sender_type: SENDER_TYPE.COMPANY,
        //     activity:ACTIVITY_TEXT_LOG.CHANGE_STATUS,
        //     sender_id:user._id,
        //     type:HISTORY_TYPE.REPORT_CHANGE,
        //     resource_type:RESOURCE_TYPE.REPORT,
        //     resource_id:report_id,
        //     fields:[{key:"status",old_value:result.status,new_value:status}],
        //     register_date_time:getDateTime()
        // };
        // await SchemaModels.HistoryModel.create(history_model);
        await this.sendNotificationBaseOnSetting("update_report", result.program_id._id, report_id, result.hacker_user_id._id,
            result.severity, result.hacker_user_id.report_notification_setting, REPORT_NOTIFICATION_TYPE.CHANGE_STATUS_REPORT);
        if (result.hacker_user_id.report_notification_setting &&
            isArray(result.hacker_user_id.report_notification_setting.update_report_advance) &&
            result.hacker_user_id.report_notification_setting.update_report_advance.includes(result.severity)) {
            if (result.hacker_user_id.report_notification_setting.update_report === NORIFICATION_SETTING.WEB ||
                result.hacker_user_id.report_notification_setting.update_report === NORIFICATION_SETTING.EMAIL_WEB) {
                const notification = await this.createNotification("Report Status",
                    `${result.hacker_user_id.fn}, Admin has changed your report status to ${this.getStatus(status)}`,
                    FIELD_TYPE.STATUS, result.hacker_user_id._id, MESSAGE_TYPE.INFO, user._id, report_id,
                    ACTION_TYPE.UPDATE, RESOURCE_TYPE.REPORT);

                this.sendNotification("notification", result.hacker_user_id._id, notification.title,
                    notification.text, notification.register_date_time, notification.message_type, notification.resource_type,
                    notification._id, notification.report_id);
            }
        }
        let socket_data = undefined;
        let socket_data_status = undefined;
        if (result.program_id.company_user_id._id) {
            if (status === REPORT_STATUS.APPROVE) {
                socket_data_status = status;
                socket_data = this.setCountReport(result.severity, undefined);
            } else if (result.status === REPORT_STATUS.APPROVE) {
                socket_data_status = result.status;
                socket_data = this.setCountReport(undefined, result.severity);
            }
            if (socket_data) {
                await this.sendReportCountNotification(result.program_id.company_user_id._id, socket_data, result.program_id.is_next_generation, socket_data_status);
            }
        }
        socket_data = undefined;
        if (result.program_id.company_user_id._id) {
            if (status === REPORT_STATUS.RESOLVED) {
                socket_data_status = status;
                socket_data = this.setCountReport(result.severity, undefined);
            } else if (result.status === REPORT_STATUS.RESOLVED) {
                socket_data_status = result.status;
                socket_data = this.setCountReport(undefined, result.severity);
            }
            if (socket_data) {
                await this.sendReportCountNotification(result.program_id.company_user_id._id, socket_data, result.program_id.is_next_generation, socket_data_status);
            }
        }
        return comment;
    }

    decodeHtmlToJira(text) {
        if (!text) return "";
        const pw = "&lt;p&gt;&amp;nbsp;&lt;/p&gt;";
        const h2w = "&lt;h2&gt;&amp;nbsp;&lt;/h2&gt;";
        const h3w = "&lt;h3&gt;&amp;nbsp;&lt;/h3&gt;";
        const h4w = "&lt;h4&gt;&amp;nbsp;&lt;/h4&gt;";
        let converter = new HTML2Jira();
        //  return converter.toJira(text2html(text).replaceAll(`${pw}${pw}${pw}${pw}${pw}`, `${pw}`).replaceAll(`${pw}${pw}${pw}${pw}`, `${pw}`).replaceAll(`${pw}${pw}${pw}`, `${pw}`).replaceAll(`${pw}${pw}`, `${pw}`).replaceAll(`${pw}${pw}`, `${pw}`).replaceAll(`${h2w}`, "").replaceAll(`${h3w}`, "").replaceAll(`${h4w}`, ""));
        return converter.toJira(text2html(text)
            .replace(`${pw}${pw}${pw}${pw}${pw}`, `${pw}`).replace(`${pw}${pw}${pw}${pw}`, `${pw}`).replace(`${pw}${pw}${pw}`, `${pw}`).replace(`${pw}${pw}`, `${pw}`).replace(`${pw}${pw}`, `${pw}`).replace(`${h2w}`, "").replace(`${h3w}`, "").replace(`${h4w}`, "")
            .replace(/&nbsp;|&zwnj;|&raquo;|&laquo;|&gt;/g, ' '));
    }

    async getJiraResponse(request) {
        return await axios.request(request).then(async (response) => {
            return {response: response.data, jira_error: false};
        }).catch(error => {
            let message = "";
            if (error.response) {
                if (error.response.status === 401) message = 'Jira Authentication is Unauthorized!';
                if (error.response.status === 403) message = 'You have not permission for this Jira!';
                if (error.response.status === 404) message = 'Jira Api is not found!';
                if (error.response.status === 413) message = 'The attachments exceed the maximum attachment size for issues!';
                if (error.response.status === 500) message = 'Something went wrong!';
                if (error.response.status === 400) {
                    if (error.response.data &&
                        error.response.data.errorMessages &&
                        error.response.data.errorMessages.length > 0) {
                        message = Object.values(error.response.data.errorMessages)[0];
                    } else if (error.response.data &&
                        error.response.data.errors) {
                        message = Object.values(error.response.data.errors)[0];
                    } else {
                        message = 'Something went wrong!';
                    }
                }
            }

            return {response: message || 'Something went wrong!', jira_error: true};
        });
    }

    async issuedToJira(user, report_id, jira_project_ids) {
        const company_user_id = getUserId(user);
        const filters = {_id: report_id};
        if (user.parent_user_id && user.access_program_list && user.access_program_list.length > 0) {
            filters.program_id = {$in: user.access_program_list.map(p => p._id)};
        }
        const report = await this.collection.findOne(filters)
            .populate({
                path: 'program_id',
                match: {company_user_id},
                select: {_id: 1, targets: 1}
            }).populate("vulnerability_type_id");

        if (!report) return 2;
        if (!report.program_id) return 3;
        if (report.status !== REPORT_STATUS.APPROVE &&
            report.status !== REPORT_STATUS.RESOLVED) return 4;

        const jira_integrations = await SchemaModels.IntegrationModel.find({
            company_user_id,
            type: INTEGRATION_TYPE.JIRA,
            "programs._id": report.program_id,
            project_id: {$in: jira_project_ids},
            status: INTEGRATION_AUTH_STATUS.ACTIVE
        }).populate({
            path: 'integration_authentication_id',
            select: {oauth_token: 1, url: 1, shared_secret: 1}
        }).select({
            integration_authentication_id: 1,
            property_mappings: 1,
            priority_mappings: 1,
            project_id: 1,
            issue_id: 1,
            _id: 1,
            programs: 1
        });

        if (!isArray(jira_integrations) || jira_integrations.length === 0) return 1;

        let response = {};
        let more_than_max_length_property = '';
        for (let i = 0; i < jira_integrations.length; i++) {
            const integration = jira_integrations[i];
            if (integration.integration_authentication_id &&
                integration.integration_authentication_id.shared_secret &&
                integration.integration_authentication_id.url &&
                integration.integration_authentication_id.oauth_token
            ) {
                const authentication = integration.integration_authentication_id;
                const shared_secret = decryptedToken(OAUTH_1A.SECRET_KEY, company_user_id.toString(), authentication.shared_secret);
                const oauth_token = decryptedToken(OAUTH_1A.SECRET_KEY, shared_secret, authentication.oauth_token);
                let priority;
                if (isArray(integration.priority_mappings) &&
                    integration.priority_mappings.length > 0) {
                    priority = integration.priority_mappings.find(priority => priority.sb_key === report.severity);
                    if (!priority) priority = integration.priority_mappings[0];
                    priority = priority.jira_key;
                }
                if (report.program_id &&
                    report.program_id.targets &&
                    report.program_id.targets.length > 0) {
                    let find_current_target = report.program_id.targets.find(d => d._id.toString() === report.target_id.toString());
                    if (find_current_target) report.target = find_current_target.identifier;
                }
                report.vulnerability_type = report.vulnerability_type_id ? report.vulnerability_type_id.title : "";
                const data = {
                    "update": {},
                    "fields": {
                        "project": {
                            "id": integration.project_id
                        },
                        "issuetype": {
                            "id": integration.issue_id
                        },
                        "labels": [
                            "bug"
                        ],
                        "duedate": getDateTime(),
                    }
                };
                if (priority) {
                    data.fields.priority = {
                        "id": priority
                    }
                }
                if (isArray(integration.property_mappings) &&
                    integration.property_mappings.length > 0) {
                    integration.property_mappings.forEach(property => {
                        if (property.sb_key === "proof_concept" || property.sb_key === "proof_recommendation") {
                            data.fields[property.jira_key] = this.decodeHtmlToJira(report[property.sb_key]);
                        } else if (property.sb_key === "target" || property.sb_key === "proof_url") {
                            data.fields[property.jira_key] = report[property.sb_key] ? report[property.sb_key].startsWith("http") ? report[property.sb_key].replaceAll(" ", "") : `https://${report[property.sb_key].replaceAll(" ", "")}` : "";
                        } else {
                            data.fields[property.jira_key] = report[property.sb_key];
                        }
                    });
                }
                if (!data.fields.summary) {
                    data.fields.summary = report.title;
                }
                const jira_issue_request = createRequestForJiraApis(
                    `${authentication.url}/rest/api/2/issue`,
                    'POST',
                    {oauth_token: oauth_token}
                );
                const max_length = 32765;
                for (let key in data.fields) {
                    if (data.fields[key].length > max_length) {
                        data.fields[key] = data.fields[key].substr(0, max_length);
                        if (integration.property_mappings && integration.property_mappings.length > 0) {
                            const property = integration.property_mappings.find(i => i.jira_key === key);
                            if (property && property.jira_title && more_than_max_length_property.indexOf(property.jira_title) === -1) more_than_max_length_property += `${property.jira_title}, `;
                        }
                    }
                }
                jira_issue_request.data = data;
                const jira_issue = await this.getJiraResponse(jira_issue_request);
                if (jira_issue.jira_error) {
                    response = jira_issue;
                    break;
                }
                await SchemaModels.IntegrationModel.updateOne({_id: integration._id}, {
                    $addToSet: {reports: report._id}
                });
                if (jira_issue.response &&
                    jira_issue.response.id &&
                    report.report_files &&
                    report.report_files.length > 0) {
                    for (let i = 0; i < report.report_files.length; i++) {
                        const report_file = report.report_files[i];
                        const filePath = report_file.file_name;
                        const directory_file = path.join(__dirname, `../../../media/${filePath}`);
                        fs.access(directory_file, fs.F_OK, async (err) => {
                            if (err) return;

                            const form = new FormData();
                            const stats = fs.statSync(directory_file);
                            const fileSizeInBytes = stats.size;
                            const fileStream = fs.createReadStream(directory_file);
                            form.append('file', fileStream, {
                                knownLength: fileSizeInBytes,
                                filename: report_file.file_original_name,
                                contentType: report_file.file_original_name ? report_file.file_original_name.split('.').pop() : ""
                            });

                            const jira_issue_attachments_request = createRequestForJiraApis(
                                `${authentication.url}/rest/api/2/issue/${jira_issue.response.id}/attachments`,
                                'POST',
                                {oauth_token: oauth_token}
                            );
                            jira_issue_attachments_request.data = form;
                            const new_headers = {...form.getHeaders()};
                            Object.keys(new_headers).forEach(key => {
                                jira_issue_attachments_request.headers[key] = new_headers[key]
                            });
                            jira_issue_attachments_request.headers['X-Atlassian-Token'] = 'no-check';
                            await this.getJiraResponse(jira_issue_attachments_request);
                        });
                    }
                }
            }
        }
        if (more_than_max_length_property.length > 0) {
            response.more_than_max_length_property = more_than_max_length_property
        }
        return response;
    }

    async setReferenceId(user, report_id, reference_id, parent_user_id, access_program_list) {
        const report = await this.collection.findOne({_id: report_id}, {
            _id: 0,
            is_close: 1,
            program_id: 1,
            severity: 1,
            status: 1,
            hacker_user_id: 1
        }).populate({
            path: 'program_id',
            match: {company_user_id: getUserId(user)},
            select: {is_verify: 1, company_user_id: 1, _id: 1},
            populate: {
                path: 'company_user_id',
                select: {is_fully_manage: 1, _id: 1}
            }
        });
        if (!report) {
            return 4;
        }

        if (!report.program_id) {
            return 5;
        }
        if (!report.program_id.is_verify) {
            return 6;
        }

        if (report.program_id.company_user_id && report.program_id.company_user_id.is_fully_manage) {
            return 7;
        }
        if (parent_user_id && access_program_list && access_program_list.length > 0 &&
            !access_program_list.map(p => p._id.toString()).includes(report.program_id._id.toString())) {
            return 10;
        }
        if (reference_id) {
            const reference_report = await this.collection.findOne({_id: reference_id}).select({status: 1});
            if (!reference_report) {
                return 8;
            }
            if (reference_report.status !== REPORT_STATUS.APPROVE && reference_report.status !== REPORT_STATUS.RESOLVED) {
                return 9;
            }
            await this.collection.updateOne({_id: report_id}, {$set: {reference_id}});
        } else {
            await this.collection.updateOne({_id: report_id}, {$unset: {reference_id: 1}});
        }
    }

    async changeReportActivity(user, report_id, is_close, parent_user_id, access_program_list) {
        if (!isObjectID(getUserId(user))) {
            return 1;
        }

        if (!isObjectID(report_id)) {
            return 2;
        }
        is_close = toNumber(is_close);
        if (is_close < 0 || is_close > 1) {
            return 3;
        }

        const result = await this.collection.findOne({"_id": report_id}, {
            _id: 0,
            is_close: 1,
            program_id: 1,
            hacker_user_id: 1,
            severity: 1
        }).populate({
            path: 'hacker_user_id',
            select: {report_notification_setting: 1, _id: 1, fn: 1}
        }).populate({
            path: 'program_id',
            match: {company_user_id: getUserId(user)},
            select: {is_verify: 1, company_user_id: 1, _id: 1},
            populate: {
                path: 'company_user_id',
                select: {is_fully_manage: 1, _id: 0}
            }
        });
        if (!result) {
            return 4;
        }
        if (result.is_close === is_close) {
            return 3;
        }
        if (!result.program_id) {
            return 5;
        }
        if (!result.program_id.is_verify) {
            return 6;
        }

        if (result.program_id.company_user_id && result.program_id.company_user_id.is_fully_manage) {
            return 7;
        }
        if (parent_user_id && access_program_list && access_program_list.length > 0 &&
            !access_program_list.map(p => p._id.toString()).includes(result.program_id._id.toString())) {
            return 8;
        }
        await this.collection.updateOne({"_id": report_id}, {
            $set: {
                last_modify_date_time: getDateTime(),
                is_close: is_close
            }
        });
        const comment = {
            "company_user_id": user._id,
            "report_id": report_id,
            "send_date_time": getDateTime(),
            "comment": `Change report Activity to  ${this.getIsClose(is_close)}`,
            "send_type": 2,
            "reading_status": {
                read_by_moderator: [],
                read_by_hacker: false,
                read_by_company: [user._id]
            },
            "type": 2
        };
        SchemaModels.CommentSubmitReportModel.create(comment);
        // const history_model = {
        //     sender_type: SENDER_TYPE.COMPANY,
        //     activity:ACTIVITY_TEXT_LOG.CHANGE_ACTIVITY,
        //     sender_id:user._id,
        //     type:HISTORY_TYPE.REPORT_CHANGE,
        //     resource_type:RESOURCE_TYPE.REPORT,
        //     resource_id:report_id,
        //     fields:[{key:"is_close",old_value:result.is_close,new_value:is_close}],
        //     register_date_time:getDateTime()
        // };
        // await SchemaModels.HistoryModel.create(history_model);
        await this.sendNotificationBaseOnSetting("update_report", result.program_id._id, report_id, result.hacker_user_id._id,
            result.severity, result.hacker_user_id.report_notification_setting, REPORT_NOTIFICATION_TYPE.SUBMIT_COMMENT);
        if (result.hacker_user_id.report_notification_setting &&
            isArray(result.hacker_user_id.report_notification_setting.update_report_advance) &&
            result.hacker_user_id.report_notification_setting.update_report_advance.includes(result.severity)) {
            if (result.hacker_user_id.report_notification_setting.update_report === NORIFICATION_SETTING.WEB ||
                result.hacker_user_id.report_notification_setting.update_report === NORIFICATION_SETTING.EMAIL_WEB) {
                const notification = await this.createNotification("Report Status",
                    `${result.hacker_user_id.fn}, Admin has changed your report status to ${is_close === REPORT_ACTIVITY.OPEN ? "active" : "closed"}`,
                    FIELD_TYPE.ACTIVITY, result.hacker_user_id._id, MESSAGE_TYPE.INFO, user._id, report_id,
                    ACTION_TYPE.UPDATE, RESOURCE_TYPE.REPORT);

                this.sendNotification("notification", result.hacker_user_id._id, notification.title,
                    notification.text, notification.register_date_time, notification.message_type,
                    notification.resource_type, notification._id, notification.report_id);
            }
        }
        return comment;
    }

    async setReportNotifications(program_id, report_id, hacker_user_id, severity, hacker_report_notifications_types, type) {
        const result = await SchemaModels.ProgramModel.aggregate([
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
                            $project: {"report_notification_type": 1}
                        }
                    ],
                    as: "company_users"
                }
            },
            {
                $project: {
                    "_id": 0,
                    "company_users": 1,
                    "moderator_users": 1,
                }
            },
        ]).exec();
        let companyUserIds = [];
        let moderatorUserIds = [];
        if (result && result[0]) {
            const companies = result[0].company_users.filter(d => d.report_notification_type && d.report_notification_type.includes(severity));
            if (companies) {
                companyUserIds = companies.map(d => d._id);
            }
            const moderators = result[0].moderator_users;
            if (moderators && isArray(moderators)) {
                moderatorUserIds = moderators.map(d => d.moderator_user_id);
            }

        }
        let data = [];
        if (hacker_report_notifications_types && isArray(hacker_report_notifications_types) && hacker_report_notifications_types.includes(severity)) {
            data.push({
                "program_id": program_id,
                "hacker_user_id": hacker_user_id,
                "report_id": report_id,
                "type": type,
                "register_date_time": getDateTime()
            });
        }
        companyUserIds.forEach(id => {
            data.push({
                "program_id": program_id,
                "report_id": report_id,
                "company_user_id": id,
                "type": type,
                "register_date_time": getDateTime(),
            })
        });
        moderatorUserIds.forEach(id => {
            data.push({
                "program_id": program_id,
                "report_id": report_id,
                "moderator_user_id": id,
                "type": type,
                "register_date_time": getDateTime(),
            })
        });

        await SchemaModels.ReportNotificationModel.insertMany(
            data
        );
    }

    async getReportForNotification(user_id, report_id) {
        if (!isObjectID(user_id)) {
            return "1";
        }
        if (!isObjectID(report_id)) {
            return "2";
        }
        const result = await this.collection.aggregate([
            {
                $match: {_id: mongoose.Types.ObjectId(report_id)},
            },
            {
                $lookup: {
                    from: "programs",
                    localField: "program_id",
                    foreignField: "_id",
                    as: "program_id",
                },
            },
            {
                $lookup: {
                    from: "hacker_users",
                    localField: "hacker_user_id",
                    foreignField: "_id",
                    as: "hacker_user_id",
                },
            },
            {
                "$unwind": "$hacker_user_id"
            },
            {
                "$unwind": "$program_id"
            },
            {
                $match: {
                    "program_id.company_user_id": user_id,
                },
            },
            {
                $project: {
                    "severity": 1,
                    "program_id": {"_id": 1},
                    "hacker_user_id": {"_id": 1, "report_notification_setting": 1, "fn": 1},
                    "vulnerability_type_id": {"title": 1},
                }
            }
        ]).exec();

        return result[0];
    }

    async createNotification(title, text, field_type, hacker_user_id, message_type, company_user_id, report_id, action_type, resource_type) {
        const notification = {
            title,
            text,
            status: NOTIFICATION_STATUS.SEND,
            register_date_time: getDateTime(),
            sender_type: SENDER_TYPE.COMPANY,
            field_type,
            resource_type,
            action_type,
            message_type,
            company_user_id,
            report_id,
            hacker_user_id
        };
        return SchemaModels.NotificationModel.create(notification);
    }

    sendNotification(emit_name, id, title, text, date, message_type, resource_type, notification_id, report_id) {
        if (hackerIO && hackerIO["sockets"] && hackerIO["sockets"].size > 0 && hackerIO["to"]) {
            const sockets_info = convertSetOrMapToArray(hackerIO["sockets"]);
            sockets_info.length > 0 && sockets_info.forEach(s => {
                if (s.data && s.data._id && s.data._id.toString() === id.toString()) {
                    hackerIO["to"](s.id.toString()).emit(emit_name, {
                        title,
                        text,
                        date,
                        message_type,
                        resource_type,
                        report_id,
                        id: notification_id
                    });
                }
            });
        }
    }

    async createModeratorsNotification(title, field_type, moderators, message_type, company_user_id, report_id, action_type, resource_type) {
        const notifications = [];
        moderators.forEach(c => {
            let text = "";
            if (resource_type === RESOURCE_TYPE.COMMENT) {
                text = `${c.alias || c.fn}, The company has added a comment on a report`;
            }

            const notification = {
                title,
                text,
                status: NOTIFICATION_STATUS.SEND,
                register_date_time: getDateTime(),
                sender_type: SENDER_TYPE.COMPANY,
                field_type,
                resource_type,
                action_type,
                message_type,
                company_user_id,
                report_id,
                moderator_user_id: c._id
            };
            notifications.push(notification);
        });
        return SchemaModels.NotificationModel.insertMany(notifications);
    }

    sendModeratorsNotification(emit_name, notifications) {
        if (adminIO && adminIO["sockets"] && adminIO["sockets"].size > 0 && adminIO["to"]) {
            const sockets_info = convertSetOrMapToArray(adminIO["sockets"]);
            if (sockets_info.length > 0) {
                sockets_info.forEach(s => {
                    if (s.data && s.data._id) {
                        const notification = notifications.find(n => n.moderator_user_id.toString() === s.data._id.toString());
                        if (notification) {
                            adminIO["to"](s.id.toString()).emit(emit_name, {
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

    async getAssignedModerators(report_id) {
        const report = await this.collection.findOne({_id: report_id})
            .populate({
                path: "program_id",
                select: {moderator_users: 1},
            }).select({program_id: 1}).lean();
        let assigned_moderator_ids = [];
        if (report.program_id && isArray(report.program_id.moderator_users)) {
            assigned_moderator_ids = report.program_id.moderator_users.map(d => d.moderator_user_id);
        }
        return await SchemaModels.ModeratorUserModel.aggregate([
            {
                $match: {
                    $and: [{status: true}, {
                        $or: [{user_level_access: toNumber(ADMIN_ROLES.ADMIN)},
                            {_id: {$in: assigned_moderator_ids.map(id => mongoose.Types.ObjectId(id))}}]
                    }]
                }
            },
            {$project: {fn: 1, ln: 1, alias: 1, _id: 1}}
        ]);
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

    setCountReport(add, subtract) {
        const count_report = {L: 0, M: 0, H: 0, C: 0};
        if (add) {
            switch (add) {
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
        if (subtract) {
            switch (subtract) {
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

    async getApproveReportsCount(company_user_id, parent_user_id, access_program_list) {
        let programs = await SchemaModels.ProgramModel.find({company_user_id}).select({_id: 1});
        if (programs && programs.length > 0 && parent_user_id && access_program_list && access_program_list.length > 0) {
            const access_program_ids = access_program_list.map(access_program => access_program._id.toString());
            programs = programs.filter(program => access_program_ids.includes(program._id.toString()));
        }
        return await SchemaModels.SubmitReportModel.countDocuments({
            status: REPORT_STATUS.APPROVE,
            program_id: {$in: programs.map(program => program._id)}
        });
    }
}

module.exports = new SubmitReportCompanyModel();
