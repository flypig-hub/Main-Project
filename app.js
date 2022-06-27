const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const connectDB = require("./database/db")
// const requestMiddleware = ("./middlewares/requestMiddleware");
// const PostRouter = ("./router/postRouter");

const port = 8080;

// const corsOption = {
//     origin: "http://localhost:3000",
//     credentials: true,
//     };

// DB 연결
// connectDB();
// const db = mongoose.connection;
// db.on("error", console.error.bind(console, "connection error:"));

// 서버어플리케이션
const app = express();

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


// 미들웨어
// app.use(requestMiddleware);
// app.use(cors(corsOption));

// app.use("/post", PostRouter);


app.set('view engine', 'ejs');
app.get('/', async (req, res) => {
    res.status(200).render('index');
});

app.listen(port, () => {
    console.log(port, "포트로 서버가 켜졌어요!")
});