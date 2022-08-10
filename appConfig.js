PORT = 3066;
IO_PORT = 1368
const URL = "http://127.0.0.1";
isDebug = true;
AppConfig = {
    SESSION_NAME : 'name',
    SESSION_SECURE : false,
    SECRET_KEY : "9cc99e7192d1ae2ed68b34f8b7cb538e2edccd35",
    FRONTEND_URL:`${URL}:${PORT}/`,
    DB_URI : 'mongodb://localhost:27017/logger',
    PROJECT_TITLE : 'Logger',
    SMTP_HOST:'127.0.0.1',
    SMTP_PORT:25,
    SMTP_USERNAME:'noreply@meisam',
    SMTP_PASSWORD:'',
    SMTP_FROM:'meisam',
    SMTP_IS_SECURE:false
};
