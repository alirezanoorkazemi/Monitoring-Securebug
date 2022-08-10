const oautha = require('oauth-1.0a');
const KJUR = require('jsrsasign');

const CONSUMER_KEY = OAUTH_1A.CONSUMER_KEY;
const TOKEN_KEY = OAUTH_1A.PRIVATE_KEY;

class OauthHelper {
    static getAuthHeaderForRequest(request) {
        const oauth = new oautha({
            consumer: {key: CONSUMER_KEY, secret: TOKEN_KEY},
            signature_method: 'RSA-SHA1',
            version: '1.0',
            hash_function(base_string) {
                const Signature = new KJUR.crypto.Signature({"alg": "SHA1withRSA"});
                Signature.init(TOKEN_KEY);
                Signature.updateString(base_string);
                const sigValueHex = Signature.sign();
                return Buffer.from(sigValueHex, 'hex').toString('base64')
            }
        });
        return oauth.toHeader(oauth.authorize(request));
    }
}

module.exports = OauthHelper;