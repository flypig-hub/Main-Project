const express = require("express");
const passport = require("passport");
const authMiddleware = require("../middlewares/auth-middleware");
const { users, sequelize, Sequelize } = require("../models");
const router = express.Router();
const {
    kakaoCallback,
    naverCallback,
    googleCallback,
    checkMe,
    Mypage,
    MypagePutname,
    MypagePutImage
} = require("../controller/userController")


//카카오 로그인
router.get('/kakao', passport.authenticate('kakao'));

router.get('/kakao/callback', kakaoCallback);


//구글 로그인
router.get('/google', passport.authenticate('google', {scope: ['profile'],}))

router.get('/google/callback', googleCallback)


//네이버 로그인
router.get('/naver', passport.authenticate('naver', { authType: 'reprompt' }))

router.get('/naver/callback',  naverCallback)


// 내 정보 조회 API, 로그인 시 사용
router.get('/me', authMiddleware, checkMe);


//마이페이지 정보

router.get('/mypage', authMiddleware, Mypage)

//닉네임 수정
router.put('/mypage/:userId/nick', authMiddleware, MypagePutname)

// //프로필 이미지 수정
// router.put('/mypage/:userId/img', authMiddleware, MypagePutImage)

module.exports = router;