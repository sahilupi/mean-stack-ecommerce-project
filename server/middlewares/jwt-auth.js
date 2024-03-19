const { expressjwt: jwt } = require('express-jwt');

const devEnv = require('../dev-env/dev-env');

function authJwt() {
    const jwtSecret = process.env.JWT_SECRET || devEnv.JWT_SECRET;
    const api = process.env.API_URL || devEnv.API_URL;
    return jwt({
        secret: jwtSecret,
        algorithms: ['HS256'],
        isRevoked: isRevoked
    }).unless({
        path: [
            {url: /\/api\/v1\/products(.*)/, methods: ['GET', 'OPTIONS']},
            `${api}/users/user-login`,
            `${api}/users/post-user`
        ]
    })
};

async function isRevoked(req, payload, done){
    if(!payload.isAdmin) {
        done(null, true);
    }
    done();
}

module.exports = authJwt;