const mongoose = require('mongoose');

// 'Comments'에 대한 스키마 정의
const commentsSchema = new mongoose.Schema({
  // commentId 필드: 문자열 타입, 필수 입력, 고유한 값
  commentId: {
    type: String,
    required: true,
    unique: true,
  },

  // params로 가져온 게시글 id
  postId: {
    type: String,
    required: true,
  },

  // user 필드: 문자열 타입, 필수 입력
  user: {
    type: String,
    required: true,
  },

  // comment 필드: 문자열 타입, 필수 입력
  comment: {
    type: String,
    required: true,
  },

  // createdAt 필드: 날짜 타입, 필수 입력
  createdAt: {
    type: Date,
    required: true,
  },
});

// 'Comments' 모델을 생성하고 commentsSchema를 이용하여 스키마를 설정합니다.
module.exports = mongoose.model('Comments', commentsSchema);
