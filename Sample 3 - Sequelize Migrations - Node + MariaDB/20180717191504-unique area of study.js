'use strict';

const Models = require('../../app/models');

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    return new Promise(async (resolve, reject) => {
      let areaOfStudies;
      let map = {};

      try {
        // Get all
        areaOfStudies = await Models.ListsAreaOfStudy.findAll({ where: { } })
        
        // Place all of them in a map by name
        areaOfStudies.forEach((area) => {
          if (!map.hasOwnProperty(area.name)) map[area.name] = [];
          map[area.name].push(area.area_of_study_id);
        })

        // Now, for each item in the map, we have to get the students that have that area of study
        for (let [name, ids] of Object.entries(map)) {
          // Get all students that have this area of study
          let properId = ids[0];
          let scrapIds = ids.splice(1);

          for(let id of scrapIds) {
            console.log(`Updating students who have ${name} with ${id} should be => ${properId}`);
            await queryInterface.sequelize.query(`UPDATE student SET area_of_study_id = ${properId} where area_of_study_id = ${id};`)
          }
        }

        // Then we'll delete all the old area of studies
        await queryInterface.sequelize.query(`DELETE from lists_area_of_study WHERE area_of_study_id >= 60;`)
        console.log("Deleted old")

        // Then, we'll ensure that's a unique constraint
        await queryInterface.addConstraint('lists_area_of_study', ['name'], {
          type: 'unique',
          name: 'unique_area_of_study'
        });
        console.log("Add unique constraint to lists_area_of_study")

        resolve();
      }

      catch (err) {
        console.log(err);
      }
    })
  },

  down: (queryInterface, Sequelize) => {}
};
