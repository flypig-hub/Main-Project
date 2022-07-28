const app = require("./app");
const fs = require("fs");
const {
  images,
  Chats,
  Rooms,
  users,
  sequelize,
  Sequelize,
} = require("./models");
const Op = Sequelize.Op;
const authMiddleware = require("./middlewares/auth-middleware");
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
      console.log(socket.id);
    });
    socket.on("join-room", async (roomId, userId) => {
      const enterRoom = await Rooms.findOne({
        where: { roomId: roomId },
      });
      const enterUser = await users.findOne({
        where: { userId: userId },
      });
      const entermsg = await Chats.findOne({
        where: {
          roomId: roomId,
          chat: enterUser.dataValues.nickname + "님이 입장하셨습니다.",
        },
      });
      socket.join(enterRoom.title);
      if (!entermsg) {
        await Chats.create({
          userNickname: "system",
          userId: "system",
          roomId: roomId,
          chat: enterUser.dataValues.nickname + "님이 입장하셨습니다.",
          userImg: null,
        });
      }
      if (
        enterRoom.dataValues.hostId !== Number(userId) &&
        !enterRoom.dataValues.roomUserId.includes(Number(userId))
      ) {
        let userImageURL = await images.findOne({
          attributes: ["userImageURL"],
          where: { userId: userId },
        });
        enterRoom.roomUserId.push(Number(userId));
        enterRoom.roomUserNickname.push(enterUser.dataValues.nickname);
        let roomUserNum = enterRoom.roomUserNickname.length + 1;
        enterRoom.roomUserImg.push(userImageURL.userImageURL);

        await Rooms.update(
          {
            roomUserId: enterRoom.dataValues.roomUserId,
            roomUserImg: enterRoom.dataValues.roomUserImg,
            roomUserNickname: enterRoom.dataValues.roomUserNickname,
            roomUserNum: roomUserNum,
          },
          { where: { roomId: roomId } }
        );
        socket
          .to(enterRoom.title)
          .emit("welcome", enterUser.dataValues.nickname);
      }
    });

    socket.on("chat_message", async (messageChat, userId, roomId) => {
      const chatUser = await users.findOne({ where: { userId: userId } });
      const userImg = await images.findOne({ where: { userId: userId } });
      const room = await Rooms.findOne({ where: { roomId: roomId } });
      const newchat = await Chats.create({
        userNickname: chatUser.dataValues.nickname,
        userId: userId,
        roomId: roomId,
        chat: messageChat,
        userImg: userImg.dataValues.userImageURL,
      });
      
      socket
        .to(room.title)
        .emit(
          "message",
          messageChat,
          chatUser.dataValues.nickname,
          userImg.dataValues.userImageURL,
          roomId
        );
    });

    socket.on("leave-room", async (roomId, userId) => {
      const leaveRoom = await Rooms.findOne({
        where: { roomId: roomId },
      });
      const leaveUser = await users.findOne({ where: { userId: userId } });
      const userImageURL = await images.findOne({ where: { userId: userId } });
      const leavemsg = await Chats.findOne({
        where: {
          roomId: roomId,
          chat: leaveUser.dataValues.nickname + "님이 퇴장하셨습니다.",
        },
      });
     
      if (!leaveRoom) {
        res.status(400).send({
          errorMessage: "존재하지 않는 방입니다.",
        });
        return;
      }

      socket.leave(leaveRoom.title);
      
      if (!leavemsg) {
        await Chats.create({
          userNickname: "system",
          userId: "system",
          roomId: roomId,
          chat: leaveUser.dataValues.nickname + "님이 퇴장하셨습니다.",
          userImg: null,
        });
      };
      
      socket.to(leaveRoom.title).emit("bye", leaveUser.dataValues.nickname);
     
      if (leaveRoom.dataValues.hostId == userId && leaveRoom.dataValues.roomUserId.length === 0){
        await Rooms.destroy({where:{roomId:roomId}})
        
      } else if (leaveRoom.dataValues.hostId === userId) {

        let roomUsersId = leaveRoom.dataValues.roomUserId.filter(
        (roomUsersId) => roomUsersId !== leaveRoom.dataValues.roomUserId[0]
      );
      let roomUsersNickname = leaveRoom.dataValues.roomUserNickname.filter(
        (roomUsersNickname) =>
          roomUsersNickname !== leaveRoom.dataValues.roomUserNickname[0]
      );
      let roomUsersImg = leaveRoom.dataValues.roomUserImg.filter(
        (roomUsersImg) => roomUsersImg !== leaveRoom.dataValues.roomUserImg[0]
      );
        let roomUserNum = roomUsersId.length + 1;
        
        await Rooms.update(
          { hostId:leaveRoom.dataValues.roomUserId[0],
          hostNickname: leaveRoom.dataValues.roomUserNickname[0],
          hostImg:leaveRoom.dataValues.roomUserImg[0],
          roomUserId: roomUsersId,
          roomUserNickname: roomUsersNickname,
          roomUserImg: roomUsersImg,
          roomUserNum: roomUserNum},
          { where: { roomId: roomId } }
        );
       
        
      }else{
      let roomUsersId = leaveRoom.dataValues.roomUserId.filter(
        (roomUsersId) => roomUsersId !== Number(userId)
      );
      let roomUsersNickname = leaveRoom.dataValues.roomUserNickname.filter(
        (roomUsersNickname) =>
          roomUsersNickname !== leaveUser.dataValues.nickname
      );
      let roomUsersImg = leaveRoom.dataValues.roomUserImg.filter(
        (roomUsersImg) => roomUsersImg !== userImageURL.userImageURL
      );
         let roomUserNum = roomUsersId.length + 1;
        await Rooms.update(
        {
          roomUserId: roomUsersId,
          roomUserNickname: roomUsersNickname,
          roomUserImg: roomUsersImg,
          roomUserNum: roomUserNum,
        },
        { where: { roomId: roomId } }
      );
      }
    });
  });
};

