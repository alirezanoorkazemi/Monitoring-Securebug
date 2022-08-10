const user_validations = require('./modules/user/user.validation');
const company_validations = require('./modules/company/company.validation');
const hacker_validations = require('./modules/hacker/hacker.validation');
const program_validations = require('./modules/program/program.validation');
const report_validations = require('./modules/report/report.validation');
const ctf_validations = require('./modules/setting/ctf/ctf.validation');
const country_validations = require('./modules/setting/country/country.validation');
const language_validations = require('./modules/setting/language/language.validation');
const currency_validations = require('./modules/setting/currency/currency.validation');
const range_validations = require('./modules/setting/range/range.validation');
const skill_validations = require('./modules/setting/skill/skill.validation');
const target_type_validations = require('./modules/setting/target_type/target_type.validation');
const setting_validations = require('./modules/setting/setting.validation');

const getSchemaFromUserMethods = (validation_type) => {
    const static_name = "user_";
    switch (validation_type) {
        case `${static_name}login`:
            return user_validations.login();
        case `${static_name}refresh-token`:
            return user_validations.refreshToken();
        case `${static_name}create`:
            return user_validations.create();
        case `${static_name}profile`:
            return user_validations.profile();
        case `${static_name}update`:
            return user_validations.update();
        case `${static_name}delete`:
            return user_validations.delete();
        case `${static_name}select-list`:
            return user_validations.selectList();
        case `${static_name}gets`:
            return user_validations.gets();
        case `${static_name}get-notifications`:
            return user_validations.getNotifications();
        case `${static_name}update-notification-status`:
            return user_validations.updateNotificationStatus();
        case `${static_name}create-notification`:
            return user_validations.createNotifications();
    }
};

const getSchemaFromProgramMethods = (validation_type) => {
    const static_name = "program_";
    switch (validation_type) {
        case `${static_name}gets`:
            return program_validations.gets();
        case `${static_name}get`:
            return program_validations.get();
        case `${static_name}get-history`:
            return program_validations.gethistory();
        case `${static_name}update`:
            return program_validations.update();
        case `${static_name}delete`:
            return program_validations.delete();
        case `${static_name}create-target`:
            return program_validations.createTarget();
        case `${static_name}update-target`:
            return program_validations.updateTarget();
        case `${static_name}delete-target`:
            return program_validations.deleteTarget();
        case `${static_name}create-reward`:
            return program_validations.createReward();
        case `${static_name}create-reward-for-all-targets`:
            return program_validations.createRewardForAllTargets();
        case `${static_name}update-reward`:
            return program_validations.updateReward();
        case `${static_name}delete-reward`:
            return program_validations.deleteReward();
        case `${static_name}create-policy`:
            return program_validations.createPolicy();
        case `${static_name}create-policy-for-all-targets`:
            return program_validations.createPolicyForAllTargets();
        case `${static_name}update-policy`:
            return program_validations.updatePolicy();
        case `${static_name}delete-policy`:
            return program_validations.deletePolicy();
        case `${static_name}change-verify`:
            return program_validations.changeVerify();
        case `${static_name}change-status`:
            return program_validations.changeStatus();
        case `${static_name}change-program-type`:
            return program_validations.changeProgramType();
        case `${static_name}change-program-bounty-type`:
            return program_validations.changeProgramBountyType();
        case `${static_name}change-product-type`:
            return program_validations.changeProductType();
        case `${static_name}set-expire-day`:
            return program_validations.setExpireDay();
        case `${static_name}update-maximum-reward`:
            return program_validations.updateMaximumReward();
        case `${static_name}get-moderators`:
            return program_validations.getModerators();
        case `${static_name}delete-moderator`:
            return program_validations.deleteModerator();
        case `${static_name}get-hackers`:
            return program_validations.getHackers();
        case `${static_name}add-hackers`:
            return program_validations.addHackers();
        case `${static_name}delete-hacker`:
            return program_validations.deleteHacker();
        case `${static_name}assign-moderator`:
            return program_validations.assignModerator();
        case `${static_name}update-assigned-moderator`:
            return program_validations.updateAssignedModerator();
        case `${static_name}budgeting`:
            return program_validations.budgeting();
        }
};

const getSchemaFromHackerMethods = (validation_type) => {
    const static_name = "hacker_";
    switch (validation_type) {
        case `${static_name}gets`:
            return hacker_validations.gets();
        case `${static_name}disable-2fa`:
            return hacker_validations.disabled2FA();
        case `${static_name}change-status`:
            return hacker_validations.changeStatus();
        case `${static_name}change-verify`:
            return hacker_validations.changeVerify();
        case `${static_name}change-account-activity`:
            return hacker_validations.changeActivity();
        case `${static_name}add-coin`:
            return hacker_validations.addCoin();
        case `${static_name}change-password`:
            return hacker_validations.changePassword();
        case `${static_name}change-identity-status`:
            return hacker_validations.changeIdentityStatus();
        case `${static_name}get-payments`:
            return hacker_validations.getPayments();
        case `${static_name}change-payment-status`:
            return hacker_validations.changePaymentStatus();
        case `${static_name}get`:
            return hacker_validations.get();
        case `${static_name}update`:
            return hacker_validations.update();
        case `${static_name}delete`:
            return hacker_validations.delete();
        case `${static_name}assign-tag`:
            return hacker_validations.assignTag();
        case `${static_name}upload-avatar`:
            return hacker_validations.uploadAvatar();
        case `${static_name}delete-avatar`:
            return hacker_validations.deleteAvatar();
    }
};

const getSchemaFromCompanyMethods = (validation_type) => {
    const static_name = "company_";
    switch (validation_type) {
        case `${static_name}gets`:
            return company_validations.gets();
        case `${static_name}get-dashboard`:
            return company_validations.getDashboard();
        case `${static_name}get-charts`:
            return company_validations.getChart();
        case `${static_name}get-payments`:
            return company_validations.getPayments();
        case `${static_name}get-programs`:
            return company_validations.getPrograms();
        case `${static_name}change-activity-member`:
            return company_validations.changeActivityMember();
        case `${static_name}disable-2fa`:
            return company_validations.disabled2FA();
        case `${static_name}get`:
            return company_validations.get();
        case `${static_name}change-status`:
            return company_validations.changeStatus();
        case `${static_name}change-verify`:
            return company_validations.changeVerify();
        case `${static_name}change-password`:
            return company_validations.changePassword();
        case `${static_name}change-account-activity`:
            return company_validations.changeActivity();
        case `${static_name}change-admin-verify`:
            return company_validations.changeVerifyByAdmin();
        case `${static_name}get-members`:
            return company_validations.getMembers();
        case `${static_name}add-member`:
            return company_validations.addMember();
        case `${static_name}update-member`:
            return company_validations.updateMember();
        case `${static_name}delete-member`:
            return company_validations.deleteMember();
        case `${static_name}change-is-fully-manage`:
            return company_validations.changeIsFullyManage();
        case `${static_name}update`:
            return company_validations.update();
        case `${static_name}delete`:
            return company_validations.delete();
        case `${static_name}upload-avatar`:
            return company_validations.uploadAvatar();
        case `${static_name}delete-avatar`:
            return company_validations.deleteAvatar();
    }
};

const getSchemaFromReportMethods = (validation_type) => {
    const static_name = "report_";
    switch (validation_type) {
        case `${static_name}gets`:
            return report_validations.gets();
        case `${static_name}get`:
            return report_validations.get();
        case `${static_name}update`:
            return report_validations.update();
        case `${static_name}delete`:
            return report_validations.delete();
        case `${static_name}change-status`:
            return report_validations.changeStatus();
        case `${static_name}change-severity`:
            return report_validations.changeSeverity();
        case `${static_name}change-activity`:
            return report_validations.changeActivity();
        case `${static_name}get-comments`:
            return report_validations.getComments();
        case `${static_name}add-comment`:
            return report_validations.addComment();
        case `${static_name}delete-comment`:
            return report_validations.deleteComment();
        case `${static_name}pay-price`:
            return report_validations.payPrice();
        case `${static_name}reference-id`:
            return report_validations.setReferenceId();
    }
};

const getSchemaFromSettingMethods = (validation_type) => {
    const static_name = "setting_";
    switch (validation_type) {
        case `${static_name}update`:
            return setting_validations.update();
    }
};

const getSchemaFromCtfMethods = (validation_type) => {
    const static_name = "ctf_";
    switch (validation_type) {
        case `${static_name}gets`:
            return ctf_validations.gets();
        case `${static_name}create`:
            return ctf_validations.create();
        case `${static_name}add-challenge`:
            return ctf_validations.createChallenge();
        case `${static_name}update-challenge`:
            return ctf_validations.updateChallenge();
        case `${static_name}delete-challenge`:
            return ctf_validations.deleteChallenge();
        case `${static_name}get-challenges`:
            return ctf_validations.getChallenges();
        case `${static_name}set-challenge-coins`:
            return ctf_validations.setChallengeCoins();
        case `${static_name}get-statistic`:
            return ctf_validations.getStatistic();
        case `${static_name}update`:
            return ctf_validations.update();
        case `${static_name}delete`:
            return ctf_validations.delete();
    }
};

const getSchemaFromCountryMethods = (validation_type) => {
    const static_name = "country_";
    switch (validation_type) {
        case `${static_name}gets`:
            return country_validations.gets();
        case `${static_name}create`:
            return country_validations.create();
        case `${static_name}update`:
            return country_validations.update();
        case `${static_name}delete`:
            return country_validations.delete();
    }
};

const getSchemaFromLanguageMethods = (validation_type) => {
    const static_name = "language_";
    switch (validation_type) {
        case `${static_name}gets`:
            return language_validations.gets();
        case `${static_name}create`:
            return language_validations.create();
        case `${static_name}update`:
            return language_validations.update();
        case `${static_name}delete`:
            return language_validations.delete();
    }
};

const getSchemaFromCurrencyMethods = (validation_type) => {
    const static_name = "currency_";
    switch (validation_type) {
        case `${static_name}gets`:
            return currency_validations.gets();
        case `${static_name}create`:
            return currency_validations.create();
        case `${static_name}update`:
            return currency_validations.update();
        case `${static_name}delete`:
            return currency_validations.delete();
    }
};

const getSchemaFromRangeMethods = (validation_type) => {
    const static_name = "range_";
    switch (validation_type) {
        case `${static_name}gets`:
            return range_validations.gets();
        case `${static_name}create`:
            return range_validations.create();
        case `${static_name}update`:
            return range_validations.update();
        case `${static_name}delete`:
            return range_validations.delete();
    }
};

const getSchemaFromTargetTypeMethods = (validation_type) => {
    const static_name = "target-type_";
    switch (validation_type) {
        case `${static_name}gets`:
            return target_type_validations.gets();
        case `${static_name}create`:
            return target_type_validations.create();
        case `${static_name}update`:
            return target_type_validations.update();
        case `${static_name}delete`:
            return target_type_validations.delete();
    }
};

const getSchemaFromSkillMethods = (validation_type) => {
    const static_name = "skill_";
    switch (validation_type) {
        case `${static_name}gets`:
            return skill_validations.gets();
        case `${static_name}create`:
            return skill_validations.create();
        case `${static_name}update`:
            return skill_validations.update();
        case `${static_name}delete`:
            return skill_validations.delete();
    }
};

const handleValidationErrors = async (schema, req, res, next) => {
    for (let i = 0; i < schema.length; i++) {
        const error_schema = await schema[i].run(req);
        const error = error_schema.errors[0];
        if (error) {
            return res.json(error.msg);
        }
    }
    next()
};

const getValidationSchema = (validation_type) => {
    switch (validation_type.substr(0, validation_type.indexOf('_'))) {
        case 'user':
            return getSchemaFromUserMethods(validation_type);
        case 'company':
            return getSchemaFromCompanyMethods(validation_type);
        case 'hacker':
            return getSchemaFromHackerMethods(validation_type);
        case 'program':
            return getSchemaFromProgramMethods(validation_type);
        case 'report':
            return getSchemaFromReportMethods(validation_type);
        case 'ctf':
            return getSchemaFromCtfMethods(validation_type);
        case 'country':
            return getSchemaFromCountryMethods(validation_type);
        case 'currency':
            return getSchemaFromCurrencyMethods(validation_type);
        case 'range':
            return getSchemaFromRangeMethods(validation_type);
        case 'target-type':
            return getSchemaFromTargetTypeMethods(validation_type);
        case 'skill':
            return getSchemaFromSkillMethods(validation_type);
        case 'language':
            return getSchemaFromLanguageMethods(validation_type);
        case 'setting':
            return getSchemaFromSettingMethods(validation_type);

    }
};

const checkValidations = (validation_type) => {
    const validation_schema = getValidationSchema(validation_type);
    return async (req, res, next) => {
        await handleValidationErrors(validation_schema, req, res, next);
    };
};

module.exports = checkValidations;