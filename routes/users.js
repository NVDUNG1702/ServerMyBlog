var express = require('express');
const { veryfyAccessToken } = require('../middlewares/auth/jwt_service');
const userController = require('../controllers/user.controller');
const checkUnique = require('../middlewares/auth/unique');
const uploadImage = require('../middlewares/uploads/upload_img');
var userRouter = express.Router();

/* GET users listing. */
userRouter.get('/', (req, res) => {
  res.send("user");
});


userRouter.post('/senOTP', checkUnique, userController.senOTP);

userRouter.post('/register', userController.register);

userRouter.post('/login', userController.login);



userRouter.put('/update', veryfyAccessToken, uploadImage('avatars'), userController.update);

// userRouter.post('/forgot', userController.forgot);

userRouter.post('/updatePass');

// userRouter.post('/uploadAvatar', veryfyAccessToken, uploadImage('avatars'), userController.uploadAvatar);

userRouter.post('/login_with_token', veryfyAccessToken, userController.loginWithToken);

userRouter.post('/refresh_token', userController.refreshToken);

userRouter.post('/logout', veryfyAccessToken, userController.logOut);


userRouter.get('/getProfile/:userName', userController.getProfile);

userRouter.post('/checkFollow', veryfyAccessToken, userController.checkFollow);

userRouter.post('/follow', veryfyAccessToken, userController.follow);

module.exports = userRouter;
