const { Server } = require('socket.io');
const { OnlineUsers } = require('../models/index');
let io;

const initSocketMessage = (server) => {

    io = new Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    });
    io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);
        socket.on('test', (data) => {
            console.log('Received test event:', data);

            // Phát lại một sự kiện nếu cần
            // socket.emit('responseTest', { message: "Received your message!" });
        });
        socket.on('registerUser', async (data) => {
            try {
                const onlineUser = await OnlineUsers.findOne({ where: { uID: data.uID } });
                if (!onlineUser) {
                    await OnlineUsers.create({ uID: data.uID, socketID: socket.id });
                } else {
                    onlineUser.socketID = socket.id;
                    await onlineUser.save();
                }
            } catch (error) {
                console.log("error registerUser socket: ", error);
            }


            // console.log('data registerUser socket: ', data);
        });

        // socket.on('sendMessage', (data) => {
        //     const { message, senderId, receiverId } = data; // Đảm bảo rằng bạn lấy đúng dữ liệu
        //     const receiverSocketId = users[receiverId];
        //     console.log('====================================');
        //     console.log(data);
        //     console.log('====================================');
        //     if (receiverSocketId) {
        //         io.to(receiverSocketId).emit('receiveMessage', {
        //             message: message,
        //             senderId: senderId, // Gửi ID của người gửi
        //         });
        //     } else {
        //         console.log(`User ${receiverId} not found.`);
        //     }
        // });


        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });



    return io;
};

const getSocketMessageInstance = () => {
    if (!io) {
        throw new Error('Socket.IO chưa được khởi tạo!');
    }
    return io;
};

module.exports = { initSocketMessage, getSocketMessageInstance };
