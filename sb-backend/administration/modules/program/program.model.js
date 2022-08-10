const {
    hasValue, setPaginationResponse, toNumber,
    isArray, toObjectID, convertSetOrMapToArray,
    isUndefined, generateObjectId, isObjectID,
    safeString, cleanXSS, sortBy, arrayEquals
} = require('../../../libs/methode.helper');
const moment = require('moment');
const {
    ADMIN_ROLES, STATIC_VARIABLES, PROGRAM_STATUS, REPORT_SEVERITY,
    RESOURCE_TYPE, SENDER_TYPE, PROGRAM_BOUNTY_TYPE, REPORT_STATUS,
    MESSAGE_TYPE, NOTIFICATION_STATUS, ACTION_TYPE, HACKER_IDENTITY_STATUS,
    FIELD_TYPE, PAYMENT_HISTORY_TYPE, INVITE_HACKER_STATUS, PROGRAM_TYPE,
    ACTIVITY_TEXT_LOG, HISTORY_TYPE, HACKER_TAGS, HISTORY_PROGRAM_TYPE,
    PRODUCT_TYPE
} = require('../../../libs/enum.helper');
const {ErrorHelper} = require('../../../libs/error.helper');
const {getDate, getDateTime} = require('../../../libs/date.helper');
const {
    getModeratorProgramIds,
    checkUserAccess,
    checkLanguageId,
    checkTargetTypeId,
    checkCurrencyId
} = require('../../init');
const companyIO = require("../../../io/company");
const hackerIO = require("../../../io/hacker");

class ProgramModel {
    constructor() {
        this.collection = SchemaModels.ProgramModel;
    }

    async gets(data) {
        const filters = [];
        if (data.user_level_access === toNumber(ADMIN_ROLES.MODERATOR)) {
            const program_ids = await getModeratorProgramIds(data.user_id);
            filters.push({_id: {$in: program_ids.map(d => toObjectID(d))}});
        }
        if (hasValue(data.name)) {
            filters.push({name: {$regex: ".*" + data.name + ".*", $options: "i"}});
        }
        if (hasValue(data.program_type)) {
            filters.push({program_type: data.program_type});
        }
        if (hasValue(data.is_verify)) {
            filters.push({is_verify: data.is_verify});
        }
        if (hasValue(data.status)) {
            filters.push({status: data.status});
        }
        if (hasValue(data.is_next_generation)) {
            filters.push({is_next_generation: data.is_next_generation});
        }
        const programs = await this.collection.aggregate([
            ...(filters.length > 0 ? [{$match: {$and: filters}}] : []),
            {
                $lookup: {
                    from: "company_users",
                    localField: "company_user_id",
                    foreignField: "_id",
                    as: "company_user_id"
                }
            },
            {$unwind: {path: "$company_user_id", preserveNullAndEmptyArrays: true}},
            {
                $lookup: {
                    from: 'submit_reports', let: {id: '$_id'},
                    pipeline: [
                        {
                            $group: {
                                _id: null,
                                L: {
                                    $sum: {
                                        $cond: [{$and: [{$eq: ["$program_id", "$$id"]}, {$eq: ["$severity", REPORT_SEVERITY.LOW]}]}, 1, 0]
                                    }
                                },
                                M: {
                                    $sum: {
                                        $cond: [{$and: [{$eq: ["$program_id", "$$id"]}, {$eq: ["$severity", REPORT_SEVERITY.MEDIUM]}]}, 1, 0]
                                    }
                                },
                                H: {
                                    $sum: {
                                        $cond: [{$and: [{$eq: ["$program_id", "$$id"]}, {$eq: ["$severity", REPORT_SEVERITY.HIGH]}]}, 1, 0]
                                    }
                                },
                                C: {
                                    $sum: {
                                        $cond: [{$and: [{$eq: ["$program_id", "$$id"]}, {$eq: ["$severity", REPORT_SEVERITY.CRITICAL]}]}, 1, 0]
                                    }
                                }
                            }
                        }], as: 'reports_count',
                }
            },
            {$sort: {"register_date_time": -1}},
            {
                $facet: {
                    total_count: [{$count: "count"}],
                    rows: [{$skip: (data.page - 1) * data.limit}, {$limit: data.limit},
                        {
                            $project: {
                                _id: 1,
                                name: 1,
                                company_email: "$company_user_id.email",
                                company_id: "$company_user_id._id",
                                logo_file: 1,
                                status: 1,
                                is_verify: 1,
                                is_next_generation: 1,
                                register_date_time: 1,
                                reports_count: {L: 1, M: 1, H: 1, C: 1},
                                program_type: 1,
                                product_type: 1
                            }
                        }]
                }
            }
        ]);
        return setPaginationResponse(programs, data.limit, data.page);
    }

    async get(data) {
        let program = await this.collection.findOne({"_id": data.id})
            .populate('company_user_id')
            .populate('targets.target_type_id')
            .populate('targets.language_id')
            .populate('rewards.currency_id')
            .populate('moderator_users.moderator_user_id').lean();
        if (!program) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_FOUND, "program");
        }
        await checkUserAccess(data.user_level_access, data.user_id, program._id, false);
        program.maximum_reward_log = await SchemaModels.PaymentHistoryModel.find({"program_id": data.id, "type": 2})
            .select({"is_positive": 1, "_id": 0, "amount": 1, "register_date_time": 1});
        if (!isArray(program.maximum_reward_log)) {
            program.maximum_reward_log = [];
        }
        program.program_history_count = 0;
        let program_history = await SchemaModels.HistoryModel.aggregate([
            {
                $match: {
                    $and: [
                        {resource_id: toObjectID(data.id)},
                        {type: HISTORY_TYPE.PROGRAM_CHANGE},
                        {
                            $or: [
                                {activity: ACTIVITY_TEXT_LOG.CREATE_TARGET}, {activity: ACTIVITY_TEXT_LOG.UPDATE_TARGET}, {activity: ACTIVITY_TEXT_LOG.DELETE_TARGET},
                                {activity: ACTIVITY_TEXT_LOG.CREATE_REWARD}, {activity: ACTIVITY_TEXT_LOG.UPDATE_REWARD}, {activity: ACTIVITY_TEXT_LOG.DELETE_REWARD},
                                {activity: ACTIVITY_TEXT_LOG.CREATE_REWARDS_FOR_ALL_TARGETS}, {activity: ACTIVITY_TEXT_LOG.DELETE_REWARDS_FOR_ALL_TARGETS},
                                {activity: ACTIVITY_TEXT_LOG.UPDATE_REWARDS_FOR_ALL_TARGETS}, {activity: ACTIVITY_TEXT_LOG.UPDATE_POLICIES_FOR_ALL_TARGETS},
                                {activity: ACTIVITY_TEXT_LOG.CREATE_POLICY}, {activity: ACTIVITY_TEXT_LOG.UPDATE_POLICY}, {activity: ACTIVITY_TEXT_LOG.DELETE_POLICY},
                                {activity: ACTIVITY_TEXT_LOG.CREATE_POLICIES_FOR_ALL_TARGETS}, {activity: ACTIVITY_TEXT_LOG.DELETE_POLICIES_FOR_ALL_TARGETS},
                                {activity: ACTIVITY_TEXT_LOG.UPDATE_PROGRAM}, {activity: ACTIVITY_TEXT_LOG.UPDATE_MAXIMUM_REWARD}
                            ]
                        },
                        {"info_fields.key": "status"},
                        {sender_type: SENDER_TYPE.ADMIN},
                        {$or: [{"info_fields.value": PROGRAM_STATUS.APPROVED}, {"info_fields.value": PROGRAM_STATUS.CLOSE}]},
                    ]
                }
            },
            {$sort: {"register_date_time": -1}}
        ]);
        if (isArray(program_history) && program_history.length > 0) {
            program.program_history_count = program_history.length;
            program.last_change_date = program_history[0].register_date_time
        }
        return program;
    }

    async update(data) {
        data.tab = toNumber(data.tab);
        if (!hasValue(data.id)) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.REQUARED, "program id");
        } else if (!isObjectID(data.id)) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_VALID, "program id");
        } else if (!hasValue(data.tab)) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.REQUARED, "tab");
        } else if (data.tab !== 0 && data.tab !== 1) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_VALID, "tab");
        } else if (data.tab === 0) {
            if (!hasValue(data.name)) {
                throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.REQUARED, "name");
            } else if (!hasValue(data.tagline)) {
                throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.REQUARED, "tagline");
            } else if (!hasValue(data.policy)) {
                throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.REQUARED, "policy");
            }
        } else if (data.tab === 1) {
            if (!hasValue(data.compliance1)) {
                throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.REQUARED, "compliance1");
            } else if (!hasValue(data.compliance2)) {
                throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.REQUARED, "compliance2");
            } else if (!hasValue(data.compliance3)) {
                throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.REQUARED, "compliance3");
            } else if (!hasValue(data.compliance4)) {
                throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.REQUARED, "compliance4");
            } else if (!hasValue(data.compliance5)) {
                throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.REQUARED, "compliance5");
            } else if (!hasValue(data.compliance6)) {
                throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.REQUARED, "compliance6");
            }
            data.compliance1 = toNumber(data.compliance1);
            data.compliance2 = toNumber(data.compliance2);
            data.compliance3 = toNumber(data.compliance3);
            data.compliance4 = toNumber(data.compliance4);
            data.compliance5 = toNumber(data.compliance5);
            data.compliance6 = toNumber(data.compliance6);
            if (data.compliance1 !== 0 && data.compliance1 !== 1) {
                throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_VALID, "compliance1");
            } else if (data.compliance2 !== 0 && data.compliance2 !== 1) {
                throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_VALID, "compliance2");
            } else if (data.compliance3 !== 0 && data.compliance3 !== 1) {
                throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_VALID, "compliance3");
            } else if (data.compliance4 !== 0 && data.compliance4 !== 1) {
                throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_VALID, "compliance4");
            } else if (data.compliance5 !== 0 && data.compliance5 !== 1) {
                throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_VALID, "compliance5");
            } else if (data.compliance6 !== 0 && data.compliance6 !== 1) {
                throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_VALID, "compliance6");
            }
        }
        if (data.tab === 0) {
            data.name = safeString(data.name);
            data.tagline = safeString(data.tagline);
            data.policy = safeString(data.policy);
            data.policy = cleanXSS(data.policy);
        }
        let program = await this.collection.findOne({_id: data.id});
        if (!program) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_FOUND, "program");
        }
        let logo_file = '';
        if (program.logo_file !== "") {
            logo_file = program.logo_file;
        } else {
            if (data.files && Object.keys(data.files).length > 0 && !isUndefined(data.files.logo)) {
                const filename = data.files.logo[0].filename.toLowerCase();
                logo_file = `company/program_logo/${filename}`;
            } else {
                throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.REQUARED, "logo");
            }
        }
        data.logo_file = logo_file;
        const update_data = await this.getProgramData(data);
        const new_program = await this.collection.findOneAndUpdate({"_id": data.id}, {$set: update_data},
            {
                new: true, projection: {
                    name: 1, policy: 1, program_type: 1, product_type: 1, tagline: 1, logo_file: 1,
                    compliance1: 1, compliance2: 1, compliance3: 1, compliance4: 1, compliance5: 1, compliance6: 1
                }
            }).lean();
        new_program.logo_file = AppConfig.API_URL + new_program.logo_file;
        const fields = [];
        for (const key in update_data) {
            if ((program[key] === undefined && hasValue(update_data[key])) || program[key].toString() !== update_data[key].toString()) {
                fields.push({key, old_value: program[key], new_value: update_data[key]});
            }
        }
        if (fields.length > 0) {
            const history_model = {
                sender_type: SENDER_TYPE.ADMIN,
                activity: ACTIVITY_TEXT_LOG.UPDATE_PROGRAM,
                type: HISTORY_TYPE.PROGRAM_CHANGE,
                sender_id: data.user_id,
                resource_type: RESOURCE_TYPE.PROGRAM,
                resource_id: program._id,
                info_fields: [{key: "status", value: program.status}],
                fields,
                register_date_time: getDateTime()
            };
            const history = await SchemaModels.HistoryModel.create(history_model);
            this.sendProgramChangeNotification([
                    {
                        socket_io: hackerIO,
                        target_ids: await this.getTargetIds(SENDER_TYPE.HACKER, program._id),
                        reciever_type: SENDER_TYPE.HACKER
                    },
                    {
                        socket_io: companyIO,
                        target_ids: await this.getTargetIds(SENDER_TYPE.COMPANY, program._id, program.company_user_id),
                        reciever_type: SENDER_TYPE.COMPANY
                    }
                ], program.is_next_generation, program._id, history.register_date_time, program.program_type
            )
        }
        return new_program;
    }

    async getTargetIds(type, program_id, company_user_id = "") {
        switch (type) {
            case SENDER_TYPE.HACKER:
                const invitations = await SchemaModels.ProgramInviteModel.find({
                    program_id,
                    status_invite: HACKER_IDENTITY_STATUS.APPROVED
                }).lean();
                return invitations.map(invitation => invitation.hacker_user_id.toString());

            case SENDER_TYPE.COMPANY:
                let members = await SchemaModels.CompanyUserModel.find({parent_user_id: company_user_id}).lean();
                members = members || [];
                return [company_user_id.toString()].concat(members.map(member => member._id.toString()));
        }
    }

    async createTarget(data) {
        const program = await this.collection.findOne({_id: data.id});
        if (!program) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_FOUND, "program");
        }
        const exists_target = await this.checkExistsIdentifier(program.company_user_id, data.target_type_id, data.identifier, program._id);
        if (exists_target !== 0) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.CUSTOM, "identifier already exists");
        }
        if (await checkTargetTypeId(data.target_type_id) !== 1) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_FOUND, "target_type_id");
        }
        for (let i = 0; i < data.language_id.length; i++) {
            if (await checkLanguageId(data.language_id[i]) !== 1) {
                throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_FOUND, "language_id");
            }
        }
        const target = {
            identifier: data.identifier,
            target_type_id: data.target_type_id,
            maturity: data.maturity,
            language_id: data.language_id
        };
        const new_program = await this.collection.findOneAndUpdate({
                company_user_id: program.company_user_id,
                _id: data.id
            }
            , {$push: {targets: target}}, {new: true});

        const same_identifier = program.targets.filter(d => d.identifier.toString() === data.identifier.toString());
        let not_included_ids = [];
        if (same_identifier && same_identifier.length > 0) {
            not_included_ids = same_identifier.map(f => f._id.toString());
        }
        const created_target = new_program.targets.find(d => d.identifier.toString() === data.identifier.toString() && !not_included_ids.includes(d._id.toString()));

        const history_model = {
            sender_type: SENDER_TYPE.ADMIN,
            activity: ACTIVITY_TEXT_LOG.CREATE_TARGET,
            type: HISTORY_TYPE.PROGRAM_CHANGE,
            sender_id: data.user_id,
            resource_type: RESOURCE_TYPE.PROGRAM,
            resource_id: program._id,
            info_fields: [{key: "targets", value: created_target}, {key: "status", value: program.status}],
            fields: [{key: "targets", old_value: program.targets, new_value: new_program.targets}],
            register_date_time: getDateTime()
        };
        const history = await SchemaModels.HistoryModel.create(history_model);
        this.sendProgramChangeNotification([
                {
                    socket_io: hackerIO,
                    target_ids: await this.getTargetIds(SENDER_TYPE.HACKER, program._id),
                    reciever_type: SENDER_TYPE.HACKER
                },
                {
                    socket_io: companyIO,
                    target_ids: await this.getTargetIds(SENDER_TYPE.COMPANY, program._id, program.company_user_id),
                    reciever_type: SENDER_TYPE.COMPANY
                }
            ], program.is_next_generation, program._id, history.register_date_time, program.program_type
        );
        return new_program.targets.find(d => d.identifier.toString() === data.identifier.toString());
    }

    async updateTarget(data) {
        const program = await this.collection.findOne({_id: data.id})
            .populate('targets.target_type_id')
            .populate('targets.language_id');
        if (!program) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_FOUND, "program");
        }
        for (let i = 0; i < data.language_id.length; i++) {
            if (await checkLanguageId(data.language_id[i]) !== 1) {
                throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_FOUND, "language_id");
            }
        }
        let db_current_target = null;
        if (program.targets.length > 0) {
            db_current_target = program.targets.find(t => t._id.toString() === data.target_id.toString());
        }
        if (!db_current_target) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_VALID, "target")
        }
        let update_target_data = {
            "targets.$.maturity": data.maturity,
            "targets.$.language_id": data.language_id
        };
        if (db_current_target.identifier !== data.identifier) {
            let checkIdentifier = await this.checkExistsIdentifier(program.company_user_id, data.target_type_id, data.identifier, program._id);
            if (checkIdentifier !== 0) {
                throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.CUSTOM, "identifier already exists")
            }
            update_target_data['targets.$.identifier'] = data.identifier;
        }
        if (db_current_target.target_type_id !== data.target_type_id) {
            if (await checkTargetTypeId(data.target_type_id) !== 1) {
                throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_FOUND, "target_type_id");
            }
            update_target_data['targets.$.target_type_id'] = data.target_type_id;
        }
        await this.collection.updateOne({_id: program._id, "targets._id": data.target_id},
            {$set: update_target_data});
        const new_program = await this.collection.findOne({_id: data.id})
            .populate('targets.target_type_id')
            .populate('targets.language_id');

        const updated_target = new_program.targets.find(t => t._id.toString() === data.target_id.toString());
        const history_model = {
            sender_type: SENDER_TYPE.ADMIN,
            activity: ACTIVITY_TEXT_LOG.UPDATE_TARGET,
            type: HISTORY_TYPE.PROGRAM_CHANGE,
            sender_id: data.user_id,
            resource_type: RESOURCE_TYPE.PROGRAM,
            resource_id: program._id,
            info_fields: [{key: "targets", value: updated_target}, {key: "status", value: program.status}],
            fields: [{key: "targets", old_value: program.targets, new_value: new_program.targets}],
            register_date_time: getDateTime()
        };
        const history = await SchemaModels.HistoryModel.create(history_model);
        this.sendProgramChangeNotification([
                {
                    socket_io: hackerIO,
                    target_ids: await this.getTargetIds(SENDER_TYPE.HACKER, program._id),
                    reciever_type: SENDER_TYPE.HACKER
                },
                {
                    socket_io: companyIO,
                    target_ids: await this.getTargetIds(SENDER_TYPE.COMPANY, program._id, program.company_user_id),
                    reciever_type: SENDER_TYPE.COMPANY
                }
            ], program.is_next_generation, program._id, history.register_date_time, program.program_type
        );
        return new_program.targets;
    }

    async deleteTarget(data) {
        const program = await this.collection.findOne({_id: data.id, "targets._id": data.target_id});
        if (!program) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_FOUND, "program");
        }
        await this.collection.updateOne({_id: data.id},
            {
                $pull: {
                    targets: {_id: data.target_id},
                    rewards: {target_id: data.target_id},
                    policies: {target_id: data.target_id},
                }
            });
        const new_program = await this.collection.findOne({_id: data.id});
        if (!new_program) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_FOUND, "program");
        }
        const deleted_target = program.targets.find(t => t._id.toString() === data.target_id.toString());
        const fields = [{key: "targets", old_value: program.targets, new_value: new_program.targets}];
        const info_fields = [{key: "targets", value: deleted_target}, {key: "status", value: program.status}];
        let deleted_reward;
        if (program.rewards && program.rewards.length > 0) {
            deleted_reward = program.rewards.find(r => r.target_id.toString() === data.target_id.toString());
            if (!!deleted_reward) {
                fields.push({key: "rewards", old_value: program.rewards, new_value: new_program.rewards});
                info_fields.push({key: "rewards", value: deleted_reward});
            }
        }
        let deleted_policy;
        if (program.policies && program.policies.length > 0) {
            deleted_policy = program.policies.find(p => p.target_id.toString() === data.target_id.toString());
            if (!!deleted_policy) {
                fields.push({key: "policies", old_value: program.policies, new_value: new_program.policies});
                info_fields.push({key: "policies", value: deleted_policy});
            }
        }
        const history_model = {
            sender_type: SENDER_TYPE.ADMIN,
            activity: ACTIVITY_TEXT_LOG.DELETE_TARGET,
            type: HISTORY_TYPE.PROGRAM_CHANGE,
            sender_id: data.user_id,
            resource_type: RESOURCE_TYPE.PROGRAM,
            resource_id: program._id,
            info_fields,
            fields,
            register_date_time: getDateTime()
        };
        const history = await SchemaModels.HistoryModel.create(history_model);
        this.sendProgramChangeNotification([
                {
                    socket_io: hackerIO,
                    target_ids: await this.getTargetIds(SENDER_TYPE.HACKER, program._id),
                    reciever_type: SENDER_TYPE.HACKER
                },
                {
                    socket_io: companyIO,
                    target_ids: await this.getTargetIds(SENDER_TYPE.COMPANY, program._id, program.company_user_id),
                    reciever_type: SENDER_TYPE.COMPANY
                }
            ], program.is_next_generation, program._id, history.register_date_time, program.program_type
        );
    }

    async createPolicy(data) {
        let program = await this.collection.findOne({_id: data.id})
            .select({_id: 1, company_user_id: 1, policies: 1, status: 1, is_next_generation: 1, program_type: 1});
        if (!program) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_FOUND, "program");
        }
        const check_target = await this.collection.countDocuments({_id: program._id, "targets._id": data.target_id});
        if (check_target === 0) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_VALID, "target");
        }
        const check_policy = await this.collection.countDocuments({
            company_user_id: program.company_user_id,
            "policies.target_id": data.target_id
        });
        if (check_policy !== 0) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.EXIST, "policy");
        }
        let policy_data = {
            target_id: data.target_id,
            out_of_target: data.out_of_target,
            item1: data.item1,
            item2: data.item2,
            item3: data.item3,
            target_information: data.target_information,
            qualifying_vulnerabilities: data.qualifying_vulnerabilities,
            non_qualifying_vulnerabilities: data.non_qualifying_vulnerabilities
        };
        await this.collection.updateOne({_id: program._id}, {$push: {policies: policy_data}});
        const new_program = await this.collection.findOne({_id: data.id}).select({_id: 1, policies: 1});
        const new_policy = new_program.policies.find(r => r.target_id.toString() === data.target_id.toString());
        const history_model = {
            sender_type: SENDER_TYPE.ADMIN,
            activity: ACTIVITY_TEXT_LOG.CREATE_POLICY,
            type: HISTORY_TYPE.PROGRAM_CHANGE,
            sender_id: data.user_id,
            resource_type: RESOURCE_TYPE.PROGRAM,
            resource_id: program._id,
            info_fields: [{key: "status", value: program.status}, {key: "policies", value: new_policy}],
            fields: [{key: "policies", old_value: program.policies, new_value: new_program.policies}],
            register_date_time: getDateTime()
        };
        const history = await SchemaModels.HistoryModel.create(history_model);
        this.sendProgramChangeNotification([
                {
                    socket_io: hackerIO,
                    target_ids: await this.getTargetIds(SENDER_TYPE.HACKER, program._id),
                    reciever_type: SENDER_TYPE.HACKER
                },
                {
                    socket_io: companyIO,
                    target_ids: await this.getTargetIds(SENDER_TYPE.COMPANY, program._id, program.company_user_id),
                    reciever_type: SENDER_TYPE.COMPANY
                }
            ], program.is_next_generation, program._id, history.register_date_time, program.program_type
        );
        return new_program.policies;
    }

    async createPolicyForAllTargets(data) {
        const program = await this.collection.findOne({_id: data.id})
            .select({
                _id: 1,
                company_user_id: 1,
                targets: 1,
                policies: 1,
                status: 1,
                program_type: 1,
                is_next_generation: 1
            });
        if (!program) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_FOUND, "program");
        }
        const policies = [];
        for (const target of program.targets) {
            const policy = {
                _id: generateObjectId(),
                target_id: target._id,
                out_of_target: data.out_of_target,
                item1: data.item1,
                item2: data.item2,
                item3: data.item3,
                target_information: data.target_information,
                qualifying_vulnerabilities: data.qualifying_vulnerabilities,
                non_qualifying_vulnerabilities: data.non_qualifying_vulnerabilities
            };
            policies.push(policy);
        }
        const new_program = await this.collection.findOneAndUpdate({_id: program._id}, {
            $set: {policies}
        }, {projection: {policies: 1}, new: true});
        const history_model = {
            sender_type: SENDER_TYPE.ADMIN,
            activity: ACTIVITY_TEXT_LOG.CREATE_POLICIES_FOR_ALL_TARGETS,
            type: HISTORY_TYPE.PROGRAM_CHANGE,
            sender_id: data.user_id,
            resource_type: RESOURCE_TYPE.PROGRAM,
            resource_id: program._id,
            info_fields: [{key: "status", value: program.status}],
            fields: [{key: "policies", old_value: program.policies, new_value: new_program.policies}],
            register_date_time: getDateTime()
        };
        const history = await SchemaModels.HistoryModel.create(history_model);
        this.sendProgramChangeNotification([
                {
                    socket_io: hackerIO,
                    target_ids: await this.getTargetIds(SENDER_TYPE.HACKER, program._id),
                    reciever_type: SENDER_TYPE.HACKER
                },
                {
                    socket_io: companyIO,
                    target_ids: await this.getTargetIds(SENDER_TYPE.COMPANY, program._id, program.company_user_id),
                    reciever_type: SENDER_TYPE.COMPANY
                }
            ], program.is_next_generation, program._id, history.register_date_time, program.program_type
        );
        return new_program.policies;
    }

    async updatePolicy(data) {
        let program = await this.collection.findOne({_id: data.id})
            .select({
                _id: 1,
                company_user_id: 1,
                policies: 1,
                targets: 1,
                status: 1,
                is_next_generation: 1,
                program_type: 1
            });
        if (!program) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_FOUND, "program");
        }
        const check_target = await this.collection.countDocuments({_id: program._id, "targets._id": data.target_id});
        if (check_target === 0) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_VALID, "target");
        }
        let db_current_policy = {};
        if (program.policies.length > 0) {
            db_current_policy = program.policies.find(r => r._id.toString() === data.policy_id.toString());
        }
        if (!db_current_policy) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_VALID, "policy")
        }
        let policy_data = {
            "policies.$.out_of_target": data.out_of_target,
            "policies.$.item1": data.item1,
            "policies.$.item2": data.item2,
            "policies.$.item3": data.item3,
            "policies.$.target_information": data.target_information,
            "policies.$.qualifying_vulnerabilities": data.qualifying_vulnerabilities,
            "policies.$.non_qualifying_vulnerabilities": data.non_qualifying_vulnerabilities
        };
        if (db_current_policy.target_id.toString() !== data.target_id.toString() && !data.all_target) {
            const check_policy = await this.collection.countDocuments({
                company_user_id: program.company_user_id,
                "policies.target_id": data.target_id
            });
            if (check_policy !== 0) {
                throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.EXIST, "policy");
            }
            policy_data['policies.$.target_id'] = data.target_id;
        }

        let is_db_all_targets = program.policies &&
            program.policies.length === program.targets.length &&
            program.policies.length > 1 && program.policies.every(policy => (
                policy.out_of_target === program.policies[0].out_of_target &&
                policy.item1 === program.policies[0].item1 &&
                policy.item2 === program.policies[0].item2 &&
                policy.item3 === program.policies[0].item3 &&
                policy.qualifying_vulnerabilities === program.policies[0].qualifying_vulnerabilities &&
                policy.non_qualifying_vulnerabilities === program.policies[0].non_qualifying_vulnerabilities &&
                policy.target_information === program.policies[0].target_information
            ));
        let new_program;
        const update_history_model = {
            sender_type: SENDER_TYPE.ADMIN,
            type: HISTORY_TYPE.PROGRAM_CHANGE,
            sender_id: data.user_id,
            resource_type: RESOURCE_TYPE.PROGRAM,
            resource_id: program._id
        };

        if (data.all_target) {
            update_history_model.info_fields = [{key: "status", value: program.status}];
            if (is_db_all_targets) {
                update_history_model.activity = ACTIVITY_TEXT_LOG.UPDATE_POLICIES_FOR_ALL_TARGETS;
                for (let i = 0; i < program.policies.length; i++) {
                    policy_data['policies.$.target_id'] = program.policies[i].target_id;
                    await this.collection.updateOne({
                        _id: program._id,
                        "policies._id": program.policies[i]._id
                    }, {$set: policy_data});
                }
                new_program = await this.collection.findOne({_id: data.id});
                update_history_model.fields = [{
                    key: "policies",
                    old_value: program.policies,
                    new_value: new_program.policies
                }];
            } else {
                const update_policies = [];
                const updated_reward_data = {
                    target_information: data.target_information,
                    non_qualifying_vulnerabilities: data.non_qualifying_vulnerabilities,
                    qualifying_vulnerabilities: data.qualifying_vulnerabilities,
                    out_of_target: data.out_of_target,
                    item1: data.item1,
                    item2: data.item2,
                    item3: data.item3
                };
                if (isArray(program.targets)) {
                    program.targets.forEach(target => {
                        updated_reward_data.target_id = target._id;
                        update_policies.push(updated_reward_data);
                    })
                }
                new_program = await this.collection.findOneAndUpdate({_id: data.id}, {$set: {policies: update_policies}}, {new: true});
                update_history_model.activity = ACTIVITY_TEXT_LOG.CREATE_POLICIES_FOR_ALL_TARGETS;
                update_history_model.fields = [{
                    key: "policies",
                    old_value: program.policies,
                    new_value: new_program.policies
                }];
            }
            update_history_model.register_date_time = getDateTime();
            const history = await SchemaModels.HistoryModel.create(update_history_model);
            this.sendProgramChangeNotification([
                    {
                        socket_io: hackerIO,
                        target_ids: await this.getTargetIds(SENDER_TYPE.HACKER, program._id),
                        reciever_type: SENDER_TYPE.HACKER
                    },
                    {
                        socket_io: companyIO,
                        target_ids: await this.getTargetIds(SENDER_TYPE.COMPANY, program._id, program.company_user_id),
                        reciever_type: SENDER_TYPE.COMPANY
                    }
                ], program.is_next_generation, program._id, history.register_date_time, program.program_type
            );
        } else {
            if (is_db_all_targets) {
                const delete_history_model = Object.assign({}, update_history_model);
                delete_history_model.register_date_time = getDateTime();
                delete_history_model.activity = ACTIVITY_TEXT_LOG.DELETE_POLICY;
                let curent_program;
                for (let i = 0; i < program.policies.length; i++) {
                    curent_program = await this.collection.findOne({_id: data.id});
                    if (data.policy_id.toString() !== program.policies[i]._id.toString()) {
                        await this.collection.updateOne({_id: data.id}, {$pull: {policies: {_id: {$eq: program.policies[i]._id}}}});
                        delete_history_model.info_fields = [{key: "status", value: program.status}, {
                            key: "policies",
                            value: program.policies[i]
                        }];
                        new_program = await this.collection.findOne({_id: data.id});
                        delete_history_model.fields = [{
                            key: "policies",
                            old_value: curent_program.policies,
                            new_value: new_program.policies
                        }];
                        await SchemaModels.HistoryModel.create(delete_history_model);
                    }
                }
                if (curent_program) {
                    program = curent_program;
                }
            }
            new_program = await this.collection.findOneAndUpdate({
                _id: program._id,
                "policies._id": data.policy_id
            }, {$set: policy_data}, {new: true});
            update_history_model.info_fields = [{key: "status", value: program.status}, {
                key: "policies",
                value: new_program.policies.find(d => d._id.toString() === data.policy_id.toString())
            }];
            update_history_model.activity = ACTIVITY_TEXT_LOG.UPDATE_POLICY;
            update_history_model.fields = [{
                key: "policies",
                old_value: program.policies,
                new_value: new_program.policies
            }];
            update_history_model.register_date_time = getDateTime();
            const history = await SchemaModels.HistoryModel.create(update_history_model);
            this.sendProgramChangeNotification([
                    {socket_io: hackerIO, target_ids: await this.getTargetIds(SENDER_TYPE.HACKER, program._id)}
                ], program.is_next_generation, program._id, history.register_date_time, program.program_type
            );
        }
        return new_program.policies;
    }

    async deletePolicy(data) {
        let program = await this.collection.findOne({_id: data.id, "policies._id": data.policy_id}).select({
            _id: 1,
            status: 1,
            is_next_generation: 1,
            company_user_id: 1,
            program_type: 1,
            policies: 1
        });
        if (!program) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_FOUND, "program");
        }
        let new_program;
        const history_model = {
            sender_type: SENDER_TYPE.ADMIN,
            type: HISTORY_TYPE.PROGRAM_CHANGE,
            sender_id: data.user_id,
            resource_type: RESOURCE_TYPE.PROGRAM,
            resource_id: program._id,
            register_date_time: getDateTime()
        };
        if (data.all_target) {
            history_model.info_fields = [{key: "status", value: program.status}];
            history_model.activity = ACTIVITY_TEXT_LOG.DELETE_POLICIES_FOR_ALL_TARGETS;
            new_program = await this.collection.findOneAndUpdate({_id: program._id}, {$set: {policies: []}}, {new: true});
        } else {
            const delete_policy = program.policies.find(policy => policy._id.toString() === data.policy_id.toString());
            history_model.activity = ACTIVITY_TEXT_LOG.DELETE_POLICY;
            history_model.info_fields = [{key: "status", value: program.status}, {
                key: "policies",
                value: delete_policy
            }];
            new_program = await this.collection.findOneAndUpdate({_id: program._id}, {$pull: {policies: {_id: data.policy_id}}}, {new: true});
        }
        history_model.fields = [{key: "policies", old_value: program.policies, new_value: new_program.policies}];
        const history = await SchemaModels.HistoryModel.create(history_model);
        this.sendProgramChangeNotification([
                {
                    socket_io: hackerIO,
                    target_ids: await this.getTargetIds(SENDER_TYPE.HACKER, program._id),
                    reciever_type: SENDER_TYPE.HACKER
                },
                {
                    socket_io: companyIO,
                    target_ids: await this.getTargetIds(SENDER_TYPE.COMPANY, program._id, program.company_user_id),
                    reciever_type: SENDER_TYPE.COMPANY
                }
            ], program.is_next_generation, program._id, history.register_date_time, program.program_type
        );
    }

    async createReward(data) {
        let program = await this.collection.findOne({_id: data.id}).select({
            _id: 1,
            rewards: 1,
            status: 1,
            product_type: 1,
            company_user_id: 1,
            program_type: 1,
            is_next_generation: 1
        }).lean();
        if (!program) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_FOUND, "program");
        }
        if (program.is_next_generation === PROGRAM_BOUNTY_TYPE.INTELLIGENCE_DISCOVERY) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.CUSTOM, "you can not update reward for this program");
        }
        if (await checkCurrencyId(data.currency_id) === 0) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_FOUND, "currency");
        }
        const currency_ids = program.rewards.map(d => d.currency_id);
        const is_same_currency = currency_ids.every(id => id.toString() === data.currency_id);
        if (!is_same_currency) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_VALID, "curency");
        }
        const check_target = await this.collection.countDocuments({_id: program._id, "targets._id": data.target_id});
        if (check_target === 0) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_VALID, "target");
        }
        const check_rewards = await this.collection.countDocuments({
            _id: program._id,
            "rewards.target_id": data.target_id
        });
        if (check_rewards !== 0) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.EXIST, "reward");
        }
        let reward_data = {
            target_id: data.target_id,
            critical_price: data.critical_price,
            high_price: data.high_price,
            medium_price: data.medium_price,
            low_price: data.low_price,
            none_price: data.none_price,
            currency_id: data.currency_id
        };
        await this.collection.updateOne({_id: program._id}, {$push: {rewards: reward_data}});
        const new_program = await this.collection.findOne({"_id": data.id})
            .populate('rewards.currency_id');
        const new_reward = new_program.rewards.find(r => r.target_id.toString() === data.target_id.toString());
        const history_model = {
            sender_type: SENDER_TYPE.ADMIN,
            activity: ACTIVITY_TEXT_LOG.CREATE_REWARD,
            type: HISTORY_TYPE.PROGRAM_CHANGE,
            sender_id: data.user_id,
            resource_type: RESOURCE_TYPE.PROGRAM,
            resource_id: program._id,
            info_fields: [{key: "status", value: program.status}, {key: "rewards", value: new_reward}],
            fields: [{key: "rewards", old_value: program.rewards, new_value: new_program.rewards}],
            register_date_time: getDateTime()
        };
        const history = await SchemaModels.HistoryModel.create(history_model);
        this.sendProgramChangeNotification([
                {
                    socket_io: hackerIO,
                    target_ids: await this.getTargetIds(SENDER_TYPE.HACKER, program._id),
                    reciever_type: SENDER_TYPE.HACKER
                },
                {
                    socket_io: companyIO,
                    target_ids: await this.getTargetIds(SENDER_TYPE.COMPANY, program._id, program.company_user_id),
                    reciever_type: SENDER_TYPE.COMPANY
                }
            ], program.is_next_generation, program._id, history.register_date_time, program.program_type
        );
        return new_program.rewards;
    }

    async createRewardForAllTargets(data) {
        let program = await this.collection.findOne({_id: data.id}).select({
            _id: 1,
            status: 1,
            rewards: 1,
            is_next_generation: 1,
            program_type: 1,
            company_user_id: 1,
            targets: 1
        }).lean();
        if (!program) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_FOUND, "program");
        }
        if (await checkCurrencyId(data.currency_id) === 0) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_FOUND, "currency");
        }
        const rewards = [];
        for (const target of program.targets) {
            const reward = {
                _id: generateObjectId(),
                target_id: target._id,
                critical_price: data.critical_price,
                high_price: data.high_price,
                medium_price: data.medium_price,
                low_price: data.low_price,
                none_price: data.none_price,
                currency_id: data.currency_id
            };
            rewards.push(reward);
        }
        const new_program = await this.collection.findOneAndUpdate({_id: program._id}, {
            $set: {rewards}
        }, {projection: {rewards: 1}, new: true});
        const history_model = {
            sender_type: SENDER_TYPE.ADMIN,
            activity: ACTIVITY_TEXT_LOG.CREATE_REWARDS_FOR_ALL_TARGETS,
            type: HISTORY_TYPE.PROGRAM_CHANGE,
            sender_id: data.user_id,
            resource_type: RESOURCE_TYPE.PROGRAM,
            resource_id: program._id,
            info_fields: [{key: "status", value: program.status}],
            fields: [{key: "rewards", old_value: program.rewards, new_value: new_program.rewards}],
            register_date_time: getDateTime()
        };
        const history = await SchemaModels.HistoryModel.create(history_model);
        this.sendProgramChangeNotification([
                {
                    socket_io: hackerIO,
                    target_ids: await this.getTargetIds(SENDER_TYPE.HACKER, program._id),
                    reciever_type: SENDER_TYPE.HACKER
                },
                {
                    socket_io: companyIO,
                    target_ids: await this.getTargetIds(SENDER_TYPE.COMPANY, program._id, program.company_user_id),
                    reciever_type: SENDER_TYPE.COMPANY
                }
            ], program.is_next_generation, program._id, history.register_date_time, program.program_type
        );
        return new_program.rewards;
    }

    async updateReward(data) {
        let program = await this.collection.findOne({_id: data.id}).select({
            _id: 1,
            rewards: 1,
            targets: 1,
            program_type: 1,
            company_user_id: 1,
            status: 1,
            is_next_generation: 1
        }).lean();
        if (!program) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_FOUND, "program");
        }
        if (program.is_next_generation === PROGRAM_BOUNTY_TYPE.INTELLIGENCE_DISCOVERY) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.CUSTOM, "you can not add reward for this program");
        }
        if (await checkCurrencyId(data.currency_id) === 0) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_FOUND, "currency");
        }
        const currency_ids = program.rewards.map(d => d.currency_id);
        if (currency_ids.length > 1) {
            const is_same_currency = currency_ids.every(id => id.toString() === data.currency_id.toString());
            if (!is_same_currency) {
                throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_VALID, "curency");
            }
        }
        let db_current_reward = {};
        if (program.rewards.length > 0) {
            db_current_reward = program.rewards.find(r => r._id.toString() === data.reward_id.toString());
        }
        if (!db_current_reward) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_VALID, "reward")
        }
        let reward_data = {
            "rewards.$.currency_id": data.currency_id,
            "rewards.$.critical_price": data.critical_price,
            "rewards.$.high_price": data.high_price,
            "rewards.$.medium_price": data.medium_price,
            "rewards.$.low_price": data.low_price,
            "rewards.$.none_price": data.none_price
        };
        let is_db_all_targets = program.rewards &&
            program.rewards.length === program.targets.length &&
            program.rewards.length > 1 && program.rewards.every(reward => (
                reward.none_price === program.rewards[0].none_price &&
                reward.low_price === program.rewards[0].low_price &&
                reward.medium_price === program.rewards[0].medium_price &&
                reward.high_price === program.rewards[0].high_price &&
                reward.critical_price === program.rewards[0].critical_price
            ));
        if (db_current_reward.target_id && db_current_reward.target_id.toString() !== data.target_id.toString() && !data.all_target) {
            const check_target = await this.collection.countDocuments({
                _id: program._id,
                "targets._id": data.target_id
            });
            if (check_target === 0) {
                throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_VALID, "target");
            }
            reward_data['rewards.$.target_id'] = data.target_id;
        }
        let new_program;
        const update_history_model = {
            sender_type: SENDER_TYPE.ADMIN,
            type: HISTORY_TYPE.PROGRAM_CHANGE,
            sender_id: data.user_id,
            resource_type: RESOURCE_TYPE.PROGRAM,
            resource_id: program._id
        };
        if (data.all_target) {
            update_history_model.info_fields = [{key: "status", value: program.status}];
            if (is_db_all_targets) {
                update_history_model.activity = ACTIVITY_TEXT_LOG.UPDATE_REWARDS_FOR_ALL_TARGETS;
                for (let i = 0; i < program.rewards.length; i++) {
                    reward_data['rewards.$.target_id'] = program.rewards[i].target_id;
                    await this.collection.updateOne({
                        _id: program._id,
                        "rewards._id": program.rewards[i]._id
                    }, {$set: reward_data});
                }
                new_program = await this.collection.findOne({_id: data.id});
                update_history_model.fields = [{
                    key: "rewards",
                    old_value: program.rewards,
                    new_value: new_program.rewards
                }];
            } else {
                const update_rewards = [];
                const updated_reward_data = {
                    currency_id: data.currency_id,
                    none_price: data.none_price,
                    low_price: data.low_price,
                    medium_price: data.medium_price,
                    high_price: data.high_price,
                    target_id: data.target_id,
                    critical_price: data.critical_price,
                };
                if (isArray(program.targets)) {
                    program.targets.forEach(target => {
                        updated_reward_data.target_id = target._id;
                        update_rewards.push(updated_reward_data);
                    })
                }
                new_program = await this.collection.findOneAndUpdate({_id: data.id}, {$set: {rewards: update_rewards}}, {new: true});
                update_history_model.activity = ACTIVITY_TEXT_LOG.CREATE_REWARDS_FOR_ALL_TARGETS;
                update_history_model.fields = [{
                    key: "rewards",
                    old_value: program.rewards,
                    new_value: new_program.rewards
                }];
            }
            update_history_model.register_date_time = getDateTime();
            const history = await SchemaModels.HistoryModel.create(update_history_model);
            this.sendProgramChangeNotification([
                    {
                        socket_io: hackerIO,
                        target_ids: await this.getTargetIds(SENDER_TYPE.HACKER, program._id),
                        reciever_type: SENDER_TYPE.HACKER
                    },
                    {
                        socket_io: companyIO,
                        target_ids: await this.getTargetIds(SENDER_TYPE.COMPANY, program._id, program.company_user_id),
                        reciever_type: SENDER_TYPE.COMPANY
                    }
                ], program.is_next_generation, program._id, history.register_date_time, program.program_type
            );
        } else {
            if (is_db_all_targets) {
                for (let i = 0; i < program.rewards.length; i++) {
                    const current_program = await this.collection.findOne({_id: data.id});
                    if (data.reward_id.toString() !== program.rewards[i]._id.toString()) {
                        await this.collection.updateOne({_id: data.id}, {$pull: {rewards: {_id: {$eq: program.rewards[i]._id}}}});
                        const delete_history_model = Object.assign({}, update_history_model);
                        delete_history_model.activity = ACTIVITY_TEXT_LOG.DELETE_REWARD;
                        delete_history_model.info_fields = [{key: "status", value: program.status}, {
                            key: "rewards",
                            value: program.rewards[i]
                        }];
                        new_program = await this.collection.findOne({_id: data.id});
                        delete_history_model.fields = [{
                            key: "rewards",
                            old_value: current_program.rewards,
                            new_value: new_program.rewards
                        }];
                        delete_history_model.register_date_time = getDateTime();
                        await SchemaModels.HistoryModel.create(delete_history_model);
                    }
                }
            }
            new_program = await this.collection.findOneAndUpdate({
                _id: program._id,
                "rewards._id": data.reward_id
            }, {$set: reward_data}, {new: true}).lean();
            update_history_model.info_fields = [{key: "status", value: program.status}, {
                key: "rewards",
                value: new_program.rewards.find(reward => reward._id.toString() === data.reward_id.toString())
            }];
            update_history_model.activity = ACTIVITY_TEXT_LOG.UPDATE_REWARD;
            update_history_model.fields = [{
                key: "rewards",
                old_value: program.rewards,
                new_value: new_program.rewards
            }];
            update_history_model.register_date_time = getDateTime();
            const history = await SchemaModels.HistoryModel.create(update_history_model);
            this.sendProgramChangeNotification([
                    {
                        socket_io: hackerIO,
                        target_ids: await this.getTargetIds(SENDER_TYPE.HACKER, program._id),
                        reciever_type: SENDER_TYPE.HACKER
                    },
                    {
                        socket_io: companyIO,
                        target_ids: await this.getTargetIds(SENDER_TYPE.COMPANY, program._id, program.company_user_id),
                        reciever_type: SENDER_TYPE.COMPANY
                    }
                ], program.is_next_generation, program._id, history.register_date_time, program.program_type
            );
        }
        new_program = await this.collection.findOne({"_id": data.id})
            .populate('rewards.currency_id');
        return new_program.rewards;
    }

    async deleteReward(data) {
        let program = await this.collection.findOne({_id: data.id, "rewards._id": data.reward_id}).select({
            _id: 1,
            rewards: 1,
            status: 1,
            program_type: 1,
            company_user_id: 1,
            is_next_generation: 1
        }).lean();
        if (!program) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_FOUND, "program");
        }
        if (program.is_next_generation === PROGRAM_BOUNTY_TYPE.INTELLIGENCE_DISCOVERY) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.CUSTOM, "you can not delete reward for this program");
        }
        let new_program;
        const history_model = {
            sender_type: SENDER_TYPE.ADMIN,
            type: HISTORY_TYPE.PROGRAM_CHANGE,
            sender_id: data.user_id,
            resource_type: RESOURCE_TYPE.PROGRAM,
            resource_id: program._id,
            register_date_time: getDateTime()
        };
        if (data.all_target) {
            history_model.info_fields = [{key: "status", value: program.status}];
            history_model.activity = ACTIVITY_TEXT_LOG.DELETE_REWARDS_FOR_ALL_TARGETS;
            new_program = await this.collection.findOneAndUpdate({_id: program._id}, {$set: {rewards: []}}, {new: true});
        } else {
            const deleted_reward = program.rewards.find(reward => reward._id.toString() === data.reward_id.toString());
            history_model.activity = ACTIVITY_TEXT_LOG.DELETE_REWARD;
            history_model.info_fields = [{key: "status", value: program.status}, {
                key: "rewards",
                value: deleted_reward
            }];
            new_program = await this.collection.findOneAndUpdate({_id: program._id}, {$pull: {rewards: {_id: data.reward_id}}}, {new: true});
        }
        history_model.fields = [{key: "rewards", old_value: program.rewards, new_value: new_program.rewards}];
        const history = await SchemaModels.HistoryModel.create(history_model);
        this.sendProgramChangeNotification([
                {
                    socket_io: hackerIO,
                    target_ids: await this.getTargetIds(SENDER_TYPE.HACKER, program._id),
                    reciever_type: SENDER_TYPE.HACKER
                },
                {
                    socket_io: companyIO,
                    target_ids: await this.getTargetIds(SENDER_TYPE.COMPANY, program._id, program.company_user_id),
                    reciever_type: SENDER_TYPE.COMPANY
                }
            ], program.is_next_generation, program._id, history.register_date_time, program.program_type
        );
    }

    async delete(id, user_id) {
        const program = await this.collection.findOne({_id: id});
        if (!program) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_RESOURCE_FOUND, "program");
        }
        if ([PROGRAM_STATUS.CLOSE, PROGRAM_STATUS.APPROVED, PROGRAM_STATUS.PENDING].includes(program.status)) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.CUSTOM, `program status is ${this.getStatusTitle(program.status)}`);
        }
        await SchemaModels.NotificationModel.deleteMany({program_id: id});
        await SchemaModels.PaymentHistoryModel.deleteMany({program_id: id});
        await this.collection.deleteOne({_id: id});
        // const history_model = {
        //     sender_type: SENDER_TYPE.ADMIN,
        //     activity: ACTIVITY_TEXT_LOG.DELETE_PROGRAM,
        //     sender_id: user_id,
        //     resource_type: RESOURCE_TYPE.PROGRAM,
        //     resource_id: id,
        //     info_fields: [{key: "program", value: program}],
        //     register_date_time: getDateTime()
        // };
        // await SchemaModels.HistoryModel.create(history_model);
    }

    async changeVerify(data) {
        const program = await this.collection.findOne({_id: data.id},
            {_id: 1, company_user_id: 1, program_type: 1, is_next_generation: 1, status: 1, is_verify: 1})
            .populate({path: 'company_user_id', select: {_id: 1, display_name: 1, fn: 1}});
        if (!program) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_RESOURCE_FOUND, "program");
        }
        const companies = [];
        companies.push(program.company_user_id);
        const members = await SchemaModels.CompanyUserModel.find({parent_user_id: program.company_user_id._id}).select({
            _id: 1,
            display_name: 1,
            access_program_list: 1,
            fn: 1
        });
        if (isArray(members) && members.length > 0) {
            members.forEach(m => {
                if (!m.access_program_list || m.access_program_list.length === 0 ||
                    m.access_program_list.map(p => p._id.toString())
                        .includes(program._id.toString())) {
                    companies.push(m);
                }
            });
        }
        const notifications = await this.createNotifications("Program Verification",
            companies, data.is_verify, FIELD_TYPE.VERIFICATION, data.is_verify === true ?
                MESSAGE_TYPE.SUCCESS : MESSAGE_TYPE.DANGER, data.user_id, program._id);
        this.sendNotification("notification", notifications, program, companyIO, "company_user_id");
        await this.collection.updateOne({_id: data.id}, {$set: {is_verify: data.is_verify}});
        // if (data.is_verify !== program.is_verify) {
        //     const history_model = {
        //         sender_type: SENDER_TYPE.ADMIN,
        //         activity: ACTIVITY_TEXT_LOG.CHANGE_VERIFICATION,
        //         type: HISTORY_TYPE.PROGRAM_CHANGE,
        //         sender_id: data.user_id,
        //         resource_type: RESOURCE_TYPE.PROGRAM,
        //         resource_id: program._id,
        //         info_fields: [{key: "status", value: program.status}],
        //         fields: [{key: "is_verify", old_value: program.is_verify, new_value: data.is_verify}],
        //         register_date_time: getDateTime()
        //     };
        //     await SchemaModels.HistoryModel.create(history_model);
        // }
    }

    async setExpireDay(data) {
        const program = await this.collection.countDocuments({_id: data.id});
        if (program === 0) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_RESOURCE_FOUND, "program");
        }
        await this.collection.updateOne({_id: data.id}, {expire_date_program: moment(data.expire_day).utcOffset(0, false)});
        // const history_model = {
        //     sender_type: SENDER_TYPE.ADMIN,
        //     activity: ACTIVITY_TEXT_LOG.SET_EXPIRE_DAY,
        //     type: HISTORY_TYPE.PROGRAM_CHANGE,
        //     sender_id: data.user_id,
        //     resource_type: RESOURCE_TYPE.PROGRAM,
        //     resource_id: program._id,
        //     info_fields: [{key: "status", value: program.status}],
        //     fields: [
        //         {key: "expire_date_program", old_value: program.expire_date_program, new_value: expire_date_program},
        //         {key: "expire_day_program", old_value: program.expire_day_program, new_value: data.expire_day}
        //     ],
        //     register_date_time: getDateTime()
        // };
        // await SchemaModels.HistoryModel.create(history_model);
    }

    async changeStatus(data) {
        const program = await this.collection.findOne({_id: data.id},
            {_id: 1, company_user_id: 1, program_type: 1, is_next_generation: 1, status: 1})
            .populate({path: 'company_user_id', select: {_id: 1, display_name: 1, fn: 1}});
        if (!program) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_RESOURCE_FOUND, "program");
        }
        const updated_data = {status: data.status};
        if (data.status === PROGRAM_STATUS.APPROVED) {
            updated_data.start_date_program = getDateTime();
        }
        await this.collection.updateOne({_id: data.id}, {$set: updated_data});
        const companies = [];
        companies.push(program.company_user_id);
        const members = await SchemaModels.CompanyUserModel.find({parent_user_id: program.company_user_id._id}).select({
            _id: 1,
            display_name: 1,
            access_program_list: 1,
            fn: 1
        });
        if (isArray(members) && members.length > 0) {
            members.forEach(m => {
                if (!m.access_program_list || m.access_program_list.length === 0 ||
                    m.access_program_list.map(p => p._id.toString())
                        .includes(program._id.toString())) {
                    companies.push(m);
                }
            });
        }
        // if (program.status !== data.status) {
        //     const history_model = {
        //         sender_type: SENDER_TYPE.ADMIN,
        //         activity: ACTIVITY_TEXT_LOG.CHANGE_STATUS,
        //         type: HISTORY_TYPE.PROGRAM_CHANGE,
        //         sender_id: data.user_id,
        //         resource_type: RESOURCE_TYPE.PROGRAM,
        //         resource_id: program._id,
        //         info_fields: [{key: "status", value: program.status}],
        //         fields: [{key: "status", old_value: program.status, new_value: data.status}],
        //         register_date_time: getDateTime()
        //     };
        //     await SchemaModels.HistoryModel.create(history_model);
        // }
        const notifications = await this.createNotifications("Program Status",
            companies, this.getStatusTitle(data.status), FIELD_TYPE.STATUS,
            MESSAGE_TYPE.INFO, data.user_id, program._id);
        this.sendNotification("notification", notifications, program, companyIO, "company_user_id");

        return updated_data.start_date_program || null;
    }

    async changeProgramType(data) {
        const program = await this.collection.findOne({_id: data.id}, {_id: 1, program_type: 1, status: 1});
        if (!program) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_RESOURCE_FOUND, "program");
        }
        await this.collection.updateOne({_id: data.id}, {program_type: data.program_type});
        // if (program.program_type !== data.program_type) {
        //     const history_model = {
        //         sender_type: SENDER_TYPE.ADMIN,
        //         activity: ACTIVITY_TEXT_LOG.CHANGE_PROGRAM_TYPE,
        //         sender_id: data.user_id,
        //         resource_type: RESOURCE_TYPE.PROGRAM,
        //         resource_id: program._id,
        //         info_fields: [{key: "status", value: program.status}],
        //         type: HISTORY_TYPE.PROGRAM_CHANGE,
        //         fields: [{key: "program_type", old_value: program.program_type, new_value: data.program_type}],
        //         register_date_time: getDateTime()
        //     };
        //     await SchemaModels.HistoryModel.create(history_model);
        // }
    }

    async changeProductType(data) {
        const program = await this.collection.findOne({_id: data.id}, {_id: 1, product_type: 1, status: 1});
        if (!program) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_RESOURCE_FOUND, "program");
        }
        if (program.is_next_generation === PROGRAM_BOUNTY_TYPE.INTELLIGENCE_DISCOVERY) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.CUSTOM, "intelligence discovery program do not have product type");
        }
        await this.collection.updateOne({_id: data.id}, {product_type: data.product_type});
        // if (program.product_type !== data.product_type) {
        //     const history_model = {
        //         sender_type: SENDER_TYPE.ADMIN,
        //         activity: ACTIVITY_TEXT_LOG.CHANGE_PRODUCT_TYPE,
        //         sender_id: data.user_id,
        //         info_fields: [{key: "status", value: program.status}],
        //         type: HISTORY_TYPE.PROGRAM_CHANGE,
        //         resource_type: RESOURCE_TYPE.PROGRAM,
        //         resource_id: program._id,
        //         fields: [{key: "product_type", old_value: program.product_type, new_value: data.product_type}],
        //         register_date_time: getDateTime()
        //     };
        //     await SchemaModels.HistoryModel.create(history_model);
        // }
    }

    async changeProgramBountyType(data) {
        const program = await this.collection.findOne({_id: data.id}, {_id: 1, is_next_generation: 1, status: 1});
        if (!program) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_RESOURCE_FOUND, "program");
        }
        await this.collection.updateOne({_id: data.id}, {is_next_generation: data.is_next_generation});
        // if (program.is_next_generation !== data.is_next_generation) {
        //     const history_model = {
        //         sender_type: SENDER_TYPE.ADMIN,
        //         activity: ACTIVITY_TEXT_LOG.CHANGE_PROGRAM_BOUNTY_TYPE,
        //         sender_id: data.user_id,
        //         resource_type: RESOURCE_TYPE.PROGRAM,
        //         resource_id: program._id,
        //         info_fields: [{key: "status", value: program.status}],
        //         type: HISTORY_TYPE.PROGRAM_CHANGE,
        //         fields: [{
        //             key: "is_next_generation",
        //             old_value: program.is_next_generation,
        //             new_value: data.is_next_generation
        //         }],
        //         register_date_time: getDateTime()
        //     };
        //     await SchemaModels.HistoryModel.create(history_model);
        // }
    }

    async updateMaximumReward(data) {
        const program = await this.collection.findOne({_id: data.id},
            {_id: 1, company_user_id: 1, program_type: 1, is_next_generation: 1, status: 1, maximum_reward: 1})
            .populate({path: 'company_user_id', select: {_id: 1, display_name: 1, fn: 1}});
        if (!program) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_RESOURCE_FOUND, "program");
        }
        const is_positive = data.maximum_reward > 0;
        const new_program = await this.collection.findOneAndUpdate({_id: data.id},
            {$inc: {maximum_reward: data.maximum_reward}}, {new: true});
        const rewards_max_critical = Math.max(...new_program.rewards.map(reward => reward.critical_price));
        if (new_program.status === PROGRAM_STATUS.CLOSE && rewards_max_critical < new_program.maximum_reward ||
            new_program.status === PROGRAM_STATUS.APPROVED && rewards_max_critical > new_program.maximum_reward) {
            const new_status = is_positive ? PROGRAM_STATUS.APPROVED : PROGRAM_STATUS.CLOSE;
            await this.collection.updateOne({_id: data.id}, {$set: {status: new_status}});
        }
        const payment_model = {
            program_id: new_program._id,
            company_user_id: new_program.company_user_id,
            is_positive: data.maximum_reward > 0,
            amount: Math.abs(data.maximum_reward),
            type: 2,
            register_date_time: getDateTime()
        };
        const companies = [];
        companies.push(program.company_user_id);
        const members = await SchemaModels.CompanyUserModel.find({parent_user_id: program.company_user_id._id}).select({
            _id: 1,
            display_name: 1,
            access_program_list: 1,
            fn: 1
        });
        if (isArray(members) && members.length > 0) {
            members.forEach(m => {
                if (!m.access_program_list || m.access_program_list.length === 0 ||
                    m.access_program_list.map(p => p._id.toString())
                        .includes(program._id.toString())) {
                    companies.push(m);
                }
            });
        }
        const notifications = await this.createNotifications("Reward Pool",
            companies, new_program.maximum_reward, FIELD_TYPE.REWARD, is_positive ?
                MESSAGE_TYPE.SUCCESS : MESSAGE_TYPE.DANGER, data.user_id, new_program._id);
        this.sendNotification("notification", notifications, program, companyIO, "company_user_id");
        await SchemaModels.PaymentHistoryModel.create(payment_model);
        if (new_program.maximum_reward !== program.maximum_reward) {
            const history_model = {
                sender_type: SENDER_TYPE.ADMIN,
                activity: ACTIVITY_TEXT_LOG.UPDATE_MAXIMUM_REWARD,
                type: HISTORY_TYPE.PROGRAM_CHANGE,
                sender_id: data.user_id,
                resource_type: RESOURCE_TYPE.PROGRAM,
                resource_id: program._id,
                info_fields: [{key: "status", value: program.status}, {
                    key: "maximum_reward",
                    value: data.maximum_reward
                }],
                fields: [{
                    key: "maximum_reward",
                    old_value: program.maximum_reward,
                    new_value: new_program.maximum_reward
                }],
                register_date_time: getDateTime()
            };
            const history = await SchemaModels.HistoryModel.create(history_model);
            this.sendProgramChangeNotification([
                    {
                        socket_io: hackerIO,
                        target_ids: await this.getTargetIds(SENDER_TYPE.HACKER, program._id),
                        reciever_type: SENDER_TYPE.HACKER
                    },
                    {
                        socket_io: companyIO,
                        target_ids: await this.getTargetIds(SENDER_TYPE.COMPANY, program._id, program.company_user_id),
                        reciever_type: SENDER_TYPE.COMPANY
                    }
                ], program.is_next_generation, program._id, history.register_date_time, program.program_type
            );
        }
    }

    async getModerators(data) {
        const program = await this.collection.findOne({_id: data.id}, {_id: 1, moderator_users: 1})
            .populate('moderator_users.moderator_user_id').lean();
        if (!program) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_RESOURCE_FOUND, "program");
        }
        await checkUserAccess(data.user_level_access, data.user_id, program._id, false);
        return isArray(program.moderator_users) ? program.moderator_users.map(d => {
            return {
                _id: d.moderator_user_id._id, email: d.moderator_user_id.email, avatar: d.moderator_user_id.avatar,
                user_access: d.user_level_access, alias: d.moderator_user_id.alias, assign_date_time: d.assign_date_time
            }
        }) : []
    }

    async deleteModerator(data) {
        const program = await this.collection.findOne({_id: data.id});
        if (!program) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_RESOURCE_FOUND, "program");
        }
        const is_assigned_before = await this.collection.countDocuments({
            _id: data.id,
            "moderator_users.moderator_user_id": data.moderator_user_id
        });
        if (is_assigned_before === 0) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.CUSTOM, "moderator is not assigned to this program");
        }
        await this.collection.updateOne({_id: data.id}, {$pull: {moderator_users: {moderator_user_id: data.moderator_user_id}}});
        // const history_model = {
        //     sender_type: SENDER_TYPE.ADMIN,
        //     activity: ACTIVITY_TEXT_LOG.DELETE_ASSIGNED_MODERATOR,
        //     sender_id: data.user_id,
        //     resource_type: RESOURCE_TYPE.PROGRAM,
        //     resource_id: program._id,
        //     info_fields: [{
        //         key: "hacker",
        //         value: program.moderator_users.find(d => d.moderator_user_id.toString() === data.moderator_user_id.toString())
        //     }],
        //     register_date_time: getDateTime()
        // };
        // await SchemaModels.HistoryModel.create(history_model);
    }

    async assignModerator(data) {
        const program = await this.collection.findOne({_id: data.id});
        if (!program) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_RESOURCE_FOUND, "program");
        }
        const moderator = await SchemaModels.ModeratorUserModel.findOne({_id: data.moderator_user_id})
            .select({_id: 1, email: 1, avatar: 1, alias: 1}).lean();
        if (!moderator) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_RESOURCE_FOUND, "moderator");
        }
        const is_assigned_before = await this.collection.countDocuments({
            _id: data.id,
            "moderator_users.moderator_user_id": data.moderator_user_id
        });
        if (is_assigned_before > 0) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.CUSTOM, "moderator is assigned to this program");
        }
        const assign_date_time = getDateTime();
        const moderator_data = {
            moderator_user_id: data.moderator_user_id,
            user_level_access: data.user_access,
            assign_date_time: assign_date_time
        };
        const new_program = await this.collection.findOneAndUpdate({_id: data.id}, {
            $push: {
                moderator_users: moderator_data
            }
        }, {new: true});
        // const history_model = {
        //     sender_type: SENDER_TYPE.ADMIN,
        //     activity: ACTIVITY_TEXT_LOG.ASSIGN_MODERATOR,
        //     sender_id: data.user_id,
        //     resource_type: RESOURCE_TYPE.PROGRAM,
        //     resource_id: program._id,
        //     info_fields: [{key: "moderator_users", value: moderator_data}],
        //     fields: [{
        //         key: "moderator_users",
        //         old_value: program.moderator_users,
        //         new_value: new_program.moderator_users
        //     }],
        //     register_date_time: getDateTime()
        // };
        // await SchemaModels.HistoryModel.create(history_model);
        moderator.user_access = data.user_access;
        moderator.assign_date_time = assign_date_time;
        return moderator;
    }

    async updateAssignedModerator(data) {
        const program = await this.collection.findOne({
            _id: data.id,
            "moderator_users.moderator_user_id": data.moderator_user_id
        });
        if (!program) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_RESOURCE_FOUND, "program");
        }
        const moderator = await SchemaModels.ModeratorUserModel.findOne({_id: data.moderator_user_id})
            .select({_id: 1}).lean();
        if (!moderator) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_RESOURCE_FOUND, "moderator");
        }
        const is_assigned_before = await this.collection.countDocuments({
            _id: data.id,
            "moderator_users.moderator_user_id": data.moderator_user_id
        });
        if (is_assigned_before === 0) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.CUSTOM, "moderator is not assigned to this program");
        }
        const new_program = await this.collection.findOneAndUpdate({
            _id: data.id,
            "moderator_users.moderator_user_id": data.moderator_user_id
        }, {
            $set: {"moderator_users.$.user_level_access": data.user_access},
        }, {new: true});
        moderator.user_access = data.user_access;
        // const history_model = {
        //     sender_type: SENDER_TYPE.ADMIN,
        //     activity: ACTIVITY_TEXT_LOG.UPDATE_ASSIGNED_MODERATOR,
        //     sender_id: data.user_id,
        //     resource_type: RESOURCE_TYPE.PROGRAM,
        //     resource_id: program._id,
        //     info_fields: [{
        //         key: "moderator_users",
        //         value: new_program.moderator_users.find(d => d.moderator_user_id.toString() === data.moderator_user_id.toString())
        //     }],
        //     fields: [{
        //         key: "moderator_users",
        //         old_value: program.moderator_users,
        //         new_value: new_program.moderator_users
        //     }],
        //     register_date_time: getDateTime()
        // };
        // await SchemaModels.HistoryModel.create(history_model);
        return moderator;
    }

    async getHackers(data) {
        const program = await this.collection.findOne({_id: data.id}, {_id: 1});
        if (!program) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_RESOURCE_FOUND, "program");
        }
        const response = {};
        let hackers = [];
        const showPerPage = 12;
        if (data.invitation_list) {
            const accepted_invitation_hackers = await this.getAcceptedInvitationHackers(data.id);
            response.current_page = data.page;
            const filters = [];
            filters.push({is_verify: true});
            filters.push({status: true});
            filters.push({_id: {$nin: accepted_invitation_hackers}});
            if (data.username) {
                filters.push({username: {$regex: '.*' + data.username + '.*', "$options": "i"}});
            }
            // if (hasValue(data.is_blue)) {
            //     if (data.is_blue) {
            //         filters.push({
            //             $or: [{identity_passport_file_status: HACKER_IDENTITY_STATUS.APPROVED},
            //                 {identity_card_file_status: HACKER_IDENTITY_STATUS.APPROVED},
            //                 {identity_driver_file_status: HACKER_IDENTITY_STATUS.APPROVED}]
            //         });
            //     } else {
            //         filters.push({identity_passport_file_status: {$ne: HACKER_IDENTITY_STATUS.APPROVED}},
            //             {identity_card_file_status: {$ne: HACKER_IDENTITY_STATUS.APPROVED}},
            //             {identity_driver_file_status: {$ne: HACKER_IDENTITY_STATUS.APPROVED}});
            //     }
            // }
            if (hasValue(data.competency)) {
                filters.push({competency_profile: data.competency});
            }
            hackers = await this.getInvitationHackerList(filters, data.tag, showPerPage, data.order, data.sort_type, data.page, hasValue(data.user_verify) ? data.user_verify : undefined);
        } else if (data.invited_hacker_list) {
            hackers = await this.getInvitedHackerList(data.id, showPerPage, data.page);
        }
        return setPaginationResponse(hackers, showPerPage, data.page);
    }

    async getHistory(data) {
        const program = await this.collection.findOne({_id: data.id});
        if (!program) {
            return 2;
        }
        let program_history = await SchemaModels.HistoryModel.aggregate([
            {
                $match: {
                    $and: [
                        {resource_id: toObjectID(data.id)},
                        {type: HISTORY_TYPE.PROGRAM_CHANGE},
                        {
                            $or: [
                                {activity: ACTIVITY_TEXT_LOG.CREATE_TARGET}, {activity: ACTIVITY_TEXT_LOG.UPDATE_TARGET}, {activity: ACTIVITY_TEXT_LOG.DELETE_TARGET},
                                {activity: ACTIVITY_TEXT_LOG.CREATE_REWARD}, {activity: ACTIVITY_TEXT_LOG.UPDATE_REWARD}, {activity: ACTIVITY_TEXT_LOG.DELETE_REWARD},
                                {activity: ACTIVITY_TEXT_LOG.CREATE_REWARDS_FOR_ALL_TARGETS}, {activity: ACTIVITY_TEXT_LOG.DELETE_REWARDS_FOR_ALL_TARGETS},
                                {activity: ACTIVITY_TEXT_LOG.UPDATE_REWARDS_FOR_ALL_TARGETS}, {activity: ACTIVITY_TEXT_LOG.UPDATE_POLICIES_FOR_ALL_TARGETS},
                                {activity: ACTIVITY_TEXT_LOG.CREATE_POLICY}, {activity: ACTIVITY_TEXT_LOG.UPDATE_POLICY}, {activity: ACTIVITY_TEXT_LOG.DELETE_POLICY},
                                {activity: ACTIVITY_TEXT_LOG.CREATE_POLICIES_FOR_ALL_TARGETS}, {activity: ACTIVITY_TEXT_LOG.DELETE_POLICIES_FOR_ALL_TARGETS},
                                {activity: ACTIVITY_TEXT_LOG.UPDATE_PROGRAM}, {activity: ACTIVITY_TEXT_LOG.UPDATE_MAXIMUM_REWARD}
                            ]
                        },
                        {"info_fields.key": "status"},
                        {sender_type: SENDER_TYPE.ADMIN},
                        {$or: [{"info_fields.value": PROGRAM_STATUS.APPROVED}, {"info_fields.value": PROGRAM_STATUS.CLOSE}]},
                    ]
                }
            },
            {$sort: {"register_date_time": 1}},
            {
                $group: {
                    _id: {
                        year: {$year: "$register_date_time"},
                        month: {$month: "$register_date_time"},
                        day: {$dayOfMonth: "$register_date_time"},
                        hour: {$hour: "$register_date_time"},
                        minute: {$minute: "$register_date_time"},
                        second: {$second: "$register_date_time"},
                    },
                    items: {$push: "$$ROOT"},
                    date: {$first: "$register_date_time"}
                }
            },
            {$sort: {"date": -1}},
        ]);
        if (isArray(program_history) && program_history.length > 0) {
            const result = [];
            const target_types = await SchemaModels.TypeTestModel.find({status: true}).lean();
            const currencies = await SchemaModels.CurrencyModel.find({status: true}).lean();
            const languages = await SchemaModels.LanguageModel.find({status: true}).lean();
            const targets = {key: "targets", isProgramInfo: false};
            const rewards = {key: "rewards", isProgramInfo: false};
            const policies = {key: "policies", isProgramInfo: false};
            const name = {key: "name", isProgramInfo: true};
            const tagline = {key: "tagline", isProgramInfo: true};
            const maximum_reward = {key: "maximum_reward", isProgramInfo: true};
            const policy = {key: "policy", isProgramInfo: true};
            const program_parts = [targets, policies, name, tagline, policy];
            if (program.is_next_generation !== PROGRAM_BOUNTY_TYPE.INTELLIGENCE_DISCOVERY) {
                program_parts.push(rewards, maximum_reward);
            }
            program_history.forEach((history, index) => {
                program_parts.forEach(program_item => {
                    this.updateHistory(history, program_item.key, history.date, program_item.isProgramInfo, index, program, result);
                });
                result[index].date = history.date;
                if (history.items && history.items.length > 0) {
                    result[index].activity = history.items[0].activity;
                }
            });
            program_history = result;
            program_history.forEach((history) => {
                if (history.targets && history.targets.length > 0) {
                    history.targets.forEach((target) => {
                        for (const key in target) {
                            if (key === "language_id" || key === "new_language_id") {
                                target[key].forEach((language, index) => {
                                    target[key][index] = languages.find(l => l._id.toString() === language.toString());
                                })
                            }
                            if (key === "target_type_id") {
                                target["target_type_id"] = target_types.find(l => l._id.toString() === target["target_type_id"].toString());
                            }
                            if (key === "new_target_type_id") {
                                target["new_target_type_id"] = target_types.find(l => l._id.toString() === target["new_target_type_id"].toString());
                            }
                        }
                    });
                }
                if (history.rewards && history.rewards.length > 0) {
                    history.rewards.forEach(reward => {
                        for (const key in reward) {
                            if (key === "currency_id") {
                                reward[key] = currencies.find(l => l._id.toString() === reward[key].toString());
                            }
                        }
                    });
                }
            });
        } else {
            program_history = [];
        }
        return program_history;
    }

    getInitialData(history, key) {
        return [...sortBy(history.items.filter(item => !!item.fields.find(field => field.key === key)), "register_date_time")]
    }

    cleanNextUpdate(item, key, isProgramInfo) {
        let new_item;
        if (isProgramInfo) {
            new_item = JSON.parse(JSON.stringify(item || ''));
            delete new_item[`new_${key}`];
            delete new_item.isUpdate;
            return new_item;
        } else {
            new_item = [];
            for (let index = 0; index < item.length; index++) {
                new_item.push(JSON.parse(JSON.stringify(item[index] || '')));
            }
            new_item.forEach(it => {
                for (const keyItem in it) {
                    if (keyItem.indexOf("new_") > 0) {
                        delete it[keyItem];
                    }
                    delete it.isUpdate;
                    delete it.isCreate;
                    delete it.isDelete;
                }
            })
        }
        return new_item;
    }

    updateHistoryItems(historyItems, key, date, isProgramInfo, historyIndex, program, result) {
        if (!result || result[historyIndex] === undefined) {
            result[historyIndex] = {};
        } else if (isProgramInfo && result[historyIndex][`program_${key}`] === undefined) {
            result[historyIndex][`program_${key}`] = {};
        }
        if (historyItems && historyItems.length > 0) {
            const field = historyItems[0].fields.find(field => field.key === key);
            let items = JSON.parse(JSON.stringify(field || ''));
            items = items && !isProgramInfo ? [...items.old_value] : [];
            historyItems.forEach(d => {
                if (d.activity.indexOf("All Targets") > -1) {
                    if (d.activity.indexOf("Create") > -1) {
                        let deletedItems = d.fields.find(s => s.key === key);
                        deletedItems = deletedItems && isArray(deletedItems.old_value) ? deletedItems.old_value : [];
                        let createdItems = d.fields.find(s => s.key === key);
                        createdItems = createdItems && isArray(createdItems.new_value) ? createdItems.new_value : [];
                        deletedItems.forEach(deletedItem => {
                            const item = items.find(item => item._id.toString() === deletedItem._id.toString());
                            if (item) item.isDelete = true;
                        })
                        createdItems.forEach(createdItem => {
                            const itemIndex = items.findIndex(s => s._id.toString() === createdItem._id.toString());
                            if (itemIndex !== -1) {
                                items.splice(itemIndex, 1);
                            }
                            createdItem.isCreate = true;
                            items.push(createdItem);
                        })
                    } else if (d.activity.indexOf("Delete") > -1) {
                        let deletedItems = d.fields.find(s => s.key === key);
                        deletedItems = deletedItems && isArray(deletedItems.old_value) ? deletedItems.old_value : [];
                        deletedItems.forEach(deletedItem => {
                            const item = items.find(item => item._id.toString() === deletedItem._id.toString());
                            if (item) item.isDelete = true;
                        });
                    } else if (d.activity.indexOf("Update") > -1) {
                        let updatedItems = d.fields.find(s => s.key === key);
                        updatedItems = updatedItems && isArray(updatedItems.new_value) ? updatedItems.new_value : [];
                        updatedItems.forEach(updatedItem => {
                            const item = items.find(item => item._id.toString() === updatedItem._id.toString());
                            if (item) item.isUpdate = true;
                            for (const keyItem in updatedItem) {
                                if ((keyItem === "language_id" && !arrayEquals(updatedItem[keyItem], item[keyItem])) ||
                                    (keyItem !== "language_id" && item[keyItem].toString() !== updatedItem[keyItem].toString())) {
                                    item[`new_${keyItem}`] = updatedItem[keyItem];
                                }
                            }
                        })
                    }
                } else {
                    let currentItem = !isProgramInfo && d.info_fields.find(s => s.key === key);
                    currentItem = currentItem ? currentItem.value : {};
                    if (d.activity.indexOf("Create") > -1) {
                        currentItem.isCreate = true;
                        items.push(currentItem);
                    } else if (d.activity.indexOf("Update") > -1) {
                        if (isProgramInfo) {
                            const infoItem = historyItems[0].fields.find(d => d.key === key);
                            result[historyIndex][`program_${key}`][key] = infoItem.old_value;
                            result[historyIndex][`program_${key}`][`new_${key}`] = infoItem.new_value;
                            result[historyIndex][`program_${key}`].isUpdate = true;
                        } else {
                            const updatedItem = currentItem && currentItem._id ? items.find(f => f._id.toString() === currentItem._id.toString()) : null;
                            if (updatedItem) updatedItem.isUpdate = true;
                            for (const keyItem in currentItem) {
                                if (((keyItem === "language_id" && !arrayEquals(updatedItem[keyItem], currentItem[keyItem])) ||
                                    (keyItem !== "language_id" && currentItem[keyItem].toString() !== updatedItem[keyItem].toString()))) {
                                    updatedItem[`new_${keyItem}`] = currentItem[keyItem];
                                }
                            }
                        }
                    } else if (d.activity.indexOf("Delete") > -1) {
                        const deletedItem = items.find(f => f._id.toString() === currentItem._id.toString());
                        deletedItem.isDelete = true;
                    }
                }
                if (!isProgramInfo) {
                    result[historyIndex][key] = items;
                }
            });
        } else {
            if (isProgramInfo) {
                if (historyIndex === 0) {
                    result[historyIndex][`program_${key}`][key] = JSON.parse(JSON.stringify(program[key] || ''));
                } else {
                    const new_result = JSON.parse(JSON.stringify(result[historyIndex - 1][`program_${key}`]) || '');
                    result[historyIndex][`program_${key}`] = this.cleanNextUpdate(new_result, key, true);
                }
            } else {
                if (historyIndex === 0) {
                    result[historyIndex][key] = JSON.parse(JSON.stringify(program[key] || ''));
                } else {
                    const new_result = JSON.parse(JSON.stringify(result[historyIndex - 1][key] || ''));
                    result[historyIndex][key] = this.cleanNextUpdate(new_result, key, false);
                }
            }
        }
    }

    updateHistory(history, key, date, isProgramInfo, historyIndex, program, result) {
        let items = JSON.parse(JSON.stringify(this.getInitialData(history, key)) || '');
        if (isProgramInfo && items && items.length > 0) {
            items = items.filter(t => !!t.fields.find(pt => pt.key === key))
        }
        this.updateHistoryItems(items, key, date, isProgramInfo, historyIndex, program, result);
    }

    async getInvitationHackerList(filters, tag, showPerPage, order, sort_type, page, user_verify) {
        return await SchemaModels.HackerUserModel.aggregate([
            {$match: {$and: filters}},
            {$addFields: {privilage: {$add: [{$ifNull: ["$reputaion", 0]}, {$ifNull: ["$sb_coin", 0]}]}}},
            ...(hasValue(tag) ? [{$addFields: {has_tag: {$cond: [{$in: [tag, {$ifNull: ["$tag", []]}]}, true, false]}}},
                {$match: {$expr: {$eq: ["$has_tag", true]}}}] : []),
            ...(user_verify === undefined ? [] : [{
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
                {$match: {$expr: {$eq: ["$is_user_verify", user_verify]}}}]),
            {
                $facet: {
                    total_count: [{$count: "count"}],
                    rows: [
                        {$sort: {[order]: sort_type}}, {$skip: (page - 1) * showPerPage}, {$limit: showPerPage},
                        {
                            $lookup: {
                                from: 'countries',
                                localField: 'country_id',
                                foreignField: '_id',
                                as: 'country'
                            }
                        },
                        {$unwind: {path: "$country", preserveNullAndEmptyArrays: true}},
                        {
                            $lookup: {
                                from: 'submit_reports',
                                let: {id: '$_id'},
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: {
                                                $and: [{$eq: ["$hacker_user_id", "$$id"]},
                                                    {$in: ["$status", [REPORT_STATUS.APPROVE, REPORT_STATUS.RESOLVED]]}
                                                ]
                                            }
                                        }
                                    },
                                    {
                                        $group:
                                            {
                                                _id: null,
                                                L: {
                                                    $sum: {
                                                        $cond: [{$and: [{$eq: ["$severity", REPORT_SEVERITY.LOW]}]}, 1, 0]
                                                    }
                                                },
                                                M: {
                                                    $sum: {
                                                        $cond: [{$and: [{$eq: ["$severity", REPORT_SEVERITY.MEDIUM]}]}, 1, 0]
                                                    }
                                                },
                                                H: {
                                                    $sum: {
                                                        $cond: [{$and: [{$eq: ["$severity", REPORT_SEVERITY.HIGH]}]}, 1, 0]
                                                    }
                                                },
                                                C: {
                                                    $sum: {
                                                        $cond: [{$and: [{$eq: ["$severity", REPORT_SEVERITY.CRITICAL]}]}, 1, 0]
                                                    }
                                                }
                                            }
                                    }, {$project: {_id: 0, L: 1, M: 1, H: 1, C: 1}}
                                ],
                                as: 'submit_reports',
                            }
                        },
                        {$unwind: {path: "$submit_reports", preserveNullAndEmptyArrays: true}},
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
                        {$unwind: {path: "$reward", preserveNullAndEmptyArrays: true}},
                        {
                            $project: {
                                _id: 0,
                                submit_reports: {$ifNull: ["$submit_reports", {L: 0, M: 0, H: 0, C: 0}]},
                                reward: {$ifNull: ["$reward.amount", 0]},
                                privilage: 1,
                                hacker_id: "$_id",
                                competency_profile: 1,
                                sb_coin: 1,
                                reputaion: 1,
                                avatar_file: 1,
                                username: 1,
                                country: 1,
                                rank: 1,
                                is_blue: {
                                    $cond: {
                                        if: {
                                            $or: [{$eq: ["$identity_passport_file_status", HACKER_IDENTITY_STATUS.APPROVED]}
                                                , {$eq: ["$identity_card_file_status", HACKER_IDENTITY_STATUS.APPROVED]}
                                                , {$eq: ["$identity_driver_file_status", HACKER_IDENTITY_STATUS.APPROVED]}]
                                        }, then: true, else: false
                                    }
                                }
                            }
                        }
                    ]
                }
            }
        ]);
    }

    async getInvitedHackerList(id, showPerPage, page) {
        return await SchemaModels.ProgramInviteModel.aggregate([
            {$match: {$and: [{program_id: toObjectID(id)}]}},
            {
                $addFields: {
                    "current_date": {$toDate: getDateTime()},
                    "invitation_expire_date": {$add: ["$register_date_time", {$multiply: ["$expire_day", 24 * 60 * 60000]}]}
                }
            }, {
                $match: {
                    $or: [{$and: [{$expr: {$gt: ["$invitation_expire_date", "$current_date"]}}, {status_invite: {$eq: INVITE_HACKER_STATUS.PENDING}}]},
                        {status_invite: {$in: [INVITE_HACKER_STATUS.ACCEPT, INVITE_HACKER_STATUS.REJECT]}}]
                }
            }, {
                $lookup: {
                    from: 'hacker_users',
                    localField: 'hacker_user_id',
                    foreignField: '_id',
                    as: 'hacker_user_id'
                }
            }, {$unwind: "$hacker_user_id"},
            {$sort: {"hacker_user_id.rank": 1}},
            {
                $facet: {
                    total_count: [{$count: "count"}],
                    rows: [
                        {$skip: (page - 1) * showPerPage}, {$limit: showPerPage},
                        {
                            $lookup: {
                                from: 'countries',
                                localField: 'hacker_user_id.country_id',
                                foreignField: '_id',
                                as: 'hacker_user_id.country_id'
                            }
                        }, {$unwind: {path: "$hacker_user_id.country_id", preserveNullAndEmptyArrays: true}},
                        {
                            $lookup: {
                                from: 'submit_reports',
                                let: {hacker_user_id: '$hacker_user_id._id'},
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: {
                                                $and: [{$eq: ["$hacker_user_id", "$$hacker_user_id"]},
                                                    {$in: ["$status", [REPORT_STATUS.APPROVE, REPORT_STATUS.RESOLVED]]}
                                                ]
                                            }
                                        }
                                    },
                                    {
                                        $group:
                                            {
                                                _id: null,
                                                L: {
                                                    $sum: {
                                                        $cond: [{$and: [{$eq: ["$severity", REPORT_SEVERITY.LOW]}]}, 1, 0]
                                                    }
                                                },
                                                M: {
                                                    $sum: {
                                                        $cond: [{$and: [{$eq: ["$severity", REPORT_SEVERITY.MEDIUM]}]}, 1, 0]
                                                    }
                                                },
                                                H: {
                                                    $sum: {
                                                        $cond: [{$and: [{$eq: ["$severity", REPORT_SEVERITY.HIGH]}]}, 1, 0]
                                                    }
                                                },
                                                C: {
                                                    $sum: {
                                                        $cond: [{$and: [{$eq: ["$severity", REPORT_SEVERITY.CRITICAL]}]}, 1, 0]
                                                    }
                                                }
                                            }
                                    }, {$project: {_id: 0, L: 1, M: 1, H: 1, C: 1}}
                                ],
                                as: 'submit_reports',
                            }
                        },
                        {$unwind: {path: "$submit_reports", preserveNullAndEmptyArrays: true}},
                        {
                            $lookup: {
                                from: 'payment_histories', let: {hacker_user_id: '$hacker_user_id._id'},
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
                        {$unwind: {path: "$reward", preserveNullAndEmptyArrays: true}},
                        {
                            $addFields: {
                                privilage: {$add: [{$ifNull: ["$hacker_user_id.reputaion", 0]}, {$ifNull: ["$hacker_user_id.sb_coin", 0]}]},
                                is_blue: {
                                    $cond: {
                                        if: {
                                            $or: [{$eq: ["$hacker_user_id.identity_passport_file_status", HACKER_IDENTITY_STATUS.APPROVED]}
                                                , {$eq: ["$hacker_user_id.identity_card_file_status", HACKER_IDENTITY_STATUS.APPROVED]}
                                                , {$eq: ["$hacker_user_id.identity_driver_file_status", HACKER_IDENTITY_STATUS.APPROVED]}]
                                        }, then: true, else: false
                                    }
                                }
                            }
                        },
                        {
                            $project: {
                                _id: 0,
                                hacker_id: "$hacker_user_id._id",
                                competency_profile: "$hacker_user_id.competency_profile",
                                username: "$hacker_user_id.username",
                                avatar_file: "$hacker_user_id.avatar_file",
                                sb_coin: "$hacker_user_id.sb_coin",
                                reputaion: "$hacker_user_id.reputaion",
                                rank: "$hacker_user_id.rank",
                                country_id: "$hacker_user_id.country_id",
                                current_date: 1,
                                invitation_expire_date: 1,
                                register_date_time: 1,
                                submit_reports: {$ifNull: ["$submit_reports", {L: 0, M: 0, H: 0, C: 0}]},
                                reward: {$ifNull: ["$reward.amount", 0]},
                                is_blue: 1,
                                privilage: 1,
                                status_invite: 1
                            }
                        },
                    ],
                }
            }
        ]).exec();
    }

    async addHackers(data) {
        const program = await this.collection.findOne({_id: data.id},
            {_id: 1, is_verify: 1, company_user_id: 1, status: 1, program_type: 1});
        if (!program) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_RESOURCE_FOUND, "program");
        }
        if (!program.is_verify) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_VALID, "program");
        }
        if (program.program_type !== PROGRAM_TYPE.PRIVATE) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.CUSTOM, "program is not private");
        }
        if (program.status !== PROGRAM_STATUS.APPROVED) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.CUSTOM, "program is not approved");
        }
        data.hacker_ids = data.hacker_ids.filter((item, index, self) => self.indexOf(item) === index);
        const hacker_count = await SchemaModels.HackerUserModel.countDocuments({_id: {$in: data.hacker_ids}});
        if (hacker_count !== data.hacker_ids.length) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_VALID, "hacker_id");
        }
        const notifications = [];
        const previous_invitations = await SchemaModels.ProgramInviteModel
            .find({hacker_user_id: {$in: data.hacker_ids}, program_id: data.id})
            .select({_id: 1, hacker_user_id: 1, status_invite: 1})
            .populate({path: 'hacker_user_id', select: {_id: 1, fn: 1}}).lean();
        let invited_hacker_ids = [];
        if (previous_invitations.length > 0) {
            const not_accepted_invitations = previous_invitations.filter(d => d.status_invite !== INVITE_HACKER_STATUS.ACCEPT);
            const update_hacker_ids = not_accepted_invitations.map(i => i.hacker_user_id._id.toString());
            if (update_hacker_ids.length > 0) {
                await SchemaModels.ProgramInviteModel.updateMany({
                    hacker_user_id: {$in: update_hacker_ids},
                    program_id: data.id
                }, {
                    $set: {
                        expire_day: data.expire_day,
                        status_send_email: 0,
                        status_invite: INVITE_HACKER_STATUS.PENDING,
                        register_date_time: getDateTime()
                    }
                });
                not_accepted_invitations.forEach(invitation => {
                    notifications.push(this.createHackerNotification("Program Invitation",
                        `${invitation.hacker_user_id.fn}, You have received an invitation for a program`,
                        FIELD_TYPE.OTHER, invitation.hacker_user_id._id, MESSAGE_TYPE.INFO, program.company_user_id, data.id,
                        ACTION_TYPE.UPDATE, RESOURCE_TYPE.PROGRAM_INVITE));
                })
            }
            invited_hacker_ids = previous_invitations.map(f => f.hacker_user_id._id.toString());
        }
        const insert_hacker_ids = invited_hacker_ids.length > 0
            ? data.hacker_ids.filter(hacker_id => !invited_hacker_ids.includes(hacker_id.toString()))
            : data.hacker_ids;
        if (insert_hacker_ids.length > 0) {
            const insert_invitations = [];
            insert_hacker_ids.forEach(hacker_user_id => {
                insert_invitations.push({
                    expire_day: data.expire_day,
                    status_send_email: 0,
                    status_invite: INVITE_HACKER_STATUS.PENDING,
                    register_date_time: getDateTime(),
                    company_user_id: program.company_user_id,
                    hacker_user_id,
                    program_id: data.id
                });
            });
            await SchemaModels.ProgramInviteModel.insertMany(insert_invitations);
            const insert_hackers = await SchemaModels.HackerUserModel.find({_id: {$in: insert_hacker_ids}})
                .select({_id: 1, fn: 1});
            insert_hackers.forEach(hacker => {
                notifications.push(this.createHackerNotification("Program Invitation",
                    `${hacker.fn}, You have received an invitation for a program`,
                    FIELD_TYPE.OTHER, hacker._id, MESSAGE_TYPE.INFO, program.company_user_id, data.id,
                    ACTION_TYPE.CREATE, RESOURCE_TYPE.PROGRAM_INVITE));
            })
        }
        if (notifications.length > 0) {
            await SchemaModels.NotificationModel.insertMany(notifications);
            this.sendNotification("notification", notifications, null, hackerIO, "hacker_user_id");
        }
        // const history_model = {
        //     sender_type: SENDER_TYPE.ADMIN,
        //     activity: ACTIVITY_TEXT_LOG.INVITE_HACKERS,
        //     sender_id: data.user_id,
        //     resource_type: RESOURCE_TYPE.PROGRAM_INVITE,
        //     resource_id: program._id,
        //     info_fields: [{key: "hacker_ids", value: data.hacker_ids}, {key: "expire_day", value: data.expire_day}],
        //     register_date_time: getDateTime()
        // };
        // await SchemaModels.HistoryModel.create(history_model);
    }

    async deleteHackers(data) {
        const program = await this.collection.findOne({_id: data.id},
            {_id: 1, is_verify: 1, company_user_id: 1, status: 1, program_type: 1});
        if (!program) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_RESOURCE_FOUND, "program");
        }
        const invitation = await SchemaModels.ProgramInviteModel.findOneAndDelete({
            program_id: data.id,
            hacker_user_id: data.hacker_id
        });
        if (!invitation) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_RESOURCE_FOUND, "invitation");
        }
    }

    async getAcceptedInvitationHackers(program_id) {
        const invitations = await SchemaModels.ProgramInviteModel.find({
            $and: [{program_id},
                {$or: [{status_invite: INVITE_HACKER_STATUS.ACCEPT}]}]
        })
            .select({_id: 0, hacker_user_id: 1});
        return invitations.map(d => d.hacker_user_id);
    }

    sendNotification(emit_name, notifications, program, socket_io, target_id) {
        if (program) {
            program = {
                program_type: program.program_type,
                _id: program._id,
                is_next_generation: program.is_next_generation
            };
        }
        if (socket_io && socket_io["sockets"] && socket_io["sockets"].size > 0 && socket_io["to"]) {
            const sockets_info = convertSetOrMapToArray(socket_io["sockets"]);
            if (sockets_info.length > 0) {
                sockets_info.forEach(s => {
                    if (s.data && s.data._id) {
                        const notification = notifications.find(n => n[target_id] && n[target_id].toString() === s.data._id.toString());
                        if (notification) {
                            socket_io["to"](s.id.toString()).emit(emit_name, {
                                title: notification.title,
                                text: notification.text,
                                id: notification._id,
                                date: notification.register_date_time,
                                resource_type: notification.resource_type,
                                field_type: notification.field_type,
                                message_type: notification.message_type,
                                program
                            });
                        }
                    }
                });
            }
        }
    }

    async createNotifications(title, companies, value, field_type, message_type
        , moderator_user_id, program_id) {
        const notifications = [];
        companies.forEach(c => {
            let text = "";
            if (field_type === FIELD_TYPE.VERIFICATION) {
                text = `${c.display_name}, Admin has changed your program verification to ${value ? "valid" : "invalid"}`;
            } else if (field_type === FIELD_TYPE.STATUS) {
                text = `${c.display_name}, Admin has changed your program status to ${value}`;
            } else if (field_type === FIELD_TYPE.REWARD) {
                text = `${c.display_name}, Admin has updated your reward pool to ${value}`;
            }
            const notification = {
                title,
                text,
                status: NOTIFICATION_STATUS.SEND,
                field_type,
                register_date_time: getDateTime(),
                sender_type: SENDER_TYPE.ADMIN,
                resource_type: RESOURCE_TYPE.PROGRAM,
                message_type,
                action_type: ACTION_TYPE.UPDATE,
                moderator_user_id,
                program_id,
                company_user_id: c._id
            };
            notifications.push(notification);
        });
        return SchemaModels.NotificationModel.insertMany(notifications);
    }

    createHackerNotification(title, text, field_type, hacker_user_id, message_type, company_user_id,
                             program_id, action_type, resource_type) {
        return {
            title,
            text,
            status: NOTIFICATION_STATUS.SEND,
            register_date_time: getDateTime(),
            sender_type: SENDER_TYPE.ADMIN,
            field_type,
            resource_type,
            action_type,
            message_type,
            company_user_id,
            hacker_user_id,
            program_id
        };
    }

    async removeLogoFile(company_user_id, program_id) {
        await this.collection.updateOne({company_user_id, _id: program_id}, {$set: {logo_file: ""}});
    }

    async checkExistsIdentifier(company_user_id, target_type_id, identifier, program_id) {
        return await this.collection.countDocuments({
            company_user_id,
            _id: program_id,
            "targets.target_type_id": target_type_id,
            "targets.identifier": identifier
        });
    }

    getStatusTitle(status) {
        switch (status) {
            case PROGRAM_STATUS.PROGRESS:
                return "in progress";
            case PROGRAM_STATUS.PENDING:
                return "pending";
            case PROGRAM_STATUS.APPROVED:
                return "approved";
            case PROGRAM_STATUS.REJECT:
                return "rejected";
            case PROGRAM_STATUS.CLOSE:
                return "close";
            default:
                return '';
        }
    }

    getProgramData(data) {
        switch (data.tab) {
            case 0:
                return {
                    name: data.name,
                    logo_file: data.logo_file || "",
                    tagline: data.tagline,
                    policy: data.policy
                };
            case 1:
                return {
                    compliance1: data.compliance1 || 0,
                    compliance2: data.compliance2 || 0,
                    compliance3: data.compliance3 || 0,
                    compliance4: data.compliance4 || 0,
                    compliance5: data.compliance5 || 0,
                    compliance6: data.compliance6 || 0
                };
        }
    }

    sendProgramChangeNotification(socket_ios, is_next, program_id, date_time, program_type) {
        socket_ios.forEach(socket_io_info => {
            if (socket_io_info["socket_io"] && socket_io_info["socket_io"]["sockets"] && socket_io_info["socket_io"]["sockets"].size > 0 && socket_io_info["socket_io"]["to"]) {
                const sockets_info = convertSetOrMapToArray(socket_io_info.socket_io["sockets"]);
                if (sockets_info.length > 0) {
                    sockets_info.forEach(s => {
                        if (s.data && s.data._id) {
                            if (socket_io_info.reciever_type === SENDER_TYPE.COMPANY || (socket_io_info.reciever_type === SENDER_TYPE.HACKER && program_type === PROGRAM_TYPE.PRIVATE)) {
                                const canSend = socket_io_info.target_ids.includes(s.data._id.toString());
                                if (canSend) {
                                    socket_io_info.socket_io["to"](s.id.toString()).emit("programChange", {
                                        program_type: is_next, program_id, date_time
                                    });
                                } else {
                                    socket_io_info.socket_io["to"](s.id.toString()).emit("programChange", {
                                        program_type: is_next, program_id, date_time
                                    });
                                }
                            }
                        }
                    });
                }
            }
        })
    }

    async setBudgeting(data) {
        const program = await this.collection.findOne({_id: data.id})
            .select({
                _id: 1, product_type: 1, duration_type: 1,
                hourly_price: 1, monthly_hours: 1, maximum_reward: 1
            });

        if (!program) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_FOUND, "program");
        }

        if (program.product_type !== PRODUCT_TYPE.ENTERPRISE) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_VALID, "product_type");
        }
        const current_date = moment(); //currentDate : Moment<2022-06-08T03:44:28-07:00>  -> object
        const valid_item_day = "01";
        const left_days_in_month = 15;
        const next_15_days_date = current_date.add(left_days_in_month, 'days');
        for (let item of data.monthly_hours) {
            const item_date = moment(item.date); // postDate : Moment<2022-08-01T00:00:00-07:00>
            const item_year = item_date.year(); // postYear : 2022
            const item_month = item_date.month() + 1; // postMonth : 7
            const item_day = moment(item.date).format("DD"); // postDay : 1
            if (item_day !== valid_item_day) {
                throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_VALID, "date");
            }
            const db_program_monthly_hours = program.monthly_hours.find(m =>
                moment(m.date).year() === item_year &&
                moment(m.date).month() + 1 === item_month
            );
            if (!db_program_monthly_hours && item_date < next_15_days_date) {
                throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_VALID, "date");
            }
            // if (db_program_monthly_hours && db_program_monthly_hours.hours !== item.hours) {
            //     const diff_days = moment.duration(item_date.diff(current_date)).asDays();
            //     if (diff_days < left_days_in_month) {
            //         throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_VALID, "date");
            //     }
            // }
        }
        return await this.collection.findOneAndUpdate(
            {_id: data.id},
            {
                $set: {
                    "duration_type": data.duration_type,
                    "hourly_price": data.hourly_price,
                    "monthly_hours": data.monthly_hours
                }
            }, {
                new: true,
                projection: {duration_type: 1, hourly_price: 1, monthly_hours: 1}
            }
        )
    }
}

module.exports = new ProgramModel();