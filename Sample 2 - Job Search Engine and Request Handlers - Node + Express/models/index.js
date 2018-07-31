
/*
 * app/models/index.js
 * 
 * Loads all models and creates the relationships for those models.
 * 
 * Date: 2018/02/05
 */

var fs = require('fs')
var path = require('path')
var sequelize = require('../../config').dbConnection;
var Sequelize = require('sequelize');

var models = {};

// Get all models
var modelsList = fs.readdirSync(path.resolve(__dirname, "./"))
  .filter((t) => ~t.indexOf('.js') && !~t.indexOf("index"))
  .map((model) => sequelize.import(__dirname + '/' + model))

// Camel case the models
for (var i = 0; i < modelsList.length; i++) {
  var modelName = toCamelCase(modelsList[i].name);
  // Place them onto the models return object
  models[modelName] = modelsList[i];
}

// Create the relationships for the models by calling
// the "associate()" function in each file.
Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

// turns base_user => BaseUser
function toCamelCase (str) {
  var _ = str.indexOf("_");

  // Check this out, I know you'll like it
  // https://khalilstemmler.com/blog/tilde-in-javascript/ :)
  
  if (~_) {
    return toCamelCase(str.substring(0, _) 
        + str.substring(_ + 1)
          .substring(0,1)
          .toUpperCase() 
        + str.substring(_ + 2)
    )
  }
  else {
    return str.substring(0,1)
    .toUpperCase() + str.substring(1);
  }
}

module.exports = models;
module.exports.sequelize = sequelize;
module.exports.Sequelize = Sequelize;
