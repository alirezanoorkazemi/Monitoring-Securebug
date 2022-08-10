const {isArray} = require('../../../libs/methode.helper');
const {clearCatch} = require('../../../libs/token.helper');

class SettingModel {
    constructor() {
        this.collection = SchemaModels.SettingModel;
    }

    async gets() {
        const settings = await this.collection.find({}).lean();
        return isArray(settings) ? settings.map(setting => {
            return {key: setting.key, value: setting.value}
        }) : [];
    }

    async clearPredataCatch() {
        await clearCatch("type_test");
        await clearCatch('lang');
        await clearCatch('range');
        await clearCatch('currency');
        await clearCatch('countries');
        await clearCatch('skills');
        await clearCatch('type_vulnerability');
    }

    async update(data) {
        const settings = this.getKeyValueList(data);
        const setting_keys = this.getUpdatingKeys(data);
        await this.collection.deleteMany({key: {$in: setting_keys}});
        await this.collection.insertMany(settings);
    }

    getKeyValueList(data) {
        switch (data.tab) {
            case 0:
                return [
                    {key: "reciever_email", value: data["reciever_email"]},
                    {key: "reciever_sales_email", value: data["reciever_sales_email"]}
                ]
        }
    }

    getUpdatingKeys(data) {
        switch (data.tab) {
            case 0:
                return ["reciever_email", "reciever_sales_email"]
        }
    }
}

module.exports = new SettingModel();