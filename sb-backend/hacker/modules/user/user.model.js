const companyIO = require("../../../io/company");

class HackerUserModel {
    constructor() {
        this.collection = SchemaModels.HackerUserModel;
    }


    async getCountReport(hacker_id) {
        let L = await SchemaModels.SubmitReportModel.find({
            "hacker_user_id": hacker_id,
            "status": {$in: [4, 7]},
            "severity": 1
        }).countDocuments();
        let M = await SchemaModels.SubmitReportModel.find({
            "hacker_user_id": hacker_id,
            "status": {$in: [4, 7]},
            "severity": 2
        }).countDocuments();
        let H = await SchemaModels.SubmitReportModel.find({
            "hacker_user_id": hacker_id,
            "status": {$in: [4, 7]},
            "severity": 3
        }).countDocuments();
        let C = await SchemaModels.SubmitReportModel.find({
            "hacker_user_id": hacker_id,
            "status": {$in: [4, 7]},
            "severity": 4
        }).countDocuments();
        let ret = {
            "L": L,
            "M": M,
            "H": H,
            "C": C
        };
        return ret;
    }


    async getDataData(user) {
        let kycBasic = getHackerKycBasic(user);
        let kycAdvanced = getHackerKycAdvanced(user);
        let cve_file = !isUndefined(user.cve_file) && user.cve_file !== "" ? AppConfig.API_URL + user.cve_file : "";
        let tax_file = !isUndefined(user.tax_file) && user.tax_file !== "" ? AppConfig.API_URL + user.tax_file : "";
        let avatar_file = !isUndefined(user.avatar_file) && user.avatar_file !== "" ? AppConfig.API_URL + user.avatar_file : "";
        let identity_passport_file = !isUndefined(user.identity_passport_file) && user.identity_passport_file !== "" ? AppConfig.API_URL + user.identity_passport_file : "";
        let identity_card_file = !isUndefined(user.identity_card_file) && user.identity_card_file !== "" ? AppConfig.API_URL + user.identity_card_file : "";
        let identity_driver_file = !isUndefined(user.identity_driver_file) && user.identity_driver_file !== "" ? AppConfig.API_URL + user.identity_driver_file : "";
        let certificate_files = user.certificate_files.map(item => {
            item.file_name = AppConfig.API_URL + item.file_name
            return item;
        });
        let sb_coin = isUndefined(user.sb_coin) ? 0 : user.sb_coin;
        let reputaion = isUndefined(user.reputaion) ? 0 : user.reputaion;
        let point = isUndefined(user.point) ? 0 : user.point;
        let countReport = await this.getCountReport(user._id);
        let rank = setHackerRank(user.rank);
        let googleAuth = (!isUndefined(user.google_towfa_status) && user.google_towfa_status == 1) ? true : false;
        let userData = {
            "count_report": countReport
            , "rank": rank
            , "has_skills": !!(user.skills && user.skills.length > 0)
            , "token_expire_time": token_setting.expire_date_time
            , "google_auth": googleAuth
            , "current_date_time": getDateTime()
            , "email": user.email
            , "tag": user.tag || []
            , "sb_coin": sb_coin
            , "reputaion": reputaion
            , "privilage": (sb_coin + reputaion)
            , "point": point
            , "kyc_basic": kycBasic
            , "kyc_advanced": kycAdvanced
            , "certificate_files": certificate_files
            , "status": user.status
            , "competency_profile": user.competency_profile
            , "username": user.username.toLowerCase()
            , "profile_visibility": user.profile_visibility
            , "report_notification_setting": user.report_notification_setting
            , "about": text2html(user.about)
            , "github_url": user.github_url
            , "twitter_url": user.twitter_url
            , "linkedin_url": user.linkedin_url
            , "website_url": user.website_url
            , "first_name": user.fn
            , "last_name": user.ln
            , "is_verify": user.is_verify
            , "account_is_disable": user.account_is_disable
            , "cve_file": cve_file
            , "cve_file_original_name": user.cve_file_original_name
            , "tax_file": tax_file
            , "avatar_file": avatar_file
            , "invitation": user.invitation
            , "identity": {
                "identity_country_id": user.identity_country_id
                , "identity_passport": {
                    "url": identity_passport_file,
                    "status": user.identity_passport_file_status,
                    "type": 1
                }
                , "identity_card": {
                    "url": identity_card_file,
                    "status": user.identity_card_file_status,
                    "type": 2
                }
                , "identity_driver": {
                    "url": identity_driver_file,
                    "status": user.identity_driver_file_status,
                    "type": 3
                }
            }
            , "champion_requirements": {
                review_application: user.review_application || false,
                video_recorded_interview: user.video_recorded_interview || false,
                technical_interview: user.technical_interview || false,
                mobile_address_verification: user.mobile_address_verification || false,
                verification_of_two_references: user.verification_of_two_references || false,
                contract_agreement: user.contract_agreement || false,
            }
            , "payment": {
                "payment_default": user.payment_default
                , "payment_paypal_email": user.payment_paypal_email
                , "payment_usdt_public_key": user.payment_usdt_public_key
                , "payment_bank_transfer_type": user.payment_bank_transfer_type
                , "payment_bank_transfer_iban": user.payment_bank_transfer_iban
                , "payment_bank_transfer_bic": user.payment_bank_transfer_bic
                , "payment_bank_transfer_account_holder": user.payment_bank_transfer_account_holder
                , "payment_bank_transfer_country_id": user.payment_bank_transfer_country_id
                , "payment_bank_transfer_country_id_residence": user.payment_bank_transfer_country_id_residence
                , "payment_bank_transfer_currency_id": user.payment_bank_transfer_currency_id
            }
            , "personal": {
                "country_id": user.country_id
                , "country_id_residence": user.country_id_residence
                , "incoming_range_id": user.incoming_range_id
                , "address1": user.address1
                , "address2": user.address2
                , "city": user.city
                , "region": user.region
                , "postal_code": user.postal_code
            }

        };
        return userData;
    }

    async register(username, email, password, fist_name, last_name) {
        let user_id = await nextID('user_id');
        password = makeHash(password);
        let activation_code = makeKey(randomStr(10));
        let i = this.collection({
            "email": email.toLowerCase(),
            "user_id": user_id,
            "rank": 100,
            "password": password, "username": username
            , "temp": activation_code, "is_verify": false,
            "fn": fist_name,
            "ln": last_name,
            "register_date_time": getDateTime()
        });
        let r = await i.save();

        // const history_model = {
        //     sender_type: SENDER_TYPE.HACKER,
        //     activity: ACTIVITY_TEXT_LOG.REGISTER,
        //     sender_id: r._id,
        //     resource_type: RESOURCE_TYPE.HACKER,
        //     resource_id: r._id,
        //     register_date_time: getDateTime()
        // };
        // await SchemaModels.HistoryModel.create(history_model);
        return activation_code;
    }

    async checkEmailAndSiblings(email) {
        email = email.toLowerCase();
        const plus_email_index = email.indexOf("+");
        if (plus_email_index !== -1) {
            const at_sign_email_index = email.lastIndexOf("@");
            const sibling = email.substring(plus_email_index, at_sign_email_index);
            email = email.replace(sibling, "");
        }
        const result = await this.collection.aggregate([
            {
                $addFields: {
                    parent_email: {
                        $cond: {
                            if:
                                {$eq: [{$indexOfBytes: ["$email", "+"]}, -1]},
                            then: "$email",
                            else: {
                                $replaceAll: {
                                    input: "$email", find: {
                                        $substr: ["$email", {$indexOfBytes: ["$email", "+"]},
                                            {$subtract: [{$indexOfBytes: ["$email", "@"]}, {$indexOfBytes: ["$email", "+"]}]}]
                                    }, replacement: ""
                                }
                            }
                        }
                    }
                }
            },
            {$match: {parent_email: {$regex: `^${email}$`, "$options": "i"}}},
            {$count: "count"}]);
        return result && result[0] ? result && result[0].count : 0;
    }

    async checkEmail(email) {
        email = email.toLowerCase();
        return this.collection.findOne({email: {$regex: `^${email}$`, "$options": "i"}}).countDocuments();
    }

    async checkUsername(username) {
        return this.collection.findOne({username: {$regex: `^${username}$`, "$options": "i"}}).countDocuments();
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
        return this.collection.findOne(
            {
                "email": email,
                "is_verify": false
            }
        );
    }

    async checkEmailForReset(email) {
        return this.collection.findOne(
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
        // const history_model = {
        //     sender_type: SENDER_TYPE.HACKER,
        //     activity: ACTIVITY_TEXT_LOG.VERIFY_EMAIL,
        //     sender_id: id,
        //     resource_type: RESOURCE_TYPE.HACKER,
        //     resource_id: id,
        //     register_date_time: getDateTime()
        // };
        // await SchemaModels.HistoryModel.create(history_model);
        return 1;
    }


    async login(email, password) {
        password = makeHash(password);
        let result = await this.collection.findOne({
            "email": email
            , "password": password
        })
            .populate('country_id')
            .populate('country_id_residence')
            .populate('incoming_range_id')
            .populate('payment_bank_transfer_country_id')
            .populate('payment_bank_transfer_country_id_residence')
            .populate('payment_bank_transfer_currency_id')
            .populate('identity_country_id');
        if (result) {
            if (result['is_verify']) {
                if (result['status'] && !result["account_is_disable"]) {
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
        return this.collection.findOne({"_id": id});
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

    async updateNewPassword(id, password, action_name) {
        if (!isObjectID(id))
            return 1;

        password = makeHash(password);
        let data = {
            "password": password,
            "temp": "",
        };
        await this.collection.updateOne({"_id": id}, {$set: data});
        // const history_model = {
        //     sender_type: SENDER_TYPE.HACKER,
        //     sender_id: id,
        //     resource_type: RESOURCE_TYPE.HACKER,
        //     resource_id: id,
        //     register_date_time: getDateTime()
        // };
        // if (action_name === "change_password") {
        //     history_model.activity = ACTIVITY_TEXT_LOG.CHANGE_PASSWORD;
        // } else if (action_name === "reset_password") {
        //     history_model.activity = ACTIVITY_TEXT_LOG.RESET_PASSWORD;
        // }
        // await SchemaModels.HistoryModel.create(history_model);
        return 0;
    }

    async updateProfileUrlData(currentUser, profile_visibility
        , about, github_url, twitter_url, linkedin_url, website_url, fn, ln
        , username, competency_profile, tags) {
        if (!isObjectID(currentUser._id))
            return 1;

        let data = {
            "competency_profile": competency_profile,
            "profile_visibility": profile_visibility,
            "about": about,
            "github_url": github_url,
            "twitter_url": twitter_url,
            "linkedin_url": linkedin_url,
            "website_url": website_url,
        };

        if (currentUser['username'].toLowerCase() !== username) {
            //check username is exists
            let isUsername = await this.checkUsername(username);
            if (isUsername > 0) {
                return -1;
            } else if (tags.includes(HACKER_TAGS.INTERNAL_USER)) {
                return 2;
            } else {
                data['username'] = username;
            }
        }

        if (!(currentUser.identity_passport_file_status === 1
            || currentUser.identity_card_file_status === 1
            || currentUser.identity_driver_file_status === 1)) {
            data['fn'] = fn;
            data['ln'] = ln;
        }
        // const fields = [];
        // for (const key in data) {
        //     if ((currentUser[key] === undefined && hasValue(data[key])) || currentUser[key].toString() !== data[key].toString()) {
        //         fields.push({key, old_value: currentUser[key], new_value: data[key]});
        //     }
        // }
        await this.collection.updateOne({"_id": currentUser._id}, {$set: data});
        // if (fields.length > 0) {
        //     const history_model = {
        //         sender_type: SENDER_TYPE.HACKER,
        //         activity: ACTIVITY_TEXT_LOG.UPDATE_PROFILE,
        //         sender_id: currentUser._id,
        //         resource_type: RESOURCE_TYPE.HACKER,
        //         resource_id: currentUser._id,
        //         fields,
        //         register_date_time: getDateTime()
        //     };
        //     await SchemaModels.HistoryModel.create(history_model);
        // }
        return 0;
    }

    async disabledAccount(id, status) {
        if (!isObjectID(id))
            return 1;

        let data = {
            "account_is_disable": status,
        };
        const user = await this.collection.findOneAndUpdate({"_id": id}, {$set: data});

        // const history_model = {
        //     sender_type: SENDER_TYPE.HACKER,
        //     activity: ACTIVITY_TEXT_LOG.UPDATE_ACTIVITY,
        //     sender_id: id,
        //     resource_type: RESOURCE_TYPE.HACKER,
        //     resource_id: id,
        //     fields: [{key: "account_is_disable", old_value: user.account_is_disable, new_value: status}],
        //     register_date_time: getDateTime()
        // };
        // await SchemaModels.HistoryModel.create(history_model);
        return 1;
    }

    async getSkills(skills_id) {
        if (!isObjectID(skills_id))
            return 0;
        return SchemaModels.SkillsModel.findOne({"_id": skills_id, "status": true}).countDocuments();
    }


    async saveSkills(user_id, dataSkills) {
        if (isObjectID(user_id)) {
            let data = {skills: dataSkills};
            const user = await this.collection.findOneAndUpdate({"_id": user_id}, {$set: data});
            if (!user) {
                return 1;
            }
            // const history_model = {
            //     sender_type: SENDER_TYPE.HACKER,
            //     activity: ACTIVITY_TEXT_LOG.UPDATE_SKILLS,
            //     sender_id: user_id,
            //     resource_type: RESOURCE_TYPE.HACKER,
            //     resource_id: user_id,
            //     fields: [{key: "skills", old_value: user.skills, new_value: dataSkills}],
            //     register_date_time: getDateTime()
            // };
            // await SchemaModels.HistoryModel.create(history_model);
            return 0;
        } else
            return 1;
    }

    async getSkillsList(user_id) {
        if (isObjectID(user_id)) {
            return this.collection.findOne({"_id": user_id})
                .populate('skills.skills_id').select({_id: 0, skills: 1, proficiency: 1}).exec();
        } else
            return null;

    }

    async getCountry(country_id) {
        if (!isObjectID(country_id))
            return 0;
        return SchemaModels.CountryModel.findOne({"_id": country_id, "status": true}).countDocuments();
    }

    async getRange(range_id) {
        if (!isObjectID(range_id))
            return 0;
        return SchemaModels.RangeModel.findOne({"_id": range_id, "status": true}).countDocuments();
    }


    async updateProfilePersonalData(id, country_id
        , country_id_residence, address1, address2, city, region
        , postal_code, incoming_range_id) {
        if (!isObjectID(id))
            return 1;


        let data = {
            "address1": address1,
            "address2": address2,
            "city": city,
            "region": region,
            "postal_code": postal_code,
        };
        if (country_id != '' && isObjectID(country_id)) {
            data['country_id'] = country_id;
        }
        if (country_id_residence != '' && isObjectID(country_id_residence)) {
            data['country_id_residence'] = country_id_residence;
        }
        if (incoming_range_id != '' && isObjectID(incoming_range_id)) {
            data['incoming_range_id'] = incoming_range_id;
        }
        // const fields = [];
        const user = await this.collection.findOneAndUpdate({"_id": id}, {$set: data});
        if (!user) {
            return 1;
        }
        // for (const key in data) {
        //     if ((user[key] === undefined && hasValue(data[key])) || user[key].toString() !== data[key].toString()) {
        //         fields.push({key, old_value: user[key], new_value: data[key]});
        //     }
        // }
        // if (fields.length > 0) {
        //     const history_model = {
        //         sender_type: SENDER_TYPE.HACKER,
        //         activity: ACTIVITY_TEXT_LOG.UPDATE_PERSONAL_INFO,
        //         sender_id: id,
        //         resource_type: RESOURCE_TYPE.HACKER,
        //         resource_id: id,
        //         fields,
        //         register_date_time: getDateTime()
        //     };
        //     await SchemaModels.HistoryModel.create(history_model);
        // }
        return 0;
    }

    async updateCVE(id, cve, cve_file_original_name) {
        if (!isObjectID(id))
            return 1;

        let data = {
            "cve_file": cve,
            "cve_file_original_name": cve_file_original_name
        };
        const user = await this.collection.findOneAndUpdate({"_id": id}, {$set: data});
        if (!user) {
            return 1;
        }
        // const history_model = {
        //     sender_type: SENDER_TYPE.HACKER,
        //     activity: ACTIVITY_TEXT_LOG.UPLOAD_CVE,
        //     sender_id: id,
        //     resource_type: RESOURCE_TYPE.HACKER,
        //     resource_id: id,
        //     fields: [
        //         {
        //             key: "cve_file_original_name",
        //             old_value: user.cve_file_original_name,
        //             new_value: cve_file_original_name
        //         },
        //         {
        //             key: "cve_file",
        //             old_value: user.cve_file,
        //             new_value: cve
        //         }
        //     ],
        //     register_date_time: getDateTime()
        // };
        // await SchemaModels.HistoryModel.create(history_model);
        return 0;
    }

    async updateAvatar(id, img) {
        if (!isObjectID(id))
            return 1;

        let data = {
            "avatar_file": img,
        };
        const user = await this.collection.findOneAndUpdate({"_id": id}, {$set: data});
        if (!user) {
            return 1;
        }
        // const history_model = {
        //     sender_type: SENDER_TYPE.HACKER,
        //     activity: ACTIVITY_TEXT_LOG.UPLOAD_AVATAR,
        //     sender_id: id,
        //     resource_type: RESOURCE_TYPE.HACKER,
        //     resource_id: id,
        //     fields: [{key: "avatar_file", old_value: user.avatar_file, new_value: img}],
        //     register_date_time: getDateTime()
        // };
        // await SchemaModels.HistoryModel.create(history_model);
        return 0;
    }

    async deleteAvatar(id) {
        if (!isObjectID(id))
            return 1;

        let data = {
            "avatar_file": "",
        };
        const user = await this.collection.findOneAndUpdate({"_id": id}, {$set: data});
        if (!user) {
            return 1;
        }
        // const history_model = {
        //     sender_type: SENDER_TYPE.HACKER,
        //     activity: ACTIVITY_TEXT_LOG.DELETE_AVATAR,
        //     sender_id: id,
        //     resource_type: RESOURCE_TYPE.HACKER,
        //     resource_id: id,
        //     fields: [{key: "avatar_file", old_value: user.avatar_file, new_value: ""}],
        //     register_date_time: getDateTime()
        // };
        // await SchemaModels.HistoryModel.create(history_model);
        return 0;
    }


    async deleteCVE(id) {
        if (!isObjectID(id))
            return 1;

        let data = {
            "cve_file": "",
            "cve_file_original_name": ""
        };
        const user = await this.collection.findOneAndUpdate({"_id": id}, {$set: data});
        if (!user) {
            return 1;
        }
        // const history_model = {
        //     sender_type: SENDER_TYPE.HACKER,
        //     activity: ACTIVITY_TEXT_LOG.DELETE_CVE,
        //     sender_id: id,
        //     resource_type: RESOURCE_TYPE.HACKER,
        //     resource_id: id,
        //     fields: [
        //         {
        //             key: "cve_file_original_name",
        //             old_value: user.cve_file_original_name,
        //             new_value: ""
        //         },
        //         {
        //             key: "cve_file",
        //             old_value: user.cve_file,
        //             new_value: ""
        //         }
        //     ],
        //     register_date_time: getDateTime()
        // };
        // await SchemaModels.HistoryModel.create(history_model);
        return 0;
    }

    async updateInvitation(id, val) {
        if (!isObjectID(id))
            return 1;

        let data = {
            "invitation": val,
        };
        await this.collection.updateOne({"_id": id}, {$set: data});
        // const history_model = {
        //     sender_type: SENDER_TYPE.HACKER,
        //     activity: ACTIVITY_TEXT_LOG.UPDATE_INVITATION,
        //     sender_id: id,
        //     resource_type: RESOURCE_TYPE.HACKER,
        //     resource_id: id,
        //     fields: [{key: "invitation", old_value: !val, new_value: val}],
        //     register_date_time: getDateTime()
        // };
        // await SchemaModels.HistoryModel.create(history_model);
        return 0;
    }

    async updatePaymentPaypal(id, payment_paypal_email, payment_default, was_payment_default) {
        if (!isObjectID(id))
            return 1;

        let data = {
            "payment_paypal_email": payment_paypal_email,
        };
        if ((toNumber(payment_default) > 0 && toNumber(payment_default) < 4) || was_payment_default) {
            data["payment_default"] = toNumber(payment_default);
        }
        // const fields = [];
        const user = await this.collection.findOneAndUpdate({"_id": id}, {$set: data});
        if (!user) {
            return 1;
        }
        // for (const key in data) {
        //     if ((user[key] === undefined && hasValue(data[key])) || user[key].toString() !== data[key].toString()) {
        //         fields.push({key, old_value: user[key], new_value: data[key]});
        //     }
        // }
        // if (fields.length > 0) {
        //     const history_model = {
        //         sender_type: SENDER_TYPE.HACKER,
        //         activity: ACTIVITY_TEXT_LOG.UPDATE_PAYPAL_PAYMENT,
        //         sender_id: id,
        //         resource_type: RESOURCE_TYPE.HACKER,
        //         resource_id: id,
        //         fields,
        //         register_date_time: getDateTime()
        //     };
        //     await SchemaModels.HistoryModel.create(history_model);
        // }
        return 0;
    }

    async clearPaymentPaypal(id, payment_default) {
        if (!isObjectID(id))
            return 1;


        let data = {
            "payment_paypal_email": ''
        };
        if (payment_default === PAYMENT_DEFAULT.PAYPAL) {
            data["payment_default"] = PAYMENT_DEFAULT.NONE
        }
        // const fields = [];
        const user = await this.collection.findOneAndUpdate({"_id": id}, {$set: data});
        if (!user) {
            return 1;
        }
        // for (const key in data) {
        //     if (!user[key] || user[key].toString() !== data[key].toString()) {
        //         fields.push({key, old_value: user[key], new_value: data[key]});
        //     }
        // }
        // const history_model = {
        //     sender_type: SENDER_TYPE.HACKER,
        //     activity: ACTIVITY_TEXT_LOG.CLEAR_PAYPAL_PAYMENT,
        //     sender_id: id,
        //     resource_type: RESOURCE_TYPE.HACKER,
        //     resource_id: id,
        //     fields,
        //     register_date_time: getDateTime()
        // };
        // await SchemaModels.HistoryModel.create(history_model);
        return 0;
    }


    async updatePaymentUSDT(id, payment_usdt_public_key, payment_default, was_payment_default) {
        if (!isObjectID(id))
            return 1;


        let data = {
            "payment_usdt_public_key": payment_usdt_public_key,
        };
        if ((toNumber(payment_default) > 0 && toNumber(payment_default) < 4) || was_payment_default) {
            data["payment_default"] = toNumber(payment_default)
        }
        //   const fields = [];
        const user = await this.collection.findOneAndUpdate({"_id": id}, {$set: data});
        if (!user) {
            return 1;
        }
        // for (const key in data) {
        //     if (!user[key] || user[key].toString() !== data[key].toString()) {
        //         fields.push({key, old_value: user[key], new_value: data[key]});
        //     }
        // }
        // const history_model = {
        //     sender_type: SENDER_TYPE.HACKER,
        //     activity: ACTIVITY_TEXT_LOG.UPDATE_USDT_PAYMENT,
        //     sender_id: id,
        //     resource_type: RESOURCE_TYPE.HACKER,
        //     resource_id: id,
        //     fields,
        //     register_date_time: getDateTime()
        // };
        // await SchemaModels.HistoryModel.create(history_model);
        return 0;
    }

    async clearPaymentUSDT(id, payment_default) {
        if (!isObjectID(id))
            return 1;


        let data = {
            "payment_usdt_public_key": '',
        };
        if (payment_default === PAYMENT_DEFAULT.USDT) {
            data["payment_default"] = PAYMENT_DEFAULT.NONE
        }
        // const fields = [];
        const user = await this.collection.findOneAndUpdate({"_id": id}, {$set: data});
        if (!user) {
            return 1;
        }
        // for (const key in data) {
        //     if (!user[key] || user[key].toString() !== data[key].toString()) {
        //         fields.push({key, old_value: user[key], new_value: data[key]});
        //     }
        // }
        // const history_model = {
        //     sender_type: SENDER_TYPE.HACKER,
        //     activity: ACTIVITY_TEXT_LOG.CLEAR_USDT_PAYMENT,
        //     sender_id: id,
        //     resource_type: RESOURCE_TYPE.HACKER,
        //     resource_id: id,
        //     fields,
        //     register_date_time: getDateTime()
        // };
        // await SchemaModels.HistoryModel.create(history_model);
        return 0;
    }


    async getListSkills() {
        return await SchemaModels.SkillsModel.find({"status": true}).select({"__v": 0});
    }

    async updateTAX(id, tax) {
        if (!isObjectID(id))
            return 1;

        let data = {
            "tax_file": tax,
        };
        const user = await this.collection.findOneAndUpdate({"_id": id}, {$set: data});
        if (!user) {
            return 1;
        }
        // const history_model = {
        //     sender_type: SENDER_TYPE.HACKER,
        //     activity: ACTIVITY_TEXT_LOG.UPLOAD_TAX,
        //     sender_id: id,
        //     resource_type: RESOURCE_TYPE.HACKER,
        //     resource_id: id,
        //     fields: [{key: "tax_file", old_value: user.tax_file, new_value: tax}],
        //     register_date_time: getDateTime()
        // };
        // await SchemaModels.HistoryModel.create(history_model);
        return 0;
    }

    async deleteTAX(id) {
        if (!isObjectID(id))
            return 1;

        let data = {
            "tax_file": "",
        };
        const user = await this.collection.findOneAndUpdate({"_id": id}, {$set: data});
        if (!user) {
            return 1;
        }
        // const history_model = {
        //     sender_type: SENDER_TYPE.HACKER,
        //     activity: ACTIVITY_TEXT_LOG.DELETE_TAX,
        //     sender_id: id,
        //     resource_type: RESOURCE_TYPE.HACKER,
        //     resource_id: id,
        //     fields: [{key: "tax_file", old_value: user.tax_file, new_value: ""}],
        //     register_date_time: getDateTime()
        // };
        // await SchemaModels.HistoryModel.create(history_model);
        return 0;
    }

    async getCurrency(currency_id) {
        if (!isObjectID(currency_id))
            return 0;
        return SchemaModels.CurrencyModel.findOne({"_id": currency_id, "status": true}).countDocuments();
    }

    async updatePaymentBankTransfer(id
        , payment_default
        , was_payment_default
        , payment_bank_transfer_iban
        , payment_bank_transfer_bic
        , payment_bank_transfer_type, payment_bank_transfer_account_holder
        , payment_bank_transfer_country_id, payment_bank_transfer_country_id_residence
        , payment_bank_transfer_currency_id) {
        if (!isObjectID(id))
            return 1;


        let data = {
            "payment_bank_transfer_type": payment_bank_transfer_type,
            "payment_bank_transfer_account_holder": payment_bank_transfer_account_holder,
            "payment_bank_transfer_iban": payment_bank_transfer_iban,
            "payment_bank_transfer_bic": payment_bank_transfer_bic,
        };
        if ((toNumber(payment_default) > 0 && toNumber(payment_default) < 4) || was_payment_default) {
            data["payment_default"] = toNumber(payment_default)
        }

        if (payment_bank_transfer_country_id != '' && isObjectID(payment_bank_transfer_country_id)) {
            data['payment_bank_transfer_country_id'] = payment_bank_transfer_country_id;
        }
        if (payment_bank_transfer_country_id_residence != '' && isObjectID(payment_bank_transfer_country_id_residence)) {
            data['payment_bank_transfer_country_id_residence'] = payment_bank_transfer_country_id_residence;
        }
        if (payment_bank_transfer_currency_id != '' && isObjectID(payment_bank_transfer_currency_id)) {
            data['payment_bank_transfer_currency_id'] = payment_bank_transfer_currency_id;
        }
        // const fields = [];
        const user = await this.collection.findOneAndUpdate({"_id": id}, {$set: data});
        if (!user) {
            return 1;
        }
        // for (const key in data) {
        //     if (!user[key] || user[key].toString() !== data[key].toString()) {
        //         fields.push({key, old_value: user[key], new_value: data[key]});
        //     }
        // }
        // const history_model = {
        //     sender_type: SENDER_TYPE.HACKER,
        //     activity: ACTIVITY_TEXT_LOG.UPDATE_IBAN_PAYMENT,
        //     sender_id: id,
        //     resource_type: RESOURCE_TYPE.HACKER,
        //     resource_id: id,
        //     fields,
        //     register_date_time: getDateTime()
        // };
        // await SchemaModels.HistoryModel.create(history_model);
        return 0;
    }


    async clearPaymentBankTransfer(id, payment_default) {
        if (!isObjectID(id))
            return 1;


        let data = {
            "payment_bank_transfer_type": 0,
            "payment_bank_transfer_account_holder": "",
            "payment_bank_transfer_iban": "",
            "payment_bank_transfer_bic": "",
            "payment_bank_transfer_country_id": null,
            "payment_bank_transfer_country_id_residence": null,
            "payment_bank_transfer_currency_id": null
        };
        if (payment_default === PAYMENT_DEFAULT.BANK_TRANSFER) {
            data["payment_default"] = PAYMENT_DEFAULT.NONE
        }
        // const fields = [];
        const user = await this.collection.findOneAndUpdate({"_id": id}, {$set: data});
        if (!user) {
            return 1;
        }
        // for (const key in data) {
        //     if (!user[key] || user[key].toString() !== data[key].toString()) {
        //         fields.push({key, old_value: user[key], new_value: data[key]});
        //     }
        // }
        // const history_model = {
        //     sender_type: SENDER_TYPE.HACKER,
        //     activity: ACTIVITY_TEXT_LOG.CLEAR_IBAN_PAYMENT,
        //     sender_id: id,
        //     resource_type: RESOURCE_TYPE.HACKER,
        //     resource_id: id,
        //     fields,
        //     register_date_time: getDateTime()
        // };
        // await SchemaModels.HistoryModel.create(history_model);
        return 0;
    }


    async updateIdentityPassport(id, identity_country_id, file) {
        if (!isObjectID(id))
            return 1;


        let data = {
            "identity_passport_file": file,
            "identity_passport_file_status": 0,
            "identity_country_id": identity_country_id
        };
        // const fields = [];
        const user = await this.collection.findOneAndUpdate({"_id": id}, {$set: data});
        if (!user) {
            return 1;
        }
        // for (const key in data) {
        //     if (!user[key] || user[key].toString() !== data[key].toString()) {
        //         fields.push({key, old_value: user[key], new_value: data[key]});
        //     }
        // }
        // const history_model = {
        //     sender_type: SENDER_TYPE.HACKER,
        //     activity: ACTIVITY_TEXT_LOG.UPDATE_PASSPORT_IDENTITY,
        //     sender_id: id,
        //     resource_type: RESOURCE_TYPE.HACKER,
        //     resource_id: id,
        //     fields,
        //     register_date_time: getDateTime()
        // };
        // await SchemaModels.HistoryModel.create(history_model);
        return 1;
    }


    async deleteIdentityPassport(id) {
        if (!isObjectID(id))
            return 1;

        const user = await this.collection.findOneAndUpdate({"_id": id}, {
                $set: {identity_passport_file: ""},
                $unset: {identity_passport_file_status: 1}
            }
        );
        if (!user) {
            return 1;
        }
        // const history_model = {
        //     sender_type: SENDER_TYPE.HACKER,
        //     activity: ACTIVITY_TEXT_LOG.DELETE_PASSPORT_IDENTITY,
        //     sender_id: id,
        //     resource_type: RESOURCE_TYPE.HACKER,
        //     resource_id: id,
        //     fields: [
        //         {
        //             key: "identity_passport_file",
        //             old_value: user.identity_passport_file,
        //             new_value: ""
        //         },
        //         {
        //             key: "identity_passport_file_status",
        //             old_value: user.identity_passport_file_status,
        //             new_value: null
        //         }
        //     ],
        //     register_date_time: getDateTime()
        // };
        // await SchemaModels.HistoryModel.create(history_model);
        return 1;
    }


    async updateIdentityCard(id, identity_country_id, file) {
        if (!isObjectID(id))
            return 1;


        let data = {
            "identity_card_file": file,
            "identity_card_file_status": 0,
            "identity_country_id": identity_country_id
        };
        const fields = [];
        const user = await this.collection.findOneAndUpdate({"_id": id}, {$set: data});
        if (!user) {
            return 1;
        }
        // for (const key in data) {
        //     if (!user[key] || user[key].toString() !== data[key].toString()) {
        //         fields.push({key, old_value: user[key], new_value: data[key]});
        //     }
        // }
        // const history_model = {
        //     sender_type: SENDER_TYPE.HACKER,
        //     activity: ACTIVITY_TEXT_LOG.UPDATE_PASSPORT_IDENTITY,
        //     sender_id: id,
        //     resource_type: RESOURCE_TYPE.HACKER,
        //     resource_id: id,
        //     fields,
        //     register_date_time: getDateTime()
        // };
        // await SchemaModels.HistoryModel.create(history_model);
        return 1;
    }


    async deleteIdentityCard(id) {
        if (!isObjectID(id))
            return 1;

        const user = await this.collection.findOneAndUpdate({"_id": id}, {
                $set: {identity_card_file: ""},
                $unset: {identity_card_file_status: 1}
            }
        );
        if (!user) {
            return 1;
        }
        // const history_model = {
        //     sender_type: SENDER_TYPE.HACKER,
        //     activity: ACTIVITY_TEXT_LOG.DELETE_CARD_IDENTITY,
        //     sender_id: id,
        //     resource_type: RESOURCE_TYPE.HACKER,
        //     resource_id: id,
        //     fields: [
        //         {
        //             key: "identity_card_file",
        //             old_value: user.identity_card_file,
        //             new_value: ""
        //         },
        //         {
        //             key: "identity_card_file_status",
        //             old_value: user.identity_card_file_status,
        //             new_value: null
        //         }
        //     ],
        //     register_date_time: getDateTime()
        // };
        // await SchemaModels.HistoryModel.create(history_model);
        return 1;
    }


    async updateIdentityDriver(id, identity_country_id, file) {
        if (!isObjectID(id))
            return 1;


        let data = {
            "identity_driver_file": file,
            "identity_driver_file_status": 0,
            "identity_country_id": identity_country_id
        };
        const fields = [];
        const user = await this.collection.findOneAndUpdate({"_id": id}, {$set: data});
        if (!user) {
            return 1;
        }
        // for (const key in data) {
        //     if (!user[key] || user[key].toString() !== data[key].toString()) {
        //         fields.push({key, old_value: user[key], new_value: data[key]});
        //     }
        // }
        // const history_model = {
        //     sender_type: SENDER_TYPE.HACKER,
        //     activity: ACTIVITY_TEXT_LOG.UPDATE_DRIVER_LICENSE,
        //     sender_id: id,
        //     resource_type: RESOURCE_TYPE.HACKER,
        //     resource_id: id,
        //     fields,
        //     register_date_time: getDateTime()
        // };
        // await SchemaModels.HistoryModel.create(history_model);
        return 1;
    }


    async deleteIdentityDriver(id) {
        if (!isObjectID(id))
            return 1;

        const user = await this.collection.findOneAndUpdate({"_id": id}, {
                $set: {identity_driver_file: ""},
                $unset: {identity_driver_file_status: 1}
            }
        );
        if (!user) {
            return 1;
        }
        // const history_model = {
        //     sender_type: SENDER_TYPE.HACKER,
        //     activity: ACTIVITY_TEXT_LOG.DELETE_DRIVER_LICENSE,
        //     sender_id: id,
        //     resource_type: RESOURCE_TYPE.HACKER,
        //     resource_id: id,
        //     fields: [
        //         {
        //             key: "identity_driver_file",
        //             old_value: user.identity_driver_file,
        //             new_value: ""
        //         },
        //         {
        //             key: "identity_driver_file_status",
        //             old_value: user.identity_driver_file_status,
        //             new_value: null
        //         }
        //     ],
        //     register_date_time: getDateTime()
        // };
        // await SchemaModels.HistoryModel.create(history_model);
        return 1;
    }

    async updateEmailTemp(user_id, email) {
        email = email.toLowerCase();
        let code = randomStr(10);
        let activation_code = makeKey(code);
        let data = {
            "temp": activation_code,
            "email_temp": email
        };
        let result = await this.collection.updateOne({"_id": user_id}, {
                $set: data
            }
        );
        if (result.n === 1 && result.nModified === 1) {
            return code;
        }
        return 9;
    }


    async getFoundChangeEmailTempCode(code) {
        return this.collection.findOne({"temp": code, "email_temp": {$ne: null}});
    }

    async updateEmailChange(id, current_email, new_email, activity_log) {
        if (isUndefined(activity_log))
            activity_log = '';

        current_email = current_email.toLowerCase();
        new_email = new_email.toLowerCase();

        activity_log += `${current_email} to ${new_email} changed! - ${getDateTime()}  \n `;
        let data = {
            "activity_log": activity_log,
            "temp": "",
            "email": new_email,
            "email_temp": ""
        };
        let result = await this.collection.findOneAndUpdate({"_id": id}, {$set: data});
        if (!result) {
            return 6;
        }
        // const history_model = {
        //     sender_type: SENDER_TYPE.HACKER,
        //     activity: ACTIVITY_TEXT_LOG.CHANGE_EMAII,
        //     sender_id: id,
        //     resource_type: RESOURCE_TYPE.HACKER,
        //     resource_id: id,
        //     fields: [{key: "email", old_value: result.email, new_value: new_email}],
        //     register_date_time: getDateTime()
        // };
        // await SchemaModels.HistoryModel.create(history_model);
        return 0;
    }

    async updateEmailChangeFail(id) {
        return await this.collection.updateOne({"_id": id}, {$set: {"temp": "", "email_temp": ""}});
    }

    async addCertFile(user_id, file_name, file_name_original_name) {
        if (!isObjectID(user_id))
            return 0;
        let data = {
            "file_name": file_name
            , "file_name_original_name": file_name_original_name
        };
        let result = await this.collection.updateOne({"_id": user_id}
            , {$push: {certificate_files: data}}
            , {new: true});
        return 1;
    }

    async deleteCertFile(user_id, file_id) {
        if (!isObjectID(user_id) || !isObjectID(file_id))
            return 0;

        let ret = await this.collection.updateOne({
                "_id": user_id
            },
            {
                $pull:
                    {
                        certificate_files: {_id: file_id},
                    }
            },
        ).exec();

        return 1;

    }


    async statisticsSubmitReport(user_id) {
        if (!isObjectID(user_id))
            return [];

        let match = {
            "hacker_user_id": user_id,
            "status": {$gte: 1},
        };

        let rows = await SchemaModels.SubmitReportModel.aggregate([
            {"$match": {"$and": [match]}},
            {
                $group:
                    {
                        _id: {
                            year: {$year: "$submit_date_time"},
                            month: {$month: "$submit_date_time"}
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
                    Pending: 0,
                    Modification: 0,
                    Triage: 0,
                    Approve: 0,
                    Reject: 0,
                    Duplicate: 0,
                    Resolved: 0,
                    NotApplicable: 0,
                };
                month.monthName = getMonthNameByNumber(monthNum);
                month.monthNumber = monthNum;
                item.monthes.push(month);
            }
            item.monthes.sort((a, b) => a.monthNumber - b.monthNumber);
            result.push(item);
        }
        return result;
    }

    async statisticsTotalBounty(user_id) {
        if (!isObjectID(user_id))
            return [];

        let start = getDate().startOf('year').toDate();
        let end = getDate().endOf('year').toDate();
        let match = {
            "hacker_user_id": user_id,
            "register_date_time": {
                $gte: start,
                $lte: end
            }
        };

        let rows = await SchemaModels.PaymentHistoryModel.aggregate([
            {"$match": {"$and": [match]}},
            {$group: {_id: {$substr: ['$register_date_time', 5, 2]}, "bounty": {$sum: "$amount"}}},
            {$project: {_id: 0, monthName: "$_id", bounty: 1}},
            {$sort: {monthName: 1}}
        ]).exec();

        let result = [];
        let months = [];
        for (let row of rows) {
            months.push(row.monthName);
            row.monthName = getMonthNameByNumber(row.monthName);
            result.push(row);
        }
        for (let num = 1; num <= 12; num++) {
            let monthNum = (num <= 9) ? '0' + num : '' + num;
            let isFound = months.includes(monthNum);
            if (isFound)
                continue;

            let row = {
                bounty: 0,
            };
            row.monthName = getMonthNameByNumber(monthNum);
            result.push(row);
        }
        return result;

    }


    async statisticsSeverityReport(user_id) {
        if (!isObjectID(user_id))
            return [];

        let match = {
            hacker_user_id: user_id,
            status: {$gte: 1, $lt: 10}
        };


        let rows = await SchemaModels.SubmitReportModel.aggregate([
            {"$match": {"$and": [match]}},
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
        return result;
    }


    async statisticsVulnerabilityReport(user_id) {
        if (!isObjectID(user_id))
            return [];

        let match = {
            "hacker_user_id": user_id,
            "status": {$in: [4, 7]}
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


    async getInvite(hacker_user_id, id) {
        if (!isObjectID(hacker_user_id) || !isObjectID(id))
            return null;
        return SchemaModels.ProgramInviteModel.findOne({"hacker_user_id": hacker_user_id, "_id": id});
    }

    async saveInvite(hacker_user_id, id, status) {
        if (!isObjectID(hacker_user_id) || !isObjectID(id))
            return 0;
        let data = {
            "status_invite": status,
            "invite_date_time": getDateTime()
        };
        let invitation = await SchemaModels.ProgramInviteModel.findOneAndUpdate({
                "hacker_user_id": hacker_user_id,
                "_id": id
            }, {
                $set: data
            }
        );
        if (!invitation) {
            return 0;
        }
        const company_user = await SchemaModels.CompanyUserModel.findOne({_id: invitation.company_user_id})
            .select({_id: 1, display_name: 1, fn: 1});
        const companies = [];
        companies.push(company_user);
        let members = await SchemaModels.CompanyUserModel.find({parent_user_id: company_user._id})
            .select({_id: 1, display_name: 1, fn: 1, access_program_list: 1}).lean();
        if (members.length > 0) {
            members = members.filter(p => !p.access_program_list ||
                p.access_program_list.length === 0 ||
                p.access_program_list.map(f => f._id.toString()).includes(invitation.program_id.toString()));
        }
        if (isArray(members)) {
            members.forEach(member => {
                companies.push(member);
            })
        }
        const notifications = await this.createNotifications("Invitation Response",
            companies, null, FIELD_TYPE.STATUS, hacker_user_id, status === INVITE_HACKER_STATUS.ACCEPT ?
                MESSAGE_TYPE.SUCCESS : MESSAGE_TYPE.DANGER, invitation.program_id, ACTION_TYPE.UPDATE, RESOURCE_TYPE.PROGRAM_INVITE);

        this.sendNotification("notification", notifications);
        // const history_model = {
        //     sender_type: SENDER_TYPE.HACKER,
        //     activity: ACTIVITY_TEXT_LOG.INVITATION_RESPONSE,
        //     sender_id: hacker_user_id,
        //     resource_type: RESOURCE_TYPE.PROGRAM_INVITE,
        //     resource_id: id,
        //     fields: [{key: "status_invite", old_value: invitation.status_invite, new_value: status}],
        //     register_date_time: getDateTime()
        // };
        // await SchemaModels.HistoryModel.create(history_model);
        return 1;
    }

    async refreshToken(token, refresh_token, user_agent, ip) {
        const token_data = await getHash(`login:${token}`);
        if (!token_data || !token_data.user_id ||
            !token_data.token || !token_data.refresh_token) {
            return 1;
        }
        // if (!isObjectID(token_data.user_id)) {
        //     throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_VALID, "x-token", true);
        // }
        // const user_exists = await SchemaModels.ModeratorUserModel.find(
        //     {_id: mongoose.Types.ObjectId(token_data.user_id)}).countDocuments();
        // if (user_exists !== 1) {
        //     throw new ErrorHelper(STATIC_VARIABLES.ERROR_CODE.NOT_VALID, "x-token", true);
        // }
        if (token_data.refresh_token !== refresh_token) {
            return 2;
        }
        return await createTokens(token_data.user_id, token_data.token, ip, user_agent);
    }

    async getInvitesList(hacker_user_id, status) {
        if (!isObjectID(hacker_user_id))
            return [];

        const report_group_by_program_id = await SchemaModels.SubmitReportModel.aggregate([
            {$match: {$and: [{"status": {$gt: 0}}, {"status": {$lt: 10}}]}},
            {$group: {_id: "$program_id", count: {$sum: 1}}}
        ]);

        let showPerPage = 10;
        let ret = {};
        ret.current_page = gPage;
        let where = {
            "hacker_user_id": mongoose.Types.ObjectId(hacker_user_id),
        };
        if (status !== "") {
            let s = toNumber(status);
            if (s == 1)
                where['status_invite'] = 1;
            else if (s == 2)
                where['status_invite'] = 2;
            else
                where['status_invite'] = 0;
        }
        let newRows = await SchemaModels.ProgramInviteModel.aggregate([
            {$match: {$and: [where]}},
            ...(
                (status == 0)
                    ? [{
                        $addFields: {
                            "current_date": {$toDate: getDateTime()},
                            "invitation_expire_date": {$add: ["$register_date_time", {$multiply: ["$expire_day", 24 * 60 * 60000]}]}
                        }
                    }, {
                        "$match": {
                            "$expr": {"$gt": ["$invitation_expire_date", "$current_date"]}
                        }
                    }]
                    : []
            ),
            {
                $lookup: {
                    from: 'programs',
                    localField: 'program_id',
                    foreignField: '_id',
                    as: 'program_id'
                }
            },
            {
                "$unwind": "$program_id"
            },
            {
                $lookup: {
                    from: 'company_users',
                    localField: 'company_user_id',
                    foreignField: '_id',
                    as: 'company_user_id'
                }
            },
            {
                "$unwind": "$company_user_id"
            },
            {
                "$unwind": {path: "$program_id.targets", preserveNullAndEmptyArrays: true}
            },
            {
                "$unwind": {path: "$program_id.rewards", preserveNullAndEmptyArrays: true}
            }, {
                $lookup: {
                    from: 'currencies',
                    localField: 'program_id.rewards.currency_id',
                    foreignField: '_id',
                    as: 'program_id.rewards.currency_id'
                }
            },
            {
                "$unwind": {path: "$program_id.rewards.currency_id", preserveNullAndEmptyArrays: true}
            },
            {
                $lookup: {
                    from: 'type_tests',
                    localField: 'program_id.targets.target_type_id',
                    foreignField: '_id',
                    as: 'program_id.targets.target_type_id'
                }
            },
            {
                $lookup: {
                    from: 'languages',
                    localField: 'program_id.targets.language_id',
                    foreignField: '_id',
                    as: 'program_id.targets.language_id'
                }
            },
            {
                "$unwind": {path: "$program_id.targets.target_type_id", preserveNullAndEmptyArrays: true}
            }, {
                $group: {
                    _id: "$_id",
                    root: {$mergeObjects: '$$ROOT'},
                    targets: {$push: '$program_id.targets'},
                    rewards: {$push: '$program_id.rewards'}
                }
            },
            {
                $replaceRoot: {
                    newRoot: {
                        $mergeObjects: ['$root', '$$ROOT']
                    }
                }
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
                            $skip: (gPage - 1) * showPerPage,
                        },
                        {$limit: showPerPage},
                        {
                            $project: {
                                _id: 1,
                                status_invite: 1,
                                status_send_email: 1,
                                company_user_id: {"display_name": 1, "avatar_file": 1},
                                program_id: {
                                    "name": 1,
                                    "_id": 1,
                                    "start_date_program": 1,
                                    "expire_date_program": 1,
                                    "targets": "$targets",
                                    "rewards": "$rewards",
                                    "logo_file": 1,
                                    "program_type": 1,
                                    "tagline": 1,
                                    "is_next_generation": 1
                                },
                                expire_day: 1,
                                register_date_time: 1,
                                invite_date_time: 1,
                                current_date: 1,
                                invitation_expire_date: 1,
                                report_count: {
                                    $ifNull: [{
                                        $let: {
                                            vars: {
                                                report: {
                                                    $arrayElemAt: [{
                                                        $filter: {
                                                            input: report_group_by_program_id,
                                                            as: "filter_report",
                                                            cond: {$eq: ["$$filter_report._id", "$program_id._id"]}
                                                        }
                                                    }, 0]
                                                }
                                            },
                                            in: "$$report.count"
                                        }
                                    }, 0]
                                }
                            },
                        },
                    ]
                }
            }
        ]).exec();

        if (newRows && newRows.length > 0 && newRows[0].totalRows.length > 0) {
            ret.rows = newRows[0].rows;
            ret.totalRows = newRows[0].totalRows[0].count;
            ret.totalPage = Math.ceil(ret.totalRows / showPerPage);
        } else {
            ret.rows = [];
            ret.totalRows = 0;
            ret.totalPage = 0;
        }
        return ret;
    }

    async setReportNotificationType(user_id, report_notification_setting) {
        user_id = safeString(user_id);
        const result = await this.collection.findOneAndUpdate({"_id": user_id}, {
            $set: {report_notification_setting}
        });
        if (!result) {
            return 3;
        }
        // const history_model = {
        //     sender_type: SENDER_TYPE.HACKER,
        //     activity: ACTIVITY_TEXT_LOG.SET_REPORT_NOTIFICATION,
        //     sender_id: user_id,
        //     resource_type: RESOURCE_TYPE.HACKER,
        //     resource_id: user_id,
        //     fields: [{
        //         key: "report_notification_type",
        //         old_value: result.report_notification_type,
        //         new_value: report_notification_types
        //     }],
        //     register_date_time: getDateTime()
        // };
        // await SchemaModels.HistoryModel.create(history_model);
        return 0
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
        // const history_model = {
        //     sender_type: SENDER_TYPE.HACKER,
        //     activity: ACTIVITY_TEXT_LOG.DISABLE_2FA,
        //     sender_id: id,
        //     register_date_time: getDateTime()
        // };
        // await SchemaModels.HistoryModel.create(history_model);
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
        // const history_model = {
        //     sender_type: SENDER_TYPE.HACKER,
        //     activity: ACTIVITY_TEXT_LOG.ENABLE_2FA,
        //     sender_id: id,
        //     register_date_time: getDateTime()
        // };
        // await SchemaModels.HistoryModel.create(history_model);
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

    async checkIsFileOwner(user, name, type, id) {
        if (type === "comment") {
            const comment = await SchemaModels.CommentSubmitReportModel.findOne({$and: [{_id: id}, {$or: [{file1: name}, {file2: name}, {file3: name}]}]});
            if (!comment) {
                return false;
            }
            return !!(await SchemaModels.SubmitReportModel.countDocuments({
                _id: comment.report_id,
                hacker_user_id: user._id
            }));
        } else if (type === "report") {
            return !!(await SchemaModels.SubmitReportModel.countDocuments({
                _id: id,
                hacker_user_id: user._id,
                report_files: {$elemMatch: {file_name: name}}
            }));
        } else if (type === "identity_password") {
            return user.identity_passport_file === name;
        } else if (type === "identity_card") {
            return user.identity_card_file === name;
        } else if (type === "identity_driver") {
            return user.identity_driver_file === name;
        }
        return true;
    }

    sendNotification(emit_name, notifications) {
        if (companyIO && companyIO["sockets"] && companyIO["sockets"].size > 0 && companyIO["to"]) {
            const sockets_info = convertSetOrMapToArray(companyIO["sockets"]);
            if (sockets_info.length > 0) {
                sockets_info.forEach(s => {
                    if (s.data && s.data._id) {
                        const notification = notifications.find(n => n.company_user_id.toString() === s.data._id.toString());
                        if (notification) {
                            companyIO["to"](s.id.toString()).emit(emit_name, {
                                title: notification.title,
                                text: notification.text,
                                id: notification._id,
                                date: notification.register_date_time,
                                message_type: notification.message_type,
                            });
                        }
                    }
                });
            }
        }
    }

    async createNotifications(title, companies, value, field_type, hacker_user_id, message_type, program_id, action_type, resource_type) {
        const notifications = [];
        companies.forEach(c => {
            let text = "";
            if (field_type === FIELD_TYPE.STATUS) {
                text = `${c.display_name || c.fn}, You have received a response to one of your invitations`;
            }
            const notification = {
                title,
                text,
                status: NOTIFICATION_STATUS.SEND,
                register_date_time: getDateTime(),
                sender_type: SENDER_TYPE.HACKER,
                field_type,
                resource_type,
                action_type,
                message_type,
                program_id,
                hacker_user_id,
                company_user_id: c._id
            };
            notifications.push(notification);
        });
        return SchemaModels.NotificationModel.insertMany(notifications);
    }
}

module.exports = new HackerUserModel();