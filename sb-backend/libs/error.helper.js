const {STATIC_VARIABLES} = require('../libs/enum.helper');
const {
    setPublicResponse, setResponse, disableMsg, notCorrectMsg,
    notValidMsg, notFoundMsg, expireMsg, notResourceFoundMsg,
    minLengthMsg, maxLengthMsg, notPermissionMsg, existMsg,
    requiredMsg
} = require('../libs/message.helper');

class ErrorHelper extends Error {
    name;
    is_public;
    type;

    constructor(type, name, is_public = false) {
        super();
        this.name = name;
        this.is_public = is_public;
        this.type = type;
    }
}

const catchAsync = fn => {
    return (req, res, next) => {
        fn(req, res, next).catch(error => {
            next(error);
        });
    };
};

const handleError = (error, res) => {
    const {type, name, is_public} = error;
    const response = is_public ? setPublicResponse : setResponse;
    switch (type) {
        case STATIC_VARIABLES.ERROR_CODE.DISABLED:
            return res.json(response(disableMsg(name), STATIC_VARIABLES.ERROR_CODE.DISABLED));
        case STATIC_VARIABLES.ERROR_CODE.NOT_CORRECT:
            return res.json(response(notCorrectMsg(name), STATIC_VARIABLES.ERROR_CODE.NOT_CORRECT));
        case STATIC_VARIABLES.ERROR_CODE.NOT_VALID:
            return res.json(response(notValidMsg(name), STATIC_VARIABLES.ERROR_CODE.NOT_VALID));
        case STATIC_VARIABLES.ERROR_CODE.NOT_VALID_TOKEN:
            return res.json(response(notValidMsg(name), STATIC_VARIABLES.ERROR_CODE.NOT_VALID_TOKEN));
        case STATIC_VARIABLES.ERROR_CODE.NOT_RESOURCE_FOUND:
            return res.json(response(notResourceFoundMsg(name), STATIC_VARIABLES.ERROR_CODE.NOT_RESOURCE_FOUND));
        case STATIC_VARIABLES.ERROR_CODE.NOT_FOUND:
            return res.json(response(notFoundMsg(name), STATIC_VARIABLES.ERROR_CODE.NOT_FOUND));
        case STATIC_VARIABLES.ERROR_CODE.MAX_LENGTH:
            return res.json(response(maxLengthMsg(name), STATIC_VARIABLES.ERROR_CODE.MAX_LENGTH));
        case STATIC_VARIABLES.ERROR_CODE.EMAIL_EXIST:
            return res.json(response("email is exist", STATIC_VARIABLES.ERROR_CODE.EMAIL_EXIST));
        case STATIC_VARIABLES.ERROR_CODE.MIN_LENGTH:
            return res.json(response(minLengthMsg(name), STATIC_VARIABLES.ERROR_CODE.MIN_LENGTH));
        case STATIC_VARIABLES.ERROR_CODE.EXPIRE_TOKEN:
            return res.json(response(expireMsg(name), STATIC_VARIABLES.ERROR_CODE.EXPIRE_TOKEN));
        case STATIC_VARIABLES.ERROR_CODE.NOT_PERMISSON:
            return res.json(response(notPermissionMsg(), STATIC_VARIABLES.ERROR_CODE.NOT_PERMISSON));
        case STATIC_VARIABLES.ERROR_CODE.REQUARED:
            return res.json(response(requiredMsg(name), STATIC_VARIABLES.ERROR_CODE.REQUARED));
        case STATIC_VARIABLES.ERROR_CODE.EXIST:
            return res.json(response(existMsg(name), STATIC_VARIABLES.ERROR_CODE.EXIST));
        case STATIC_VARIABLES.ERROR_CODE.CUSTOM:
            return res.json(response(name, STATIC_VARIABLES.ERROR_CODE.CUSTOM));
        default:
            if (isDebug) {
                return res.status(STATIC_VARIABLES.ERROR_CODE.INTERNAL_SERVER_ERROR).json({"result": error.toString()});
            } else {
                return res.status(STATIC_VARIABLES.ERROR_CODE.INTERNAL_SERVER_ERROR).json({"result": "Internal Server Error!"});
            }
    }
};

module.exports = {
    ErrorHelper,
    handleError,
    catchAsync
};