const {hasValue, setPaginationResponse} = require('../../../../libs/methode.helper');
const {ErrorHelper} = require('../../../../libs/error.helper');
const {STATIC_VARIABLES} = require('../../../../libs/enum.helper');

class TargetTypeModel {
    constructor() {
        this.collection = SchemaModels.TypeTestModel;
    }

    async gets(data) {
        const filters = [];
        if (hasValue(data.title)) {
            filters.push({title: {$regex: ".*" + data.title + ".*", $options: "i"}});
        }
        const target_types = await this.collection.aggregate([
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
        return setPaginationResponse(target_types, data.limit, data.page);
    }

    async create(data) {
        await this.checkTitleExists(null, data.title);
        return await this.collection.create({title: data.title, status: data.status});
    }

    async update(data) {
        await this.checkTitleExists(data.id, data.target_type.title);
        const target_type = await this.collection.findOneAndUpdate({_id: data.id},
            {$set:{title: data.target_type.title, status: data.target_type.status}},{new:true});
        if (!target_type) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_RESOURCE_FOUND, "target_type");
        }
        return target_type;
    }

    async delete(id) {
        const target_type = await this.collection.findOne({_id: id});
        if (!target_type) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_RESOURCE_FOUND, "target_type");
        }
        const is_target_type_use_in_program = await SchemaModels.ProgramModel.findOne({
            $or: [
                {"targets.target_type_id": id}
            ]
        });
        if (is_target_type_use_in_program) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.CUSTOM, "target_type used in program");
        }
        await this.collection.deleteOne({_id: id});
    }

    async selectList() {
        const currencies = await this.collection.find({status: true}).select({_id: 1, title: 1}).lean();
        return currencies.map(d => {
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

module.exports = new TargetTypeModel();