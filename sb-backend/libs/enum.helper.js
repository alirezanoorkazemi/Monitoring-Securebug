const ACTIONS = Object.freeze({
    READ: "read",
    CREATE: "create",
    UPDATE: "update",
    DELETE: "delete",
});

const ADMIN_ROLES = Object.freeze({
    ADMIN: "1",
    MODERATOR: "2",
    VALUES: [1, 2]
});

const NOTIFICATION_STATUS = Object.freeze({
    SEND: 1,
    READ: 2
});

const ACTION_TYPE = Object.freeze({
    CREATE: 1,
    READ: 2,
    UPDATE: 3,
    DELETE: 4,
});

const FIELD_TYPE = Object.freeze({
    OTHER: 0,
    STATUS: 1,
    VERIFICATION: 2,
    ACTIVITY: 3,
    ADMIN_VERIFICATION: 4,
    FULLY_MANAGE: 5,
    TAG: 6,
    IDENTITY_STATUS: 7,
    COINS: 8,
    REWARD: 9,
    SEVERITY: 10,
    COMMENT: 11,
});

const ADMIN_ROLES_NAME = Object.freeze({
    ADMIN: "admin",
    MODERATOR: "moderator"
});

const COMMENT_SEND_TYPE = Object.freeze({
    HACKER: 0,
    MODERATOR: 1,
    COMPANY: 2,
    ADMIN: 3
});

const SENDER_TYPE = Object.freeze({
    ADMIN: 1,
    MODERATOR: 2,
    COMPANY: 3,
    HACKER: 4
});

const RESOURCE_TYPE = Object.freeze({
    HACKER: 1,
    REPORT: 2,
    COMPANY: 3,
    PROGRAM: 4,
    COMMENT: 5,
    PAYMENT: 6,
    PROGRAM_INVITE: 7,
    NOTIFICATION: 8
});

const COMMENT_SYSTEM_TYPE = Object.freeze({
    MODERATOR: 0,
    NONE: 1,
    COMPANY: 2,
});

const ADMIN_RESOURCES = Object.freeze({
    USER: "user",
    PROFILE: "profile",
    NOTIFICATION: "notification",
    COMPANY: "company",
    COMPANY_CHART: "company_chart",
    COMPANY_MEMBER: "company_member",
    PROGRAM: "program",
    PROGRAM_MODERATOR: "program_moderator",
    PROGRAM_INVITATION: "program_invitation",
    REPORT: "report",
    REPORT_DETAILS: "report_details",
    COMMENT: "comment",
    HACKER: "hacker",
    HACKER_CHART: "hacker_chart",
    MODERATOR: "moderator",
    CTF: "ctf",
    COUNTRY: "country",
    LANGUAGE: "language",
    CURRENCY: "currency",
    TARGET_TYPE: "target_type",
    SKILL: "skill",
    RANGE: "range",
    SETTING: "setting",
    PREDATA: "predata",
    STATISTICS: "statistics"
});

const PROGRAM_STATUS = Object.freeze({
    PROGRESS: 0,
    PENDING: 1,
    APPROVED: 2,
    REJECT: 3,
    CLOSE: 4,
    VALUES: [0, 1, 2, 3, 4]
});

const PAYMENT_HISTORY_TYPE = Object.freeze({
    ADD_MAX_REWARD: 0,
    PAY_PRICE: 1,
    UPDATE_MAX_REWARD: 2,
});

const PROGRAM_TYPE = Object.freeze({
    PUBLIC: 1,
    PRIVATE: 2,
    VALUES: [1, 2]
});

const PRODUCT_TYPE = Object.freeze({
    STARTER: 1,
    PROFESSIONAL: 2,
    ENTERPRISE: 3,
    VALUES: [1, 2, 3]
});

const COMPETENCY_PROFILE = Object.freeze({
    THREAT_HUNTER: 1,
    BUG_HUNTER: 2,
    PEN_TESTER: 3,
    VALUES: [1, 2, 3]
});

const PROGRAM_BOUNTY_TYPE = Object.freeze({
    BUG_BOUNTY: 0,
    NEXT_GEN_PEN_TEST: 1,
    INTELLIGENCE_DISCOVERY: 2,
    THREAT_BOUNTY: 3,
    VALUES: [0, 1, 2, 3]
});

const HACKER_IDENTITY_TYPE = Object.freeze({
    PASSPORT: 1,
    CARD: 2,
    DRIVER: 3,
    VALUES: [1, 2, 3]
});

const HACKER_PAYMENT_STATUS = Object.freeze({
    PENDING: 0,
    APPROVED: 1,
    REJECTED: 2,
    VALUES: [0, 1, 2]
});

const REPORT_STATUS = Object.freeze({
    NONE: 0,
    PENDING: 1,
    MODIFICATION: 2,
    TRIAGE: 3,
    APPROVE: 4,
    REJECT: 5,
    DUPLICATE: 6,
    RESOLVED: 7,
    NOT_APPLICABLE: 8,
    IN_PROGRESS_BY_ADMIN: 20,
    VALUES: [0, 1, 2, 3, 4, 5, 6, 7, 8,20]
});

const REPORT_SEVERITY = Object.freeze({
    NONE: 0,
    LOW: 1,
    MEDIUM: 2,
    HIGH: 3,
    CRITICAL: 4,
    VALUES: [0, 1, 2, 3, 4]
});

const REPORT_ACTIVITY = Object.freeze({
    CLOSE: 0,
    OPEN: 1,
    VALUES: [0, 1]
});

const WITHDRAW_STATUS = Object.freeze({
    PENDING: 0,
    PAID: 1,
    REJECT: 2
});

const HACKER_IDENTITY_STATUS = Object.freeze({
    PENDING: 0,
    APPROVED: 1,
    REJECTED: 2,
    VALUES: [0, 1, 2]
});

const REPORT_NOTIFICATION_TYPE = Object.freeze({
    SUBMIT_REPORT: 0,
    CHANGE_STATUS_REPORT: 1,
    SUBMIT_COMMENT: 2,
    ADD_PRICE: 3,
    CHANGE_SEVERITY_REPORT: 4,
    CHANGE_ACTIVITY_REPORT: 5,
});

const PAYMENT_DEFAULT = Object.freeze({
    NONE: "0",
    PAYPAL: "1",
    USDT: "2",
    BANK_TRANSFER: "3",
    VALUES: [0, 1, 2, 3, 4]
});

const BANK_TRANSFER_TYPE = Object.freeze({
    INDIVIDUAL: 1,
    COMPANY: 2,
    VALUES: [1, 2]
});

const INTEGRATION_TYPE = Object.freeze({
    JIRA:1
});

const INTEGRATION_AUTH_STATUS = Object.freeze({
    ACTIVE:1,
    INACTIVE:2,
});

const ROLES = Object.freeze({
    SUPPER_ADMIN: "0",
    ADMIN: "1",
    VIEWER: "2",
    OBSERVER: "3",
    VALUES: [1,2,3]
});

const ROLES_NAME = Object.freeze({
    SUPPER_ADMIN: "supper_admin",
    ADMIN: "admin",
    VIEWER: "viewer",
    OBSERVER: "observer"
});

const RESOURCE = Object.freeze({
    REPORT: "report",
    PROGRAM: "program",
    COMMENT: "comment",
    SUPPORT: "support",
    HACKER: "hacker",
    USER: "user",
    USER_PROFILE: "user_profile",
    USER_DETAILS: "user_details",
    USER_PAYMENT: "user_payment",
    INVITE_MEMBER: "invite_member",
    UPLOAD_AVATAR: "upload_Avatar",
    PASSWORD: "password"
});

const TIMES_NUMBER = Object.freeze({
    HOURS_OF_DAY: 24,
    MINUTES_OF_HOUR: 60,
    MILISECONDS_OF_SECOND: 60000
});

const HACKER_TAGS = Object.freeze({
    NONE: 0,
    CHAMPION: 1,
    INTELLIGENCE_DISCOVERY: 2,
    INTERNAL_USER: 3,
    USER_VERIFY: 3,
    VALUES: [1, 2, 3, 4]
});

const PROGRAM_MODERATOR_ACCESS = Object.freeze({
    READ: 0,
    READ_WRITE: 1,
    EDIT: 2,
    VALUES: [0, 1, 2]
});

const MESSAGE_TYPE = Object.freeze({
    INFO: 1,
    DANGER: 2,
    SUCCESS: 3,
    WARNING: 4,
    VALUES: [1, 2, 3, 4]
});

const PROGRAM_MATURITY = Object.freeze({
    NONE: 0,
    BASIC: 1,
    INTERMEDIATE: 2,
    ADVANCED: 3,
    COMPLEX: 4,
    VALUES: [0, 1, 2, 3, 4]
});

const TWO_FA_STATUS = Object.freeze({
    DISABLED: 0,
    ENABLED: 1,
    VALUES: [0, 1]
});

const STATIC_VARIABLES = Object.freeze({
    TOKEN_LENGTH: 6,
    MAX_LENGTH: {
        EMAIL: 65
    },
    ERROR_CODE: {
        NOT_VALID_TOKEN: "-1",
        NOT_VERIFY_USER: "-2",
        NOT_VALID_USER: "-3",
        TOKEN_REQUIRED: "-4",
        SUCCESS: "0",
        NOT_RESOURCE_FOUND: "1",
        REQUARED: "2",
        NOT_VALID: "3",
        DISABLED: "4",
        NOT_FOUND: "5",
        MAX_LENGTH: "6",
        MIN_LENGTH: "7",
        WRONG_RANGE: "8",
        MAX_VALUE: "9",
        MIN_VALUE: "10",
        EXPIRE: "11",
        NOT_CORRECT: "12",
        NOT_VERIFY: "13",
        NOT_EQUAL: "14",
        EMAIL_EXIST: "15",
        EXIST: "16",
        CUSTOM: "20",
        NOT_ROUTE_FOUND: "404",
        NOT_PERMISSON: "403",
        EXPIRE_TOKEN: "401",
        EXPIRE_REFRESH_TOKEN: "4001",
        INTERNAL_SERVER_ERROR: "500"
    },
    PAGE_SIZE_VALUES: [10, 25, 50, 100]
});

const NORIFICATION_SETTING = Object.freeze({
    NONE:1,
    WEB:2,
    EMAIL:3,
    EMAIL_WEB: 4,
    VALUES: [1,2,3,4]
});

const INVITE_HACKER_STATUS = Object.freeze({
    PENDING: 0,
    ACCEPT: 1,
    REJECT: 2
});

const ACTIVITY_TEXT_LOG = Object.freeze({
    CHANGE_FULLY_MANAGE: 'Change Fully Manage',
    CHANGE_ADMIN_VERIFICATION: 'Change Admin Verification',
    CHANGE_VERIFICATION: 'Change Verification',
    SET_EXPIRE_DAY: 'Set Expire Day',
    UPDATE_COMPANY: 'Update Company',
    UPDATE_HACKER: 'Update Hacker',
    UPDATE_REPORT: 'Update Report',
    DELETE_REPORT: 'Delete Report',
    DELETE_HACKER: 'Delete Hacker',
    DELETE_COMPANY: 'Delete Company',
    SUBMIT_CHALLENGE: 'Submit Challenge',
    WITHDRAW_REQUEST: 'Withdraw Request',
    SUBMIT_REPORT: 'Submit Report',
    SUBMIT_COMMENT: 'Submit Comment',
    SEND_NOTIFICATION: 'Send Notification',
    SEND_EMAIL: 'Send Email',
    REGISTER: 'Register',
    TWO_FA_LOGIN: '2FA Login',
    RESET_PASSWORD: 'Reset Password',
    CHANGE_PASSWORD: 'Change Password',
    UPDATE_PROFILE: 'Update Profile',
    UPDATE_PERSONAL_INFO: 'Update Personal Info',
    LOGIN: 'Login',
    LOGOUT: 'Logout',
    VERIFY_EMAIL: 'Verify Email',
    UPDATE_ACTIVITY: 'Update Activity',
    UPDATE_SKILLS: 'Update Skills',
    UPLOAD_CVE: 'Upload CVE',
    UPLOAD_TAX: 'Upload Tax',
    DELETE_TAX: 'Delete Tax',
    UPLOAD_AVATAR: 'Upload Avatar',
    DELETE_AVATAR: 'Delete Avatar',
    DELETE_CVE: 'Delete CVE',
    UPDATE_INVITATION: 'Update Invitation',
    UPDATE_USDT_PAYMENT: 'Update USDT Payment',
    CLEAR_USDT_PAYMENT: 'Clear USDT Payment',
    UPDATE_PAYPAL_PAYMENT: 'Update Paypal Payment',
    UPDATE_CREDIT_CARD: 'Update Credit Card',
    UPDATE_INVOICE: 'Update Invoice',
    CLEAR_PAYPAL_PAYMENT: 'Clear Paypal Payment',
    UPDATE_IBAN_PAYMENT: 'Update Iban Payment',
    CLEAR_IBAN_PAYMENT: 'Clear Iban Payment',
    UPDATE_PASSPORT_IDENTITY: 'Update Passport',
    DELETE_PASSPORT_IDENTITY: 'Delete Passport',
    UPDATE_CARD_IDENTITY: 'Update Card Identity',
    DELETE_CARD_IDENTITY: 'Delete Card Identity',
    UPDATE_DRIVER_LICENSE: 'Update Driver License',
    DELETE_DRIVER_LICENSE: 'Delete Driver License',
    CHANGE_EMAII: 'Change Email',
    INVITATION_RESPONSE: 'Invitation Response',
    SET_REPORT_NOTIFICATION: 'Set Report Notification',
    ENABLE_2FA: 'Enable 2FA',
    DISABLE_2FA: 'Disable 2FA',
    DELETE_SESSION: 'Delete Session',
    DELETE_COMMENT: 'Delete Comment',
    CREATE_PROGRAM: 'Create Program',
    CREATE_MEMBER: 'Create Member',
    CREATE_USER: 'Create User',
    UPDATE_USER: 'Update User',
    DELETE_USER: 'Delete User',
    UPDATE_SB_COINS: 'Update SB Coins',
    UPDATE_IDENTITY_STATUS: 'Update Identity Status',
    MEMBER_SET_PASSWORD: 'Member Validate Email And Set Password',
    DELETE_MEMBER: 'Delete Member',
    UPDATE_MEMBER: 'Update Member',
    CREATE_TARGET: 'Create Target',
    UPDATE_TARGET: 'Update Target',
    DELETE_TARGET: 'Delete Target',
    CREATE_REWARDS_FOR_ALL_TARGETS: 'Create Rewards For All Targets',
    UPDATE_REWARDS_FOR_ALL_TARGETS: 'Update Rewards For All Targets',
    DELETE_REWARDS_FOR_ALL_TARGETS: 'Delete Rewards For All Targets',
    CREATE_REWARD: 'Create Reward',
    UPDATE_REWARD: 'Update Reward',
    DELETE_REWARD: 'Delete Reward',
    CREATE_POLICIES_FOR_ALL_TARGETS: 'Create Policies For All Targets',
    UPDATE_POLICIES_FOR_ALL_TARGETS: 'Update Policies For All Targets',
    DELETE_POLICIES_FOR_ALL_TARGETS: 'Delete Policies For All Targets',
    CREATE_POLICY: 'Create Policy',
    UPDATE_POLICY: 'Update Policy',
    DELETE_POLICY: 'Delete Policy',
    DELETE_PROGRAM: 'Delete Program',
    UPDATE_PROGRAM: 'Update Program',
    UPDATE_MAXIMUM_REWARD: 'Update Maximum Reward',
    UPDATE_LAUNCH_TIMELINE: 'Update launch timeline',
    INVITE_HACKERS: 'Invite Hackers',
    CHANGE_SEVERITY: 'Change Severity',
    CHANGE_STATUS: 'Change Status',
    PAY_PRICE: 'Pay Price',
    CHANGE_PROGRAM_TYPE: 'Change program type',
    CHANGE_PROGRAM_BOUNTY_TYPE: 'Change program Bounty type',
    CHANGE_PRODUCT_TYPE: 'Change Product type',
    ASSIGN_TAG: 'Assign Tag',
    ASSIGN_MODERATOR: 'Assign Moderator',
    UPDATE_ASSIGNED_MODERATOR: 'Update Assigned Moderator',
    DELETE_ASSIGNED_MODERATOR: 'Delete Assigned Moderator',
    CHANGE_ACTIVITY: 'Change Activity',
});

const HISTORY_TYPE = Object.freeze({
    ACTIVITY: 0,
    REPORT_CHANGE: 1,
    PROGRAM_CHANGE: 2,
});

const NEXT_GEN_DURATION_TYPE = Object.freeze({
    SIX_MONTH: 6,
    TWELVE_MONTH : 12,
    VALUES: [6 , 12]
});

module.exports = {
    ACTIONS, NOTIFICATION_STATUS, WITHDRAW_STATUS, PAYMENT_DEFAULT, REPORT_ACTIVITY, TIMES_NUMBER, ADMIN_ROLES,
    ADMIN_RESOURCES, REPORT_NOTIFICATION_TYPE, HACKER_IDENTITY_STATUS, PROGRAM_TYPE, HACKER_TAGS, BANK_TRANSFER_TYPE,
    ROLES, ROLES_NAME, RESOURCE, PROGRAM_BOUNTY_TYPE, HACKER_IDENTITY_TYPE, ADMIN_ROLES_NAME, PROGRAM_MATURITY,
    HACKER_PAYMENT_STATUS, REPORT_STATUS, REPORT_SEVERITY, PROGRAM_STATUS, STATIC_VARIABLES, COMPETENCY_PROFILE,
    COMMENT_SEND_TYPE, COMMENT_SYSTEM_TYPE, PAYMENT_HISTORY_TYPE, PROGRAM_MODERATOR_ACCESS, MESSAGE_TYPE,
    SENDER_TYPE, RESOURCE_TYPE, ACTION_TYPE, FIELD_TYPE, PRODUCT_TYPE, INVITE_HACKER_STATUS, ACTIVITY_TEXT_LOG,
    HISTORY_TYPE, TWO_FA_STATUS, NORIFICATION_SETTING, INTEGRATION_TYPE, INTEGRATION_AUTH_STATUS, NEXT_GEN_DURATION_TYPE
};