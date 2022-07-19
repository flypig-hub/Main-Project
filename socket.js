const app = require("./app");
const fs = require("fs");
const { chats, rooms, users, sequelize, Sequelize } = require("./models");
const { Op } = sequelize;
// const options = {
//   letsencrypt로 받은 인증서 경로를 입력
// };
const socket = require("socket.io-client")("https://mendorong-jeju.com");

// socket.on("connect_error", (err) => {
//   console.log(`connect_error due to ${err.message}`);
// });

const server = require("http").createServer(app);
// app.get("/*", (req, res) => res.redirect("/ "));
// https 실제 배포 시 연결
// const https = require("https").createServer(options, app);


// module.exports = (server, app) => {
  // https 설정 시
  // const io = require("socket.io")(https, {
  const io = require("socket.io")(server, {
    cors: {
      origin: ["http://localhost:3000", "*", "https://mendorong-jeju.co.kr"],
      credentials: true,
    },
    // methods: ["GET", "POST"],
    // allowEIO3: true,
    // path: "/my-custom-path/",
  });
  console.log(io);
app.set("io", io);
  io.on("connection", (socket) => {
    //   let roomID;
    //   let peerID;
    //   let userID;
    // socket["nickName"] = "";
    //   let streamID;
    //   let statusMsg;

    socket.on(
      "join-room",
      async (
        roomId
        // roomName,
        // nickName
        //,userImg
        //,hashTag //룸 생성 시 max, titile
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
    socket.on("chat_message", (messageChat, nickName, userImage, roomId) => {
      console.log(messageChat, nickName, userImage, roomId);
      chatUser = await users.findOne({ where: { userNickname:nickName}})
       const newchat = await chats.create({
         userNickname: nickName,
         userId: chatUser.userId,
         chat: messageChat,
         userImg: chatUser.userImage,
          });

      socket.emit("message", messageChat, nickName, userImage, roomId);
    });
    socket.on("message", (message) => {
        socket.to(roomID).emit("message", nickname, message);
      });

  });

module.exports = { server };
// }
