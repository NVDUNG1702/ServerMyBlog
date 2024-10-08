'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Note extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ User, LikeNote, CommentNote }) {
      // define association here
      this.belongsTo(User, { foreignKey: 'uID' });
      this.hasMany(LikeNote, { foreignKey: 'noteID' })
      this.hasMany(CommentNote, {foreignKey: "noteID"})
    }
  }
  Note.init({
    content: {
      allowNull: false,
      type: DataTypes.TEXT
    },
    media: {
      type: DataTypes.TEXT,
    },
    uID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'User',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'Note',
  });
  return Note;
};