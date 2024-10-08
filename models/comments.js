'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Comments extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Post, User }) {
      // define association here
      this.belongsTo(Post, { foreignKey: "postID" });
      this.belongsTo(User, { foreignKey: "uID" });

      this.hasMany(Comments, { foreignKey: 'parentID', as: 'Replies' }); // Một bình luận có thể có nhiều phản hồi (replies)
      this.belongsTo(Comments, { foreignKey: 'parentID', as: 'ParentComment' }); // Một bình luận có thể là phản hồi của một bình luận khác
    }
  }
  Comments.init({
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
    },
    content: {
      type: DataTypes.STRING,
      allowNull: false
    },
    parentID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Comments",
        key: "id",
      },
      onDelete: "CASCADE"
    }
  }, {
    sequelize,
    modelName: 'Comments',
  });
  return Comments;
};