const mongoose = require('mongoose');
// 'Posts'에 대한 스키마 정의
const postsSchema = new mongoose.Schema({
  // postId 필드: 문자열 타입, 필수 입력, 고유한 값
  postId: {
    type: String,
    required: true,
    unique: true,
  },

  // user 필드: 문자열 타입, 필수 입력, 고유한 값
  user: {
    type: String,
    required: true,
  },

  // password 필드: 숫자 타입, 필수 입력
  password: {
    type: Number,
    required: true,
  },

  // title 필드: 문자열 타입, 필수 입력
  title: {
    type: String,
    required: true,
  },

  // content 필드: 문자열 타입, 필수 입력
  content: {
    type: String,
    required: true,
  },

  // createdAt 필드: 날짜 타입, 필수 입력
  createdAt: {
    type: Date,
    required: true,
  },
});

// 'Posts' 모델을 생성하고 postsSchema를 이용하여 스키마를 설정합니다.
module.exports = mongoose.model('Posts', postsSchema);
