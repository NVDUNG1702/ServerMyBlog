'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LikeNote extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Note, User }) {
      // define association here
      this.belongsTo(Note, { foreignKey: 'noteID', onDelete: 'CASCADE', });
      this.belongsTo(User, { foreignKey: 'uID', onDelete: 'CASCADE', })
    }
  }
  LikeNote.init({
    noteID: {
      allowNull: false,
      type: DataTypes.INTEGER,
      references: {
        model: 'Note',
        key: 'id',

      }
    },
    uID: {
      allowNull: false,
      type: DataTypes.INTEGER,
      references: 'User',
      key: 'id'
    }
  }, {
    sequelize,
    modelName: 'LikeNote',
  });
  return LikeNote;
};