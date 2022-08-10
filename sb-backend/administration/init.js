const express = require('express');
const administration = express();
administration.disable('x-powered-by');
const check = require('express-validator');
const {decryptToken} = require('../libs/token.helper');
const accessControl = require('accesscontrol');
// noinspection JSValidateTypes
const ac = new accessControl();
const {catchAsync, ErrorHelper} = require('../libs/error.helper');
const {
    isObjectID, safeString, checkUserLevelAccessIsValid, toNumber,
    getAdministrationUserAccessLevel, isArray, getHackerPrivilege
} = require('../libs/methode.helper');
const {getTimeStamp, getDateTime} = require('../libs/date.helper');
const {
    ADMIN_ROLES_NAME, ADMIN_RESOURCES, ACTIONS, STATIC_VARIABLES, PROGRAM_STATUS,
    ADMIN_ROLES, PROGRAM_MODERATOR_ACCESS
} = require('../libs/enum.helper');
const {
    notPermissionResponse, notVerifyUserResponse, notValidUserResponse, requiredTokenResponse,
    expireRefreshTokenResponse, expireTokenResponse, notValidTokenResponse
} = require('../libs/message.helper');

const getAdministrationLogin = async (token, check_refresh_token = true) => {
    try {
        let data_string = await decryptToken(token);
        if (!data_string) {
            return notValidTokenResponse(false);
        }
        let data = data_string.split('#');
        if (data.length !== STATIC_VARIABLES.TOKEN_LENGTH) {
            return notValidTokenResponse(false);
        }
        if (!isObjectID(data[1])) {
            return notValidTokenResponse(false);
        }
        let nowDate = getTimeStamp();
        if (nowDate > data[3]) {
            return expireTokenResponse(false);
        }
        if (nowDate > data[5] && check_refresh_token) {
            return expireRefreshTokenResponse(false);
        }
        const user_id = safeString(data[1]);
        const user = await SchemaModels.ModeratorUserModel.findOne({"_id": user_id});
        if (user) {
            if (user.status && checkUserLevelAccessIsValid(user.user_level_access)) {
                return user;
            } else if (!user.status) {
                return notVerifyUserResponse(false);
            } else if (!checkUserLevelAccessIsValid(user.user_level_access)) {
                return notValidUserResponse(false);
            } else {
                return notValidTokenResponse(false);
            }
        } else {
            return notValidTokenResponse(false);
        }
    } catch {
        return notValidTokenResponse(false);
    }
};

const isAuthenticate = async (req, res, next) => {
    try {
        await check.header('x-token').trim().notEmpty({ignore_whitespace: true})
            .withMessage(requiredTokenResponse(false)).bail()
            .run(req);
        const errors = check.validationResult(req);
        if (!errors.isEmpty()) {
            return res.json(errors.array()[0].msg);
        }
        req.user = null;
        let response = await getAdministrationLogin(req.headers['x-token']);
        if (response && response.status &&
            checkUserLevelAccessIsValid(response.user_level_access)) {
            administration.set('administrationUser', response);
            req.user = response;
            next();
        } else {
            return res.json(response);
        }
    } catch {
        return notValidTokenResponse(false);
    }
};

ac.grant(ADMIN_ROLES_NAME.MODERATOR)
    .readAny(ADMIN_RESOURCES.PROGRAM)
    .updateAny(ADMIN_RESOURCES.PROFILE)
    .deleteAny(ADMIN_RESOURCES.PROFILE)
    .readAny(ADMIN_RESOURCES.NOTIFICATION)
    .updateAny(ADMIN_RESOURCES.NOTIFICATION)
    .readAny(ADMIN_RESOURCES.COMPANY)
    .readAny(ADMIN_RESOURCES.HACKER)
    .readAny(ADMIN_RESOURCES.PROGRAM_MODERATOR)
    .readAny(ADMIN_RESOURCES.STATISTICS)
    .readAny(ADMIN_RESOURCES.PREDATA)
    .readAny(ADMIN_RESOURCES.REPORT)
    .readAny(ADMIN_RESOURCES.COMMENT)
    .createAny(ADMIN_RESOURCES.COMMENT)
    .updateAny(ADMIN_RESOURCES.REPORT_DETAILS)
    .updateAny(ADMIN_RESOURCES.REPORT)
    .deleteAny(ADMIN_RESOURCES.COMMENT)
    .grant(ADMIN_ROLES_NAME.ADMIN)
    .extend(ADMIN_ROLES_NAME.MODERATOR)
    .readAny(ADMIN_RESOURCES.SETTING)
    .readAny(ADMIN_RESOURCES.COMPANY_CHART)
    .readAny(ADMIN_RESOURCES.HACKER_CHART)
    .updateAny(ADMIN_RESOURCES.SETTING)
    .readAny(ADMIN_RESOURCES.COMPANY_MEMBER)
    .updateAny(ADMIN_RESOURCES.COMPANY)
    .updateAny(ADMIN_RESOURCES.COMPANY_MEMBER)
    .deleteAny(ADMIN_RESOURCES.COMPANY)
    .deleteAny(ADMIN_RESOURCES.REPORT)
    .deleteAny(ADMIN_RESOURCES.PROGRAM)
    .updateAny(ADMIN_RESOURCES.PROGRAM)
    .deleteAny(ADMIN_RESOURCES.PROGRAM_MODERATOR)
    .deleteAny(ADMIN_RESOURCES.COMPANY_MEMBER)
    .createAny(ADMIN_RESOURCES.COMPANY_MEMBER)
    .createAny(ADMIN_RESOURCES.PROGRAM_MODERATOR)
    .updateAny(ADMIN_RESOURCES.PROGRAM_MODERATOR)
    .readAny(ADMIN_RESOURCES.PROGRAM_INVITATION)
    .createAny(ADMIN_RESOURCES.PROGRAM_INVITATION)
    .deleteAny(ADMIN_RESOURCES.PROGRAM_INVITATION)
    .updateAny(ADMIN_RESOURCES.HACKER)
    .deleteAny(ADMIN_RESOURCES.HACKER)
    .readAny(ADMIN_RESOURCES.CTF)
    .createAny(ADMIN_RESOURCES.CTF)
    .updateAny(ADMIN_RESOURCES.CTF)
    .deleteAny(ADMIN_RESOURCES.CTF)
    .readAny(ADMIN_RESOURCES.COUNTRY)
    .createAny(ADMIN_RESOURCES.COUNTRY)
    .updateAny(ADMIN_RESOURCES.COUNTRY)
    .deleteAny(ADMIN_RESOURCES.COUNTRY)
    .readAny(ADMIN_RESOURCES.CURRENCY)
    .createAny(ADMIN_RESOURCES.CURRENCY)
    .updateAny(ADMIN_RESOURCES.CURRENCY)
    .deleteAny(ADMIN_RESOURCES.CURRENCY)
    .readAny(ADMIN_RESOURCES.RANGE)
    .createAny(ADMIN_RESOURCES.RANGE)
    .updateAny(ADMIN_RESOURCES.RANGE)
    .deleteAny(ADMIN_RESOURCES.RANGE)
    .readAny(ADMIN_RESOURCES.TARGET_TYPE)
    .createAny(ADMIN_RESOURCES.TARGET_TYPE)
    .updateAny(ADMIN_RESOURCES.TARGET_TYPE)
    .deleteAny(ADMIN_RESOURCES.TARGET_TYPE)
    .readAny(ADMIN_RESOURCES.SKILL)
    .createAny(ADMIN_RESOURCES.SKILL)
    .updateAny(ADMIN_RESOURCES.SKILL)
    .deleteAny(ADMIN_RESOURCES.SKILL)
    .readAny(ADMIN_RESOURCES.LANGUAGE)
    .createAny(ADMIN_RESOURCES.LANGUAGE)
    .updateAny(ADMIN_RESOURCES.LANGUAGE)
    .deleteAny(ADMIN_RESOURCES.LANGUAGE)
    .createAny(ADMIN_RESOURCES.NOTIFICATION)
    .createAny(ADMIN_RESOURCES.USER)
    .updateAny(ADMIN_RESOURCES.USER)
    .deleteAny(ADMIN_RESOURCES.USER)
    .readAny(ADMIN_RESOURCES.USER);

const hasPermission = function (resource, action) {
    return catchAsync(async function (req, res, next) {
        let user = req.user;
        const role = getAdministrationUserAccessLevel(safeString(user.user_level_access));
        let permission;
        if (action === ACTIONS.READ) {
            permission = ac.can(role).readAny(resource);
        } else if (action === ACTIONS.CREATE) {
            permission = ac.can(role).createAny(resource);
        } else if (action === ACTIONS.UPDATE) {
            permission = ac.can(role).updateAny(resource);
        } else if (action === ACTIONS.DELETE) {
            permission = ac.can(role).deleteAny(resource);
        }
        if (permission.granted) {
            next();
        } else {
            return res.json(notPermissionResponse());
        }
    });
};

const setReportNotifications = async (program_id, report_id, hacker_user_id, severity, hacker_report_notifications_types, type) => {
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
};

const updateHackerRank = async (hacker_user, is_additive) => {
    if (hacker_user) {
        const next_or_prev_user_rank = is_additive ? hacker_user.rank - 1 : hacker_user.rank + 1;
        let next_or_prev_user = {};
        if (next_or_prev_user_rank > 100 || next_or_prev_user_rank === 0) {
            return true;
        }
        if (next_or_prev_user_rank === 100) {
            const next_hacker = await SchemaModels.HackerUserModel.aggregate([
                {$match: {"rank": 100}},
                {
                    $addFields: {
                        "privilege": {$add: [{$ifNull: ["$reputaion", 0]}, {$ifNull: ["$sb_coin", 0]}]},
                        "usernameLower": {$toLower: "$username"}
                    }
                },
                {$sort: {"privilege": -1, "reputaion": -1, "sb_coin": -1, "usernameLower": -1}},
                {$limit: 1},
                {$project: {_id: 1, sb_coin: 1, reputaion: 1, rank: 1}}
            ]);
            next_or_prev_user = next_hacker && next_hacker[0];
        } else {
            next_or_prev_user = await SchemaModels.HackerUserModel.findOne({rank: next_or_prev_user_rank}, {
                sb_coin: 1,
                reputaion: 1,
                rank: 1
            });
        }
        if (next_or_prev_user) {
            const next_or_prev_user_privilege = getHackerPrivilege(next_or_prev_user.sb_coin, next_or_prev_user.reputaion);
            const hacker_user_privilege = getHackerPrivilege(hacker_user.sb_coin, hacker_user.reputaion);
            const check_for_exchange_rank_hackers = is_additive ? next_or_prev_user_privilege < hacker_user_privilege : next_or_prev_user_privilege > hacker_user_privilege;
            if (check_for_exchange_rank_hackers) {
                await SchemaModels.HackerUserModel.updateOne({_id: next_or_prev_user._id}, {rank: hacker_user.rank});
                hacker_user = await SchemaModels.HackerUserModel.findOneAndUpdate({_id: hacker_user._id}, {$set: {rank: next_or_prev_user.rank}}, {
                    new: true,
                    projection: {sb_coin: 1, reputaion: 1, rank: 1}
                });
                if (hacker_user.rank === 1) {
                    return true;
                }
                await updateHackerRank(hacker_user, is_additive);
            } else {
                return true;
            }
        } else {
            return true;
        }
    } else {
        return true;
    }
};

const getModeratorPrograms = async (user_id) => {
    return await SchemaModels.ProgramModel.find({
        status: {$in: [PROGRAM_STATUS.APPROVED, PROGRAM_STATUS.CLOSE]},
        is_verify: true,
        moderator_users: {$elemMatch: {moderator_user_id: user_id}}
    }).select({_id: 1, moderator_users: 1}).lean();
};

const getModeratorProgramIds = async (user_id) => {
    const programs = await getModeratorPrograms(user_id);
    return isArray(programs) ? programs.map(d => d._id.toString()) : [];
};

const checkUserAccess = async (user_level_access, user_id, program_id, check_for_access, only_edit_access=false) => {
    if (user_level_access === toNumber(ADMIN_ROLES.MODERATOR)) {
        const programs = await getModeratorPrograms(user_id);
        const program = programs.find(p => p._id.toString() === program_id.toString());
        if (!program) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_PERMISSON);
        }
        if (check_for_access) {
            const moderator_access = program.moderator_users.find(user => user.moderator_user_id.toString() === user_id.toString());
            if (!moderator_access) {
                throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_PERMISSON);
            }
            if (only_edit_access && moderator_access.user_level_access !== PROGRAM_MODERATOR_ACCESS.EDIT){
                throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_PERMISSON);
            }
            if (moderator_access.user_level_access === PROGRAM_MODERATOR_ACCESS.READ) {
                throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_PERMISSON);
            }
        }
    }
};

const checkLanguageId = async (language_id) => {
    return await SchemaModels.LanguageModel.countDocuments({_id: language_id, status: true});
};

const checkTargetTypeId = async (type_id) => {
    return await SchemaModels.TypeTestModel.countDocuments({_id: type_id, status: true});
};

const checkCountryId = async (country_id) => {
    return await SchemaModels.CountryModel.countDocuments({_id: country_id, status: true});
};

const checkCurrencyId = async (currency_id) => {
    return await SchemaModels.CurrencyModel.countDocuments({_id: currency_id, status: true});
};

const checkRangeId = async (range_id) => {
    return await SchemaModels.RangeModel.countDocuments({_id: range_id, status: true});
};

module.exports = {
    isAuthenticate, administration, hasPermission, checkRangeId,
    getAdministrationLogin, setReportNotifications, updateHackerRank,
    getModeratorProgramIds, checkUserAccess, checkCountryId, checkCurrencyId,
    checkLanguageId, checkTargetTypeId
};