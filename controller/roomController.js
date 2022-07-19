const { rooms, chats, sequelize, Sequelize } = require("../models");

async function callchats(req, res) {
    try {
        const { postId } = req.params;
        const chats = await findAll({
            where: { postId: postId },
            order: [ "chatId" , "DESC"]
        })
        res.status(200).send({ chats, msg: "채팅을 불러왔습니다" })
    } catch {
        res.status(400)({msg:"채팅을 불러오지 못했습니다."})
    }
}

async function allRoomList(req, res) {
  try {
    const allRoom = await rooms.findAll({
      order: [["commentid", "DESC"]],
    });
    return res.status(200).send({ allRoom ,msg: "룸을 조회했습니다" });
  } catch (err) {
    return res
      .status(400)
      .send({ msg: "룸 조회가 되지 않았습니다." });
  }
}

// async function keywordList(req, res) {
//   const { roomId } = req.params;
//     try {
      
        
//     const keywordRoom = await Room.findAll({
//       where: { purpose: roomPurpose },
//       attributes: { exclude: ["roomPassword"] },
//       order: [["createdAt", "DESC"]],
//       include: [
//         {
//           model: PersonInRoom,
//           as: "peopleInRoom",
//           attributes: ["userId", "createdAt", "nick"],
//           raw: true,
//         },
//       ],
//     });
//     const startedRoom = await Room.findOne({
//       attributes: [
//         [Sequelize.fn("COUNT", Sequelize.col("isStarted")), "count"],
//       ],
//       where: { purpose: roomPurpose },
//     });
//     res.status(200).send({ list: keywordRoom, startedCnt: startedRoom });
//   } catch (err) {
//     return res
//       .status(400)
//       .send({ msg: "해당 키워드의 스터디룸 리스트 조회에 실패했습니다." });
//   }
// }

async function createRoom(req, res) {
  try {
    const {
      title,
      max,
      hashTag,
    } = req.body;
      const { userId, nickname, userImage } = res.locals
      const existRoom = await rooms.findOne({
      where: { title:title },
    });
    if (existRoom) {
      return res.status(400).send({ msg: "방이름이 중복됩니다" });
    }

    
      const newRoom = await rooms.create({
        title: title,
        hostNickname: Object[userId] = nickname,
        hostImg: Object[userId] =userImage,
        createdAt: Date(),
          updatedAt: Date(),
        roomUserNickname:[],
      roomUserNum:1,
      roomUserImg:[],
      });

    return res.status(200).send({ msg: "완료", newRoom });
  } catch (err) {
    res.status(400).send({ msg: "룸 생성에 실패하였습니다." });
  }
}

// async function checkRoomPw(req, res) {
//   const { roomId } = req.params;
//   const { roomPassword } = req.body;
//   const { userId } = res.locals.user;

//   try {
//     let room = await Room.findOne({
//       where: { roomId },
//       raw: true,
//     });
//     if (roomPassword != room.roomPassword) {
//       return res.status(400).send({
//         msg: "비공개방 패스워드가 불일치합니다",
//       });
//     }
//     return res.status(200).send({ msg: "비밀번호 일치", roomId, userId });
//   } catch (err) {
//     return res.status(400).send({
//       msg: "비공개방 입장에 실패하였습니다.",
//     });
//   }
// }

async function enterRoom(req, res) {
  const { roomId } = req.params;
  const { userId, nickname, userImage } = res.locals;
    const room = await rooms.findOne({ where: { roomId: roomId } });
    try {
        room.roomUserNickname.push(Object[userId] = nickname);
    roomUserNum = room.roomUserNickname.langth+1
    room.roomUserImg.push(Object[userId] = userImage)
    await room.update(
        {roomUserNickname:roomUserNickname},
        {roomUserNum:roomUserNum},
        { roomUserImg:roomUserImg }
        
    )
    return res.status(201).send({ msg: "입장 완료" });
  } catch (err) {
    res.status(400).send({
      msg: "공개방 입장에 실패하였습니다.",
    });
  }
}

async function exitRoom(req, res) {
 
    const { roomId } = req.params;
    const { userId} = res.locals.user;
    
    const room = await rooms.findOne({ where: { roomId: roomId } });
    console.log(room.roomUserNickname, room.roomUserNickname.userId,userId)
    // const roomUserNickname = room.roomUserNickname.filter(
    //   (roomUser) => roomUser.userId !== userId
    // );

    if (userId === room.userId) {
        await chats.destroy({ roomId: roomId });
        await rooms.destroy({ roomId: roomId })
    }
    else {
        let roomUserNum = room.roomUserNickname.langth + 1;
        console.log(room.roomUserImg, room.roomUserImg.userId, userImage)
        const roomUserImg = room.roomUserImg.filter(room.roomUserImguserImage);
        await room.update(
            { roomUserNickname: roomUserNickname },
            { roomUserImg: roomUserImg },
            { roomUserNum: roomUserNum }
        );
    }
}

// async function kickUser(req, res) {
//     const { userId,roomId } = req.params;
    
//     const room = await rooms.findOne({ where: { roomId: roomId } });
    
//     if (userId !== room.hostNickname.userId) {
//         res.status(400).send({
//             msg: "강퇴기능은 룸 호스트만 사용 가능합니다."
//         })
    
    
        
//     }


// }

module.exports = {
    callchats,
//   keywordList,
  allRoomList,
  createRoom,
  enterRoom,
  exitRoom,
//   checkRoomPw,
//   kickUser
};
