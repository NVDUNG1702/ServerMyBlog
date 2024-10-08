const { Transaction } = require('sequelize');
const { Note, User, LikeNote, sequelize, CommentNote } = require('../models/index');
const mapComments = require('../helpers/mapComment');
const { deleteCommentAndReplies } = require('../helpers/removeAllComments');

const noteController = {
    addPost: async (req, res) => {
        try {
            const { uID } = req.user;
            const { content, type } = req.body;
            const { file } = req;

            const user = await User.findOne({ where: { id: uID } });
            if (!uID || !user) {
                return res.status(404).json({
                    status: 404,
                    error: "User not found!"
                })
            }
            let media = null;
            console.log(file, type);


            // Nếu có file được tải lên
            if (file) {
                const linkMedia = `http://localhost:1306/${file.path}`;
                const newLink = linkMedia.replace('/public', '');

                // Tạo đối tượng media dưới dạng chuỗi JSON
                media = JSON.stringify({ linkMedia: newLink, type });
            }

            // Tạo bài viết mới (Note)
            const newNote = await Note.create({ content, media, uID });

            // Trả về phản hồi khi bài viết được tạo thành công
            return res.status(201).json({
                status: 201,
                message: "Post created successfully!",
                data: newNote
            });

        } catch (error) {
            console.error("Error in addPost:", error);
            return res.status(500).json({
                status: 500,
                error: "Internal server error!"
            });
        }
    },

    getNoteByUName: async (req, res) => {
        try {
            const { username } = req.params;
            const user = await User.findOne({ where: { userName: username } });
            console.log(username);


            const post = await Note.findAll({
                where: { uID: user.id },
                include: [
                    {
                        model: LikeNote, // Model LikeNote để đếm số lượt thích
                        attributes: [] // Không cần lấy thuộc tính của bảng LikeNote, chỉ cần đếm số lượt thích
                    },
                    {
                        model: CommentNote, // Model CommentNote để đếm số bình luận
                        attributes: [] // Không cần lấy thuộc tính của bảng CommentNote, chỉ cần đếm số bình luận
                    }
                ],
                attributes: {
                    include: [
                        [
                            sequelize.literal(`(
                                SELECT COUNT(*)
                                FROM LikeNotes AS LikeNote
                                WHERE LikeNote.noteID = Note.id
                            )`),
                            'like'
                        ],
                        // Đếm số bình luận từ CommentNotes
                        [
                            sequelize.literal(`(
                                SELECT COUNT(*)
                                FROM CommentNotes AS CommentNote
                                WHERE CommentNote.noteID = Note.id
                            )`),
                            'comment'
                        ]
                    ]
                },
                group: ['Note.id'] // Nhóm theo bài viết
            });





            res.status(200).json({
                status: 200,
                data: post,
                avatar: user.avatar != null ? user.avatar : " ",
                userName: user.userName,
                fullName: user.fullName
            })


        } catch (error) {
            console.log(error);
            res.json(
                error
            )
        }
    },

    likeNote: async (req, res) => {
        try {
            const { idNote } = req.body;
            const { uID } = req.user;

            const user = await User.findOne({ where: { id: uID } });

            if (!user) {
                return res.status(404).json({
                    status: 404,
                    error: "User not found!"
                });
            }
            const checkLikeNote = await LikeNote.findOne({ where: { noteID: idNote, uID: user.id } });

            if (checkLikeNote) {
                const deletedCount = await LikeNote.destroy({ where: { uID: user.id, noteID: idNote } });
                if (deletedCount === 0) {
                    return res.status(404).json({
                        status: 404,
                        error: "Like not found"
                    });
                }
                return res.status(200).json({
                    status: 200,
                    message: "delete like success"
                })

            } else {
                await LikeNote.create({ uID: user.id, noteID: idNote });
                return res.status(201).json({
                    status: 201,
                    message: "like success"
                })
            }
        } catch (error) {
            console.log("Like Note Error: ", error);

            res.status(500).json({
                status: 500,
                error: "like note erorr"
            })
        }
    },
    checkLike: async (req, res) => {
        try {
            const { idNote } = req.body;
            const { uID } = req.user;

            const user = await User.findOne({ where: { id: uID } });

            if (!user) {
                return res.status(404).json({
                    status: 404,
                    error: "User not found!"
                });
            }
            const checkLikeNote = await LikeNote.findOne({ where: { noteID: idNote, uID: user.id } });

            return res.status(200).json({
                status: 200,
                check: checkLikeNote ? true : false
            });
        } catch (error) {
            console.log("error check like: ", error.message);

            return res.status(500).json({
                status: 500,
                error: "error check like"
            })
        }
    },

    deleteNoteByID: async (req, res) => {
        try {
            const d = await sequelize.transaction();
            const { uID } = req.user;
            const { id } = req.params;
            // Kiểm tra người dùng có tồn tại hay không
            const user = await User.findOne({ where: { id: uID } });
            if (!user) {
                return res.status(404).json({
                    status: 404,
                    error: "User not found!"
                });
            }

            // Kiểm tra note có tồn tại hay không
            const checkNote = await Note.findOne({ where: { id } });
            if (!checkNote) {
                return res.status(404).json({
                    status: 404,
                    error: "Note not found!"
                });
            }

            // Kiểm tra người dùng có phải là người sở hữu note không
            if (checkNote.uID !== uID) {
                return res.status(403).json({
                    status: 403,
                    error: "You are not authorized to delete this note!"
                });
            }

            // Xóa note
            const likeDelete = await LikeNote.destroy({ where: { noteID: id } }, {
                Transaction: d
            });

            const noteDelete = await Note.destroy({ where: { id } }, {
                Transaction: d
            });

            await d.commit();
            if (noteDelete) {
                return res.status(200).json({
                    status: 200,
                    message: "Delete successful"
                });
            } else {
                return res.status(500).json({
                    status: 500,
                    error: "Failed to delete the note!"
                });
            }
        } catch (error) {
            console.log("Delete Note Error: ", error);
            return res.status(500).json({
                status: 500,
                error: "An error occurred while deleting the note!"
            });
        }
    },

    getNoteByID: async (req, res) => {
        try {
            const g = await sequelize.transaction();
            const { id } = req.params;
            if (!id) {
                return res.status(404).json({
                    status: 404,
                    error: "Note note found!"
                })
            }

            const note = await Note.findOne(
                {
                    where: { id },

                    include: [
                        {
                            model: User,
                            attributes: ['id', 'fullName', 'userName', 'avatar']
                        },
                        {
                            model: CommentNote,
                            attributes: []
                        }, {
                            model: LikeNote,
                            attributes: []
                        }
                    ],
                    attributes: {
                        include: [
                            // Đếm số lượt thích từ LikeNotes
                            [
                                sequelize.literal(`(
                                    SELECT COUNT(*)
                                    FROM LikeNotes AS LikeNote
                                    WHERE LikeNote.noteID = Note.id
                                )`),
                                'like'
                            ],
                            // Đếm số bình luận từ CommentNotes
                            [
                                sequelize.literal(`(
                                    SELECT COUNT(*)
                                    FROM CommentNotes AS CommentNote
                                    WHERE CommentNote.noteID = Note.id
                                )`),
                                'comment'
                            ]
                        ]
                    }
                },
                {
                    transaction: g
                }

            )

            const comments = await CommentNote.findAll({
                where: { noteID: id },
                include: [
                    {
                        model: User,
                        attributes: ['id', 'fullName', 'userName', 'avatar']
                    }
                ],
                order: [['createdAt', 'ASC']]
            }, { transaction: g });

            await g.commit();



            if (!note) {
                return res.status(404).json({
                    status: 404,
                    error: "Note note found!"
                })
            }



            return res.status(200).json({
                status: 200,
                message: "Get note successfull!",
                data: note,
                comments: comments
            })
        } catch (error) {
            console.log("Get note by ID error: ", error.message);
            res.status(500).json({
                status: 500,
                error: error.message,
            })

        }
    },

    addComment: async (req, res) => {
        try {
            const { parentID, noteID, content } = req.body;
            const { uID } = req.user;
            const user = await User.findOne({ where: { id: uID } });

            const newComment = await CommentNote.create({
                parentID: parentID || null,
                noteID,
                uID,
                content
            });

            if (newComment) {
                console.log(await newComment);

                return await res.status(200).json({
                    status: 200,
                    data: {
                        id: newComment.id,
                        content: content,
                        parentID: parentID ? parentID : null,
                        createdAt: newComment.createdAt,
                        User: {
                            id: uID,
                            fullName: user.fullName,
                            userName: user.userName,
                            avatar: user.avatar
                        },
                        replies: []
                    }
                })
            }
            res.status(500).json({
                error: "error",
                status: 500
            })

        } catch (error) {
            res.status(500).json({
                error: error.message,
                status: 500
            })
        }
    },

    deleteComment: async (req, res) => {
        try {
            const { commentID } = req.params;
            const { uID } = req.user;
            // Kiểm tra nếu comment tồn tại
            const comment = await CommentNote.findOne({ where: { id: commentID, uID } });

            if (!comment) {
                return res.status(404).json({
                    status: 404,
                    message: "Comment not found"
                });
            }

            // Gọi hàm xoá comment và các replies của nó
            const deletedIDs = await deleteCommentAndReplies(commentID);
            console.log(deletedIDs);

            // Trả về phản hồi sau khi xoá thành công
            return res.status(200).json({
                status: 200,
                message: "Comment and its replies deleted successfully",
                data: deletedIDs
            });
        } catch (error) {
            console.log("Lỗi delete comments: ", error);

            return res.status(500).json({
                status: 500,
                error: error.message
            });
        }
    }

}

module.exports = { noteController };