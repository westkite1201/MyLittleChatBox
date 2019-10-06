const redishelpers = require('./redis');
const util = require('util');
const _  = require('lodash')

const key_user_status = 'skb-user-status';

const key_component_logic = 'Component_Logic_Info';
const key_using_user = 'Component_Using_User';
const key_user_info = 'User_Info';
const key_component_location = 'Component_Location_Info';

const key_route_info = 'RouteInfo';
const key_component_info = 'ComponentInfo';

const KEY_ROOM =  'CHAT_ROOM'
const KEY_MESSAGE = 'CHAT_MESSAGE'

const returnStatusCode = async(successYn, data ) => {
  if(_.isNil(data)){
    data = ''
  }

  let res = await successYn;
 // console.log("res" , res)
  data = res;
  let statusInfo = {
    message : '',
    statusCode : '',
    data : data
  }
  if( successYn ){
    statusInfo.message = "suceess"
    statusInfo.statusCode = 200
  }else{
     statusInfo.message = "error"
     statusInfo.statusCode = 400
  }
  //console.log("status", statusInfo)
  return statusInfo;
}


//message add 
const addMessage = (messageInfo) => {
  console.log("[SEO][redisDao]   messageInfo ", messageInfo)
  const key = util.format("%s:%s:%s", KEY_MESSAGE, messageInfo.roomId, messageInfo.socketId);
  let message = messageInfo.message;
  console.log("[SEO][redisDao] key , message", key, message)
  return redishelpers.redis.rpush(key, message);
}

//message add 
const getChatMessage = (messageInfo) => {
  console.log("[SEO][redisDao]   messageInfo ", messageInfo)
  const key = util.format("%s:%s:%s", KEY_MESSAGE, messageInfo.roomId, messageInfo.socketId);
  //let message = messageInfo.message;
  console.log("[SEO][redisDao] key , message", key, message)
  return redishelpers.redis.lrange(key, 10);
}
/* chatRoom 생성  */
/* set 중복없는 value 값  */
/* key = roomId + socketId */
/* value socketId */
const createChatRoom = (data) => {
  const key = util.format("%s", KEY_ROOM);
  //console.log("[SEO][createChatRoom] ",data.messageInfo.roomId)
  return  returnStatusCode( redishelpers.redis.sadd(key, data.messageInfo.roomId))// roomList를 위해
}


const getChatRoomList  = async() => {
  const key = util.format("%s", KEY_ROOM);
  //console.log("getChatRoomList", key)
  let resdata =  await returnStatusCode(redishelpers.redis.smembers(key))
  //console.log("getChatRoomList2 ", resdata)
  return resdata;
}

/* 방에 들어가기  */
const joinChatRoom = (messageInfo) => {
  const key = util.format("%s:%s", KEY_ROOM, messageInfo.roomId);
  redishelpers.redis.sadd(key, messageInfo.socketId);
}
/* 방에서 나가기  */
/*  socketId에 해당되는 값 제거  */
const leaveChatRoom  = (messageInfo) => {
  const key = util.format("%s:%s", KEY_ROOM, messageInfo.roomId);
  let socketId = data.socketId;
  redishelpers.redis.srem(key, socketId);
  
  let memberCount = getChatRoomMember(messageInfo)
  if( memberCount === 0 ){
    distroyRoom();
  }
}

/*해당 room 제거  */
const distroyRoom = (messageInfo) => {
  redishelpers.redis.srem(KEY_ROOM, messageInfo.roomId);
}


/* 채팅방 멤버수 구하기  */
const getChatRoomMember  = (messageInfo) => {
  const key = util.format("%s:%s", KEY_ROOM, messageInfo.roomId);
  return redishelpers.redis.smembers(key);
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
  getChatMessage : getChatMessage,
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
