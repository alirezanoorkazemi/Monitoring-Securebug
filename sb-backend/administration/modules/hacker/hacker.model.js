const {ErrorHelper} = require('../../../libs/error.helper');
const {updateHackerRank, checkCountryId, checkRangeId, checkCurrencyId, checkUserAccess} = require('../../init');
const {getDateTime} = require('../../../libs/date.helper');
const {makeHash} = require('../../../libs/token.helper');
const {
    HACKER_IDENTITY_STATUS, PAYMENT_DEFAULT, HACKER_IDENTITY_TYPE,
    HACKER_PAYMENT_STATUS, NOTIFICATION_STATUS, REPORT_STATUS, STATIC_VARIABLES,
    HACKER_TAGS, MESSAGE_TYPE, ADMIN_ROLES, REPORT_SEVERITY, PAYMENT_HISTORY_TYPE,
    SENDER_TYPE, RESOURCE_TYPE, ACTION_TYPE, FIELD_TYPE, ACTIVITY_TEXT_LOG, TWO_FA_STATUS
} = require('../../../libs/enum.helper');
const hackerIO = require("../../../io/hacker");
const {
    hasValue, setPaginationResponse, toNumber, sendMail,
    convertSetOrMapToArray, toObjectID, isArray, isObjectID
} = require('../../../libs/methode.helper');

class HackerUserModel {
    constructor() {
        this.collection = SchemaModels.HackerUserModel;
    }

    async getHacker(_id) {
        return await this.collection.findOne({_id});
    }

    async deleteAvatar(_id) {
        await this.collection.updateOne({_id}, {$set: {avatar_file: ""}});
    }

    async updateAvatar(_id, avatar_file) {
        await this.collection.updateOne({_id}, {$set: {avatar_file}});
    }

    async gets(data) {
        if (data.user_level_access === toNumber(ADMIN_ROLES.MODERATOR)) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_PERMISSON);
        }
        if (hasValue(data.select_term)) {
            return await this.collection.aggregate([
                {
                    $match: {
                        username: {$regex: ".*" + data.select_term + ".*", $options: "i"},
                        account_is_disable: false,
                        status: true,
                        is_verify: true
                    }
                },
                {$sort: {"username": -1}},
                {$project: {value: "$_id", title: "$username", avatar: "$avatar_file"}}
            ])
        }
        const filters = [];
        if (hasValue(data.email)) {
            filters.push({email: {$regex: ".*" + data.email + ".*", $options: "i"}});
        }
        if (hasValue(data.first_name)) {
            filters.push({fn: {$regex: ".*" + data.first_name + ".*", $options: "i"}});
        }
        if (hasValue(data.last_name)) {
            filters.push({ln: {$regex: ".*" + data.last_name + ".*", $options: "i"}});
        }
        if (hasValue(data.country_id)) {
            filters.push({country_id: toObjectID(data.country_id)});
        }
        if (hasValue(data.username)) {
            filters.push({username: {$regex: ".*" + data.username + ".*", $options: "i"}});
        }
        if (hasValue(data.is_verify)) {
            if (data.is_verify === true) {
                filters.push({is_verify: data.is_verify});
            } else {
                filters.push({$or: [{is_verify: data.is_verify}, {is_verify: {$exists: false}}]});
            }
        }
        if (hasValue(data.status)) {
            if (data.status === true) {
                filters.push({status: data.status});
            } else {
                filters.push({$or: [{status: data.status}, {status: {$exists: false}}]});
            }
        }
        if (hasValue(data.identity)) {
            filters.push({
                $or: [{$and: [{identity_passport_file_status: data.identity}, {identity_passport_file: {$ne: null}}]},
                    {$and: [{identity_card_file_status: data.identity}, {identity_card_file: {$ne: null}}]},
                    {$and: [{identity_driver_file_status: data.identity}, {identity_driver_file: {$ne: null}}]}]
            });
        }
        const hackers = await this.collection.aggregate([
            ...(filters.length > 0 ? [{$match: {$and: filters}}] : []),
            {
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
            ...(HACKER_TAGS.VALUES.includes(data.tag) ? [{$addFields: {has_tag: {$cond: [{$in: [data.tag, {$ifNull: ["$tag", []]}]}, true, false]}}},
                {$match: {$expr: {$eq: ["$has_tag", true]}}}] : []),
            ...(hasValue(data.user_verify) ? [
                {$match: {$expr: {$eq: ["$is_user_verify", data.user_verify]}}}] : []),
            ...(data.withdraw ? [{
                $lookup: {
                    from: "payments", let: {hacker_id: "$_id"},
                    pipeline: [
                        {$match: {$expr: {$eq: ["$$hacker_id", "$hacker_user_id"]}}},
                        {
                            $group: {
                                _id: "$status"
                            }
                        }], as: 'withdraw_types'
                }
            }, {
                $addFields: {
                    pending_index: {
                        $indexOfArray: ["$withdraw_types._id", HACKER_PAYMENT_STATUS.PENDING]
                    },
                    paid_index: {
                        $indexOfArray: ["$withdraw_types._id", HACKER_PAYMENT_STATUS.APPROVED]
                    },
                    rejected_index: {
                        $indexOfArray: ["$withdraw_types._id", HACKER_PAYMENT_STATUS.REJECTED]
                    }
                }
            }, {
                $match: {
                    $expr: {
                        $or: [{
                            $and: [{$eq: [data.withdraw, 'all_withdraw']}, {
                                $or: [{$gte: ["$pending_index", 0]}, {$gte: ["$paid_index", 0]},
                                    {$gte: ["$rejected_index", 0]}
                                ]
                            }]
                        },
                            {$and: [{$eq: [data.withdraw, 'pending_withdraw']}, {$gte: ["$pending_index", 0]}]},
                            {$and: [{$eq: [data.withdraw, 'paid_withdraw']}, {$gte: ["$paid_index", 0]}]}]
                    }
                }
            }] : []),
            {$sort: {"register_date_time": -1}},
            {
                $facet: {
                    total_count: [{$count: "count"}],
                    rows: [{$skip: (data.page - 1) * data.limit}, {$limit: data.limit},
                        {
                            $addFields: {
                                basic_kyc: {
                                    $cond: {
                                        if: {
                                            $and: [
                                                {$gt: [{$strLenCP: {$ifNull: ["$fn", ""]}}, 0]},
                                                {$gt: [{$strLenCP: {$ifNull: ["$ln", ""]}}, 0]},
                                                {$gt: [{$strLenCP: {$ifNull: ["$address1", ""]}}, 0]},
                                                {$gt: [{$strLenCP: {$ifNull: [{$toString: "$country_id"}, ""]}}, 0]},
                                                {$gt: [{$strLenCP: {$ifNull: [{$toString: "$incoming_range_id"}, ""]}}, 0]},
                                                {$gt: ["$competency_profile", 0]},
                                                {$gt: [{$size: {$ifNull: ["$skills", []]}}, 0]},
                                            ]
                                        }, then: true, else: false
                                    }
                                }
                            }
                        },
                        {
                            $addFields: {
                                advanced_kyc: {
                                    $cond: {
                                        if: {
                                            $and: [
                                                {$eq: ["$basic_kyc", true]},
                                                {$eq: ["$identity_passport_file_status", HACKER_IDENTITY_STATUS.APPROVED]}
                                            ]
                                        },
                                        then: true,
                                        else: false
                                    }
                                }
                            }
                        },
                        {$addFields: {has_2fa: {$and: [{$ne: ["$google_towfa_secret_key", '']}, {$ne: ["$google_towfa_secret_key", null]}, {$eq: ["$google_towfa_status", TWO_FA_STATUS.ENABLED]}]}}},
                        {
                            $lookup: {
                                from: 'countries',
                                localField: 'country_id',
                                foreignField: '_id',
                                as: 'country_id'
                            }
                        },
                        {$unwind: {path: "$country_id", preserveNullAndEmptyArrays: true}},
                        {
                            $project: {
                                _id: 1, user_id: 1, email: 1, username: 1, account_is_disable: 1,
                                user_verify: "$is_user_verify", fn: 1, ln: 1, status: 1, register_date_time: 1,
                                basic_kyc: 1, rank: 1, has_2fa: 1, verify_date_time: 1, avatar_file: 1,
                                is_verify: 1, advanced_kyc: 1, country_id: 1
                            }
                        }]
                }
            }
        ]);
        return setPaginationResponse(hackers, data.limit, data.page);
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

    async changeStatus(data) {
        const hacker = await this.collection.findOneAndUpdate({_id: data.id}, {$set: {status: data.status}});
        if (!hacker) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_RESOURCE_FOUND, "hacker");
        }
        // if (hacker.status !== data.status){
        //     const history_model = {
        //         sender_type: SENDER_TYPE.ADMIN,
        //         activity: ACTIVITY_TEXT_LOG.CHANGE_STATUS,
        //         sender_id: data.user_id,
        //         resource_type: RESOURCE_TYPE.HACKER,
        //         resource_id: hacker._id,
        //         fields:[{key:"status",old_value:hacker.status, new_value:data.status}],
        //         register_date_time: getDateTime()
        //     };
        //     await SchemaModels.HistoryModel.create(history_model);
        // }
        const notification = await this.createNotification("Account Status",
            `${hacker.fn}, Admin has changed your account status to ${data.status ? "active" : "inactive"}`,
            FIELD_TYPE.STATUS, data.id, data.status === true ?
                MESSAGE_TYPE.SUCCESS : MESSAGE_TYPE.DANGER, data.user_id);

        this.sendNotification("notification", data.id, notification.title,
            notification.text, notification.register_date_time, notification.message_type,
            notification._id, notification.resource_type, notification.field_type);
    }

    async assignTag(data) {
        const hacker = await this.collection.findOneAndUpdate({_id: data.id}, {$set: {tag: data.tag}});
        if (!hacker) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_RESOURCE_FOUND, "hacker");
        }
        let text = "removed";
        let title = "Permission Status";
        let tag = "";
        if (hacker.tag.length > 0) {
            if (hacker.tag.includes(HACKER_TAGS.CHAMPION) && !data.tag.includes(HACKER_TAGS.CHAMPION)) {
                tag += tag.length > 0 ? " & Securebug Champion" : "Securebug Champion";
            }
            if (hacker.tag.includes(HACKER_TAGS.INTELLIGENCE_DISCOVERY) && !data.tag.includes(HACKER_TAGS.INTELLIGENCE_DISCOVERY)) {
                tag += tag.length > 0 ? " & Intelligence Discovery" : "Intelligence Discovery";
            }
            if (hacker.tag.includes(HACKER_TAGS.INTERNAL_USER) && !data.tag.includes(HACKER_TAGS.INTERNAL_USER)) {
                tag += tag.length > 0 ? " & Internal User" : "Internal User";
                await this.setHackersRank();
            }
        }
        let is_chosen = false;
        if (data.tag.length > 0) {
            if (data.tag.includes(HACKER_TAGS.CHAMPION) && !hacker.tag.includes(HACKER_TAGS.CHAMPION)) {
                tag += tag.length > 0 ? " & Securebug Champion" : "Securebug Champion";
                is_chosen = true;
            }
            if (data.tag.includes(HACKER_TAGS.INTELLIGENCE_DISCOVERY) && !hacker.tag.includes(HACKER_TAGS.INTELLIGENCE_DISCOVERY)) {
                tag += tag.length > 0 ? " & Intelligence Discovery" : "Intelligence Discovery";
                is_chosen = true;
            }
            if (data.tag.includes(HACKER_TAGS.INTERNAL_USER) && !hacker.tag.includes(HACKER_TAGS.INTERNAL_USER)) {
                tag += tag.length > 0 ? " & Internal User" : "Internal User";
                is_chosen = true;
                const internal_user_data = {
                    reputaion_log: [],
                    reputaion: 0,
                    point: 0,
                    sb_coin: 0,
                    rank: null,
                    point_log: [],
                    coin_log: []
                };
                await this.setHackersRank();
                await this.collection.updateOne({_id: data.id}, {$set: internal_user_data});
            }
            if (is_chosen) {
                text = "chosen";
                title = "Congratulation";
            }
            if (data.tag.includes(HACKER_TAGS.CHAMPION) && (!hacker.tag || !hacker.tag.includes(HACKER_TAGS.CHAMPION))) {
                const htmlEmailTemplate = emailTemplateForChampionsHackers(hacker.fn);
                sendMail(hacker.email, "You have been selected as one of the SecureBug Champions!", htmlEmailTemplate);
            }
        }
        // let add_history = false;
        // data.tag.forEach(t => {
        //     if (!hacker.tag.includes(t)) {
        //         add_history = true;
        //     }
        // });
        // hacker.tag.forEach(t => {
        //     if (!data.tag.includes(t)) {
        //         add_history = true;
        //     }
        // });
        // if (add_history){
        //     const history_model = {
        //         sender_type: SENDER_TYPE.ADMIN,
        //         activity: ACTIVITY_TEXT_LOG.ASSIGN_TAG,
        //         sender_id: data.user_id,
        //         resource_type: RESOURCE_TYPE.HACKER,
        //         resource_id: hacker._id,
        //         fields:[{key:"tag",old_value:hacker.tag, new_value:data.tag}],
        //         register_date_time: getDateTime()
        //     };
        //     await SchemaModels.HistoryModel.create(history_model);
        // }
        const notification = await this.createNotification(title,
            `${hacker.fn}, Admin has ${text} your account as an ${tag}`,
            FIELD_TYPE.TAG, data.id, is_chosen ?
                MESSAGE_TYPE.SUCCESS : MESSAGE_TYPE.DANGER, data.user_id);

        this.sendNotification("notification", data.id, notification.title,
            notification.text, notification.register_date_time, notification.message_type,
            notification._id, notification.resource_type, notification.field_type);
    }

    async changeVerify(data) {
        const hacker = await this.collection.findOneAndUpdate({_id: data.id}, {$set: {is_verify: data.is_verify}},
            {projection: {fn: 1, is_verify: 1}});
        if (!hacker) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_RESOURCE_FOUND, "hacker");
        }
        // if (hacker.is_verify !== data.is_verify){
        //     const history_model = {
        //         sender_type: SENDER_TYPE.ADMIN,
        //         activity: ACTIVITY_TEXT_LOG.CHANGE_VERIFICATION,
        //         sender_id: data.user_id,
        //         resource_type: RESOURCE_TYPE.HACKER,
        //         resource_id: hacker._id,
        //         fields:[{key:"is_verify",old_value:hacker.is_verify, new_value:data.is_verify}],
        //         register_date_time: getDateTime()
        //     };
        //     await SchemaModels.HistoryModel.create(history_model);
        // }
        const notification = await this.createNotification("Account Verification",
            `${hacker.fn}, Admin has changed your account verification to ${data.is_verify ? "valid" : "invalid"}`,
            FIELD_TYPE.VERIFICATION, data.id, data.is_verify ?
                MESSAGE_TYPE.SUCCESS : MESSAGE_TYPE.DANGER, data.user_id);

        this.sendNotification("notification", data.id, notification.title,
            notification.text, notification.register_date_time, notification.message_type,
            notification._id, notification.resource_type, notification.field_type);
    }

    async changeActivity(data) {
        const hacker = await this.collection.findOneAndUpdate({_id: data.id}, {$set: {account_is_disable: data.account_is_disable}});
        if (!hacker) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_RESOURCE_FOUND, "hacker");
        }
        // if (hacker.account_is_disable !== data.account_is_disable){
        //     const history_model = {
        //         sender_type: SENDER_TYPE.ADMIN,
        //         activity: ACTIVITY_TEXT_LOG.CHANGE_ACTIVITY,
        //         sender_id: data.user_id,
        //         resource_type: RESOURCE_TYPE.HACKER,
        //         resource_id: hacker._id,
        //         fields:[{key:"account_is_disable",old_value:hacker.account_is_disable, new_value:data.account_is_disable}],
        //         register_date_time: getDateTime()
        //     };
        //     await SchemaModels.HistoryModel.create(history_model);
        // }
        const notification = await this.createNotification("Disable Account",
            `${hacker.fn}, Admin has changed your account disable request to ${data.account_is_disable ? "inactive" : "active"}`,
            FIELD_TYPE.ACTIVITY, data.id, data.account_is_disable ?
                MESSAGE_TYPE.DANGER : MESSAGE_TYPE.SUCCESS, data.user_id);

        this.sendNotification("notification", data.id, notification.title,
            notification.text, notification.register_date_time, notification.message_type,
            notification._id, notification.resource_type, notification.field_type);
    }

    async changeIdentityStatus(data) {
        let notification_title;
        let updating_data;
        let history_key;
        switch (data.type) {
            case HACKER_IDENTITY_TYPE.PASSPORT:
                notification_title = "Passport";
                updating_data = {identity_passport_file_status: data.status};
                history_key = "identity_passport_file_status";
                break;
            case HACKER_IDENTITY_TYPE.CARD:
                notification_title = "Identity Card";
                updating_data = {identity_card_file_status: data.status};
                history_key = "identity_card_file_status";
                break;
            case HACKER_IDENTITY_TYPE.DRIVER:
                notification_title = "Driver License";
                updating_data = {identity_driver_file_status: data.status};
                history_key = "identity_driver_file_status";
                break;
        }
        let identity_status;
        switch (data.status) {
            case HACKER_IDENTITY_STATUS.APPROVED:
                identity_status = "accept";
                break;
            case HACKER_IDENTITY_STATUS.REJECTED:
                identity_status = "reject";
                break;
            case HACKER_IDENTITY_STATUS.PENDING:
                identity_status = "pending";
                break;
        }

        const hacker = await this.collection.findOneAndUpdate({_id: data.id}, {$set: updating_data});
        if (!hacker) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_RESOURCE_FOUND, "hacker");
        }
        if (data.status === HACKER_IDENTITY_STATUS.REJECTED) {
            const htmlRejectIdentityEmailTemplate = generateEmailTemplate("hacker_reject_identity", hacker.fn, {}, true);
            sendMail(hacker.email, "Identity Verification Problem", htmlRejectIdentityEmailTemplate);
        } else if (data.status === HACKER_IDENTITY_STATUS.APPROVED && !hacker.identity_send_email_by_admin) {
            let htmlTemplate = generateEmailTemplate("hacker_verify_identity", hacker.fn, {}, true);
            sendMail(hacker.email, "Your Securebug Account Identity is Verified", htmlTemplate);
            const update_data = {identity_send_email_by_admin: true};
            let coin_log = isArray(hacker.coin_log) ? hacker.coin_log : [];
            const coinIndex = coin_log.findIndex((item) => item.text.toString() === "identity_coin");
            if ((!hacker.tag.includes(HACKER_TAGS.INTERNAL_USER)) && coinIndex === -1) {
                let sb_coin = hasValue(hacker.sb_coin) ? hacker.sb_coin : 0;
                coin_log.push({"text": "identity_coin", "date_time": getDateTime(), "value": 50});
                update_data.coin_log = coin_log;
                update_data.sb_coin = sb_coin + 50;
            }
            const new_hacker = await this.collection.findOneAndUpdate({_id: data.id}, {$set: update_data}
                , {new: true, projection: {sb_coin: 1, reputaion: 1, rank: 1}});
            if ((!hacker.tag.includes(HACKER_TAGS.INTERNAL_USER)) && coinIndex === -1) {
                await updateHackerRank(new_hacker, true);
            }
        }
        // const history_model = {
        //     sender_type: SENDER_TYPE.ADMIN,
        //     activity: ACTIVITY_TEXT_LOG.UPDATE_IDENTITY_STATUS,
        //     sender_id: data.user_id,
        //     resource_type: RESOURCE_TYPE.HACKER,
        //     resource_id: data.id,
        //     fields:[{key:history_key,old_value:hacker[history_key], new_value:data.status}],
        //     register_date_time: getDateTime()
        // };
        // await SchemaModels.HistoryModel.create(history_model);
        const notification = await this.createNotification(`Verification ${notification_title}`,
            `${hacker.fn}, Admin has checked your ${notification_title} and changed its status to ${identity_status}`,
            FIELD_TYPE.IDENTITY_STATUS, data.id, data.status === HACKER_IDENTITY_STATUS.REJECTED ?
                MESSAGE_TYPE.DANGER : MESSAGE_TYPE.SUCCESS, data.user_id);

        this.sendNotification("notification", data.id, notification.title,
            notification.text, notification.register_date_time, notification.message_type,
            notification._id, notification.resource_type, notification.field_type);
    }

    async addCoin(data) {
        const hacker = await this.collection.findOne({_id: data.id}).select({coin_log: 1, sb_coin: 1, tag: 1});
        if (!hacker) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_RESOURCE_FOUND, "hacker");
        }
        if (hacker.tag.includes(HACKER_TAGS.INTERNAL_USER)) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.CUSTOM, "hacker is internal user!");
        }
        const is_text_exists = !hacker.coin_log ||
            (isArray(hacker.coin_log) && hacker.coin_log
                .findIndex(l => l.text === data.text) > -1);

        if (is_text_exists) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.CUSTOM, "text is repeated");
        }
        const updated_hacker = await this.collection.findOneAndUpdate({_id: data.id}, {
            $inc: {sb_coin: data.coin},
            $push: {coin_log: {text: data.text, date_time: getDateTime(), value: data.coin}}
        }, {new: true, projection: {sb_coin: 1, reputaion: 1, rank: 1, fn: 1}});

        await updateHackerRank(updated_hacker, data.coin > 0);
        // const history_model = {
        //     sender_type: SENDER_TYPE.ADMIN,
        //     activity: ACTIVITY_TEXT_LOG.UPDATE_SB_COINS,
        //     sender_id: data.user_id,
        //     resource_type: RESOURCE_TYPE.HACKER,
        //     resource_id: data.id,
        //     info_fields:[{key:"sb_coin",value:data.coin}],
        //     fields:[{key:"sb_coin",old_value:hacker.sb_coin, new_value:updated_hacker.sb_coin}],
        //     register_date_time: getDateTime()
        // };
        // await SchemaModels.HistoryModel.create(history_model);
        const notification = await this.createNotification(`SBCoins`,
            `${updated_hacker.fn}, Admin has ${data.coin > 0 ? "added" : "subtracted"} ${data.coin} coin(s) by the following description.
            description : ${data.text}`
            , FIELD_TYPE.COINS, data.id,
            data.coin > 0 ? MESSAGE_TYPE.SUCCESS : MESSAGE_TYPE.DANGER, data.user_id);

        this.sendNotification("notification", data.id, notification.title,
            notification.text, notification.register_date_time, notification.message_type,
            notification._id, notification.resource_type, notification.field_type);
    }

    async disable2FA(data) {
        const hacker = await this.collection.findOne({_id: data.id}).select({
            _id: 1,
            google_towfa_secret_key: 1,
            google_towfa_status: 1
        });
        if (!hacker) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_RESOURCE_FOUND, "hacker");
        }
        if (!(hasValue(hacker.google_towfa_secret_key) && hacker.google_towfa_status === TWO_FA_STATUS.ENABLED)) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.CUSTOM, "2FA already disabled");
        }
        await this.collection.updateOne({_id: data.id}, {
            $set: {
                google_towfa_secret_key: '',
                google_towfa_status: TWO_FA_STATUS.DISABLED
            }
        });
    }

    async getPayments(id) {
        const hacker_exist = await this.collection.countDocuments({_id: id});
        if (hacker_exist === 0) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_RESOURCE_FOUND, "hacker");
        }
        return await SchemaModels.PaymentModel.aggregate([
            {$match: {hacker_user_id: toObjectID(id)}},
            {
                $addFields: {
                    payment_type: {
                        $switch: {
                            branches: [
                                {case: {$eq: ["$payment_type", toNumber(PAYMENT_DEFAULT.PAYPAL)]}, then: "Paypal"},
                                {case: {$eq: ["$payment_type", toNumber(PAYMENT_DEFAULT.USDT)]}, then: "USDT"},
                                {case: {$eq: ["$payment_type", toNumber(PAYMENT_DEFAULT.BANK_TRANSFER)]}, then: "Iban"}
                            ],
                            default: ''
                        }
                    }
                }
            },
            {
                $project: {
                    amount: 1,
                    status: 1,
                    register_date_time: 1,
                    payment_date_time: 1,
                    _id: 1,
                    hacker_user_id: 1,
                    tracking_code: 1,
                    payment_type: 1
                }
            }
        ]) || [];
    }

    async changePaymentStatus(data) {
        const hacker = await this.collection.findOne({_id: data.id}).select({_id: 0, email: 1, fn: 1});
        if (!hacker) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_RESOURCE_FOUND, "hacker");
        }
        const payment = await SchemaModels.PaymentModel.findOneAndUpdate({
                _id: data.payment_id,
                hacker_user_id: data.id
            },
            {$set: {status: data.status, payment_date_time: getDateTime()}}, {
                projection: {
                    _id: 1,
                    amount: 1,
                    status: 1,
                    tracking_code: 1
                }
            });

        if (!payment) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_RESOURCE_FOUND, "payment");
        }
        if (data.status === HACKER_PAYMENT_STATUS.APPROVED) {
            const htmlTemplateHacker = generateEmailTemplate("hacker_accept_withdraw", hacker.fn, {
                amount: payment.amount,
                tracking_code: payment.tracking_code
            }, true);
            sendMail(hacker.email, "Withdrawal Successful", htmlTemplateHacker);
        }
        // const history_model = {
        //     sender_type: SENDER_TYPE.ADMIN,
        //     activity: ACTIVITY_TEXT_LOG.CHANGE_STATUS,
        //     sender_id: data.user_id,
        //     resource_type: RESOURCE_TYPE.PAYMENT,
        //     resource_id: payment._id,
        //     fields:[{key:"status",old_value:payment.status, new_value:data.status}],
        //     register_date_time: getDateTime()
        // };
        // await SchemaModels.HistoryModel.create(history_model);
        const notification = await this.createNotification("Paid Withdraw",
            `${hacker.fn}, Admin has ${data.status === HACKER_PAYMENT_STATUS.APPROVED ? "approved" : "rejected"} your payment.`,
            FIELD_TYPE.STATUS, data.id, data.status === HACKER_PAYMENT_STATUS.APPROVED ?
                MESSAGE_TYPE.SUCCESS : MESSAGE_TYPE.DANGER, data.user_id, RESOURCE_TYPE.PAYMENT);

        this.sendNotification("notification", data.id, notification.title,
            notification.text, notification.register_date_time, notification.message_type,
            notification._id, notification.resource_type, notification.field_type);
    }

    async delete(hacker_id, user_id) {
        const filter = {hacker_user_id: hacker_id};
        const ctf_flags_count = await SchemaModels.FlagCtfSubmitModel
            .findOne(filter).countDocuments();
        if (ctf_flags_count > 0) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.CUSTOM, "hacker submitted challenge flag");
        }
        const payment_history_count = await SchemaModels.PaymentHistoryModel
            .findOne(filter).countDocuments();
        if (payment_history_count > 0) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.CUSTOM, "hacker has payment");
        }

        const payment_count = await SchemaModels.PaymentModel
            .findOne(filter).countDocuments();
        if (payment_count > 0) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.CUSTOM, "hacker get paid");
        }

        const program_invites_count = await SchemaModels.ProgramInviteModel
            .findOne(filter).countDocuments();
        if (program_invites_count > 0) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.CUSTOM, "hacker has current invitation");
        }

        const reports_count = await SchemaModels.SubmitReportModel
            .findOne({
                hacker_user_id: hacker_id,
                status: {$nin: [REPORT_STATUS.NONE, REPORT_STATUS.PENDING, REPORT_STATUS.TRIAGE]}
            }).countDocuments();
        if (reports_count > 0) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.CUSTOM, "hacker has report");
        }

        const hacker = await this.collection.findOneAndDelete({_id: hacker_id});
        if (!hacker) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_RESOURCE_FOUND, "hacker");
        }
        await SchemaModels.NotificationModel.deleteMany({hacker_user_id: hacker_id});
        await SchemaModels.CommentSubmitReportModel.deleteMany(filter);
        await SchemaModels.NotificationModel.deleteMany(filter);
        await SchemaModels.ReportNotificationModel.deleteMany(filter);
        await SchemaModels.SubmitReportModel.deleteMany(filter);
        // const history_model = {
        //     sender_type: SENDER_TYPE.ADMIN,
        //     activity: ACTIVITY_TEXT_LOG.DELETE_HACKER,
        //     sender_id: user_id,
        //     resource_type: RESOURCE_TYPE.HACKER,
        //     resource_id: hacker_id,
        //     info_fields:[{key:"hacker",value:hacker}],
        //     register_date_time: getDateTime()
        // };
        // await SchemaModels.HistoryModel.create(history_model);
    }

    async get(data) {
        if (hasValue(data.report_id)) {
            const report = await SchemaModels.SubmitReportModel.findOne({_id: data.report_id}).select({program_id: 1});
            if (!report) {
                throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_FOUND, "report");
            }
            await checkUserAccess(data.user_level_access, data.user_id, report.program_id, false);
            return await this.getHackerCard(data.id)
        } else if (data.user_level_access === toNumber(ADMIN_ROLES.MODERATOR)) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_PERMISSON);
        } else if (data.hacker_card) {
            return await this.getHackerCard(data.id)
        } else {
            const hacker = await this.collection.findOne({_id: data.id})
                .populate('country_id')
                .populate('country_id_residence')
                .populate('payment_bank_transfer_currency_id')
                .populate('payment_bank_transfer_country_id')
                .populate('payment_bank_transfer_country_id_residence')
                .populate('incoming_range_id')
                .select({
                    _id: 1,
                    register_date_time: 1,
                    verify_date_time: 1,
                    tag: 1,
                    is_verify: 1,
                    status: 1,
                    fn: 1,
                    ln: 1,
                    email: 1,
                    username: 1,
                    password: 1,
                    about: 1,
                    profile_visibility: 1,
                    github_url: 1,
                    linkedin_url: 1,
                    twitter_url: 1,
                    website_url: 1,
                    country_id: 1,
                    country_id_residence: 1,
                    incoming_range_id: 1,
                    competency_profile: 1,
                    address1: 1,
                    address2: 1,
                    city: 1,
                    region: 1,
                    postal_code: 1,
                    avatar_file: 1,
                    identity_driver_file_status: 1,
                    cve_file: 1,
                    cve_file_original_name: 1,
                    identity_country_id: 1,
                    identity_passport_file: 1,
                    invitation: 1,
                    identity_card_file: 1,
                    identity_card_file_status: 1,
                    identity_passport_file_status: 1,
                    identity_driver_file: 1,
                    payment_usdt_public_key: 1,
                    payment_paypal_email: 1,
                    payment_bank_transfer_account_holder: 1,
                    payment_bank_transfer_bic: 1,
                    payment_bank_transfer_country_id: 1,
                    payment_bank_transfer_country_id_residence: 1,
                    payment_bank_transfer_currency_id: 1,
                    payment_bank_transfer_iban: 1,
                    payment_bank_transfer_type: 1,
                    payment_default: 1,
                    point_log: 1,
                    skills: 1,
                    rank: 1,
                    coin_log: 1,
                    reputaion_log: 1,
                    reputaion: 1,
                    sb_coin: 1,
                    point: 1,
                    google_towfa_secret_key: 1,
                    google_towfa_status: 1,
                    account_is_disable: 1,
                    review_application: 1,
                    video_recorded_interview: 1,
                    technical_interview: 1,
                    mobile_address_verification: 1,
                    verification_of_two_references: 1,
                    contract_agreement: 1,
                    tax_file: 1
                }).lean();
            if (!hacker) {
                throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_FOUND, "hacker");
            }
            const kyc = this.getBasicAndAdvanceKyc(hacker.fn, hacker.ln, hacker.address1,
                hacker.competency_profile, hacker.incoming_range_id, hacker.skills, hacker.identity_passport_file_status);
            if (!hacker.tag) {
                hacker.tag = [];
            }
            hacker.has_2fa = !!hacker.google_towfa_secret_key && hacker.google_towfa_status === TWO_FA_STATUS.ENABLED;
            delete hacker.google_towfa_secret_key;
            delete hacker.google_towfa_status;
            return Object.assign(hacker, kyc);
        }
    }

    async getHackerCard(hacker_id) {
        const hacker = await SchemaModels.HackerUserModel.aggregate([
            {$match: {_id: toObjectID(hacker_id)}},
            {
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
            {
                $lookup: {
                    from: 'submit_reports', let: {id: '$_id'},
                    pipeline: [{
                        $group: {
                            _id: null,
                            L: {
                                $sum: {
                                    $cond: [{
                                        $and: [{$eq: ["$hacker_user_id", "$$id"]},
                                            {$in: ["$status", [REPORT_STATUS.APPROVE, REPORT_STATUS.RESOLVED]]}, {$eq: ["$severity", REPORT_SEVERITY.LOW]}]
                                    }, 1, 0]
                                }
                            },
                            M: {
                                $sum: {
                                    $cond: [{
                                        $and: [{$eq: ["$hacker_user_id", "$$id"]},
                                            {$in: ["$status", [REPORT_STATUS.APPROVE, REPORT_STATUS.RESOLVED]]}, {$eq: ["$severity", REPORT_SEVERITY.MEDIUM]}]
                                    }, 1, 0]
                                }
                            },
                            H: {
                                $sum: {
                                    $cond: [{
                                        $and: [{$eq: ["$hacker_user_id", "$$id"]},
                                            {$in: ["$status", [REPORT_STATUS.APPROVE, REPORT_STATUS.RESOLVED]]}, {$eq: ["$severity", REPORT_SEVERITY.HIGH]}]
                                    }, 1, 0]
                                }
                            },
                            C: {
                                $sum: {
                                    $cond: [{
                                        $and: [{$eq: ["$hacker_user_id", "$$id"]},
                                            {$in: ["$status", [REPORT_STATUS.APPROVE, REPORT_STATUS.RESOLVED]]}, {$eq: ["$severity", REPORT_SEVERITY.CRITICAL]}]
                                    }, 1, 0]
                                }
                            }
                        }
                    }], as: 'reports_count',
                }
            },
            {
                $lookup: {
                    from: 'payment_histories', let: {hacker_user_id: '$_id'},
                    pipeline: [{
                        $match: {
                            $expr: {
                                $and: [{$eq: ["$hacker_user_id", "$$hacker_user_id"]}, {$eq: ["$is_positive", false]},
                                    {$eq: ["$type", PAYMENT_HISTORY_TYPE.PAY_PRICE]}]
                            }
                        }
                    }, {$group: {_id: null, amount: {$sum: "$amount"}}},
                        {$project: {amount: 1}}], as: 'reward',
                }
            },
            {
                $lookup: {
                    from: 'payments', let: {hacker_user_id: '$_id'},
                    pipeline: [{
                        $match: {
                            $expr: {
                                $and: [{$eq: ["$hacker_user_id", "$$hacker_user_id"]}]
                            }
                        }
                    },
                        {
                            $group: {
                                _id: null,
                                all_withdraw: {$sum: "$amount"},
                                pending_withdraw: {$sum: {$cond: [{$eq: ["$status", HACKER_PAYMENT_STATUS.PENDING]}, "$amount", 0]}},
                                approved_withdraw: {$sum: {$cond: [{$eq: ["$status", HACKER_PAYMENT_STATUS.APPROVED]}, "$amount", 0]}},
                                rejected_withdraw: {$sum: {$cond: [{$eq: ["$status", HACKER_PAYMENT_STATUS.REJECTED]}, "$amount", 0]}}
                            }
                        },
                        {$project: {_id: 0,all_withdraw: 1,pending_withdraw: 1,approved_withdraw: 1,rejected_withdraw: 1}}], as: 'withdraw',
                }
            },
            {$unwind: {path: "$reward", preserveNullAndEmptyArrays: true}},
            {$unwind: {path: "$withdraw", preserveNullAndEmptyArrays: true}},
            {$lookup: {from: 'countries', localField: 'country_id', foreignField: '_id', as: 'country_id'}},
            {$unwind: {path: "$reports_count", preserveNullAndEmptyArrays: true}},
            {$unwind: {path: "$country_id", preserveNullAndEmptyArrays: true}},
            {
                $project: {
                    avatar_file: 1,
                    rank: 1,
                    reputaion: 1,
                    point: 1,
                    sb_coin: 1,
                    withdraw: 1,
                    username: 1,
                    user_verify: "$is_user_verify",
                    competency_profile: 1,
                    country_id: {_id: 1, title: 1, code: 1},
                    reports_count: {L: 1, M: 1, H: 1, C: 1},
                    reward: "$reward.amount",
                }
            }
        ]);
        return hacker && hacker[0] || {};
    }

    async update(data) {
        if (data.hacker.tab === 0) {
            await this.checkExistFields(data.id, data.hacker.email, data.hacker.username);
        }
        if (isObjectID(data.hacker.country_id) && await checkCountryId(data.hacker.country_id) === 0) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_FOUND, "country_id");
        }
        if (isObjectID(data.hacker.country_id_residence) && await checkCountryId(data.hacker.country_id_residence) === 0) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_FOUND, "country_id_residence");
        }
        if (isObjectID(data.hacker.payment_bank_transfer_country_id) && await checkCountryId(data.hacker.payment_bank_transfer_country_id) === 0) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_FOUND, "payment_bank_transfer_country_id");
        }
        if (isObjectID(data.hacker.payment_bank_transfer_country_id_residence) && await checkCountryId(data.hacker.payment_bank_transfer_country_id_residence) === 0) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_FOUND, "payment_bank_transfer_country_id_residence");
        }
        if (isObjectID(data.hacker.payment_bank_transfer_currency_id) && await checkCurrencyId(data.hacker.payment_bank_transfer_currency_id) === 0) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_FOUND, "payment_bank_transfer_currency_id");
        }
        if (isObjectID(data.hacker.incoming_range_id) && await checkRangeId(data.hacker.incoming_range_id) === 0) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_FOUND, "incoming_range_id");
        }
        // const hacker = await this.collection.findOne({_id: data.id});
        const updating_data = this.getUpdatingData(data.hacker);
        const new_hacker = await this.collection.findOneAndUpdate({_id: data.id}, {$set: updating_data}, {
            new: true, projection: {
                _id: 1,
                register_date_time: 1,
                verify_date_time: 1,
                tag: 1,
                is_verify: 1,
                status: 1,
                fn: 1,
                ln: 1,
                email: 1,
                username: 1,
                password: 1,
                about: 1,
                profile_visibility: 1,
                github_url: 1,
                linkedin_url: 1,
                twitter_url: 1,
                website_url: 1,
                country_id: 1,
                country_id_residence: 1,
                incoming_range_id: 1,
                competency_profile: 1,
                address1: 1,
                address2: 1,
                city: 1,
                region: 1,
                postal_code: 1,
                avatar_file: 1,
                identity_driver_file_status: 1,
                cve_file: 1,
                cve_file_original_name: 1,
                identity_country_id: 1,
                identity_passport_file: 1,
                invitation: 1,
                identity_card_file: 1,
                identity_card_file_status: 1,
                identity_passport_file_status: 1,
                identity_driver_file: 1,
                payment_usdt_public_key: 1,
                payment_paypal_email: 1,
                payment_bank_transfer_account_holder: 1,
                payment_bank_transfer_bic: 1,
                payment_bank_transfer_country_id: 1,
                payment_bank_transfer_country_id_residence: 1,
                payment_bank_transfer_currency_id: 1,
                payment_bank_transfer_iban: 1,
                payment_bank_transfer_type: 1,
                payment_default: 1,
                point_log: 1,
                rank: 1,
                coin_log: 1,
                reputaion_log: 1,
                reputaion: 1,
                sb_coin: 1,
                point: 1,
                tax_file: 1,
                review_application: 1,
                video_recorded_interview: 1,
                technical_interview: 1,
                mobile_address_verification: 1,
                contract_agreement: 1,
                verification_of_two_references: 1
            }
        });
        if (!new_hacker) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_RESOURCE_FOUND, "hacker");
        }
        // const fields = [];
        // for (const key in updating_data) {
        //     if ((hacker[key] === undefined && hasValue(updating_data[key])) || hacker[key].toString() !== updating_data[key].toString()) {
        //         fields.push({key, old_value: hacker[key], new_value: updating_data[key]});
        //     }
        // }
        // if (fields.length > 0){
        //     const history_model = {
        //         sender_type: SENDER_TYPE.ADMIN,
        //         activity: ACTIVITY_TEXT_LOG.UPDATE_HACKER,
        //         sender_id: data.user_id,
        //         resource_type: RESOURCE_TYPE.HACKER,
        //         resource_id: hacker._id,
        //         fields,
        //         register_date_time: getDateTime()
        //     };
        //     await SchemaModels.HistoryModel.create(history_model);
        // }
        return new_hacker;
    }

    async checkExistFields(id, email, username) {
        const email_count = await this.collection.countDocuments({_id: {$ne: id}, email});
        if (email_count > 0) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.EXIST, "email");
        }
        const username_count = await this.collection.countDocuments({_id: {$ne: id}, username});
        if (username_count > 0) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.EXIST, "username");
        }
    }

    async changePassword(data) {
        const hacker = await this.collection.findOneAndUpdate({_id: data.id}, {$set: {password: makeHash(data.password)}});
        if (!hacker) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_RESOURCE_FOUND, "hacker");
        }
        // const history_model = {
        //     sender_type: SENDER_TYPE.ADMIN,
        //     activity: ACTIVITY_TEXT_LOG.CHANGE_PASSWORD,
        //     sender_id: data.user_id,
        //     resource_type: RESOURCE_TYPE.HACKER,
        //     resource_id: hacker._id,
        //     register_date_time: getDateTime()
        // };
        // await SchemaModels.HistoryModel.create(history_model);
    }

    async createNotification(title, text, field_type, hacker_user_id, message_type, moderator_user_id, resource_type) {
        const notification = {
            title,
            text,
            status: NOTIFICATION_STATUS.SEND,
            field_type,
            register_date_time: getDateTime(),
            sender_type: SENDER_TYPE.ADMIN,
            resource_type: resource_type || RESOURCE_TYPE.HACKER,
            message_type,
            action_type: ACTION_TYPE.UPDATE,
            moderator_user_id,
            hacker_user_id
        };
        return SchemaModels.NotificationModel.create(notification);
    }

    sendNotification(emit_name, id, title, text, date, message_type, notification_id, resource_type, field_type) {
        if (hackerIO && hackerIO["sockets"] && hackerIO["sockets"].size > 0 && hackerIO["to"]) {
            const sockets_info = convertSetOrMapToArray(hackerIO["sockets"]);
            sockets_info.length > 0 && sockets_info.forEach(s => {
                if (s.data && s.data._id && s.data._id.toString() === id) {
                    hackerIO["to"](s.id.toString()).emit(emit_name, {
                        title,
                        text,
                        date,
                        message_type,
                        id: notification_id,
                        resource_type,
                        field_type
                    });
                }
            });
        }
    }

    getBasicAndAdvanceKyc(fn, ln, address1, competency_profile, incoming_range_id, skills, identity_passport_status) {
        const kyc = {kyc_basic: false, kyc_advanced: false};
        if (hasValue(fn) && hasValue(ln) && hasValue(address1) &&
            hasValue(incoming_range_id) && hasValue(competency_profile) &&
            competency_profile > 0 && skills && skills.length > 0) {
            kyc.kyc_basic = true;
            if (identity_passport_status === HACKER_IDENTITY_STATUS.APPROVED) {
                kyc.kyc_advanced = true;
            }
        }
        return kyc;
    }

    getUpdatingData(data) {
        switch (data.tab) {
            case 0:
                return {
                    fn: data["fn"],
                    ln: data["ln"],
                    email: data["email"],
                    username: data["username"],
                    invitation: data["invitation"]
                };
            case 1:
                return {
                    profile_visibility: data["profile_visibility"] || false,
                    github_url: data["github_url"] || '',
                    linkedin_url: data["linkedin_url"] || '',
                    twitter_url: data["twitter_url"] || '',
                    website_url: data["website_url"] || '',
                    country_id: data["country_id"] || null,
                    country_id_residence: data["country_id_residence"] || null,
                    incoming_range_id: data["incoming_range_id"] || null,
                    city: data["city"] || '',
                    competency_profile: data["competency_profile"] || '',
                    region: data["region"] || '',
                    postal_code: data["postal_code"] || '',
                    address1: data["address1"] || '',
                    address2: data["address2"] || '',
                };
            case 2:
                return {
                    review_application: data["review_application"] || false,
                    video_recorded_interview: data["video_recorded_interview"] || false,
                    technical_interview: data["technical_interview"] || false,
                    contract_agreement: data["contract_agreement"] || false,
                    mobile_address_verification: data["mobile_address_verification"] || false,
                    verification_of_two_references: data["verification_of_two_references"] || false,
                };
            case 3:
                return {
                    payment_default: data["payment_default"] || null,
                    payment_bank_transfer_type: data["payment_bank_transfer_type"] || '',
                    payment_paypal_email: data["payment_paypal_email"] || '',
                    payment_bank_transfer_account_holder: data["payment_bank_transfer_account_holder"] || '',
                    payment_bank_transfer_bic: data["payment_bank_transfer_bic"] || '',
                    payment_bank_transfer_iban: data["payment_bank_transfer_iban"] || '',
                    payment_usdt_public_key: data["payment_usdt_public_key"] || '',
                    payment_bank_transfer_country_id: data["payment_bank_transfer_country_id"] || null,
                    payment_bank_transfer_country_id_residence: data["payment_bank_transfer_country_id_residence"] || null,
                    payment_bank_transfer_currency_id: data["payment_bank_transfer_currency_id"] || null,
                };
        }
    }

    async setHackersRank() {
        await this.collection.updateMany({}, {$unset: {rank: 1}}, {multi: true});
        const hackers = await this.collection.aggregate([
            {$match: {tag: {$ne: HACKER_TAGS.INTERNAL_USER}}},
            {
                $addFields: {
                    "privilege": {$add: [{$ifNull: ["$reputaion", 0]}, {$ifNull: ["$sb_coin", 0]}]},
                    "usernameLower": {$toLower: "$username"}
                }
            },
            {$sort: {"privilege": -1, "reputaion": -1, "sb_coin": -1, "usernameLower": -1}},
            {$limit: 99},
            {$project: {_id: 1}}
        ]);
        for (let i = 0; i < hackers.length; i++) {
            await this.collection.updateOne({_id: hackers[i]._id}, {$set: {rank: (i + 1)}});
        }
        await this.collection.updateMany({$or: [{"rank": {$exists: false}}, {"rank": {$eq: null}}]}, {$set: {"rank": 100}});
        await this.collection.updateMany({tag: {$eq: HACKER_TAGS.INTERNAL_USER}}, {$set: {"rank": null}});
    }
}

module.exports = new HackerUserModel();