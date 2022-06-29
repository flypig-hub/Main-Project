const { Post, Comment, User, sequelize, Sequelize } = require("../models");


// 게시글 작성(S3 기능 추가 예정)
async function WritePosting (req, res) {

    try{
        const { title, postContent, tripLocation } = req.body;
        const { nickname } = req.locals;

        const unixTime = getUnixTimeStamp();

        const post = await Post.create({
        nickname, title, postContent, tripLocation, unixTime,
        imageURL: req.files.map(file=>file.location), 
        imageKey: req.files.map(file=>file.key)        
        })
        
        res.status(201).send(post);
    }
    catch(e)
    {
        res.status(402).send({ errorMessage : "게시글이 등록되지 않았습니다."});
    }
};


// 게시글 전체 조회
async function GetPostingList (req, res) {
    const allPost = await Post.findAll({
        order: [[ "postId", "DESC" ]],
    })

    res.send.json({ allPost });
}


// 게시글 상세 조회(S3 기능 추가 예정)
async function GetPost (req, res) {
    const { nickname } = res.locals;
    const { postId } = req.params;

    const post = await Post.findOne({ where: { nickname }, 
        order : [[ "postId", "DESC" ]]
    });

    const comments = await Comment.findByPk({ where: { nickname, postId },
        order : [[ "commentId", "DESC" ]] 
    });
    
    const commentWriterIds = comments.map(
        (commentWriterId) => commentWriterId.nickname
    );

    // const postImage = req.files.map(file=>file.location);

    const commentWriterInfoById = await User.find({
        _id: { $in: commentWriterIds },
    })
        .exec()
        .then((commentWriterId) => 
            commentWriterId.reduce(
                (prev,ca) => ({
                    ...prev,
                    [ca.nickname]: ca,
                }),
                {}
            ));

    const postsInfo = {
        postId: post._id,
        title: post.title,
        content: post.content,
        nickname: post.nickname,
        postContent: post.postContent,
        postImage: post.postImage,
        tripLocation: postWriter.tripLocation,
    }

    const commentInfo = comments.map((comment) => ({
        commentId : comment.commentId,
        comment: comment.comment,
        commentWriter: commentWriterInfoById[comment.nickname],
    }));

    res.send({
        posts : postsInfo,
        commentInfo: commentInfo
    });
};


// 게시글 수정 (S3 기능 추가 예정)
async function ModifyPosting (req, res) {
    const { nickname } = res.locals;
    const { postId } = req.params;
    const { title, postImage, postContent, tripLocation } = req.body;

    try {
        const existPost = await Post.findOne({
            where: { nickname, postId },
        });
    
        if (nickname !== existPost.nickname) {
                await res.status(400).send({ errorMessage: "접근 권한이 없습니다!"});
            };
    
        const ModifyPost = await existPost.update({
            title, 
            postImage, 
            postContent, 
            tripLocation,
            order: [["updatedAt", "DESC"]]
        })
        .save();
    
        res.send({ ModifyPost, msg: "게시글이 수정되었습니다!"});
    } catch (e) {
        res.status(400).send({ errorMessage: "게시글을 수정을 할 수 없습니다." });
    }
};


// 게시글 삭제 (S3 이미지 삭제 기능 추가 예정)
async function DeletePost (req, res) {
    try {
        const { userId } = res.locals;
        const { postId } = req.params;
        const existPost = await Post.findById(postId);

        if (userId === existPost.userId) {
            await Comment.destroy({ 
                where: { postId } 
            });
            await Post.destroy({
                where: { postId }
            });
        };

        res.send({ msg: "게시글이 삭제되었습니다!" });
    } catch (e) {
        res.status(400).send({ errorMessage: "접근 권한이 없습니다!"});
    }
};

exports = module.exports = {
    WritePosting,
    GetPostingList,
    GetPost,
    ModifyPosting,
    DeletePost
}