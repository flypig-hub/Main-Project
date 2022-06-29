const express = require("express");
// const dbconfig = require('./database/db');
// const cors = require("cors");
const connectDB = require("./database/db")
const reqLogMiddleware = require('./middlewares/request-log-middleware');
// const PostRouter = ("./router/postRouter");

const port = 8080;

// const corsOption = {
//     origin: "http://localhost:3000",
//     credentials: true,
//     };


// 서버어플리케이션
const app = express();


// DB 연결
app.get('/mysql', (req, res) => {
    connection.query('SELECT * from jeju_main', (error, rows) => {
      if (error) throw error;
      console.log('User info is: ', rows);
      res.send(rows);
    });
  });


// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


// 미들웨어
app.use(reqLogMiddleware);
// app.use(cors(corsOption));

// app.use("/post", PostRouter);


app.set('view engine', 'ejs');
app.get('/', async (req, res) => {
    res.status(200).render('index');
});

app.listen(port, () => {
    console.log(port, "포트로 서버가 켜졌어요!")
});