const app = require("./app");
const fs = require("fs");
const {images, Chats, Rooms, users, sequelize, Sequelize } = require("./models");
const { Op } = sequelize;
const socket = require("socket.io-client")("https://mendorong-jeju.com");
const server = require("http").createServer(app);
module.exports = (server, app) => {
  const io = require("socket.io")(server, {
    cors: {
      origin: ["http://localhost:3000", "*", "https://mendorong-jeju.co.kr"],
      credentials: true,
    },
  });
  app.set("io", io);
  io.on("connection", (socket) => {
    socket.on("join-room", async (roomId) => {
      const enterRoom = await Rooms.findOne({
        where: { roomId: roomId },
      });
      if (!enterRoom) {
        res.status(400).send({
          errorMessage: "존재하지 않는 방입니다.",
        });
        return;
      }
      
      socket.join(enterRoom.title);

      if (enterRoom.roomUserId.length === 0) {
        let nickName = enterRoom.hostNickname;
        console.log("호스트닉네임=", nickName);
        socket.emit("welcome", nickName);
      }
      //       else {
      //         let lastUser = enterRoom.roomUserNickname.length-1;
      //         let nickName = enterRoom.roomUserNickname[lastUser];
      //         console.log("유저닉네임=", nickName);
      //         socket.to(enterRoom.title).emit("welcome", nickName);
      //       }
    });

    socket.on("chat_message", async (messageChat, userId, roomId) => {
      console.log(messageChat, userId, roomId);
      const chatUser = await users.findOne({ where: { userId: userId } });
      const userImg = await images.findOne({where: { userId: userId } });
      console.log(Object.values(chatUser), Object.values(userImg), chatUser.dataValues.nickname, userImg.dataValues.userImageURL);
      const newchat = await Chats.create({
        userNickname: chatUser.nickName,
        userId: userId,
        roomId: roomId,
        chat: messageChat,
        userImg: chatUser.userImage,
      });
      console.log(io.sockets.adapter.sids);
      socket.emit(
        "message",
        messageChat,
        chatUser.dataValues.nickname,
        userImg.dataValues.userImageURL,
        roomId
      );
    });
  });
};
