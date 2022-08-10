const {hasValue, setPaginationResponse} = require('../../../../libs/methode.helper');
const {ErrorHelper} = require('../../../../libs/error.helper');
const {STATIC_VARIABLES} = require('../../../../libs/enum.helper');

class CountryModel {
    constructor() {
        this.collection = SchemaModels.CountryModel;
    }

    async gets(data) {
        const filters = [];
        if (hasValue(data.title)) {
            filters.push({title: {$regex: ".*" + data.title + ".*", $options: "i"}});
        }
        const countries = await this.collection.aggregate([
            ...(filters.length > 0 ? [{$match: {$and: filters}}] : []),
            {
                $facet: {
                    total_count: [{$count: "count"}],
                    rows: [{$sort: {"title": 1}}, {$skip: (data.page - 1) * data.limit}, {$limit: data.limit},
                        {
                            $project: {
                                _id: 1,
                                title: 1,
                                status: 1,
                                code: 1
                            }
                        }]
                }
            }
        ]);
        return setPaginationResponse(countries, data.limit, data.page);
    }

    async create(data) {
        await this.checkTitleAndCodeExists(null, data.title, data.code);
        return await this.collection.create({title: data.title, code: data.code, status: data.status});
    }

    async update(data) {
        await this.checkTitleAndCodeExists(data.id, data.country.title, data.country.code);
        const country = await this.collection.findOneAndUpdate({_id: data.id},
            {$set:{title: data.country.title, code: data.country.code, status: data.country.status}}
            ,{new:true});
        if (!country) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_RESOURCE_FOUND, "country");
        }
        return country;
    }

    async delete(id) {
        const country = await this.collection.findOne({_id: id});
        if (!country) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_RESOURCE_FOUND, "country");
        }
        const is_country_use_in_hacker = await SchemaModels.HackerUserModel.findOne({
            $or: [
                {country_id: id}, {country_id_residence: id}, {payment_bank_transfer_country_id: id},
                {payment_bank_transfer_country_id_residence: id}, {identity_country_id: id}
            ]
        });
        if (is_country_use_in_hacker) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.CUSTOM, "country used in hacker");
        }
        const is_country_use_in_company = await SchemaModels.CompanyUserModel.findOne({
            $or: [
                {company_country_id: id}, {invoice_address_country_id: id}
            ]
        });
        if (is_country_use_in_company) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.CUSTOM, "country used in company");
        }
        await this.collection.deleteOne({_id: id});
    }

    async selectList() {
        const countries = await this.collection.find({status: true}).select({_id: 1, title: 1, code: 1}).lean();
        return countries.map(d => {
            return {title: d.title, id: d._id, code: d.code}
        })
    }

    async checkTitleAndCodeExists(id, title, code) {
        let title_count;
        if (id) {
            title_count = await this.collection.countDocuments({_id: {$ne: id}, title});
        } else {
            title_count = await this.collection.countDocuments({title});
        }
        if (title_count > 0) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.EXIST, "title");
        }
        let code_count;
        if (id) {
            code_count = await this.collection.countDocuments({_id: {$ne: id}, code});
        } else {
            code_count = await this.collection.countDocuments({code});
        }
        if (code_count > 0) {
            throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.EXIST, "code");
        }
    }
}

module.exports = new CountryModel();