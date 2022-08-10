const {ErrorHelper} = require('../../../libs/error.helper');
const hackerIO = require("../../../io/hacker");
const companyIO = require("../../../io/company");
const {
    toNumber,
    isArray,
    hasValue,
    setPaginationResponse,
    toObjectID,
    convertSetOrMapToArray
} = require('../../../libs/methode.helper');
const {makeHash, createTokens, getHash} = require('../../../libs/token.helper');
const {getDateTime, getCurrentDate} = require('../../../libs/date.helper');
const {
    REPORT_STATUS, ADMIN_ROLES, STATIC_VARIABLES, WITHDRAW_STATUS, PROGRAM_STATUS,
    ADMIN_ROLES_NAME, REPORT_ACTIVITY, TIMES_NUMBER, SENDER_TYPE, NOTIFICATION_STATUS,
    ACTION_TYPE, MESSAGE_TYPE, HACKER_TAGS, ACTIVITY_TEXT_LOG, RESOURCE_TYPE, HACKER_IDENTITY_STATUS
} = require('../../../libs/enum.helper');

class ModeratorUserModel {
    constructor() {
        this.collection = SchemaModels.ModeratorUserModel;
    }

    async login(data) {
        const password = makeHash(data.password);
        const user = await this.collection.findOne({email: data.email, password});
        if (user) {
            if (user.status) {
                // const history_model = {
                //     sender_type: user.user_level_access === toNumber(ADMIN_ROLES.MODERATOR) ?
                //         SENDER_TYPE.MODERATOR : SENDER_TYPE.ADMIN,
                //     activity: ACTIVITY_TEXT_LOG.LOGIN,
                //     sender_id: user._id,
                //     register_date_time: getDateTime()
                // };
                // await SchemaModels.HistoryModel.create(history_model);
                return Object.assign(await createTokens(user._id), {user_info: user});
            } else {
                throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.DISABLED, "user", true);
            }
        } else {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_CORRECT, "email or password", true);
        }
    }

    async gets(data) {
        if (data.is_dashboard) {
            return await this.collection.find({_id: {$ne: data.user_id}})
                .select({email: 1, user_level_access: 1, fn: 1, ln: 1, avatar: 1, alias: 1, status: 1, _id: 0});
        } else {
            const filters = [];
            if (hasValue(data.email)) {
                filters.push({email: {$regex: ".*" + data.email + ".*", $options: "i"}});
            }
            const moderators = await this.collection.aggregate([
                ...(filters.length > 0 ? [{$match: {$and: filters}}] : []),
                {
                    $facet: {
                        total_count: [{$count: "count"}],
                        rows: [{$sort: {"register_date_time": -1}}, {$skip: (data.page - 1) * data.limit}, {$limit: data.limit},
                            {
                                $project: {
                                    _id: 1,
                                    email: 1,
                                    fn: 1,
                                    ln: 1,
                                    avatar: 1,
                                    status: 1,
                                    alias: 1,
                                    user_level_access: 1
                                }
                            }]
                    }
                }
            ]);

            return setPaginationResponse(moderators, data.limit, data.page);
        }
    }

    async getNotifications(data) {
        const limit = 8;
        const page = data.page;
        const filters = [];
        filters.push({moderator_user_id: data.user_id});
        filters.push({
            sender_type: {
                $ne: data.user_level_access === toNumber(ADMIN_ROLES.MODERATOR) ?
                    SENDER_TYPE.MODERATOR : SENDER_TYPE.ADMIN
            }
        });
        if (data.is_new) {
            filters.push({status: NOTIFICATION_STATUS.SEND});
        }
        if (data.only_count) {
            return await SchemaModels.NotificationModel.countDocuments({$and: filters});
        }
        const notifications = await SchemaModels.NotificationModel.aggregate([
            {$match: {$and: filters}},
            {$sort: {register_date_time: -1}},
            {
                $facet: {
                    total_count: [{$count: "count"}],
                    rows: [
                        {
                            $skip: (page - 1) * limit,
                        },
                        {$limit: limit},
                        {
                            $project: {
                                title: 1,
                                text: 1,
                                message_type: 1,
                                register_date_time: 1,
                                status: 1,
                                _id: 1,
                                report_id: 1,
                                resource_type: 1,
                                field_type: 1,
                            }
                        }
                    ]
                }
            }
        ]).exec();
        return setPaginationResponse(notifications, limit, page);
    }

    async createNotifications(data) {
        const notifications = [];
        if (data.is_company) {
            if (data.user_ids.length > 0) {
                data.user_ids.forEach(user_id => {
                    const notification = this.createNotification(data.title, data.message, null, null, user_id, this.getMessageType(data.type), data.user_id, null);
                    notifications.push(notification);
                });
            } else {
                const users = await SchemaModels.CompanyUserModel.find({$and: [{account_is_disable: false}, {status: true}, {is_verify: true}, {$or: [{parent_user_id: {$eq: null}}, {parent_user_id: {$exists: false}}]}]})
                    .select({_id: 1});
                users.forEach(user => {
                    const notification = this.createNotification(data.title, data.message, null, null, user._id, this.getMessageType(data.type), data.user_id, null);
                    notifications.push(notification);
                });
            }
        } else {
            if (data.user_ids.length > 0) {
                data.user_ids.forEach(user_id => {
                    const notification = this.createNotification(data.title, data.message, null, user_id, null, this.getMessageType(data.type), data.user_id, null);
                    notifications.push(notification);
                });
            } else {
                const users = await SchemaModels.HackerUserModel.find({
                    account_is_disable: false,
                    status: true,
                    is_verify: true
                }).select({_id: 1});
                users.forEach(user => {
                    const notification = this.createNotification(data.title, data.message, null, user._id, null, this.getMessageType(data.type), data.user_id, null);
                    notifications.push(notification);
                });
            }
        }
        // const history_model = {
        //     sender_type: SENDER_TYPE.ADMIN,
        //     activity:ACTIVITY_TEXT_LOG.SEND_NOTIFICATION,
        //     sender_id:data.user_id,
        //     resource_type:RESOURCE_TYPE.NOTIFICATION,
        //     info_fields:[
        //         {key: "is_company",value:data.is_company},
        //         {key: "user_ids",value:data.user_ids},
        //         {key: "title",value:data.title},
        //         {key: "message",value:data.message},
        //         {key: "message_type",value:this.getMessageType(data.type)},
        //     ],
        //     register_date_time:getDateTime()
        // };
        // await SchemaModels.HistoryModel.create(history_model);
        SchemaModels.NotificationModel.insertMany(notifications);
        this.sendNotification("notification", data.is_company ? companyIO : hackerIO, data.is_company ? "company_user_id" : "hacker_user_id", notifications)
    }

    async updateNotificationsStatus(data) {
        await SchemaModels.NotificationModel.updateMany({
            _id: {$in: data.notification_ids}
        }, {$set: {status: NOTIFICATION_STATUS.READ}});

        const filters = [];
        filters.push({moderator_user_id: data.user_id});
        filters.push({
            sender_type: {
                $ne: data.user_level_access === toNumber(ADMIN_ROLES.MODERATOR) ?
                    SENDER_TYPE.MODERATOR : SENDER_TYPE.ADMIN
            }
        });
        filters.push({status: NOTIFICATION_STATUS.SEND});
        return await SchemaModels.NotificationModel.countDocuments({$and: filters});
    }

    async create(data) {
        await this.checkEmailAndAliasExists(null, data.email, data.alias);
        const new_user = await this.collection.create({
            email: data.email,
            fn: data.fn,
            ln: data.ln,
            creator_user_id: data.user_id,
            alias: data.alias,
            password: makeHash(data.password),
            user_level_access: data.user_level_access,
            status: data.status,
            register_date_time: getDateTime(),
        });
        // const history_model = {
        //     sender_type: SENDER_TYPE.ADMIN,
        //     activity:ACTIVITY_TEXT_LOG.CREATE_USER,
        //     sender_id:data.user_id,
        //     resource_type:RESOURCE_TYPE.MODERATOR,
        //     resource_id:new_user._id,
        //     register_date_time:getDateTime()
        // };
        // await SchemaModels.HistoryModel.create(history_model);
        return new_user;
    }

     async updateProfile(data) {
        await this.checkEmailAndAliasExists(data.user_id, null, data.alias);
     const update_data = {
         fn: data.first_name,
         ln: data.last_name,
         alias: data.alias,
     };
         if (data.password) {
             update_data.password = makeHash(data.password);
         }
         const new_user = await this.collection.findOneAndUpdate({_id:data.user_id},
             {$set:update_data},{new:true,projection:{fn:1,ln:1,alias:1}});
         if (!new_user) {
             throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_RESOURCE_FOUND, "user");
         }
        // const history_model = {
        //     sender_type: SENDER_TYPE.ADMIN,
        //     activity:ACTIVITY_TEXT_LOG.CREATE_USER,
        //     sender_id:data.user_id,
        //     resource_type:RESOURCE_TYPE.MODERATOR,
        //     resource_id:new_user._id,
        //     register_date_time:getDateTime()
        // };
        // await SchemaModels.HistoryModel.create(history_model);
        return new_user;
    }

    async update(data) {
        await this.checkEmailAndAliasExists(data.id, data.user.email, data.user.alias);
        const user = await this.collection.findOne({_id: data.id});
        const update_data = {
            email: data.user.email,
            fn: data.user.fn,
            ln: data.user.ln,
            status: data.user.status,
            alias: data.user.alias,
            user_level_access: data.user.user_level_access,
            last_edit_time: getDateTime()
        };
        // const fields = [];
        // for (const key in update_data) {
        //     if ((user[key] === undefined && hasValue(update_data[key])) || user[key].toString() !== update_data[key].toString()) {
        //         fields.push({key, old_value: user[key], new_value: update_data[key]});
        //     }
        // }
        // if (fields.length > 0){
        //     const history_model = {
        //         sender_type: SENDER_TYPE.ADMIN,
        //         activity: ACTIVITY_TEXT_LOG.UPDATE_USER,
        //         sender_id: data.user_id,
        //         resource_type: RESOURCE_TYPE.MODERATOR,
        //         resource_id: user._id,
        //         fields,
        //         register_date_time: getDateTime()
        //     };
        //     await SchemaModels.HistoryModel.create(history_model);
        // }
        if (data.user.password) {
            update_data.password = makeHash(data.user.password);
        }
        const new_user = await this.collection.findOneAndUpdate({_id: data.id},
            {$set: update_data}, {new: true});
        if (!new_user) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_RESOURCE_FOUND, "user");
        }
        return new_user;
    }

    async delete(id, user_id) {
        const user = await this.collection.findOne({_id: id});
        if (!user) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_RESOURCE_FOUND, "user");
        }
        const is_user_use_in_comment = await SchemaModels.CommentSubmitReportModel.findOne({
            moderator_user_id: id
        });
        if (is_user_use_in_comment) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.CUSTOM, "user used in comment");
        }
        const is_user_use_in_program = await SchemaModels.ProgramModel.findOne({
            "moderator_users.moderator_user_id": id
        });
        if (is_user_use_in_program) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.CUSTOM, "user used in program");
        }
        await this.collection.deleteOne({_id: id});
        // const history_model = {
        //     sender_type: SENDER_TYPE.ADMIN,
        //     activity: ACTIVITY_TEXT_LOG.DELETE_USER,
        //     sender_id: user_id,
        //     resource_type: RESOURCE_TYPE.MODERATOR,
        //     resource_id: user._id,
        //     info_fields:[{key: "user",value:user}],
        //     register_date_time: getDateTime()
        // };
        // await SchemaModels.HistoryModel.create(history_model);
    }

    async updateAvatar(_id, avatar) {
        await this.collection.updateOne({_id}, {$set: {avatar}});
    }

    async deleteAvatar(_id) {
        await this.collection.updateOne({_id}, {$set: {avatar: ""}});
    }

    async statistics(user_id, user_level_access) {
        let admin = {
            hackers_count: 0,
            verify_users: 0,
            verified_hackers_count: 0,
            not_verified_hackers_count: 0,
            pending_identified_hackers_count: 0,
            approved_identified_hackers_count: 0,
            champions_count: 0,
            hackers_sb_coins: 0,
            withdraws_count: 0,
            paid_withdraws_count: 0,
            pending_withdraws_count: 0,
            money_paid: 0,
            companies_count: 0,
            verified_companies_count: 0,
            verified_by_admin_companies_count: 0,
            approved_programs_count: 0,
            pending_programs_count: 0,
            open_report_count: 0,
            close_report_count: 0,
            pending_report_count: 0,
            two_days_pass_pending_report_count: 0,
            three_days_pass_triage_report_count: 0,
            ten_days_pass_resolved_and_not_pay_report_count: 0,
            ten_days_pass_approved_and_not_pay_report_count: 0
        };
        let moderator = {
            approved_programs_count: 0,
            pending_programs_count: 0,
            open_report_count: 0,
            close_report_count: 0,
            pending_report_count: 0,
            two_days_pass_pending_report_count: 0,
            three_days_pass_triage_report_count: 0,
            ten_days_pass_resolved_and_not_pay_report_count: 0,
            ten_days_pass_approved_and_not_pay_report_count: 0
        };
        const miliseconds_of_day = TIMES_NUMBER.HOURS_OF_DAY * TIMES_NUMBER.MINUTES_OF_HOUR * TIMES_NUMBER.MILISECONDS_OF_SECOND;
        if (user_level_access === toNumber(ADMIN_ROLES.ADMIN)) {
            const hackers_statistics = await SchemaModels.HackerUserModel.aggregate([
                {
                    $facet: {
                        verify_users : [{
                            $addFields: {
                                is_user_verify: {
                                    $cond: [{
                                        $and: [
                                            {$eq: ["$identity_passport_file_status", HACKER_IDENTITY_STATUS.APPROVED]},
                                            {$gt: ["$country_id", null]}, {$ne: ["$country_id", undefined]}, {$ne: ["$country_id", '']}, {$ne: ["$country_id", {}]},
                                            {$gt: ["$incoming_range_id", null]}, {$ne: ["$incoming_range_id", '']}, {$ne: ["$incoming_range_id", {}]},
                                            {$gt: ["$address1", null]}, {$ne: ["$address1", '']}, {$gte: ["$competency_profile", 1]}, {$gte: [{$size: "$skills"}, 1]},
                                            {$or: [{$eq: ["$identity_card_file_status", HACKER_IDENTITY_STATUS.APPROVED]}, {$eq: ["$identity_driver_file_status", HACKER_IDENTITY_STATUS.APPROVED]}]},
                                        ]
                                    }, true, false]
                                }
                            }
                        },
                            {$match: {$expr: {$eq: ["$is_user_verify", true]}}}, {$count: "count"}],
                         champions_count: [{$addFields: {is_champion: {$cond: [{$in: [HACKER_TAGS.CHAMPION, {$ifNull: ["$tag", []]}]}, true, false]}}},
                            {$match: {$expr: {$eq: ["$is_champion", true]}}}, {$count: "count"}],
                        hackers_count: [{$count: "count"}],
                        verified_hackers_count: [{$match: {is_verify: true}}, {$count: "count"}],
                        not_verified_hackers_count: [{$match: {$or: [{is_verify: {$exists: false}}, {is_verify: false}]}}, {$count: "count"}],
                        pending_identified_hackers_count: [{
                            $match: {
                                $or: [
                                    {$and: [{identity_passport_file_status: 0}, {identity_passport_file: {$ne: null}}]},
                                    {$and: [{identity_card_file_status: 0}, {identity_card_file: {$ne: null}}]},
                                    {$and: [{identity_driver_file_status: 0}, {identity_driver_file: {$ne: null}}]}
                                ]
                            }
                        }, {$count: "count"}],
                        approved_identified_hackers_count: [{
                            $match: {
                                $or: [
                                    {identity_passport_file_status: 1},
                                    {identity_card_file_status: 1}, {identity_driver_file_status: 1}
                                ]
                            }
                        }, {$count: "count"}],
                        hackers_sb_coins: [{$match: {sb_coin: {$exists: true}}}, {
                            $group: {
                                _id: null,
                                sb_coins: {$sum: "$sb_coin"}
                            }
                        }]
                    }
                },
                {
                    $project: {
                        verify_users : {$arrayElemAt: ["$verify_users.count", 0]},
                        champions_count: {$arrayElemAt: ["$champions_count.count", 0]},
                        hackers_count: {$arrayElemAt: ["$hackers_count.count", 0]},
                        verified_hackers_count: {$arrayElemAt: ["$verified_hackers_count.count", 0]},
                        not_verified_hackers_count: {$arrayElemAt: ["$not_verified_hackers_count.count", 0]},
                        pending_identified_hackers_count: {$arrayElemAt: ["$pending_identified_hackers_count.count", 0]},
                        approved_identified_hackers_count: {$arrayElemAt: ["$approved_identified_hackers_count.count", 0]},
                        hackers_sb_coins: {$arrayElemAt: ["$hackers_sb_coins.sb_coins", 0]}
                    }
                }]);
            const payments_statistics = await SchemaModels.PaymentModel.aggregate([
                {
                    $facet: {
                        withdraws_count: [{$count: "count"}],
                        paid_withdraws_count: [{$match: {status: WITHDRAW_STATUS.PAID}}, {$count: "count"}],
                        money_paid: [{$match: {status: WITHDRAW_STATUS.PAID}}, {
                            $group: {
                                _id: null,
                                amounts: {$sum: "$amount"}
                            }
                        }],
                        pending_withdraws_count: [{$match: {$or: [{status: {$exists: false}}, {status: WITHDRAW_STATUS.PENDING}]}}, {$count: "count"}]
                    }
                },
                {
                    $project: {
                        withdraws_count: {$arrayElemAt: ["$withdraws_count.count", 0]},
                        paid_withdraws_count: {$arrayElemAt: ["$paid_withdraws_count.count", 0]},
                        pending_withdraws_count: {$arrayElemAt: ["$pending_withdraws_count.count", 0]},
                        money_paid: {$arrayElemAt: ["$money_paid.amounts", 0]}
                    }
                }
            ]);
            const companies_statistics = await SchemaModels.CompanyUserModel.aggregate([
                {
                    $facet: {
                        companies_count: [{$count: "count"}],
                        verified_companies_count: [{$match: {is_verify: true}}, {$count: "count"}],
                        verified_by_admin_companies_count: [{$match: {admin_verify: true}}, {$count: "count"}],
                    }
                },
                {
                    $project: {
                        companies_count: {$arrayElemAt: ["$companies_count.count", 0]},
                        verified_companies_count: {$arrayElemAt: ["$verified_companies_count.count", 0]},
                        verified_by_admin_companies_count: {$arrayElemAt: ["$verified_by_admin_companies_count.count", 0]}
                    }
                }
            ]);
            admin = Object.assign(admin, hackers_statistics[0], payments_statistics[0], companies_statistics[0]);
        }
        let program_ids = [];
        if (user_level_access === toNumber(ADMIN_ROLES.MODERATOR)) {
            program_ids = await SchemaModels.ProgramModel.find({
                moderator_users: {$elemMatch: {moderator_user_id: user_id}}
            }).select({_id: 1});
            program_ids = program_ids && program_ids.length > 0
                ? program_ids.map(d => d._id.toString()) : [];
        }
        const programs_statistics = await SchemaModels.ProgramModel.aggregate([
            ...(user_level_access === toNumber(ADMIN_ROLES.MODERATOR)
                ? [{$match: {_id: {$in: program_ids.map(d => toObjectID(d))}}}]
                : []),
            {
                $facet: {
                    approved_programs_count: [{
                        $match: {
                            status: PROGRAM_STATUS.APPROVED
                        }
                    }, {$count: "count"}],
                    pending_programs_count: [{
                        $match: {
                            status: PROGRAM_STATUS.PENDING
                        }
                    }, {$count: "count"}]
                }
            },
            {
                $project: {
                    approved_programs_count: {$arrayElemAt: ["$approved_programs_count.count", 0]},
                    pending_programs_count: {$arrayElemAt: ["$pending_programs_count.count", 0]}
                }
            }
        ]);
        const report_statistics = await SchemaModels.SubmitReportModel.aggregate([
            ...(user_level_access === toNumber(ADMIN_ROLES.ADMIN)
                ? [{$match: {status: {$gt: REPORT_STATUS.NONE}}}]
                : user_level_access === toNumber(ADMIN_ROLES.MODERATOR)
                    ? [{$match: {$and: [{status: {$gt: REPORT_STATUS.NONE}}, {program_id: {$in: program_ids.map(d => toObjectID(d))}}]}}]
                    : []),
            {$addFields: {current_date_time: {$toDate: getCurrentDate()}}},
            {
                $facet: {
                    open_report_count: [{$match: {is_close: REPORT_ACTIVITY.OPEN}}, {$count: "count"}],
                    close_report_count: [{$match: {is_close: REPORT_ACTIVITY.CLOSE}}, {$count: "count"}],
                    pending_report_count: [{$match: {status: REPORT_STATUS.PENDING}}, {$count: "count"}],
                    two_days_pass_pending_report_count: [{$match: {status: REPORT_STATUS.PENDING}},
                        {$addFields: {two_days_pass_date_time: {$subtract: ["$current_date_time", 2 * miliseconds_of_day]}}},
                        {$match: {$expr: {$gt: ["$submit_date_time", "$two_days_pass_date_time"]}}}, {$count: "count"}],
                    three_days_pass_triage_report_count: [{$match: {status: REPORT_STATUS.TRIAGE}},
                        {$addFields: {three_days_pass_date_time: {$subtract: ["$current_date_time", 3 * miliseconds_of_day]}}},
                        {$match: {$expr: {$gt: ["$submit_date_time", "$three_days_pass_date_time"]}}}, {$count: "count"}],
                    ten_days_pass_approved_and_not_pay_report_count: [{$match: {$and: [{status: REPORT_STATUS.APPROVE}, {$or: [{pay_price: {$exists: false}}, {pay_price: {$lte: 0}}]}]}},
                        {$addFields: {ten_days_pass_date_time: {$subtract: ["$current_date_time", 10 * miliseconds_of_day]}}},
                        {$match: {$expr: {$gt: ["$submit_date_time", "$ten_days_pass_date_time"]}}}, {$count: "count"}],
                    ten_days_pass_resolved_and_not_pay_report_count: [{$match: {$and: [{status: REPORT_STATUS.RESOLVED}, {$or: [{pay_price: {$exists: false}}, {pay_price: {$lte: 0}}]}]}},
                        {$addFields: {ten_days_pass_date_time: {$subtract: ["$current_date_time", 10 * miliseconds_of_day]}}},
                        {$match: {$expr: {$gt: ["$submit_date_time", "$ten_days_pass_date_time"]}}}, {$count: "count"}]
                }
            },
            {
                $project: {
                    open_report_count: {$arrayElemAt: ["$open_report_count.count", 0]},
                    close_report_count: {$arrayElemAt: ["$close_report_count.count", 0]},
                    pending_report_count: {$arrayElemAt: ["$pending_report_count.count", 0]},
                    two_days_pass_pending_report_count: {$arrayElemAt: ["$two_days_pass_pending_report_count.count", 0]},
                    three_days_pass_triage_report_count: {$arrayElemAt: ["$three_days_pass_triage_report_count.count", 0]},
                    ten_days_pass_resolved_and_not_pay_report_count: {$arrayElemAt: ["$ten_days_pass_resolved_and_not_pay_report_count.count", 0]},
                    ten_days_pass_approved_and_not_pay_report_count: {$arrayElemAt: ["$ten_days_pass_approved_and_not_pay_report_count.count", 0]}
                }
            }
        ]);
        let response = null;
        if (user_level_access === toNumber(ADMIN_ROLES.ADMIN)) {
            response = Object.assign({}, admin);
        } else if (user_level_access === toNumber(ADMIN_ROLES.MODERATOR)) {
            response = Object.assign({}, moderator);
        }
        if (response) {
            response = Object.assign(response, report_statistics[0], programs_statistics[0]);
            return Object.keys(response).map((key) => {
                return {name: key, value: response[key]}
            });
        }
        return [];
    }

    async getUserData(user) {
        const avatar = !isUndefined(user.avatar) && user.avatar !== "" ? `${AppConfig.API_URL}${user.avatar}` : "";
        const first_name = user.fn || "";
        const last_name = user.ln || "";
        const email = user.email || "";
        const alias = user.alias || "";
        const role = user.user_level_access === toNumber(ADMIN_ROLES.ADMIN) ? ADMIN_ROLES_NAME.ADMIN
            : user.user_level_access === toNumber(ADMIN_ROLES.MODERATOR) ? ADMIN_ROLES_NAME.MODERATOR : "";
        return {avatar, first_name, last_name, email, role,alias}
    }

    async refreshToken(data) {
        const token_data = await getHash(`login:${data.token}`);
        if (!token_data || !token_data.user_id ||
            !token_data.token || !token_data.refresh_token) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_VALID, "x-token", true);
        }
        // if (!isObjectID(token_data.user_id)) {
        //     throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_VALID, "x-token", true);
        // }
        // const user_exists = await SchemaModels.ModeratorUserModel.find(
        //     {_id: mongoose.Types.ObjectId(token_data.user_id)}).countDocuments();
        // if (user_exists !== 1) {
        //     throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_VALID, "x-token", true);
        // }
        if (token_data.refresh_token !== data.refresh_token) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_VALID, "x-refresh-token", true);
        }
        return await createTokens(token_data.user_id, token_data.token);
    }

    async checkEmailAndAliasExists(id, email, alias) {
        let email_count;
        if (id && email) {
            email_count = await this.collection.countDocuments({_id: {$ne: id}, email});
        } else if (email) {
            email_count = await this.collection.countDocuments({email});
        }
        if (email_count) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.EXIST, "email");
        }
        let alias_count;
        if (id && alias) {
            alias_count = await this.collection.countDocuments({_id: {$ne: id}, alias});
        } else if (alias) {
            alias_count = await this.collection.countDocuments({alias});
        }
        if (alias_count) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.EXIST, "alias");
        }
    }

    async selectList(data) {
        const filters = [];
        filters.push({status: true});
        filters.push({user_level_access: {$in: [toNumber(ADMIN_ROLES.MODERATOR)]}});
        if (data.program_id) {
            const program = await SchemaModels.ProgramModel.findOne({_id: data.program_id})
                .select({moderator_users: 1}).lean();
            if (program && isArray(program.moderator_users)) {
                const program_moderator_ids = program.moderator_users.map(d => d.moderator_user_id.toString());
                filters.push({_id: {$nin: program_moderator_ids}});
            }
        }
        const moderators = await this.collection.find({$and: filters}).select({_id: 1, email: 1}).lean();
        return moderators.map(d => {
            return {title: d.email, value: d._id}
        })
    }

    async predata() {
        const response = {};
        response.countries = await SchemaModels.CountryModel.find({}).select({_id: 1, title: 1});
        response.currencies = await SchemaModels.CurrencyModel.find({}).select({_id: 1, title: 1});
        response.skills = await SchemaModels.SkillsModel.find({}).select({_id: 1, title: 1});
        response.ranges = await SchemaModels.RangeModel.find({}).select({_id: 1, title: 1});
        return response;
    }

    sendNotification(emit_name, socketIO, user_id, notifications) {
        if (socketIO && socketIO["sockets"] && socketIO["sockets"].size > 0 && socketIO["to"]) {
            const sockets_info = convertSetOrMapToArray(socketIO["sockets"]);
            if (sockets_info.length > 0) {
                sockets_info.forEach(s => {
                    if (s.data && s.data._id) {
                        const notification = notifications.find(n => n[user_id].toString() === s.data._id.toString());
                        if (notification) {
                            socketIO["to"](s.id.toString()).emit(emit_name, {
                                title: notification.title,
                                text: notification.text,
                                date: notification.register_date_time,
                                message_type: notification.message_type,
                                id: notification._id
                            });
                        }
                    }
                });
            }
        }
    }

    getMessageType(type) {
        switch (type) {
            case 'info':
                return MESSAGE_TYPE.INFO;
            case 'success':
                return MESSAGE_TYPE.SUCCESS;
            case 'warning':
                return MESSAGE_TYPE.WARNING;
            case 'danger':
                return MESSAGE_TYPE.DANGER;
        }
    }

    createNotification(title, text, field_type, hacker_user_id, company_user_id, message_type, moderator_user_id, resource_type) {
        const notification = {
            title,
            text,
            status: NOTIFICATION_STATUS.SEND,
            field_type,
            register_date_time: getDateTime(),
            sender_type: SENDER_TYPE.ADMIN,
            resource_type,
            message_type,
            action_type: ACTION_TYPE.CREATE,
            moderator_user_id,
        };
        if (hacker_user_id) {
            notification.hacker_user_id = hacker_user_id;
        } else if (company_user_id) {
            notification.company_user_id = company_user_id;
        }
        return notification;
    }
}

module.exports = new ModeratorUserModel();