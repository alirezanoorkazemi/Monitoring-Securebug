require('./appConfig');
require('./emailTemplate');
require('./libs/core');
require('./schema');

const process = require('process');

async function getHacker(id) {
    return SchemaModels.HackerUserModel.findOne({"_id": id});
}

async function getCompany(id) {
    return SchemaModels.CompanyUserModel.findOne({"_id": id});
}

async function getProgram(id) {
    return SchemaModels.ProgramModel.findOne({"_id": id});
}

function setReportNotificationTemplate(type,user_type,first_name,program_name,url){
    let subject = null;
    let html = null;
    if(user_type === "hacker"){
        if(type === REPORT_NOTIFICATION_TYPE.SUBMIT_REPORT){
            subject = "New report submitted";
            html = generateEmailTemplate("hacker_submit_report",first_name,{program_name,url},true);
        } else if(type === REPORT_NOTIFICATION_TYPE.CHANGE_STATUS_REPORT){
            subject = "Report status changed";
            html = generateEmailTemplate("hacker_change_report_status",first_name,{url},true);
        } else if(type === REPORT_NOTIFICATION_TYPE.SUBMIT_COMMENT){
            subject = "A comment has been added to the report";
            html = generateEmailTemplate("hacker_submit_comment",first_name,{url},true);
        } else if(type === REPORT_NOTIFICATION_TYPE.ADD_PRICE){
            subject = "The bounty has been awarded to the submitted report";
            html = generateEmailTemplate("hacker_add_report_reward",first_name,{url},true);
        }
    } else if(user_type === "company"){
        if(type === REPORT_NOTIFICATION_TYPE.SUBMIT_REPORT){
            subject = "New report submitted";
            html = generateEmailTemplate("company_submit_report",first_name,{program_name,url},false);
        } else if(type === REPORT_NOTIFICATION_TYPE.CHANGE_STATUS_REPORT){
            subject = "Report status changed";
            html = generateEmailTemplate("company_change_report_status",first_name,{program_name,url},false);
        } else if(type === REPORT_NOTIFICATION_TYPE.SUBMIT_COMMENT){
            subject = "A comment has been added to the report";
            html = generateEmailTemplate("company_submit_comment",first_name,{program_name,url},false);
        } else if(type === REPORT_NOTIFICATION_TYPE.ADD_PRICE){
            subject = "The bounty has been awarded to the submitted report";
            html = generateEmailTemplate("company_add_report_reward",first_name,{program_name,url},false);
        }
    } else if(user_type === "moderator"){
        if(type === REPORT_NOTIFICATION_TYPE.SUBMIT_REPORT){
            subject = "New report submitted";
            html = generateEmailTemplate("moderator_submit_report",first_name,{program_name,url},false);
        } else if(type === REPORT_NOTIFICATION_TYPE.CHANGE_STATUS_REPORT){
            subject = "Report status changed";
            html = generateEmailTemplate("moderator_change_report_status",first_name,{program_name,url},false);
        } else if(type === REPORT_NOTIFICATION_TYPE.SUBMIT_COMMENT){
            subject = "A comment has been added to the report";
            html = generateEmailTemplate("moderator_submit_comment",first_name,{program_name,url},false);
        } else if(type === REPORT_NOTIFICATION_TYPE.ADD_PRICE){
            subject = "The bounty has been awarded to the submitted report";
            html = generateEmailTemplate("moderator_add_report_reward",first_name,{program_name,url},false);
        }
    }
    return {subject,html};
}
//this function send email Invite hacker to program
async function job1() {
    console.log('run job1');
    let row = await SchemaModels.ProgramInviteModel.findOne({"status_send_email": 0});
    if (row) {
        //send email 
        let hacker = await getHacker(row.hacker_user_id);
        let program = await getProgram(row.program_id);
        if (hacker && program) {
            console.log('email => ' + hacker.email);
            let expireDate = getDate(row.register_date_time).add(row.expire_day, 'days').format('YYYY-MM-DD HH:mm');
            let accept_key = `${row._id}:${row.program_id}:1`;
            let reject_key = `${row._id}:${row.program_id}:2`;
            let url_accept = `${AppConfig.FRONTEND_URL}user/invite/?key=` + encryptionString(accept_key);
            let url_reject = `${AppConfig.FRONTEND_URL}user/invite/?key=` + encryptionString(reject_key);
            let url = `${AppConfig.FRONTEND_URL}user/invitations/`;
            let html = generateEmailTemplate("hacker_get_invitation",hacker.fn,{program_name:program.name,expire_date:expireDate,invitations_url:url},true);
            let sendMailResult = await sendMail(hacker.email, "Invite To Program " + program.name, html);
            let data = {
                "status_send_email": 1,
            };
            let resultSave = await SchemaModels.ProgramInviteModel.updateOne({"_id": row._id}, {
                    $set: data
                }
            );
            console.log('send success!');
        }
    }
}

//this function send email submit_report for hacker and company
async function job2() {
    console.log('run job2');
    let row = await SchemaModels.ReportNotificationModel.findOne({"status_send_email": 0});
    let program = null;
    if (row) {
        program = await SchemaModels.ProgramModel.findOne({_id: row.program_id})
            .select({_id: 0, name: 1});
    }
    if (row && program) {
        //send email 
        let user = null;
        let url = null;
        let result = null;
        let type = row.type ? row.type : 0;
        if (row.hacker_user_id) {
            user = await getHacker(row.hacker_user_id);
            if (user){
                url = `${AppConfig.FRONTEND_URL}user/reports/${row.report_id}`;
                result = setReportNotificationTemplate(type,"hacker",user.fn,program.name,url);
            }
        } else if (row.company_user_id) {
            user = await getCompany(row.company_user_id);
            if (user){
                url = `${AppConfig.FRONTEND_URL}company/inbox/${row.report_id}`;
                result = setReportNotificationTemplate(type,"company",user.display_name || user.fn,program.name,url);
            }
        } else if(row.moderator_user_id){
            user = await SchemaModels.ModeratorUserModel.findOne({_id: row.moderator_user_id}).select({_id:0,email:1,fn:1});
            if(user){
                url = `${AppConfig.ADMIN_FRONTEND_URL}hacker/reports/${row.report_id}`;
                result = setReportNotificationTemplate(type,"moderator",user.fn,program.name,url);
            }
        }
        if (user && result) {
            console.log('email => ' + user.email);
            await sendMail(user.email, result.subject, result.html);

            let data = {
                "status_send_email": 1,
            };
            await SchemaModels.ReportNotificationModel.updateOne({"_id": row._id}, {
                    $set: data
                }
            );
            console.log('send success!');
        }
    }
}


async function cronRun() {
    console.log('cron job!');
    await job1();
    await job2();
    process.exit(0);
}


cronRun();