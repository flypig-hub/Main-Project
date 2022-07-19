const app = require("./app");
const fs = require("fs");
const { posts, Like, sequelize, Sequelize } = require("./models");
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


module.exports = (server, app) => {
  // https 설정 시
  // const io = require("socket.io")(https, {
  const io = require("socket.io")(server, {
    cors: {
      origin: ["http://localhost:3000", "*", "https://mendorong-jeju.co.kr"],
      credentials: true,
      methods: ["GET", "POST"],
    },
    allowEIO3: true,
    // path: "/my-custom-path/",
  });
  console.log(io);
app.set("io", io);
  io.on("connection", (socket) => {
  //   let roomID;
  //   let peerID;
  //   let userID;
    socket["nickName"] = "";
  //   let streamID;
  //   let statusMsg;

    socket.on("join-room", (roomName, nickName) => {
      //socket.on = emit한 event"enter_room"를 프론트에서 받음.
      //roomName, done = enter_room의 첫번쨰 인자(input_value), 마지막인자(함수-showroom)
      socket.join(roomName);
      //roomName이름을 가진 방을 만들거나 들어감.
      socket.nickName = nickName

      socket.to(roomName).emit("welcome", socket.nickname, roomName);
      // io.sockets.emit("room_change");
    });
      
  // socket.emit("welcome", users, users.length);

  //         const room = await Room.findByPk(roomID);
  //         const currentRound = room.currentRound;
  //         const totalRound = room.round;
  //         const openAt = room.openAt;
  //         const now = Date.now();

  //         socket.emit("restTime", currentRound, totalRound, openAt, now);
  //       } catch (error) {
  //         console.log(error);
  //       }
  //     }
  //   );

  //   socket.on("peer", (nick) => {
  //     socket.emit("peer", nick);
  //   });

  //   socket.on("endRest", async (currentRound) => {
  //     const room = await Room.findByPk(roomID);
  //     const openAt = Date.now() + room.studyTime * 60 * 1000;
  //     await Room.update(
  //       {
  //         currentRound,
  //         openAt,
  //         isStarted: 1,
  //       },
  //       { where: { roomID } }
  //     );
  //     const now = Date.now();
  //     socket.emit("studyTime", currentRound, room.round, openAt, now);
  //   });

  //   socket.on("endStudy", async () => {
  //     const room = await Room.findByPk(roomID);
  //     const openAt = Date.now() + room.recessTime * 60 * 1000;
  //     const currentRound = room.currentRound;
  //     const totalRound = room.round;

  //     await Room.update(
  //       {
  //         openAt,
  //         isStarted: 0,
  //       },
  //       { where: { roomID } }
  //     );

  //     await StudyTime.create({
  //       userId: userID,
  //       studyTime: room.studyTime,
  //     });
  //     const now = Date.now();
  //     socket.emit("restTime", currentRound, totalRound, openAt, now);
  //   });

  //   socket.on("totalEnd", async () => {
  //     const room = await Room.findByPk(roomID);
  //     await StudyTime.create({
  //       userId: userID,
  //       studyTime: room.studyTime,
  //     });
  //     const now = Date.now();
  //     const endTime = now + 60000;
  //     socket.emit("totalEnd", endTime, now);
  //   });

  //   socket.on("disconnecting", async () => {
  //     await PersonInRoom.destroy({
  //       where: {
  //         userId: userID,
  //         roomId: roomID,
  //       },
  //     });

  //     socket.to(roomID).emit("user-disconnected", peerID, nickname, streamID);

  //     const PIR_list = await PersonInRoom.findAll({
  //       where: {
  //         roomId: roomID,
  //       },
  //     });

  //     if (PIR_list.length === 0) {
  //       await Room.destroy({ where: { roomId: roomID } });
  //     }
  //   });

  //   socket.on("message", (message) => {
  //     socket.to(roomID).emit("message", nickname, message);
  //   });

  //   socket.on("join-chatRoom", (roomId, userId, userNickname) => {
  //     socket.join(roomId);
  //   });
  });

  // https 연결 시
  // module.exports = { server, https };

  // module.exports = { server };
}
