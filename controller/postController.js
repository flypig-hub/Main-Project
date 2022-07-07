const { posts, Comment, images, sequelize, Sequelize } = require("../models");

// 게시글 작성(S3 기능 추가 예정)
async function WritePosting (req, res) {
    try{
        const { userId, snsId, nickname } = res.locals;
        const { title, postContent, tripLocation } = req.body;
        const image  = req.files;

        const thumbnailKEY = image.map(thumbnail => thumbnail.key);
        const thumbnailURL = image.map(thumbnail => thumbnail.location);
        const postInfo = await posts.create({ 
            title, postContent, tripLocation, 
            thumbnailURL: thumbnailURL.toString(), 
            thumbnailKEY: thumbnailKEY.toString(),
        });
        // console.log(postInfo);

        res.status(201).send({ postInfo });
    } catch(e) {
        res.status(402).json({ errorMessage : "게시글이 등록되지 않았습니다."});
    }
};


// 게시글 전체 조회
async function GetPostingList (req, res) {
    const allPost = await posts.findAll({ 
        order: [["createdAt", "DESC" ]],
    })

    res.send({ allPost });
}


// 게시글 상세 조회(S3 기능 추가 예정)
async function GetPost (req, res) {
    // const { nickname } = res.locals;
    const { postId } = req.params;

    const post = await posts.findOne({ where: { postId }, });
    const comments = await Comment.findOne({ where: { postId }, });
    const postImage = await images.findOne({ where: { postId }, });
    
    const postInfo = {
        postId: post.postId,
        userId: post.userId,
        title: post.title,
        postContent: post.postContent,
        tripLocation: post.tripLocation,
        thumbnailKEY: post.thumbnailKEY,
        thumbnailURL: post.thumbnailURL,
        commentNum: post.commentNum,
        likeNum: post.likeNum,
    }

    // const commentInfo = {
    //     commentId: comments.commentId,
    //     comment: comments.comment,
    // }

    // const imageInfo = {
    //     postImageKEY: postImage.postImageKEY,
    //     postImageURL: postImage.postImageURL
    // }

    res.send({
        postInfo, 
        // commentInfo, imageInfo
    });
};


// 게시글 수정 (S3 기능 추가 예정)
async function ModifyPosting (req, res) {
    try {
        // const { userId } = res.locals;
        const { postId } = req.params;
        const { title, postContent, tripLocation } = req.body;
        console.log(postId, req.body);
        const { image } = req.files;

        const existPost = await posts.findOne({ where: { postId }, });
        const existImage = await images.findOne({ where: { postId }, });
        console.log(existPost, existImage);
    
        if (userId !== existPost.userId) {
                await res.status(400).send({ errorMessage: "접근 권한이 없습니다!"});
            };

        const imageURLs = existImage.image.map(imageURL => imageURL.split('com/')[1]);
        const s3 = new AWS.S3();
        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Delete: { Objects: imageURLs.map(imageKey => ({ Key: imageKey })) }
        };

        s3.deleteObjects(params, function(err, data) {
            if (err) console.log(err, err.stack);
            else { console.log("삭제되었습니다.") }
        })

        const imageURL = image.map(imageURL => imageURL.location);
    
        // const existPost = await posts.findOne({
        //     where: { postId },
        // });
        // console.log(existPost);
    
        // if (nickname !== existPost.nickname) {
        //         await res.status(400).send({ errorMessage: "접근 권한이 없습니다!"});
        //     };
    
        const ModifyPost = await existPost.update({
            title, 
            // postImage, 
            postContent, 
            tripLocation,
            // imageURL,
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
        // const { userId } = res.locals;
        const { postId } = req.params;
        console.log(postId);
        const existPost = await posts.findOne({
            where: { postId },
        });
        console.log(existPost);

        // 이미지 삭제
        // const imageURL = existPost.imageURL.map(imageURL => imageURL.split('com/')[1]);
        // console.log(imageURL);

        // if (userId !== existPost.userId) {
        //     res.status(400).send({ errorMessage: "접근 권한이 없습니다!" });
        // }

        // if (existPost) {
        //     const s3 = new AWS.S3();
        //     const params = {
        //         Bucket: process.env.AWS_BUCKET_NAME,
        //         Delete: { Objects: imageURLs.map(imageKey => ({ Key: imageKey })) }
        //     }
        //     console.log(params.Delete);

        //     s3.deleteObjects(params, function(err, data) {
        //         if (err) console.log(err, err.stack);
        //         else { console.log("삭제되었습니다.") }
        //     })
        // };

        // 댓글, 게시글 삭제
        if (existPost) {
            await Comment.destroy({ 
                where: { postId } 
            });
            await posts.destroy({
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