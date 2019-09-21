const redishelpers = require('./redis');
const util = require('util');

const key_user_status = 'skb-user-status';

const key_component_logic = 'Component_Logic_Info';
const key_using_user = 'Component_Using_User';
const key_user_info = 'User_Info';
const key_component_location = 'Component_Location_Info';

const key_route_info = 'RouteInfo';
const key_component_info = 'ComponentInfo';

const KEY_ROOM =  'CHAT_ROOM'
const KEY_MESSAGE = 'CHAT_MESSAGE'

//message add 
const addMessage = (messageInfo) => {
  console.log("[SEO][redisDao]   messageInfo ", messageInfo)
  const key = util.format("%s:%s:%s", KEY_MESSAGE, messageInfo.roomId, messageInfo.socketId);
  let message = messageInfo.message;
  console.log("[SEO][redisDao] key , message", key, message)
  return redishelpers.redis.rpush(key, message);
}
/* chatRoom 생성  */
/* set 중복없는 value 값  */
/* key = roomId + socketId */
/* value socketId */
const createChatRoom = (messageInfo) => {
  const key = util.format("%s", KEY_ROOM);
  redishelpers.redis.sadd(key, messageInfo.roomId); // roomList를 위해
}
/*  */
const joinChatRoom = (messageInfo) => {
  const key = util.format("%s:%s", KEY_ROOM, messageInfo.roomId);
  redishelpers.redis.sadd(key, messageInfo.socketId);
}

const getChatRoomList  = (messageInfo) => {
  const key = util.format("%s:%s", KEY_ROOM);
  return redishelpers.redis.smembers(key, smembers);
}

/* */
const getChatRoomMember  = (messageInfo) => {
  const key = util.format("%s:%s", KEY_ROOM, messageInfo.socketId);
  return redishelpers.redis.smembers(key, smembers);
}

const leaveChatRoom  = () => {
  let key = data.socketId;
  return redishelpers.redis.rpush(key, message);
}








const setUserStatus = (data) => {
  console.log('----- setUserStatus --------');
  console.log('data =>', data);
  return redishelpers.redis.hset(data.key, data.user_id, JSON.stringify(data.user_status));
};

const getUserStatus = (data) => {
  console.log('----- getUserStatus --------');
  console.log('data =>', data);
  return redishelpers.redis.hget(data.key, data.user_id);
}

const getAllComponent = () => {
  console.log('----- getAllComponent --------');

  const key = util.format("%s:*", key_component_logic);
  return redishelpers.redis.keys(key);
}

const getMyComponent = (data) => {
  console.log('----- getMyComponent --------');
  console.log('data =>', data);
  const key = util.format("%s:%s", key_using_user, data.component_id);
  console.log('key =>', key);

  return redishelpers.redis.sismember(key, data.user_id);
}

// Component사용자에 user_id 추가.
const setMyComponent = (data) => {
  console.log('----- setMyComponent --------');
  console.log('data =>', data);

  const key = util.format("%s:%s", key_using_user, data.component_id);
  console.log('key =>', key);

  return redishelpers.redis.sadd(key, data.user_id);
}

// 컴포넌트에 하위 컴포넌트 or 로직 셋팅
const setComponentLogic = (data) => {
  console.log('----- setComponentLogic --------');
  console.log('data =>', data);

  const key = util.format("%s:%s", key_component_logic, data.target_component);
  console.log('key =>', key);

  return redishelpers.redis.sadd(key, data.logic_list);
}

const getZsetMaxscore = (data) => {
  console.log('----- getZsetMaxscore --------');
  console.log('data =>', data);

  const key = util.format("%s:%s", key_user_info, data.user_id);
  console.log('key =>', key);

  return redishelpers.redis.zrange(key, -1, -1, 'WITHSCORES');
}

const setUserInfo = (data) => {
  console.log('----- setUserInfo --------');
  console.log('data =>', data);

  const key = util.format("%s:%s", key_user_info, data.user_id);
  console.log('key =>', key);

  return redishelpers.redis.zadd(key, data.score, data.user_info);
}

const getUserInfo = (data) => {
  console.log('----- getUserInfo --------');
  console.log('data =>', data);

  const key = util.format("%s:%s", key_user_info, data.user_id);
  console.log('key =>', key);

  return redishelpers.redis.zrangebyscore(key, data.max_score, data.max_score);
}




///////////////////////////////
const setUserComponents = (data) => {
  console.log('----- setUserComponents --------');
  console.log(data);

  const key = util.format("%s:%s:%s", key_component_info, data.user_id, data.page_number);
  console.log('key =>', key);
  return redishelpers.redis.sadd(key, data.component_list);
}

const getUserComponents = (data) => {
  console.log('----- getUserComponents --------');
  console.log(data);

  const key = util.format("%s:%s:%s", key_component_info, data.user_id, data.page_number);
  console.log('key =>', key);
  return redishelpers.redis.smembers(key);
}

const getUserPages = (data) => {
  console.log('----- getUserPages --------');
  console.log(data);

  const key = util.format("%s:%s", key_route_info, data.user_id);
  console.log('key =>', key);
  return redishelpers.redis.zrange(key, 0, -1, "WITHSCORES");
}

const setUserPages = (data) => {
  console.log('----- getUserPages --------');
  console.log(data);

  const key = util.format("%s:%s", key_route_info, data.user_id);
  console.log('key =>', key);
  return redishelpers.redis.zadd(key, data.page_number, data.page_name);
}

const deleteUserComponent = (data) => {
  console.log('----- deleteUserComponent --------');
  console.log(data);

  const key = util.format("%s:%s:%s", key_component_info, data.user_id, data.page_number);
  console.log('key =>', key);
  return redishelpers.redis.del(key);
}

const deleteUserPageByPageNumber = (data) => {
  console.log('----- deleteUserPageByPageNumber --------');
  console.log(data);

  const key = util.format("%s:%s", key_route_info, data.user_id);
  console.log('key =>', key);
  return redishelpers.redis.zremrangebyscore(key, data.page_number, data.page_number);
}

const setComponentLocation = (data) => {
  console.log('----- setComponentLocation --------');
  console.log(data);

  const key = util.format("%s:%s:%s:%s", key_component_location, data.user_id, data.page_name, data.component_info);
  console.log('key =>', key);

  return redishelpers.redis.set(key, data.component_location);
}

const getComponentLocation = (data) => {
  console.log('----- getComponentLocation --------');
  console.log(data);

  const key = util.format("%s:%s:%s", key_component_location, data.user_id, data.page_name, data.component_info);
  console.log('key =>', key);

  return redishelpers.redis.get(key);
}


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
}
// expire test

///////////////////////////////

module.exports = {
  // keys
  key_user_status: key_user_status,
  key_component_logic: key_component_logic,
  key_using_user: key_using_user,
  key_user_info: key_user_info,
  key_component_location: key_component_location,


  // methods
  setUserStatus: setUserStatus,
  getUserStatus: getUserStatus,
  getAllComponent: getAllComponent,
  getMyComponent: getMyComponent,
  setMyComponent: setMyComponent,
  setComponentLogic: setComponentLogic,
  getZsetMaxscore: getZsetMaxscore,
  setUserInfo: setUserInfo,
  getUserInfo: getUserInfo,



  // User Route Page Methods
  setUserComponents: setUserComponents,
  getUserComponents: getUserComponents,
  getUserPages: getUserPages,
  setUserPages: setUserPages,
  deleteUserComponent: deleteUserComponent,
  deleteUserPageByPageNumber: deleteUserPageByPageNumber,
  setComponentLocation: setComponentLocation,
  getComponentLocation: getComponentLocation,




  //key 
  //CHAT 함수 
  addMessage: addMessage,
  createChatRoom : createChatRoom,
  getChatRoomList : getChatRoomList,
  getChatRoomMember :getChatRoomMember,
  joinChatRoom : joinChatRoom,
  leaveChatRoom  : leaveChatRoom,

  // Expire Test
  //expireTest: expireTest,
  setExpireDate: setExpireDate,
}
