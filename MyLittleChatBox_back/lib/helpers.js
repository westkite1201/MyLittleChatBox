const returnStatusCode = (successYn, data, errorMsg) => {
  let statusInfo = {
    message: '',
    statusCode: '',
    data: data,
  };
  if (successYn) {
    statusInfo.message = 'suceess';
    statusInfo.statusCode = 200;
  } else {
    statusInfo.message = 'error';
    statusInfo.statusCode = 400;
  }
  return statusInfo;
};
module.exports = {
  returnStatusCode: returnStatusCode,
};
