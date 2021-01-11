import { observable, configure } from 'mobx';
import io from 'socket.io-client';
import { isEmpty, isNil } from 'lodash';
import { Cookies } from 'react-cookie';
import { storeContext } from './Context';
import { nicknameMaker, makeRoomId, makeTimeFormat } from '../lib/helpers';
import moment from 'moment-timezone';
moment.tz.setDefault('Asia/Seoul');
configure({
  enforceActions: 'never',
});
const cookies = new Cookies();

const chatStore = observable({
  socket: '',
  chatSocket: '',
  adminChatSocket: '',
  socketId: '', //..socketId는 connect 부분 외에 잡히지 않음 따로 변수로 뺴야할듯
  chatMessage: [],
  chatMessageMap: new Map(),
  roomNameList: [],

  socketConnect: false,

  selectRoomId: '', //방리스트에서 클릭시 세팅

  messageInfo: {
    message: '', //채팅 메세지
    roomId: '', // 룸_id userInfo.userName + '_' + userInfo.socketId;
    socketId: '', // 소켓 id 로 구분 함
    userId: '', // 있으면 id, 없으면 null
    userName: '', //
    isMe: '',
    isSystem: '',
  },
  userInfo: {
    socketId: '',
    userId: '',
    userName: '',
  },
  addPost(data) {
    this.data.push(data);
  },
  get getRoomNameList() {
    return this.roomNameList;
  },
  get postLength() {
    return this.data.length;
  },
  initUserInfo(socketId, userId = 'ADMIN') {
    console.log('[SEO][InitUserInfo] socketId = ', socketId, userId);
    let userInfo = {
      socketId: socketId,
      userId: userId,
      userName: nicknameMaker(),
    };
    /* 기존 소켓 id가 있다면  */
    /* setting Socket  */
    // Expires Example
    let today = new Date();
    let tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    //쿠기가 세팅이 되어있다면
    // if (
    //   cookies.get('socketId') &&
    //   cookies.get('userId') &&
    //   cookies.get('userName')
    // ) {
    //   console.log('[SEO] cookies setting!');
    //   //있으면
    //   let settingSocketId = cookies.get('socketId');
    //   let settingUserId = cookies.get('userId');
    //   let settingUserName = cookies.get('userName');
    //   cookies.set('socketId', settingSocketId, { expires: tomorrow });
    //   cookies.set('userId', settingUserId, { expires: tomorrow });
    //   cookies.set('userName', settingUserName, { expires: tomorrow });
    //   socketId = settingSocketId;
    //   userInfo = {
    //     socketId: settingSocketId,
    //     userId: settingSocketId + '_0',
    //     userName: settingUserName,
    //   };
    // } else {
    //없다면 setting
    // cookies.set('socketId', socketId, { expires: tomorrow });
    // cookies.set('userId', userInfo.userId, { expires: tomorrow });
    // cookies.set('userName', userInfo.userName, { expires: tomorrow });
    // }
    this.userInfo = userInfo;
  },
  //client 방 만들기
  createChatRoom() {
    const { userInfo, socketId } = this;
    let roomId = makeRoomId(userInfo);
    console.log('createChatRoom', userInfo);
    // console.log('[SEOYEON] roomid ', roomId);
    let messageInfo = {
      message: 'createChatRoom', //채팅 메세지
      roomId: roomId, // 룸_id
      socketId: socketId, // 소켓 id 로 구분 함
      userId: userInfo.userId, // 있으면 id, 없으면 null
      userName: userInfo.userName, //
    };

    this.chatSocket.emit('createChatRoom', {
      messageInfo: messageInfo,
    });

    this.selectRoomId = roomId;
  },

  getChatRoomList(adminId = 'ADMIN') {
    const { userInfo } = this;
    let roomId = makeRoomId(userInfo);
    this.chatSocket.emit('getChatRoomList', {
      messageInfo: {
        roomId: roomId,
        message: 'getChatRoomList',
        socketId: this.chatSocket.id,
        userId: adminId, // 있으면 id, 없으면 null
        userName: '', //
      },
    });
  },

  /* 
      leaveRoom 에 대한 정책 필요 함 
      현재 클라이언트는 필요없을 것 같다
      어드민은 해줘야할듯 방 클릭, 다른 방 클릭 했을떄 
  */

  leaveChatRoom(roomId) {
    this.chatSocket.emit('leaveChatRoom', {
      messageInfo: {
        roomId: roomId,
        message: 'admin님이 방에서 나갔습니다.',
        socketId: this.socketId,
        userId: 'admin', // 있으면 id, 없으면 null
        userName: 'admin', //
      },
    });
  },

  //admin 입장
  joinChatRoom(roomid) {
    if (this.selectRoomId !== roomid) {
      this.leaveChatRoom(this.selectRoomId);
      this.selectRoomId = roomid;
      this.chatSocket.emit('joinChatRoom', {
        messageInfo: {
          roomId: roomid,
          message: 'admin님이 방에 들어왔습니다', //채팅 메세지
          socketId: this.socketId, // 소켓 id 로 구분 함
          userId: 'admin', // 있으면 id, 없으면 null
          userName: 'admin', //
        },
      });
      this.getChatMessage();
    }
  },

  /* 테스트용  */
  getNowjoinedChatRoom(e) {
    // console.log('[SEO] getNowjoinedChatRoom ');
    this.chatSocket.emit('getNowjoinedChatRoom', '');

    //this.getChatMessage()
  },

  deleteRedisKey() {
    // console.log('[SEO] deleteRedisKey');
    this.chatSocket.emit('deleteRedisKey');
  },
  deleteChatRoom(value) {
    this.chatSocket.emit('deleteChatRoom', value);
  },
  //socketConnection
  setSocketConnection(inputUserId, isAdmin) {
    if (isEmpty(this.chatSocket)) {
      const chatSocket = io('http://localhost:3031/chat');
      //이 소켓은 admin 일경우 뚫기
      //로그인 및 권한 설정 추가 필요
      if (isAdmin) {
        const adminSocket = io('http://localhost:3031/admin');
        adminSocket.on('connect', () => {
          this.adminChatSocket = adminSocket;
          this.adminChatSocket.on('update', () => {
            this.getChatRoomList();
          });
        });
      }

      /* connect 되면 userInfo setting 처리   */
      chatSocket.on('connect', () => {
        this.socketId = chatSocket.id; //chatSocket id 세팅
        this.initUserInfo(chatSocket.id, inputUserId);
        this.socketConnect = true;
        if (!isAdmin) {
          this.createChatRoom();
        }
      });
      chatSocket.on('disconnect', function () {
        // console.log('[SEOYEON] disconnect client event....');
      });

      this.chatSocket = chatSocket; //chatSocket setting

      /* chat room join */
      this.chatSocket.on('joinChatRoom', (data) => {
        // console.log('[SEO] joinChatRoom -> server Response', data.message);
      });

      this.chatSocket.on('getChatMessage', (data) => {
        // console.log('[SEOYEON] getChatMessage -> server Response', data);
        const { chatMessageMap } = this;
        const { socketId } = this.userInfo;

        let { messageList } = data;
        if (isEmpty(messageList)) {
          //아무것도없으면 할일없음
          return;
        }
        let selectRoomId = messageList[0].roomId;
        messageList = messageList.map((item) => {
          let isMe = false;
          if (socketId === item.socketId) {
            //isMe
            isMe = true;
          }
          let chatMessage = {
            message: item.message, //채팅 메세지
            roomId: item.roomId, // 룸_id
            socketId: item.socketId, // 소켓 id 로 구분 함
            userId: item.userName, // 있으면 id, 없으면 null
            userName: item.userName, //
            isMe: isMe,
            sendTime: makeTimeFormat(item.sendTime),
          };
          return chatMessage;
        });

        //현재 방에 메세지가 있다면
        if (chatMessageMap.has(selectRoomId)) {
          // console.log('[SEO] chatMessageMap has');
          chatMessageMap.set(selectRoomId, messageList);
        } else {
          //처음 세팅
          // console.log('[SEO] chatMessageMap has not');
          chatMessageMap.set(selectRoomId, messageList);
        }
        //this.selectRoomId = selectRoomId;
      });

      /* message chat  */
      /* serverRecive  */
      this.chatSocket.on('sendChatMessage', (data) => {
        // console.log('[SEO] sendChatMessage -> serverRecive ', data);
        const { chatMessageMap } = this;
        // let mySocketId = localStorage.getItem('socketId')
        const { socketId } = this.userInfo;
        let isMe = false;
        if (socketId === data.socketId) {
          isMe = true;
        }

        let chatMessage = {
          message: data.message, //채팅 메세지
          roomId: data.roomId, // 룸_id
          socketId: data.system ? null : data.socketId, // 소켓 id 로 구분 함
          userId: data.system ? null : data.userName, // 있으면 id, 없으면 null
          userName: data.system ? null : data.userName, //
          isMe: isMe,
          system: data.system ? true : false,
          sendTime: makeTimeFormat(data.sendTime),
        };

        //현재 방에 메세지가 있다면
        if (chatMessageMap.has(data.roomId)) {
          let tempChatMessageList = [];
          tempChatMessageList = chatMessageMap.get(data.roomId);
          tempChatMessageList.push(chatMessage);
          chatMessageMap.set(data.roomId, tempChatMessageList);
        } else {
          //처음 세팅
          chatMessageMap.set(data.roomId, [chatMessage]);
        }
        //this.selectRoomId = data.roomId;
      });

      /* 방 생성  */
      this.chatSocket.on('createChatRoom', (data) => {
        console.log('[SEOYEON][createChatRoom] -> server Response ', data);
      });

      /* 방 리스트 가져오기  */
      this.chatSocket.on('getChatRoomList', (resData) => {
        if (resData.statusCode === 200) {
          console.log('getChatRoomList ', resData.data);
          this.roomNameList = resData.data;
        }
      });
    }
    return true;
  },

  test: '',
  sendTest(message) {
    this.test = message;
    // console.log('sendTest ', this.test);
  },

  /*
    client -> server 
    채팅 메시지 보내기
  */
  sendChatMessage(message, userName) {
    let { chatMessageMap, userInfo, selectRoomId } = this;
    console.log('[SEO] !sendChatMessage!', message, userInfo);
    //admin일 경우
    //임시
    if (userName === 'ADMIN') {
      userInfo.userName = 'ADMIN';
      userInfo.userId = 'ADMIN';
    }

    let chatMessage = {
      message: message, //채팅 메세지
      roomId: selectRoomId,
      socketId: this.chatSocket.id, // 소켓 id 로 구분 함
      userId: userInfo.userId, // 있으면 id, 없으면 null
      userName: userInfo.userName, //
      isMe: true, // sendMessage 는 무조건 나
      sendTime: moment().format('HH시 mm분'),
    };

    //현재 방에 메세지가 있다면
    if (chatMessageMap.has(chatMessage.roomId)) {
      // console.log('[SEO] chatMessageMap has');
      let tempChatMessageList = [];
      tempChatMessageList = chatMessageMap.get(chatMessage.roomId);
      tempChatMessageList.push(chatMessage);
      chatMessageMap.set(chatMessage.roomId, tempChatMessageList);
    } else {
      //처음 세팅
      // console.log('[SEO] chatMessageMap has not');
      chatMessageMap.set(chatMessage.roomId, [chatMessage]);
    }
    // 서버로 자신의 정보를 전송한다.
    this.chatSocket.emit('sendChatMessage', chatMessage);
  },

  //chat message 가져오기
  getChatMessage() {
    let { userInfo, selectRoomId } = this;
    let chatMessage = {
      message: '', //채팅 메세지
      roomId: selectRoomId,
      socketId: this.chatSocket.id, // 소켓 id 로 구분 함
      userId: userInfo.userName, // 있으면 id, 없으면 null
      userName: userInfo.userName, //
      //isMe : true // sendMessage 는 무조건 나
    };
    this.chatSocket.emit('getChatMessage', chatMessage);
  },
});

export default chatStore;
