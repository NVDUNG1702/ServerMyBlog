'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Post extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Favorites, User, Comments, PostTopic, Like }) {
      // define association here
      this.hasMany(Favorites, { foreignKey: "postID" });
      this.belongsTo(User, { foreignKey: "uID" });
      this.hasMany(Comments, { foreignKey: "postID" });
      this.hasMany(PostTopic, { foreignKey: "postID" });
      this.hasMany(Like, { foreignKey: "postID" });
    }
  }
  Post.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    uID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "User",
        key: "id"
      },

    },
    author: {
      type: DataTypes.STRING, 
      allowNull: false
    },
    source: {
      type: DataTypes.STRING
    },
  }, {
    sequelize,
    modelName: 'Post',
  });
  return Post;
};