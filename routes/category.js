const express = require("express");
const categoryController = require("../controllers/category.controller");

const categoryRouter = express.Router();

categoryRouter.get('/', (req, res)=>{
    res.json("hello")
})

categoryRouter.get("/getAll");

categoryRouter.get("/getAllTopic", categoryController.getAllTopic);


module.exports = categoryRouter;