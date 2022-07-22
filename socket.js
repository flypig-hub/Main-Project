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
    socket.onAny((event) => {
      
      console.log(`Socket Event:${event}`);
      console.log(io.sockets.adapter);
      
    });
    socket.on("join-room", async (roomId) => {
      const enterRoom = await Rooms.findOne({
        where: { roomId: roomId },
      });
     
      console.log(enterRoom.title, "로 입장합니다");
      socket.join(enterRoom.title);

      if (enterRoom.roomUserId.length === 0) {
        let nickName = enterRoom.hostNickname;
        console.log("호스트닉네임=", nickName);
        socket.emit("welcome", nickName);
      }
            else {
              let lastUser = enterRoom.roomUserNickname.length-1;
              let nickName = enterRoom.roomUserNickname[lastUser];
              console.log("유저닉네임=", nickName);
              socket.to(enterRoom.title).emit("welcome", nickName);
            }
    });

    socket.on("chat_message", async (messageChat, userId, roomId) => {
      console.log(messageChat, userId, roomId);
      const chatUser = await users.findOne({ where: { userId: userId } });
      const userImg = await images.findOne({where: { userId: userId } });
      const room = await Rooms.findOne({where: { roomId: roomId } });
      console.log(Object.values(chatUser), Object.values(userImg), chatUser.dataValues.nickname, userImg.dataValues.userImageURL);
      const newchat = await Chats.create({
        userNickname: chatUser.dataValues.nickname,
        userId: userId,
        roomId: roomId,
        chat: messageChat,
        userImg: userImg.dataValues.userImageURL,
      });
      console.log(room.title);
      socket.to(room.title).emit(
        "message",
        messageChat,
        chatUser.dataValues.nickname,
        userImg.dataValues.userImageURL,
        roomId
      );
    });
    
    socket.on("leave-room", async (roomId) => {
      console.log(roomId);
      const leaveRoom = await Rooms.findOne({
        where: { roomId: roomId },
      });

      if (!leaveRoom) {
        res.status(400).send({
          errorMessage: "존재하지 않는 방입니다.",
        });
        return;
      }
      console.log(leaveRoom.title,"에서퇴장합니다");
      socket.leave(leaveRoom.title);
      
      console.log(io.sockets.adapter)
      
      if (leaveRoom.roomUserId.length === 0) {
        let nickName = leaveRoom.hostNickname;
        console.log("호스트닉네임=", nickName);
        socket.to(leaveRoom.title).emit("bye", nickName);
      } else {
        let lastUser = leaveRoom.roomUserNickname.length - 1;
        let nickName = leaveRoom.roomUserNickname[lastUser];
        console.log("유저닉네임=", nickName);
        socket.to(leaveRoom.title).emit("bye", nickName);
      }
    });
  });
};
