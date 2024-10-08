'use strict';
const bcrypt = require('bcrypt');
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Post, Favorites, Follow, Comments, Message, Like, Note, LikeNote, CommentNote, MessageStatus }) {
      // define association here
      this.hasMany(Post, { foreignKey: "uID" });
      this.hasMany(Favorites, { foreignKey: "uID" });
      this.hasMany(Follow, { foreignKey: 'followerID' });
      this.hasMany(Follow, { foreignKey: 'followingID' });
      this.hasMany(Comments, { foreignKey: 'uID' });
      this.hasMany(Message, { foreignKey: "senderID" });
      this.hasMany(Message, { foreignKey: "receiverID" });
      this.hasMany(Like, { foreignKey: "uID" });
      this.hasMany(Note, { foreignKey: 'uID' });
      this.hasMany(LikeNote, { foreignKey: 'uID' });
      this.hasMany(CommentNote, { foreignKey: "uID" });
      this.hasMany(MessageStatus, { foreignKey: 'senderID' });
      this.hasMany(MessageStatus, { foreignKey: 'receiverID' });
    }

    async validationPassword(pass) {

      try {
        return await bcrypt.compareSync(pass, this.password);
      } catch (error) {
        console.log("error validation pass: ", error);
      }

    }
  }

  User.init({
    userName: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    fullName: {
      type: DataTypes.STRING
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    avatar: {
      type: DataTypes.TEXT
    },
    bio: {
      type: DataTypes.TEXT,
    },
    role: {
      type: DataTypes.INTEGER,

    }
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};