const { posts, Comment, User, images, sequelize, Sequelize } = require("../models");
const multiparty = require("multiparty");



// 게시글 작성(S3 기능 추가 예정)
async function WritePosting (req, res) {
    // try{
        // const { userId, snsId, nickname } = res.locals;
        const { title, postContent, tripLocation, thumbnailString, postImageString } = req.body;
        const image = req.files;
        console.log(image);

        const postImageKEY = image.map(postImageKEY => postImageKEY.key);
        const postImageURL = image.map(postImageURL => postImageURL.location);

        const thumbnailKEY = postImageKEY[0];
        const thumbnailURL = postImageURL[0];

        const postInfo = await posts.create({ 
            title, postContent, tripLocation, thumbnailString, postImageString,
            thumbnailURL: thumbnailURL.toString(),
            thumbnailKEY: thumbnailKEY.toString(),
            postImageURL: postImageURL.toString(),
            postImageKEY: postImageKEY.toString(),
        });

        res.status(201).send({ postInfo });
    // }
    // catch(e)
    // {
        // res.status(402).json({ errorMessage : "게시글이 등록되지 않았습니다."});
    // }
};



// 게시글 전체 조회
async function GetPostingList (req, res) {
    const allPost = await posts.findAll({
        order: [[ "postId", "DESC" ]],
    })

    res.send.send({ allPost });
}


// 게시글 상세 조회(S3 기능 추가 예정)
async function GetPost (req, res) {
    const { nickname } = res.locals;
    const { postId } = req.params;
    const { image } = req.files;

    const post = await posts.findOne({ where: { nickname }, 
        order : [[ "postId", "DESC" ]]
    });

    const comments = await Comment.findByPk({ where: { nickname, postId },
        order : [[ "commentId", "DESC" ]] 
    });

    const postImage = await Images.findByPk({ where : { postImageKEY, postImageURL },
        order : [[ "postId", "DESC" ]]
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
        postImage: postImage.postImage,
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
    try {
        const { nickname } = res.locals;
        const { postId } = req.params;
        const { title, postImage, postContent, tripLocation } = req.body;
        const { image } = req.files;

        const imageURLs = existPost.imageURLs.map(imageURL => imageURL.split('com/')[1]);
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
            imageURL,
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

        // 이미지 삭제
        const imageURL = existPost.imageURL.map(imageURL => imageURL.split('com/')[1]);
        console.log(imageURL);

        if (userId !== existPost.userId) {
            res.status(400).send({ errorMessage: "접근 권한이 없습니다!" });
        }

        if (existPost) {
            const s3 = new AWS.S3();
            const params = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Delete: { Objects: imageURLs.map(imageKey => ({ Key: imageKey })) }
            }
            console.log(params.Delete);

            s3.deleteObjects(params, function(err, data) {
                if (err) console.log(err, err.stack);
                else { console.log("삭제되었습니다.") }
            })
        };

        // 댓글, 게시글 삭제
        if (userId === existPost.userId) {
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