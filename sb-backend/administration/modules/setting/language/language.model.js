const {hasValue, setPaginationResponse} = require('../../../../libs/methode.helper');
const {ErrorHelper} = require('../../../../libs/error.helper');
const {STATIC_VARIABLES} = require('../../../../libs/enum.helper');

class LanguageModel {
    constructor() {
        this.collection = SchemaModels.LanguageModel;
    }

    async gets(data) {
        const filters = [];
        if (hasValue(data.title)) {
            filters.push({title: {$regex: ".*" + data.title + ".*", $options: "i"}});
        }
        const languages = await this.collection.aggregate([
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
        return setPaginationResponse(languages, data.limit, data.page);
    }

    async create(data) {
        await this.checkTitleExists(null,data.title);
        return await this.collection.create({title: data.title, status: data.status});
    }

    async update(data) {
        await this.checkTitleExists(data.id,data.language.title);
        const language = await this.collection.findOneAndUpdate({_id: data.id},
            {$set:{title: data.language.title, status: data.language.status}},{new:true});
        if (!language) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_RESOURCE_FOUND, "language");
        }
        return language;
    }

    async delete(id) {
        const language = await this.collection.findOne({_id: id});
        if (!language) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_RESOURCE_FOUND, "language");
        }
        const is_language_use_in_program = await SchemaModels.ProgramModel.findOne({
            $or: [
                {"targets.language_id": id}
            ]
        });
        if (is_language_use_in_program) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.CUSTOM, "language used in program");
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

module.exports = new LanguageModel();