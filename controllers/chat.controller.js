const { Op } = require('sequelize');
const { Message, MessageStatus, User, sequelize, OnlineUsers } = require('../models/index');
const { getSocketMessageInstance } = require('../socket/socketMessage');


const chatController = {
    getListChat: async (req, res) => {


        try {
            const { uID } = req.user; // userID của người dùng hiện tại

            // Lấy danh sách người dùng đã nhắn tin với trạng thái tin nhắn
            const chatList = await MessageStatus.findAll({
                where: {
                    senderID: uID // Người dùng hiện tại là người gửi
                },
                include: [
                    {
                        model: User, // Liên kết với bảng User
                        attributes: [
                            'id',
                            [sequelize.fn('MAX', sequelize.col('fullName')), 'fullName'],
                            [sequelize.fn('MAX', sequelize.col('avatar')), 'avatar'],
                            [sequelize.fn('MAX', sequelize.col('userName')), 'userName']
                        ], // Lấy thông tin người nhận
                    }
                ],
                attributes: [
                    'id',
                    'updatedAt',
                    'receiverID',
                    [sequelize.fn('MAX', sequelize.col('status')), 'status']
                ], // Lấy trạng thái xem tin nhắn
                group: ['MessageStatus.receiverID', 'User.id', 'User.fullName', 'User.avatar', 'User.userName', 'MessageStatus.id'], // Cần group theo tất cả các trường không sử dụng hàm tổng hợp
                order: [[sequelize.fn('MAX', sequelize.col('MessageStatus.updatedAt')), 'DESC']] // Thêm bảng MessageStatus cho updatedAt để tránh lỗi mơ hồ
            });



            return res.status(200).json({
                status: 200,
                data: chatList
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Lỗi khi lấy danh sách chat' });
        }
    },

    sendMessage: async (req, res) => {
        try {
            const { senderID, content, receiverID } = req.body;
            const { uID } = req.user;
            if (uID != senderID || !uID) {
                return res.status(404).json({
                    status: 404,
                    error: 'user send not found'
                })
            }

            // Tạo tin nhắn mới
            const newMessage = await Message.create({ content, receiverID, senderID });

            // Kiểm tra trạng thái tin nhắn giữa hai người
            let messageStatus = await MessageStatus.findOne({ where: { senderID: receiverID, receiverID: senderID } });
            let messageStatusReceiver = await MessageStatus.findOne({ where: { senderID: senderID, receiverID: receiverID } });
            if (!messageStatusReceiver) {
                await MessageStatus.create({
                    senderID: senderID,
                    receiverID: receiverID,
                    status: 1
                });
            }
            if (!messageStatus) {
                // Nếu chưa có trạng thái, tạo mới
                messageStatus = await MessageStatus.create({
                    senderID: receiverID,
                    receiverID: senderID,
                    status: 0
                });
            } else {
                // Nếu đã có, cập nhật trạng thái thành 0 (chưa đọc)
                messageStatus.status = 1;
                // messageStatus.updatedAt = sequelize.fn('NOW'); // Cập nhật lại thời gian
                await messageStatus.save();
                messageStatus.status = 0;
                await messageStatus.save();
            }

            // Lấy thông tin trạng thái của tin nhắn
            const getMessage = await MessageStatus.findAll({
                where: { senderID: receiverID },
                include: [
                    {
                        model: User, // Liên kết với bảng User
                        attributes: [
                            'id',
                            [sequelize.fn('MAX', sequelize.col('fullName')), 'fullName'],
                            [sequelize.fn('MAX', sequelize.col('avatar')), 'avatar'],
                            [sequelize.fn('MAX', sequelize.col('userName')), 'userName']
                        ], // Lấy thông tin người nhận
                    }
                ],
                attributes: [
                    'id',
                    'updatedAt',
                    'receiverID',
                    [sequelize.fn('MAX', sequelize.col('status')), 'status']
                ], // Lấy trạng thái xem tin nhắn
                group: ['MessageStatus.receiverID', 'User.id', 'User.fullName', 'User.avatar', 'User.userName', 'MessageStatus.id'], // Cần group theo tất cả các trường không sử dụng hàm tổng hợp
                order: [[sequelize.fn('MAX', sequelize.col('MessageStatus.updatedAt')), 'DESC']] // Thêm bảng MessageStatus cho updatedAt để tránh lỗi mơ hồ
            });

            const ioMessage = getSocketMessageInstance();

            if (!newMessage) {
                return res.status(500).json({
                    status: 500,
                    error: 'Lỗi khi gửi tin nhắn'
                });
            }

            // Kiểm tra xem người nhận có online không
            const idSocket = await OnlineUsers.findOne({ where: { uID: receiverID } });

            if (idSocket) {
                ioMessage.to(idSocket.socketID).emit('receiveMessage', {
                    message: newMessage,
                    status: getMessage
                });
            }

            // Phản hồi thành công
            res.status(201).json({
                status: 201,
                data: newMessage
            });

        } catch (error) {
            // Xử lý lỗi và trả về phản hồi
            console.error('Error sending message:', error);
            res.status(500).json({
                status: 500,
                error: 'Đã xảy ra lỗi khi gửi tin nhắn: ' + error
            });
        }
    },


    getMessage: async (req, res) => {
        try {
            const { userName } = req.params;
            const { uID } = req.user;
            const userFind = await User.findOne({ where: { userName } });


            if (!userFind) {
                return res.status(404).json({
                    status: 404,
                    error: "user not found"
                })
            }
            const message = await Message.findAll({
                where: {
                    [Op.or]: [
                        { receiverID: uID, senderID: userFind.id },
                        { senderID: uID, receiverID: userFind.id }
                    ]
                },
                order: [['createdAt', 'ASC']]
            })

            res.status(200).json({
                status: 200,
                data: { message: message, user: userFind }
            })

        } catch (error) {
            console.log("Lỗi get message: ", error);
            return res.status(500).json({
                status: 500,
                error: error.message
            })

        }
    },

    watchedMessage: async (req, res) => {
        try {
            const { id } = req.body;
            const { uID } = req.user;

            const user = await User.findOne({ where: { id: uID } });

            if (!user) {
                return res.status(404).json({
                    status: 404,
                    error: 'User not found'
                })
            }
            // Tìm bản ghi trạng thái tin nhắn giữa hai người dùng
            const statusMessage = await MessageStatus.findOne({
                where: { id }
            });

            // Kiểm tra nếu không tìm thấy trạng thái tin nhắn
            if (!statusMessage) {
                return res.status(404).json({
                    status: 404,
                    error: 'Trạng thái tin nhắn không tìm thấy'
                });
            }

            // Cập nhật status = 1 (đã đọc) nhưng không thay đổi updatedAt
            statusMessage.status = 1;
            await statusMessage.save({ silent: true });

            const getMessage = await MessageStatus.findAll({
                where: { senderID: uID },
                include: [
                    {
                        model: User, // Liên kết với bảng User
                        attributes: [
                            'id',
                            [sequelize.fn('MAX', sequelize.col('fullName')), 'fullName'],
                            [sequelize.fn('MAX', sequelize.col('avatar')), 'avatar'],
                            [sequelize.fn('MAX', sequelize.col('userName')), 'userName']
                        ], // Lấy thông tin người nhận
                    }
                ],
                attributes: [
                    'id',
                    'updatedAt',
                    'receiverID',
                    [sequelize.fn('MAX', sequelize.col('status')), 'status']
                ], // Lấy trạng thái xem tin nhắn
                group: ['MessageStatus.receiverID', 'User.id', 'User.fullName', 'User.avatar', 'User.userName', 'MessageStatus.id'], // Cần group theo tất cả các trường không sử dụng hàm tổng hợp
                order: [[sequelize.fn('MAX', sequelize.col('MessageStatus.updatedAt')), 'DESC']] // Thêm bảng MessageStatus cho updatedAt để tránh lỗi mơ hồ
            });

            // Trả về kết quả cập nhật nhưng không thay đổi updatedAt
            return res.status(200).json({
                status: 200,
                data: getMessage
            });

        } catch (error) {
            console.error('Error updating message status:', error);
            return res.status(500).json({
                status: 500,
                error: 'Đã xảy ra lỗi khi cập nhật trạng thái tin nhắn: ' + error
            });
        }
    }

}


module.exports = { chatController };