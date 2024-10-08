const express = require('express');
const uploadImage = require('../middlewares/uploads/upload_img');
const { veryfyAccessToken } = require('../middlewares/auth/jwt_service');
const { noteController } = require('../controllers/note.controller');

const noteRoute = express.Router();

noteRoute.post('/addNote', veryfyAccessToken, uploadImage('media'), noteController.addPost);

noteRoute.get('/getNoteByUserName/:username', noteController.getNoteByUName);

noteRoute.post('/likeNote', veryfyAccessToken, noteController.likeNote);

noteRoute.post('/checkLike', veryfyAccessToken, noteController.checkLike);

noteRoute.delete('/deleteNoteByID/:id', veryfyAccessToken, noteController.deleteNoteByID);

noteRoute.get('/getNoteByID/:id', noteController.getNoteByID);

noteRoute.post('/addComment', veryfyAccessToken, noteController.addComment);

noteRoute.delete('/deleteComments/:commentID', veryfyAccessToken, noteController.deleteComment);


module.exports = noteRoute;