
const { Transaction } = require("sequelize");
const { Post, User, PostTopic, sequelize, Topic, Like } = require("../models/index");


const postController = {
    addPost: async (req, res) => {
        try {
            const t = await sequelize.transaction();
            const { title, content, author, source, topics } = req.body;
            const { uID } = req.user;
            const user = await User.findOne({ where: { id: uID } });
            if (!user) {
                return res.status(404).json({
                    error: "user not found!",
                    status: 404
                })
            }

            const newPost = await Post.create({
                title,
                content,
                author,
                source,
                uID
            }, { Transaction: t });


            if (topics && topics.length > 0) {

                await PostTopic.bulkCreate(
                    topics.map(topic => ({
                        postID: newPost.id,
                        topicID: topic.id,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    })),
                    { Transaction: t } // Thực hiện trong transaction
                );
            }

            await t.commit();

            res.status(201).json({
                status: 201,
                message: "Post created successfully",
                newPost: newPost
            })
        } catch (error) {
            console.log("create post error: ", error);
            res.status(500).json({
                error: "create post error!",
                status: 500
            })

        }
    },

    getPostUID: async (req, res) => {
        try {
            const { username } = req.params;
            const user = await User.findOne({ where: { userName: username } });

            const post = await Post.findAll({
                where: { uID: user.id },
                include: [
                    {
                        model: PostTopic,
                        attributes: ['id'],
                        include: [
                            {
                                model: Topic,
                                attributes: ['id', 'name', 'description'] // Lấy tên và mô tả của Topic
                            }
                        ]
                    },
                    {
                        model: Like, // Đảm bảo sử dụng đúng model `Like`
                        attributes: [] // Không lấy thuộc tính của bảng Like, chỉ đếm số lượt like
                    }
                ],
                attributes: {
                    include: [
                        [
                            sequelize.fn('COUNT', sequelize.col('Likes.id')), // Đếm số lượt like
                            'like' // Đặt tên cho thuộc tính này
                        ]
                    ]
                },
                group: ['Post.id', 'PostTopics.id', 'PostTopics->Topic.id'] // Nhóm theo bài viết và chủ đề
            });




            res.status(200).json({
                status: 200,
                data: post
            })


        } catch (error) {
            console.log("error getPostUID: ", error);
            res.json(
                error
            )
        }
    }
}

module.exports = postController;