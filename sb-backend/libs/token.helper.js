const Redis = require("ioredis");
const ioredis = new Redis(AppConfig.REDIS_PORT, AppConfig.REDIS_HOST);
const crypto = require('crypto');
const {getDate} = require('./date.helper');
const {getID, toArrayObject} = require('./methode.helper');


const makeTokenKey = (secret, data) => {
    return reverseString(crypto.createHmac('md5', secret)
        .update(data)
        .digest('hex'));
};

const checkKey = (obj, key) => {
    return !isUndefined(obj) && obj.hasOwnProperty(key);
};

const url64Decode = encoded => {
    encoded = encoded.replace(/-/g, '+').replace(/_/g, '/');
    while (encoded.length % 4)
        encoded += '=';
    return encoded;
};

const url64Encode = unencoded => {
    return unencoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
};

const getHash = async key => {
    try {
        // noinspection JSUnresolvedFunction
        return await ioredis.hgetall(key);
    } catch {
        return {};
    }
};

const decryptToken = async token => {
    try {
        const data = await getHash(`login:${token}`);
        if (checkKey(data, 'user_id')) {
            let decoded_token = url64Decode(token);
            const key = makeTokenKey(token_setting.token_secret_key, data.user_id);
            const iv = reverseString(key.substring(0, 16));
            let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
            let decrypted = decipher.update(decoded_token, 'base64', 'utf8');
            decrypted += decipher.final('utf8');
            return decrypted;
        } else
            return '';
    } catch {
        return '';
    }
};

const makeHash = str => {
    let secret = 'SecureBug12345$';
    return reverseString(crypto.createHmac('sha256', secret)
        .update(str)
        .digest('hex'));
};

const setHash = async (key, ...values) => {
    try {
        // noinspection JSUnresolvedFunction
        await ioredis.hset(key, values);
        return true;
    } catch {
        return false;
    }
};

const reverseString = str => {
    return str.split("").reverse().join("");
};

const setExpire = async (key, time) => {
    try {
        // noinspection JSUnresolvedFunction
        await ioredis.expire(key, time);
        return true;
    } catch {
        return false;
    }
};

const createTokens = async (user_id, current_token = undefined) => {
    try {
        if (current_token) {
            await setExpire(`login:${current_token}`, 5);
        }
        const expireDateTime = getDate().add(token_setting.expire_date_time, 'minutes').unix();
        const refreshDateTime = getDate().add(token_setting.refresh_date_time, 'minutes').unix();
        const token_key = makeTokenKey(token_setting.token_secret_key, user_id.toString());
        const refresh_token_key = makeTokenKey(token_setting.refresh_token_secret_key, user_id.toString());
        const token_iv = reverseString(token_key.substring(0, 16));
        const refresh_token_iv = reverseString(refresh_token_key.substring(0, 16));
        const token_text = `${getID()}#${user_id}#${getID()}#${expireDateTime}#${getID()}#${refreshDateTime}`;
        const refresh_token_text = `${getID()}#${user_id}#${getID()}#${refreshDateTime}`;
        const token_cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(token_key), token_iv);
        const refresh_token_cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(refresh_token_key), refresh_token_iv);
        let token_encrypted = token_cipher.update(token_text, 'utf8', 'base64');
        let refresh_token_encrypted = refresh_token_cipher.update(refresh_token_text, 'utf8', 'base64');
        token_encrypted += token_cipher.final('base64');
        refresh_token_encrypted += refresh_token_cipher.final('base64');
        const token = url64Encode(token_encrypted);
        const refresh_token = url64Encode(refresh_token_encrypted);
        await setHash(`login:${token}`, 'token', token, 'user_id', user_id, 'refresh_token', refresh_token);
        await setExpire(`login:${token}`, token_setting.expire_date_time * 60);
        return {token, refresh_token};
    } catch {
        return '';
    }
};

const delete_by_key = async (key) => {
    // noinspection JSUnresolvedFunction
    await ioredis.del(key);
};

const ftSearch = async function (indexName, command) {
    try {
        // noinspection JSUnresolvedFunction
        let result = await ioredis.call('FT.SEARCH', indexName, command);
        return toArrayObject(result);
    } catch {
        return [];
    }
};

const clearCatch = async function (key) {
    try {
        // noinspection JSUnresolvedFunction
        await ioredis.del(key);
        return true;
    } catch {
        return false;
    }
};

module.exports = {
    decryptToken, makeHash, reverseString, makeTokenKey, getHash, url64Decode, checkKey,
    createTokens, url64Encode, setHash, setExpire, delete_by_key, ftSearch, clearCatch
};