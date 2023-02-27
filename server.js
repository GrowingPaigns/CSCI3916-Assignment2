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
        headers: "[No Query Headers]",
        key: process.env.UNIQUE_KEY,
        body: "[Empty Query Body]",
        parameters: "[No Query Parameters]"

    };

    /* Checks for/assigns values to above json variables
     * [NOTE: Object.keys(___) gathers the keys from each k:v pair in req;
     * .length arg means we are gathering the number of keys in req]
     */

    if (Object.keys(req.body).length >= 1) {
        json.body = req.body;
    }
    if (Object.keys(req.headers).length >= 1) {
        json.headers = req.headers;
    }
    if (Object.keys(req.query).length >= 1) {
        json.parameters = req.query;

    }

    return json;
}

const signInUpMethods = ['POST']
const movieMethods = ['POST','DELETE','PUT','GET']
function methodCheck(req, res, next){
    const method = req.method.toUpperCase();
    if (!signInUpMethods.includes(method)){
        return res.status(405).send('Unsupported HTTP Method [' + method + '] Input');
    }else{
        next();
    }

}
function movieMethodCheck(req, res, next){
    const method = req.method.toUpperCase();
    if (!movieMethods.includes(method)){
        return res.status(405).send('Unsupported HTTP Method [' + method + '] Input');
    }else{
        next();
    }

}
// check if call to base URL was made
router.all('/', (req, res) => {
    if (req.originalUrl === '/'){
        res.status(401).send({success: false, msg: '[ERROR - Tried to Access Base URL]'});
        return;
    }
});

/* Method Check: ensure that no improper methods were used in sign in/up process */
router.route(['/signup', '/signin'])
    .all(methodCheck) // does not account for HEAD or OPTIONS

/* Server Route #1: Signing Up */
// connect to router which is listening for a post on the 'signup' path
// set up anon function which takes request/response (ONLY LISTENS FOR 'POST')
router.post('/signup', (req, res) => { // takes in json object body

    if (!req.body.username || !req.body.password) { // error check for id/password
        res.json({success: false, message: 'Please include both username and password to signup.'})
    } else {
        var newUser = { // creates a new user with the received variables
            username: req.body.username,
            password: req.body.password
        };
        var o = getJSONObjectForMovieRequirement(req);

        db.save(newUser); //no duplicate checking - just appending/saving to the array
        res.json({success: true, message: 'Successfully created new user.',response: o}) // return success msg

        //res.json(o); // send json back to the object
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
            var o = getJSONObjectForMovieRequirement(req);
            res.json ({success: true, token: 'JWT ' + token , response: o});

            //res.json(o); // send json back to the object
        }
        else { // if passwords do no match - send error
            res.status(401).send({success: false, msg: 'Authentication failed.'});
        }
    }
});

/* Server Route #3: Movie Collection */
router.route('/testcollection') // this will be movie
    .all(movieMethodCheck) // ensure no improper methods are used in movie calls
    .post((req, res) => {
            console.log(req.body);
            res = res.status(200);
            // if request has a content type, set response to same type
            if (req.get('Content-Type')) {
                res = res.type(req.get('Content-Type'));
            }
            var o = getJSONObjectForMovieRequirement(req);
            res.json(o); // send json back to the object
        }
    )
    .get((req, res) => {
            console.log(req.body);
            res = res.status(200);
            // if request has a content type, set response to same type
            if (req.get('Content-Type')) {
                res = res.type(req.get('Content-Type'));
            }
            var o = getJSONObjectForMovieRequirement(req);
            res.json(o); // send json back to the object
        }
    )
    .delete(authController.isAuthenticated, (req, res) => {
            console.log(req.body);
            res = res.status(200);
            // if request has a content type, set response to same type
            if (req.get('Content-Type')) {
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




app.use('/', router); // app.use on root
app.listen(process.env.PORT || 1818); // port taken from render/local machine
module.exports = app; // for unit testing - without export, we cant leverage the file