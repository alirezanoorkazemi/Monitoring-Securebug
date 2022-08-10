const {hasValue, setPaginationResponse} = require('../../../../libs/methode.helper');
const {ErrorHelper} = require('../../../../libs/error.helper');
const {STATIC_VARIABLES} = require('../../../../libs/enum.helper');

class SkillModel {
    constructor() {
        this.collection = SchemaModels.SkillsModel;
    }

    async gets(data) {
        const filters = [];
        if (hasValue(data.title)) {
            filters.push({title: {$regex: ".*" + data.title + ".*", $options: "i"}});
        }
        const skills = await this.collection.aggregate([
            ...(filters.length > 0 ? [{$match: {$and: filters}}] : []),
            {
                $facet: {
                    total_count: [{$count: "count"}],
                    rows: [{$sort: {"title": 1}}, {$skip: (data.page - 1) * data.limit}, {$limit: data.limit},
                        {
                            $project: {
                                _id: 1,
                                title: 1,
                                status: 1
                            }
                        }]
                }
            }
        ]);
        return setPaginationResponse(skills, data.limit, data.page);
    }

    async create(data) {
        await this.checkTitleExists(null, data.title);
        return await this.collection.create({title: data.title, status: data.status});
    }

    async update(data) {
        await this.checkTitleExists(data.id, data.skill.title);
        const skill = await this.collection.findOneAndUpdate({_id: data.id},
            {$set:{title: data.skill.title, status: data.skill.status}},{new:true});
        if (!skill) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_RESOURCE_FOUND, "skill");
        }
        return skill;
    }

    async delete(id) {
        const skill = await this.collection.findOne({_id: id});
        if (!skill) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_RESOURCE_FOUND, "skill");
        }
        const is_skill_use_in_hacker = await SchemaModels.HackerUserModel.findOne({
            $or: [
                {"skills.skills_id": id}
            ]
        });
        if (is_skill_use_in_hacker) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.CUSTOM, "skill used in hacker");
        }
        await this.collection.deleteOne({_id: id});
    }

    async selectList() {
        const skills = await this.collection.find({status: true}).select({_id: 1, title: 1}).lean();
        return skills.map(d => {
            return {title: d.title, value: d._id}
        })
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

}

module.exports = new SkillModel();