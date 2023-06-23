const express = require('express');
const app = express();
const port = 3000;
const cookieParser = require('cookie-parser');

const postsRouter = require('./routes/post.js'); // '/routes/post.js'파일에서 라우터를 가져옵니다.
const commentsRouter = require('./routes/comment.js'); // '/routes/comment.js' 파일에서 라우터를 가져옵니다.
const userRouter = require('./routes/user.js'); // '/routes/user.js' 파일에서 라우터를 가져옵니다.
const authRouter = require('./routes/auth.js'); // '/routes/auth.js' 파일에서 라우터를 가져옵니다.

const connect = require('./schemas'); // '/schemas' 폴더에서 데이터베이스 연결하는 함수를 가져옵니다.
connect(); // 데이터베이스 연결 함수를 실행하여 데이터베이스에 연결합니다.

app.use(express.json()); // 요청의 데이터를 JSON 형식으로 파싱하기 위한 미들웨어 설정
app.use(cookieParser()); // 쿠키 파싱을 위한 미들웨어 설정

app.use('/', [postsRouter, commentsRouter, userRouter, authRouter]);
// '/' 경로에 postsRouter, commentsRouter, userRouter, authRouter 미들웨어를 적용합니다.
// 이 미들웨어들은 각각 '/posts', '/comments', '/users', '/auth' 경로에 대한 요청을 처리합니다.

app.listen(port, () => {
  console.log(port, '포트로 서버가 열렸어요!'); // 서버가 시작되면 콘솔에 포트 번호를 출력합니다.
});
