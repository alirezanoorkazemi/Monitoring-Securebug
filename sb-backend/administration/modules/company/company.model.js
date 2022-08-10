const {checkCurrencyId, checkCountryId, checkUserAccess} = require('../../init');
const {ErrorHelper} = require('../../../libs/error.helper');
const {ftSearch, delete_by_key, makeHash} = require('../../../libs/token.helper');
const {getDateTime, getUtcLessDateTime, getYear} = require('../../../libs/date.helper');
const {
    PROGRAM_STATUS, STATIC_VARIABLES, ADMIN_ROLES, NOTIFICATION_STATUS,
    MESSAGE_TYPE, SENDER_TYPE, RESOURCE_TYPE, TWO_FA_STATUS, ROLES,
    REPORT_SEVERITY, ACTION_TYPE, FIELD_TYPE, REPORT_STATUS, PROGRAM_BOUNTY_TYPE,
    INTEGRATION_AUTH_STATUS
} = require('../../../libs/enum.helper');
const companyIO = require("../../../io/company");
const {
    setPaginationResponse, sendMail, convertSetOrMapToArray, toObjectID, isArray,
    hasValue, isObjectID, toNumber, getMonthNameByNumber, isUndefined
} = require('../../../libs/methode.helper');

class CompanyUserModel {
    constructor() {
        this.collection = SchemaModels.CompanyUserModel;
    }

    async getCompany(_id) {
        return await this.collection.findOne({_id});
    }

    async updateAvatar(_id, avatar_file) {
        await this.collection.updateOne({_id}, {$set: {avatar_file}});
    }


    async userTrendChart() {
        let yearsData = await this.collection.aggregate([
            {
                $group: {
                    _id: {
                        year: {$year: "$register_date_time"},
                        month: {$month: "$register_date_time"}
                    },
                    user_count: {$sum: 1}
                }
            },
            {
                $group: {
                    _id: "$_id.year",
                    year: {$first: "$_id.year"},
                    monthes: {$push: "$$ROOT"},
                }
            },
            {
                $sort: {
                    year: 1
                }
            }
        ]).exec();
        let result = [];
        yearsData = yearsData.filter(data => !!data._id);
        const has_current_year = yearsData.find(data => data._id.toString() === "2022");
        if (!has_current_year) {
            yearsData.push({year: 2022, monthes: []});
        }
        for (let data of yearsData) {
            const item = {year: data.year};
            let months = [];
            item.monthes = [];
            for (let month of data.monthes) {
                if (month && month._id) {
                    const monthNum = (month._id.month <= 9) ? '0' + month._id.month : '' + month._id.month;
                    months.push(monthNum);
                    month.monthName = getMonthNameByNumber(monthNum);
                    month.monthNumber = monthNum;
                    delete month._id;
                    item.monthes.push(month);
                }
            }
            for (let num = 1; num <= 12; num++) {
                let monthNum = (num <= 9) ? '0' + num : '' + num;
                let isFound = months.includes(monthNum);
                if (isFound)
                    continue;

                let month = {
                    user_count: 0,
                };
                month.monthName = getMonthNameByNumber(monthNum);
                month.monthNumber = monthNum;
                item.monthes.push(month);
            }
            item.monthes.sort((a, b) => a.monthNumber - b.monthNumber);
            result.push(item);
        }
        return result;
    }

    async getReportsCountGroupBySeverity(programs) {
        return await SchemaModels.SubmitReportModel.aggregate([
            {
                $match: {
                    $and: [
                        {program_id: {$in: programs.map(program => toObjectID(program._id))}},
                        {status: REPORT_STATUS.APPROVE}
                    ]
                }
            },
            {
                $group: {
                    _id: null,
                    L: {$sum: {$cond: [{$eq: ["$severity", REPORT_SEVERITY.LOW]}, 1, 0]}},
                    M: {$sum: {$cond: [{$eq: ["$severity", REPORT_SEVERITY.MEDIUM]}, 1, 0]}},
                    H: {$sum: {$cond: [{$eq: ["$severity", REPORT_SEVERITY.HIGH]}, 1, 0]}},
                    C: {$sum: {$cond: [{$eq: ["$severity", REPORT_SEVERITY.CRITICAL]}, 1, 0]}}
                }
            },
            {$project: {_id: 0, L: 1, M: 1, H: 1, C: 1}}
        ]).exec();
    }

    setReportsCountBySeverity(item, reports) {
        if (reports && reports[0]) {
            item.reports_count.forEach(report_count => {
                switch (report_count.key) {
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
                this.setReportsCountBySeverity(item, reports[0].all);
                break;
            case 'bug_bounty' :
                this.setReportsCountBySeverity(item, reports[0].bug_bounty);
                break;
            case 'next_gen' :
                this.setReportsCountBySeverity(item, reports[0].next_gen);
                break;
            case 'intelligence' :
                this.setReportsCountBySeverity(item, reports[0].intelligence);
                break;
        }
    }

    setReportsCountResponse(reports) {
        const result = [
            {
                label: "all",
                reports_count: [{key: "L", value: 0}, {key: "M", value: 0}, {key: "H", value: 0}, {key: "C", value: 0}]
            },
            {
                label: "bug_bounty",
                reports_count: [{key: "L", value: 0}, {key: "M", value: 0}, {key: "H", value: 0}, {key: "C", value: 0}]
            },
            {
                label: "next_gen",
                reports_count: [{key: "L", value: 0}, {key: "M", value: 0}, {key: "H", value: 0}, {key: "C", value: 0}]
            },
            {
                label: "intelligence",
                reports_count: [{key: "L", value: 0}, {key: "M", value: 0}, {key: "H", value: 0}, {key: "C", value: 0}]
            },
        ];
        if (reports && reports[0]) {
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

    async getDashboard(data) {
        const company = await this.collection.findOne({_id: data.id}).select({_id: 1});
        if (!company) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_FOUND, "company");
        }
        const programs = await SchemaModels.ProgramModel.find({company_user_id: company._id}).select({
            _id: 1,
            is_next_generation: 1
        }).lean();
        if (!(programs && programs.length > 0)) {
            return undefined;
        }
        if (data.approved_reports_count) {
            const reports_count = {L: 0, M: 0, H: 0, C: 0};
            const reports = await this.getReportsCountGroupBySeverity(programs);
            if (reports && reports[0]) {
                reports_count.L = reports[0].L;
                reports_count.M = reports[0].M;
                reports_count.H = reports[0].H;
                reports_count.C = reports[0].C;
            }
            return reports_count;
        } else if (data.approved_reports_list) {
            const showPerPage = 12;
            const reports = await SchemaModels.SubmitReportModel.aggregate([
                {
                    $match: {
                        $and: [
                            {program_id: {$in: programs.map(program => toObjectID(program._id))}},
                            {status: REPORT_STATUS.APPROVE}
                        ]
                    }
                },
                {
                    $facet: {
                        total_count: [{$count: "count"}],
                        rows: [{$sort: {severity: -1, submit_date_time: -1}},
                            {$skip: (data.page - 1) * showPerPage},
                            {$limit: showPerPage},
                            {$project: {_id: 1, severity: 1, title: 1}}]
                    }
                }
            ]).exec();
            return setPaginationResponse(reports, showPerPage, data.page);
        }
        return undefined;
    }

    async getPayments(data) {
        const company = await this.collection.findOne({_id: data.id});
        if (!company) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_RESOURCE_FOUND, "company");
        }
        if (data.transactions_history) {
            const payments = {};
            payments.rows = [];
            payments.total_rows = 0;
            payments.total_page = 0;
            payments.remaining = 0;
            payments.total_deposit = 0;
            payments.total_spent = 0;
            payments.current_page = data.page;
            const limit = data.limit;
            const skip = (data.page - 1) * limit;
            const result = await SchemaModels.PaymentHistoryModel.aggregate([
                {
                    $match: {"company_user_id": toObjectID(data.id)}
                },
                {
                    $lookup: {
                        from: 'programs',
                        localField: 'program_id',
                        foreignField: '_id',
                        as: 'program_id'
                    }
                },
                {
                    $unwind: {path: "$program_id", preserveNullAndEmptyArrays: true}
                },
                {
                    $match: {$or: [{"program_id.status": PROGRAM_STATUS.APPROVED}, {"program_id.status": PROGRAM_STATUS.CLOSE}]}
                },
                {
                    $lookup: {
                        from: 'hacker_users',
                        localField: 'hacker_user_id',
                        foreignField: '_id',
                        as: 'hacker_user_id'
                    }
                },
                {
                    $unwind: {path: "$hacker_user_id", preserveNullAndEmptyArrays: true}
                },
                {
                    $lookup: {
                        from: 'submit_reports',
                        localField: 'report_id',
                        foreignField: '_id',
                        as: 'report_id'
                    }
                },
                {
                    $unwind: {path: "$report_id", preserveNullAndEmptyArrays: true}
                },
                {
                    $sort: {"register_date_time": -1}
                },
                {
                    $facet: {
                        transactions: [{$project: {_id: 0, amount: 1, is_positive: 1}}],
                        total_rows: [{$count: "count"}],
                        rows: [
                            {$skip: skip},
                            {$limit: limit},
                            {
                                $project: {
                                    _id: 0,
                                    register_date_time: 1,
                                    amount: 1,
                                    is_positive: 1,
                                    program_id: {name: 1},
                                    report_id: {severity: 1, _id: 1},
                                    hacker_user_id: {username: 1},
                                }
                            }
                        ]
                    }
                }
            ]);
            if (result && result.length > 0 && result[0].total_rows.length > 0) {
                payments.rows = result[0].rows;
                payments.total_rows = result[0].total_rows[0].count;
                payments.total_page = Math.ceil(payments.total_rows / limit);
            }
            const transactions = result[0].transactions;
            if (transactions && transactions.length > 0) {
                const deposit_amounts = transactions.filter(f => f.is_positive === true).map(d => d.amount);
                payments.total_deposit = deposit_amounts.reduce((a, b) => a + b, 0);
                const spent_amounts = transactions.filter(f => f.is_positive === false).map(d => d.amount);
                payments.total_spent = spent_amounts.reduce((a, b) => a + b, 0);
                payments.remaining = payments.total_deposit - payments.total_spent;
            }
            return payments;
        }
    }

    async deleteAvatar(_id) {
        await this.collection.updateOne({_id}, {$set: {avatar_file: ""}});
    }

    async gets(data) {
        if (data.user_level_access === toNumber(ADMIN_ROLES.MODERATOR)) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_PERMISSON);
        }
        if (hasValue(data.select_term)) {
            return await this.collection.aggregate([
                {
                    $match: {
                        display_name: {$regex: ".*" + data.select_term + ".*", $options: "i"},
                        account_is_disable: false,
                        status: true,
                        is_verify: true,
                        admin_verify: true
                    }
                },
                {$sort: {"display_name": -1}},
                {$project: {value: "$_id", title: "$display_name", avatar: "$avatar_file"}}
            ])
        }
        const filters = [];
        filters.push(
            {$or: [{parent_user_id: undefined}, {parent_user_id: null}, {parent_user_id: {$exists: false}}]}
        );
        if (hasValue(data.email)) {
            filters.push({email: {$regex: ".*" + data.email + ".*", $options: "i"}});
        }
        if (hasValue(data.is_verify)) {
            if (data.is_verify === true) {
                filters.push({is_verify: data.is_verify});
            } else {
                filters.push({$or: [{is_verify: data.is_verify}, {is_verify: {$exists: false}}]});
            }
        }
        if (hasValue(data.admin_verify)) {
            if (data.admin_verify === true) {
                filters.push({admin_verify: data.admin_verify});
            } else {
                filters.push({$or: [{admin_verify: data.admin_verify}, {admin_verify: {$exists: false}}]});
            }
        }
        const company_online_ids = this.getOnlineIds();
        if (hasValue(data.is_online)) {
            if (data.is_online) {
                filters.push({_id: {$in: company_online_ids.map(company => company.parent_id ? toObjectID(company.parent_id) : toObjectID(company._id))}});
            } else {
                filters.push({_id: {$nin: company_online_ids.map(company => company.parent_id ? toObjectID(company.parent_id) : toObjectID(company._id))}});
            }
        }
        const companies = await this.collection.aggregate([
            {
                $facet: {
                    total_count: [{$match: {$and: filters}},
                        {$count: "count"}],
                    parent_users: [{$match: {$and: [{parent_user_id: {$ne: null}}, {parent_user_id: {$exists: true}}]}}, {
                        $group: {
                            _id: "$parent_user_id",
                            count: {$sum: 1}
                        }
                    }],
                    rows: [{$match: {$and: filters}}, {$sort: {"register_date_time": -1}}, {$skip: (data.page - 1) * data.limit}, {$limit: data.limit},
                        {$addFields: {has_2fa: {$and: [{$ne: ["$google_towfa_secret_key", '']}, {$ne: ["$google_towfa_secret_key", null]}, {$eq: ["$google_towfa_status", TWO_FA_STATUS.ENABLED]}]}}},
                        {
                            $addFields: {
                                is_online: {$cond: [{$in: ["$_id", company_online_ids.map(company => toObjectID(company._id))]}, true, false]}
                            }
                        },
                        {
                            $lookup: {
                                from: "company_users",
                                let: {company_user_id: "$_id"},
                                pipeline: [
                                    {
                                        $match: {$expr: {$eq: ["$parent_user_id", "$$company_user_id"]}}
                                    },
                                    {$addFields: {is_online: {$cond: [{$in: ["$_id", company_online_ids.map(d => d._id).map(id => toObjectID(id))]}, true, false]}}},
                                    {
                                        $project: {_id: 1, email: 1, is_online: 1}
                                    }
                                ],
                                as: "members"
                            }
                        },
                        {
                            $lookup: {
                                from: "integrations",
                                let: {company_user_id: "$_id"},
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: {
                                                $and: [
                                                    {$eq: ["$company_user_id", "$$company_user_id"]},
                                                    {$eq: ["$status", INTEGRATION_AUTH_STATUS.ACTIVE]}
                                                ]
                                            }
                                        }
                                    },
                                    {
                                        $project: {_id: 0, type: 1}
                                    }
                                ],
                                as: "integrations"
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                user_id: 1,
                                has_2fa: 1,
                                email: 1,
                                fn: 1,
                                ln: 1,
                                is_online: 1,
                                integrations: 1,
                                organization_name: 1,
                                members: 1,
                                avatar_file: 1,
                                status: 1,
                                is_verify: 1,
                                admin_verify: 1,
                                register_date_time: 1,
                                verify_date_time: 1,
                                is_fully_manage: 1,
                                account_is_disable: 1
                            }
                        }]
                }
            }
        ]);
        const programs_count = await SchemaModels.ProgramModel.aggregate([
            {
                $group: {
                    _id: "$company_user_id",
                    progress: {$sum: {$cond: [{$eq: ["$status", PROGRAM_STATUS.PROGRESS]}, 1, 0]}},
                    pending: {$sum: {$cond: [{$eq: ["$status", PROGRAM_STATUS.PENDING]}, 1, 0]}},
                    approved: {$sum: {$cond: [{$eq: ["$status", PROGRAM_STATUS.APPROVED]}, 1, 0]}},
                    reject: {$sum: {$cond: [{$eq: ["$status", PROGRAM_STATUS.REJECT]}, 1, 0]}},
                    close: {$sum: {$cond: [{$eq: ["$status", PROGRAM_STATUS.CLOSE]}, 1, 0]}}
                }
            },
            {$project: {_id: 1, progress: 1, pending: 1, approved: 1, reject: 1, close: 1,}}
        ]);
        companies[0].rows.forEach(item => {
            const parent = companies[0].parent_users.find(f => f._id.toString() === item._id.toString());
            if (isArray(programs_count)) {
                const program_count = programs_count.find(d => d._id.toString() === item._id.toString());
                if (program_count) {
                    item.progress = program_count.progress;
                    item.pending = program_count.pending;
                    item.approved = program_count.approved;
                    item.reject = program_count.reject;
                    item.close = program_count.close;
                } else {
                    item.progress = 0;
                    item.pending = 0;
                    item.approved = 0;
                    item.reject = 0;
                    item.close = 0;
                }
            }
            if (parent) {
                item.sub_user_count = parent.count;
            } else {
                item.sub_user_count = 0;
            }
        });
        return setPaginationResponse(companies, data.limit, data.page);
    }

    getOnlineIds() {
        let result = [];
        if (companyIO && companyIO["sockets"] && companyIO["sockets"].size > 0) {
            const sockets_info = convertSetOrMapToArray(companyIO["sockets"]);
            if (sockets_info.length > 0) {
                const online_companies = [];
                sockets_info.forEach(s => {
                    if (s.data && s.data._id && s.data.email && !online_companies.includes(s.data._id.toString())) {
                        online_companies.push({
                            _id: s.data._id.toString(),
                            parent_id: s.data.parent_id ? s.data.parent_id.toString() : undefined
                        });
                    }
                });
                if (online_companies.length > 0) {
                    result = [...online_companies]
                }
            }
        }
        return result;
    }

    async getOnlines(data) {
        if (data.user_level_access === toNumber(ADMIN_ROLES.MODERATOR)) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_PERMISSON);
        }
        let result = [];
        if (companyIO && companyIO["sockets"] && companyIO["sockets"].size > 0) {
            const sockets_info = convertSetOrMapToArray(companyIO["sockets"]);
            if (sockets_info.length > 0) {
                const online_companies = [];
                sockets_info.forEach(s => {
                    if (s.data && s.data._id && s.data.email && !online_companies.includes(s.data.email)) {
                        online_companies.push({id: s.data._id, parent_id: s.data.parent_id});
                    }
                });
                if (online_companies.length > 0) {
                    result = [...online_companies]
                }
            }
        }
        return result;
    }

    async get(data) {
        if (hasValue(data.report_id)) {
            const report = await SchemaModels.SubmitReportModel.findOne({_id: data.report_id})
                .populate({
                    path: "program_id",
                    match: {company_user_id: data.id},
                    select: {_id: 1}
                }).select({program_id: 1});
            if (!report || !report.program_id) {
                throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_FOUND, "report");
            }
            await checkUserAccess(data.user_level_access, data.user_id, report.program_id._id, false);
            return await this.getCompanyCard(report.program_id._id);
        } else if (data.user_level_access === toNumber(ADMIN_ROLES.MODERATOR)) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_PERMISSON);
        } else {
            const company = await this.collection.findOne({_id: data.id})
                .populate('invoice_address_country_id')
                .populate('credit_currency_id')
                .populate('company_country_id')
                .select({
                    _id: 1,
                    register_date_time: 1,
                    verify_date_time: 1,
                    account_is_disable: 1,
                    admin_verify: 1,
                    status: 1,
                    fn: 1,
                    ln: 1,
                    is_verify: 1,
                    is_fully_manage: 1,
                    email: 1,
                    avatar_file: 1,
                    tax_file: 1,
                    organization_name: 1,
                    role: 1,
                    about: 1,
                    profile_visibility: 1,
                    github_url: 1,
                    website_url: 1,
                    twitter_url: 1,
                    linkedin_url: 1,
                    address1: 1,
                    address2: 1,
                    city: 1,
                    region: 1,
                    short_introduction: 1,
                    postal_code: 1,
                    display_name: 1,
                    company_country_id: 1,
                    organization_no: 1,
                    phone: 1,
                    payment_paypal_email: 1,
                    invoice_address_country_id: 1,
                    invoice_address_email: 1,
                    invoice_address_company_name: 1,
                    invoice_address_address1: 1,
                    invoice_address_address2: 1,
                    invoice_address_city: 1,
                    invoice_address_reference: 1,
                    invoice_address_zip_code: 1,
                    credit_card_number: 1,
                    credit_currency_id: 1,
                    google_towfa_secret_key: 1,
                    google_towfa_status: 1,
                    credit_bank_holder_name: 1,
                    credit_date: 1,
                    credit_cvc: 1
                }).lean();
            if (!company) {
                throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_FOUND, "company");
            }
            company.has_2fa = !!company.google_towfa_secret_key && company.google_towfa_status === TWO_FA_STATUS.ENABLED;
            company.integrations = await SchemaModels.IntegrationModel.find({
                company_user_id: data.id,
                status: INTEGRATION_AUTH_STATUS.ACTIVE
            })
                .select({_id: 0, type: 1});
            const programs_count = await SchemaModels.ProgramModel.aggregate([
                {$match: {company_user_id: toObjectID(data.id)}},
                {
                    $group: {
                        _id: null,
                        progress: {$sum: {$cond: [{$eq: ["$status", PROGRAM_STATUS.PROGRESS]}, 1, 0]}},
                        pending: {$sum: {$cond: [{$eq: ["$status", PROGRAM_STATUS.PENDING]}, 1, 0]}},
                        approved: {$sum: {$cond: [{$eq: ["$status", PROGRAM_STATUS.APPROVED]}, 1, 0]}},
                        reject: {$sum: {$cond: [{$eq: ["$status", PROGRAM_STATUS.REJECT]}, 1, 0]}},
                        close: {$sum: {$cond: [{$eq: ["$status", PROGRAM_STATUS.CLOSE]}, 1, 0]}}
                    }
                },
                {$project: {_id: 0, progress: 1, pending: 1, approved: 1, reject: 1, close: 1,}}
            ]);
            delete company.google_towfa_secret_key;
            delete company.google_towfa_status;
            return Object.assign({}, company, programs_count[0]);
        }
    }

    async update(data) {
        if (data.company.tab === 0) {
            await this.checkDisplayNameExist(data.id, data.company.display_name);
        }
        if (isObjectID(data.company.company_country_id) && await checkCountryId(data.company.company_country_id) === 0) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_FOUND, "company_country_id");
        }
        if (isObjectID(data.company.invoice_address_country_id) && await checkCountryId(data.company.invoice_address_country_id) === 0) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_FOUND, "invoice_address_country_id");
        }
        if (isObjectID(data.company.credit_currency_id) && await checkCurrencyId(data.company.credit_currency_id) === 0) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_FOUND, "credit_currency_id");
        }
        const updating_data = this.getUpdatingData(data.company);
        const company = await this.collection.findOneAndUpdate({_id: data.id}, {$set: updating_data}, {
            new: true, projection: {
                _id: 1,
                register_date_time: 1,
                verify_date_time: 1,
                account_is_disable: 1,
                admin_verify: 1,
                status: 1,
                fn: 1,
                ln: 1,
                is_verify: 1,
                is_fully_manage: 1,
                email: 1,
                avatar_file: 1,
                tax_file: 1,
                organization_name: 1,
                role: 1,
                about: 1,
                profile_visibility: 1,
                github_url: 1,
                website_url: 1,
                twitter_url: 1,
                linkedin_url: 1,
                address1: 1,
                address2: 1,
                city: 1,
                region: 1,
                short_introduction: 1,
                postal_code: 1,
                display_name: 1,
                company_country_id: 1,
                organization_no: 1,
                phone: 1,
                payment_paypal_email: 1,
                invoice_address_country_id: 1,
                invoice_address_email: 1,
                invoice_address_company_name: 1,
                invoice_address_address1: 1,
                invoice_address_address2: 1,
                invoice_address_city: 1,
                invoice_address_reference: 1,
                invoice_address_zip_code: 1,
                credit_card_number: 1,
                credit_currency_id: 1,
                credit_bank_holder_name: 1,
                credit_date: 1,
                credit_cvc: 1
            }
        });
        if (!company) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_RESOURCE_FOUND, "company");
        }
        return company;
    }

    async getMembers(id) {
        const company = await this.collection.findOne({_id: id}).countDocuments();
        if (company === 0) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_ROUTE_FOUND, "company");
        }
        const members = await this.collection.find({parent_user_id: id})
            .select({
                _id: 1, register_date_time: 1, user_level_access: 1,
                status: 1, fn: 1, ln: 1, email: 1, account_is_disable: 1,
                google_towfa_secret_key: 1, google_towfa_status: 1, can_send_comment: 1, can_see_approve: 1
            }).lean();
        const online_companies_id = this.getOnlineIds();
        members.forEach((member) => {
            member.has_2fa = !!(member.google_towfa_secret_key && member.google_towfa_status === 1);
            member.is_online = online_companies_id.map(d => d._id).includes(member._id.toString());
            delete member.google_towfa_secret_key;
            delete member.google_towfa_status;
        });
        return members;
    }

    async getCompanyProgramsId(company_user_id) {
        let programs = await SchemaModels.ProgramModel.aggregate([
            {$match: {$and: [{company_user_id: toObjectID(company_user_id)}, {$or: [{status: PROGRAM_STATUS.APPROVED}, {status: PROGRAM_STATUS.CLOSE}]}]}},
            {$project: {_id: 0, program_id: "$_id"}}
        ]);
        return programs.map(d => d.program_id);
    }

    async getAllCompanyPrograms(company_user_id) {
        return await SchemaModels.ProgramModel.aggregate([
            {$match: {company_user_id: toObjectID(company_user_id)}},
            {$project: {_id: 1, name: 1, status: 1, is_next_generation: 1}}
        ]);
    }

    checkForCurrentYear(data) {
        data = data.filter(item => !!item._id);
        const current_year = getYear();
        const has_current_year = data.find(row => row._id.toString() === current_year.toString());
        if (!has_current_year) data.push({year: current_year, months: []});
        return data;
    }

    setMonths(months) {
        const result = [];
        for (let month of months) {
            if (month && month._id) {
                const month_number = month._id.month <= 9 ? `0${month._id.month}` : `${month._id.month}`;
                month.month_name = getMonthNameByNumber(month_number);
                month.month_number = month_number;
                delete month._id;
                result.push(month);
            }
        }
        return result;
    }

    setInitialMonthData(type) {
        return type === 'group_by_status' ? {
            Pending: 0, Modification: 0, Triage: 0,
            Approve: 0, Reject: 0, Duplicate: 0, Resolved: 0, NotApplicable: 0,
        } : {
            None: 0, Low: 0, Medium: 0, High: 0, Critical: 0
        }
    }

    setDataForEmptyMonths(months, type) {
        const month_numbers = months.map(month => month.month_number);
        for (let month_number = 1; month_number <= 12; month_number++) {
            month_number = (month_number <= 9) ? `0${month_number}` : `${month_number}`;
            if (!month_numbers.includes(month_number)) {
                const month = this.setInitialMonthData(type);
                month.month_name = getMonthNameByNumber(month_number);
                month.month_number = month_number;
                months.push(month);
            }
        }
        return months;
    }

    setYearsBaseMonths(data, type) {
        const result = [];
        for (let item of data) {
            const result_item = {year: item.year};
            let months = this.setMonths(item.months);
            result_item.months = this.setDataForEmptyMonths(months, type);
            result_item.months.sort((a, b) => a.month_number - b.month_number);
            result.push(result_item);
        }
        return result;
    }

    setProgramPaymentsTimeLine(transactions_group_by_program) {
        const result = [];
        transactions_group_by_program.forEach(item => {
            let prev_amount = 0;
            const data = {
                name: item.program_name,
                data: item.payments.map((payment, i) => {
                    const return_data = {
                        category: i + 1, value: i === 0 ?
                            payment.amount : (payment.is_positive ? prev_amount + payment.amount : prev_amount - payment.amount)
                    };
                    prev_amount = i === 0 ? payment.amount : (payment.is_positive ? prev_amount + payment.amount : prev_amount - payment.amount);
                    return return_data;
                })
            };
            result.push(data);
        });
        return result;
    }

    async getReportsForSubmissionsChart(program_ids) {
        return await SchemaModels.SubmitReportModel.aggregate([
            {$match: {$and: [{status: {$gte: 1}}, {program_id: {$in: program_ids}}]}},
            {
                $group: {
                    _id: {year: {$year: "$submit_date_time"}, month: {$month: "$submit_date_time"}},
                    Pending: {$sum: {$cond: {if: {$eq: ["$status", REPORT_STATUS.PENDING]}, then: 1, else: 0}}},
                    Modification: {
                        $sum: {$cond: {if: {$eq: ["$status", REPORT_STATUS.MODIFICATION]}, then: 1, else: 0}}
                    },
                    Triage: {$sum: {$cond: {if: {$eq: ["$status", REPORT_STATUS.TRIAGE]}, then: 1, else: 0}}},
                    Approve: {$sum: {$cond: {if: {$eq: ["$status", REPORT_STATUS.APPROVE]}, then: 1, else: 0}}},
                    Reject: {$sum: {$cond: {if: {$eq: ["$status", REPORT_STATUS.REJECT]}, then: 1, else: 0}}},
                    Duplicate: {$sum: {$cond: {if: {$eq: ["$status", REPORT_STATUS.DUPLICATE]}, then: 1, else: 0}}},
                    Resolved: {$sum: {$cond: {if: {$eq: ["$status", REPORT_STATUS.RESOLVED]}, then: 1, else: 0}}},
                    NotApplicable: {
                        $sum: {$cond: {if: {$eq: ["$status", REPORT_STATUS.NOT_APPLICABLE]}, then: 1, else: 0}}
                    }
                }
            },
            {$group: {_id: "$_id.year", year: {$first: "$_id.year"}, months: {$push: "$$ROOT"}}},
            {$sort: {year: 1}}
        ]).exec();
    }

    async getReportsForSeverityChart(program_ids) {
        return await SchemaModels.SubmitReportModel.aggregate([
            {$match: {$and: [{status: {$gte: 1}}, {program_id: {$in: program_ids}}]}},
            {
                $group: {
                    _id: {year: {$year: "$submit_date_time"}, month: {$month: "$submit_date_time"}},
                    None: {$sum: {$cond: {if: {$eq: ["$severity", REPORT_SEVERITY.NONE]}, then: 1, else: 0}}},
                    Low: {$sum: {$cond: {if: {$eq: ["$severity", REPORT_SEVERITY.LOW]}, then: 1, else: 0}}},
                    Medium: {$sum: {$cond: {if: {$eq: ["$severity", REPORT_SEVERITY.MEDIUM]}, then: 1, else: 0}}},
                    High: {$sum: {$cond: {if: {$eq: ["$severity", REPORT_SEVERITY.HIGH]}, then: 1, else: 0}}},
                    Critical: {
                        $sum: {$cond: {if: {$eq: ["$severity", REPORT_SEVERITY.CRITICAL]}, then: 1, else: 0}}
                    }
                }
            },
            {$group: {_id: "$_id.year", year: {$first: "$_id.year"}, months: {$push: "$$ROOT"}}},
            {$sort: {year: 1}}
        ]).exec();
    }

    async getTransactionGroupByProgram(company_user_id, program_ids) {
        return await SchemaModels.PaymentHistoryModel.aggregate([
            {$match: {$and: [{company_user_id: toObjectID(company_user_id)}, {program_id: {$in: program_ids}}]}},
            {$lookup: {from: "programs", localField: "program_id", foreignField: "_id", as: "program"}},
            {$unwind: {path: "$program", preserveNullAndEmptyArrays: true}},
            {$sort: {"register_date_time": 1}},
            {
                $group: {
                    _id: "$program_id",
                    program_name: {$first: "$program.name"},
                    payments: {$push: {is_positive: "$is_positive", amount: "$amount"}}
                }
            },
            {$project: {program_name: 1, payments: 1}}
        ]);
    }

    async getProgramsGroupByReports(program_ids) {
        return await SchemaModels.SubmitReportModel.aggregate([
            {$match: {program_id: {$in: program_ids.map(id => toObjectID(id))}}},
            {
                $group: {
                    _id: "$program_id",
                    none: {$sum: {$cond: {if: {$eq: ["$severity", REPORT_SEVERITY.NONE]}, then: 1, else: 0}}},
                    low: {$sum: {$cond: {if: {$eq: ["$severity", REPORT_SEVERITY.LOW]}, then: 1, else: 0}}},
                    medium: {$sum: {$cond: {if: {$eq: ["$severity", REPORT_SEVERITY.MEDIUM]}, then: 1, else: 0}}},
                    high: {$sum: {$cond: {if: {$eq: ["$severity", REPORT_SEVERITY.HIGH]}, then: 1, else: 0}}},
                    critical: {
                        $sum: {$cond: {if: {$eq: ["$severity", REPORT_SEVERITY.CRITICAL]}, then: 1, else: 0}}
                    }
                }
            },
            {$lookup: {from: 'programs', localField: '_id', foreignField: '_id', as: 'program'}},
            {$unwind: {path: "$program", preserveNullAndEmptyArrays: true}},
            {
                $project: {
                    _id: 0, program: {_id: 1, status: 1, name: 1, is_next_generation: 1},
                    reports: {L: "$low", M: "$medium", H: "$high", C: "$critical"}
                }
            }
        ])
    }

    async getPrograms(data) {
        const company = await this.collection.findOne({_id: data.id});
        if (!company) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_RESOURCE_FOUND, "company");
        }
        let result = [];
        let programs = await this.getAllCompanyPrograms(data.id);
        if (!programs || programs.length === 0) {
            return [];
        }
        if (data.reports_count) {
            let programs_group_by_reports = await this.getProgramsGroupByReports(programs.map(d => d._id));
            if (!programs_group_by_reports || programs_group_by_reports.length === 0) {
                programs_group_by_reports = [];
            }
            const approved_programs = [];
            const closed_programs = [];
            const pending_programs = [];
            const progress_programs = [];
            const reject_programs = [];
            programs.forEach(item => {
                let program_group = programs_group_by_reports.length > 0 ? programs_group_by_reports.find(p => p.program._id.toString() === item._id.toString()) : undefined;
                if (!program_group) {
                    program_group = {};
                    program_group.program = item;
                    program_group.reports = {L: 0, M: 0, H: 0, C: 0};
                }
                switch (program_group.program.status) {
                    case PROGRAM_STATUS.APPROVED:
                        approved_programs.push(program_group);
                        break;
                    case PROGRAM_STATUS.CLOSE:
                        closed_programs.push(program_group);
                        break;
                    case PROGRAM_STATUS.PENDING:
                        pending_programs.push(program_group);
                        break;
                    case PROGRAM_STATUS.PROGRESS:
                        progress_programs.push(program_group);
                        break;
                    case PROGRAM_STATUS.REJECT:
                        reject_programs.push(program_group);
                        break;
                }
            });
            result = approved_programs.concat(closed_programs, pending_programs, progress_programs, reject_programs);
        }
        return result;
    }

    async getCharts(data) {
        const company = await this.collection.findOne({_id: data.id});
        if (!company) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_RESOURCE_FOUND, "company");
        }
        let program_ids = await this.getCompanyProgramsId(data.id);
        let reports = [];
        if (data.reports_status) {
            reports = await this.getReportsForSubmissionsChart(program_ids);
        } else if (data.reports_severity) {
            reports = await this.getReportsForSeverityChart(program_ids);
        } else if (data.programs) {
            const transactions = await this.getTransactionGroupByProgram(data.id, program_ids);
            return this.setProgramPaymentsTimeLine(transactions);
        }
        if (data.reports_status || data.reports_severity) {
            reports = this.checkForCurrentYear(reports);
            const type = data.reports_status ? "group_by_status" : "group_by_severity";
            return this.setYearsBaseMonths(reports, type);
        }
        return reports;
    }

    async addMember(data) {
        const same_email_count = await this.collection.findOne({email: data.member.email}).countDocuments();
        if (same_email_count > 0) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.EMAIL_EXIST);
        }
        const parent = await this.collection.findOne({_id: data.id})
            .select({
                _id: 1, is_fully_manage: 1, account_is_disable: 1, profile_visibility: 1,
                status: 1, is_verify: 1, admin_verify: 1, program_list: 1
            });

        if (!parent) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_RESOURCE_FOUND, "parent company");
        }

        // const access_program_list = JSON.parse(data.member.access_program_list);

        // let program_list = [];
        //
        // for(let i = 0 ; i < access_program_list.length ; i++)
        // {
        //     const is_valid_program_list = await SchemaModels.ProgramModel.find(
        //         {
        //         "$and" : [
        //                     {"_id" : access_program_list[i]},
        //                     {"company_user_id" : data.id}
        //                 ]
        //          }
        //     ).select({'_id' : 1 , 'name' : 1 })
        //
        //     if(isUndefined(is_valid_program_list) || is_valid_program_list == "")
        //     {
        //         throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_VALID,'program');
        //     }
        //     program_list.push(is_valid_program_list);
        // }

        const member = {
            account_is_disable: parent.account_is_disable,
            profile_visibility: parent.profile_visibility,
            status: data.member.status,
            is_verify: parent.is_verify,
            admin_verify: parent.admin_verify,
            //program_list : program_list,
            is_fully_manage: parent.is_fully_manage,
            user_level_access: data.member.user_level_access,
            email: data.member.email,
            fn: data.member.fn,
            can_send_comment: this.setCanSendComment(data.member.user_level_access, data.member.comment),
            can_see_approve: this.setCanSeeApprove(data.member.user_level_access, data.member.can_see_approve),
            ln: data.member.ln,
            password: makeHash(data.member.password),
            register_date_time: getDateTime(),
            parent_user_id: data.id
        };
        await this.collection.create(member);
        return await this.getMembers(data.id);
    }

    async disable2FA(data) {
        const company = await this.collection.findOne({_id: data.id}).select({
            _id: 1,
            google_towfa_secret_key: 1,
            google_towfa_status: 1
        });
        if (!company) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_RESOURCE_FOUND, "company");
        }
        if (!(hasValue(company.google_towfa_secret_key) && company.google_towfa_status === TWO_FA_STATUS.ENABLED)) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.CUSTOM, "2FA already disabled");
        }
        await this.collection.updateOne({_id: data.id}, {
            $set: {
                google_towfa_secret_key: '',
                google_towfa_status: TWO_FA_STATUS.DISABLED
            }
        });
    }

    async deleteMember(data) {
        const member = await this.collection.findOneAndDelete({_id: data.member_id, parent_user_id: data.id});
        if (!member) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_RESOURCE_FOUND, "company");
        }
        await SchemaModels.CommentSubmitReportModel.deleteMany({company_user_id: data.member_id});
        await SchemaModels.ReportNotificationModel.deleteMany({company_user_id: data.member_id});
        await SchemaModels.NotificationModel.deleteMany({company_user_id: data.member_id});
        await SchemaModels.HistoryModel.deleteMany({sender_id: data.member_id, sender_type: SENDER_TYPE.COMPANY});
    }

    async changeMemberActivity(data) {
        const member = await this.collection.findOneAndUpdate({_id: data.member_id, parent_user_id: data.id},
            {$set: {account_is_disable: data.account_is_disable}});
        if (!member) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_RESOURCE_FOUND, "company");
        }
        let allToken = await ftSearch('sbloginIndex', `@user_id:${data.member_id}`);
        for (let row of allToken) {
            await delete_by_key(row.key);
        }
    }

    async updateMember(data) {
        const same_email_count = await this.collection.findOne({
            email: data.member.email,
            _id: {$ne: data.member_id}
        }).countDocuments();
        if (same_email_count > 0) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.EMAIL_EXIST);
        }
        // const access_program_list = JSON.parse(data.member.access_program_list);
        //
        // let program_list = [];
        //
        // for(let i = 0 ; i < access_program_list.length ; i++)
        // {
        //     const is_valid_program_list = await SchemaModels.ProgramModel.find(
        //         {
        //         "$and" : [
        //                     {"_id" : access_program_list[i]},
        //                     {"company_user_id" : data.id}
        //                 ]
        //          }
        //     ).select({'_id' : 1 , 'name' : 1 })
        //
        //     if(isUndefined(is_valid_program_list) || is_valid_program_list == "")
        //     {
        //         throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_VALID,'program');
        //     }
        //     program_list.push(is_valid_program_list);
        // }

        const update_data = {
            status: data.member.status,
            user_level_access: data.member.user_level_access,
            email: data.member.email,
            fn: data.member.fn,
            can_send_comment: this.setCanSendComment(data.member.user_level_access, data.member.comment),
            can_see_approve: this.setCanSeeApprove(data.member.user_level_access, data.member.can_see_approve),
            ln: data.member.ln,
            //  program_list : program_list
        };
        if (data.member.password) {
            update_data.password = makeHash(data.member.password);
        }
        const company = await this.collection.findOneAndUpdate({_id: data.member_id, parent_user_id: data.id},
            {$set: update_data});
        if (!company) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_RESOURCE_FOUND, "company");
        }
    }

    setCanSendComment(member_access_level, can_send_comment) {
        if (this.isAdmin(member_access_level)) return true;

        if (this.isObserver(member_access_level)) return false;

        if (this.isViewer(member_access_level)) return can_send_comment;
    }

    setCanSeeApprove(member_access_level, can_see_approve) {
        if (this.isAdmin(member_access_level)) return true;

        if (this.isObserver(member_access_level)) return can_see_approve;

        if (this.isViewer(member_access_level)) return true;
    }

    isAdmin(access_level) {
        return access_level === toNumber(ROLES.ADMIN);
    }

    isObserver(access_level) {
        return access_level === toNumber(ROLES.OBSERVER);
    }

    isViewer(access_level) {
        return access_level === toNumber(ROLES.VIEWER);
    }

    async delete(company_id) {
        const company = await this.collection.findOne({_id: company_id});
        if (!company) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_RESOURCE_FOUND, "company");
        }
        if (company.admin_verify) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.CUSTOM, "company is verify by admin");
        }
        // const history_model = {
        //     sender_type: SENDER_TYPE.ADMIN,
        //     activity: ACTIVITY_TEXT_LOG.DELETE_COMPANY,
        //     sender_id: user.id,
        //     resource_type: RESOURCE_TYPE.COMPANY,
        //     resource_id: company._id,
        //     info_fields:[{key:"company",value:company}],
        //     register_date_time: getDateTime()
        // };
        // await SchemaModels.HistoryModel.create(history_model);
        const members = await this.collection.find({parent_user_id: company_id});
        if (members && members.length > 0) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.CUSTOM, "company has some members please delete them first");
        }
        const programs = await SchemaModels.ProgramModel.find({company_user_id: company_id});
        if (programs && programs.length > 0) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.CUSTOM, "company has some program please delete them first");
        }

        await SchemaModels.CommentSubmitReportModel.deleteMany({company_user_id: company_id});
        await SchemaModels.ReportNotificationModel.deleteMany({company_user_id: company_id});
        await SchemaModels.NotificationModel.deleteMany({company_user_id: company_id});
        await SchemaModels.HistoryModel.deleteMany({sender_id: company_id, sender_type: SENDER_TYPE.COMPANY});
        await this.collection.deleteOne({_id: company_id});
    }

    async changePassword(data) {
        const company = await this.collection.findOneAndUpdate({_id: data.id}, {$set: {password: makeHash(data.password)}});
        if (!company) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_RESOURCE_FOUND, "company");
        }
    }

    async changeStatus(data) {
        const company = await this.collection.findOneAndUpdate({_id: data.id}, {$set: {status: data.status}}, {
            projection: {
                _id: 1,
                display_name: 1,
                fn: 1
            }
        });
        if (!company) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_RESOURCE_FOUND, "company");
        }
        const companies = [];
        companies.push(company);
        const members = await this.collection.find({parent_user_id: data.id}).select({_id: 1, display_name: 1, fn: 1});
        if (isArray(members) && members.length > 0) {
            members.forEach(m => companies.push(m));
            await this.collection.updateMany({parent_user_id: data.id}, {$set: {status: data.status}});
        }
        const notifications = await this.createNotifications(
            "Accout Status", companies, data.status, FIELD_TYPE.STATUS,
            data.status === true ? MESSAGE_TYPE.SUCCESS : MESSAGE_TYPE.DANGER,
            data.user_id);
        this.sendNotification("notification", notifications);
    }

    async changeVerify(data) {
        const company = await this.collection.findOneAndUpdate({_id: data.id}, {$set: {is_verify: data.is_verify}}, {
            projection: {
                _id: 1,
                display_name: 1,
                fn: 1
            }
        });
        if (!company) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_RESOURCE_FOUND, "company");
        }
        const companies = [];
        companies.push(company);
        const members = await this.collection.find({parent_user_id: data.id}).select({_id: 1, display_name: 1, fn: 1});
        if (isArray(members) && members.length > 0) {
            members.forEach(m => companies.push(m));
            await this.collection.updateMany({parent_user_id: data.id}, {$set: {is_verify: data.is_verify}});
        }
        const notifications = await this.createNotifications(
            "Email Verification", companies, data.is_verify, FIELD_TYPE.VERIFICATION,
            data.is_verify === true ? MESSAGE_TYPE.SUCCESS : MESSAGE_TYPE.DANGER,
            data.user_id);
        this.sendNotification("notification", notifications);
    }

    async changeActivity(data) {
        const company = await this.collection.findOneAndUpdate({_id: data.id},
            {$set: {account_is_disable: data.account_is_disable}}, {projection: {_id: 1, display_name: 1, fn: 1}});
        if (!company) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_RESOURCE_FOUND, "company");
        }
        const companies = [];
        companies.push(company);
        const members = await this.collection.find({parent_user_id: data.id}).select({_id: 1, display_name: 1, fn: 1});
        if (isArray(members) && members.length > 0) {
            members.forEach(m => companies.push(m));
            await this.collection.updateMany({parent_user_id: data.id}, {$set: {account_is_disable: data.account_is_disable}});
        }
        const notifications = await this.createNotifications(
            "Account Activity", companies, data.account_is_disable, FIELD_TYPE.ACTIVITY,
            data.account_is_disable ? MESSAGE_TYPE.DANGER : MESSAGE_TYPE.SUCCESS,
            data.user_id);
        this.sendNotification("notification", notifications);
    }

    async changeAdminVerify(data) {
        const company = await this.collection.findOneAndUpdate({_id: data.id},
            {$set: {admin_verify: data.admin_verify}}, {projection: {_id: 1, display_name: 1, email: 1, fn: 1}});
        if (!company) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_RESOURCE_FOUND, "company");
        }
        if (data.admin_verify) {
            const htmlTemplate = generateEmailTemplate("company_admin_verify", company.fn, {}, false);
            sendMail(company.email, "Your company account successfully activated", htmlTemplate);
        }
        const companies = [];
        companies.push(company);
        const members = await this.collection.find({parent_user_id: data.id}).select({_id: 1, display_name: 1, fn: 1});
        if (isArray(members) && members.length > 0) {
            members.forEach(m => companies.push(m));
            await this.collection.updateMany({parent_user_id: data.id}, {$set: {admin_verify: data.admin_verify}});
        }
        const notifications = await this.createNotifications(
            "Company Verification", companies, data.admin_verify, FIELD_TYPE.ADMIN_VERIFICATION,
            data.admin_verify === true ? MESSAGE_TYPE.SUCCESS : MESSAGE_TYPE.DANGER,
            data.user_id);
        this.sendNotification("notification", notifications);
    }

    async changeIsFullyManage(data) {
        const company = await this.collection.findOneAndUpdate({_id: data.id},
            {$set: {is_fully_manage: data.is_fully_manage}}, {projection: {_id: 1, display_name: 1, fn: 1}});
        if (!company) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_RESOURCE_FOUND, "company");
        }

        if (!data.is_fully_manage) {
            const program_ids = await this.getCompanyProgramsId(data.id);
            await SchemaModels.SubmitReportModel.updateMany({
                program_id: {$in: program_ids.map(id => toObjectID(id))},
                status: REPORT_STATUS.IN_PROGRESS_BY_ADMIN
            }, {status: REPORT_STATUS.PENDING});
        }
        const companies = [];
        companies.push(company);
        const members = await this.collection.find({parent_user_id: data.id}).select({_id: 1, display_name: 1, fn: 1});
        if (isArray(members) && members.length > 0) {
            members.forEach(m => companies.push(m));
            await this.collection.updateMany({parent_user_id: data.id}, {$set: {is_fully_manage: data.is_fully_manage}});
        }
        const notifications = await this.createNotifications(
            "FullyManage", companies, data.is_fully_manage, FIELD_TYPE.FULLY_MANAGE,
            MESSAGE_TYPE.INFO, data.user_id);
        this.sendNotification("notification", notifications);
    }

    async checkDisplayNameExist(id, display_name) {
        const display_name_count = await this.collection.countDocuments({_id: {$ne: id}, display_name});
        if (display_name_count > 0) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.EXIST, "display_name");
        }
    }

    getUpdatingData(data) {
        switch (data.tab) {
            case 0:
                return {
                    fn: data["fn"],
                    ln: data["ln"],
                    organization_name: data["organization_name"],
                    display_name: data["display_name"],
                    role: data["role"]
                };
            case 1:
                return {
                    short_introduction: data["short_introduction"] || '',
                    profile_visibility: data["profile_visibility"] || '',
                    github_url: data["github_url"] || '',
                    linkedin_url: data["linkedin_url"] || '',
                    twitter_url: data["twitter_url"] || '',
                    website_url: data["website_url"] || '',
                    company_country_id: data["company_country_id"] || null,
                    about: data["about"] || '',
                    city: data["city"] || '',
                    phone: data["phone"] || '',
                    region: data["region"] || '',
                    postal_code: data["postal_code"] || '',
                    address1: data["address1"] || '',
                    address2: data["address2"] || '',
                };
            case 2:
                return {
                    invoice_address_reference: data["invoice_address_reference"] || '',
                    invoice_address_email: data["invoice_address_email"] || '',
                    invoice_address_address1: data["invoice_address_address1"] || '',
                    invoice_address_address2: data["invoice_address_address2"] || '',
                    invoice_address_zip_code: data["invoice_address_zip_code"] || '',
                    invoice_address_city: data["invoice_address_city"] || '',
                    invoice_address_country_id: data["invoice_address_country_id"] || null,
                    credit_currency_id: data["credit_currency_id"] || null,
                    credit_card_number: data["credit_card_number"] || '',
                    credit_date: data["credit_date"] || '',
                    credit_cvc: data["credit_cvc"] || '',
                    credit_bank_holder_name: data["credit_bank_holder_name"] || '',
                    payment_paypal_email: data["payment_paypal_email"] || ''
                };
        }
    }

    async getCompanyCard(program_id) {
        const company_card = await SchemaModels.ProgramModel.findOne({_id: program_id})
            .select({
                status: 1, logo_file: 1, company_user_id: 1, rewards: 1,
                name: 1, program_type: 1, targets: 1, is_next_generation: 1
            })
            .populate({path: 'company_user_id', select: {display_name: 1, avatar_file: 1}})
            .populate('targets.target_type_id')
            .populate('targets.language_id')
            .populate('rewards.currency_id').lean();

        const reports_count = await SchemaModels.SubmitReportModel.aggregate([
            {$match: {program_id}},
            {
                $group: {
                    _id: null,
                    L: {$sum: {$cond: [{$eq: ["$severity", REPORT_SEVERITY.LOW]}, 1, 0]}},
                    M: {$sum: {$cond: [{$eq: ["$severity", REPORT_SEVERITY.MEDIUM]}, 1, 0]}},
                    H: {$sum: {$cond: [{$eq: ["$severity", REPORT_SEVERITY.HIGH]}, 1, 0]}},
                    C: {$sum: {$cond: [{$eq: ["$severity", REPORT_SEVERITY.CRITICAL]}, 1, 0]}}
                }
            },
            {$project: {_id: 0, L: 1, M: 1, H: 1, C: 1}}
        ]);
        company_card.reports_count = reports_count && reports_count[0] ? reports_count[0] : {L: 0, M: 0, H: 0, C: 0};
        return company_card;
    }

    sendNotification(emit_name, notifications) {
        if (companyIO && companyIO["sockets"] && companyIO["sockets"].size > 0 && companyIO["to"]) {
            const sockets_info = convertSetOrMapToArray(companyIO["sockets"]);
            if (sockets_info.length > 0) {
                sockets_info.forEach(s => {
                    if (s.data && s.data._id) {
                        const notification = notifications.find(n => n.company_user_id.toString() === s.data._id.toString());
                        if (notification) {
                            companyIO["to"](s.id.toString()).emit(emit_name, {
                                title: notification.title,
                                text: notification.text,
                                date: notification.register_date_time,
                                resource_type: notification.resource_type,
                                field_type: notification.field_type,
                                message_type: notification.message_type,
                                id: notification._id
                            });
                        }
                    }
                });
            }
        }
    }

    async createNotifications(title, companies, value, field_type, message_type, moderator_user_id) {
        const notifications = [];
        companies.forEach(c => {
            let text = "";
            if (field_type === FIELD_TYPE.STATUS) {
                text = `${c.display_name}, Admin has changed your account status to ${value ? "active" : "inactive"}`;
            } else if (field_type === FIELD_TYPE.ACTIVITY) {
                text = `${c.display_name}, Admin has changed your account status to ${value ? "inactive" : "active"}`;
            } else if (field_type === FIELD_TYPE.VERIFICATION) {
                text = `${c.display_name}, Admin has changed your account verification to ${value ? "valid" : "invalid"}`;
            } else if (field_type === FIELD_TYPE.FULLY_MANAGE) {
                text = `${c.display_name}, Admin has changed your fully manage account to ${value ? "active" : "inactive"}`;
            } else if (field_type === FIELD_TYPE.ADMIN_VERIFICATION) {
                text = `${c.display_name}, Admin has changed your company verification to ${value ? "valid" : "invalid"}`;
            }
            const notification = {
                title,
                text,
                status: NOTIFICATION_STATUS.SEND,
                field_type,
                register_date_time: getUtcLessDateTime(),
                sender_type: SENDER_TYPE.ADMIN,
                resource_type: RESOURCE_TYPE.COMPANY,
                message_type,
                action_type: ACTION_TYPE.UPDATE,
                moderator_user_id,
                company_user_id: c._id
            };
            notifications.push(notification);
        });
        return SchemaModels.NotificationModel.insertMany(notifications);
    }
}

module.exports = new CompanyUserModel();