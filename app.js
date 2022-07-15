const express = require("express");
const mysql = require("mysql");
const path = require("path");
const cors = require("cors"); // cors 패키지 연결
const morgan = require("morgan");
const passport = require("passport");
// const cookieParser = require('cookie-parser')
const UserRouter = require("./router/userRouter");
const passportConfig = require('./passport');
const PostRouter = require("./router/postRouter");
const LikeRouter = require("./router/likeRouter");
const CommentRouter = require("./router/commentRouter");
// const ImageRouter = require("./router/imageRouter");
const reqlogMiddleware = require("./middlewares/request-log-middleware");
const port = 8080;

// const session = require("express-session")
const webSocket = require("./socket");

const corsOption = {
  origin: ["http://localhost:3000", "*",
  "https://choiji.shop"],
  credentials: true,
};

// http://choijireact.s3-website.ap-northeast-2.amazonaws.com

//MySql
const db = require("./models");
db.sequelize
  .sync()
  .then(() => {
     console.log("MySQL DB 연결 성공");
  })
  .catch((error) => {
    console.error(error);
  });


passportConfig()



const app = express()



//body parser
app.use(morgan("dev"));
// app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
// app.use(express.urlencoded({ extended: false }));





//미들웨어 실행
app.use(reqlogMiddleware);
app.use(cors(corsOption));



// 라우터 등록
app.get('/', (req, res) => {
  res.status(200).render('index');
})


app.use("/post", PostRouter, CommentRouter, LikeRouter);
// app.use("/images", ImageRouter);
app.use('/oauth', express.urlencoded({ extended: false }), UserRouter)
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
// app.use("/public", express.static(__dirname + "/public"));
// app.get("/", (_, res) => res.render("home"));
// app.get("/*", (_, res) => res.redirect("/"));

// app.set("view engine", "pug", "ejs");
// app.set("views", __dirname + "/views");
// app.use("/public", express.static(__dirname + "/public"));
// app.get("/", (_, res) => res.render("home"));
// app.get("/*", (_, res) => res.redirect("/"));



 app.listen(port, () => {
   console.log(port, "포트로 서버가 켜졌어요!"); });
