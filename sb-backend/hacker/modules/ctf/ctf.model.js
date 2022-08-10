const hackerIO = require("../../../io/hacker");

class CtfModel {
    constructor() {

    }

    async getHacker(id) {
        if (!isObjectID(id))
            return null;
        let result = await SchemaModels.HackerUserModel.findOne({"_id": id})
            .populate('country_id')
            .populate('country_id_residence')
            .populate('incoming_range_id')
            .populate('payment_bank_transfer_country_id')
            .populate('payment_bank_transfer_country_id_residence')
            .populate('payment_bank_transfer_currency_id')
            .populate('identity_country_id')
            .populate('skills.skills_id');
        return result;
    }


    async getHackerSubmiFlag(hacker_user_id, ctf_id, challenge_id) {
        if (!isObjectID(hacker_user_id) || !isObjectID(ctf_id) || !isObjectID(challenge_id))
            return 0;
        return SchemaModels.FlagCtfSubmitModel.find({
            "hacker_user_id": hacker_user_id
            , "ctf_id": ctf_id, "challenge_id": challenge_id
        }).countDocuments();
    }

    async submitFlag(hacker_user_id, ctf, challenge_id, flag) {
        if (!isObjectID(hacker_user_id) || !isObjectID(challenge_id))
            return 7;

        let initial_point = ctf.initial_point;
        let minimum_point = ctf.minimum_point;
        let decay = ctf.decay;

        if (!initial_point || initial_point <= 0 || !minimum_point || minimum_point <= 0 || !decay || decay <= 0) {
            return 7;
        }

        const challenge_resolved_count = await SchemaModels.FlagCtfSubmitModel
            .find({ctf_id: ctf._id, challenge_id}).countDocuments();

        let current_challenge_point = calculateChallengePoint(initial_point, minimum_point, decay, (challenge_resolved_count + 1));
        if (current_challenge_point < minimum_point) {
            current_challenge_point = minimum_point;
        }
        if (challenge_resolved_count > 0) {
            await SchemaModels.FlagCtfSubmitModel.updateMany({challenge_id}, {$set: {"point": current_challenge_point}});
        }
        await SchemaModels.FlagCtfSubmitModel.create({
            "hacker_user_id": hacker_user_id,
            "ctf_id": ctf._id,
            "challenge_id": challenge_id,
            "flag": flag,
            "point": current_challenge_point,
            "submit_date_time": getDateTime()
        });
        await SchemaModels.ChallengeModel.updateOne({_id: challenge_id}, {$set: {point: current_challenge_point}});
        if (hackerIO && hackerIO.sockets && hackerIO.to) {
            const challenges = await this.getChallengesPoint(ctf._id);
            hackerIO.to("hackers").emit('getListChallenge', challenges);
            const scoreboard = await this.getScoreboardSocket(ctf._id);
            const data = [...scoreboard.filter(d => d.rank <= 30)];
            hackerIO.sockets.forEach((socket) => {
                let me = {};
                if (socket.data && socket.data._id) {
                    me = scoreboard.find(d => d.hacker_user_id && d.hacker_user_id.toString() === socket.data._id.toString());
                    if (me) {
                        me = {rank: me.rank, point: me.point};
                    } else {
                        me = {rank: 0, point: 0};
                    }
                    hackerIO.to(socket.id).emit("getScoreBoard", {me, data});
                }
            });
        }
        // await SchemaModels.HistoryModel.create({
        //     resource_type: RESOURCE_TYPE.CHALLENGE,
        //     activity: ACTIVITY_TEXT_LOG.SUBMIT_CHALLENGE,
        //     sender_type: SENDER_TYPE.HACKER,
        //     sender_id: hacker_user_id,
        //     resource_id: challenge_id,
        //    register_date_time: getDateTime()
        // });
        return 0;
    }

    async getCtf2(ctf_id) {
        if (!isObjectID(ctf_id))
            return null;

        let where = {
            "_id": ctf_id
        };
        return SchemaModels.CTFModel.findOne(where).select('_id title start_date_time end_date_time');
    }


    async getCtf(ctf_id) {
        if (!isObjectID(ctf_id))
            return null;

        let currentDateTime = getUtcLessDateTimeFormatLess();
        let where = {
            "status": true,
            "_id": ctf_id,
            "start_date_time": {
                $lte: currentDateTime
            },
            "end_date_time": {
                $gte: currentDateTime
            }
        };
        console.log(where);
        return SchemaModels.CTFModel.findOne(where).select('_id title start_date_time end_date_time decay initial_point minimum_point');
    }

    async getChallenge(ctf_id, challenge_id) {
        if (!isObjectID(ctf_id) || !isObjectID(challenge_id))
            return null;
        let ctf = await this.getCtf(ctf_id);
        if (ctf) {
            return SchemaModels.ChallengeModel.findOne({"status": true, "ctf_id": ctf_id, "_id": challenge_id});
        } else {
            return null;
        }
    }


    async getScoreboard(ctf_id, hacker_user_id) {
        if (!isObjectID(ctf_id))
            return [];

        const result = await SchemaModels.FlagCtfSubmitModel.aggregate([
            {$match: {$and: [{"ctf_id": mongoose.Types.ObjectId(ctf_id)}]}},
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
            {
                $facet: {
                    me: [{$match: {$and: [{hacker_user_id: mongoose.Types.ObjectId(hacker_user_id)}]}},
                        {$project: {_id: 0, point: 1, rank: 1}}],
                    data: [{$limit: 30},
                        {
                            $lookup: {
                                from: 'hacker_users',
                                localField: 'hacker_user_id',
                                foreignField: '_id',
                                as: 'hacker_user'
                            }
                        },
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
                        {
                            $project: {
                                _id: 0,
                                hacker_user_id: 1,
                                point: 1,
                                submit_date_time: 1,
                                username: "$hacker_user.username",
                                rank: 1,
                                challenge_ids: 1,
                                country_code: "$hacker_user.country_id.code",
                                country_title: "$hacker_user.country_id.title"
                            }
                        }]
                }
            }]).exec();
        const challenges = await SchemaModels.ChallengeModel.find({ctf_id}, {name: 1}).lean();

        result[0].data.forEach(item => {
            item.user_challenges = challenges.map(challenge => {
                return {
                    challenge_name: challenge.name,
                    is_pass: item.challenge_ids.find(d => d == challenge._id.toString()) ? 1 : 0
                };
            })
        });
        return {data: result[0].data, me: result[0].me[0]};
    }

    async getListCtf() {
        return await SchemaModels.CTFModel.find({}).select('_id title start_date_time end_date_time');
    }


    async getListChallenge(hacker_user_id, ctf_id) {
        let where = {
            "status": true,
            "ctf_id": ctf_id
        };
        let rows = await SchemaModels.ChallengeModel.find(where).select('_id name level_id point coin link category_id description')
            .sort([['level_id', 1]])
            .populate('ctf_id', '_id title start_date_time end_date_time');
        let rows2 = [];
        for (let row of rows) {
            let isPass = await this.getHackerSubmiFlag(hacker_user_id, ctf_id, row._id);
            let row2 = row.toObject();
            row2.is_pass = isPass;
            rows2.push(row2);
        }
        return rows2;
    }

    async getChallengesPoint(ctf_id) {
        return await SchemaModels.ChallengeModel.find({status: true, ctf_id}).select('_id point');
    }

    async getScoreboardSocket(ctf_id) {
        if (!isObjectID(ctf_id))
            return [];

        const result = await SchemaModels.FlagCtfSubmitModel.aggregate([
            {$match: {$and: [{"ctf_id": mongoose.Types.ObjectId(ctf_id)}]}},
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
            }, {$lookup: {from: 'hacker_users', localField: 'hacker_user_id', foreignField: '_id', as: 'hacker_user'}},
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
            {
                $project: {
                    _id: 0,
                    hacker_user_id: 1,
                    point: 1,
                    submit_date_time: 1,
                    username: "$hacker_user.username",
                    rank: 1,
                    challenge_ids: 1,
                    country_code: "$hacker_user.country_id.code",
                    country_title: "$hacker_user.country_id.title"
                }
            }
        ]).exec();
        const challenges = await SchemaModels.ChallengeModel.find({ctf_id}, {name: 1}).lean();
        result.filter((it, index) => index < 30).forEach(item => {
            item.user_challenges = challenges.map(challenge => {
                return {
                    challenge_name: challenge.name,
                    is_pass: item.challenge_ids.find(d => d == challenge._id.toString()) ? 1 : 0
                };
            })
        });
        return result;
    }

}

module.exports = new CtfModel();