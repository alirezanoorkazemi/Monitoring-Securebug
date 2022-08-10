const axios = require('axios');
const companyIO = require("../../../io/company");

class CompanyUserModel {
    constructor() {
        this.collection = SchemaModels.CompanyUserModel;
    }

    async createJiraAuth(company_user_id, title, url, shared_secret) {
        const exist_title = await SchemaModels.IntegrationAuthenticationModel.countDocuments({company_user_id, title});
        if (exist_title > 0) return 1;
        let authentication = {
            title,
            company_user_id,
            register_date_time: getDateTime(),
            type: INTEGRATION_TYPE.JIRA,
            status: INTEGRATION_AUTH_STATUS.INACTIVE,
            url
        };
        const jira_request_token = await this.getJiraResponse(createRequestForJiraApis(
            `${url}/plugins/servlet/oauth/request-token`,
            'POST', {oauth_callback: `${AppConfig.FRONTEND_URL}company/integrations/jira`}
        ));
        if (jira_request_token.jira_error) return jira_request_token;

        const data = qsToJson(jira_request_token.response, false);
        if (!data.oauth_token || !data.oauth_token_secret) return 2;

        authentication.oauth_token = encryptedToken(OAUTH_1A.SECRET_KEY, shared_secret, data.oauth_token);
        authentication.oauth_token_secret = encryptedToken(OAUTH_1A.SECRET_KEY, shared_secret, data.oauth_token_secret);
        authentication.shared_secret = encryptedToken(OAUTH_1A.SECRET_KEY, company_user_id.toString(), shared_secret);
        authentication = await SchemaModels.IntegrationAuthenticationModel.create(authentication);
        return {
            _id: authentication._id,
            url: authentication.url,
            oauth_token: data.oauth_token,
            title: authentication.title,
            status: authentication.status
        }
    }

    async createJiraIntegration(company_user_id, title, description, issue_id, integration_authentication_id, project_id, programs, properties, priorities, parent_user_id, access_program_list) {
        const exist_title = await SchemaModels.IntegrationModel.countDocuments({company_user_id, title});
        if (exist_title > 0) return 1;

        const filters = {
            company_user_id,
            $or: [{status: PROGRAM_STATUS.APPROVED},
                {status: PROGRAM_STATUS.CLOSE}]
        };
        if (parent_user_id && access_program_list && access_program_list.length > 0) {
            filters._id = {$in: access_program_list.map(p => p._id)};
        }
        const program_ids = await SchemaModels.ProgramModel.find(filters).select({_id: 1});

        if (!program_ids || !program_ids.length) return 5;

        let is_program_valid = true;
        programs.map(program => program._id).forEach(program_id => {
            if (!program_ids.map(p => p._id.toString()).includes(program_id.toString())) {
                is_program_valid = false;
            }
        });
        if (!is_program_valid) return 5;

        const selected_authentication = await SchemaModels.IntegrationAuthenticationModel
            .findOne({_id: integration_authentication_id}).select({
                _id: 1,
                oauth_token: 1,
                status: 1,
                url: 1,
                shared_secret: 1
            });

        if (!selected_authentication || !selected_authentication.url || !selected_authentication.oauth_token) return 2;
        const shared_secret = decryptedToken(OAUTH_1A.SECRET_KEY, company_user_id.toString(), selected_authentication.shared_secret);
        selected_authentication.oauth_token = decryptedToken(OAUTH_1A.SECRET_KEY, shared_secret, selected_authentication.oauth_token);
        if (!selected_authentication.oauth_token) return 2;

        if (selected_authentication.status !== INTEGRATION_AUTH_STATUS.ACTIVE) return 3;

        const same_url_authentications = await SchemaModels.IntegrationAuthenticationModel
            .find({url: selected_authentication.url, _id: {$ne: integration_authentication_id}}).select({_id: 1});

        if (isArray(same_url_authentications) && same_url_authentications.length > 0) {
            const check_existing_integration_with_same_url_and_project = await SchemaModels.IntegrationModel
                .countDocuments({
                    integration_authentication_id: {$in: same_url_authentications.map(auth => auth._id)},
                    project_id
                });
            if (check_existing_integration_with_same_url_and_project > 0) return 4;
        }

        const jira_projects = await this.getJiraResponse(createRequestForJiraApis(
            `${selected_authentication.url}/rest/api/2/project`,
            'GET', {oauth_token: selected_authentication.oauth_token}
        ));

        if (jira_projects.jira_error) return 6;
        if (!(jira_projects.response.length > 0)) return 6;

        const project_id_is_valid = !!jira_projects.response.find(project => project.id.toString() === project_id.toString());
        if (!project_id_is_valid) return 6;

        const jira_issue_types = await this.getJiraResponse(createRequestForJiraApis(
            `${selected_authentication.url}/rest/api/2/issuetype`,
            'GET', {oauth_token: selected_authentication.oauth_token}
        ));

        if (jira_issue_types.jira_error) return 7;
        if (!(jira_issue_types.response.length > 0)) return 7;

        const issue_type_id_is_valid = !!jira_issue_types.response.find(issue_type => issue_type.id.toString() === issue_id.toString());
        if (!issue_type_id_is_valid) return 7;

        let is_properties_valid = true;
        const sb_properties = ["target", "vulnerability_type", "proof_concept", "security_impact", "title", "proof_recommendation", "proof_url"];
        const jira_fields = await this.getJiraResponse(createRequestForJiraApis(
            `${selected_authentication.url}/rest/api/2/field`,
            'GET', {oauth_token: selected_authentication.oauth_token}
        ));

        if (jira_fields.jira_error) return 8;
        if (!(jira_fields.response.length > 0)) return 8;

        const jira_properties = jira_fields.response.map(field => field.id.toString());
        properties.forEach(property => {
            if (!sb_properties.includes(property.sb_key.toString()) ||
                !jira_properties.includes(property.jira_key.toString())) {
                is_properties_valid = false
            }
        });
        if (!is_properties_valid) return 8;

        let is_priorities_valid = true;
        let jira_priorities = await this.getJiraResponse(createRequestForJiraApis(
            `${selected_authentication.url}/rest/api/2/priority`,
            'GET', {oauth_token: selected_authentication.oauth_token}
        ));

        if (jira_priorities.jira_error) return 9;
        if (!(jira_priorities.response.length > 0)) return 9;

        jira_priorities = jira_priorities.response.map(priority => priority.id.toString());
        priorities.forEach(priority => {
            if (!isNumber(priority.sb_key) ||
                priority.sb_key > 4 ||
                priority.sb_key < 0 ||
                !jira_priorities.includes(priority.jira_key.toString())) {
                is_priorities_valid = false
            }
        });
        if (!is_priorities_valid) return 9;

        let integration = {
            title,
            company_user_id,
            description,
            integration_authentication_id,
            project_id,
            programs,
            priority_mappings: priorities,
            property_mappings: properties,
            register_date_time: getDateTime(),
            type: INTEGRATION_TYPE.JIRA,
            status: INTEGRATION_AUTH_STATUS.ACTIVE,
            issue_id
        };
        const new_integration = await SchemaModels.IntegrationModel.create(integration);
        return await SchemaModels.IntegrationModel
            .findOne({_id: new_integration._id, company_user_id})
            .populate({path: 'integration_authentication_id', select: {title: 1}})
            .select({_id: 1, title: 1, status: 1, integration_authentication_id: 1, programs: 1});
    }

    async getJiraAuthentication(company_user_id, authentication_id) {
        const authentication = await SchemaModels.IntegrationAuthenticationModel.findOne({
            company_user_id,
            _id: authentication_id
        }, {url: 1, status: 1, shared_secret: 1});
        if (!authentication) return 1;
        if (authentication.status === INTEGRATION_AUTH_STATUS.ACTIVE) return 2;

        const jira_request_token = await this.getJiraResponse(createRequestForJiraApis(
            `${authentication.url}/plugins/servlet/oauth/request-token`,
            'POST', {oauth_callback: `${AppConfig.FRONTEND_URL}company/integrations/jira`}
        ));
        if (jira_request_token.jira_error) return jira_request_token;

        const data = qsToJson(jira_request_token.response, false);
        if (!data.oauth_token || !data.oauth_token_secret) {
            return 3;
        }
        const shared_secret = decryptedToken(OAUTH_1A.SECRET_KEY, company_user_id.toString(), authentication.shared_secret);
        const oauth_token = encryptedToken(OAUTH_1A.SECRET_KEY, shared_secret, data.oauth_token);
        const oauth_token_secret = encryptedToken(OAUTH_1A.SECRET_KEY, shared_secret, data.oauth_token_secret);
        await SchemaModels.IntegrationAuthenticationModel.updateOne({company_user_id, _id: authentication_id}, {
            $set: {
                oauth_token,
                oauth_token_secret
            }
        });
        return {
            url: authentication.url,
            oauth_token: data.oauth_token,
            oauth_token_secret: data.oauth_token_secret
        };
    }

    async verifyJiraAuth(company_user_id, oauth_token, oauth_verifier, authentication_id) {

        const jira_authentications = await SchemaModels.IntegrationAuthenticationModel
            .find({company_user_id, type: INTEGRATION_TYPE.JIRA})
            .select({url: 1, _id: 1, oauth_token: 1, shared_secret: 1});

        if (!jira_authentications || jira_authentications.length === 0) return 1;

        let jira_authentication = undefined;
        for (let i = 0; i < jira_authentications.length; i++) {
            const shared_secret = decryptedToken(OAUTH_1A.SECRET_KEY, company_user_id.toString(), jira_authentications[i].shared_secret);
            const db_oauth_token = decryptedToken(OAUTH_1A.SECRET_KEY, shared_secret, jira_authentications[i].oauth_token);
            if (db_oauth_token && db_oauth_token.toString() === oauth_token.toString()) {
                jira_authentication = jira_authentications[i];
                break;
            }
        }
        if (!jira_authentication) return 1;

        const jira_access_token = await this.getJiraResponse(createRequestForJiraApis(
            `${jira_authentication.url}/plugins/servlet/oauth/access-token`,
            'POST', {oauth_token, oauth_verifier}
        ));

        if (jira_access_token.jira_error) return jira_access_token;

        const json_response = qsToJson(jira_access_token.response);
        const shared_secret = decryptedToken(OAUTH_1A.SECRET_KEY, company_user_id.toString(), jira_authentication.shared_secret);
        const new_oauth_token = encryptedToken(OAUTH_1A.SECRET_KEY, shared_secret, json_response.oauth_token);
        await SchemaModels.IntegrationAuthenticationModel.updateOne({
            company_user_id,
            _id: jira_authentication._id,
            type: INTEGRATION_TYPE.JIRA
        }, {
            $set: {
                oauth_token: new_oauth_token,
                status: INTEGRATION_AUTH_STATUS.ACTIVE
            }
        });

        if (companyIO && companyIO["sockets"] && companyIO["sockets"].size > 0) {
            const sockets_info = convertSetOrMapToArray(companyIO["sockets"]);
            if (sockets_info.length > 0) {
                const company_socket_info = sockets_info.filter(s => s.data && s.data._id && s.data._id.toString() === company_user_id.toString());
                if (company_socket_info && company_socket_info.length > 0) {
                    company_socket_info.forEach(company_socket => {
                        companyIO["to"](company_socket.id.toString()).emit("activateJiraAuth", {
                            authentication_id: jira_authentication._id
                        });
                    })
                }
            }
        }
    }

    async deleteIntegration(company_user_id, integration_id, parent_user_id, access_program_list) {
        const integration = await SchemaModels.IntegrationModel.findOne({
            _id: integration_id,
            company_user_id
        }).select({programs: 1});

        if (!integration) return 1;

        const integration_program_ids = integration.programs.map(i => i._id.toString());
        if (parent_user_id && access_program_list && access_program_list.length > 0) {
            let can_delete_integration = true;
            const access_program_ids = access_program_list.map(ap => ap._id.toString());
            integration_program_ids.forEach(id => {
                if (!access_program_ids.includes(id)) {
                    can_delete_integration = false;
                }
            });
            if (!can_delete_integration) {
                return 2;
            }
        }
        await SchemaModels.IntegrationModel.deleteOne({
            _id: integration_id,
            company_user_id
        });
        return integration_id;
    }

    async deleteJiraAuthentication(company_user_id, authentication_id) {
        const authentication = await SchemaModels.IntegrationAuthenticationModel.findOne({
            _id: authentication_id,
            company_user_id
        });
        if (!authentication) return 1;
        const integrations_count = await SchemaModels.IntegrationModel.countDocuments({
            company_user_id,
            integration_authentication_id: authentication_id
        });
        if (integrations_count > 0) return 2;
        await SchemaModels.IntegrationAuthenticationModel.deleteOne({
            _id: authentication_id,
            company_user_id
        });
        return authentication_id;
    }

    async changeIntegrationActivity(company_user_id, integration_id, parent_user_id, access_program_list) {
        const integration = await SchemaModels.IntegrationModel.findOne({
            _id: integration_id,
            company_user_id
        }).select({programs: 1});

        if (!integration) return 1;

        const integration_program_ids = integration.programs.map(i => i._id.toString());
        if (parent_user_id && access_program_list && access_program_list.length > 0) {
            let can_delete_integration = true;
            const access_program_ids = access_program_list.map(ap => ap._id.toString());
            integration_program_ids.forEach(id => {
                if (!access_program_ids.includes(id)) {
                    can_delete_integration = false;
                }
            });
            if (!can_delete_integration) {
                return 2;
            }
        }
        await SchemaModels.IntegrationModel.updateOne({
            _id: integration_id,
            company_user_id
        }, [{
            $set: {
                status: {
                    $switch: {
                        branches: [
                            {
                                case: {$eq: ["$status", INTEGRATION_AUTH_STATUS.INACTIVE]},
                                then: INTEGRATION_AUTH_STATUS.ACTIVE
                            },
                            {
                                case: {$eq: ["$status", INTEGRATION_AUTH_STATUS.ACTIVE]},
                                then: INTEGRATION_AUTH_STATUS.INACTIVE
                            },
                        ],
                    }
                }
            }
        }]);
        return integration_id;
    }

    async getJiraAuthentications(company_user_id) {
        return await SchemaModels.IntegrationAuthenticationModel
            .find({
                company_user_id,
                type: INTEGRATION_TYPE.JIRA
            }).select({title: 1, _id: 1, status: 1, url: 1});
    }

    async getJiraResponse(request) {
        return await axios.request(request).then(async (response) => {
            return {response: response.data, jira_error: false};
        }).catch(error => {
            let message = "";
            if (error.response) {
                if (error.response.status === 401) message = 'Jira Authentication is Unauthorized!';
                if (error.response.status === 403) message = 'You have not permission for this Jira!';
                if (error.response.status === 404) message = 'Jira Api is not found!';
                if (error.response.status === 413) message = 'The attachments exceed the maximum attachment size for issues!';
                if (error.response.status === 500) message = 'Something went wrong!';
                if (error.response.status === 400) {
                    if (error.response.data &&
                        error.response.data.errorMessages &&
                        error.response.data.errorMessages.length > 0) {
                        message = Object.values(error.response.data.errorMessages)[0];
                    } else {
                        message = 'Something went wrong!';
                    }
                }
            }

            return {response: message || 'Something went wrong!', jira_error: true};
        });
    }

    async getJiraProjects(company_user_id, authentication_id, parent_user_id, access_program_list) {
        const result = {projects: [], issues: [], programs: []};
        const authentication = await SchemaModels.IntegrationAuthenticationModel
            .findOne({
                company_user_id,
                type: INTEGRATION_TYPE.JIRA,
                status: INTEGRATION_AUTH_STATUS.ACTIVE,
                _id: authentication_id
            })
            .select({url: 1, shared_secret: 1, oauth_token: 1, _id: 1});

        if (!authentication || !authentication.url || !authentication.oauth_token) return 1;
        const shared_secret = decryptedToken(OAUTH_1A.SECRET_KEY, company_user_id.toString(), authentication.shared_secret);
        authentication.oauth_token = decryptedToken(OAUTH_1A.SECRET_KEY, shared_secret, authentication.oauth_token);
        if (!authentication.oauth_token) return 1;

        const filters = {
            company_user_id,
            $or: [{status: PROGRAM_STATUS.APPROVED}, {status: PROGRAM_STATUS.CLOSE}]
        };
        if (parent_user_id && access_program_list && access_program_list.length > 0) {
            filters._id = {$in: access_program_list.map(p => p._id)};
        }
        const programs = await SchemaModels.ProgramModel.find(filters).select({name: 1, _id: 1});
        if (!programs || !(programs.length > 0)) return 2;

        result.programs = programs.map(program => ({title: program.name, value: program._id}));
        const jira_projects = await this.getJiraResponse(createRequestForJiraApis(
            `${authentication.url}/rest/api/2/project`,
            'GET', {oauth_token: authentication.oauth_token}
        ));

        if (jira_projects.jira_error) return jira_projects;
        if (jira_projects.response.length > 0) {
            result.projects = jira_projects.response.map((project) => {
                return {title: project.name, value: project.id}
            })
        }
        const jira_issue_types = await this.getJiraResponse(createRequestForJiraApis(
            `${authentication.url}/rest/api/2/issuetype`,
            'GET', {oauth_token: authentication.oauth_token}
        ));
        if (jira_issue_types.jira_error) return jira_issue_types;
        if (jira_issue_types.response.length > 0) {
            result.issues = jira_issue_types.response
                .filter(issue => issue.name.toLowerCase() !== 'epic' && !issue.subtask && !issue.scope).map((issue) => {
                    return {title: issue.name, value: issue.id}
                })
        }
        return result;
    }

    async getJiraFields(company_user_id, authentication_id) {
        const authentication = await SchemaModels.IntegrationAuthenticationModel
            .findOne({
                company_user_id,
                type: INTEGRATION_TYPE.JIRA,
                status: INTEGRATION_AUTH_STATUS.ACTIVE,
                _id: authentication_id
            })
            .select({url: 1, shared_secret: 1, oauth_token: 1, _id: 1});

        if (!authentication || !authentication.url || !authentication.oauth_token) return 1;
        const shared_secret = decryptedToken(OAUTH_1A.SECRET_KEY, company_user_id.toString(), authentication.shared_secret);
        authentication.oauth_token = decryptedToken(OAUTH_1A.SECRET_KEY, shared_secret, authentication.oauth_token);
        if (!authentication.oauth_token) return 1;

        const jira_fields = await this.getJiraResponse(createRequestForJiraApis(
            `${authentication.url}/rest/api/2/field`,
            'GET', {oauth_token: authentication.oauth_token}
        ));

        if (jira_fields.jira_error) return jira_fields;

        if (jira_fields.response.length > 0) {
            return jira_fields.response.map((field) => {
                return {title: field.name, value: field.id}
            }).sort((a, b) => {
                const name_a = a.title.toUpperCase();
                const name_b = b.title.toUpperCase();
                return name_a < name_b ? -1 :
                    name_a > name_b ? 1 : 0
            })
        } else {
            return [];
        }

    }

    async getJiraPriorities(company_user_id, authentication_id) {
        const authentication = await SchemaModels.IntegrationAuthenticationModel
            .findOne({
                company_user_id,
                type: INTEGRATION_TYPE.JIRA,
                status: INTEGRATION_AUTH_STATUS.ACTIVE,
                _id: authentication_id
            })
            .select({url: 1, shared_secret: 1, oauth_token: 1, _id: 1});

        if (!authentication || !authentication.url || !authentication.oauth_token) return 1;
        const shared_secret = decryptedToken(OAUTH_1A.SECRET_KEY, company_user_id.toString(), authentication.shared_secret);
        authentication.oauth_token = decryptedToken(OAUTH_1A.SECRET_KEY, shared_secret, authentication.oauth_token);
        if (!authentication.oauth_token) return 1;

        const jira_priorities = await this.getJiraResponse(createRequestForJiraApis(
            `${authentication.url}/rest/api/2/priority`,
            'GET', {oauth_token: authentication.oauth_token}
        ));

        if (jira_priorities.jira_error) return jira_priorities;

        if (jira_priorities.response.length > 0) {
            return jira_priorities.response.map((field) => {
                return {title: field.name, value: field.id}
            })
        } else {
            return [];
        }

    }

    async getJiraIntegrations(company_user_id, parent_user_id, access_program_list) {
        const filters = {company_user_id, type: INTEGRATION_TYPE.JIRA};
        const is_member = parent_user_id && access_program_list && access_program_list.length > 0;
        const access_program_ids = access_program_list.map(p => p._id.toString());
        if (is_member) {
            filters.programs = {$elemMatch: {_id: {$in: access_program_ids}}};
        }
        const integrations = await SchemaModels.IntegrationModel
            .find(filters)
            .populate({path: 'integration_authentication_id', select: {title: 1}})
            .select({_id: 1, title: 1, status: 1, integration_authentication_id: 1, programs: 1});

        if (is_member && integrations && integrations.length > 0) {
            integrations.forEach(item => {
                if (item.programs && item.programs.length > 0) {
                    item.programs = item.programs.filter(program => access_program_ids.includes(program._id.toString()));
                }
            })
        }
        return integrations;
    }

    async getUserData(user) {
        if (user && isObjectID(user.company_country_id)) {
            user.company_country_id = await SchemaModels.CountryModel.findOne({_id: user.company_country_id}).select({
                _id: 1,
                title: 1
            });
        }
        if (user && isObjectID(user.invoice_address_country_id)) {
            user.invoice_address_country_id = await SchemaModels.CountryModel.findOne({_id: user.invoice_address_country_id}).select({
                _id: 1,
                title: 1
            });
        }
        if (user && isObjectID(user.credit_currency_id)) {
            user.credit_currency_id = await SchemaModels.CurrencyModel.findOne({_id: user.credit_currency_id}).select({
                _id: 1,
                title: 1
            });
        }
        const has_bug_bounty = await SchemaModels.ProgramModel.countDocuments({
            $and: [
                {company_user_id: getUserId(user)},
                {is_next_generation: PROGRAM_BOUNTY_TYPE.BUG_BOUNTY},
                {$or: [{status: PROGRAM_STATUS.APPROVED}, {status: PROGRAM_STATUS.CLOSE}]}
            ]
        });
        let avatar_file = !isUndefined(user.avatar_file) && user.avatar_file !== "" ? AppConfig.API_URL + user.avatar_file : "";
        let tax_file = !isUndefined(user.tax_file) && user.tax_file !== "" ? AppConfig.API_URL + user.tax_file : "";
        let admin_verify = isUndefined(user.admin_verify) ? false : user.admin_verify;
        let is_fully_manage = isUndefined(user.is_fully_manage) ? false : user.is_fully_manage;
        let googleAuth = (!isUndefined(user.google_towfa_status) && user.google_towfa_status == 1) ? true : false;
        let userData = {
            "has_bug_bounty": has_bug_bounty > 0,
            "user_level_access": user.user_level_access,
            "can_send_comment": user.can_send_comment,
            "can_see_approve": user.can_see_approve,
            "google_auth": googleAuth,
            "token_expire_time": token_setting.expire_date_time,
            "current_date_time": getDateTime(),
            "fn": user.fn
            ,
            "ln": user.ln
            ,
            "is_fully_manage": is_fully_manage
            ,
            "status": user.status
            ,
            "is_verify": user.is_verify
            ,
            "admin_verify": admin_verify
            ,
            "full_manage": user.full_manage
            ,
            "payment_paypal_email": user.payment_paypal_email
            ,
            "account_is_disable": user.account_is_disable
            ,
            "profile_visibility": user.profile_visibility
            ,
            "about": user.about
            ,
            "short_introduction": user.short_introduction
            ,
            "github_url": user.github_url
            ,
            "twitter_url": user.twitter_url
            ,
            "linkedin_url": user.linkedin_url
            ,
            "website_url": user.website_url
            ,
            "role": user.role
            ,
            "display_name": user.display_name
            ,
            "organization_name": user.organization_name
            ,
            "email": user.email
            ,
            "phone": user.phone
            ,
            "avatar_file": avatar_file
            ,
            "tax_file": tax_file
            ,
            "organization_no": user.organization_no
            ,
            "address1": user.address1
            ,
            "address2": user.address2
            ,
            "city": user.city
            ,
            "region": user.region
            ,
            "postal_code": user.postal_code
            ,
            "company_country_id": user.company_country_id
            ,
            "invoice_address_country_id": user.invoice_address_country_id
            ,
            "invoice_address_company_name": user.invoice_address_company_name
            ,
            "invoice_address_address1": user.invoice_address_address1
            ,
            "invoice_address_address2": user.invoice_address_address2
            ,
            "invoice_address_city": user.invoice_address_city
            ,
            "invoice_address_reference": user.invoice_address_reference
            ,
            "invoice_address_zip_code": user.invoice_address_zip_code
            ,
            "invoice_address_email": user.invoice_address_email
            ,
            "credit_currency_id": user.credit_currency_id
            ,
            "credit_card_number": user.credit_card_number
            ,
            "credit_date": user.credit_date
            ,
            "credit_cvc": user.credit_cvc
            ,
            "credit_bank_holder_name": user.credit_bank_holder_name
            ,
            "report_notification_setting": !isUndefined(user.report_notification_setting) ? user.report_notification_setting : {}
        }
        return userData;
    }

    async refreshToken(token, refresh_token, user_agent, ip) {
        const token_data = await getHash(`login:${token}`);
        if (!token_data || !token_data.user_id ||
            !token_data.token || !token_data.refresh_token) {
            return 1;
        }
        if (token_data.refresh_token !== refresh_token) {
            return 2;
        }
        return await createTokens(token_data.user_id, token_data.token, ip, user_agent);
    }

    async register(email, password
        , organization_name, fn, ln, role, phone, company_country_id) {
        password = makeHash(password);
        let user_id = await nextID('user_id');
        let activation_code = makeKey(randomStr(10));
        let data = {
            "email": email.toLowerCase(),
            "user_id": user_id,
            "password": password, "phone": phone
            , "temp": activation_code, "is_verify": false,
            "organization_name": organization_name,
            "fn": fn,
            "ln": ln,
            "role": role,
            "register_date_time": getDateTime()
        }
        if (company_country_id != "" && isObjectID(company_country_id)) {
            data['company_country_id'] = company_country_id;
        }
        let i = this.collection(data);
        let r = await i.save();
        return activation_code;
    }

    async getTeamMember(user_id, user_level_access, current_user_id, parent_user_id, access_program_list) {
        const filters = {"parent_user_id": user_id};
        if (parent_user_id) {
            filters._id = {$ne: current_user_id};
            if (access_program_list && access_program_list.length > 0) {
                filters.access_program_list = {$elemMatch: {_id: {$in: access_program_list.map(p => p._id)}}}
            }
        }
        const team_members = await this.collection.find(filters).select('_id fn ln email can_send_comment can_see_approve user_level_access google_towfa_status account_is_disable google_towfa_secret_key access_program_list').lean();
        if (user_level_access === toNumber(ROLES.VIEWER) || user_level_access === toNumber(ROLES.OBSERVER)) {
            return isArray(team_members) && team_members.length > 0 ? team_members.filter(d => d._id.toString() === current_user_id.toString()).map(teamMember => (
                {
                    fn: teamMember.fn,
                    ln: teamMember.ln,
                    can_send_comment: teamMember.can_send_comment,
                    can_see_approve: teamMember.can_see_approve,
                    account_is_disable: teamMember.account_is_disable,
                    email: teamMember.email,
                    access_program_list: teamMember.access_program_list
                })) : [];
        } else {
            return isArray(team_members) && team_members.length > 0 ? team_members.map(teamMember => (
                {
                    fn: teamMember.fn,
                    can_send_comment: teamMember.can_send_comment,
                    can_see_approve: teamMember.can_see_approve,
                    ln: teamMember.ln,
                    _id: teamMember._id,
                    email: teamMember.email,
                    user_level_access: teamMember.user_level_access,
                    account_is_disable: teamMember.account_is_disable,
                    access_program_list: teamMember.access_program_list,
                    has_2fa: !!(teamMember.google_towfa_secret_key && teamMember.google_towfa_status === 1)
                })) : [];
        }
    }

    async addMember(parent_user, email,
                    access_level, fn, ln, can_send_comment,
                    can_see_approve, access_program_list,
                    current_parent_user_id, current_access_program_list) {
        if (current_parent_user_id && current_access_program_list &&
            current_access_program_list.length > 0) {
            const new_member_program_ids = access_program_list.map(ap => ap._id.toString());
            const current_user_access_program_ids = current_access_program_list.map(p => p._id.toString());
            let can_add_member = true;
            new_member_program_ids.forEach(id => {
                if (!current_user_access_program_ids.includes(id)) {
                    can_add_member = false;
                }
            });
            if (!can_add_member) return 1;
        }

        can_send_comment = access_level === toNumber(ROLES.ADMIN) ? true :
            access_level === toNumber(ROLES.OBSERVER) ? false :
                access_level === toNumber(ROLES.VIEWER) ? can_send_comment : false;
        can_see_approve = access_level === toNumber(ROLES.OBSERVER) ? can_see_approve : true;
        let user_id = await nextID('user_id');
        let password_code = makeKey(randomStr(10));
        let data = {
            "email": email.toLowerCase(),
            "user_id": user_id,
            "is_verify": parent_user.is_verify,
            "admin_verify": parent_user.admin_verify,
            "fn": fn,
            "access_program_list": access_program_list,
            "can_send_comment": can_send_comment,
            "can_see_approve": can_see_approve,
            "temp": password_code,
            "ln": ln,
            "parent_user_id": parent_user._id,
            "user_level_access": access_level,
            "register_date_time": getDateTime()
        };
        const new_member = await this.collection.create(data);
        return {"user_id": new_member._id, "code": password_code};
    }

    async checkMemberPasswordToken(member_password_token) {
        const user_password_code = await this.collection.findOne({"temp": member_password_token}).select("temp -_id").exec();
        if (!user_password_code) {
            return 2;
        }
        return 0;
    }

    async setCompanyMemberPassword(member_password_token, password2) {
        const password = makeHash(password2);
        let passwordData = {
            "password": password,
            "temp": ""
        };
        const user = await this.collection.findOneAndUpdate({"temp": member_password_token}, {
            $set: passwordData
        });
        if (!user) {
            return 2;
        }
        return 0;
    }

    async editMember(email
        , access_level, fn, ln, user_id, parent_id, can_send_comment,
                     can_see_approve, access_program_list,
                     current_parent_user_id, current_access_program_list) {
        if (current_parent_user_id && current_access_program_list &&
            current_access_program_list.length > 0) {
            const new_member_program_ids = access_program_list.map(ap => ap._id.toString());
            const current_user_access_program_ids = current_access_program_list.map(p => p._id.toString());
            let can_edit_member = true;
            new_member_program_ids.forEach(id => {
                if (!current_user_access_program_ids.includes(id)) {
                    can_edit_member = false;
                }
            });
            if (!can_edit_member) return 1;
        }
        can_send_comment = access_level === toNumber(ROLES.ADMIN) ? true :
            access_level === toNumber(ROLES.OBSERVER) ? false :
                access_level === toNumber(ROLES.VIEWER) ? can_send_comment : false;
        can_see_approve = access_level === toNumber(ROLES.OBSERVER) ? can_see_approve : true;
        let password_code = "";
        let data = {
            "email": email.toLowerCase(),
            "fn": fn,
            "ln": ln,
            "can_send_comment": can_send_comment,
            "can_see_approve": can_see_approve,
            "user_level_access": access_level,
            "access_program_list": access_program_list,
        };
        if (!(user_id || isObjectID(user_id))) {
            return 8;
        }
        const member = await this.collection.findOne({"_id": user_id}).select("_id temp email google_towfa_secret_key google_towfa_status password").exec();
        if (!member) {
            return 9;
        }
        if (member.email.toLowerCase() !== email.toLowerCase()) {
            if (member.password) {
                return 10;
            } else {
                password_code = makeKey(randomStr(10));
                data["temp"] = password_code;
                await this.collection.findOneAndUpdate({"_id": user_id, "parent_user_id": parent_id}, {
                    $set: data
                });
                return {"code": password_code, has_2fa: false, user_id: member._id};
            }
        }
        await this.collection.findOneAndUpdate({"_id": user_id, "parent_user_id": parent_id}, {
            $set: data
        });
        return {user_id: member._id, has_2fa: !!(member.google_towfa_secret_key && member.google_towfa_status === 1)};
    }

    async getNotifications(user_id, is_new, page) {
        const ret = {};
        const showPerPage = 12;
        if (is_new === "true") {
            const result = await SchemaModels.NotificationModel.aggregate([
                {
                    $match: {
                        $and: [{company_user_id: user_id}, {status: NOTIFICATION_STATUS.SEND},
                            {sender_type: {$ne: SENDER_TYPE.COMPANY}}]
                    }
                },
                {$sort: {register_date_time: -1}},
                {
                    $facet: {
                        rows: [
                            {$limit: showPerPage},
                            {
                                $lookup: {
                                    from: "programs",
                                    localField: "program_id",
                                    foreignField: "_id",
                                    as: "program_id"
                                }
                            },
                            {
                                $unwind: {path: "$program_id", preserveNullAndEmptyArrays: true}
                            },
                            {
                                $project: {
                                    title: 1,
                                    text: 1,
                                    status: 1,
                                    message_type: 1,
                                    _id: 1,
                                    report_id: 1,
                                    program_id: {_id: 1, program_type: 1, is_next_generation: 1},
                                    resource_type: 1,
                                    field_type: 1,
                                    register_date_time: 1,
                                }
                            }],
                        total_rows: [{$count: "count"}]
                    }
                }
            ]);
            if (result && result[0] && result[0].rows.length > 0) {
                return {
                    notifications: result[0].rows,
                    notifications_count: result[0].total_rows[0].count
                };
            }
            const notifications = await SchemaModels.NotificationModel.find({
                company_user_id: user_id, sender_type: {$ne: SENDER_TYPE.COMPANY}
            }).populate({path: "program_id", select: {_id: 1, program_type: 1, is_next_generation: 1}})
                .sort({register_date_time: -1}).limit(3).select({
                    title: 1,
                    text: 1,
                    message_type: 1,
                    register_date_time: 1,
                    status: 1,
                    _id: 1,
                    report_id: 1,
                    program_id: 1,
                    resource_type: 1,
                    field_type: 1,
                });
            return {notifications: notifications, notifications_count: 0};
        } else if (is_new === "false") {
            ret.current_page = page || 1;
            const where = {
                "company_user_id": mongoose.Types.ObjectId(user_id),
                sender_type: {$ne: SENDER_TYPE.COMPANY}
            };
            const result = await SchemaModels.NotificationModel.aggregate([
                {$match: where},
                {$sort: {register_date_time: -1}},
                {
                    $facet: {
                        totalRows: [
                            {
                                $count: "count",
                            }
                        ],
                        rows: [
                            {
                                $skip: (ret.current_page - 1) * showPerPage,
                            },
                            {$limit: showPerPage},
                            {
                                $lookup: {
                                    from: "programs",
                                    localField: "program_id",
                                    foreignField: "_id",
                                    as: "program_id"
                                }
                            },
                            {
                                $unwind: {path: "$program_id", preserveNullAndEmptyArrays: true}
                            },
                            {
                                $project: {
                                    title: 1,
                                    text: 1,
                                    message_type: 1,
                                    register_date_time: 1,
                                    resource_type: 1,
                                    field_type: 1,
                                    _id: 1,
                                    report_id: 1,
                                    status: 1,
                                    program_id: {program_type: 1, _id: 1, is_next_generation: 1}
                                }
                            }
                        ],
                    },
                },
            ]).exec();
            if (result && result.length > 0 && result[0].totalRows.length > 0) {
                const notification_ids = result[0].rows.map(n => n._id.toString());
                await SchemaModels.NotificationModel.updateMany(
                    {
                        company_user_id: user_id,
                        _id: {$in: notification_ids}
                    },
                    {$set: {status: NOTIFICATION_STATUS.READ}});
                ret.rows = result[0].rows;
                ret.totalRows = result[0].totalRows[0].count;
                ret.totalPage = Math.ceil(ret.totalRows / showPerPage);
            } else {
                ret.rows = [];
                ret.totalRows = 0;
                ret.totalPage = 0;
            }
            return ret;
        } else {
            ret.rows = [];
            ret.totalRows = 0;
            ret.totalPage = 0;
            return ret;
        }
    }

    async updateNotificationStatus(user_id, notification_id, status) {
        if (isObjectID(user_id)) {
            if (isObjectID(notification_id)) {
                await SchemaModels.NotificationModel.updateOne(
                    {_id: notification_id, company_user_id: user_id}, {$set: {status}});
            } else if (notification_id === "read_all") {
                await SchemaModels.NotificationModel.updateMany(
                    {
                        company_user_id: user_id,
                        status: NOTIFICATION_STATUS.SEND,
                        sender_type: {$ne: SENDER_TYPE.COMPANY}
                    }
                    , {$set: {status}});
            }
        }
    }

    async deleteMember(user_id, parent_id, current_parent_user_id, current_access_program_list) {
        const member = await this.collection.findOne({"_id": user_id, "parent_user_id": parent_id})
            .select({access_program_list: 1}).exec();
        if (!member) return 3;

        if (current_parent_user_id && current_access_program_list &&
            current_access_program_list.length > 0) {
            let member_program_ids;
            if (member.access_program_list && member.access_program_list.length > 0) {
                member_program_ids = member.access_program_list.map(p => p._id.toString());
            } else {
                const programs = await SchemaModels.ProgramModel.find({company_user_id: parent_id})
                    .select({_id: 1});
                member_program_ids = programs.map(p => p._id.toString());
            }
            const current_user_access_program_ids = current_access_program_list.map(p => p._id.toString());
            let can_edit_member = true;
            member_program_ids.forEach(id => {
                if (!current_user_access_program_ids.includes(id)) {
                    can_edit_member = false;
                }
            });
            if (!can_edit_member) return 1;
        }
        if (!(user_id || isObjectID(user_id))) {
            return 2;
        }
        await this.collection.deleteOne({"_id": user_id, "parent_user_id": parent_id}).exec();
        await SchemaModels.CommentSubmitReportModel.deleteMany({company_user_id: user_id});
        await SchemaModels.NotificationModel.deleteMany({company_user_id: user_id});
        await SchemaModels.HistoryModel.deleteMany({sender_id: user_id, sender_type: SENDER_TYPE.COMPANY});
        await SchemaModels.ReportNotificationModel.deleteMany({company_user_id: user_id});
        return 0;
    }

    async updateFullManage(user_id, full_manage) {
        let data = {
            "full_manage": full_manage === "true" ? true : false
        }
        let x = await this.collection.findOneAndUpdate({"_id": user_id}, {
                $set: data
            }
        );
        await x.save();
        return 0;
    }

    async checkEmail(email) {
        email = email.toLowerCase();
        return this.collection.findOne({email: {$regex: `^${email}$`, "$options": "i"}}).countDocuments();
    }

    async checkEmailForEdit(user_id, email) {
        email = email.toLowerCase();
        return this.collection.findOne({
            "_id": {$ne: user_id},
            email: {$regex: `^${email}$`, "$options": "i"}
        }).countDocuments();
    }

    async updateNewVerifyCode(id) {
        if (!isObjectID(id))
            return -1;
        let activation_code = makeKey(randomStr(10));

        let data = {
            "temp": activation_code,
        };
        let x = await this.collection.updateOne({"_id": id}, {
                $set: data
            }
        );
        return activation_code;
    }

    async checkEmailForResend(email) {
        return await this.collection.findOne(
            {
                "email": email.toLowerCase(),
                "is_verify": false
            }
        );
    }

    async checkEmailForReset(email) {
        return await this.collection.findOne(
            {
                "email": email
                , "is_verify": true
            }
        );
    }


    async getUserByVerifyCode(code) {
        return this.collection.findOne({"temp": code, "is_verify": false});
    }

    async getUserByResetCode(code) {
        return this.collection.findOne({"temp": code, "is_verify": true});
    }


    async updateVerifyUser(id) {
        if (!isObjectID(id))
            return 1;

        let data = {
            "verify_date_time": getDateTime(),
            "is_verify": true,
            "temp": "",
        };
        let x = await this.collection.updateOne({"_id": id}, {
                $set: data
            }
        );
        return 1;
    }


    async login(email, password) {
        password = makeHash(password);
        let result = await this.collection.findOne({
            "email": email
            , "password": password
        })
            .populate('company_country_id')
            .populate('invoice_address_country_id')
            .populate('credit_currency_id');
        if (result) {
            if (result["parent_user_id"]) {
                let parent_result = await this.collection.findOne({"_id": result["parent_user_id"]})
                    .populate('company_country_id')
                    .populate('invoice_address_country_id')
                    .populate('credit_currency_id');
                if (parent_result) {
                    const member_fields = getMemberFields();
                    for (const item in parent_result) {
                        if (member_fields.includes(item)) {
                            result[item] = parent_result[item];
                        }
                    }
                }
            }

            if (result['is_verify']) {
                if (result['status'] && !result["account_is_disable"]) {
                    //make token
                    return result;
                } else {
                    return -3;//user is disable
                }
            } else {
                return -2;//user is not verify
            }
        } else
            return -1;//email or password is not correct
    }

    async getRow(id) {
        if (!isObjectID(id))
            return null;
        id = safeString(id);
        return await this.collection.findOne({"_id": id});
    }


    async updateNewResetCode(id) {
        if (!isObjectID(id))
            return -1;
        let code = randomStr(10);
        let activation_code = makeKey(code);

        let data = {
            "temp": activation_code,
        };
        let x = await this.collection.updateOne({"_id": id}, {
                $set: data
            }
        );
        return code;
    }

    async updateNewPassword(id, password) {
        if (!isObjectID(id))
            return 1;

        password = makeHash(password);
        let data = {
            "password": password,
            "temp": "",
        };
        let x = await this.collection.updateOne({"_id": id}, {
                $set: data
            }
        );
        return 1;
    }


    async updateAvatar(id, img) {
        if (!isObjectID(id))
            return 1;


        let data = {
            "avatar_file": img,
        };
        let x = await this.collection.updateOne({"_id": id}, {
                $set: data
            }
        );
        return 1;
    }

    async deleteAvatar(id) {
        if (!isObjectID(id))
            return 1;


        let data = {
            "avatar_file": "",
        };
        let x = await this.collection.updateOne({"_id": id}, {
                $set: data
            }
        );
        return 1;
    }

    async updateProfileDetails(id, profile_visibility
        , about, github_url, twitter_url, linkedin_url, website_url, fn, ln
        , organization_name, role, short_introduction, display_name, parent_user_id,
                               user_level_access) {
        if (!isObjectID(id))
            return 0;

        let data = {
            "short_introduction": short_introduction,
            "fn": fn,
            "ln": ln,
            "profile_visibility": profile_visibility,
            "about": about,
            "github_url": github_url,
            "twitter_url": twitter_url,
            "linkedin_url": linkedin_url,
            "website_url": website_url,
            "organization_name": organization_name,
            "role": role,

        };
        if (!parent_user_id) {
            data["display_name"] = display_name;
        } else if (user_level_access === toNumber(ROLES.ADMIN)) {
            await this.collection.updateOne({"_id": parent_user_id}, {
                    $set: {display_name: display_name}
                }
            );
        }


        await this.collection.updateOne({"_id": id}, {
                $set: data
            }
        );
        return 1;
    }

    async updateDetails(id, organization_no
        , country_id, address1, address2, city, region, postal_code, phone) {
        if (!isObjectID(id))
            return 0;

        let data = {
            "organization_no": organization_no,
            "address1": address1,
            "address2": address2,
            "city": city,
            "region": region,
            "postal_code": postal_code,
            "phone": phone,
        };

        if (country_id != "" && isObjectID(country_id)) {
            data['company_country_id'] = country_id;
        }

        let x = await this.collection.updateOne({"_id": id}, {
                $set: data
            }
        );
        return 1;
    }


    async getCountry(country_id) {
        if (!isObjectID(country_id))
            return 0;
        return SchemaModels.CountryModel.findOne({"_id": country_id, "status": true}).countDocuments();
    }

    async getCountryRow(country_id) {
        if (!isObjectID(country_id))
            return null;
        return await SchemaModels.CountryModel.findOne({"_id": country_id, "status": true});
    }


    async getCurrency(currency_id) {
        if (!isObjectID(currency_id))
            return 0;
        return SchemaModels.CurrencyModel.findOne({"_id": currency_id, "status": true}).countDocuments();
    }


    async updateEmailTemp(user_id, email) {
        let activation_code = makeKey(randomStr(10));
        let data = {
            "temp": activation_code,
            "email_temp": email
        };
        let x = await this.collection.updateOne({"_id": user_id}, {
                $set: data
            }
        );
        return activation_code;
    }


    async getFoundChangeEmailTempCode(code) {
        return this.collection.findOne({"temp": code, "email_temp": {$ne: ""}});
    }

    async updateEmailChange(id, current_email, new_email, activity_log) {
        if (!isObjectID(id))
            return 1;

        if (isUndefined(activity_log))
            activity_log = '';

        activity_log += `${current_email} to ${new_email} changed! - ${getDateTime()}  \n `;
        let data = {
            "activity_log": activity_log,
            "temp": "",
            "email": new_email,
            "email_temp": ""
        };
        let x = await this.collection.updateOne({"_id": id}, {
                $set: data
            }
        );
        return 1;
    }

    async updateEmailChangeFail(id) {
        if (!isObjectID(id))
            return 1;

        let data = {
            "temp": "",
            "email_temp": "",
        };
        let x = await this.collection.updateOne({"_id": id}, {
                $set: data
            }
        );
        return 1;
    }

    async disabledAccount(id, status) {
        if (!isObjectID(id))
            return 1;

        let data = {
            "account_is_disable": status,
        };
        let x = await this.collection.updateOne({"_id": id}, {
                $set: data
            }
        );
        return 1;
    }

    async updateTAX(id, tax) {
        if (!isObjectID(id))
            return 1;


        let data = {
            "tax_file": tax,
        };
        let x = await this.collection.updateOne({"_id": id}, {
                $set: data
            }
        );
        return 1;
    }

    async deleteTAX(id) {
        if (!isObjectID(id))
            return 1;


        let data = {
            "tax_file": "",
        };
        let x = await this.collection.updateOne({"_id": id}, {
                $set: data
            }
        );
        return 1;
    }

    async updatePaymentPaypal(id, payment_paypal_email) {
        if (!isObjectID(id))
            return 1;

        let data = {
            "payment_paypal_email": payment_paypal_email
        };
        let x = await this.collection.updateOne({"_id": id}, {
                $set: data
            }
        );
        return 1;
    }

    async clearPaymentPaypal(id) {
        if (!isObjectID(id))
            return 1;

        let data = {
            "payment_paypal_email": ''
        };
        let x = await this.collection.updateOne({"_id": id}, {
                $set: data
            }
        );
        return 1;
    }

    async saveInvoiceAddress(id, country_id
        , reference, address1, address2, city
        , email, company_name, zip_code) {
        if (!isObjectID(id))
            return 1;
        let data = {
            "invoice_address_company_name": company_name
            , "invoice_address_address1": address1
            , "invoice_address_address2": address2
            , "invoice_address_city": city
            , "invoice_address_reference": reference
            , "invoice_address_zip_code": zip_code
            , "invoice_address_email": email
        };

        if (country_id != '' && isObjectID(country_id)) {
            data['invoice_address_country_id'] = country_id;
        }

        let x = await this.collection.updateOne({"_id": id}, {
                $set: data
            }
        );
        return 1;
    }


    async saveCreditCard(id, currency_id
        , card_number, credit_date, credit_cvc
        , credit_bank_holder_name) {
        if (!isObjectID(id))
            return 1;

        let data = {
            "credit_currency_id": currency_id
            , "credit_card_number": card_number
            , "credit_date": credit_date
            , "credit_cvc": credit_cvc
            , "credit_bank_holder_name": credit_bank_holder_name
        };
        let x = await this.collection.updateOne({"_id": id}, {
                $set: data
            }
        );
        return 1;
    }

    async getAllValidPrograms(company_user_id) {
        return await SchemaModels.ProgramModel.find({$and: [{company_user_id}, {$or: [{status: PROGRAM_STATUS.APPROVED}, {status: PROGRAM_STATUS.CLOSE}]}]})
            .select({_id: 1, is_next_generation: 1}).lean();
    }

    async getAllPrograms(company_user_id) {
        if (!isObjectID(company_user_id))
            return [];

        let match = {
            "company_user_id": mongoose.Types.ObjectId(company_user_id),
        };
        let rows = await SchemaModels.ProgramModel.aggregate([
            {"$match": {"$and": [match], "$or": [{"status": 2}, {"status": 4}]}}
            , {
                $project: {
                    "_id": 0,
                    "program_id": "$_id"
                }
            }
        ]);
        return rows.map(d => d.program_id);

    }

    //preformance need
    async statisticsSubmitReport(company_user_id, program_type, parent_user_id, access_program_list) {
        if (!isObjectID(company_user_id))
            return [];

        let programs = await this.getAllValidPrograms(company_user_id);
        if (programs && programs.length > 0 && parent_user_id && access_program_list && access_program_list.length > 0) {
            const access_program_ids = access_program_list.map(access_program => access_program._id.toString());
            programs = programs.filter(program => access_program_ids.includes(program._id.toString()));
        }
        const group_by_program_type = programs.map(program => program.is_next_generation).filter((value, index, self) => self.indexOf(value) === index).length > 1;
        const response = {group_by_program_type};
        let match = {
            "status": {$gte: 1, $lt: 10},
        };
        let rows = await SchemaModels.SubmitReportModel.aggregate([
            {
                "$match": {
                    "$and": [match],
                    "$or": [{"program_id": {$in: programs.map(program => toObjectID(program._id))}}]
                }
            },
            ...(program_type > 0 && group_by_program_type ? [
                {
                    $lookup: {
                        from: 'programs',
                        localField: 'program_id',
                        foreignField: '_id',
                        as: 'program_id'
                    }
                },
                {
                    $unwind: {path: "$program_id", preserveNullAndEmptyArrays: true}
                },
                {$match: {"program_id.is_next_generation": program_type - 1}}
            ] : []),
            {
                $group:
                    {
                        _id: {
                            year: {$year: "$submit_date_time"},
                            month: {$month: "$submit_date_time"},
                            day: {$dayOfMonth: "$submit_date_time"}
                        },
                        "Pending": {
                            "$sum": {
                                "$cond":
                                    {if: {$eq: ["$status", 1]}, then: 1, else: 0}
                            }
                        }
                        , "Modification": {
                            "$sum": {
                                "$cond":
                                    {if: {$eq: ["$status", 2]}, then: 1, else: 0}
                            }
                        }
                        , "Triage": {
                            "$sum": {
                                "$cond":
                                    {if: {$eq: ["$status", 3]}, then: 1, else: 0}
                            }
                        }
                        , "Approve": {
                            "$sum": {
                                "$cond":
                                    {if: {$eq: ["$status", 4]}, then: 1, else: 0}
                            }
                        }
                        , "Reject": {
                            "$sum": {
                                "$cond":
                                    {if: {$eq: ["$status", 5]}, then: 1, else: 0}
                            }
                        }
                        , "Duplicate": {
                            "$sum": {
                                "$cond":
                                    {if: {$eq: ["$status", 6]}, then: 1, else: 0}
                            }
                        }
                        , "Resolved": {
                            "$sum": {
                                "$cond":
                                    {if: {$eq: ["$status", 7]}, then: 1, else: 0}
                            }
                        }
                        , "NotApplicable": {
                            "$sum": {
                                "$cond":
                                    {if: {$eq: ["$status", 8]}, then: 1, else: 0}
                            }
                        }

                    }
            },
            {
                $group: {
                    _id: "$_id.year",
                    year: {$first: "$_id.year"},
                    monthes: {$push: "$$ROOT"},
                }
            },
            {
                $sort: {
                    year: 1
                }
            }
        ]).exec();

        let result = [];
        rows = rows.filter(row => !!row._id);
        const has_current_year = rows.find(row => row._id.toString() === "2022");
        if (!has_current_year) {
            rows.push({year: 2022, monthes: [{_id: {month: 1, day: 1}}, {_id: {month: 1, day: 12}}]});
        }
        for (let row of rows) {
            const item = {year: row.year};
            // let months = [];
            item.monthes = [];
            const months = row.monthes.map(d => toNumber(d._id.month));
            const first_month = Math.min(...months);
            const last_month = Math.max(...months);

            for (let m = first_month; m <= last_month; m++) {
                const monthNum = (m <= 9) ? '0' + m : '' + m;
                // const from = `${row.year}-${monthNum}-01`;
                const current_month_days = row.monthes.filter(d => d._id.month === m);
                const days = current_month_days.map(day => day._id.day);
                const firsMonthDay = Math.min(...days);
                let lastMonthDay = Math.max(...days);
                if (firsMonthDay === lastMonthDay) {
                    lastMonthDay += 3;
                }
                for (let d = firsMonthDay; d <= lastMonthDay; d++) {
                    let day = current_month_days.find(f => f._id.day === d);
                    if (!day) {
                        day = {
                            Pending: 0,
                            Modification: 0,
                            Triage: 0,
                            Approve: 0,
                            Reject: 0,
                            Duplicate: 0,
                            Resolved: 0,
                            NotApplicable: 0,
                        };
                    }
                    const monthName = getMonthNameByNumber(monthNum);
                    if (d < 10) d = `0${d}`;
                    day.monthName = `${monthName}-${d}`;
                    item.monthes.push(day);
                }
                //months.push(monthNum);
                //  month.monthNumber = monthNum;
                // delete month._id;
                // item.monthes.push(month);
            }
            // for (let num = 1; num <= 12; num++) {
            //     let monthNum = (num <= 9) ? '0' + num : '' + num;
            //     let isFound = months.includes(monthNum);
            //     if (isFound)
            //         continue;
            //
            //     let month = {
            //         Pending: 0,
            //         Modification: 0,
            //         Triage: 0,
            //         Approve: 0,
            //         Reject: 0,
            //         Duplicate: 0,
            //         Resolved: 0,
            //         NotApplicable: 0,
            //     };
            //     month.monthName = getMonthNameByNumber(monthNum);
            //     month.monthNumber = monthNum;
            //     item.monthes.push(month);
            // }
            // item.monthes.sort((a, b) => a.monthNumber - b.monthNumber);
            result.push(item);
        }
        response.submissions = result;
        return response;
    }


    async statisticsSeverityReport(company_user_id, program_type, status, parent_user_id, access_program_list) {
        if (!isObjectID(company_user_id))
            return [];

        let programs = await this.getAllValidPrograms(company_user_id);
        if (programs && programs.length > 0 && parent_user_id && access_program_list && access_program_list.length > 0) {
            const access_program_ids = access_program_list.map(access_program => access_program._id.toString());
            programs = programs.filter(program => access_program_ids.includes(program._id.toString()));
        }
        const group_by_program_type = programs.map(program => program.is_next_generation).filter((value, index, self) => self.indexOf(value) === index).length > 1;
        const response = {group_by_program_type};
        let match = {
            "status": status === "approved" ? 4 : {$gte: 1, $lt: 10}
        };
        let rows = await SchemaModels.SubmitReportModel.aggregate([
            {
                "$match": {
                    "$and": [match],
                    "$or": [{"program_id": {$in: programs.map(program => toObjectID(program._id))}}]
                }
            },
            ...(program_type > 0 && group_by_program_type ? [
                {
                    $lookup: {
                        from: 'programs',
                        localField: 'program_id',
                        foreignField: '_id',
                        as: 'program_id'
                    }
                },
                {
                    $unwind: {path: "$program_id", preserveNullAndEmptyArrays: true}
                },
                {$match: {"program_id.is_next_generation": program_type - 1}}
            ] : []),
            {
                $group:
                    {
                        _id: {
                            year: {$year: "$submit_date_time"},
                            month: {$month: "$submit_date_time"}
                        },
                        "None": {
                            "$sum": {
                                "$cond":
                                    {if: {$eq: ["$severity", 0]}, then: 1, else: 0}
                            }
                        }
                        , "Low": {
                            "$sum": {
                                "$cond":
                                    {if: {$eq: ["$severity", 1]}, then: 1, else: 0}
                            }
                        }
                        , "Medium": {
                            "$sum": {
                                "$cond":
                                    {if: {$eq: ["$severity", 2]}, then: 1, else: 0}
                            }
                        }
                        , "High": {
                            "$sum": {
                                "$cond":
                                    {if: {$eq: ["$severity", 3]}, then: 1, else: 0}
                            }
                        }
                        , "Critical": {
                            "$sum": {
                                "$cond":
                                    {if: {$eq: ["$severity", 4]}, then: 1, else: 0}
                            }
                        }
                    }
            },
            {
                $group: {
                    _id: "$_id.year",
                    year: {$first: "$_id.year"},
                    monthes: {$push: "$$ROOT"},
                }
            },
            {
                $sort: {
                    year: 1
                }
            }
        ]).exec();
        let result = [];
        rows = rows.filter(row => !!row._id);
        const has_current_year = rows.find(row => row._id.toString() === "2022");
        if (!has_current_year) {
            rows.push({year: 2022, monthes: []});
        }
        for (let row of rows) {
            const item = {year: row.year};
            let months = [];
            item.monthes = [];
            for (let month of row.monthes) {
                if (month && month._id) {
                    const monthNum = (month._id.month <= 9) ? '0' + month._id.month : '' + month._id.month;
                    months.push(monthNum);
                    month.monthName = getMonthNameByNumber(monthNum);
                    month.monthNumber = monthNum;
                    delete month._id;
                    item.monthes.push(month);
                }
            }
            for (let num = 1; num <= 12; num++) {
                let monthNum = (num <= 9) ? '0' + num : '' + num;
                let isFound = months.includes(monthNum);
                if (isFound)
                    continue;

                let month = {
                    None: 0,
                    Low: 0,
                    Medium: 0,
                    High: 0,
                    Critical: 0,
                };
                month.monthName = getMonthNameByNumber(monthNum);
                month.monthNumber = monthNum;
                item.monthes.push(month);
            }
            item.monthes.sort((a, b) => a.monthNumber - b.monthNumber);
            result.push(item);
        }
        response.severrities = result;
        return response;
    }

    async statisticsVulnerabilityReport(company_user_id, status, parent_user_id, access_program_list) {
        if (!isObjectID(company_user_id))
            return [];

        let programs = await this.getAllPrograms(company_user_id);
        if (programs && programs.length > 0 && parent_user_id && access_program_list && access_program_list.length > 0) {
            const access_program_ids = access_program_list.map(access_program => access_program._id.toString());
            programs = programs.filter(program_id => access_program_ids.includes(program_id.toString()));
        }
        let match = {
            "status": status === "approved" ? 4 : {$gte: 1, $lt: 10},
            "program_id": {$in: programs}
        };

        let rows = await SchemaModels.SubmitReportModel.aggregate([
            {"$match": {"$and": [match]}},
            {
                $group:
                    {
                        _id: null,
                        "Injection1": {
                            "$sum": {
                                "$cond":
                                    {
                                        if: {$eq: ["$vulnerability_type_id", mongoose.Types.ObjectId("5ff55b7c695b06059753dd19")]},
                                        then: 1,
                                        else: 0
                                    }

                            }
                        }
                        , "Injection2": {
                            "$sum": {
                                "$cond":
                                    {
                                        if: {$eq: ["$vulnerability_type_id", mongoose.Types.ObjectId("5ff55b82695b06059753dd1a")]},
                                        then: 1,
                                        else: 0
                                    }

                            }
                        }
                        , "Injection3": {
                            "$sum": {
                                "$cond":
                                    {
                                        if: {$eq: ["$vulnerability_type_id", mongoose.Types.ObjectId("5ff59afb695b06059753dd5d")]},
                                        then: 1,
                                        else: 0
                                    }

                            }
                        }
                        , "Injection4": {
                            "$sum": {
                                "$cond":
                                    {
                                        if: {$eq: ["$vulnerability_type_id", mongoose.Types.ObjectId("5ff59b24695b06059753dd66")]},
                                        then: 1,
                                        else: 0
                                    }

                            }
                        }
                        , "Injection5": {
                            "$sum": {
                                "$cond":
                                    {
                                        if: {$eq: ["$vulnerability_type_id", mongoose.Types.ObjectId("5ff5a403695b06059753dd7a")]},
                                        then: 1,
                                        else: 0
                                    }

                            }
                        }
                        , "Injection6": {
                            "$sum": {
                                "$cond":
                                    {
                                        if: {$eq: ["$vulnerability_type_id", mongoose.Types.ObjectId("5ff5a4f7695b06059753dd9a")]},
                                        then: 1,
                                        else: 0
                                    }

                            }
                        }
                        , "Brokn1": {
                            "$sum": {
                                "$cond":
                                    {
                                        if: {$eq: ["$vulnerability_type_id", mongoose.Types.ObjectId("604ddc5b402ee72fea15450f")]},
                                        then: 1,
                                        else: 0
                                    }

                            }
                        }
                        , "Brokn2": {
                            "$sum": {
                                "$cond":
                                    {
                                        if: {$eq: ["$vulnerability_type_id", mongoose.Types.ObjectId("5ff59ae6695b06059753dd59")]},
                                        then: 1,
                                        else: 0
                                    }

                            }
                        }
                        , "Brokn3": {
                            "$sum": {
                                "$cond":
                                    {
                                        if: {$eq: ["$vulnerability_type_id", mongoose.Types.ObjectId("5ff59b4d695b06059753dd6e")]},
                                        then: 1,
                                        else: 0
                                    }

                            }
                        }
                        , "Brokn4": {
                            "$sum": {
                                "$cond":
                                    {
                                        if: {$eq: ["$vulnerability_type_id", mongoose.Types.ObjectId("5ff5a40f695b06059753dd7d")]},
                                        then: 1,
                                        else: 0
                                    }

                            }
                        }
                        , "Brokn5": {
                            "$sum": {
                                "$cond":
                                    {
                                        if: {$eq: ["$vulnerability_type_id", mongoose.Types.ObjectId("5ff5a457695b06059753dd85")]},
                                        then: 1,
                                        else: 0
                                    }

                            }
                        }
                        , "Brokn6": {
                            "$sum": {
                                "$cond":
                                    {
                                        if: {$eq: ["$vulnerability_type_id", mongoose.Types.ObjectId("5ff5a48a695b06059753dd87")]},
                                        then: 1,
                                        else: 0
                                    }

                            }
                        }
                        , "Brokn7": {
                            "$sum": {
                                "$cond":
                                    {
                                        if: {$eq: ["$vulnerability_type_id", mongoose.Types.ObjectId("5ff5a49e695b06059753dd8b")]},
                                        then: 1,
                                        else: 0
                                    }

                            }
                        }
                        , "Brokn8": {
                            "$sum": {
                                "$cond":
                                    {
                                        if: {$eq: ["$vulnerability_type_id", mongoose.Types.ObjectId("5ff5a4cd695b06059753dd95")]},
                                        then: 1,
                                        else: 0
                                    }

                            }
                        }
                        , "Brokn9": {
                            "$sum": {
                                "$cond":
                                    {
                                        if: {$eq: ["$vulnerability_type_id", mongoose.Types.ObjectId("5ff55cd4695b06059753dd3d")]},
                                        then: 1,
                                        else: 0
                                    }

                            }
                        }
                        , "Sensitive1": {
                            "$sum": {
                                "$cond":
                                    {
                                        if: {$eq: ["$vulnerability_type_id", mongoose.Types.ObjectId("5ff55ceb695b06059753dd3f")]},
                                        then: 1,
                                        else: 0
                                    }

                            }
                        }
                        , "Sensitive2": {
                            "$sum": {
                                "$cond":
                                    {
                                        if: {$eq: ["$vulnerability_type_id", mongoose.Types.ObjectId("5ff59acc695b06059753dd56")]},
                                        then: 1,
                                        else: 0
                                    }

                            }
                        }
                        , "Sensitive3": {
                            "$sum": {
                                "$cond":
                                    {
                                        if: {$eq: ["$vulnerability_type_id", mongoose.Types.ObjectId("5ff59b12695b06059753dd62")]},
                                        then: 1,
                                        else: 0
                                    }

                            }
                        }
                        , "Sensitive4": {
                            "$sum": {
                                "$cond":
                                    {
                                        if: {$eq: ["$vulnerability_type_id", mongoose.Types.ObjectId("5ff59b17695b06059753dd63")]},
                                        then: 1,
                                        else: 0
                                    }

                            }
                        }
                        , "Sensitive5": {
                            "$sum": {
                                "$cond":
                                    {
                                        if: {$eq: ["$vulnerability_type_id", mongoose.Types.ObjectId("5ff59b53695b06059753dd6f")]},
                                        then: 1,
                                        else: 0
                                    }

                            }
                        }
                        , "Sensitive6": {
                            "$sum": {
                                "$cond":
                                    {
                                        if: {$eq: ["$vulnerability_type_id", mongoose.Types.ObjectId("5ff59b6e695b06059753dd74")]},
                                        then: 1,
                                        else: 0
                                    }

                            }
                        }
                        , "Sensitive7": {
                            "$sum": {
                                "$cond":
                                    {
                                        if: {$eq: ["$vulnerability_type_id", mongoose.Types.ObjectId("5ff5a3fd695b06059753dd79")]},
                                        then: 1,
                                        else: 0
                                    }

                            }
                        }
                        , "Sensitive8": {
                            "$sum": {
                                "$cond":
                                    {
                                        if: {$eq: ["$vulnerability_type_id", mongoose.Types.ObjectId("5ff5a4b6695b06059753dd90")]},
                                        then: 1,
                                        else: 0
                                    }

                            }
                        }
                        , "Sensitive9": {
                            "$sum": {
                                "$cond":
                                    {
                                        if: {$eq: ["$vulnerability_type_id", mongoose.Types.ObjectId("5ff5a4bc695b06059753dd91")]},
                                        then: 1,
                                        else: 0
                                    }

                            }
                        }
                        , "XXE1": {
                            "$sum": {
                                "$cond":
                                    {
                                        if: {$eq: ["$vulnerability_type_id", mongoose.Types.ObjectId("5ff5a4ee695b06059753dd98")]},
                                        then: 1,
                                        else: 0
                                    }

                            }
                        }
                        , "XXE2": {
                            "$sum": {
                                "$cond":
                                    {
                                        if: {$eq: ["$vulnerability_type_id", mongoose.Types.ObjectId("5ff5a4f3695b06059753dd99")]},
                                        then: 1,
                                        else: 0
                                    }

                            }
                        }
                        , "Access1": {
                            "$sum": {
                                "$cond":
                                    {
                                        if: {$eq: ["$vulnerability_type_id", mongoose.Types.ObjectId("5ff55c0f695b06059753dd2b")]},
                                        then: 1,
                                        else: 0
                                    }

                            }
                        }
                        , "Access2": {
                            "$sum": {
                                "$cond":
                                    {
                                        if: {$eq: ["$vulnerability_type_id", mongoose.Types.ObjectId("5ff55c2c695b06059753dd2f")]},
                                        then: 1,
                                        else: 0
                                    }

                            }
                        }
                        , "Access3": {
                            "$sum": {
                                "$cond":
                                    {
                                        if: {$eq: ["$vulnerability_type_id", mongoose.Types.ObjectId("5ff55c34695b06059753dd30")]},
                                        then: 1,
                                        else: 0
                                    }

                            }
                        }
                        , "Access4": {
                            "$sum": {
                                "$cond":
                                    {
                                        if: {$eq: ["$vulnerability_type_id", mongoose.Types.ObjectId("5ff55c3d695b06059753dd31")]},
                                        then: 1,
                                        else: 0
                                    }

                            }
                        }
                        , "Access5": {
                            "$sum": {
                                "$cond":
                                    {
                                        if: {$eq: ["$vulnerability_type_id", mongoose.Types.ObjectId("5ff59ac7695b06059753dd55")]},
                                        then: 1,
                                        else: 0
                                    }

                            }
                        }
                        , "Access6": {
                            "$sum": {
                                "$cond":
                                    {
                                        if: {$eq: ["$vulnerability_type_id", mongoose.Types.ObjectId("5ff59b3f695b06059753dd6b")]},
                                        then: 1,
                                        else: 0
                                    }

                            }
                        }
                        , "Access7": {
                            "$sum": {
                                "$cond":
                                    {
                                        if: {$eq: ["$vulnerability_type_id", mongoose.Types.ObjectId("5ff59b58695b06059753dd70")]},
                                        then: 1,
                                        else: 0
                                    }

                            }
                        }
                        , "Security1": {
                            "$sum": {
                                "$cond":
                                    {
                                        if: {$eq: ["$vulnerability_type_id", mongoose.Types.ObjectId("5ff55d1f695b06059753dd44")]},
                                        then: 1,
                                        else: 0
                                    }

                            }
                        }
                        , "Security2": {
                            "$sum": {
                                "$cond":
                                    {
                                        if: {$eq: ["$vulnerability_type_id", mongoose.Types.ObjectId("5ff55d52695b06059753dd48")]},
                                        then: 1,
                                        else: 0
                                    }

                            }
                        }
                        , "XSS1": {
                            "$sum": {
                                "$cond":
                                    {
                                        if: {$eq: ["$vulnerability_type_id", mongoose.Types.ObjectId("5ff55b98695b06059753dd1d")]},
                                        then: 1,
                                        else: 0
                                    }

                            }
                        }
                        , "XSS2": {
                            "$sum": {
                                "$cond":
                                    {
                                        if: {$eq: ["$vulnerability_type_id", mongoose.Types.ObjectId("5ff55b9e695b06059753dd1e")]},
                                        then: 1,
                                        else: 0
                                    }

                            }
                        }
                        , "XSS3": {
                            "$sum": {
                                "$cond":
                                    {
                                        if: {$eq: ["$vulnerability_type_id", mongoose.Types.ObjectId("5ff55ba4695b06059753dd1f")]},
                                        then: 1,
                                        else: 0
                                    }

                            }
                        }
                        , "XSS4": {
                            "$sum": {
                                "$cond":
                                    {
                                        if: {$eq: ["$vulnerability_type_id", mongoose.Types.ObjectId("5ff55baa695b06059753dd20")]},
                                        then: 1,
                                        else: 0
                                    }

                            }
                        }
                        , "Insecure1": {
                            "$sum": {
                                "$cond":
                                    {
                                        if: {$eq: ["$vulnerability_type_id", mongoose.Types.ObjectId("5ff55bbc695b06059753dd23")]},
                                        then: 1,
                                        else: 0
                                    }

                            }
                        }
                        , "Insecure2": {
                            "$sum": {
                                "$cond":
                                    {
                                        if: {$eq: ["$vulnerability_type_id", mongoose.Types.ObjectId("5ff5a499695b06059753dd8a")]},
                                        then: 1,
                                        else: 0
                                    }

                            }
                        }
                        , "Using1": {
                            "$sum": {
                                "$cond":
                                    {
                                        if: {$eq: ["$vulnerability_type_id", mongoose.Types.ObjectId("5ff59aeb695b06059753dd5a")]},
                                        then: 1,
                                        else: 0
                                    }

                            }
                        }
                        , "Using2": {
                            "$sum": {
                                "$cond":
                                    {
                                        if: {$eq: ["$vulnerability_type_id", mongoose.Types.ObjectId("5ff5a4b6695b06059753dd90")]},
                                        then: 1,
                                        else: 0
                                    }

                            }
                        }

                        , "Using3": {
                            "$sum": {
                                "$cond":
                                    {
                                        if: {$eq: ["$vulnerability_type_id", mongoose.Types.ObjectId("5ff5a4c5695b06059753dd93")]},
                                        then: 1,
                                        else: 0
                                    }

                            }
                        }


                    }
            },
            {
                $project: {
                    _id: 0,
                    "Injection": {$add: ["$Injection1", "$Injection2", "$Injection3", "$Injection4", "$Injection5", "$Injection6"]},
                    "Brokn Autheentication": {$add: ["$Brokn1", "$Brokn2", "$Brokn3", "$Brokn4", "$Brokn5", "$Brokn6", "$Brokn7", "$Brokn8", "$Brokn9"]},
                    "Sensitive Data Exposure": {$add: ["$Sensitive1", "$Sensitive2", "$Sensitive3", "$Sensitive4", "$Sensitive5", "$Sensitive6", "$Sensitive7", "$Sensitive8", "$Sensitive9"]},
                    "XML External Entities (XXE)": {$add: ["$XXE1", "$XXE2"]},
                    "Broken Access Control": {$add: ["$Access1", "$Access2", "$Access3", "$Access4", "$Access5", "$Access6", "$Access7"]},
                    "Security Misconfiguration": {$add: ["$Security1", "$Security2"]},
                    "Cross-Site Scripting (XSS)": {$add: ["$XSS1", "$XSS2", "$XSS3", "$XSS4"]},
                    "Insecure Deserialization": {$add: ["$Insecure1", "$Insecure2"]},
                    "Using Components with Known Vulnerabilities": {$add: ["$Using1", "$Using2", "$Using3"]},
                }
            }
        ])
            .exec();
        let data = {};
        if (rows.length == 0) {
            data = {
                "Injection": 0,
                "Brokn Autheentication": 0,
                "Sensitive Data Exposure": 0,
                "XML External Entities (XXE)": 0,
                "Broken Access Control": 0,
                "Security Misconfiguration": 0,
                "Cross-Site Scripting (XSS)": 0,
                "Insecure Deserialization": 0,
                "Using Components with Known Vulnerabilities": 0,
            }
        } else {
            data = rows[0];
        }
        return data;

    }

    async setReportNotificationType(user_id, report_notification_setting) {

        user_id = safeString(user_id);
        const result = await this.collection.findOneAndUpdate({"_id": user_id}, {
            $set: {report_notification_setting}
        });
        if (!result) {
            return 3;
        }
        return 0
    }

    async getTransactionHistoryList(user_id, program_id, hacker_user_name, report_severity, parent_user_id, access_program_list) {
        if (!isObjectID(user_id))
            return 1;
        const ret = {}
        ret.rows = [];
        ret.totalRows = 0;
        ret.totalPage = 0;
        ret.remaining = 0;
        ret.total_deposit = 0;
        ret.total_spent = 0;
        ret.currentPage = gPage;
        if (program_id !== "" && !isObjectID(program_id)) {
            return ret;
        }
        if (report_severity != '') {
            report_severity = toNumber(report_severity);
            if (report_severity <= 0 || report_severity >= 5)
                report_severity = 0;
        }

        let match = {
            "company_user_id": user_id
        };
        if (parent_user_id && access_program_list && access_program_list.length > 0) {
            match.program_id = {
                $in: access_program_list.map(p => p._id)
            }
        }
        const limit = 10;
        const skip = (gPage - 1) * limit;
        const result = await SchemaModels.PaymentHistoryModel.aggregate([
            {
                "$match": {
                    "$and": [match],
                }
            },

            {
                $lookup: {
                    from: 'programs',
                    localField: 'program_id',
                    foreignField: '_id',
                    as: 'program_id'
                }
            },
            {
                $unwind: {path: "$program_id", preserveNullAndEmptyArrays: true}
            },
            {
                $match: {
                    $and: [{"program_id.is_next_generation": PROGRAM_BOUNTY_TYPE.BUG_BOUNTY},
                        {$or: [{"program_id.status": PROGRAM_STATUS.APPROVED}, {"program_id.status": PROGRAM_STATUS.CLOSE}]}]
                }
            },
            ...(program_id !== "" ? [{
                        "$match": {
                            "program_id._id": mongoose.Types.ObjectId(program_id)
                        }
                    }]
                    : []
            ),
            {
                $lookup: {
                    from: 'hacker_users',
                    localField: 'hacker_user_id',
                    foreignField: '_id',
                    as: 'hacker_user_id'
                }
            },
            {
                $unwind: {path: "$hacker_user_id", preserveNullAndEmptyArrays: true}
            },
            ...(hacker_user_name !== "" ? [{
                        "$match": {
                            "hacker_user_id.username": {$regex: ".*" + hacker_user_name + ".*", $options: "i"}
                        }
                    }]
                    : []
            ),
            {
                $lookup: {
                    from: 'submit_reports',
                    localField: 'report_id',
                    foreignField: '_id',
                    as: 'report_id'
                }
            },
            {
                $unwind: {path: "$report_id", preserveNullAndEmptyArrays: true}
            },
            ...(report_severity !== "" ? [{
                        "$match": {
                            "report_id.severity": report_severity
                        }
                    }]
                    : []
            ),
            {
                $sort: {"register_date_time": -1}
            },
            {
                $facet: {
                    totalRows: [
                        {
                            $count: "count",
                        },
                    ],
                    rows: [
                        {
                            $skip: skip,
                        },
                        {$limit: limit},
                        {
                            $project: {
                                _id: 0,
                                register_date_time: 1,
                                amount: 1,
                                is_positive: 1,
                                program_id: {name: 1},
                                report_id: {severity: 1, _id: 1},
                                hacker_user_id: {username: 1},
                            }
                        }
                    ]
                }
            }
        ]);
        if (result && result.length > 0 && result[0].totalRows.length > 0) {
            ret.rows = result[0].rows;
            ret.totalRows = result[0].totalRows[0].count;
            ret.totalPage = Math.ceil(ret.totalRows / limit);
        }
        if ((result && result.length > 0 && result[0].totalRows.length > 0) ||
            (report_severity !== "" || hacker_user_name !== "" || program_id !== "")) {
            const transactions = await SchemaModels.PaymentHistoryModel
                .aggregate([
                    {
                        $match: {"company_user_id": user_id}
                    },
                    {
                        $lookup: {
                            from: 'programs',
                            localField: 'program_id',
                            foreignField: '_id',
                            as: 'program_id'
                        }
                    },
                    {
                        $unwind: {path: "$program_id", preserveNullAndEmptyArrays: true}
                    },
                    {
                        $match: {
                            $and: [{"program_id.is_next_generation": PROGRAM_BOUNTY_TYPE.BUG_BOUNTY},
                                {$or: [{"program_id.status": PROGRAM_STATUS.APPROVED}, {"program_id.status": PROGRAM_STATUS.CLOSE}]}]
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            amount: 1,
                            is_positive: 1
                        }
                    }
                ]);
            if (transactions && transactions.length > 0) {
                const deposit_amounts = transactions.filter(f => f.is_positive === true).map(d => d.amount);
                ret.total_deposit = deposit_amounts.reduce((a, b) => a + b, 0);
                const spent_amounts = transactions.filter(f => f.is_positive === false).map(d => d.amount);
                ret.total_spent = spent_amounts.reduce((a, b) => a + b, 0);
                ret.remaining = ret.total_deposit - ret.total_spent;
            }
        }
        ret.program_list = await SchemaModels.ProgramModel.find({
            $and: [{"company_user_id": user_id}, {is_next_generation: PROGRAM_BOUNTY_TYPE.BUG_BOUNTY}, {$or: [{status: PROGRAM_STATUS.APPROVED}, {status: PROGRAM_STATUS.CLOSE}]}]
        }).select({name: 1});
        return ret;
    }

    async getCompanyProgramsId(company_user_id) {
        let programs = await SchemaModels.ProgramModel.aggregate([
            {$match: {$and: [{company_user_id: mongoose.Types.ObjectId(company_user_id)}, {$or: [{status: PROGRAM_STATUS.APPROVED}, {status: PROGRAM_STATUS.CLOSE}]}]}},
            {$project: {_id: 0, program_id: "$_id"}}
        ]);
        return programs.map(d => d.program_id);
    }

    async getCompanyBugBountyProgramsId(company_user_id) {
        let programs = await SchemaModels.ProgramModel.aggregate([
            {
                $match: {
                    $and: [{company_user_id: mongoose.Types.ObjectId(company_user_id)},
                        {is_next_generation: PROGRAM_BOUNTY_TYPE.BUG_BOUNTY},
                        {$or: [{status: PROGRAM_STATUS.APPROVED}, {status: PROGRAM_STATUS.CLOSE}]}]
                }
            },
            {$project: {_id: 0, program_id: "$_id"}}
        ]);
        return programs.map(d => d.program_id);
    }

    async statisticsRewardTimeline(company_user_id, parent_user_id, access_program_list) {
        let program_ids = await this.getCompanyBugBountyProgramsId(company_user_id);
        let match = {};
        if (parent_user_id && access_program_list && access_program_list.length > 0) {
            match.program_id = {
                $in: access_program_list.map(p => p._id)
            }
        }
        const transactions_group_by_program = await SchemaModels.PaymentHistoryModel.aggregate([
            {
                "$match":
                    {
                        "$and": [match],
                        "$or": [{company_user_id: mongoose.Types.ObjectId(company_user_id)}, {program_id: {$in: program_ids}}],
                    }
            },
            {$lookup: {from: "programs", localField: "program_id", foreignField: "_id", as: "program"}},
            {$unwind: {path: "$program", preserveNullAndEmptyArrays: true}},
            {$sort: {"register_date_time": 1}},
            {
                $group: {
                    _id: "$program_id",
                    program_name: {$first: "$program.name"},
                    payments: {$push: {is_positive: "$is_positive", amount: "$amount"}}
                }
            },
            {$project: {program_name: 1, payments: 1}}
        ]);
        const result = [];
        transactions_group_by_program.forEach((item, idx) => {
            let prev_amount = 0;
            const data = {
                name: item.program_name,
                stroke: getRandomColor(idx > 7 ? 7 : idx),
                data: item.payments.map((payment, i) => {
                    const return_data = {
                        category: i + 1, value: i === 0 ?
                            payment.amount : (payment.is_positive ? prev_amount + payment.amount : prev_amount - payment.amount)
                    };
                    prev_amount = i === 0 ? payment.amount : (payment.is_positive ? prev_amount + payment.amount : prev_amount - payment.amount);
                    return return_data;
                })
            }
            result.push(data);
        });
        return result;
    }

    async save2faKey(id, key) {
        if (!isObjectID(id))
            return 0;

        let data = {
            "google_towfa_secret_key": key,
        };
        let x = await this.collection.updateOne({"_id": id}, {
                $set: data
            }
        );
        return 1;
    }


    async reset2aKey(id) {
        if (!isObjectID(id))
            return 0;

        let data = {
            "google_towfa_secret_key": '',
            'google_towfa_status': 0
        };
        let x = await this.collection.updateOne({"_id": id}, {
                $set: data
            }
        );
        return 1;
    }


    async active2fa(id) {
        if (!isObjectID(id))
            return 0;

        let data = {
            "google_towfa_status": 1,
        };
        let x = await this.collection.updateOne({"_id": id}, {
                $set: data
            }
        );
        return 1;
    }

    async listSession(user_id, current_token) {
        try {
            let rows = await ftSearchMultiArgs('sbloginIndex', `@user_id:${user_id}`, 'sortby', 'date_time', 'DESC', 'RETURN', '5', 'date_time', 'user_agent', 'ip', 'session_hash_id', 'token');
            let data = await toArrayObjectWithoutKey(rows);
            if (isArray(data)) {
                data.forEach(session => {
                    session.is_current = session.token === current_token;
                    delete session.token;
                });
            }
            return data;
        } catch (e) {
            return [];
        }
    }

    async getSettingsByKey(keys) {
        const settings = await SchemaModels.SettingModel.find({key: {$in: keys}}).lean();
        let response = {};
        settings.forEach(setting => response[`${setting.key}`] = setting.value);
        return response;
    }

    async checkIsFileOwner(company_user_id, name, type, id) {
        const programs = await SchemaModels.ProgramModel.find({company_user_id});
        if (type === "comment") {
            const comment = await SchemaModels.CommentSubmitReportModel.findOne({$and: [{_id: id}, {$or: [{file1: name}, {file2: name}, {file3: name}]}]});
            if (!comment) {
                return false;
            }
            return !!(await SchemaModels.SubmitReportModel.countDocuments({
                _id: comment.report_id,
                program_id: {$in: programs.map(program => program._id.toString())}
            }));
        } else if (type === "report") {
            return !!(await SchemaModels.SubmitReportModel.countDocuments({
                _id: id,
                program_id: {$in: programs.map(program => program._id.toString())},
                report_files: {$elemMatch: {file_name: name}}
            }));
        }
        return true;
    }

    async disabledMemberAccount(parent_user_id, member_id, account_is_disable) {
        const company = await this.collection.findOneAndUpdate({
            _id: member_id, parent_user_id
        }, {$set: {account_is_disable}});
        if (!company) {
            return 1;
        }
        return 0;
    }
}

module.exports = new CompanyUserModel();