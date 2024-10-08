
const express = require('express');
const { chatController } = require('../controllers/chat.controller');
const { veryfyAccessToken } = require('../middlewares/auth/jwt_service');
const chatRouter = express.Router();


chatRouter.get('/getListChat', veryfyAccessToken, chatController.getListChat);

chatRouter.get('/getMessage/:userName', veryfyAccessToken, chatController.getMessage);

chatRouter.post('/sendMessage', veryfyAccessToken, chatController.sendMessage)

chatRouter.put('/watchedMessage', veryfyAccessToken, chatController.watchedMessage);

module.exports = { chatRouter };