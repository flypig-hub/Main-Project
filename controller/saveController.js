const { posts, save, sequelize, Sequelize } = require("../models");


//게시물 저장하기
async function onsave(req, res) {
    const {userId} = res.locals;
    const {postId} = req.params;

    const postsave = await save.findAll({
        where : {userId : userId, postId: postId},
    });

    if (postsave[0] !== undefined) {
        res.status(400).send({errorMessage : '저장한 게시물 입니다.'});
        return
    }
     const savePost = await save.create({
        userId:userId, postId:postId
     });

     res.status(200).send({result : true, message : '저장완료', savePost});  
}

//게시물 저장 취소하기

async function saveDenied(req, res) {
    const {userId} = res.locals;
    const {postId} = req.params;

    const savedenied = await save.destroy({
        where : {
            userId,
            postId
        },
    });
    res.status(200).send({result:true, message : '저장취소', savedenied})
}

module.exports = {saveDenied, onsave}