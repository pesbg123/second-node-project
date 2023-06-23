const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  // email 필드: 문자열 타입, 필수 입력, 고유속성 부여
  email: {
    type: String,
    required: true,
    unique: true,
  },

  // nickname 필드: 문자열 타입, 필수 입력, 고유속성 부여
  nickname: {
    type: String,
    required: true,
    unique: true,
  },

  // password 필드: 문자열 타입, 필수 입력
  password: {
    type: String,
    required: true,
  },
});

// userId라는 가상필드를 정의하고, _id 필드의 값을 변환하여 반환합니다.
UserSchema.virtual('userId').get(function () {
  return this._id.toHexString();
});

// toJSON 옵션을 사용해서 userId(가상필드)도 JSON에 포함되도록 설정합니다.
UserSchema.set('toJSON', {
  virtual: true,
});

// 'User' 모델을 생성하고 UserSchema를 이용하여 스키마를 설정합니다.
module.exports = mongoose.model('User', UserSchema);
