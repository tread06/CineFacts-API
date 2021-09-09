require('dotenv').config();
const jwtSecret = process.env.JWT_SECRET;

const jwt = require('jsonwebtoken');
const passport = require('passport');

//passport strategies
require('./passport');

let generateJWTToken = (user) => {
    return jwt.sign(user, jwtSecret, {
        subject: user.Username,
        expiresIn: '7d',
        algorithm: 'HS256'
    });
}

//login route
module.exports = (router) => {
    router.post('/login', (req, res) => {
        passport.authenticate('local', { session: false }, (error, user, info) => {
            if (error) {
                return res.status(400).json({
                    message: 'Something is not right',
                    user: user
                });
            }
            if(!user)
            {
                console.log("User null");
                return res.status(400).json({
                    message: 'Something is not right',
                    user: user
                });
            }
            req.login(user, { session: false }, (error) => {
                if (error) {
                    res.send(error);
                }
                let token = generateJWTToken(user.toJSON());
                // shorthand for res.json({ user: user, token: token })
                return res.json({ user, token });
            });
        })(req, res);
    });
}