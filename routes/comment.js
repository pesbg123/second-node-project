const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const authMiddleware = require('../middlewares/auth-middleware.js');
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
    // 게시물에 작성된 모든 코멘트를 조회합니다.
    const comments = await Comments.find({ postId: postId })
      .select(' -__v') // __v 필드는 mongoose의 select()메서드를 사용해서 가립니다.
      .sort({ createdAt: -1 }); // sort() 메서드를 사용해서 작성시간별 내림차순으로 정렬합니다.
    // 코멘트의 존재 여부를 확인합니다.
    if (comments.length === 0) {
      return res
        .status(404)
        .json({ error: '해당 게시물에 달린 댓글이 없습니다.' });
    }
    // 조회한 코멘트들을 응답합니다.
    res.json({ data: comments });
  } catch (error) {
    // 오류가 발생한 경우 오류 메시지를 응답합니다.
    res.status(500).json({ error: '게시물 조회에 실패했습니다.' });
  }
});

// 코멘트 작성 API (로그인 한 사용자만 작성할 수 있게 authMiddleware사용)
router.post('/posts/:postId/comments', authMiddleware, async (req, res) => {
  const { nickname, comment } = req.body;
  const { postId } = req.params;
  const { user } = res.locals;

  // 바디에서 받아온 데이터가 비어있는지 확인합니다.
  if (!nickname || !comment) {
    return res.status(400).json({
      success: false,
      error: '댓글이나 닉네임을 입력해주세요.',
    });
  }

  try {
    // 게시물의 존재 여부를 확인합니다.
    const post = await Posts.findById(postId);
    if (!post) {
      return res.status(404).json({ error: '게시물을 찾을 수 없습니다.' });
    }

    // 코멘트를 DB에 저장합니다.
    await Comments.create({
      userId: user.userId,
      postId,
      nickname,
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

// 코멘트 수정 API (로그인 한 사용자만 수정할 수 있게 authMiddleware사용)
router.patch(
  '/posts/:postId/comments/:commentId',
  authMiddleware,
  async (req, res) => {
    const { comment } = req.body;
    const { postId, commentId } = req.params;
    const { user } = res.locals;

    try {
      // 게시물의 존재 여부를 확인합니다.
      const post = await Posts.findById(postId);
      if (!post) {
        return res.status(404).json({ error: '게시물을 찾을 수 없습니다.' });
      }

      // 코멘트의 존재 여부를 확인합니다.
      const existingComment = await Comments.findById(commentId);
      if (!existingComment) {
        return res.status(404).json({ error: '코멘트를 찾을 수 없습니다.' });
      }

      // 사용자 본인이 작성한 코멘트인지 검사합니다.
      if (user.userId !== existingComment.userId) {
        return res.status(400).json({ error: '접근이 허용되지 않습니다.' });
      }

      // 입력된 코멘트 값의 유효성을 검사합니다.
      if (!comment) {
        return res.status(400).json({ error: '코멘트를 입력해주세요.' });
      }

      /// 코멘트를 업데이트합니다.
      existingComment.comment = comment;
      await existingComment.save();

      // 확인 메시지를 응답합니다.
      res.json({ message: '댓글을 수정하였습니다.' });
    } catch (error) {
      // 오류가 발생한 경우 오류 메시지를 응답합니다.
      res.status(500).json({ error: '댓글 수정에 실패했습니다.' });
    }
  }
);

// 코멘트 삭제 API (로그인 한 사용자만 삭제할 수 있게 authMiddleware사용)
router.delete(
  '/posts/:postId/comments/:commentId',
  authMiddleware,
  async (req, res) => {
    const { postId, commentId } = req.params;
    const { user } = res.locals;

    try {
      // 게시물의 존재 여부를 확인합니다.
      const post = await Posts.findById(postId);
      if (!post) {
        return res.status(404).json({ error: '게시물을 찾을 수 없습니다.' });
      }

      // 코멘트의 존재 여부를 확인합니다.
      const existingComment = await Comments.findById(commentId);
      if (!existingComment) {
        return res.status(404).json({ error: '코멘트를 찾을 수 없습니다.' });
      }

      // // 사용자 본인이 작성한 코멘트인지 검사합니다.
      if (user.userId !== existingComment.userId) {
        return res.status(400).json({ error: '접근이 허용되지 않습니다.' });
      }

      // 코멘트를 삭제합니다.
      await Comments.deleteOne(existingComment);

      // 확인 메시지를 응답합니다.
      res.status(200).json({ message: '댓글을 삭제하였습니다.' });
    } catch (error) {
      // 오류가 발생한 경우 오류 메시지를 응답합니다.
      res.status(500).json({ error: '댓글 삭제에 실패했습니다.' });
    }
  }
);

module.exports = router; // router 모듈을 외부로 내보냅니다.
