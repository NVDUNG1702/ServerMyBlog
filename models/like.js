'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Like extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({User, Post}) {
      // define association here
      this.belongsTo(User, {foreignKey: "uID"});
      this.belongsTo(Post, {foreignKey: "postID"});
    }
  }
  Like.init({
    postID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Post",
        key: "id"
      }
    },
    uID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "User",
        key: "id"
      }
    }
  }, {
    sequelize,
    modelName: 'Like',
  });
  return Like;
};