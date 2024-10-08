
const { Categories, Topic } = require("../models/index");


const categoryController = {
    getAllTopic: async (req, res) => {
        try {
            const data = await Topic.findAll({
                attributes: ['id', 'name', 'description'],
            });
            if (!data) {
                return res.status(404).json({
                    error: "Not found!"
                })

            }
            if (data.length == 0) {
                return res.status(404).json({
                    error: "Topic is undefined"
                })
            }

            res.status(200).json({
                message: "Success!",
                data: data
            })
        } catch (error) {
            console.log("Lỗi get all topic: ", error);

            res.status(500).json({
                error: error
            })
        }
    }
}

module.exports = categoryController