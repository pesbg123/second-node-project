const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');

const authMiddleware = require('../middlewares/auth-middleware');
const User = require('../schemas/users.js');

// 내 정보 조회 API (로그인 한 사용자만 조회 할 수 있게 authMiddleware사용)
router.get('/users/me', authMiddleware, async (req, res) => {
  const { email, nickname } = res.locals.user;

  // 사용자 인증이 완료되었음을 확인 메시지를 응답합니다.
  res.status(200).json({
    message: '사용자 인증이 완료되었습니다.',
  });
});

// 회원가입 API
router.post('/users', async (req, res) => {
  const { email, nickname, password, confirmPassword } = req.body;

  // 정규 표현식을 사용해서 닉네임이 영어와 숫자로 이루어 졌는지 검사 합니다.
  if (!nickname.match(/^[a-zA-Z0-9]{3,50}$/)) {
    // 에러 메시지를 응답합니다.
    return res.status(400).json({
      error: '닉네임은 영어나 숫자로만 이루어지게 작성해 주세요.',
    });
  }

  // 패스워드 유효성 검사
  if (password.length < 4) {
    return res.status(400).json({
      // 에러 메시지를 응답합니다.
      error: '패스워드를 4글자 이상 작성해 주세요.',
    });
  }
  if (password.includes(nickname)) {
    return res.status(400).json({
      // 에러 메시지를 응답합니다.
      error: '닉네임이 패스워드에 포함될 수 없습니다.',
    });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({
      // 에러 메시지를 응답합니다.
      error: '패스워드와 전달된 패스워드 확인값이 일치하지 않습니다.',
    });
  }

  // 이미 존재하는 이메일 또는 닉네임인지 확인합니다.
  const isExistUser = await User.findOne({ $or: [{ email }, { nickname }] });
  if (isExistUser) {
    return res.status(400).json({
      // 에러 메시지를 응답합니다.
      error: '이메일 또는 닉네임이 이미 사용중입니다.',
    });
  }

  // 새로운 사용자의 userId를 생성합니다.
  const userId = new ObjectId().toHexString();

  // 새로운 사용자를 생성하여 DB에 저장합니다.
  const user = new User({ userId, email, nickname, password });
  await user.save();

  // 회원가입 완료 메시지를 응답합니다.
  return res.status(201).json({
    message: '회원가입이 정상적으로 완료되었습니다.',
  });
});

module.exports = router; // router 모듈을 외부로 내보냅니다.
