let globalIDSchema = new mongoose.Schema({
    _id: {type: String},
    value: {type: Number},
});
const GlobalIDModel = mongoose.model('global_id', globalIDSchema);

let emailSubscriptionSchema = new mongoose.Schema({
    email: {type: String, unique: true},
    register_date_time: Date
});
const EmailSubscriptionModel = mongoose.model('email_subscription_user', emailSubscriptionSchema);

let adminUserSchema = new mongoose.Schema({
    email: {type: String, unique: true},
    avatar: String,
    fn: String,
    ln: String,
    password: String,
    status: Boolean,
    last_login: {
        ip: String,
        last_date: String,
        last_time: String,
        user_agent: String,
    }
});
const AdminUserModel = mongoose.model('admin_user', adminUserSchema);

let hackerSchema = new mongoose.Schema({
    review_application:{type: Boolean, default: false},
    video_recorded_interview:{type: Boolean, default: false},
    technical_interview:{type: Boolean, default: false},
    mobile_address_verification:{type: Boolean, default: false},
    verification_of_two_references:{type: Boolean, default: false},
    contract_agreement:{type: Boolean, default: false},
    email: {type: String, unique: true},
    email_temp: String,
    activity_log: String,
    user_id: String,
    username: {type: String, unique: true},
    temp: String,
    fn: String,
    ln: String,
    password: String,
    account_is_disable: {type: Boolean, default: false},
    status: {type: Boolean, default: true},
    is_verify: {type: Boolean, default: false},
    register_date_time: Date,
    verify_date_time: Date,
    last_edit: Date,
    profile_visibility: {type: Boolean, default: true},
    about: String,
    github_url: String,
    twitter_url: String,
    linkedin_url: String,
    website_url: String,
    last_login: {
        ip: String,
        last_date: String,
        last_time: String,
        user_agent: String,
    },
    country_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'country'
    },
    country_id_residence: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'country'
    },
    incoming_range_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'range'
    },
    address1: String,
    address2: String,
    city: String,
    region: String,
    postal_code: String,
    skills: [
        {
            skills_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'skill'
            },
            proficiency: {type: Number}
        }
    ],
    cve_file: String,
    cve_file_original_name: String,
    invitation: {type: Boolean, default: true},
    payment_default: Number,
    payment_paypal_email: String,
    payment_usdt_public_key: String,
    tax_file: String,
    avatar_file: String,
    payment_bank_transfer_type: Number,
    payment_bank_transfer_account_holder: String,
    payment_bank_transfer_iban: String,
    payment_bank_transfer_bic: String,
    payment_bank_transfer_country_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'country'
    },
    payment_bank_transfer_country_id_residence: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'country'
    },
    payment_bank_transfer_currency_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'currency'
    },
    identity_country_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'country'
    },
    identity_passport_file: String,
    identity_passport_file_status: Number,
    identity_card_file: String,
    identity_card_file_status: Number,
    identity_driver_file: String,
    identity_driver_file_status: Number,
    competency_profile: Number,
    certificate_files: [
        {
            file_name: String,
            file_name_original_name: String
        }
    ],
    sb_coin: Number,
    rank: Number,
    coin_log: [],
    reputaion: Number,
    reputaion_log: [],
    point: Number,
    point_log: [],
    identity_send_email_by_admin: {type: Boolean, default: false},
    report_notification_setting: {
        new_report:{type:Number, default: 4},
        new_report_advance:{
            type: Array,
            'default': [4]
        },
        update_report:{
            type: Number,
            'default': 4
        },
        update_report_advance:{
            type: Array,
            'default': [4]
        },
        comments_by_admin:{
            type: Number,
            'default': 4
        },
        comments_by_admin_advance:{
            type: Array,
            'default': [4]
        },
        comments_by_company:{
            type: Number,
            'default': 4
        },
        comments_by_company_advance:{
            type: Array,
            'default': [4]
        },
        reward_activity:{
            type: Number,
            'default': 4
        },
        reward_activity_advance:{
            type: Array,
            'default': [4]
        }
    },
    tag: {type: Array, default: []},
    google_towfa_secret_key: {type: String, default: ''},
    google_towfa_status: {type: Number, default: 0},
});

const HackerUserModel = mongoose.model('hacker_user', hackerSchema);

let companySchema = new mongoose.Schema({
    email: {type: String, unique: true},
    account_is_disable: {type: Boolean, default: false},
    email_temp: String,
    activity_log: String,
    user_id: String,
    temp: String,
    tax_file: String,
    avatar_file: String,
    fn: String,
    ln: String,
    role: String,
    organization_name: String,
    display_name: String,
    short_introduction: String,
    about: String,
    github_url: String,
    twitter_url: String,
    linkedin_url: String,
    website_url: String,
    profile_visibility: {type: Boolean, default: true},
    password: String,
    status: {type: Boolean, default: true},
    is_verify: {type: Boolean, default: false},
    admin_verify: {type: Boolean, default: false},
    register_date_time: Date,
    verify_date_time: Date,
    last_edit_time: Date,
    last_login: {
        ip: String,
        last_date: String,
        last_time: String,
        user_agent: String,
    },
    organization_no: String,
    company_country_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'country'
    },
    address1: String,
    address2: String,
    city: String,
    region: String,
    postal_code: String,
    phone: String,
    payment_paypal_email: String,
    invoice_address_country_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'country'
    },
    invoice_address_email: String,
    invoice_address_company_name: String,
    invoice_address_address1: String,
    invoice_address_address2: String,
    invoice_address_city: String,
    invoice_address_reference: String,
    invoice_address_zip_code: String,
    credit_card_number: String,
    credit_date: String,
    credit_cvc: String,
    credit_bank_holder_name: String,
    credit_currency_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'currency'
    },
    user_level_access: {type: Number, default: 0},
    can_send_comment: {type: Boolean, default: true},
    can_see_approve: {type: Boolean, default: true},
    parent_user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'company_user'
    },
    creator_user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'moderator_user'
    },
    is_fully_manage: {type: Boolean, default: false},
    report_notification_setting: {
        new_report:{type:Number, default: 4},
        new_report_advance:{
            type: Array,
            'default': [4]
        },
        update_report:{
            type: Number,
            'default': 4
        },
        update_report_advance:{
            type: Array,
            'default': [4]
        },
        comments_by_admin:{
            type: Number,
            'default': 4
        },
        comments_by_admin_advance:{
            type: Array,
            'default': [4]
        },
        comments_by_hacker:{
            type: Number,
            'default': 4
        },
        comments_by_hacker_advance:{
            type: Array,
            'default': [4]
        },
        reward_activity:{
            type: Number,
            'default': 4
        },
        reward_activity_advance:{
            type: Array,
            'default': [4]
        }
    },
    google_towfa_secret_key: {type: String, default: ''},
    google_towfa_status: {type: Number, default: 0},
    access_program_list:[
        {
            _id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'program'
            },
            name: {type: String}
        }
    ],
});

const CompanyUserModel = mongoose.model('company_user', companySchema);

let skillsSchema = new mongoose.Schema({
    title: {type: String, unique: true},
    status: {type: Boolean, default: true}
});
const SkillsModel = mongoose.model('skill', skillsSchema);

let countrySchema = new mongoose.Schema({
    title: {type: String, unique: true},
    status: {type: Boolean, default: true},
    code: String
});
const CountryModel = mongoose.model('country', countrySchema);

let moderatorUserSchema = new mongoose.Schema({
    email: {type: String, unique: true},
    avatar: String,
    fn: String,
    ln: String,
    alias: String,
    password: String,
    creator_user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'moderator_user'
    },
    status: Boolean,
    register_date_time: Date,
    last_edit_time: Date,
    user_level_access: Number,
    last_login: {
        ip: String,
        last_date: String,
        last_time: String,
        user_agent: String,
    }
});
const ModeratorUserModel = mongoose.model('moderator_user', moderatorUserSchema);

let rangeSchema = new mongoose.Schema({
    title: {type: String, unique: true},
    status: {type: Boolean, default: true}
});
const RangeModel = mongoose.model('range', rangeSchema);

let currencySchema = new mongoose.Schema({
    title: {type: String, unique: true},
    status: {type: Boolean, default: true}
});
const CurrencyModel = mongoose.model('currency', currencySchema);

let programSchema = new mongoose.Schema({
    company_user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'company_user'
    },
    creator_user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'company_user'
    },
    approve_date_time:Date,
    moderator_users: [
        {
            assign_date_time: Date,
            moderator_user_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'moderator_user'
            },
            user_level_access: {type: Number, default: 0}
        }
    ],
    compliance1: {type: Number, default: 0},
    compliance2: {type: Number, default: 0},
    compliance3: {type: Number, default: 0},
    compliance4: {type: Number, default: 0},
    compliance5: {type: Number, default: 0},
    compliance6: {type: Number, default: 0},
    program_type: Number,
    product_type: Number,
    register_date_time: Date,
    edit_date_time: Date,
    logo_file: String,
    name: String,
    tagline: String,
    policy: String,
    status: {type: Number, default: 0},
    is_next_generation: {type: Number, default: 0},
    is_verify: {type: Boolean, default: false},
    targets: [
        {
            identifier: String,
            target_type_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'type_test'
            },
            language_id: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'language'
            }],
            maturity: {type: Number, default: 0},
        }
    ],
    maximum_reward: Number,
    launch_timeline: {type: Number, default: 0},
    rewards: [
        {
            target_id: mongoose.Schema.Types.ObjectId,
            critical_price: Number,
            high_price: Number,
            medium_price: Number,
            low_price: Number,
            none_price: Number,
            currency_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'currency'
            },
        }
    ],
    policies: [
        {
            target_id: mongoose.Schema.Types.ObjectId,
            out_of_target: String,
            item1: {type: Boolean, default: false},
            item2: {type: Boolean, default: false},
            item3: {type: Boolean, default: false},
            target_information: String,
            qualifying_vulnerabilities: String,
            non_qualifying_vulnerabilities: String,
        }
    ],

    duration_type : Number,
    hourly_price : Number,
    monthly_hours:[{
        date : Date,
        hours : Number
    }],

    expire_date_program: Date,
    start_date_program: Date,
});

const ProgramModel = mongoose.model('program', programSchema);

let typeTestSchema = new mongoose.Schema({
    title: {type: String, unique: true},
    status: {type: Boolean, default: true}
});
const TypeTestModel = mongoose.model('type_test', typeTestSchema);

let langSchema = new mongoose.Schema({
    title: {type: String, unique: true},
    status: {type: Boolean, default: true}
});
const LanguageModel = mongoose.model('language', langSchema);


let typeVulnerabilitySchema = new mongoose.Schema({
    title: {type: String, unique: true},
    status: {type: Boolean, default: true}
});
const TypeVulnerabilityModel = mongoose.model('type_vulnerability', typeVulnerabilitySchema);


let submitReportSchema = new mongoose.Schema({
    is_next_generation: {type: Number, default: 0},
    hacker_user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'hacker_user'
    },
    reference_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'submit_report'
    },
    program_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'program'
    },
    target_id: mongoose.Schema.Types.ObjectId,
    vulnerability_type_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'type_vulnerability'
    },
    moderator_user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'moderator_user'
    },
    submit_date_time: Date,
    after_inprogress_date_time: Date,
    last_modify_date_time: Date,
    status: {type: Number, default: 0},
    severity: {type: Number, default: 0},
    title: String,
    is_close: {type: Number, default: 1},
    proof_url: String,
    severity_score: {
        A: String,
        AC: String,
        AV: String,
        C: String,
        I: String,
        PR: String,
        S: String,
        UI: String
    },
    proof_concept: String,
    proof_recommendation: String,
    security_impact: String,
    report_files: [
        {
            file_name: String,
            file_original_name: String
        }
    ],
    pay_price: {type: Number, default: 0},
    pay_date_time: Date,
});

const SubmitReportModel = mongoose.model('submit_report', submitReportSchema);

let commentSubmitReportSchema = new mongoose.Schema({
    hacker_user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'hacker_user'
    },
    company_user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'company_user'
    },
    payment_history_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'payment_history'
    },
    moderator_user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'moderator_user'
    },
    is_internal: {type: Boolean, default: false},
    reading_status: {
        read_by_moderator: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'moderator_user'
            }
        ],
        read_by_hacker: {type: Boolean, default: false},
        read_by_company: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'company_user'
            }
        ]
    },
    send_type: Number,
    type: {type: Number, default: 0},
    report_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'submit_report'
    },
    send_date_time: Date,
    comment: String,
    file1: String,
    file1_original_name: String,
    file2: String,
    file2_original_name: String,
    file3: String,
    file3_original_name: String,

});

const CommentSubmitReportModel = mongoose.model('comment_submit_report', commentSubmitReportSchema);


let ctfSchema = new mongoose.Schema({
    title: {type: String, unique: true},
    status: {type: Boolean, default: true},
    start_date_time: Date,
    initial_point: Number,
    minimum_point: Number,
    decay: Number,
    coins: Number,
    end_date_time: Date,
});
const CTFModel = mongoose.model('ctf', ctfSchema);

ChallengeLevel = [
    {"id": "1", "title": "Easy"},
    {"id": "2", "title": "Medium"},
    {"id": "3", "title": "Hard"},
]

ChallengeCategory = [
    {"id": "1", "title": "Web"},
    {"id": "2", "title": "Forensics"},
    {"id": "3", "title": "Digital Forensics"},
    {"id": "4", "title": "Web Security"},
    {"id": "5", "title": "Cryptography"},
    {"id": "6", "title": "OSINT"},
    {"id": "7", "title": "Reverse Engineering"},

]

let challengeSchema = new mongoose.Schema({
    name: {type: String, unique: true},
    level_id: Number,
    point: Number,
    coin: Number,
    link: String,
    category_id: Number,
    description: String,
    flag: String,
    status: {type: Boolean, default: true},
    ctf_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ctf'
    },
});

const ChallengeModel = mongoose.model('challenge', challengeSchema);


let flagCtfSubmitSchema = new mongoose.Schema({
    hacker_user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'hacker_user'
    },
    ctf_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ctf'
    },
    challenge_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'challenge'
    },
    submit_date_time: Date,
    point: Number,
    coin: Number,
    flag: String,
});

const FlagCtfSubmitModel = mongoose.model('flag_ctf_submit', flagCtfSubmitSchema);


let programInviteSchema = new mongoose.Schema({
    company_user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'company_user'
    },
    program_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'program'
    },
    register_date_time: Date,
    expire_day: Number,
    hacker_user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'hacker_user'
    },
    status_invite: {type: Number, default: 0},
    status_send_email: {type: Number, default: 0},
    invite_date_time: Date,
});

const ProgramInviteModel = mongoose.model('program_invite', programInviteSchema);

let reportNotificationSchema = new mongoose.Schema({
    company_user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'company_user'
    },
    program_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'program'
    },
    report_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'submit_report'
    },
    register_date_time: Date,
    hacker_user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'hacker_user'
    },
    moderator_user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'moderator_user'
    },
    type: {type: Number, default: 0},
    status_send_email: {type: Number, default: 0}
});

const ReportNotificationModel = mongoose.model('report_notification', reportNotificationSchema);

let paymentHistorySchema = new mongoose.Schema({
    hacker_user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'hacker_user'
    },
    program_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'program'
    },
    report_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'submit_report'
    },
    company_user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'company_user'
    },
    program_type: {
        type: Number,
        default: 1
    },
    hourly_price: { type: Number, default: 0 },
    month_hours:
    {
        month: Date,
        hours: Number
    }
    ,   
    amount: Number,
    type: Number,
    is_positive: {type: Boolean, default: false},
    register_date_time: Date
});

const PaymentHistoryModel = mongoose.model('payment_history', paymentHistorySchema);

let paymentSchema = new mongoose.Schema({
    hacker_user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'hacker_user'
    },
    amount: Number,
    payment_type: Number,
    tracking_code: String,
    status: {type: Number, default: 0},
    register_date_time: Date,
    payment_date_time: Date
});

const PaymentModel = mongoose.model('payment', paymentSchema);

let settingSchema = new mongoose.Schema({
    key: String,
    value: String
});

const SettingModel = mongoose.model('setting', settingSchema);

let notificationSchema = new mongoose.Schema({
    text: String,
    title: String,
    status: {type: Number, default: 0},
    message_type: {type: Number, default: 0},
    resource_type: {type: Number, default: 0},
    sender_type: {type: Number, default: 0},
    action_type: {type: Number, default: 0},
    field_type: {type: Number, default: 0},
    register_date_time: Date,
    program_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'program'
    },
    report_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'submit_report'
    },
    hacker_user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'hacker_user'
    },
    company_user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'company_user'
    },
    moderator_user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'moderator_user'
    }
});

const NotificationModel = mongoose.model('notification', notificationSchema);

let historySchema = new mongoose.Schema({
    type: {type: Number, default: 0},
    resource_type: Number,
    sender_type: Number,
    activity: String,
    fields:[{
        key: String,
        old_value:{},
        new_value:{}
    }],
    info_fields:[{
        key: String,
        value:{}
    }],
    register_date_time: Date,
    resource_id: mongoose.Schema.Types.ObjectId,
    sender_id: mongoose.Schema.Types.ObjectId,
});

const HistoryModel = mongoose.model('history', historySchema);

let integrationSchema = new mongoose.Schema({
    company_user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'company_user'
    },
    integration_authentication_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'integration_authentication'
    },
    reports:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'submit_report'
    }],
    programs: [
        {
            _id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'program'
            },
            name: {type: String}
        }
    ],
    register_date_time: Date,
    type: {type: Number, default: 0},
    status: {type: Number, default: 0},
    project_id:  String,
    issue_id: String,
    title: String,
    description: String,
    property_mappings:[{jira_key: String, jira_title: String, sb_key: String}],
    priority_mappings:[{jira_key: String, sb_key: Number}]
});

const IntegrationModel = mongoose.model('integration', integrationSchema);

let integrationAuthenticationSchema = new mongoose.Schema({
    company_user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'company_user'
    },
    register_date_time: Date,
    type: {type: Number, default: 0},
    status: {type: Number, default: 0},
    title:  String,
    url: String,
    oauth_token: String,
    oauth_token_secret: String,
    shared_secret: String,
});

const IntegrationAuthenticationModel = mongoose.model('integration_authentication', integrationAuthenticationSchema);

SchemaModels = {
    "IntegrationAuthenticationModel": IntegrationAuthenticationModel,
    "IntegrationModel": IntegrationModel,
    "GlobalIDModel": GlobalIDModel,
    "AdminUserModel": AdminUserModel,
    "HackerUserModel": HackerUserModel,
    "CompanyUserModel": CompanyUserModel,
    "EmailSubscriptionModel": EmailSubscriptionModel,
    "SkillsModel": SkillsModel,
    "CountryModel": CountryModel,
    "ModeratorUserModel": ModeratorUserModel,
    "RangeModel": RangeModel,
    "CurrencyModel": CurrencyModel,
    "ProgramModel": ProgramModel,
    "TypeTestModel": TypeTestModel,
    "LanguageModel": LanguageModel,
    "TypeVulnerabilityModel": TypeVulnerabilityModel,
    "SubmitReportModel": SubmitReportModel,
    "CommentSubmitReportModel": CommentSubmitReportModel,
    "CTFModel": CTFModel,
    "ChallengeModel": ChallengeModel,
    "FlagCtfSubmitModel": FlagCtfSubmitModel,
    "ProgramInviteModel": ProgramInviteModel,
    "ReportNotificationModel": ReportNotificationModel,
    "PaymentModel": PaymentModel,
    "SettingModel": SettingModel,
    "NotificationModel": NotificationModel,
    "HistoryModel": HistoryModel,
    "PaymentHistoryModel": PaymentHistoryModel
};


