'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PostTopic extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Post, Topic }) {
      // define association here
      this.belongsTo(Post, { foreignKey: "postID" });
      this.belongsTo(Topic, { foreignKey: "topicID" });

    }
  }
  PostTopic.init({
    postID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Post",
        key: "id"
      }
    },
    topicID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Topic",
        key: "id"
      }
    }
  }, {
    sequelize,
    modelName: 'PostTopic',
  });
  return PostTopic;
};