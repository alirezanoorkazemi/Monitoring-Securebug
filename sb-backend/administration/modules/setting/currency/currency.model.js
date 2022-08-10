const {hasValue, setPaginationResponse} = require('../../../../libs/methode.helper');
const {ErrorHelper} = require('../../../../libs/error.helper');
const {STATIC_VARIABLES} = require('../../../../libs/enum.helper');

class CurrencyModel {
    constructor() {
        this.collection = SchemaModels.CurrencyModel;
    }

    async gets(data) {
        const filters = [];
        if (hasValue(data.title)) {
            filters.push({title: {$regex: ".*" + data.title + ".*", $options: "i"}});
        }
        const currencies = await this.collection.aggregate([
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
        return setPaginationResponse(currencies, data.limit, data.page);
    }

    async create(data) {
        await this.checkTitleExists(null, data.title);
        return await this.collection.create({title: data.title, status: data.status});
    }

    async update(data) {
        await this.checkTitleExists(data.id, data.currency.title);
        const currency = await this.collection.findOneAndUpdate({_id: data.id},
            {$set:{title: data.currency.title, status: data.currency.status}},{new:true});
        if (!currency) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_RESOURCE_FOUND, "currency");
        }
        return currency;
    }

    async delete(id) {
        const currency = await this.collection.findOne({_id: id});
        if (!currency) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_RESOURCE_FOUND, "currency");
        }
        const is_currency_use_in_hacker = await SchemaModels.HackerUserModel.findOne({
            $or: [
                {payment_bank_transfer_currency_id: id}
            ]
        });
        if (is_currency_use_in_hacker) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.CUSTOM, "currency used in hacker");
        }
        const is_currency_use_in_company = await SchemaModels.CompanyUserModel.findOne({
            $or: [
                {credit_currency_id: id}
            ]
        });
        if (is_currency_use_in_company) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.CUSTOM, "currency used in company");
        }
        const is_currency_use_in_program = await SchemaModels.ProgramModel.findOne({
            $or: [
                {"rewards.currency_id": id}
            ]
        });
        if (is_currency_use_in_program) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.CUSTOM, "currency used in program");
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

module.exports = new CurrencyModel();