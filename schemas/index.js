const mongoose = require('mongoose');

// MongoDB에 연결하는 함수
const connect = () => {
  // mongoose를 사용하여 MongoDB에 연결합니다.
  mongoose
    .connect('mongodb://127.0.0.1:27017/solo_project')
    .catch((err) => console.log(err));
};

// MongoDB 연결 시 발생한 에러를 처리하는 이벤트 리스너
mongoose.connection.on('error', (err) => {
  console.error('몽고디비 연결 에러', err);
});

// connect 함수를 외부로 내보냅니다.
module.exports = connect;
