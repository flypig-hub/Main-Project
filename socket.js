const app = require("./app");
const fs = require("fs");
const { chats, rooms, users, sequelize, Sequelize } = require("./models");
const { Op } = sequelize;
const socket = require("socket.io-client")("https://mendorong-jeju.com");
const server = require("http").createServer(app);
  const io = require("socket.io")(server, {
    cors: {
      origin: ["http://localhost:3000", "*", "https://mendorong-jeju.co.kr"],
      credentials: true,
    },
 
  });
  console.log(io);
app.set("io", io);

  io.on("connection", (socket) => {
    socket.on(
      "join-room",
      async (
        roomId
      ) => {
        const enterRoom = await rooms.findOne({
          where: { roomId: roomId }
        });
        
        socket.join(enterRoom.title);
        const existRoom = await rooms.findOne({
          where: { title: roomName },
        });
        
        if (!existRoom) {
          res.status(400).send({
            errorMessage: "존재하지 않는 방입니다."
          }
         );
         
          return;
        }
          socket.join(enterRoom.title);
        const nickName = existRoom.userNickname[existRoom.userNickname.length-1]
        const roomName = existRoom.title 
        socket.emit("welcome", nickName, roomName, "3번째인자");
        
      }
    );
    
    socket.on("chat_message", async (messageChat, userId, roomId) => {
      chatUser = await users.findOne({ where: { userId :userId}});
       const newchat = await chats.create({
         userNickname: nickName,
         userId: userId,
         roomId: roomId,
         chat: messageChat,
         userImg: userImage,
          });

      socket.emit("message", messageChat, nickName, userImage, roomId);
    });
    socket.on("message", (message) => {
        socket.to(roomID).emit("message", nickname, message);
      });

  });

module.exports = { server };
