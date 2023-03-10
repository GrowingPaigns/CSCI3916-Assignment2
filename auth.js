var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;

passport.use(new BasicStrategy(
    function(username, password, done) {
        var user = { name: "cu_user"}; //could have called to a database to look this up
        if (username === user.name && password === "cu_rulez") // triple equal is type and value; double == is just equal
        {
            return done(null, user); // call the next thing on the callback chain (user available for request obj)
        }
        else // no user found
        {
            return done(null, false); // fail
        }
    }
));

exports.isAuthenticated = passport.authenticate('basic', { session: false });