const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
const Posts = require('../schemas/posts');
const Comments = require('../schemas/comments');

// 해당 게시글 코멘트 조회 API
router.get('/posts/:postId/comments', async (req, res) => {
  const { postId } = req.params;

  try {
    // 게시물의 존재 여부를 확인합니다.
    const post = await Posts.find({ postId: postId });
    if (!post) {
      return res.status(404).json({ error: '게시물을 찾을 수 없습니다.' });
    }

    // 게시물에 연결된 모든 코멘트를 조회합니다.
    const comments = await Comments.find({ postId: postId })
      .select('-_id -__v')
      .sort({ createdAt: -1 });
    if (comments.length === 0) {
      return res
        .status(404)
        .json({ error: '해당 게시물에 달린 댓글이 없습니다..' });
    }

    res.json({ data: comments });
  } catch (error) {
    // 오류가 발생한 경우 오류 메시지를 응답합니다.
    res.status(500).json({ error: '게시물 조회에 실패했습니다.' });
  }
});

// 코멘트 작성 API
router.post('/posts/:postId/comments', async (req, res) => {
  const { user, comment } = req.body;
  const { postId } = req.params;

  // 한 글자도 입력하지 않았을 상황에 대한 예외처리
  if (!comment) {
    return res.status(400).json({
      success: false,
      error: '코멘트를 입력해주세요',
    });
  }

  try {
    // 게시물의 존재 여부를 확인합니다.
    const post = await Posts.find({ postId: postId });
    if (!post) {
      return res.status(404).json({ error: '게시물을 찾을 수 없습니다.' });
    }

    // 코멘트를 저장합니다.
    const commentId = new ObjectId().toHexString();
    await Comments.create({
      commentId,
      postId,
      user,
      comment,
      createdAt: new Date(),
    });

    // 생성된 코멘트를 응답합니다.
    res.json({ message: '댓글을 작성하였습니다.' });
  } catch (error) {
    // 오류가 발생한 경우 오류 메시지를 응답합니다.
    res.status(500).json({ error: '댓글 작성에 실패했습니다.' });
  }
});

// 코멘트 수정 API
router.put('/posts/:postId/comments/:commentId', async (req, res) => {
  const { comment } = req.body;
  const { postId, commentId } = req.params;

  try {
    // 게시물의 존재 여부를 확인합니다.
    const post = await Posts.find({ postId });
    if (!post) {
      return res.status(404).json({ error: '게시물을 찾을 수 없습니다.' });
    }

    // 코멘트의 존재 여부를 확인합니다.
    const existingComment = await Comments.find({ commentId });
    if (!existingComment) {
      return res.status(404).json({ error: '코멘트를 찾을 수 없습니다.' });
    }

    // 코멘트를 업데이트합니다.
    await Comments.updateOne({ commentId }, { $set: { comment } });

    // 업데이트된 코멘트를 응답합니다.
    res.json({ message: '댓글을 수정하였습니다.' });
  } catch (error) {
    // 오류가 발생한 경우 오류 메시지를 응답합니다.
    res.status(500).json({ error: '댓글 수정에 실패했습니다.' });
  }
});

// 코멘트 삭제 API
router.delete('/posts/:postId/comments/:commentId', async (req, res) => {
  const { postId, commentId } = req.params;

  try {
    // 게시물의 존재 여부를 확인합니다.
    const post = await Posts.find({ postId });
    if (!post) {
      return res.status(404).json({ error: '게시물을 찾을 수 없습니다.' });
    }

    // 코멘트의 존재 여부를 확인합니다.
    const existingComment = await Comments.findOne({ commentId });
    if (!existingComment) {
      return res.status(404).json({ error: '코멘트를 찾을 수 없습니다.' });
    }

    // 코멘트를 삭제합니다.
    await Comments.deleteOne({ commentId });

    res.status(200).json({ message: '댓글을 삭제하였습니다.' });
  } catch (error) {
    res.status(500).json({ error: '댓글 삭제에 실패했습니다.' });
  }
});

module.exports = router;
