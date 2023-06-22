const express = require('express');
const router = express.Router();
const User = require('../schemas/users.js');
const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');

const authMiddleware = require('../middlewares/auth-middleware');

// 내 정보 조회 API
router.get('/users/me', authMiddleware, async (req, res) => {
  const { email, nickname } = res.locals.user;

  res.status(200).json({
    user: { email, nickname },
  });
});

// 회원가입 API
router.post('/users', async (req, res) => {
  const { email, nickname, password, confirmPassword } = req.body;

  // 닉네임 유효성 검사
  if (!nickname.match(/^[a-zA-Z0-9]{3,50}$/)) {
    return res.status(400).json({
      error: '닉네임은 영어나 숫자로만 이루어지게 작성해 주세요.',
    });
  }

  // 패스워드 유효성 검사
  if (password.length < 4) {
    return res.status(400).json({
      errorMessage: '패스워드를 4글자 이상 작성해 주세요.',
    });
  }

  if (password.includes(nickname)) {
    return res.status(400).json({
      errorMessage: '닉네임이 패스워드에 포함될 수 없습니다.',
    });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({
      errorMessage: '패스워드와 전달된 패스워드 확인값이 일치하지 않습니다.',
    });
  }

  const isExistUser = await User.findOne({ $or: [{ email }, { nickname }] });
  if (isExistUser) {
    return res.status(400).json({
      errorMessage: '이메일 또는 닉네임이 이미 사용중입니다.',
    });
  }

  const userId = new ObjectId().toHexString();
  const user = new User({ userId, email, nickname, password });
  await user.save(); // DB에 저장

  return res.status(201).json({
    message: '회원가입이 정상적으로 완료되었습니다.',
  });
});

module.exports = router;
