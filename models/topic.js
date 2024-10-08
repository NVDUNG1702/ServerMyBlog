'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Topic extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ PostTopic, Categories }) {
      // define association here
      this.hasMany(PostTopic, { foreignKey: "topicID" });
      this.belongsTo(Categories, {foreignKey: "categoryID"})
    }
  }
  Topic.init({
    categoryID: {
      
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Categories",
        key: "id"
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    description: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Topic',
  });
  return Topic;
};