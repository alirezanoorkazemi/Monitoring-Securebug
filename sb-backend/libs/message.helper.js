const {STATIC_VARIABLES} = require('./enum.helper');

const setResponse = (result = "success", code = "0", is_login = "0") => {
    return {code, result, is_login}
};

const setPublicResponse = (result, code = "0") => {
    return {code, result}
};

const requiredMsg = name => {
    return `${name} is empty`;
};

const notValidMsg = name => {
    return `${name} is not valid`;
};

const notVerifyMsg = name => {
    return `${name} is not verified`;
};

const notFoundMsg = name => {
    return `${name} is not found`;
};

const notResourceFoundMsg = name => {
    return `${name} is not found`;
};

const maxLengthMsg = (name, limit) => {
    return `${name} must be equals or less than ${limit} characters`;
};

const notEqualMsg = (name, other) => {
    return `${name} is not equal with ${other}`;
};

const minLengthMsg = (name, limit) => {
    return `${name} must be equals or more than ${limit} characters`;
};

const notCorrectMsg = name => {
    return `${name} is not correct`;
};

const existMsg = name => {
    return `${name} is already exist`;
};

const notPermissionMsg = () => {
    return `You don't have permission for this action`;
};

const expireMsg = name => {
    return `${name} is expired`;
};

const disableMsg = name => {
    return `${name} is disabled`;
};

const requiredResponse = (name, is_private = true) => {
    return is_private ? setResponse(requiredMsg(name), STATIC_VARIABLES.ERROR_CODE.REQUARED)
        : setPublicResponse(requiredMsg(name), STATIC_VARIABLES.ERROR_CODE.REQUARED)
};

const notEqualResponse = (name,other, is_private = true) => {
    return is_private ? setResponse(notEqualMsg(name,other), STATIC_VARIABLES.ERROR_CODE.NOT_EQUAL)
        : setPublicResponse(notEqualMsg(name), STATIC_VARIABLES.ERROR_CODE.NOT_EQUAL)
};

const customResponse = (message, is_private = true) => {
    return is_private ? setResponse(message, STATIC_VARIABLES.ERROR_CODE.CUSTOM)
        : setPublicResponse(notValidMsg(message), STATIC_VARIABLES.ERROR_CODE.CUSTOM)
};

const notValidResponse = (name, is_private = true) => {
    return is_private ? setResponse(notValidMsg(name), STATIC_VARIABLES.ERROR_CODE.NOT_VALID)
        : setPublicResponse(notValidMsg(name), STATIC_VARIABLES.ERROR_CODE.NOT_VALID)
};

const notValidUserResponse = (is_private = true) => {
    return is_private ? setResponse(notValidMsg("user access"), STATIC_VARIABLES.ERROR_CODE.NOT_VALID_USER)
        : setPublicResponse(notValidMsg("user access"), STATIC_VARIABLES.ERROR_CODE.NOT_VALID_USER)
};

const existResponse = (name, is_private = true) => {
    return is_private ? setResponse(existMsg(name), STATIC_VARIABLES.ERROR_CODE.EXIST)
        : setPublicResponse(existMsg(name), STATIC_VARIABLES.ERROR_CODE.EXIST)
};

const disableResponse = (name, is_private = true) => {
    return is_private ? setResponse(disableMsg(name), STATIC_VARIABLES.ERROR_CODE.DISABLED)
        : setPublicResponse(disableMsg(name), STATIC_VARIABLES.ERROR_CODE.DISABLED)
};

const notCorrectResponse = (name, is_private = true) => {
    return is_private ? setResponse(notCorrectMsg(name), STATIC_VARIABLES.ERROR_CODE.NOT_CORRECT)
        : setPublicResponse(notCorrectMsg(name), STATIC_VARIABLES.ERROR_CODE.NOT_CORRECT)
};

const notPermissionResponse = (is_private = true) => {
    return is_private ? setResponse(notPermissionMsg(), STATIC_VARIABLES.ERROR_CODE.NOT_PERMISSON)
        : setPublicResponse(notPermissionMsg(), STATIC_VARIABLES.ERROR_CODE.NOT_PERMISSON)
};

const expireTokenResponse = (is_private = true) => {
    return is_private ? setResponse(expireMsg("token"), STATIC_VARIABLES.ERROR_CODE.EXPIRE_TOKEN)
        : setPublicResponse(expireMsg("token"), STATIC_VARIABLES.ERROR_CODE.EXPIRE_TOKEN)
};

const expireResponse = (name, is_private = true) => {
    return is_private ? setResponse(expireMsg(name), STATIC_VARIABLES.ERROR_CODE.EXPIRE)
        : setPublicResponse(expireMsg(name), STATIC_VARIABLES.ERROR_CODE.EXPIRE)
};

const notVerifyResponse = (name, is_private = true) => {
    return is_private ? setResponse(notVerifyMsg(name), STATIC_VARIABLES.ERROR_CODE.NOT_VERIFY)
        : setPublicResponse(notVerifyMsg(name), STATIC_VARIABLES.ERROR_CODE.NOT_VERIFY)
};

const notVerifyUserResponse = (is_private = true) => {
    return is_private ? setResponse(notVerifyMsg("user"), STATIC_VARIABLES.ERROR_CODE.NOT_VERIFY_USER)
        : setPublicResponse(notVerifyMsg("user"), STATIC_VARIABLES.ERROR_CODE.NOT_VERIFY_USER)
};

const maxLengthResponse = (name, limit, is_private = true) => {
    return is_private ? setResponse(maxLengthMsg(name, limit), STATIC_VARIABLES.ERROR_CODE.MAX_LENGTH)
        : setPublicResponse(maxLengthMsg(name, limit), STATIC_VARIABLES.ERROR_CODE.MAX_LENGTH)
};

const minLengthResponse = (name, limit, is_private = true) => {
    return is_private ? setResponse(minLengthMsg(name, limit), STATIC_VARIABLES.ERROR_CODE.MIN_LENGTH)
        : setPublicResponse(minLengthMsg(name, limit), STATIC_VARIABLES.ERROR_CODE.MIN_LENGTH)
};

const notValidTokenResponse = (is_private = true) => {
    return is_private ? setResponse(notValidMsg("token"), STATIC_VARIABLES.ERROR_CODE.NOT_VALID_TOKEN)
        : setPublicResponse(notValidMsg("token"), STATIC_VARIABLES.ERROR_CODE.NOT_VALID_TOKEN)
};

const requiredTokenResponse = (is_private = true) => {
    return is_private ? setResponse(requiredMsg("token"), STATIC_VARIABLES.ERROR_CODE.TOKEN_REQUIRED)
        : setPublicResponse(requiredMsg("token"), STATIC_VARIABLES.ERROR_CODE.TOKEN_REQUIRED)
};

const expireRefreshTokenResponse = (is_private = true) => {
    return is_private ? setResponse(expireMsg("refresh-token"), STATIC_VARIABLES.ERROR_CODE.EXPIRE_REFRESH_TOKEN)
        : setPublicResponse(expireMsg("refresh-token"), STATIC_VARIABLES.ERROR_CODE.EXPIRE_REFRESH_TOKEN)
};

module.exports = {
    setResponse, expireMsg, notValidMsg, notVerifyMsg, setPublicResponse, requiredMsg,
    notPermissionMsg, notFoundMsg, maxLengthMsg, notCorrectMsg, disableMsg, notResourceFoundMsg,
    requiredResponse, notValidResponse, minLengthMsg, expireRefreshTokenResponse, minLengthResponse,
    maxLengthResponse, notVerifyResponse, expireResponse, expireTokenResponse, notPermissionResponse,
    disableResponse, notCorrectResponse, notValidTokenResponse, notVerifyUserResponse, notValidUserResponse,
    requiredTokenResponse, notEqualResponse, existResponse, existMsg, customResponse
};