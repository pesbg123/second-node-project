const jwt = require('jsonwebtoken'); // 'jsonwebtoken' 모듈을 가져옵니다. (jwt를 사용하기 위해 필요)
const User = require('../schemas/users'); // '../schemas/users'에서 User 모델을 가져옵니다.

// 사용자 인증 미들웨어
module.exports = async (req, res, next) => {
  const { Authorization } = req.cookies; // 요청의 쿠키에서 'Authorization' 값을 가져옵니다.
  const [authType, authToken] = (Authorization ?? '').split(' '); // 'Authorization' 값을 공백을 기준으로 분리하여 인증 타입과 인증 토큰을 얻습니다.

  if (!authToken || authType !== 'Bearer') {
    // 인증 토큰이 없거나 인증 타입이 'Bearer'가 아닐 경우
    res.status(401).send({
      errorMessage: '로그인 후 이용 가능한 기능입니다.', // 에러 메시지를 응답으로 보내고, 상태 코드 401(Unauthorized)를 설정합니다.
    });
    return;
  }

  try {
    const { userId } = jwt.verify(authToken, 'custom-secret-key'); // 인증 토큰을 검증하여 사용자 ID를 추출합니다.
    const user = await User.findById(userId); // 추출한 사용자 ID를 사용하여 데이터베이스에서 사용자를 조회합니다.
    res.locals.user = user; // 조회된 사용자 정보를 응답 로컬 변수에 저장합니다.
    next(); // 다음 미들웨어로 넘어갑니다.
  } catch (err) {
    console.error(err);
    res.status(401).send({
      errorMessage: '로그인 후 이용 가능한 기능입니다.', // 에러 메시지를 응답으로 보내고, 상태 코드 401(Unauthorized)를 설정합니다.
    });
  }
};
