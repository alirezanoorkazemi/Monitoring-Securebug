PORT = 9090;
OAUTH_1A = {
    SECRET_KEY:'jo0ApMLjPxuNU0JvFrJ8qwbLgqWFAgMBAAECgYAEWAJgZ04xPWMjmN04j1p0oekoCAmEwggJdAgEAAoGBAKYXG9egM3XuIj',
    CONSUMER_KEY:'rezadinarvand JIRA Client',
    PRIVATE_KEY: `-----BEGIN PRIVATE KEY-----
MIICdwIBADANBgkqhkiG9w0BAQEFAASCAmEwggJdAgEAAoGBAKYXG9egM3XuIjNh
NHzzAhbB1fo4GGZ0RAtqC/rsT1T075TvKZrfc/gNVQpKtDomUQcroUVeENHU4xfy
DGHHyIemFZUmXdbLRKRiQbnWyTBxxyigle96KBPccrTXWuQukxGf6rZX0MdxMaYb
jo0ApMLjPxuNU0JvFrJ8qwbLgqWFAgMBAAECgYAEWAJgZ04xPWMjmN04j1p0oeko
vCLXOx80dTeO/nMss6M4b/DUnhd4W1DoDgAcrTfdSiTTnZwvALRXwfrU69awurpL
q9AKcTm1QZVwjBl0HzbFwUVdaF+gpp6YVpS3Nk45764GOIZ+RE7LVJW+er5xwTm/
sKLZvefC2yPvi0mC2QJBANXEateBfJJCsDpcFR82a2tGTawwzpBAzkKNnsQTNYWA
4JoAKJ+apq4d4ooGeN0r75Kh6SnTUGUVFtNHoYX9Rs8CQQDG51wtcpGYRpYqe0fi
lp6wo1yXU7OfXk6Gl0bjoG6VJBQPx55dl/0YWgQvF+apKLHob6e6C/yuE2rWE9W0
fGNrAkEAyKHPPXEUwBnDWSLv2Bm1fDvBzukIFrAcZq6Q4qq8ww6QvzmC5zm5UxZN
dwpYCg2gj1lTg6QHgrfmcmp6mU18VQJAfy/kRn9zUE8aqPGKBv9PXB4qD+4K9waD
6haD0vx8mcunNGvt/WU6Bz9QW5jJ+zM1iC8VrqcJnXp3H4sxZScBHwJBAJ6eHKaZ
DkhlFOFGF9dQHVReAtfAAKdVolmqG0jmS+LPfr5VudJXPZ5M0R/YnottBz2Dc66b
vCLvzXSav0QTto0=
-----END PRIVATE KEY-----`
};
IO_PORT = 1366;
const URL = "http://localhost:80";
isDebug = true;
isSentry = false;
token_setting = {
    expire_date_time:3600000,
    refresh_date_time:10000,
    token_secret_key:"#^c*pLpn8!fVL5*tY19eVN7Nty!f3F3uty453ssXyq656#@tsmBsQ3zPpHH6bwGm",
    refresh_token_secret_key:"b*pToUhNdzr6ygX8%YK0Y0p1WWTCXb7WivU4psNrwpk$j7$Dz&$hFhIw5^vTZ9Sq"
};
AppConfig = {
    REDIS_HOST:"localhost",
    REDIS_PORT:6379,
    API_URL:`${URL}/`,
    FRONTEND_URL:"http://localhost:8080/",
    ADMIN_FRONTEND_URL:"https://sbadev.redconet.se/",
    BACKEND_URL:`${URL}/admin-2020/`,
    MODERATOR_URL:`${URL}/moderator-2020/`,
    DB_URI : 'mongodb://localhost:27017/securebug',
    PROJECT_TITLE : 'Secure Bug',
    SMTP_HOST:'172.16.30.12',
    SMTP_PORT:25,
    MAIL_FROM:"Securebug",
    SMTP_USERNAME:'noreply@redconet.com',
    SMTP_PASSWORD:']P5HYTLEUuG[',
    SMTP_FROM:'noreply@redconet.com',
    SMTP_IS_SECURE:false,
    SYS_LOG_TAG : "[Secure Bug APP]",
    ALLOW_ORIGIN: ['https://frontdev.redconet.se', 'http://localhost:3000', 'https://app.redconet.com', 'https://frontstage.redconet.se', 'http://localhost:8080'],
}

token_setting = {
    expire_date_time: 100,
    refresh_date_time: 10000,
    token_secret_key: "#^c*pLpn8!fVL5*tY19eVN7Nty!f3F3uty453ssXyq656#@tsmBsQ3zPpHH6bwGm",
    refresh_token_secret_key: "b*pToUhNdzr6ygX8%YK0Y0p1WWTCXb7WivU4psNrwpk$j7$Dz&$hFhIw5^vTZ9Sq"
}