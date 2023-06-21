const express = require('express');
const app = express();
const port = 3000;

const cookieParser = require('cookie-parser');

const postsRouter = require('./routes/post.js');
const commentsRouter = require('./routes/comment.js');
const userRouter = require('./routes/user.js');
const authRouter = require('./routes/auth.js');

const connect = require('./schemas');
connect();

// body 파서 미들웨어를 사용하기 위한 설정
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// postsRouter를 '/' 경로에 적용
app.use('/', [postsRouter, commentsRouter, userRouter, authRouter]);

// 서버 시작
app.listen(port, () => {
  console.log(port, '포트로 서버가 열렸어요!'); // 서버가 시작되면 콘솔에 포트 번호를 출력합니다.
});
