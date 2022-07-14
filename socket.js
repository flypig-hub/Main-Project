import http from "http";
// const http = require("http");
// const express = require("express");
const axios = require("axios");
// const express = require("express");
// const app = express();
// const instrument = require("@socket.io/admin-ui");
const Chat = require("./models/chat");
const Room = require("./models/room");

// const httpServer = http.createServer(app);
module.exports = (httpServer, app) => {
 
  const httpServer = http.createServer(app);
  const { Server } = require("socket.io");
  // const wsServer = new Server(httpServer, {
  //   cors: {
  //     origin: ["https://admin.socket.io", "*"],
  //     credentials: true,
  //   },
  // });
    const wsServer = new Server(
      httpServer,
      { path: "/socket.io" },
      {
        cors: {
          origin: ["*"],
          credentials: true,
        },
      }
    );
  // 라우터에서 io객체를 쓸 수 있게 저장하는 코드.
  // req.app.get('io')로 접근 가능
  app.set("wsServer", wsServer);

  // Socekt.io에 네임스페이스를 부여하는 메서드 of
  // Socket.io는 기본적으로 / 네임스페이스에 접속하지만 of 메소드를 사용하면 다른 네임스페이스를 만들어 접속 가능
  // 같은 네임스페이스 끼리만 데이터를 전달

  const chat = wsServer.of("/chat");

  function publicRooms() {
    const {
      sockets: {
        adapter: { sids, rooms },
      },
    } = wsServer;
    //const sids = wsServer.sockets.adapter.sids;
    //const rooms = //.rooms
    const publicRooms = [];
    rooms.forEach((_, key) => {
      if (sids.get(key) === undefined) {
        publicRooms.push(key);
      }
    });
    return publicRooms;
  }

  function countRoom(roomName) {
    return wsServer.sockets.adapter.rooms.get(roomName)?.size;
  }
  function countUser(roomName) {
    return wsServer.sockets.adapter.rooms.roomName.get(roomName)?.size;
  }

  wsServer.use((socket, next) => {
    sessionMiddleware(socket.request, socket.request.res, next);
  });

  // chat 네임스페이스에 이벤트 리스너를 붙여주는 것. 네임 스페이스마다 각각 이벤트 리스너를 붙여줄 수 있습니다.
  chat.on("connection", (socket) => {
    const req = socket.request;
    const {
      headers: { referer },
    } = req;
    socket.onAny((event) => {
      console.log(`Socket Event:${event}`);
    });
    //이벤트 확인용
    // socket.request.headers.referer를 통해 현재 웹 페이지의 URL을 가져옴
    const roomId = referer.split("/")[4].replace(/\?.+/, "");
    console.log(`chat 네임스페이스 ${roomId}에 접속`);

    socket.on("enter_room", async (roomName) => {
      socket.join(roomName);
      //roomName이름을 가진 방을 만들거나 들어감.

      socket.to(roomName).emit("welcome", socket.nickname, countUser(roomName));
      //   wsServer.sockets.emit("room_change", publicRooms());
      const Room = await Room.findOne({ where: { title: roomName } });
      if (!Room) {
        const newRoom = new Room({
          where: {
            title: roomName,
            roomId: roomId,
            //  hostNickname: res.local.user,
            hostImg: res.local.user,
            max: max,
            createAt: Date.now,
            hashTag: hashtag,
            roomUserNum: countUser,
            //roomUserId: wsServer.sockets.adapter.rooms.roomName.get(sids),
            //roomUserNickName:
          },
        });
        //   creawsServer.sockets.adapter.rooms.get(roomName) ? sids
      }
    });

    socket.on("chat_message", (message, room) => {
      const chat = new Chat({
        room: room,
        // user: req.body.user._id,
        chat: message,
      });
    });

    // enter_room에서 받는 인자를
    // title: req.body.title,
    // max: req.body.max,
    // owner: req.body.owner,
    // password: req.body.password
    //   와 같이 설정
    // 소켓 > 네입스페이스 > 룸(방)으로 접속하기 위해 socket.join 과 socket.leave 메소드를 사용한다.

    // socket.to(roomId).emit('join', {
    // 	user: 'system',
    // 	chat: `${req.session}님이 입장하셨습니다.`
    // });
    socket.on("disconnecting", () => {
      socket.rooms.forEach((room) =>
        socket.to(room).emit("bye", socket.nickname, countUser(roomId) - 1)
      );
    });
    socket.on("disconnect", async (data) => {
      console.log(`chat 네임스페이스 ${roomId} 접속 해제`);
      const currentRoom = socket.adapter.rooms[roomId];
      const userCount = currentRoom ? currentRoom.length : 0;
      socket.leave(roomId);
      //새로고침하는 유저를 위해 잠깐 시간 제한을 걸어준다.
      // const leftOne = await Room.findOne({where: {roomId:roomId, roomUserId:req.local.user.roomUserId}})
      setTimeout(async () => {
        if (userCount === 0) {
          try {
            await axios.delete(`http://localhost:8000/api/room/${roomId}`);
          } catch (e) {
            console.error(e);
          }
        } else {
          socket.to(roomId).emit("exit", {
            user: "system",
            // chat: `${req.local.user.roomUserId}님이 퇴장하셨습니다.`,
          });
        }
      }, 900);
      // 접속 해제 시 현재 방의 사람 수를 구해서 참여자 수가 0이면 방을 제거하는 HTTP 요청을 보내야 한다.
      // socket.adapter.rooms[방 아이디]에 참여 중인 소켓 정보가 있습니다.
      // Room은 위의 room 네임스페이스가 아니라 socket.io의 룸이라는 개념이다.
    });
  });
};
