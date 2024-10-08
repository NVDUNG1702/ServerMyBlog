'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Categories extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Topic }) {
      // define association here
      this.hasMany(Topic, { foreignKey: "categoryID" });

    }
  }
  Categories.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    detail: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Categories',
  });
  return Categories;
};