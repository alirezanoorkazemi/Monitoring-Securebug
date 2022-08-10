const check = require('express-validator');
const {requiredResponse, notValidResponse} = require('../../../libs/message.helper');
const {safeString} = require('../../../libs/methode.helper');

const updateValidationSchema = () => {
    return [
        check.body('tab').notEmpty({ignore_whitespace: true})
            .withMessage(requiredResponse("tab")).bail()
            .isInt().withMessage(notValidResponse("tab")).bail()
            .isIn([0]).withMessage(notValidResponse("tab"))
            .toInt(),
        check.body('reciever_email').if(check.body('tab').equals("0"))
            .notEmpty({ignore_whitespace: true})
            .withMessage(requiredResponse("reciever_email")).bail()
            .isEmail().withMessage(notValidResponse("reciever_email")).bail()
            .trim().customSanitizer(v => safeString(v)),
        check.body('reciever_sales_email').if(check.body('tab').equals("0"))
            .notEmpty({ignore_whitespace: true})
            .withMessage(requiredResponse("reciever_sales_email")).bail()
            .isEmail().withMessage(notValidResponse("reciever_sales_email")).bail()
            .trim().customSanitizer(v => safeString(v))
    ]
};

module.exports = {
    update: updateValidationSchema
};