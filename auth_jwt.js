var passport = require('passport');
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;

var opts = {}; // options
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme("jwt"); // get token from header
opts.secretOrKey = process.env.SECRET_KEY; // collect secret key

passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
    var user = db.find(jwt_payload.id); // db lookup based on earlier assigned id

    if (user) {
        done(null, user);
    } else {
        done(null, false);
    }
}));

exports.isAuthenticated = passport.authenticate('jwt', { session : false });
exports.secret = opts.secretOrKey ;