class ProgramHackerModel {
    constructor() {
        this.collection = SchemaModels.ProgramModel;
    }


    async getProgram(program_id) {
        if (!isObjectID(program_id))
            return null;

        let program = await this.collection.findOne({"is_verify": true, "status": 2, "_id": program_id})
            .select({
                _id: 1, status: 1, is_verify: 1, launch_timeline: 1,
                company_user_id: 1, logo_file: 1, name: 1, program_type: 1, monthly_hours: 1,
                tagline: 1, policy: 1, register_date_time: 1, targets: 1, hourly_price:1, duration_type: 1,
                rewards: 1, policies: 1, is_next_generation: 1, start_date_program: 1,  expire_date_program: 1
            })
            .populate('company_user_id', '_id fn ln')
            .populate('targets.target_type_id')
            .populate('targets.language_id')
            .populate('rewards.currency_id').lean();

        if (program) {
            program.report_count = await SchemaModels.SubmitReportModel.find({
                $and:[{program_id},{status:{$gt:0}},{status:{$lt:10}}]
            }).countDocuments();
        }
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
                                {activity: ACTIVITY_TEXT_LOG.UPDATE_PROGRAM}
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


    async getProgramList(program_type, hacker_user_id, is_next_generation,user) {
        if (is_next_generation === PROGRAM_BOUNTY_TYPE.INTELLIGENCE_DISCOVERY){
            if (!(user.identity_passport_file_status === HACKER_IDENTITY_STATUS.APPROVED &&
                (user.identity_card_file_status === HACKER_IDENTITY_STATUS.APPROVED ||
                    user.identity_driver_file_status === HACKER_IDENTITY_STATUS.APPROVED))){
                return 1;
            }
            if (!isObjectID(user.country_id) || !isObjectID(user.incoming_range_id) ||
                !user.address1 && !user.competency_profile || !user.skills || !(user.skills.length > 0)){
                return 1;
            }

            if (!user.tag || !user.tag.includes(HACKER_TAGS.INTELLIGENCE_DISCOVERY)){
                return 1;
            }
        }
        const report_group_by_program_id = await SchemaModels.SubmitReportModel.aggregate([
            {$match: {$and:[{"status": {$gt: 0}},{"status": {$lt: 10}}]}},
            {$group: {_id: "$program_id", count: {$sum: 1}}}
        ]);

        let result = [];
        let ret = {};
        if (program_type == 1) {
            result = await this.collection.aggregate([
                {
                    $match: {
                        $and: [
                            {"program_type": 1},
                            {"is_verify": true},
                            {"is_next_generation": is_next_generation},
                            {"status": 2}
                        ]
                    }
                },
                {
                    $lookup: {
                        from: 'company_users',
                        localField: 'company_user_id',
                        foreignField: '_id',
                        as: 'company_users'
                    }
                },
                {
                    $unwind: "$company_users"
                }, {
                    $unwind: "$targets"
                }, {
                    $unwind: "$rewards"
                },
                {
                    $lookup: {
                        from: 'currencies',
                        localField: 'rewards.currency_id',
                        foreignField: '_id',
                        as: 'rewards.currency_id'
                    }
                }, {
                    $unwind: "$rewards.currency_id"
                },
                {
                    $lookup: {
                        from: 'type_tests',
                        localField: 'targets.target_type_id',
                        foreignField: '_id',
                        as: 'targets.target_type_id'
                    }
                }, {
                    $unwind: "$targets.target_type_id"
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
                                    start_date_program: 1,
                                    expire_date_program: 1,
                                    program_type: 1,
                                    tagline: 1,
                                    policy: 1,
                                    register_date_time: 1,
                                    targets: 1,
                                    rewards: 1,
                                    policies: 1,
                                    is_next_generation: 1,
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
        } else {
            result = await SchemaModels.ProgramInviteModel.aggregate([
                {
                    $match: {
                        $and: [
                            {"hacker_user_id": mongoose.Types.ObjectId(hacker_user_id)},
                            {"status_invite": 1}
                        ]
                    }
                },
                {
                    $lookup: {
                        from: 'programs',
                        localField: 'program_id',
                        foreignField: '_id',
                        as: 'program'
                    }
                },
                {
                    $unwind: "$program"
                },
                {
                    $match: {
                        $and: [
                            {"program.program_type": program_type},
                            {"program.is_verify": true},
                            {"program.is_next_generation": is_next_generation},
                            {"program.status": 2}
                        ]
                    }
                },
                {
                    $lookup: {
                        from: 'company_users',
                        localField: 'program.company_user_id',
                        foreignField: '_id',
                        as: 'company_users'
                    }
                },
                {
                    $unwind: "$company_users"
                },
                {
                    $unwind: {path: "$program.targets", preserveNullAndEmptyArrays: true}
                },
                {
                    $unwind: {path: "$program.rewards", preserveNullAndEmptyArrays: true}
                }, {
                    $lookup: {
                        from: 'currencies',
                        localField: 'program.rewards.currency_id',
                        foreignField: '_id',
                        as: 'program.rewards.currency_id'
                    }
                },
                {
                    "$unwind": {path: "$program.rewards.currency_id", preserveNullAndEmptyArrays: true}
                },
                {
                    $lookup: {
                        from: 'type_tests',
                        localField: 'program.targets.target_type_id',
                        foreignField: '_id',
                        as: 'program.targets.target_type_id'
                    }
                },
                {
                    $unwind: {path: "$program.targets.target_type_id", preserveNullAndEmptyArrays: true}
                },
                {
                    $lookup: {
                        from: 'languages',
                        localField: 'program.targets.language_id',
                        foreignField: '_id',
                        as: 'program.targets.language_id'
                    }
                },
                {
                    $group: {
                        _id: '$_id',
                        root: {$mergeObjects: '$$ROOT'},
                        targets: {$push: '$program.targets'},
                        rewards: {$push: '$program.rewards'}
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
                    $sort: {"program._id": -1}
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
                                    _id: 1,
                                    company_users: {fn: 1, ln: 1, _id: 1},
                                    program: {
                                        _id: 1,
                                        start_date_program: 1,
                                        expire_date_program: 1,
                                        status: 1,
                                        is_verify: 1,
                                        launch_timeline: 1,
                                        company_user_id: 1,
                                        logo_file: 1,
                                        name: 1,
                                        program_type: 1,
                                        tagline: 1,
                                        policy: 1,
                                        register_date_time: 1,
                                        targets: "$targets",
                                        rewards: "$rewards",
                                        policies: 1,
                                        is_next_generation: 1
                                    },
                                    report_count: {
                                        $ifNull: [{
                                            $let: {
                                                vars: {
                                                    report: {
                                                        $arrayElemAt: [{
                                                            $filter: {
                                                                input: report_group_by_program_id,
                                                                as: "filter_report",
                                                                cond: {$eq: ["$$filter_report._id", "$program._id"]}
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
        }
        if (result && result.length > 0 && result[0].totalRows.length > 0) {
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

    async checkAcceptedInvitationByHacker(user_id, program_id) {
        return await SchemaModels.ProgramInviteModel.countDocuments({
            program_id,
            hacker_user_id: user_id,
            status_invite: INVITE_HACKER_STATUS.ACCEPT
        });
    }

    async getProgramHistory(program_id, user) {
        if (!isObjectID(program_id)) {
            return 2;
        }
        const program = await this.collection.findOne({_id: program_id});
        if (!program) {
            return 2;
        }
        if (program.program_type === PROGRAM_TYPE.PRIVATE) {
            const isHackerInvited = await this.checkAcceptedInvitationByHacker(user._id, program_id);
            if (isHackerInvited < 1) {
                return 2;
            }
            if (!getHackerKycAdvanced(user)) {
                return 3;
            }
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
                                {activity: ACTIVITY_TEXT_LOG.UPDATE_PROGRAM}
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
            const policy = {key: "policy", isProgramInfo: true};
            const program_parts = [targets, policies, name, tagline, policy];
            if (program.is_next_generation !== PROGRAM_BOUNTY_TYPE.INTELLIGENCE_DISCOVERY) {
                program_parts.push(rewards);
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
                if (history.targets && history.targets.length > 0){
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
                if (history.rewards && history.rewards.length > 0){
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
            items = items ? [...items.old_value] : [];
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
                    const new_result = JSON.parse(JSON.stringify(result[historyIndex - 1][`program_${key}`] || ''));
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
        const initial_data = this.getInitialData(history, key);
        let items = JSON.parse(JSON.stringify(initial_data || ''));
        if (isProgramInfo && items && items.length > 0) {
            items = items.filter(t => !!t.fields.find(pt => pt.key === key))
        }
        this.updateHistoryItems(items, key, date, isProgramInfo, historyIndex, program, result);
    }
}

module.exports = new ProgramHackerModel();