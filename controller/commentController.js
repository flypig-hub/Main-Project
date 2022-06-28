const { Comment, sequelize, Sequelize } = require("../models");

//댓글 불러오기 API
async function readComment(req, res) {
  try {
    const { postId } = req.params;
    
    const comments = await Comment.findAll({
      where: {
        postId,
      },
      order: [
        ["commentid", "DESC"],
        
      ],
    });
        res.status(200).send({ comments, msg : "댓글을 읽었습니다."});
      
  } catch (error) {
    res.status(400).send({ errorMessage: "댓글 조회에 실패하였습니다." });
  }
}

// 댓글 작성 API
async function writeComment(req, res) {
  const { postId } = req.params;
  const { nickname ,userId} = res.locals;
  const { comment } = req.body;
  
  if (!userId) {
    res.status(400).send({
      errorMessage: "로그인이 필요한 서비스 입니다.-댓글작성",
    });
    return;
  }
try {
  if (!comment) {
    res.status(412).send({
      errorMessage: "댓글을 입력해 주세요.",
    });
    return;
  }
  const comment_c = await Comment.create({
    postId,
    userId,
    comment,
    nickname,
  });

  res.status(201).json({ comment_c, msg: "댓글이 등록 되었습니다." });
} catch (err) {
  console.log(err);
  res
    .status(400)
    .json({ result: false, errorMessage: "댓글 작성을 할 수 없습니다." });
}
}

// 댓글 수정 API
async function updateComment(req, res) {

  const { userId } = res.locals;
  const { commentId } = req.params;
  const { comment } = req.body;

  try {
    const existsComment = await Comment.findOne({
      where: { commentId },
    });
    
    if (!userId) {
      res.status(400).send({
        errorMessage: "로그인이 필요한 서비스 입니다.-댓글수정-",
      });
      return;
    } else if (existsComment.userId !== userId) {
      res.status(400).send({
        errorMessage: "댓글 작성자만 댓글을 수정할 수 있습니다.",
      });
      return;
    }
    
    existsComment.comment = comment;
    existsComment.updateAt = { updateAt: Date() };
     const updateComment = await existsComment.save();
  

      res.status(200).json({ updateComment, message: "댓글 수정 완료" });
    }
    catch (err) {
      res.status(400).json({ errorMessage: "댓글 수정을 할 수 없습니다." });
    }
  }


// 댓글 삭제 API
async function deleteComment(req, res) {
  const { userId } = res.locals;
  const { commentId } = req.params;

  try {
    const existsComment = await Comment.findOne({
      where: {
        commentId,
      },
    });
     if (!userId) {
    res.status(400).send({
      errorMessage: "로그인이 필요한 서비스 입니다.-댓글삭제-",
    });
    return;
  }else if (userId !== existsComment.userId) {
    res.status(400).send({
      errorMessage: "이 글의 작성자만 글을 삭제할 수 있습니다.",
    });
    return;
  }
    
      const deleteComment = await Comment.destroy(
        { where: { commentId } });
      if (!deleteComment) {
        res.status(400).send(
          { errorMessage: "댓글 삭제가 정상적으로 처리되지 않았습니다." }
        );
        return;
    }
      res.status(200).json({ message: "댓글 삭제 완료" });
  } catch (err) {
    res.status(400).json({ errorMessage: "댓글 삭제를 할 수 없습니다." });
  }
}

module.exports.readComment = readComment;
module.exports.writeComment = writeComment;
module.exports.updateComment = updateComment;
module.exports.deleteComment = deleteComment;
