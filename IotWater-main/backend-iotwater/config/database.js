const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('iotwater', 'root', '', {
  host: 'localhost',
  dialect: 'mysql'
});

module.exports = sequelize;
