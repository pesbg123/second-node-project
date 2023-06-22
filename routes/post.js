const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const authMiddleware = require('../middlewares/auth-middleware.js');

const Posts = require('../schemas/posts.js');
const Users = require('../schemas/users.js');

// 전체 게시글 조회 API
router.get('/posts', async (req, res) => {
  try {
    // 작성자 정보를 제외한 모든 필드를 선택하고, 작성 날짜를 기준으로 내림차순 정렬하여 사용자 정보를 조회합니다.
    const users = await Users.find({})
      .select('-password -__v')
      .sort({ createdAt: -1 });

    // 작성자 정보를 제외한 모든 필드를 선택하고, 작성 날짜를 기준으로 내림차순 정렬하여 게시물을 조회합니다.
    const posts = await Posts.find({})
      .select('-password -__v')
      .sort({ createdAt: -1 });

    // 조회된 게시물이 없을 때 에러 메시지를 응답합니다.
    if (!posts || posts.length === 0) {
      res.status(404).json({ error: '존재하는 게시물이 없습니다.' });
      return; // 추가된 return 문을 통해 함수 실행 종료
    }

    // 게시물과 작성자 정보를 함께 응답합니다.
    res.json({ data: posts });
  } catch (error) {
    // 오류가 발생한 경우 오류 메시지를 응답합니다.
    res.status(500).json({ error: '게시물 조회에 실패했습니다.' });
  }
});

// 게시글 작성 API
router.post('/posts', authMiddleware, async (req, res) => {
  const { title, content } = req.body;
  const { user } = res.locals;
  // 새로운 게시물을 생성합니다.
  const createdPosts = await Posts.create({
    userId: user.userId,
    nickname: user.nickname,
    title,
    content,
    createdAt: new Date(),
  });

  // 생성된 게시물을 응답합니다.
  res.json({ posts: '게시물을 생성하였습니다.' });
});

// 게시글 상세 조회 API
router.get('/posts/:title', async (req, res) => {
  let { title } = req.params;

  try {
    // 대소문자 구별 없이 title 값을 검색 가능하도록 정규식을 사용하여 변환합니다.
    const titleRegex = new RegExp(title, 'i');

    // MongoDB에서 해당 title을 가진 게시물을 조회합니다.
    const post = await Posts.find({ title: titleRegex })
      .select('-password -__v')
      .sort({ createdAt: -1 });

    if (!post || post.length === 0) {
      // 게시물이 존재하지 않을 경우 에러 응답을 보냅니다.
      return res.status(404).json({ error: '게시물을 찾을 수 없습니다.' });
    }

    // 조회된 게시물을 응답합니다.
    res.json({ data: post });
  } catch (error) {
    // 오류가 발생한 경우 오류 메시지를 응답합니다.
    res.status(500).json({ error: '게시물 조회에 실패했습니다.' });
  }
});

// 게시글 수정 API
router.patch('/posts/:postId', authMiddleware, async (req, res) => {
  const { postId } = req.params;
  const { title, content } = req.body;
  const { user } = res.locals;

  try {
    // title, content에 아무것도 입력하지 않을시 에러 응답을 보냅니다.
    if (title.length === 0 || content.length === 0) {
      return res.status(400).json({
        success: false,
        error: '비어있는 게시물을 허용하지 않습니다.',
      });
    }

    const post = await Posts.findById(postId);

    if (!post) {
      // 게시물이 존재하지 않을 경우 에러 응답을 보냅니다.
      return res.status(404).json({ error: '게시물을 찾을 수 없습니다.' });
    }

    if (user.userId !== post.userId) {
      return res.status(400).json({ error: '접근이 허용되지 않습니다.' });
    }

    // 게시물을 업데이트합니다.
    await Posts.updateOne({ _id: postId }, { $set: { title, content } });

    // 수정된 게시물을 응답합니다.
    res.json({ message: '게시물 수정에 성공했습니다.' });
  } catch (error) {
    // 오류가 발생한 경우 오류 메시지를 응답합니다.
    res.status(500).json({ error: '게시물 수정에 실패했습니다.' });
  }
});

// 게시글 삭제 API
router.delete('/posts/:postId', authMiddleware, async (req, res) => {
  const { postId } = req.params;
  const { user } = res.locals;

  try {
    // MongoDB에서 해당 postId를 가진 게시물을 조회합니다.
    const post = await Posts.findById(postId);

    if (!post) {
      // 게시물이 존재하지 않을 경우 에러 응답을 보냅니다.
      return res.status(404).json({ error: '게시물을 찾을 수 없습니다.' });
    }

    if (user.userId !== post.userId) {
      return res.status(400).json({ error: '접근이 허용되지 않습니다.' });
    }

    // MongoDB에서 해당 postId를 가진 게시물을 삭제합니다.
    await Posts.findOneAndDelete({ _id: postId });

    // 삭제된 게시물을 응답합니다.
    res.json({ message: '게시물이 삭제되었습니다.' });
  } catch (error) {
    // 오류가 발생한 경우 오류 메시지를 응답합니다.
    res.status(500).json({ error: '게시물이 삭제되지 않았습니다.' });
  }
});

module.exports = router;
