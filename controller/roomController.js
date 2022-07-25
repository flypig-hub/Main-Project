const { Rooms, Chats, sequelize, Sequelize } = require("../models");
const Op = Sequelize.Op;
async function callchats(req, res) {
  try {
    const { postId } = req.params;

    const Chats = await Chats.findAll({
      where: { postId: postId },
      order: [["createdAt", "DESC"]],
    });
    res.status(200).send({ Chats, msg: "채팅을 불러왔습니다" });
  } catch {
    res.status(400)({ msg: "채팅을 불러오지 못했습니다." });
  }
}

async function allRoomList(req, res) {
  try {
    const allRoom = await Rooms.findAll({ order: [["createdAt", "DESC"]] });

    return res.status(200).send({ allRoom, msg: "룸을 조회했습니다" });
  } catch (err) {
    return res.status(400).send({ msg: "룸 조회가 되지 않았습니다." });
  }
}

async function Roomdetail(req, res) {
  const { roomId } = req.params;
  const { userId, nickname, userImageURL } = res.locals;
 
  let Room = await Rooms.findOne({ where: { roomId: roomId } });
  let loadChat = []

  if (Room.roomUserId.includes(userId)||Room.hostId==userId) {
     loadChat = await Chats.findAll({ where: { roomId: roomId } });
  }
  let chatingRooms = await Rooms.findAll({
    where: {
      [Op.or]: [
        { hostId: userId },
        { roomUserId: { [Op.substring]: userId } },
      ],
    },
  });
  
  if (Room.hostId != userId) {
 Room.roomUserId.push(Number(userId));
 Room.roomUserNickname.push(nickname);
 Room.roomUserImg.push(userImageURL);
 let roomUserNum = Room.roomUserId.length + 1;
 Room = await Room.update({
   roomUserId: Room.roomUserId,
   roomUserNickname: Room.roomUserNickname,
   roomUserImg: Room.roomUserImg,
   roomUserNum: roomUserNum,
 });
 chatingRooms.unshift(Room); 
}
  res
    .status(200)
    .send({ msg: "룸 상세조회에 성공했습니다.", chatingRooms, Room, loadChat });
}

async function createRoom(req, res) {
  try {
    const { title, max, hashTag } = req.body;
    const { userId, nickname, userImageURL } = res.locals;
    const existRoom = await Rooms.findOne({
      where: { title: title },
    });

    if (existRoom) {
      return res.status(400).send({ msg: "방이름이 중복됩니다" });
    }

    const newRoom = await Rooms.create({
      max: max,

      hashTag: hashTag,
      title: title,
      hostNickname: nickname,
      hostId: userId,
      hostImg: userImageURL,
      createdAt: Date(),
      updatedAt: Date(),
      roomUserId: [],
      roomUserNickname: [],
      roomUserNum: 1,
      roomUserImg: [],
    });

    return res.status(200).send({ msg: "완료", newRoom });
  } catch (err) {
    res.status(400).send({ msg: "룸 생성에 실패하였습니다." });
  }
}

async function enterRoom(req, res) {
  const { roomId } = req.params;
  // const { userId, nickname, userImageURL } = res.locals;
  const { userId, nickname, userImageURL } = req.body;
  console.log("룸=",roomId, userId, nickname, userImageURL);
  let room = await Rooms.findOne({ where: { roomId: roomId } });
 
  try {
    if (room.hostId == userId) {
      res.status(200).send({ msg: "호스트가 입장하였습니다" });
      return
  }
    if (Number(room.max) < room.roomUserId.length) {
      res.status(400).send({
        msg: "입장 가능 인원을 초과하였습니다.",
      });
      return;
    }
    if (room.roomUserId.includes(userId)) { 
    res.status(200).send({ msg: "채팅방에 등록된 유저입니다" });
    return
  }
      
    
   res.status(201).send({ msg: "입장 완료" });
    
  
  } catch (err) {
    res.status(400).send({
      msg: "공개방 입장에 실패하였습니다.",
    });
  }
}

async function exitRoom(req, res) {
  const { roomId } = req.params;
  const { userId,nickname,userImgURL } = res.locals.user;

  const room = await Rooms.findOne({ where: { roomId: roomId } });
  console.log(room.roomUserNickname, room.roomUserNickname.userId, userId);
  // const roomUserNickname = room.roomUserNickname.filter(
  //   (roomUser) => roomUser.userId !== userId
  // );

  if (userId === room.hostId) {
    await Chats.destroy({ roomId: roomId });
    await Rooms.destroy({ roomId: roomId });
  } else {
    const roomUsersId = room.roomuserId.filter(
      (roomUsersId) => roomUsersId != userId
    );
    const roomUsersNickname = room.roomUserNickname.filter(
      (roomUsersNickname) => roomUsersNickname != nickname
    );
    const roomUsersImg = room.roomUserImg.filter(
      (roomUsersImg) => roomUsersImg != userImgURL
    );
    const roomUserNum = roomUsersId.length + 1;
    await room.update(
      { roomuserId: roomUsersId },
      { roomUserNickname: roomUsersNickname },
      { roomUserImg: roomUsersImg },
      { roomUserNum: roomUserNum }
    );
  }
}


module.exports = {
  callchats,
  allRoomList,
  createRoom,
  enterRoom,
  exitRoom,
  Roomdetail,
};

