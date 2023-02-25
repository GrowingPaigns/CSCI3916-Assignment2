/**
 * Created by shawnmccarthy on 1/22/17.
 */
'use strict;';
//Include crypto to generate the movie id
var crypto = require('crypto');
module.exports = function () { // the way we export capabilities to another module (server)
    return {
        userList: [],
        /*
         * Save the user inside the "db".
         */
        save: function (user) { // creates random user id and pushes it to user list
            user.id = crypto.randomBytes(20).toString('hex'); // fast enough for our purpose
            this.userList.push(user);
            return 1;
        },
        /*
         * Retrieve a object (movie) with a given id or return all the objects (movies)
         * if the id is undefined.
         */
        find: function (id) {
            if (id) {
                return this.userList.find(function (element) {
                    return element.id === id;
                });
            }
            else {
                return this.userList;
            }
        },
        findOne: function (name) { // finds a user by utilizing their name
            if (name) {
                return this.userList.find(function (element) {
                    return element.username === name;
                });
            }
            else {
                return this.userList;
            }
        },
        /*
         * Delete a movie with the given id.
         *
         * Filters the array (filter takes a funct, funct takes an element, if the id
         * of the element is the same, filter the user out and return a new array
         */
        remove: function (id) {
            var found = 0;
            this.userList = this.userList.filter(function (element) {
                if (element.id === id) {
                    found = 1;
                }
                else {
                    return element.id !== id;
                }
            });
            return found;
        },
        /*
         * Update a movie with the given id
         * Finds a user given an id in the provided array before updating username/password
         * (can implement sign up/in methods with this)
         */
        update: function (id, user) {
            var userIndex = this.userList.findIndex(function (element) {
                return element.id === id;
            });
            if (userIndex !== -1) {
                this.userList[userIndex].username = user.username;
                this.userList[userIndex].password = user.password;
                return 1;
            }
            else {
                return 0;
            }
        }
    };
};