'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CommentNote extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ User, Note, CommentNote }) {
      // define association here
      this.belongsTo(User, { foreignKey: "uID", onDelete: 'CASCADE', });
      this.belongsTo(Note, { foreignKey: "noteID", onDelete: 'CASCADE', });
      this.belongsTo(CommentNote, { foreignKey: "parentID", onDelete: 'CASCADE', });
    }
  }
  CommentNote.init({
    noteID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Note",
        key: "id",

      }
    },
    uID: {
      allowNull: false,
      type: DataTypes.INTEGER,
      references: {
        model: "User",
        key: "id"
      }
    },
    content: {
      allowNull: false,
      type: DataTypes.STRING
    },
    parentID: {
      type: DataTypes.INTEGER,
      references: {
        model: "CommentNote",
        key: "id",

      }
    }
  }, {
    sequelize,
    modelName: 'CommentNote',
  });
  return CommentNote;
};