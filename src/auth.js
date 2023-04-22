require('dotenv').config();

const CryptoJS = require("crypto-js");

class Auth {
    static createAuth() {
        const dt = new Date();
    
        const d = dt.getDate();
        const m = dt.getMonth() + 1;
        const y = dt.getFullYear();
    
        const calc = d * m * y;
    
        return CryptoJS.MD5('n9e8o7' + calc).toString();
    }

    static check(req, res, next) {

        const auth = req.query.auth;
    
        const auth1 = Auth.createAuth();
    
        if (auth1 == auth) {
            next();
        } else {
            res.status(500).json({
                status: false,
                message: 'Falha na autenticacao'
            });
        }
    }
}

module.exports = {
    Auth
}