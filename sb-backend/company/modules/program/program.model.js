const hackerIO = require("../../../io/hacker");
const moment = require("moment");
const {getDateTime} = require("../../../libs/date.helper");
const {
    HISTORY_PROGRAM_TYPE, PRODUCT_TYPE
} = require('../../../libs/enum.helper');

class ProgramModel {
    constructor() {
        this.collection = SchemaModels.ProgramModel;
    }

    async getHacker(hacke_id) {
        return SchemaModels.HackerUserModel.find({"_id": hacke_id}).countDocuments();
    }

    async getHackerById(hacke_id) {
        return await SchemaModels.HackerUserModel.findOne({"_id": hacke_id}, {_id: 1, fn: 1, tag: 1});
    }

    async getProgramsInfo(company_user_id, parent_user_id, access_program_list) {
        const match = {
            company_user_id: toObjectID(company_user_id),
            $or: [{status: PROGRAM_STATUS.APPROVED}, {status: PROGRAM_STATUS.CLOSE}]
        };
        if (parent_user_id && access_program_list && access_program_list.length > 0) {
            match._id = {$in: access_program_list.map(program => mongoose.Types.ObjectId(program._id))}
        }
        return await SchemaModels.ProgramModel.aggregate([
            {
                $match: match
            },
            {
                $group: {
                    _id: "$is_next_generation",
                    "count": {$sum: 1}
                },
            },
            {$project: {"program_type": "$_id", "count": 1, "_id": 0}}
        ]);
    }

    async addStep1(company_user_id, logoFile, name, program_type, tagline, policy, is_next_generation
        , compliance1, compliance2, compliance3, compliance4, compliance5, compliance6, product_type, current_user_id) {
        const data = {
            "company_user_id": company_user_id,
            "logo_file": logoFile,
            "name": name,
            "program_type": program_type,
            "creator_user_id": current_user_id,
            "tagline": tagline,
            "policy": policy,
            "register_date_time": getDateTime(),
            "is_next_generation": is_next_generation,
            "compliance1": compliance1,
            "compliance2": compliance2,
            "compliance3": compliance3,
            "compliance4": compliance4,
            "compliance5": compliance5,
            "compliance6": compliance6,
        };
        if (is_next_generation !== 2) {
            data.product_type = product_type
        }
        let i = this.collection(data);
        let r = await i.save();
        const history_model = {
            sender_type: SENDER_TYPE.COMPANY,
            activity: ACTIVITY_TEXT_LOG.CREATE_PROGRAM,
            type: HISTORY_TYPE.PROGRAM_CHANGE,
            sender_id: current_user_id,
            resource_type: RESOURCE_TYPE.PROGRAM,
            resource_id: r._id,
            info_fields: [{key: "status", value: PROGRAM_STATUS.PROGRESS}, {key: "program", value: r}],
            register_date_time: getDateTime()
        };
        await SchemaModels.HistoryModel.create(history_model);
        return r;
    }

    async getProgram(company_user_id, program_id, parent_user_id, access_program_list) {
        if (!isObjectID(company_user_id) || !isObjectID(program_id))
            return null;

        if (parent_user_id && access_program_list && access_program_list.length > 0) {
            const has_access_to_program = access_program_list.some(program => program._id.toString() === program_id.toString());
            if (!has_access_to_program) return null;
        }

        let program = await this.collection.findOne({"company_user_id": company_user_id, "_id": program_id})
            .select({
                product_type: 1,
                compliance1: 1, compliance2: 1, compliance3: 1,
                compliance4: 1, compliance5: 1, compliance6: 1,
                maximum_reward: 1,
                _id: 1, status: 1, is_verify: 1, launch_timeline: 1,
                company_user_id: 1, logo_file: 1, name: 1, program_type: 1,
                tagline: 1, policy: 1, register_date_time: 1, targets: 1,
                rewards: 1, policies: 1, is_next_generation: 1, start_date_program: 1, expire_date_program: 1
                , hourly_price: 1, monthly_hours: 1, duration_type: 1
            })
            .populate('targets.target_type_id')
            .populate('targets.language_id')
            .populate('rewards.currency_id').lean();

        if (!program) {
            return null;
        }
        program.report_count = await SchemaModels.SubmitReportModel.find({
            $and: [{program_id}, {status: {$gt: 0}}, {status: {$lt: 10}}]
        }).countDocuments();
        program.program_history_count = 0;
        let program_history = await SchemaModels.HistoryModel.aggregate([
            {
                $match: {
                    $and: [
                        {resource_id: mongoose.Types.ObjectId(program_id)},
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

    async getProgramHistory(program_id, company_user_id, parent_user_id, access_program_list) {
        if (!isObjectID(program_id)) {
            return 2;
        }

        if (parent_user_id && access_program_list && access_program_list.length > 0) {
            const has_access_to_program = access_program_list.some(program => program._id.toString() === program_id.toString());
            if (!has_access_to_program) return 2;
        }
        const program = await this.collection.findOne({_id: program_id, company_user_id});
        if (!program) {
            return 2;
        }
        let program_history = await SchemaModels.HistoryModel.aggregate([
            {
                $match: {
                    $and: [
                        {resource_id: mongoose.Types.ObjectId(program_id)},
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
                if (item && item[index] !== undefined) {
                    new_item.push(JSON.parse(JSON.stringify(item[index])));
                }
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
                        });
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
                } else if (result[historyIndex - 1]) {
                    const new_result = JSON.parse(JSON.stringify(result[historyIndex - 1][`program_${key}`] || ''));
                    result[historyIndex][`program_${key}`] = this.cleanNextUpdate(new_result, key, true);
                }
            } else {
                if (historyIndex === 0) {
                    result[historyIndex][key] = JSON.parse(JSON.stringify(program[key] || ''));
                } else if (result[historyIndex - 1][key]) {
                    const new_result = JSON.parse(JSON.stringify(result[historyIndex - 1][key] || ''));
                    result[historyIndex][key] = this.cleanNextUpdate(new_result, key, false);
                }
            }
        }
    }

    updateHistory(history, key, date, isProgramInfo, historyIndex, program, result) {
        let items = JSON.parse(JSON.stringify(this.getInitialData(history, key) || ''));
        if (isProgramInfo && items && items.length > 0) {
            items = items.filter(t => !!t.fields.find(pt => pt.key === key))
        }
        this.updateHistoryItems(items, key, date, isProgramInfo, historyIndex, program, result);
    }

    async getRow(company_user_id, program_id) {
        if (!isObjectID(company_user_id) || !isObjectID(program_id))
            return null;

        return this.collection.findOne({"company_user_id": company_user_id, "_id": program_id})
            .select({
                _id: 1, status: 1, is_verify: 1, launch_timeline: 1,
                company_user_id: 1, logo_file: 1, name: 1, program_type: 1, product_type: 1,
                compliance1: 1, compliance2: 1, compliance3: 1, hourly_price: 1, duration_type: 1,
                compliance4: 1, compliance5: 1, compliance6: 1, monthly_hours: 1,
                tagline: 1, policy: 1, register_date_time: 1, targets: 1,
                rewards: 1, policies: 1, is_next_generation: 1, maximum_reward: 1
            })
            .populate('targets.target_type_id')
            .populate('targets.language_id')
            .populate('rewards.currency_id');
    }

    async isProgramOwner(company_user_id, program_id) {
        if (!isObjectID(company_user_id) || !isObjectID(program_id))
            return 0;
        return this.collection.findOne({"company_user_id": company_user_id, "_id": program_id})
            .countDocuments();
    }

    async hasAccessToProgram(user, program_id) {
        let has_access = true;
        if (program_id && user.parent_user_id && user.access_program_list && user.access_program_list.length > 0) {
            has_access = user.access_program_list.some(d => d._id.toString() === program_id.toString());
        }
        if (program_id && has_access) {
            return await this.collection.countDocuments({_id: program_id, company_user_id: getUserId(user)});
        }
        return false;
    }

    async getTypeTest(target_type_id) {
        if (!isObjectID(target_type_id))
            return 0;
        return SchemaModels.TypeTestModel.findOne({"_id": target_type_id, "status": true}).countDocuments();
    }

    async getLang(id) {
        if (!isObjectID(id))
            return 0;
        return SchemaModels.LanguageModel.findOne({"_id": id, "status": true}).countDocuments();
    }

    async checkExistsTarget(company_user_id, target_type_id, identifier, program_id) {
        if (!isObjectID(company_user_id) || !isObjectID(target_type_id))
            return 0;
        return this.collection.countDocuments({
            "company_user_id": company_user_id
            , "targets.target_type_id": target_type_id
            , "_id": program_id
            , "targets.identifier": identifier
        });

    }


    async addTarget(company_user_id, program_id, identifier, target_type_id, languageArray, maturity, current_user_id, program) {
        if (!isObjectID(company_user_id) || !isObjectID(program_id) || !isObjectID(target_type_id))
            return 0;
        let data = {
            "identifier": identifier
            , "target_type_id": target_type_id
            , "maturity": maturity
            , "language_id": languageArray
        };
        let new_program = await this.collection.findOneAndUpdate({
                "company_user_id": company_user_id
                , "_id": program_id
            }
            , {$push: {targets: data}}
            , {new: true, projection: {targets: 1, _id: 1}});
        if (!new_program) {
            return 0;
        }
        const same_identifier = program.targets.filter(d => d.identifier.toString() === identifier.toString());
        let not_included_ids = [];
        if (same_identifier && same_identifier.length > 0) {
            not_included_ids = same_identifier.map(f => f._id.toString());
        }
        const new_target = new_program.targets.find(t => t.identifier && t.identifier.toString() === identifier.toString() && !not_included_ids.includes(t._id.toString()));
        const history_model = {
            sender_type: SENDER_TYPE.COMPANY,
            activity: ACTIVITY_TEXT_LOG.CREATE_TARGET,
            type: HISTORY_TYPE.PROGRAM_CHANGE,
            sender_id: current_user_id,
            resource_type: RESOURCE_TYPE.PROGRAM,
            resource_id: program._id,
            info_fields: [{key: "targets", value: new_target}, {key: "status", value: program.status}],
            fields: [{key: "targets", old_value: program.targets, new_value: new_program.targets}],
            register_date_time: getDateTime()
        };
        await SchemaModels.HistoryModel.create(history_model);
        return 1;

    }

    async getTarget(company_user_id, program_id, target_id) {
        if (!isObjectID(company_user_id) || !isObjectID(program_id) || !isObjectID(target_id))
            return {};
        let data = await this.collection.findOne({
            "company_user_id": company_user_id
            , "_id": program_id
        })
            .populate('targets.target_type_id')
            .populate('targets.language_id');
        let target = {};
        if (data.targets.length > 0) {
            target = data.targets.find((target) => {
                return target._id.equals(target_id);
            });
        }
        return target;
    }

    async saveTarget(company_user_id, program_id, target_id, identifier, target_type_id, languageArray, maturity, program, current_user_id) {
        if (!isObjectID(company_user_id) || !isObjectID(program_id) || !isObjectID(target_type_id)
            || !isObjectID(target_id))
            return 0;

        let currentTarget = await this.getTarget(company_user_id, program_id, target_id);
        let data = {
            "targets.$.maturity": maturity
            , "targets.$.language_id": languageArray
        };
        if (currentTarget['identifier'] != identifier) {
            let check = await this.checkExistsTarget(company_user_id, target_type_id, identifier, program_id);
            if (check == 0) {
                data['targets.$.identifier'] = identifier;
            } else
                return -1;
        }
        if (!currentTarget.target_type_id["_id"].equals(target_type_id)) {
            let check = await this.checkExistsTarget(company_user_id, target_type_id._id, identifier, program_id);
            if (check == 0) {
                data['targets.$.target_type_id'] = target_type_id;
            } else
                return -1;
        }

        let ret = await this.collection.updateOne({
            "company_user_id": company_user_id
            , "_id": program_id
            , "targets._id": target_id
        }, {
            '$set': data
        }).exec();
        const new_program = await this.collection.findOne({_id: program_id}).lean();
        const updated_target = new_program.targets.find(d => d._id.toString() === target_id.toString());
        if (updated_target) {
            const history_model = {
                sender_type: SENDER_TYPE.COMPANY,
                activity: ACTIVITY_TEXT_LOG.UPDATE_TARGET,
                type: HISTORY_TYPE.PROGRAM_CHANGE,
                sender_id: current_user_id,
                resource_type: RESOURCE_TYPE.PROGRAM,
                resource_id: program_id,
                info_fields: [{key: "targets", value: updated_target}, {key: "status", value: program.status}],
                fields: [{key: "targets", old_value: program.targets, new_value: new_program.targets}],
                register_date_time: getDateTime()
            };
            await SchemaModels.HistoryModel.create(history_model);
        }
        return 1;

    }

    async deleteTarget(company_user_id, program_id, target_id, program, current_user_id) {
        if (!isObjectID(company_user_id) || !isObjectID(program_id) || !isObjectID(target_id))
            return 0;

        let ret = await this.collection.updateOne({
                "company_user_id": company_user_id
                , "_id": program_id
            },
            {
                $pull:
                    {
                        targets: {_id: target_id},
                        rewards: {target_id: target_id},
                        policies: {target_id: target_id},
                    }
            },
        ).exec();
        const new_program = await this.collection.findOne({_id: program_id});
        if (!new_program) {
            return 2;
        }
        const deleted_target = program.targets.find(t => t._id.toString() === target_id.toString());
        const fields = [{key: "targets", old_value: program.targets, new_value: new_program.targets}];
        const info_fields = [{key: "targets", value: deleted_target}, {key: "status", value: program.status}];
        let deleted_reward;
        if (program.rewards && program.rewards.length > 0) {
            deleted_reward = program.rewards.find(r => r.target_id.toString() === target_id.toString());
            if (!!deleted_reward) {
                fields.push({key: "rewards", old_value: program.rewards, new_value: new_program.rewards});
                info_fields.push({key: "rewards", value: deleted_reward});
            }
        }
        let deleted_policy;
        if (program.policies && program.policies.length > 0) {
            deleted_policy = program.policies.find(p => p.target_id.toString() === target_id.toString());
            if (!!deleted_policy) {
                fields.push({key: "policies", old_value: program.policies, new_value: new_program.policies});
                info_fields.push({key: "policies", value: deleted_policy});
            }
        }
        const history_model = {
            sender_type: SENDER_TYPE.COMPANY,
            activity: ACTIVITY_TEXT_LOG.DELETE_TARGET,
            type: HISTORY_TYPE.PROGRAM_CHANGE,
            sender_id: current_user_id,
            resource_type: RESOURCE_TYPE.PROGRAM,
            resource_id: program._id,
            info_fields,
            fields,
            register_date_time: getDateTime()
        };
        await SchemaModels.HistoryModel.create(history_model);
        return 1;

    }

    async save_maximum_reward(company_user_id, program_id, maximum_reward, program, current_user_id) {
        if (!isObjectID(company_user_id) || !isObjectID(program_id))
            return 0;

        let data = {
            "maximum_reward": maximum_reward
        };
        let x = await this.collection.updateOne({
                "company_user_id": company_user_id
                , "_id": program_id
            }
            , {
                $set: data
            }
        );
        const payment_model = {
            "program_id": program_id,
            "company_user_id": company_user_id,
            "is_positive": true,
            "amount": maximum_reward,
            "type": 0,
            "register_date_time": getDateTime()
        };
        await SchemaModels.PaymentHistoryModel.findOneAndUpdate({"program_id": program_id}, {$set: payment_model}, {upsert: true});
        if (program.maximum_reward !== maximum_reward) {
            const history_model = {
                sender_type: SENDER_TYPE.COMPANY,
                activity: ACTIVITY_TEXT_LOG.UPDATE_MAXIMUM_REWARD,
                type: HISTORY_TYPE.PROGRAM_CHANGE,
                sender_id: current_user_id,
                resource_type: RESOURCE_TYPE.PROGRAM,
                resource_id: program._id,
                info_fields: [{key: "status", value: program.status}],
                fields: [{key: "maximum_reward", old_value: program.maximum_reward, new_value: maximum_reward}],
                register_date_time: getDateTime()
            };
            await SchemaModels.HistoryModel.create(history_model);
        }
        return 1;
    }

    async getProgramList(company_user_id, status, is_next_generation, parent_user_id, access_program_list) {

        let match = {
            "status": {$gte: 0, $lt: 10},
        };
        let statusFilter;
        if (status == 2) {
            statusFilter = {"$in": [4, 2]}
        } else {
            statusFilter = {"$in": [0, 1, 3]}
        }
        const where = [
            {"company_user_id": company_user_id},
            {"is_next_generation": is_next_generation > 0 ? is_next_generation : 0},
            {"status": statusFilter}
        ];

        if (parent_user_id && access_program_list && access_program_list.length > 0) {
            const access_program_ids = access_program_list.map(p => mongoose.Types.ObjectId(p._id));
            where.push({_id: {$in: access_program_ids}});
            match.program_id = {$in: access_program_ids}
        }
        const report_group_by_program_id = await SchemaModels.SubmitReportModel.aggregate([
            {
                "$match": {
                    "$and": [match]
                }
            },
            {$group: {_id: "$program_id", count: {$sum: 1}}}
        ]);
        const result = await this.collection.aggregate([
            {
                $match: {
                    $and: where
                }
            }, {
                $unwind: {path: "$targets", preserveNullAndEmptyArrays: true}
            }, {
                $unwind: {path: "$rewards", preserveNullAndEmptyArrays: true}
            },
            {
                $lookup: {
                    from: 'currencies',
                    localField: 'rewards.currency_id',
                    foreignField: '_id',
                    as: 'rewards.currency_id'
                }
            }, {
                $unwind: {path: "$rewards.currency_id", preserveNullAndEmptyArrays: true}
            },
            {
                $lookup: {
                    from: 'type_tests',
                    localField: 'targets.target_type_id',
                    foreignField: '_id',
                    as: 'targets.target_type_id'
                }
            }, {
                $unwind: {path: "$targets.target_type_id", preserveNullAndEmptyArrays: true}
            },
            {
                $lookup: {
                    from: 'languages',
                    localField: 'targets.language_id',
                    foreignField: '_id',
                    as: 'targets.language_id'
                }
            },
            {
                $group: {
                    _id: '$_id',
                    root: {$mergeObjects: '$$ROOT'},
                    targets: {$push: '$targets'},
                    rewards: {$push: '$rewards'}
                }
            },
            {
                $replaceRoot: {
                    newRoot: {
                        $mergeObjects: ['$root', '$$ROOT']
                    }
                }
            },
            {
                $sort: {"_id": -1}
            },
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
                                company_users: {fn: 1, ln: 1, _id: 1},
                                _id: 1,
                                status: 1,
                                is_verify: 1,
                                launch_timeline: 1,
                                company_user_id: 1,
                                logo_file: 1,
                                name: 1,
                                program_type: 1,
                                product_type: 1,
                                tagline: 1,
                                policy: 1,
                                register_date_time: 1,
                                targets: 1,
                                start_date_program: 1,
                                expire_date_program: 1,
                                rewards: {
                                    $reduce: {
                                        input: "$rewards",
                                        initialValue: [],
                                        in: {
                                            $concatArrays: [
                                                "$$value",
                                                {
                                                    $cond: {
                                                        if: {$eq: [["$$this.currency_id"], [null]]},
                                                        then: [],
                                                        else: ["$$this"]
                                                    }
                                                },
                                            ]
                                        }
                                    }
                                },
                                policies: 1,
                                is_next_generation: 1,
                                maximum_reward: 1,
                                compliance1: 1,
                                compliance2: 1,
                                compliance3: 1,
                                compliance4: 1,
                                compliance5: 1,
                                compliance6: 1,
                                report_count: {
                                    $ifNull: [{
                                        $let: {
                                            vars: {
                                                report: {
                                                    $arrayElemAt: [{
                                                        $filter: {
                                                            input: report_group_by_program_id,
                                                            as: "filter_report",
                                                            cond: {$eq: ["$$filter_report._id", "$_id"]}
                                                        }
                                                    }, 0]
                                                }
                                            },
                                            in: "$$report.count"
                                        }
                                    }, 0]
                                }
                            }
                        },
                    ],
                }
            }
        ]);
        const ret = {};
        const showPerPage = gLimit;
        ret.current_page = gPage;
        if (result && result.length > 0 && result[0].totalRows.length > 0) {
            ret.rows = result[0].rows;
            ret.totalRows = result[0].totalRows[0].count;
            ret.totalPage = Math.ceil(ret.totalRows / showPerPage);
        } else {
            ret.rows = [];
            ret.totalRows = 0;
            ret.totalPage = 0;
        }
        ret.rows.forEach(program => {
            if (program.rewards || program.policies || program.targets) {
                if (isArray(program.rewards) && program.rewards.length > 1) {
                    program.rewards = program.rewards.filter((item, index) => program.rewards.indexOf(program.rewards.find(d => d.target_id.toString() === item.target_id.toString())) === index)
                }
                if (isArray(program.policies) && program.policies.length > 1) {
                    program.policies = program.policies.filter((item, index) => program.policies.indexOf(program.policies.find(d => d.target_id.toString() === item.target_id.toString())) === index)
                }
                if (isArray(program.targets) && program.targets.length > 1) {
                    program.targets = program.targets.filter((item, index) => program.targets.indexOf(program.targets.find(d => d._id.toString() === item._id.toString())) === index)
                }
            }
        });
        return ret;
    }


    async checkTarget(company_user_id, program_id, target_id) {
        if (!isObjectID(company_user_id) || !isObjectID(program_id) || !isObjectID(target_id))
            return 0;
        return this.collection.countDocuments({
            "company_user_id": company_user_id
            , "_id": program_id
            , "targets._id": target_id
        });
    }


    async addReward(company_user_id
        , program_id, target_id, currency_id, critical_price
        , high_price, medium_price, low_price, none_price, program, current_user_id) {
        if (!isObjectID(company_user_id) || !isObjectID(program_id) || !isObjectID(target_id)
            || !isObjectID(currency_id))
            return 0;

        let reward_data = {
            "target_id": target_id,
            "critical_price": critical_price,
            "high_price": high_price,
            "medium_price": medium_price,
            "low_price": low_price,
            "none_price": none_price,
            "currency_id": currency_id,
        };
        await this.collection.updateOne({"company_user_id": company_user_id, "_id": program_id}
            , {$push: {rewards: reward_data}}
            , {new: true});
        const new_program = await this.collection.findOne({"_id": program_id})
            .populate('rewards.currency_id');
        const new_reward = new_program.rewards.find(r => r.target_id.toString() === target_id.toString());
        const history_model = {
            sender_type: SENDER_TYPE.COMPANY,
            activity: ACTIVITY_TEXT_LOG.CREATE_REWARD,
            type: HISTORY_TYPE.PROGRAM_CHANGE,
            sender_id: current_user_id,
            resource_type: RESOURCE_TYPE.PROGRAM,
            resource_id: program._id,
            info_fields: [{key: "status", value: program.status}, {key: "rewards", value: new_reward}],
            fields: [{key: "rewards", old_value: program.rewards, new_value: new_program.rewards}],
            register_date_time: getDateTime()
        };
        await SchemaModels.HistoryModel.create(history_model);
        return 1;
    }

    async checkExistsReward(company_user_id, program_id, target_id) {
        if (!isObjectID(company_user_id) || !isObjectID(program_id) || !isObjectID(target_id))
            return 0;
        return this.collection.countDocuments({
            "company_user_id": company_user_id,
            _id: program_id
            , "rewards.target_id": target_id
        });

    }

    async getCurrency(currency_id) {
        if (!isObjectID(currency_id))
            return 0;
        return SchemaModels.CurrencyModel.findOne({"_id": currency_id, "status": true}).countDocuments();
    }

    async saveAllReward(company_user_id
        , program_id, currency_id, critical_price
        , high_price, medium_price, low_price, none_price, program, current_user_id) {
        if (!isObjectID(company_user_id) || !isObjectID(program_id) || !isObjectID(currency_id))
            return 0;

        let is_all_targets = program.rewards && program.rewards.length > 1 &&
            program.rewards.length === program.targets.length &&
            program.rewards.every(reward => (
                reward.none_price === program.rewards[0].none_price &&
                reward.low_price === program.rewards[0].low_price &&
                reward.medium_price === program.rewards[0].medium_price &&
                reward.high_price === program.rewards[0].high_price &&
                reward.critical_price === program.rewards[0].critical_price
            ));
        let new_program;
        const update_history_model = {
            sender_type: SENDER_TYPE.COMPANY,
            type: HISTORY_TYPE.PROGRAM_CHANGE,
            sender_id: current_user_id,
            resource_type: RESOURCE_TYPE.PROGRAM,
            info_fields: [{key: "status", value: program.status}],
            resource_id: program._id
        };
        if (is_all_targets) {
            let reward_data = {
                "rewards.$.currency_id": currency_id,
                "rewards.$.critical_price": critical_price,
                "rewards.$.high_price": high_price,
                "rewards.$.medium_price": medium_price,
                "rewards.$.low_price": low_price,
                "rewards.$.none_price": none_price
            };
            update_history_model.activity = ACTIVITY_TEXT_LOG.UPDATE_REWARDS_FOR_ALL_TARGETS;
            for (let i = 0; i < program.rewards.length; i++) {
                reward_data['rewards.$.target_id'] = program.rewards[i].target_id;
                await this.collection.updateOne({
                    _id: program._id,
                    "rewards._id": program.rewards[i]._id
                }, {$set: reward_data});
            }
        } else {
            let rewards = [];
            for (let target of program.targets) {
                let row = {
                    "_id": mongoose.Types.ObjectId(),
                    "target_id": target._id,
                    "critical_price": critical_price,
                    "high_price": high_price,
                    "medium_price": medium_price,
                    "low_price": low_price,
                    "none_price": none_price,
                    "currency_id": currency_id,
                };
                rewards.push(row);
            }
            await this.collection.findOneAndUpdate({
                    "company_user_id": company_user_id
                    , "_id": program_id
                }
                , {
                    $set: {"rewards": rewards}
                }
            );
            update_history_model.activity = ACTIVITY_TEXT_LOG.CREATE_REWARDS_FOR_ALL_TARGETS;
        }
        new_program = await this.collection.findOne({_id: program_id});
        update_history_model.fields = [{
            key: "rewards",
            old_value: program.rewards,
            new_value: new_program.rewards
        }];
        update_history_model.register_date_time = getDateTime();
        await SchemaModels.HistoryModel.create(update_history_model);
        return 1;
    }

    async getRewardRow(company_user_id, program_id, reward_id) {
        if (!isObjectID(company_user_id) || !isObjectID(program_id) || !isObjectID(reward_id))
            return {};
        let data = await this.collection.findOne({
            "company_user_id": company_user_id
            , "_id": program_id
        });
        let reward = {};
        if (data.rewards.length > 0) {
            reward = data.rewards.find((reward) => {
                return reward._id.equals(reward_id);
            });
        }
        return reward;
    }


    async saveReward(company_user_id, program_id, reward_id
        , target_id, currency_id, critical_price
        , high_price, medium_price, low_price, none_price, targets, rewards, current_user_id) {
        if (!isObjectID(company_user_id) || !isObjectID(program_id) || !isObjectID(reward_id)
            || !isObjectID(target_id) || !isObjectID(currency_id))
            return 0;

        let currentReward = rewards.find(r => r._id.toString() === reward_id.toString());
        if (!currentReward) {
            return 3;
        }
        let reward_data = {
            "rewards.$.currency_id": currency_id
            , "rewards.$.critical_price": critical_price
            , "rewards.$.high_price": high_price
            , "rewards.$.medium_price": medium_price
            , "rewards.$.low_price": low_price
            , "rewards.$.none_price": none_price
        };
        let is_all_targets = rewards && rewards.length > 1 &&
            rewards.length === targets.length &&
            rewards.every(reward => (
                reward.none_price === rewards[0].none_price &&
                reward.low_price === rewards[0].low_price &&
                reward.medium_price === rewards[0].medium_price &&
                reward.high_price === rewards[0].high_price &&
                reward.critical_price === rewards[0].critical_price
            ));
        if (currentReward.target_id && currentReward.target_id.toString() !== target_id.toString() && !is_all_targets) {
            const check_target = await this.checkExistsReward(company_user_id, program_id, target_id);
            if (check_target !== 0) {
                return 2;
            }
            reward_data['rewards.$.target_id'] = target_id;
        }
        const update_history_model = {
            sender_type: SENDER_TYPE.COMPANY,
            type: HISTORY_TYPE.PROGRAM_CHANGE,
            sender_id: current_user_id,
            resource_type: RESOURCE_TYPE.PROGRAM,
            resource_id: program_id
        };
        let new_program;
        if (is_all_targets) {
            for (let i = 0; i < rewards.length; i++) {
                const current_program = await this.collection.findOne({_id: program_id});
                if (reward_id.toString() !== rewards[i]._id.toString()) {
                    await this.collection.updateOne({
                        _id: program_id,
                        company_user_id
                    }, {$pull: {rewards: {_id: {$eq: rewards[i]._id}}}});
                    const delete_history_model = Object.assign({}, update_history_model);
                    delete_history_model.activity = ACTIVITY_TEXT_LOG.DELETE_REWARD;
                    delete_history_model.info_fields = [{key: "status", value: current_program.status}, {
                        key: "rewards",
                        value: rewards[i]
                    }];
                    new_program = await this.collection.findOne({_id: program_id});
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
            _id: program_id,
            company_user_id,
            "rewards._id": reward_id
        }, {$set: reward_data}, {new: true}).lean();
        update_history_model.info_fields = [{key: "status", value: new_program.status}, {
            key: "rewards",
            value: new_program.rewards.find(reward => reward._id.toString() === reward_id.toString())
        }];
        update_history_model.activity = ACTIVITY_TEXT_LOG.UPDATE_REWARD;
        update_history_model.fields = [{
            key: "rewards",
            old_value: is_all_targets ? rewards.filter(d => d._id.toString() === reward_id.toString()) : rewards,
            new_value: new_program.rewards
        }];
        update_history_model.register_date_time = getDateTime();
        await SchemaModels.HistoryModel.create(update_history_model);
        return 1;
    }

    async deleteReward(company_user_id, program_id, reward_id, current_user_id, program) {
        if (!isObjectID(company_user_id) || !isObjectID(program_id))
            return 0;

        let new_program;
        const history_model = {
            sender_type: SENDER_TYPE.COMPANY,
            type: HISTORY_TYPE.PROGRAM_CHANGE,
            sender_id: current_user_id,
            resource_type: RESOURCE_TYPE.PROGRAM,
            resource_id: program._id,
            register_date_time: getDateTime()
        };
        if (reward_id === "AllTargets") {
            history_model.info_fields = [{key: "status", value: program.status}];
            history_model.activity = ACTIVITY_TEXT_LOG.DELETE_REWARDS_FOR_ALL_TARGETS;
            new_program = await this.collection.findOneAndUpdate({
                _id: program._id,
                company_user_id
            }, {$set: {rewards: []}}, {new: true});
        } else {
            const deleted_reward = program.rewards.find(reward => reward._id.toString() === reward_id.toString());
            history_model.activity = ACTIVITY_TEXT_LOG.DELETE_REWARD;
            history_model.info_fields = [{key: "status", value: program.status}, {
                key: "rewards",
                value: deleted_reward
            }];
            new_program = await this.collection.findOneAndUpdate({
                _id: program._id,
                company_user_id
            }, {$pull: {rewards: {_id: reward_id}}}, {new: true});
        }
        history_model.fields = [{
            key: "rewards",
            old_value: program.rewards,
            new_value: new_program ? new_program.rewards : []
        }];
        await SchemaModels.HistoryModel.create(history_model);
        return 1;
    }

    async saveAllPolicy(company_user_id
        , program_id, out_of_target, item1, item2, item3
        , target_information, qualifying_vulnerabilities
        , non_qualifying_vulnerabilities, program, current_user_id) {
        if (!isObjectID(company_user_id) || !isObjectID(program_id))
            return 0;

        let is_all_targets = program.policies &&
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
            sender_type: SENDER_TYPE.COMPANY,
            type: HISTORY_TYPE.PROGRAM_CHANGE,
            sender_id: current_user_id,
            resource_type: RESOURCE_TYPE.PROGRAM,
            info_fields: [{key: "status", value: program.status}],
            resource_id: program._id
        };
        if (is_all_targets) {
            let policy_data = {
                "policies.$.out_of_target": out_of_target,
                "policies.$.item1": item1,
                "policies.$.item2": item2,
                "policies.$.item3": item3,
                "policies.$.target_information": target_information,
                "policies.$.qualifying_vulnerabilities": qualifying_vulnerabilities,
                "policies.$.non_qualifying_vulnerabilities": non_qualifying_vulnerabilities
            };
            update_history_model.activity = ACTIVITY_TEXT_LOG.UPDATE_POLICIES_FOR_ALL_TARGETS;
            for (let i = 0; i < program.policies.length; i++) {
                policy_data['policies.$.target_id'] = program.policies[i].target_id;
                await this.collection.updateOne({
                    _id: program._id,
                    company_user_id,
                    "policies._id": program.policies[i]._id
                }, {$set: policy_data});
            }
        } else {
            let policies = [];
            for (let target of program.targets) {
                let row = {
                    "_id": mongoose.Types.ObjectId(),
                    "target_id": target._id,
                    "out_of_target": out_of_target,
                    "item1": item1,
                    "item2": item2,
                    "item3": item3,
                    "target_information": target_information,
                    "qualifying_vulnerabilities": qualifying_vulnerabilities,
                    "non_qualifying_vulnerabilities": non_qualifying_vulnerabilities,
                };
                policies.push(row);
            }
            await this.collection.findOneAndUpdate({
                    "company_user_id": company_user_id
                    , "_id": program_id
                }
                , {
                    $set: {"policies": policies}
                }
            );
            update_history_model.activity = ACTIVITY_TEXT_LOG.CREATE_POLICIES_FOR_ALL_TARGETS;
        }
        new_program = await this.collection.findOne({_id: program_id});
        update_history_model.fields = [{
            key: "policies",
            old_value: program.policies,
            new_value: new_program.policies
        }];
        update_history_model.register_date_time = getDateTime();
        await SchemaModels.HistoryModel.create(update_history_model);
        return 1;
    }

    async addPolicy(company_user_id
        , program_id, target_id, out_of_target, item1, item2, item3
        , target_information, qualifying_vulnerabilities
        , non_qualifying_vulnerabilities, program, current_user_id) {
        if (!isObjectID(company_user_id) || !isObjectID(program_id) || !isObjectID(target_id))
            return 0;
        let data = {
            "target_id": target_id,
            "out_of_target": out_of_target,
            "item1": item1,
            "item2": item2,
            "item3": item3,
            "target_information": target_information,
            "qualifying_vulnerabilities": qualifying_vulnerabilities,
            "non_qualifying_vulnerabilities": non_qualifying_vulnerabilities,
        };
        await this.collection.updateOne({
                "company_user_id": company_user_id
                , "_id": program_id
            }
            , {$push: {policies: data}}
            , {new: true});
        const new_program = await this.collection.findOne({_id: program_id}).select({_id: 1, policies: 1});
        const new_policy = new_program.policies.find(r => r.target_id.toString() === data.target_id.toString());
        const history_model = {
            sender_type: SENDER_TYPE.COMPANY,
            activity: ACTIVITY_TEXT_LOG.CREATE_POLICY,
            type: HISTORY_TYPE.PROGRAM_CHANGE,
            sender_id: current_user_id,
            resource_type: RESOURCE_TYPE.PROGRAM,
            resource_id: program._id,
            info_fields: [{key: "status", value: program.status}, {key: "policies", value: new_policy}],
            fields: [{key: "policies", old_value: program.policies, new_value: new_program.policies}],
            register_date_time: getDateTime()
        };
        await SchemaModels.HistoryModel.create(history_model);
        return 1;
    }


    async deletePolicy(company_user_id, program_id, policy_id, current_user_id, program) {
        if (!isObjectID(company_user_id) || !isObjectID(program_id))
            return 0;
        let new_program;
        const history_model = {
            sender_type: SENDER_TYPE.COMPANY,
            type: HISTORY_TYPE.PROGRAM_CHANGE,
            sender_id: current_user_id,
            resource_type: RESOURCE_TYPE.PROGRAM,
            resource_id: program._id,
            register_date_time: getDateTime()
        };
        if (policy_id === "AllTargets") {
            history_model.info_fields = [{key: "status", value: program.status}];
            history_model.activity = ACTIVITY_TEXT_LOG.DELETE_POLICIES_FOR_ALL_TARGETS;
            new_program = await this.collection.findOneAndUpdate({
                    "company_user_id": company_user_id
                    , "_id": program_id
                },
                {$set: {policies: []}}, {new: true, projection: {policies: 1}}
            ).exec();
        } else if (isObjectID(policy_id)) {
            const delete_policy = program.policies.find(policy => policy._id.toString() === policy_id.toString());
            history_model.activity = ACTIVITY_TEXT_LOG.DELETE_POLICY;
            history_model.info_fields = [{key: "status", value: program.status}, {
                key: "policies",
                value: delete_policy
            }];
            new_program = await this.collection.findOneAndUpdate({
                    "company_user_id": company_user_id
                    , "_id": program_id
                },
                {$pull: {policies: {_id: policy_id}}}, {new: true, projection: {policies: 1}}
            ).exec();
        }
        if (!new_program) {
            return 0;
        }
        history_model.fields = [{key: "policies", old_value: program.policies, new_value: new_program.policies}];
        await SchemaModels.HistoryModel.create(history_model);
        return 1;
    }

    async getPolicyRow(company_user_id, program_id, policy_id) {
        if (!isObjectID(company_user_id) || !isObjectID(program_id) || !isObjectID(policy_id))
            return {};
        let data = await this.collection.findOne({
            "company_user_id": company_user_id
            , "_id": program_id
        });
        let policy = {};
        if (data.policies.length > 0) {
            policy = data.policies.find((policy) => {
                return policy._id.equals(policy_id);
            });
        }
        return policy;
    }

    async checkExistsPolicy(company_user_id, program_id, target_id) {
        if (!isObjectID(company_user_id) || !isObjectID(program_id) || !isObjectID(target_id))
            return 0;
        return this.collection.countDocuments({
            "company_user_id": company_user_id
            , "policies.target_id": target_id
        });

    }


    async savePolicy(company_user_id, program_id, policy_id
        , target_id, out_of_target, item1, item2, item3
        , target_information, qualifying_vulnerabilities
        , non_qualifying_vulnerabilities, targets, policies, current_user_id) {
        if (!isObjectID(company_user_id) || !isObjectID(program_id) || !isObjectID(policy_id)
            || !isObjectID(target_id))
            return 0;

        const check_target = await this.collection.countDocuments({
            _id: program_id,
            company_user_id,
            "targets._id": target_id
        });
        if (check_target === 0) {
            return 1;
        }
        let db_current_policy = {};
        if (policies.length > 0) {
            db_current_policy = policies.find(r => r._id.toString() === policy_id.toString());
            if (!db_current_policy) {
                return 2;
            }
        }
        let policy_data = {
            "policies.$.out_of_target": out_of_target
            , "policies.$.item1": item1
            , "policies.$.item2": item2
            , "policies.$.item3": item3
            , "policies.$.target_information": target_information
            , "policies.$.qualifying_vulnerabilities": qualifying_vulnerabilities
            , "policies.$.non_qualifying_vulnerabilities": non_qualifying_vulnerabilities
        };
        if (db_current_policy.target_id.toString() !== target_id.toString()) {
            const check_policy = await this.collection.countDocuments({
                company_user_id: company_user_id,
                "policies.target_id": target_id
            });
            if (check_policy !== 0) {
                return 3;
            }
            policy_data['policies.$.target_id'] = target_id;
        }

        let is_all_targets = policies && policies.length > 1 && policies.length === targets.length && policies.every(policy => (
            policy.item1 === policies[0].item1 &&
            policy.item2 === policies[0].item2 &&
            policy.item3 === policies[0].item3 &&
            policy.non_qualifying_vulnerabilities === policies[0].non_qualifying_vulnerabilities &&
            policy.qualifying_vulnerabilities === policies[0].qualifying_vulnerabilities &&
            policy.target_information === policies[0].target_information &&
            policy.out_of_target === policies[0].out_of_target
        ));
        let new_program;
        const update_history_model = {
            sender_type: SENDER_TYPE.COMPANY,
            type: HISTORY_TYPE.PROGRAM_CHANGE,
            sender_id: current_user_id,
            resource_type: RESOURCE_TYPE.PROGRAM,
            resource_id: program_id
        };
        if (is_all_targets) {
            const delete_history_model = Object.assign({}, update_history_model);
            delete_history_model.register_date_time = getDateTime();
            delete_history_model.activity = ACTIVITY_TEXT_LOG.DELETE_POLICY;
            for (let i = 0; i < policies.length; i++) {
                const curent_program = await this.collection.findOne({_id: program_id});
                if (policy_id.toString() !== policies[i]._id.toString()) {
                    await this.collection.updateOne({_id: program_id}, {$pull: {policies: {_id: {$eq: policies[i]._id}}}});
                    delete_history_model.info_fields = [{key: "status", value: curent_program.status}, {
                        key: "policies",
                        value: policies[i]
                    }];
                    new_program = await this.collection.findOne({_id: program_id});
                    delete_history_model.fields = [{
                        key: "policies",
                        old_value: curent_program.policies,
                        new_value: new_program.policies
                    }];
                    await SchemaModels.HistoryModel.create(delete_history_model);
                }
            }
        }
        new_program = await this.collection.findOneAndUpdate({
            _id: program_id,
            "policies._id": policy_id
        }, {$set: policy_data}, {new: true});
        const updated_policy = new_program.policies.find(d => d._id.toString() === policy_id.toString());
        update_history_model.info_fields = [{key: "status", value: new_program.status}, {
            key: "policies",
            value: updated_policy
        }];
        update_history_model.activity = ACTIVITY_TEXT_LOG.UPDATE_POLICY;
        update_history_model.fields = [{
            key: "policies",
            old_value: is_all_targets ? [updated_policy] : policies,
            new_value: new_program.policies
        }];
        update_history_model.register_date_time = getDateTime();
        await SchemaModels.HistoryModel.create(update_history_model);
    }


    async saveStep1(company_user_id
        , program_id, logoFile, name, program_type, tagline, policy
        , compliance1, compliance2, compliance3, compliance4, compliance5,
                    compliance6, product_type, is_next_generation, program, current_user_id) {
        if (!isObjectID(company_user_id) || !isObjectID(program_id))
            return 0;
        let data = {
            "logo_file": logoFile,
            "program_type": program_type,
            "tagline": tagline,
            "policy": policy,
            "name": name,
            "edit_date_time": getDateTime(),
            "compliance1": compliance1,
            "compliance2": compliance2,
            "compliance3": compliance3,
            "compliance4": compliance4,
            "compliance5": compliance5,
            "compliance6": compliance6,
        };
        if (is_next_generation !== 2) {
            data.product_type = product_type
        }
        await this.collection.updateOne({
                "company_user_id": company_user_id
                , "_id": program_id
            }
            , {'$set': data}, {new: true}).lean();
        const fields = [];
        for (const key in data) {
            if ((program[key] === undefined && hasValue(data[key])) || program[key].toString() !== data[key].toString()) {
                fields.push({key, old_value: program[key], new_value: data[key]});
            }
        }
        if (fields.filter(d => d.key !== "edit_date_time").length > 0 && program.status === PROGRAM_STATUS.PENDING) {
            const history_model = {
                sender_type: SENDER_TYPE.COMPANY,
                activity: ACTIVITY_TEXT_LOG.UPDATE_PROGRAM,
                type: HISTORY_TYPE.PROGRAM_CHANGE,
                sender_id: current_user_id,
                resource_type: RESOURCE_TYPE.PROGRAM,
                resource_id: program._id,
                info_fields: [{key: "status", value: program.status}],
                fields,
                register_date_time: getDateTime()
            };
            await SchemaModels.HistoryModel.create(history_model);
        }
        return 1;
    }

    async saveLaunchTimeline(company_user_id, program_id, launch_timeline, program, current_user_id) {
        if (!isObjectID(company_user_id) || !isObjectID(program_id))
            return 0;

        const user = await SchemaModels.CompanyUserModel.findOne({_id: company_user_id}).select({display_name: 1});
        if (user) {
            if (!user.display_name) {
                return 4;
            }
        } else {
            return 5;
        }

        let data = {
            "launch_timeline": launch_timeline,
            "status": 1
        };
        let x = await this.collection.updateOne({
                "company_user_id": company_user_id
                , "_id": program_id
            }
            , {
                $set: data
            }
        );
        if (launch_timeline !== program.launch_timeline) {
            const history_model = {
                sender_type: SENDER_TYPE.COMPANY,
                activity: ACTIVITY_TEXT_LOG.UPDATE_LAUNCH_TIMELINE,
                type: HISTORY_TYPE.PROGRAM_CHANGE,
                sender_id: current_user_id,
                resource_type: RESOURCE_TYPE.PROGRAM,
                resource_id: program._id,
                info_fields: [{key: "status", value: program.status}],
                fields: [{key: "launch_timeline", old_value: program.launch_timeline, new_value: launch_timeline}],
                register_date_time: getDateTime()
            };
            await SchemaModels.HistoryModel.create(history_model);
        }
        return 1;
    }


    async inviteCheck(company_user_id, program_id, hacker_user_id) {
        return SchemaModels.ProgramInviteModel.findOne({
            "company_user_id": company_user_id
            , "program_id": program_id, "hacker_user_id": hacker_user_id
        }).select("status_invite");
    }

    async inviteAdd(company_user_id, program_id, hacker_user, expire_day) {
        let is_send_notification = false;
        let checkResult = await this.inviteCheck(company_user_id, program_id, hacker_user._id);
        let action_type = ACTION_TYPE.UPDATE;
        if (checkResult) {
            if (checkResult.status_invite !== 1) {
                is_send_notification = true;
                await SchemaModels.ProgramInviteModel.updateOne({
                    "_id": checkResult._id,
                }, {
                    $set: {
                        "expire_day": expire_day,
                        "status_send_email": 0,
                        "status_invite": 0,
                        "register_date_time": getDateTime()
                    }
                });
            }
        } else {
            is_send_notification = true;
            let i = SchemaModels.ProgramInviteModel({
                "company_user_id": company_user_id,
                "program_id": program_id,
                "hacker_user_id": hacker_user._id,
                "expire_day": expire_day,
                "register_date_time": getDateTime()
            });
            let r = await i.save();
            action_type = ACTION_TYPE.CREATE;
        }
        if (is_send_notification) {
            const notification = await this.createNotification("Program Invitation",
                `${hacker_user.fn}, You have received an invitation for a program`,
                FIELD_TYPE.OTHER, hacker_user._id, MESSAGE_TYPE.INFO, company_user_id, program_id,
                action_type, RESOURCE_TYPE.PROGRAM_INVITE);

            this.sendNotification("notification", hacker_user._id, notification.title,
                notification.text, notification.register_date_time, notification.message_type, notification.resource_type, notification._id);
        }
        return 1;
    }

    async createNotification(title, text, field_type, hacker_user_id, message_type, company_user_id,
                             program_id, action_type, resource_type) {
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
            hacker_user_id,
            program_id
        };
        return SchemaModels.NotificationModel.create(notification);
    }

    sendNotification(emit_name, id, title, text, date, message_type, resource_type, notification_id) {
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
                        id: notification_id
                    });
                }
            });
        }
    }

    async getInviteHackerList(company_user_id, program_id) {
        const internal_user_hackers = await SchemaModels.HackerUserModel.find({tag: HACKER_TAGS.INTERNAL_USER}).lean();
        const result = await SchemaModels.ProgramInviteModel.aggregate([
            {
                $match: {
                    $and: [{"company_user_id": company_user_id}, {"program_id": mongoose.Types.ObjectId(program_id)},
                        {hacker_user_id: {$nin: internal_user_hackers.map(hacker => mongoose.Types.ObjectId(hacker._id))}}]
                }
            },
            {
                $addFields: {
                    "current_date": {$toDate: getDateTime()},
                    "invitation_expire_date": {$add: ["$register_date_time", {$multiply: ["$expire_day", 24 * 60 * 60000]}]}
                }
            }, {
                $match: {$or: [{$and: [{"$expr": {"$gt": ["$invitation_expire_date", "$current_date"]}}, {"status_invite": {$eq: 0}}]}, {"status_invite": {$in: [1, 2]}}]}
            }, {
                $lookup: {
                    from: 'hacker_users',
                    localField: 'hacker_user_id',
                    foreignField: '_id',
                    as: 'hacker_user_id'
                }
            }, {$unwind: "$hacker_user_id"},
            {
                $lookup: {
                    from: 'countries',
                    localField: 'hacker_user_id.country_id',
                    foreignField: '_id',
                    as: 'hacker_user_id.country_id'
                }
            }, {$unwind: {path: "$hacker_user_id.country_id", preserveNullAndEmptyArrays: true}},
            {
                $addFields: {
                    is_blue: {
                        $cond: [{
                            $and: [
                                {$eq: ["$hacker_user_id.identity_passport_file_status", HACKER_IDENTITY_STATUS.APPROVED]},
                                {$gt: ["$hacker_user_id.country_id", null]}, {$ne: ["$hacker_user_id.country_id", '']}, {$ne: ["$hacker_user_id.country_id", {}]},
                                {$gt: ["$hacker_user_id.incoming_range_id", null]}, {$ne: ["$hacker_user_id.incoming_range_id", '']}, {$ne: ["$hacker_user_id.incoming_range_id", {}]},
                                {$gt: ["$hacker_user_id.address1", null]}, {$ne: ["$hacker_user_id.address1", '']}, {$gte: ["$hacker_user_id.competency_profile", 1]}, {$gte: [{$size: "$hacker_user_id.skills"}, 1]},
                                {$or: [{$eq: ["$hacker_user_id.identity_card_file_status", HACKER_IDENTITY_STATUS.APPROVED]}, {$eq: ["$hacker_user_id.identity_driver_file_status", HACKER_IDENTITY_STATUS.APPROVED]}]},
                            ]
                        }, true, false]
                    }
                }
            }, {
                $sort: {"hacker_user_id.rank": 1}
            },
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
                                hacker_user_id: {
                                    "fn": 1, _id: 1, "ln": 1, "competency_profile": 1,
                                    "username": 1, "avatar_file": 1, "sb_coin": 1, "reputaion": 1,
                                    "point": 1, "rank": 1, "country_id": 1
                                },
                                current_date: 1,
                                invitation_expire_date: 1,
                                is_blue: 1,
                                status_invite: 1
                            }
                        },
                    ],
                }
            }
        ]).exec();
        const ret = {};
        const showPerPage = gLimit;
        ret.current_page = gPage;
        if (result && result.length > 0 && result[0].totalRows.length > 0) {
            ret.rows = isArray(result[0].rows) ? result[0].rows : [];
            ret.totalRows = result[0].totalRows[0].count;
            ret.totalPage = Math.ceil(ret.totalRows / showPerPage);
            for (let item of ret.rows) {
                const submit_reports = await this.getCountReport(item.hacker_user_id._id);
                item.submit_reports = submit_reports;
            }
            return ret;
        } else {
            ret.rows = [];
            ret.totalRows = 0;
            ret.totalPage = 0;
            return ret;
        }
    }


    async getCountReport(hacker_id) {
        const ret = await SchemaModels.SubmitReportModel.aggregate([
            {
                $match: {$and: [{"hacker_user_id": hacker_id}, {"severity": {$gt: 0}}, {"status": {$in: [4, 7]}}]}
            }, {
                $group: {
                    _id: null,
                    "L": {"$sum": {$cond: [{$eq: ["$severity", 1]}, 1, 0]}},
                    "M": {"$sum": {$cond: [{$eq: ["$severity", 2]}, 1, 0]}},
                    "H": {"$sum": {$cond: [{$eq: ["$severity", 3]}, 1, 0]}},
                    "C": {"$sum": {$cond: [{$eq: ["$severity", 3]}, 1, 0]}}
                }
            }
        ]);
        return ret[0] || {"L": 0, "M": 0, "H": 0, "C": 0};
    }

    async removeLogoFile(company_user_id, program_id, current_user_id, program) {
        if (!isObjectID(company_user_id) || !isObjectID(program_id))
            return 0;

        let data = {
            "logo_file": "",
        };
        let x = await this.collection.updateOne({
                "company_user_id": company_user_id
                , "_id": program_id
            }
            , {
                $set: data
            }
        );
        if (program && program.logo_file) {
            const history_model = {
                sender_type: SENDER_TYPE.COMPANY,
                activity: ACTIVITY_TEXT_LOG.UPDATE_PROGRAM,
                type: HISTORY_TYPE.PROGRAM_CHANGE,
                sender_id: current_user_id,
                resource_type: RESOURCE_TYPE.PROGRAM,
                resource_id: program_id,
                info_fields: [{key: "status", value: program.status}, {key: "logo_file", value: program.logo_file}],
                register_date_time: getDateTime()
            };
            await SchemaModels.HistoryModel.create(history_model);
        }
        return 1;
    }


    async deleteProgram(company_user_id, program_id, current_user_id) {
        if (!isObjectID(company_user_id) || !isObjectID(program_id))
            return 1;

        let program = await this.collection.findOneAndDelete({"_id": program_id, "company_user_id": company_user_id});
        await SchemaModels.CompanyUserModel.updateMany({access_program_list: {$elemMatch: {_id: program_id}}}, {
            $pull: {access_program_list: {_id: program_id}}
        });
        if (program && program._id) {
            const history_model = {
                sender_type: SENDER_TYPE.COMPANY,
                activity: ACTIVITY_TEXT_LOG.DELETE_PROGRAM,
                type: HISTORY_TYPE.PROGRAM_CHANGE,
                sender_id: current_user_id,
                resource_type: RESOURCE_TYPE.PROGRAM,
                resource_id: program_id,
                info_fields: [{key: "status", value: program.status}, {key: "program", value: program}],
                register_date_time: getDateTime()
            };
            await SchemaModels.HistoryModel.create(history_model);
        }
        return 1;
    }

    async generatePdf(company_user_id, program_id, from_date, to_date, status, severity, report_ids) {
        const text_values = {
            invitation_count: 0, accept_invitation_count: 0,
            all_report: 0, hacker_submit_report: 0, rewards_pay: 0, reward_pool: 0
        };
        const program = await this.collection.findOne({_id: program_id, company_user_id})
            .populate({path: 'company_user_id', select: {_id: 0, organization_name: 1}})
            .select({
                _id: 0,
                maximum_reward: 1,
                register_date_time: 1,
                name: 1,
                is_next_generation: 1,
                targets: 1,
                program_type: 1
            }).lean();
        if (!program) {
            return 1;
        }
        const where = [{program_id: mongoose.Types.ObjectId(program_id)}];
        if (report_ids && report_ids.length > 0) {
            where.push({_id: {$nin: report_ids.map(report_id => mongoose.Types.ObjectId(report_id))}});
        }
        if (status && status.length > 0) {
            status = status.filter(status => status > 0 && status <= 9);
            where.push({status: {$in: status}});
        } else {
            where.push({status: {$gt: REPORT_STATUS.NONE}});
            where.push({status: {$lt: REPORT_STATUS.IN_PROGRESS_BY_ADMIN}});
        }
        if (severity && severity.length > 0) {
            where.push({severity: {$in: severity}});
        }
        const reports_data = await SchemaModels.SubmitReportModel.aggregate([
            {$match: {$and: where}},
            ...(hasValue(from_date) ? [{
                $match: {
                    submit_date_time: {$gte: moment(from_date).toDate()}
                }
            }] : []),
            ...(hasValue(to_date) ? [{
                $match: {
                    submit_date_time: {$lte: moment(to_date).add(86399, 'seconds').toDate()}
                }
            }] : []),
            {
                $facet: {
                    result: [{
                        $lookup: {
                            from: "type_vulnerabilities",
                            localField: "vulnerability_type_id",
                            foreignField: "_id",
                            as: "vulnerability_type_id",
                        },
                    },
                        {"$unwind": {path: "$vulnerability_type_id", preserveNullAndEmptyArrays: true}},
                        {$project: {_id: 1, target_id: 1, severity: 1, status: 1, vulnerability_type_id: 1}}
                    ],
                    submission_count_base_date: [
                        {
                            $group: {
                                _id: {
                                    year: {$year: "$submit_date_time"},
                                    month: {$month: "$submit_date_time"},
                                    day: {$dayOfMonth: "$submit_date_time"}
                                },
                                submission: {$sum: 1},
                                approve_resolve: {$sum: {$cond: [{$or: [{$eq: ["$status", REPORT_STATUS.RESOLVED]}, {$eq: ["$status", REPORT_STATUS.APPROVE]}]}, 1, 0]}},
                                date: {$first: {$dateToString: {format: "%Y-%m-%d", date: "$submit_date_time"}}}
                            }
                        },
                        {$sort: {"_id.year": 1, "_id.month": 1, "_id.day": 1}},
                        {
                            $project: {
                                _id: 0,
                                submission: 1,
                                approve_resolve: 1,
                                date: 1
                            }
                        }
                    ],
                    hackers: [{$group: {_id: "$hacker_user_id"}}, {$project: {_id: 1}}],
                    report_count_base_status: [
                        {
                            $group: {
                                _id: "$status",
                                count: {"$sum": 1},
                            }
                        }
                    ]
                }
            }
        ]);
        const report_count_group_by_target = new Map();
        report_count_group_by_target.set('all', {N: 0, L: 0, M: 0, H: 0, C: 0});
        const targets = program.targets.map(d => d.identifier);
        const vulnerabilities = [];
        reports_data[0].result.forEach(report => {
            const target = program.targets.find(target => target._id && report.target_id && target._id.toString() === report.target_id.toString());
            if (target && target.identifier) {
                if (!report_count_group_by_target.has(target.identifier)) {
                    report_count_group_by_target.set(target.identifier.toString(), {N: 0, L: 0, M: 0, H: 0, C: 0});
                }
                const all = report_count_group_by_target.get('all');
                const identifier = report_count_group_by_target.get(target.identifier);
                let severity;
                let severity_name;
                switch (report.severity) {
                    case REPORT_SEVERITY.NONE:
                        severity = "N";
                        severity_name = "None";
                        break;
                    case REPORT_SEVERITY.LOW:
                        severity = "L";
                        severity_name = "Low";
                        break;
                    case REPORT_SEVERITY.MEDIUM:
                        severity = "M";
                        severity_name = "Medium";
                        break;
                    case REPORT_SEVERITY.HIGH:
                        severity = "H";
                        severity_name = "High";
                        break;
                    case REPORT_SEVERITY.CRITICAL:
                        severity = "C";
                        severity_name = "Critical";
                        break;
                }
                this.setReportCountBySeverity(report_count_group_by_target, target.identifier, all, identifier, severity);
                if (report.status === REPORT_STATUS.APPROVE || report.status === REPORT_STATUS.RESOLVED) {
                    vulnerabilities.push({
                        vulnerability: report.vulnerability_type_id.title,
                        status: report.status === REPORT_STATUS.APPROVE ? "approve" : "resolve",
                        severity: severity_name,
                        report_id: report._id
                    });
                }
            }
        });
        let report_count_group = [];
        report_count_group_by_target.forEach((value, key) => report_count_group.push({[key]: value}));
        let program_invites;
        if (program.is_next_generation !== PROGRAM_BOUNTY_TYPE.INTELLIGENCE_DISCOVERY &&
            program.program_type === PROGRAM_TYPE.PRIVATE) {
            program_invites = await SchemaModels.ProgramInviteModel.aggregate([
                {$match: {program_id: mongoose.Types.ObjectId(program_id)}},
                {
                    $group: {
                        _id: null, hacker_count: {$sum: 1},
                        accept_hacker_count: {$sum: {$cond: [{$eq: [INVITE_HACKER_STATUS.ACCEPT, "$status_invite"]}, 1, 0]}}
                    }
                },
                {$project: {_id: 0, accept_hacker_count: 1, hacker_count: 1}}
            ]);
            if (program_invites && program_invites[0]) {
                text_values.invitation_count = program_invites[0].hacker_count;
                text_values.accept_invitation_count = program_invites[0].accept_hacker_count;
            }
        }
        let submitted_hackers = [];
        if (reports_data && reports_data[0] && reports_data[0].hackers &&
            reports_data[0].hackers.length && reports_data[0].hackers.length > 0) {
            submitted_hackers = reports_data[0].hackers;
        }
        if (program.is_next_generation === PROGRAM_BOUNTY_TYPE.BUG_BOUNTY) {
            const rewards = await SchemaModels.PaymentHistoryModel.aggregate([
                {
                    $match: {
                        program_id: mongoose.Types.ObjectId(program_id), is_positive: false,
                        hacker_user_id: {$in: submitted_hackers.map(h => mongoose.Types.ObjectId(h._id))}
                    }
                },
                {$group: {_id: null, rewards_pay: {$sum: "$amount"}}},
                {$project: {_id: null, rewards_pay: 1}}
            ]);
            text_values.reward_pool = program.maximum_reward;
            if (rewards && rewards[0] && rewards[0].rewards_pay) {
                text_values.rewards_pay = rewards[0].rewards_pay;
            }
        }
        text_values.hacker_submit_report = submitted_hackers.length;
        const report_count = report_count_group_by_target.get('all');
        text_values.all_report = report_count.N + report_count.L + report_count.M + report_count.H + report_count.C;
        delete program.targets;
        delete program.maximum_reward;
        return {
            targets,
            text_values,
            submission_count_base_date: reports_data[0].submission_count_base_date,
            report_count_base_status: this.setReportStatusCount(reports_data[0].report_count_base_status),
            report_count_group_by_target: report_count_group,
            vulnerabilities,
            program
        }
    }

    setReportCountBySeverity(report_count_group_by_target, identifier_name, all, identifier, severity) {
        report_count_group_by_target.set("all", Object.assign(all, {[severity]: all[severity] + 1}));
        report_count_group_by_target.set(identifier_name, Object.assign(identifier, {[severity]: identifier[severity] + 1}));
    }

    setReportStatusCount(status_info) {
        const result = {
            pending: 0,
            triage: 0,
            resolve: 0,
            reject: 0,
            duplicate: 0,
            not_applicable: 0,
            modification: 0,
            approve: 0
        };
        status_info.forEach(item => {
            switch (item._id) {
                case REPORT_STATUS.PENDING:
                    result.pending = item.count;
                    break;
                case REPORT_STATUS.APPROVE:
                    result.approve = item.count;
                    break;
                case REPORT_STATUS.RESOLVED:
                    result.resolve = item.count;
                    break;
                case REPORT_STATUS.REJECT:
                    result.reject = item.count;
                    break;
                case REPORT_STATUS.NOT_APPLICABLE:
                    result.not_applicable = item.count;
                    break;
                case REPORT_STATUS.DUPLICATE:
                    result.duplicate = item.count;
                    break;
                case REPORT_STATUS.MODIFICATION:
                    result.modification = item.count;
                    break;
                case REPORT_STATUS.TRIAGE:
                    result.triage = item.count;
                    break;
            }
        });
        return result;
    }

    async cancelInvitation(company_user_id, program_id, hacker_user_id) {
        const is_program_owner = await this.collection.countDocuments({_id: program_id, company_user_id});
        if (is_program_owner <= 0) {
            return 1;
        }
        const is_deleted = await SchemaModels.ProgramInviteModel.findOneAndDelete({program_id, hacker_user_id});
        if (!is_deleted) {
            return 2;
        }
        return 0;
    }

    async getCompanyProgramsList(company_user_id, parent_user_id, access_program_list) {
        const where = {company_user_id};
        if (parent_user_id && access_program_list && access_program_list.length > 0) {
            where._id = {$in: access_program_list.map(access_program => access_program._id.toString())}
        }
        return await this.collection.find(where).select({_id: 1, name: 1});
    }

    async getnextGenPentMonthly(program_id) {
        return await this.collection.findOne({'_id': program_id})
            .select({"_id": 0, "monthly_hours": {"date": 1, "hours": 1}});
    }


    async isProgramUser(company_user_id, program_id) {
        await this.collection.findeOne({
            "company_user_id": company_user_id
            , "_id": program_id
        });
    }

    async checkProgramId(company_user_id, program_id) {
        return await this.collection.findOne({
            "company_user_id": company_user_id
            , "_id": program_id
        }).countDocuments();

    }

    async is_program_asignned_to_member(access_program_list, program_id) {
        if (!access_program_list || access_program_list.length === 0) return true;
        return access_program_list.map(p => p._id.toString()).includes(program_id.toString());
    }

    async setNextGenPentBudgeting(company_user_id, program_id, hourly_price, duration_type, maximum_reward, monthly_hours, access_program_list) {
        const data = {monthly_hours, hourly_price, duration_type, maximum_reward};
        const min_hourly_price = 130;
        const program = await this.collection.findOne({_id: program_id, company_user_id})
            .select({hourly_price: 1, product_type: 1});
        if (!program) {
            return 1;
        }
        if ((program.hourly_price && program.hourly_price !== toNumber(hourly_price)) ||
            (!program.hourly_price && toNumber(hourly_price) !== min_hourly_price)) {
            return 2;
        }
        if (program.product_type !== PRODUCT_TYPE.ENTERPRISE) {
            return 3;
        }
        return await this.collection.findOneAndUpdate({company_user_id, "_id": program_id},
            {$set: data}, {
                new: true,
                projection: {'maximum_reward': 1, 'hourly_price': 1, 'monthly_hours': 1, 'duration_type': 1}
            });
    }


    async saveNextGenPentMonthly(company_user_id, program_id, hourly_price, maximum_reward, duration_type, rows) {

        const data = {
            "monthly_hours": rows,
            "hourly_price": hourly_price,
            "duration_type": duration_type,
            "maximum_reward": maximum_reward

        };
        let x = await this.collection.updateOne({
                "company_user_id": company_user_id
                , "_id": program_id
            }
            ,
            {
                $set: data
            });
        return x;
    }

    async getTotalPriceNgp(user_id, program_id) {
        if (!isObjectID(user_id))
            return 1;
        if (program_id !== "" && !isObjectID(program_id)) {
            return ret;
        }
        let x = await this.collection
            .findOne({'_id': program_id})
            .select({"_id": 0, "hourly_price": 1, "maximum_reward": 1, "monthly_hours": {"hours": 1,}});
        let sum = 0
        for (let c of x.monthly_hours) {
            var h = c.hours;

            sum += c.hours;
        }
        const total_hours = sum;
        const TotalpriceNgp = x.hourly_price * total_hours; // totalpriceNgp
        // const bugetNgp = x.maximum_reward - TotalpriceNgp; // bugetNgp

        const obj =
            {
                "TotalpriceNgp": TotalpriceNgp,
            }

        return obj;
    }
}


module.exports = new ProgramModel();