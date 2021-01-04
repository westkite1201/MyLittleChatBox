const redishelpers = require('./redis');
const util = require('util');
const _ = require('lodash');

const key_user_status = 'skb-user-status';

const key_component_logic = 'Component_Logic_Info';
const key_using_user = 'Component_Using_User';
const key_user_info = 'User_Info';
const key_component_location = 'Component_Location_Info';

const KEY_ROOM = 'CHAT_ROOM';
const KEY_MESSAGE = 'CHAT_MESSAGE';
const KEY_INDEX = 'CHAT_INDEX';
const returnStatusCode = async (successYn, data) => {
  if (_.isNil(data)) {
    data = '';
  }

  let res = await successYn;
  // console.log("res" , res)
  data = res;
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
  //console.log("status", statusInfo)
  return statusInfo;
};
/* 레디스 키 제거 */
const deleteRedisKey = () => {
  redishelpers.redis.del(KEY_ROOM + ':ADMIN');
};

//현재까지 읽은 인덱스를 저장
//방에 들어감 -> 인덱스 저장
//key, SOCKETID : ROOM_ID
//VALUE : INDEXNUM
const setReadIndex = async (messageInfo) => {
  let message = messageInfo.message;
  let roomId = messageInfo.roomId;
  let socketId = messageInfo.socketId;
  let userId = messageInfo.userId;
  let userName = messageInfo.userName;

  const lenkey = util.format('%s:%s', KEY_MESSAGE, roomId);
  let indexNum = await redishelpers.redis.llen(lenkey);

  const key = util.format('%s:%s:%s', KEY_INDEX, socketId, roomId);
  console.log('[SEO] SET_READ_INDEX ', key, indexNum);
  return redishelpers.redis.set(key, indexNum);
};

const getReadIndex = () => {
  let message = messageInfo.message;
  let roomId = messageInfo.roomId;
  let socketId = messageInfo.socketId;
  let userId = messageInfo.userId;
  let userName = messageInfo.userName;

  const key = util.format('%s:%s:%s', KEY_INDEX, socketId, roomId);
  return redishelpers.redis.get(key);
};

//message add
const addMessage = (messageInfo) => {
  console.log('[SEO][redisDao]   messageInfo ', messageInfo);
  //const key = util.format("%s:%s:%s", KEY_MESSAGE, messageInfo.roomId, messageInfo.socketId);
  const key = util.format('%s:%s', KEY_MESSAGE, messageInfo.roomId);

  let message = messageInfo.message;
  let roomId = messageInfo.roomId;
  let socketId = messageInfo.socketId;
  let userId = messageInfo.userId;
  let userName = messageInfo.userName;

  /* 현재 읽은 index 저장 */
  setReadIndex(messageInfo);
  const value = util.format(
    '%s:%s:%s:%s:%s:%s',
    KEY_MESSAGE,
    message,
    roomId,
    socketId,
    userId,
    userName,
  );
  //const key = util.format("%s:%s", KEY_MESSAGE, messageInfo.roomId);
  console.log('[SEO][redisDao] key , message', key, value);
  return redishelpers.redis.rpush(key, value);
};

//message get
//message add 에 소켓 아이디가 필요한가.?
//그러면 조회도 룸아이디로만
const getChatMessage = async (messageInfo) => {
  console.log('[SEO][redisDao]   getChatMessage ', messageInfo);
  //let testRoomId = "심술궂은 핑핑이_/chat#kcvuhUrYDXgmFWmbAAAD"
  //let testSocketId = "/chat#Nkx_awb3WXaVhedZAAAE"
  //const key = util.format("%s:%s:%s", KEY_MESSAGE, messageInfo.roomId, messageInfo.socketId);
  //const key = util.format("%s:%s:%s", KEY_MESSAGE, testRoomId, testSocketId);
  const key = util.format('%s:%s', KEY_MESSAGE, messageInfo.roomId);
  //let message = messageInfo.message;
  //console.log("[SEO][redisDao] key , message", key, message)

  /* 현재 읽은 index 저장 */
  setReadIndex(messageInfo);

  return redishelpers.redis.lrange(key, 0, -1);
};
/* chatRoom 생성  */
/* set 중복없는 value 값  */
/* key = roomId + socketId */
/* value socketId */
const createChatRoom = (data) => {
  /*현재 클라이언트느 어드민이랑만 연결되므로  */
  const key = util.format('%s:%s', KEY_ROOM, 'ADMIN');
  //const key = util.format('%s:%s', KEY_ROOM, data.messageInfo.roomId);
  console.log('[SEO][createChatRoom] KEY ', key);
  return returnStatusCode(
    redishelpers.redis.sadd(key, data.messageInfo.roomId),
  ); // roomList를 위해
};

const getChatRoomList = async (data) => {
  const key = util.format('%s:%s', KEY_ROOM, 'ADMIN');
  console.log('[SEO][getChatRoomList] KEY ', key);
  let resdata = await returnStatusCode(redishelpers.redis.smembers(key));
  console.log('getChatRoomList2 ', resdata);

  return resdata;
};

/* 방에 들어가기  */
const joinChatRoom = (messageInfo) => {
  const key = util.format('%s:%s', KEY_ROOM, messageInfo.roomId);
  redishelpers.redis.sadd(key, messageInfo.socketId);
};
/* 방에서 나가기  */
/*  socketId에 해당되는 값 제거  */
const leaveChatRoom = (messageInfo) => {
  console.log('leaveChatRoom', messageInfo);
  const key = util.format('%s:%s', KEY_ROOM, messageInfo.roomId);
  let socketId = messageInfo.socketId;
  redishelpers.redis.srem(key, socketId);

  let memberCount = getChatRoomMember(messageInfo);
  if (memberCount === 0) {
    distroyRoom();
  }
};

/*해당 room 제거  */
const distroyRoom = (messageInfo) => {
  redishelpers.redis.srem(KEY_ROOM, messageInfo.roomId);
};

/* 채팅방 멤버수 구하기  */
const getChatRoomMember = (messageInfo) => {
  const key = util.format('%s:%s', KEY_ROOM, messageInfo.roomId);
  return redishelpers.redis.smembers(key);
};

/////////////////////////////////

//// expire test
// const expireTest = (data) => {
//   const key = 'test';
//   redishelpers.redis.set(key, 'expire test');
//   return redishelpers.redis.expire(key, 10);
//}
const setExpireDate = (data) => {
  const key = data.redis_key;
  expire_time = 1209600; // 2 weeks
  console.log('set expire key');
  console.log('key: ', key, 'expire_time: ', expire_time);
  return redishelpers.redis.expire(key, expire_time);
};
// expire test

///////////////////////////////

module.exports = {
  // keys
  key_user_status: key_user_status,
  key_component_logic: key_component_logic,
  key_using_user: key_using_user,
  key_user_info: key_user_info,
  key_component_location: key_component_location,

  //key
  //CHAT 함수
  deleteRedisKey: deleteRedisKey,
  getChatMessage: getChatMessage,
  addMessage: addMessage,
  createChatRoom: createChatRoom,
  getChatRoomList: getChatRoomList,
  getChatRoomMember: getChatRoomMember,
  joinChatRoom: joinChatRoom,
  leaveChatRoom: leaveChatRoom,
  distroyRoom: distroyRoom,

  setReadIndex: setReadIndex,
  getReadIndex: getReadIndex,
  // Expire Test
  //expireTest: expireTest,
  setExpireDate: setExpireDate,
};
