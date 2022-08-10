const {hasValue, setPaginationResponse} = require('../../../../libs/methode.helper');
const {ErrorHelper} = require('../../../../libs/error.helper');
const {STATIC_VARIABLES} = require('../../../../libs/enum.helper');

class RangeModel {
    constructor() {
        this.collection = SchemaModels.RangeModel;
    }

    async gets(data) {
        const filters = [];
        if (hasValue(data.title)) {
            filters.push({title: {$regex: ".*" + data.title + ".*", $options: "i"}});
        }
        const ranges = await this.collection.aggregate([
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
        return setPaginationResponse(ranges, data.limit, data.page);
    }

    async create(data) {
        await this.checkTitleExists(null, data.title);
        return await this.collection.create({title: data.title, status: data.status});
    }

    async update(data) {
        await this.checkTitleExists(data.id, data.range.title);
        const range = await this.collection.findOneAndUpdate({_id: data.id},
            {$set:{title: data.range.title, status: data.range.status}},{new:true});
        if (!range) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_RESOURCE_FOUND, "range");
        }
        return range;
    }

    async delete(id) {
        const range = await this.collection.findOne({_id: id});
        if (!range) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_RESOURCE_FOUND, "range");
        }
        const is_range_use_in_hacker = await SchemaModels.HackerUserModel.findOne({
            $or: [
                {incoming_range_id: id}
            ]
        });
        if (is_range_use_in_hacker) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.CUSTOM, "range used in hacker");
        }
        await this.collection.deleteOne({_id: id});
    }

    async selectList() {
        const ranges = await this.collection.find({status: true}).select({_id: 1, title: 1}).lean();
        return ranges.map(d => {
            return {title: d.title, id: d._id}
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

module.exports = new RangeModel();