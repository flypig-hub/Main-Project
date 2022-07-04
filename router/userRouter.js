const express = require("express");
const passport = require("passport")
const authMiddleware = require("../middlewares/auth-middleware");
const router = express.Router();
const {
    kakaoCallback,
    naverCallback,
    googleCallback,
    checkMe,
    mypage
} = require("../controller/userController")


//카카오 로그인
router.get('/kakao', passport.authenticate('kakao'));

router.get('/kakao/callback', passport.authenticate('kakao'), kakaoCallback);


//구글 로그인
router.get('/google', passport.authenticate('google', {scope: ['profile'],}))

router.get('/google/callback', passport.authenticate("google"), googleCallback)


//네이버 로그인
router.get('/naver', passport.authenticate('naver', { authType: 'reprompt' }))

router.get('/naver/callback', passport.authenticate("naver"), naverCallback)


// 내 정보 조회 API, 로그인 시 사용
router.get('/me', authMiddleware, checkMe);


//마이페이지

router.get('/mypage', authMiddleware, mypage)

module.exports = router;