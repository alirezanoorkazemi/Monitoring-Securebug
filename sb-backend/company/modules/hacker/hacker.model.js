class CompanyHackerModel
{
    constructor()
    {
        this.collection = SchemaModels.HackerUserModel;
    }


    async getHacker(hacker_id) {
        if (!isObjectID(hacker_id))
            return null;
        let row = await this.collection.findOne({"is_verify":true,"status":true,"_id":hacker_id})
        .select('_id fn ln competency_profile username avatar_file sb_coin reputaion point')
        .populate('country_id')
        .populate('incoming_range_id')
        ;
        if(row)
        {
            let row2 = row.toObject();
            let sb_coin = isUndefined(row2.sb_coin) ? 0 : row2.sb_coin;
            let reputaion = isUndefined(row2.reputaion) ? 0 : row2.reputaion;    
            let Reports = await this.getCountReport(hacker_id);
            row2.submit_reports = Reports;
            row2.privilage =  (sb_coin + reputaion);
           row2.rank = setHackerRank(row2.rank);
            return row2;    
        }
        else
        {
            return null;
        }
    }


    async getCountReport(hacker_id) {
       let L = await SchemaModels.SubmitReportModel.find({"hacker_user_id":hacker_id,"status":{$in:[4,7]},"severity":1}).countDocuments();     
       let M = await SchemaModels.SubmitReportModel.find({"hacker_user_id":hacker_id,"status":{$in:[4,7]},"severity":2}).countDocuments();     
       let H = await SchemaModels.SubmitReportModel.find({"hacker_user_id":hacker_id,"status":{$in:[4,7]},"severity":3}).countDocuments();     
       let C = await SchemaModels.SubmitReportModel.find({"hacker_user_id":hacker_id,"status":{$in:[4,7]},"severity":4}).countDocuments();     
       let ret = {
            "L" : L || 0,
            "M" : M || 0,
            "H" : H || 0,
            "C" : C || 0
        };
        return ret;
    }

    async getHackersAcceptedInviteProgram(user_id,program_id) {
        return await SchemaModels.ProgramInviteModel.find({
          $and: [{"company_user_id": user_id},
              {"program_id": program_id},
              {$or: [{"status_invite": INVITE_HACKER_STATUS.ACCEPT},{"status_invite": INVITE_HACKER_STATUS.PENDING}]}]
        }).select({"_id":0,"hacker_user_id":1});
    }


    async getHackerList(username,competency,is_blue,fieldSort,sortSort,program_id,company_user_id,champion) {
        if (!isObjectID(company_user_id) || !isObjectID(program_id))
            return 1;
        
            const program = await SchemaModels.ProgramModel.findOne({"company_user_id":company_user_id,"_id":program_id});

        if (!program) {
            return 1; 
        }

        if (program.is_next_generation !== PROGRAM_BOUNTY_TYPE.BUG_BOUNTY){
            return 2;
        }
 
     const acceptedInviteHacker =  await this.getHackersAcceptedInviteProgram(company_user_id,program_id);
        let showPerPage = 12;
        let ret = {};
        ret.current_page = gPage;
        const filter = [{tag:{$ne:HACKER_TAGS.INTERNAL_USER } }];
        filter.push({is_verify:true});
        filter.push({status:true});
        filter.push({_id:{$nin:acceptedInviteHacker.map(d => d.hacker_user_id)}});
        if(username){
            filter.push({ username : {$regex: '.*' + username + '.*', "$options": "i"}});
        }
        if (is_blue != ''){
            is_blue = toNumber(is_blue);
            if(is_blue == 1) {
                is_blue = true;
               // filter.push({$or : [{identity_passport_file_status: 1},
               //         {identity_card_file_status: 1}, {identity_driver_file_status: 1}]});
            } else  {
                is_blue = false;
                // filter.push({identity_passport_file_status: {$ne : 1}},
                //     {identity_card_file_status: {$ne : 1}},{identity_driver_file_status: {$ne : 1}});
            }
        } else {
            is_blue = undefined;
        }
        if (competency > 0 && competency <= 3) {
            filter.push({competency_profile: competency});
        }
        const result = await this.collection.aggregate([
            {$match:{$and: filter}},
            {$addFields:{ privilage:{$add:[{$ifNull:["$reputaion",0]},{$ifNull:["$sb_coin",0]}]}}},
            ...(toNumber(champion) === 1 ? [  {$addFields: {has_tag: {$cond: [{$in: [toNumber(champion), {$ifNull: ["$tag", []]}]}, true, false]}}},
                {$match: {$expr: {$eq: ["$has_tag", true]}}}] : []),
            ...(is_blue === undefined ? [] : [{
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
                {$match: {$expr: {$eq: ["$is_user_verify", is_blue]}}}]),
            {$facet:{
                    total_count: [{$count: "count"}],
                rows: [
                    {$sort: {[fieldSort]: sortSort}},{$skip: (ret.current_page - 1) * showPerPage}, {$limit: showPerPage},
                    { $lookup: {from: 'countries', localField: 'country_id', foreignField: '_id', as: 'country'} },
                    {$unwind: {path:"$country", preserveNullAndEmptyArrays: true }},
                    {
                        $lookup: {
                            from: 'submit_reports',
                            let: {id:'$_id'},
                            pipeline: [
                                {$match:{$expr:{$and : [ { $eq: [ "$hacker_user_id", "$$id"] },
                                                {$in: ["$status", [4,7] ]}
                                            ] }}},
                                {
                                    $group:
                                        {
                                            _id: null,
                                            L: {
                                                $sum: {
                                                    $cond: [ {$and : [  { $eq: [ "$severity",1] }] },   1,  0 ]
                                                }
                                            },
                                            M: {
                                                $sum: {
                                                    $cond: [ {$and : [  { $eq: [ "$severity",2] }] },   1,  0 ]
                                                }
                                            },
                                            H: {
                                                $sum: {
                                                    $cond: [ {$and : [  { $eq: [ "$severity",3] }] },   1,  0 ]
                                                }
                                            },
                                            C: {
                                                $sum: {
                                                    $cond: [ {$and : [  { $eq: [ "$severity",4] }] },   1,  0 ]
                                                }
                                            }
                                        }
                                }
                            ],
                            as: 'submit_reports',
                        }
                    },
                    {$unwind: {path:"$submit_reports", preserveNullAndEmptyArrays: true }},
                    {
                        $project: {
                            _id: 0,
                            submit_reports: {
                                L:{$ifNull:["$submit_reports.L",0]},
                                M:{$ifNull:["$submit_reports.M",0]},
                                H:{$ifNull:["$submit_reports.H",0]},
                                C:{$ifNull:["$submit_reports.C",0]}
                            },
                            privilage: 1,
                            hacker_id: "$_id",
                            competency_profile: 1,
                            fn: 1,
                            ln: 1,
                            tag: 1,
                            sb_coin: 1,
                            reputaion: 1,
                            point:1,
                            avatar_file:1,
                            username:1,
                            country:1,
                            rank:1,
                            is_blue: {
                                $sum: {
                                    $cond:
                                        {
                                            if: {
                                                $or: [{$eq: ["$identity_passport_file_status", 1]}
                                                    , {$eq: ["$identity_card_file_status", 1]}
                                                    , {$eq: ["$identity_driver_file_status", 1]}]
                                            }, then: 1, else: 0
                                        }
                                }
                            }
                        }
                    }
                ]
                }}
        ]);
        if (result && result[0] && result[0].total_count[0] && result[0].total_count[0].count > 0){
            ret.totalRows = result[0].total_count[0].count;
            ret.totalPage = Math.ceil(ret.totalRows / showPerPage);
            ret.rows = result[0].rows;
        } else {
            ret.totalRows = 0;
            ret.totalPage = 0;
            ret.rows = [];
        }
        return ret;
    }

    async getTopHacker() {
        return  await this.collection.aggregate([
            {$match:{$and: [{is_verify:true},{status:true},{tag:{$ne:HACKER_TAGS.INTERNAL_USER } }]}},
                        {$sort: {rank: 1}}, {$limit: 20},
            {$addFields:{
                privilage:{$add:[{$ifNull:["$reputaion",0]},{$ifNull:["$sb_coin",0]}]},
                    is_blue:{
                        $cond: [{
                            $and: [
                                {$eq: ["$identity_passport_file_status", HACKER_IDENTITY_STATUS.APPROVED]},
                                {$gt: ["$country_id", null]}, {$ne: ["$country_id", '']}, {$ne: ["$country_id", {}]},
                                {$gt: ["$incoming_range_id", null]}, {$ne: ["$incoming_range_id", '']}, {$ne: ["$incoming_range_id", {}]},
                                {$gt: ["$address1", null]}, {$ne: ["$address1", '']}, {$gte: ["$competency_profile", 1]}, {$gte: [{$size: "$skills"}, 1]},
                                {$or: [{$eq: ["$identity_card_file_status", HACKER_IDENTITY_STATUS.APPROVED]}, {$eq: ["$identity_driver_file_status", HACKER_IDENTITY_STATUS.APPROVED]}]},
                            ]
                        }, true, false]
                    }
            }},
                        { $lookup: {from: 'countries', localField: 'country_id', foreignField: '_id', as: 'country'} },
                        {$unwind: {path:"$country", preserveNullAndEmptyArrays: true }},
                        { $lookup: {
                                from: 'submit_reports',
                                let: {id:'$_id'},
                                pipeline: [
                                    {$match:{$expr:{$and : [ { $eq: [ "$hacker_user_id", "$$id"] },
                                                    {$in: ["$status", [4,7] ]}
                                                ] }}},
                                    {
                                        $group:
                                            {
                                                _id: null,
                                                L: {
                                                    $sum: {
                                                        $cond: [ {$and : [  { $eq: [ "$severity",1] }] },   1,  0 ]
                                                    }
                                                },
                                                M: {
                                                    $sum: {
                                                        $cond: [ {$and : [  { $eq: [ "$severity",2] }] },   1,  0 ]
                                                    }
                                                },
                                                H: {
                                                    $sum: {
                                                        $cond: [ {$and : [  { $eq: [ "$severity",3] }] },   1,  0 ]
                                                    }
                                                },
                                                C: {
                                                    $sum: {
                                                        $cond: [ {$and : [  { $eq: [ "$severity",4] }] },   1,  0 ]
                                                    }
                                                }
                                            }
                                    }
                                ],
                                as: 'submit_reports',
                            } },
                        {$unwind: {path:"$submit_reports", preserveNullAndEmptyArrays: true }},
                        {  $project: {
                                _id: 0,
                                submit_reports: {
                                    L:{$ifNull:["$submit_reports.L",0]},
                                    M:{$ifNull:["$submit_reports.M",0]},
                                    H:{$ifNull:["$submit_reports.H",0]},
                                    C:{$ifNull:["$submit_reports.C",0]}
                                },
                                privilage: 1,
                                hacker_id: "$_id",
                                competency_profile: 1,
                                fn: 1,
                                ln: 1,
                                tag: 1,
                                sb_coin: 1,
                                reputaion: 1,
                                point:1,
                                avatar_file:1,
                                username:1,
                                country:1,
                                rank:1,
                                is_blue: "$is_blue"
                            }}
        ]);
    }
}

module.exports = new CompanyHackerModel();