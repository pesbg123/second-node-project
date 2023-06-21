const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;

const Posts = require('../schemas/posts.js');
const Users = require('../schemas/users.js');

// 전체 게시글 조회 API
router.get('/posts', async (req, res) => {
  try {
    const posts = await Posts.find({})
      .select(' -password -__v') // 데이터베이스에서 mongoos메서드 select를 사용해서 특정 필드들을 제외 한 후
      // 나머지 게시물을 조회하고, 작성 날짜 기준으로 내림차순으로 정렬합니다.
      .sort({ createdAt: -1 });
    // 조회된 게시물이 없을때 에러메시지를 응답 합니다.
    if (!posts || posts.length === 0) {
      res.status(404).json({ error: '존재하는 게시물이 없습니다.' });
    }

    // 조회된 게시물을 응답합니다.
    res.json({ data: posts });
  } catch (error) {
    // 오류가 발생한 경우 오류 메시지를 응답합니다.
    res.status(500).json({ error: '게시물 조회에 실패했습니다.' });
  }
});

// 게시글 작성 API
router.post('/posts', async (req, res) => {
  const { user, password, title, content } = req.body;

  // 이미 존재하는 게시물인지 확인합니다.
  const existingPosts = await Posts.find({ user });
  if (existingPosts.length) {
    return res.status(400).json({
      success: false,
      errorMessage: '중복되는 게시물이 존재합니다.',
    });
  }

  // 새로운 게시물을 생성합니다.
  const postId = new ObjectId().toHexString();
  const createdPosts = await Posts.create({
    postId,
    user,
    password,
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
router.put('/posts/:postId', async (req, res) => {
  const { postId } = req.params;
  const { password, title, content } = req.body;

  try {
    // title, content에 아무것도 입력하지 않을시 에러 응답을 보냅니다.
    if (title.length === 0 || content.length === 0) {
      return res.status(400).json({
        success: false,
        error: '비어있는 게시물을 허용하지 않습니다.',
      });
    }

    // MongoDB에서 해당 postId와 password를 가진 게시물을 조회합니다.
    const post = await Posts.findOne({ postId, password });

    if (!post) {
      // 게시물이 존재하지 않을 경우 에러 응답을 보냅니다.
      return res.status(404).json({ error: '게시물을 찾을 수 없습니다.' });
    }

    // 게시물을 업데이트합니다.
    await Posts.updateOne({ postId, password }, { $set: { title, content } });

    // 수정된 게시물을 응답합니다.
    res.json({ message: '게시물 수정에 성공했습니다.' });
  } catch (error) {
    // 오류가 발생한 경우 오류 메시지를 응답합니다.
    res.status(500).json({ error: '게시물 수정에 실패했습니다.' });
  }
});

// 게시글 삭제 API
router.delete('/posts/:postId', async (req, res) => {
  const { postId } = req.params;
  const { password } = req.body;

  try {
    // MongoDB에서 해당 postId를 가진 게시물을 조회합니다.
    const post = await Posts.findOne({ postId: postId });
    console.log(post);

    if (!post) {
      // 게시물이 존재하지 않을 경우 에러 응답을 보냅니다.
      return res.status(404).json({ error: '게시물을 찾을 수 없습니다.' });
    }

    // 비밀번호를 비교하여 일치하지 않을 경우 에러 응답을 보냅니다.
    if (post.password !== password) {
      return res.status(401).json({ error: '비밀번호가 일치하지 않습니다.' });
    }

    // MongoDB에서 해당 postId를 가진 게시물을 삭제합니다.
    await Posts.findOneAndDelete({ postId: post.postId });

    // 삭제된 게시물을 응답합니다.
    res.json({ message: '게시물이 삭제되었습니다.' });
  } catch (error) {
    // 오류가 발생한 경우 오류 메시지를 응답합니다.
    res.status(500).json({ error: '게시물이 삭제되지 않았습니다.' });
  }
});

module.exports = router;
