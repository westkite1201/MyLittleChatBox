const _ = require('lodash');
const userRedis = require('../model/redis/redisDao');
const helpers = require('../lib/helpers');
const ADMIN_IN_ROOM_MSG = 'ADMIN님이 방에 입장하였습니다.';
const ADMIN_LEAVE_ROOM_MSG = 'ADMIN님이 방에서 나갔습니다. ';
const moment = require('moment-timezone');
moment.tz.setDefault('Asia/Seoul');
let roomId = '';
let socketId = '';
var admins = [];
let chatSocket;
function adminUpdate() {
  admins.forEach(function (value, index, ar) {
    admins[index].emit('update', { message: 'update' });
  });
}
const connection = (io) => {
  const namespaceChat = io.of('/chat');
  //test
  const namespaceChatAdmin = io.of('/admin');
  namespaceChatAdmin.on('connection', function (socket) {
    admins.push(socket);
    socket.on('update', (data) => {});
  });

  namespaceChat.on('connection', function (socket) {
    console.log('socket connection complete , Socket id =>', socket.id);
    console.log('socket', socket.rooms);
    socket.on('disconnect', (reason) => {
      console.log('socket => disconnect ', reason);
    });

    socket.on('deleteRedisKey', () => {
      userRedis.deleteRedisKey();
    });
    //방 가져오기
    socket.on('getChatRoomList', async (data) => {
      try {
        let roomList = await userRedis.getChatRoomList(data);
        //console.log("roomList ", roomList);
        let messageInfo = data.messageInfo;
        //console.log("messageiNFO ", messageInfo);
        //해당 방에 총 몇개가 쌓여있는지
        //한번메세지가 올떄마다 이루틴을 반복해야한다는게
        //오버헤드가 클꺼같음.;
        let roomsData = await roomList.reduce(async (promise, cur) => {
          let result = await promise.then(); // 누산기 프로미스 풀고 설정
          let roomIdAnddUserId = cur.split(':');

          let roomId = roomIdAnddUserId[0];
          let userId = roomIdAnddUserId[1];
          //누산값 재정리
          let value = await userRedis.getChatMessageCount(
            messageInfo.socketId,
            roomId,
          );
          let allandReadCountInfo = value.split(':');
          let res = {
            roomId: roomId,
            userId: userId,
            allMessageCount: allandReadCountInfo[0],
            readCount: allandReadCountInfo[1],
          };
          result.push(res);
          //리턴
          return Promise.resolve(result);
        }, Promise.resolve([])); //프로미스 초기값 선언

        socket.join(roomId); // ADMIN 방에 입장후
        socket.emit(
          'getChatRoomList',
          helpers.returnStatusCode(true, roomsData),
        );
      } catch (e) {
        console.log('error', e);
        socket.join(roomId); // ADMIN 방에 입장후
        socket.emit('getChatRoomList', helpers.returnStatusCode(false, [], e));
      }
    });
    /* message INFO 넣ㄱ ㅣ */
    //방 들어가기
    socket.on('joinChatRoom', (data) => {
      let messageInfo = data.messageInfo;
      const { roomId } = messageInfo;

      userRedis.joinChatRoom(messageInfo);
      //userRedis.addMessage(messageInfo);
      socket.join(roomId); //socketJoin
      socket.emit('joinChatRoom', { message: socket.rooms });
      /* 시스템 메세지  */
      socket.to(roomId).emit('sendChatMessage', {
        system: true,
        roomId: roomId,
        message: ADMIN_IN_ROOM_MSG,
      });
    });
    //방 나가기
    socket.on('leaveChatRoom', async (data) => {
      console.log('leaveChatRoom ', data);
      let messageInfo = data.messageInfo;
      const { roomId } = messageInfo;
      socket.to(roomId).emit('sendChatMessage', {
        system: true,
        roomId: roomId,
        message: ADMIN_LEAVE_ROOM_MSG,
      });
      socket.leave(roomId); //socketLeav
      //userRedis.addMessage(messageInfo);
      await userRedis.leaveChatRoom(messageInfo);
      console.log('rooms@@@@@@@@@@@@@@@', socket.rooms);
    });

    //방만들고 방에 들어가기
    socket.on('createChatRoom', function (data) {
      roomId = data.messageInfo.roomId;
      userRedis.joinChatRoom(data.messageInfo);
      let response = userRedis.createChatRoom(data);
      socket.join(roomId);
      socket.to(roomId).emit('createChatRoom', { response: response });
    });

    socket.on('getChatRoomMember', function (data) {
      let roomMembers = userRedis.getChatRoomMember(data);
    });

    socket.on('sendChatMessage', async (data) => {
      console.log('sendChatMessage ', socket.rooms);
      let messageInfo = {
        message: data.message, //채팅 메세지
        roomId: data.roomId, // 룸_id
        socketId: data.socketId, // 소켓 id 로 구분 함
        userId: data.userName, // 있으면 id, 없으면 null
        userName: data.userName, //
        sendTime: moment().format('YYYY-MM-DD-HH-mm-ss'),
      };

      //동기로 변경
      await userRedis.addMessage(messageInfo);
      //방에 있는 전원 setIndex 진행해야함
      let members = await userRedis.getChatRoomMember(messageInfo);
      for (let i = 0; i < members.length; i++) {
        let messageInfoTemp = {
          roomId: data.roomId, // 룸_id
          socketId: data.socketId, // 소켓 id 로 구분 함
        };
        messageInfoTemp.socketId = members[i];
        await userRedis.setReadIndex(messageInfoTemp);
      }
      socket.join(messageInfo.roomId);
      socket.to(messageInfo.roomId).emit('sendChatMessage', messageInfo);

      adminUpdate();
    });

    //방 메세지 가져오기
    socket.on('getChatMessage', async (data) => {
      let messageInfo = {
        roomId: data.roomId, // 룸_id
      };
      let messageList = await userRedis.getChatMessage(messageInfo);

      messageList = messageList.map((item) => {
        messageInfoAssemble = item.split(':');
        let messageInfoTemp = {
          message: messageInfoAssemble[1], //채팅 메세지
          roomId: messageInfoAssemble[2], // 룸_id
          socketId: messageInfoAssemble[3], // 소켓 id 로 구분 함
          userId: messageInfoAssemble[4], // 있으면 id, 없으면 null
          userName: messageInfoAssemble[5], //
          sendTime: messageInfoAssemble[6],
        };
        return messageInfoTemp;
      });

      //console.log('[SEO] getChatMessage messageList', messageList);
      socket.join(messageInfo.roomId);
      adminUpdate();
      //socket.to(messageInfo.roomId).emit('getChatMessage', { messageList : messageList })
      namespaceChat
        .to(messageInfo.roomId)
        .emit('getChatMessage', { messageList: messageList });
    });
    socket.on('disconnect', function () {
      //REDIS 삭제
      socket.leave(roomId); //socketLeave
      //socket.broadcast.emit('disconnect', { data: 'disconnect' });
    });

    socket.on('getNowjoinedChatRoom', () => {});

    socket.on('deleteChatRoom', async (value) => {
      await userRedis.deleteChatRoom(value);
    });
  });
};
module.exports = {
  connection: connection,
};
