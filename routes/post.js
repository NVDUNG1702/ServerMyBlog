
const express = require("express");
const postController = require("../controllers/post.controller");
const { veryfyAccessToken } = require("../middlewares/auth/jwt_service");

const postRouter = express.Router();

postRouter.post('/addPost', veryfyAccessToken, postController.addPost);

postRouter.get('/getPostByUID/:username', postController.getPostUID)




module.exports = postRouter

