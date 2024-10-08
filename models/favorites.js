'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Favorites extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({Post, User}) {
      // define association here
      this.belongsTo(Post, {foreignKey: "postID"});
      this.belongsTo(User, {foreignKey: 'uID'});
    }
  }
  Favorites.init({
    uID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "User",
        key: "id"
      }
    },
    postID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Post",
        key: "id"
      }
    }
  }, {
    sequelize,
    modelName: 'Favorites',
  });
  return Favorites;
};