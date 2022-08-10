const {hasValue, setPaginationResponse, toObjectID, toNumber} = require('../../../../libs/methode.helper');
const {getAdministrationLogin} = require('../../../init');
const {ErrorHelper} = require('../../../../libs/error.helper');
const {STATIC_VARIABLES, ADMIN_ROLES,HACKER_TAGS} = require('../../../../libs/enum.helper');
const moment = require('moment');

class CTFModel {
    constructor() {
        this.collection = SchemaModels.CTFModel;
    }

    async gets(data) {
        const filters = [];
        if (hasValue(data.title)) {
            filters.push({title: {$regex: ".*" + data.title + ".*", $options: "i"}});
        }
        const ctfs = await this.collection.aggregate([
            ...(filters.length > 0 ? [{$match: {$and: filters}}] : []),
            {
                $facet: {
                    total_count: [{$count: "count"}],
                    rows: [{$sort: {"start_date_time": -1}}, {$skip: (data.page - 1) * data.limit}, {$limit: data.limit},
                        {
                            $project: {
                                _id: 1,
                                title: 1,
                                status: 1,
                                initial_point: 1,
                                minimum_point: 1,
                                decay: 1,
                                coins: 1,
                                end_date_time: 1,
                                start_date_time: 1
                            }
                        }]
                }
            }
        ]);
        return setPaginationResponse(ctfs, data.limit, data.page);
    }

    async statistic(data) {
        const user = await getAdministrationLogin(data.token, false);
        if (!user.status) {
            return "token is invalid";
        }
        if (user.user_level_access !== toNumber(ADMIN_ROLES.ADMIN)) {
            return "You don't have permission for this action";
        }
        const ctf = await this.collection.countDocuments({_id: data.ctf_id});
        if (ctf === 0) {
            return "ctf is not found";
        }
        return await SchemaModels.FlagCtfSubmitModel.aggregate([
            {$match: {$and: [{"ctf_id": toObjectID(data.ctf_id)}]}},
            {
                $group: {
                    _id: "$hacker_user_id", point: {$sum: "$point"},
                    challenge_ids: {$push: "$challenge_id"}, submit_date_time: {"$last": "$submit_date_time"}
                }
            },
            {$sort: {point: -1, submit_date_time: 1}},
            {
                $group: {
                    _id: null,
                    results: {
                        $push: {
                            hacker_user_id: "$_id",
                            point: "$point",
                            challenge_ids: "$challenge_ids",
                            submit_date_time: "$submit_date_time"
                        }
                    }
                }
            },
            {$unwind: {path: "$results", includeArrayIndex: "rank"}},
            {
                $project: {
                    _id: 0,
                    point: "$results.point",
                    submit_date_time: "$results.submit_date_time",
                    challenge_ids: "$results.challenge_ids",
                    hacker_user_id: "$results.hacker_user_id",
                    rank: {"$add": ["$rank", 1]}
                }
            },
            {$lookup: {from: 'hacker_users', localField: 'hacker_user_id', foreignField: '_id', as: 'hacker_user'}},
            {$unwind: {path: "$hacker_user", preserveNullAndEmptyArrays: true}},
            {
                $lookup: {
                    from: 'countries',
                    localField: 'hacker_user.country_id',
                    foreignField: '_id',
                    as: 'hacker_user.country_id'
                }
            },
            {$unwind: {path: "$hacker_user.country_id", preserveNullAndEmptyArrays: true}},
            {$project: {_id: 0, pos: "$rank", team: "$hacker_user.username", score: "$point"}}]).exec();
    }

    async setChallengeCoins(ctf_id) {
        const ctf = await this.collection.findOne({_id: ctf_id}, {_id: 1, title: 1, coins: 1});
        if (!ctf) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_RESOURCE_FOUND, "ctf");
        }
        const submit_CTF = await SchemaModels.FlagCtfSubmitModel.aggregate([
            {$match: {$and: [{ctf_id: ctf._id}]}},
            {
                $group: {
                    _id: "$challenge_id", challenge_solve_count: {$sum: 1},
                    hacker_user_ids: {$push: "$hacker_user_id"}, point: {$first: "$point"},
                    submit_date_time: {"$last": "$submit_date_time"}
                }
            },
            {$sort: {challenge_solve_count: -1, submit_date_time: 1}},
            {$project: {_id: 1, challenge_solve_count: 1, submit_date_time: 1, point: 1, hacker_user_ids: 1}}
        ]);
        if (submit_CTF.length === 0) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.CUSTOM, "ctf has not started yet.");
        }
        const challenges_group_base_on_level = this.getChallengesGroupBaseOnLevel(submit_CTF, ctf.coins);
        for (let index = 0; index < challenges_group_base_on_level.length; index++) {
            const current_challenge_group = challenges_group_base_on_level[index];
            const current_coin = current_challenge_group.coin;
            await this.setHackersCoins(current_challenge_group, ctf, current_coin);
            const challenge_ids = current_challenge_group.items.map(d => d._id);
            await SchemaModels.FlagCtfSubmitModel.updateMany({challenge_id: {$in: challenge_ids}}, {$set: {coin: current_coin}});
            await SchemaModels.ChallengeModel.updateMany({_id: {$in: challenge_ids}}, {$set: {coin: current_coin}});
        }
    }

    getChallengesGroupBaseOnLevel(submit_CTF, coins) {
        const levels = coins;
        const challenge_in_each_level = Math.floor(submit_CTF.length / levels);
        let remaining_challenge_count = submit_CTF.length % levels;
        const clone_submit_CTF = [...submit_CTF];
        return this.setChallengesGroupBaseOnLevel(
            clone_submit_CTF, submit_CTF, coins, remaining_challenge_count, challenge_in_each_level
        );
    }

    setChallengesGroupBaseOnLevel(clone_submit_CTF, submit_CTF, coins, remaining_challenge_count, challenge_in_each_level) {
        const challenges_group_base_on_level = [];
        for (let level = 1; level <= coins; level++) {
            if (clone_submit_CTF.length > 0) {
                const plus_count = remaining_challenge_count > 0 ? 1 : 0;
                const remove_count = challenge_in_each_level === 0 ? 1 : challenge_in_each_level + plus_count;
                challenges_group_base_on_level.push({
                    items: clone_submit_CTF.splice(0, remove_count),
                    coin: level + challenge_in_each_level === 0 ? coins - submit_CTF.length : 0
                });
                remaining_challenge_count--;
            }
        }
        return challenges_group_base_on_level;
    }

    async setHackersCoins(current_challenge_group, ctf, current_coin) {
        for (let i = 0; i < current_challenge_group.items.length; i++) {
            let challenge = await SchemaModels.ChallengeModel.findOne({_id: current_challenge_group.items[i]._id}).select({
                _id: 1,
                title: 1
            });
            if (!challenge) {
                throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.CUSTOM, "Challenge not found.");
            }
            const text = `ctf_${ctf._id}_challenge_${challenge.name}_${challenge._id}`;
            const hacker_user_ids = current_challenge_group.items[i].hacker_user_ids;
            const check_for_coin_log = await SchemaModels.HackerUserModel.find({"coin_log.text": {$eq: text}}).countDocuments();
            const check_for_point_log = await SchemaModels.HackerUserModel.find({"point_log.text": {$eq: text}}).countDocuments();
            if (check_for_point_log !== 0 || check_for_coin_log !== 0) {
                throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.CUSTOM, "coins already set for this CTF.");
            }
            const point = Number(current_challenge_group.items[i].point);
            await this.setHackerCoins(hacker_user_ids, current_challenge_group, current_coin, point,challenge._id,text);
        }
    }

    async setHackerCoins(hacker_user_ids, current_challenge_group, current_coin, point,challenge_id,text) {
        for (let h = 0; h < hacker_user_ids.length; h++) {
            const submit_challenge = await SchemaModels.FlagCtfSubmitModel
                .findOne({
                    challenge_id,
                    hacker_user_id: hacker_user_ids[h]
                });
            if (submit_challenge) {
                await SchemaModels.HackerUserModel.updateOne({_id: submit_challenge.hacker_user_id,tag: { $ne: HACKER_TAGS.INTERNAL_USER }}, {
                    $inc: {point: point, sb_coin: current_coin},
                    $push: {
                        point_log: {text, date_time: submit_challenge.submit_date_time, "value": point}
                        , coin_log: {text, date_time: submit_challenge.submit_date_time, "value": current_coin}
                    }
                });
            }
        }
    }

    async create(data) {
        await this.checkTitleExists(null, data.title);
        return await this.collection.create({
            title: data.title,
            start_date_time: moment(data.start_date_time).utcOffset(0, false),
            end_date_time: moment(data.end_date_time).utcOffset(0, false),
            minimum_point: data.minimum_point,
            initial_point: data.initial_point,
            decay: data.decay,
            coins: data.coins,
            status: data.status
        });
    }

    async update(data) {
        await this.checkTitleExists(data.id, data.ctf.title);
        const update_data = {
            title: data.ctf.title,
            start_date_time: moment(data.ctf.start_date_time).utcOffset(0, false),
            end_date_time: moment(data.ctf.end_date_time).utcOffset(0, false),
            minimum_point: data.ctf.minimum_point,
            initial_point: data.ctf.initial_point,
            decay: data.ctf.decay,
            coins: data.ctf.coins,
            status: data.ctf.status
        };
        const ctf = await this.collection.findOneAndUpdate({_id: data.id},
            {$set: update_data}, {new: true});
        if (!ctf) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_RESOURCE_FOUND, "ctf");
        }
        return ctf;
    }

    async delete(id) {
        const ctf = await this.collection.findOne({_id: id});
        if (!ctf) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_RESOURCE_FOUND, "user");
        }
        const is_ctf_use_in_challenge = await SchemaModels.ChallengeModel.findOne({
            ctf_id: id
        });
        if (is_ctf_use_in_challenge) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.CUSTOM, "ctf used in challenge");
        }
        const is_ctf_use_in_flag = await SchemaModels.FlagCtfSubmitModel.findOne({
            ctf_id: id
        });
        if (is_ctf_use_in_flag) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.CUSTOM, "ctf used in flag");
        }
        await this.collection.deleteOne({_id: id});
    }

    async addChallenge(data) {
        const ctf = await this.collection.countDocuments({_id: data.id});
        if (ctf === 0) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_FOUND, "ctf");
        }
        await this.checkNameAndLinkAndFlagExists(null, data.id, data.challenge.name, data.challenge.link, data.challenge.flag);
        return await SchemaModels.ChallengeModel.create({
            ctf_id: data.id,
            name: data.challenge.name,
            category_id: data.challenge.category_id,
            level_id: data.challenge.level_id,
            point: data.challenge.point,
            coin: data.challenge.coin,
            flag: data.challenge.flag,
            link: data.challenge.link,
            description: data.challenge.description,
            status: true
        });
    }

    async updateChallenge(data) {
        const ctf = await this.collection.countDocuments({_id: data.id});
        if (ctf === 0) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_FOUND, "ctf");
        }
        await this.checkNameAndLinkAndFlagExists(data.challenge_id, data.id, data.challenge.name, data.challenge.link, data.challenge.flag);
        const challenge = await SchemaModels.ChallengeModel.findOneAndUpdate({
            ctf_id: data.id,
            _id: data.challenge_id
        }, {
            $set: {
                name: data.challenge.name,
                category_id: data.challenge.category_id,
                level_id: data.challenge.level_id,
                point: data.challenge.point,
                coin: data.challenge.coin,
                flag: data.challenge.flag,
                link: data.challenge.link,
                description: data.challenge.description,
                status: data.challenge.status
            }
        }, {new: true});
        if (!challenge) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_FOUND, "challenge");
        }
        return challenge;
    }

    async deleteChallenge(data) {
        const challenge = await SchemaModels.ChallengeModel.findOneAndDelete({_id: data.challenge_id, ctf_id: data.id});
        if (!challenge) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_RESOURCE_FOUND, "challenge");
        }
    }

    async getChallenges(id) {
        const ctf = await this.collection.countDocuments({_id: id});
        if (ctf === 0) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_FOUND, "ctf");
        }
        return await SchemaModels.ChallengeModel.find({ctf_id: id})
            .populate({path: 'ctf_id', select: {_id: 1, title: 1}})
            .select({
                _id: 1, status: 1, ctf_id: 1, coin: 1, flag: 1, link: 1,
                name: 1, category_id: 1, level_id: 1, point: 1, description: 1
            });
    }

    async checkTitleExists(id, title) {
        let title_count;
        if (id) {
            title_count = await this.collection.countDocuments({_id: {$ne: id}, title});
        } else {
            title_count = await this.collection.countDocuments({title});
        }
        if (title_count > 0) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.EXIST, "title");
        }
    }

    async checkNameAndLinkAndFlagExists(id, ctf_id, name, link, flag) {
        let name_count;
        let link_count;
        let flag_count;
        if (id) {
            name_count = await SchemaModels.ChallengeModel.countDocuments({_id: {$ne: id}, name, ctf_id});
        } else {
            name_count = await SchemaModels.ChallengeModel.countDocuments({name, ctf_id});
        }
        if (name_count > 0) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.EXIST, "name");
        }
        if (id) {
            link_count = await SchemaModels.ChallengeModel.countDocuments({_id: {$ne: id}, link});
        } else {
            link_count = await SchemaModels.ChallengeModel.countDocuments({link});
        }
        if (link_count > 0) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.EXIST, "link");
        }
        if (id) {
            flag_count = await SchemaModels.ChallengeModel.countDocuments({_id: {$ne: id}, flag});
        } else {
            flag_count = await SchemaModels.ChallengeModel.countDocuments({flag});
        }
        if (flag_count > 0) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.EXIST, "flag");
        }
    }
}

module.exports = new CTFModel();