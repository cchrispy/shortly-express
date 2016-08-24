var db = require('../config');
var user = require('./user');
var link = require('./link');


var UserLink = db.Model.extend({
  // tableName: 'users_urls',
  // hasTimestamps: false,
  // users: function() {
  //   return this.belongsTo(user, 'user_id');
  // },
  // urls: function() {
  //   return this.belongsTo(link, 'url_id');
  // }

});

module.exports = UserLink;