/**
 * Global helper functions - client & server
 */
// ---------------------------------------------------------
// isEmpty
//
// 넘어온 값이 빈값인지 체크합니다.
// !value 하면 생기는 논리적 오류를 제거하기 위해 명시적으로 value == 사용
// [], {} 도 빈값으로 처리
// ---------------------------------------------------------

const isEmpty = (value) => {
  if (value === '' || value === 'undefined' || value === 'null'
    || value === undefined || value === null
    || (value !== null && typeof value === 'object' && !Object.keys(value).length)) {
    return true
  }
  else {
    return false
  }
}

// ---------------------------------------------------------
// check apis - login, auth, ...
// ---------------------------------------------------------

const checkLogin = (userId, token) => {
  if (isEmpty(userId)) {
    return false;
  }
  if (isEmpty(token)) {
    return false;
  }

  return true;
}

const checkAuth = (userId) => {
  switch (userId) {
    // admin
    case '000001':
    case '000002':
    case 'msson':
      return true;
    default:
      return false;
  }
}

const checkAdminUrl = (to) => {
  switch (to) {
    case '/admin':
      return true;
    default:
      return false;
  }
}

const checkMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ;
}

const checkEmail = (email) => {
    return /([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/.test(email);
}

const checkReqUserBrowser = (req) => {

  const header = req.get('user-agent').toString();

  if (header.includes("MSIE")){
    return "MSIE";
  }
  else if(header.includes("Chrome")) {
    return "Chrome";
  }
  else if(header.includes("Opera")) {
    return "Opera";
  }
  return "Firefox";
}
// ---------------------------------------------------------
// check file format
// ---------------------------------------------------------
const isImageFormat = (filename) => {
  return filename.match(/.(jpg|jpeg|png|gif|tiff|bmp)$/i);
}

const checkFileFormat = (filename) => {
  return !filename.match(/.(exe|sh|bat)$/i);
}

// ---------------------------------------------------------
// getHash
// MD5 해쉬를 생성해서 리턴한다. 주로 파일명 해쉬 등에 사용된다.
// ---------------------------------------------------------
const getHash = (data) => {
  const crypto = require('crypto');
  return crypto.createHash('md5').update(data).digest('hex');
}

// ---------------------------------------------------------
// getRandomInt
//
// min (포함) 과 max (불포함) 사이의 임의 정수를 반환
// ---------------------------------------------------------
const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min)) + min;
}

// ---------------------------------------------------------
// Restful api error code
// ---------------------------------------------------------

const errorCode = {
  empty: {
    code: 101,
    message: 'invalid parameter',
  },
  failure: {
    code: 101,
    message: 'failure',
    error: '',
  },
  socketFailure: {
    code: 101,
    message: 'invalid socket',
  },
};

module.exports = {
  // properties
  errorCode: errorCode,

  // methods
  getHash: getHash,
  getRandomInt: getRandomInt,

  isEmpty: isEmpty,
  isImageFormat: isImageFormat,
  checkFileFormat: checkFileFormat,
  checkLogin: checkLogin,
  checkAuth: checkAuth,
  checkAdminUrl: checkAdminUrl,
  checkMobile: checkMobile,
  checkEmail: checkEmail,
  checkReqUserBrowser: checkReqUserBrowser,
}
