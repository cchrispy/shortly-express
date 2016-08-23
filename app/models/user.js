var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');



var User = db.Model.extend({
  tableName: 'users',
  hasTimestamps: true,
  hashPW: function(password, cb) {
    bcrype.hash(password, null, null, function(err, hash) {
      cb(hash);
    });
  },
  comparePW: function(password, hash, cb) {
    bcrype.compare(password, hash, function(err, bool) {
      cb(bool);
    });
  } 

});

module.exports = User;