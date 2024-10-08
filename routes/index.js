var express = require('express');
const userRouter = require('./users');
const categoryRouter = require('./category');
const postRouter = require('./post');
const noteRoute = require('./note');
const { chatRouter } = require('./chat');

var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.use('/user', userRouter);
router.use('/category', categoryRouter);
router.use('/post', postRouter)
router.use('/note', noteRoute);
router.use('/chat', chatRouter);


module.exports = router;
