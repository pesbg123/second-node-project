const mongoose = require('mongoose');
// 'Posts'에 대한 스키마 정의
const postsSchema = new mongoose.Schema({
  // nickname 필드: 문자열 타입, 필수 입력
  nickname: {
    type: String,
    required: true,
  },

  // userId 필드: 문자열 타입, 필수 입력
  userId: {
    type: String,
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
