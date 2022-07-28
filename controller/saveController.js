const {
    saves,
    sequelize,
    Sequelize
} = require("../models");


//게시물 저장하기
async function onsave(req, res) {
   try {
      const {
    userId
} = res.locals;
const {
    hostId
} = req.params;

const hostsave = await saves.findAll({
    where: {
        userId: userId,
        hostId: hostId
    },
});

if (hostsave[0] !== undefined) {
    res.status(400).send({
        errorMessage: '저장한 게시물 입니다.'
    });
    return
}
const saveHost = await saves.create({
    userId: userId,
    hostId: hostId
});

res.status(200).send({
    result: true,
    message: '저장완료',
    saveHost
});
    
   } catch (error) {
    res.status(400).send({errorMessage:"저장실패"})
   }
  
}

//게시물 저장 취소하기

async function saveDenied(req, res) {
    try {
        const {
            userId
        } = res.locals;
        const {
            hostId
        } = req.params;
    
        const savedenied = await saves.destroy({
            where: {
                userId,
                hostId
            },
        });
        res.status(200).send({
            result: true,
            message: '저장취소',
            savedenied
        })
    } catch (error) {
        res.status(400).send({errorMessage : "저장 취소 실패"})
    }
   
}

module.exports = {
    saveDenied,
    onsave
}