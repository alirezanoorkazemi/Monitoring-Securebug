class FrontendModel
{
    constructor()
    {
    }

    async register(email) {
        let i = SchemaModels.EmailSubscriptionModel({
            "email":email,
            "register_date_time" : getDateTime()
        });
        let r = await i.save();
        return 1;
    }

    async checkEmail(email) {
        return SchemaModels.EmailSubscriptionModel.findOne({email: {$regex:  `^${email}$`, "$options": "i"}}).countDocuments();
    }


    async getListSkills() {
        return await SchemaModels.SkillsModel.find({"status":true}).select({"__v":0});
    }

    async getListCountries() {
        return await SchemaModels.CountryModel.find({"status":true}).select({"__v":0});
    }

    async getListRange() {
        return await SchemaModels.RangeModel.find({"status":true}).select({"__v":0});
    }

    async getListCurrency() {
        return await SchemaModels.CurrencyModel.find({"status":true}).select({"__v":0});
    }

    async getListLang() {
        return await SchemaModels.LanguageModel.find({"status":true}).select({"__v":0});
    }

    async getListTypeTest() {
        return await SchemaModels.TypeTestModel.find({"status":true}).select({"__v":0});
    }

    async getListTypeVulnerability() {
        return await SchemaModels.TypeVulnerabilityModel.find({"status":true}).select({"__v":0});
    }

    async getCtf(ctf_id) {
        if (!isObjectID(ctf_id))
            return null;
        return SchemaModels.CTFModel.findOne({"status":true,"_id":ctf_id}).select('_id title');
    }

}

module.exports = new FrontendModel();