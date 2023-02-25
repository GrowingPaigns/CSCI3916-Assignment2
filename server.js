/*
* CSCI 3916 HW2
* Description: Web API server program for Movie API
* node parameter in run config injects the dotenv config when we start server.js
*/

var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');
var passport = require('passport');
var authController = require('./auth');
var authJwtController = require('./auth_jwt');
db = require('./db')();
var jwt = require('jsonwebtoken');
var cors = require('cors');

var app = express(); // creates express server
app.use(cors()); // allows the browser to make a call to the server
app.use(bodyParser.json()); // removes the need to manually parse objects
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

var router = express.Router(); // for handling git requests

function getJSONObjectForMovieRequirement(req) { // takes in the request obj
    var json = {
        headers: "No headers",
        key: process.env.UNIQUE_KEY,
        body: "No body"

    };

    /* checks above json values - takes care of the first part of "If the server
     * accepts a request..."
     */
    if (req.body != null) {
        json.body = req.body;
    }
    if (req.headers != null) {
        json.headers = req.headers;
    }

    return json;
}

/* Server Route #1: Signing Up */
// connect to router which is listening for a post on the 'signup' path
// set up anon function which takes request/response (ONLY LISTENS FOR 'POST')
router.post('/signup', (req, res) => { // takes in json object body
    if (!req.body.username || !req.body.password) { // error check for id/password
        res.json({success: false, msg: 'Please include both username and password to signup.'})
    } else {
        var newUser = { // creates a new user with the received variables
            username: req.body.username,
            password: req.body.password
        };

        db.save(newUser); //no duplicate checking - just appending/saving to the array
        res.json({success: true, msg: 'Successfully created new user.'}) // return success msg
    }
});


/* Server Route #2: Signing in */
router.post('/signin', (req, res) => {
    var user = db.findOne(req.body.username); // gathers user from db

    if (!user) { // 401 ERROR check
        res.status(401).send({success: false, msg: 'Authentication failed. User not found.'});
    } else {
        // if user is found and password is valid... send back a jwt token.
        // JWT response - first string of chars gives us the header type "JWT"; second string of chars
        // gives us the payload (id, username, pass) third string is used to verify the signature encoding
        // (Combined, this allows the server to validate that the token hasn't been tampered with)
        if (req.body.password == user.password) {
            var userToken = { id: user.id, username: user.username };
            // used to authenticate key from env file
            var token = jwt.sign(userToken, process.env.SECRET_KEY);
            // if successful send jwt token
            res.json ({success: true, token: 'JWT ' + token});
        }
        else { // if passwords do no match - send error
            res.status(401).send({success: false, msg: 'Authentication failed.'});
        }
    }
});

router.route('/testcollection') // this will be movie
    //.post
    //.get
    .delete(authController.isAuthenticated, (req, res) => {
            console.log(req.body);
            res = res.status(200);
            if (req.get('Content-Type')) { // if request has a content type, set response to same type
                res = res.type(req.get('Content-Type'));
            }
            var o = getJSONObjectForMovieRequirement(req);
            res.json(o); // send json back to the object
        }
    )
    .put(authJwtController.isAuthenticated, (req, res) => {
            console.log(req.body);
            res = res.status(200);
            if (req.get('Content-Type')) {
                res = res.type(req.get('Content-Type'));
            }
            var o = getJSONObjectForMovieRequirement(req);
            res.json(o);
        }
    );


/* TODO
*  Create route to handle GET and POST movie methods
*       route above handles authentication of PUT/DELETE movie methods
* */
app.use('/', router); // app.use on root
app.listen(process.env.PORT || 1818); // port taken from render/local machine
module.exports = app; // for unit testing - without export, we cant leverage the file