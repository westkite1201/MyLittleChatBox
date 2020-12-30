import { observable, action, computed } from "mobx";
import io from "socket.io-client";
import { isEmpty, isNil } from "lodash";
import { Cookies } from "react-cookie";
const cookies = new Cookies();

const chatStore = observable({
  socket: "",
  chatSocket: "",
  socketId: "", //..socketId는 connect 부분 외에 잡히지 않음 따로 변수로 뺴야할듯
  chatMessage: [],
  chatMessageMap: new Map(),
  roomNameList: [],

  socketConnect: false,

  selectRoomId: "", //방리스트에서 클릭시 세팅

  messageInfo: {
    message: "", //채팅 메세지
    roomId: "", // 룸_id
    socketId: "", // 소켓 id 로 구분 함
    userId: "", // 있으면 id, 없으면 null
    userName: "", //
  },
  userInfo: {
    socketId: "",
    userId: "",
    userName: "",
  },
  addPost(data) {
    this.data.push(data);
  },
  get postLength() {
    return this.data.length;
  },
});

//let chatMessageMap = new Map();
export default class ChatStore {
  // 맨 처음 유저 info를 세팅한다
  @action
  initUserInfo = () => {
    let { socketId } = this;
    console.log("[SEO][InitUserInfo] socketId = ", socketId);
    let userInfo = {
      socketId: socketId,
      userId: socketId + "_0",
      userName: this.nicknameMaker(),
    };
    /* 기존 소켓 id가 있다면  */
    /* setting Socket  */
    // Expires Example
    let today = new Date();
    let tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    if (
      cookies.get("socketId") &&
      cookies.get("userId") &&
      cookies.get("userName")
    ) {
      console.log("[SEO] cookies setting!");
      //있으면
      let settingSocketId = cookies.get("socketId");
      let settingUserId = cookies.get("userId");
      let settingUserName = cookies.get("userName");
      cookies.set("socketId", settingSocketId, { expires: tomorrow });
      cookies.set("userId", settingUserId, { expires: tomorrow });
      cookies.set("userName", settingUserName, { expires: tomorrow });
      socketId = settingSocketId;
      userInfo = {
        socketId: settingSocketId,
        userId: settingSocketId + "_0",
        userName: settingUserName,
      };
    } else {
      //없다면 setting
      cookies.set("socketId", socketId, { expires: tomorrow });
      cookies.set("userId", userInfo.userId, { expires: tomorrow });
      cookies.set("userName", userInfo.userName, { expires: tomorrow });
    }
    console.log("[SEO][ COOKIE ] ", cookies.get("socketId"));
    this.userInfo = userInfo;
  };
  //client 방 만들기
  createChatRoom = () => {
    const { userInfo, socketId } = this;
    console.log("[SEO] userInfo ", userInfo);
    let roomId = userInfo.userName + "_" + userInfo.socketId;
    console.log("[SEO] ROOM_ID 1", roomId);
    console.log(
      "[SEO] ROOM_ID 2",
      cookies.get("userName") + "_" + cookies.get("socketId")
    );
    // if (localStorage.getItem('roomId')) {
    //   let settingRoomId = localStorage.getItem('roomId');
    //   localStorage.setItem('roomId',settingRoomId);
    // }else { //없다면 setting
    //   localStorage.setItem('roomId', roomId);
    // }

    let messageInfo = {
      message: "createChatRoom", //채팅 메세지
      roomId: roomId, // 룸_id
      socketId: socketId, // 소켓 id 로 구분 함
      userId: userInfo.userId, // 있으면 id, 없으면 null
      userName: userInfo.userName, //
    };

    console.log("[SEO][createChatRoom] ", messageInfo);
    this.chatSocket.emit("createChatRoom", {
      messageInfo: messageInfo,
    });
    this.selectRoomId = roomId;
  };

  @action
  getChatRoomList = () => {
    console.log("[SEO] getChatRoomList!!!");
    this.chatSocket.emit("getChatRoomList");
  };

  //admin 입장
  @action
  joinChatRoom = (e) => {
    this.leaveChatRoom(this.selectRoomId);
    if (this.selectRoomId !== e.target.name) {
      console.log("[SEO] adminJoinRoom ", e.target.name);
      this.selectRoomId = e.target.name;
      this.chatSocket.emit("joinChatRoom", {
        messageInfo: {
          roomId: e.target.name,
          message: "admin님이 방에 들어왔습니다", //채팅 메세지
          socketId: "system", // 소켓 id 로 구분 함
          userId: null, // 있으면 id, 없으면 null
          userName: "", //
        },
      });

      this.getChatMessage();
    }
  };

  /* 
    leaveRoom 에 대한 정책 필요 함 
    현재 클라이언트는 필요없을 것 같다
    어드민은 해줘야할듯 방 클릭, 다른 방 클릭 했을떄 
    */
  @action
  leaveChatRoom = (roomId) => {
    const { socketId } = this.userInfo;
    this.chatSocket.emit("leaveChatRoom", {
      messageInfo: {
        roomId: roomId,
        message: "admin님이 방에서 나갔습니다.",
        socketId: "system",
        userId: null, // 있으면 id, 없으면 null
        userName: "", //
      },
    });
  };

  /* 테스트용  */
  @action
  getNowjoinedChatRoom = (e) => {
    console.log("[SEO] getNowjoinedChatRoom ");
    this.chatSocket.emit("getNowjoinedChatRoom", "");

    //this.getChatMessage()
  };

  @action
  deleteRedisKey = () => {
    console.log("[SEO] deleteRedisKey");
    this.chatSocket.emit("deleteRedisKey");
  };

  //socketConnection
  @action
  setSocketConnection = () => {
    console.log("[SEO] setSocketConnection hello ");
    if (isEmpty(this.chatSocket)) {
      const chatSocket = io("http://localhost:3031/chat");

      /* connect 되면 userInfo setting 처리   */
      chatSocket.on("connect", () => {
        console.log("[SEO] connect ", chatSocket.id);
        this.socketId = chatSocket.id;
        this.initUserInfo();
        this.socketConnect = true;
        this.createChatRoom();
      });

      this.chatSocket = chatSocket;
      console.log("[SEO] this.chatSocket ", this.chatSocket, chatSocket.id);
      this.chatSocket.on("joinChatRoom", (data) => {
        console.log("[SEO] joinChatRoom ", data.message);
      });
      /* redis connect 
          초기세팅시 이 함수를 통해서 데이터를 로컬에 세팅 함 
          들어갔을때 이 함수를 통해서 message를 가져와야함 

          - 문제  발견 현재 redis 는 그냥 데이터만 들어감 스트링 값만
            근데 이 스트링 값은 밑에 chatMessage 처럼 데이터가 없음
            그래서 누가 보낸건지 모름 
            데이터 저장할때 roomId, socketId,message 를 구분자 줘서 어케 처리해야할듯?
       */
      this.chatSocket.on("getChatMessage", (data) => {
        console.log("[SEO] getChatMessage", data);
        const { chatMessageMap } = this;
        // let mySocketId = localStorage.getItem('socketId')
        const { socketId } = this.userInfo;

        let { messageList } = data;
        console.log("[SEO][getChatMessage] data ", data);
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
          };
          return chatMessage;
        });

        //현재 방에 메세지가 있다면
        if (chatMessageMap.has(selectRoomId)) {
          console.log("[SEO] chatMessageMap has");
          chatMessageMap.set(selectRoomId, messageList);
        } else {
          //처음 세팅
          console.log("[SEO] chatMessageMap has not");
          chatMessageMap.set(selectRoomId, messageList);
        }
        this.selectRoomId = selectRoomId;
      });

      /* message chat  */
      /* serverRecive  */
      this.chatSocket.on("sendChatMessage", (data) => {
        console.log("[SEO] sendChatMessage -> serverRecive ", data);
        const { chatMessageMap } = this;
        // let mySocketId = localStorage.getItem('socketId')
        const { socketId } = this.userInfo;
        let isMe = false;
        if (socketId === data.socketId) {
          //isMe
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
        };
        console.log(
          "[SEO][sendChatMessage ON] chatMessage.roomId ",
          chatMessage.roomId
        );
        //현재 방에 메세지가 있다면
        if (chatMessageMap.has(data.roomId)) {
          console.log("[SEO] chatMessageMap has");
          let tempChatMessageList = [];
          tempChatMessageList = chatMessageMap.get(data.roomId);
          tempChatMessageList.push(chatMessage);
          chatMessageMap.set(data.roomId, tempChatMessageList);
        } else {
          //처음 세팅
          console.log("[SEO] chatMessageMap has not");
          chatMessageMap.set(data.roomId, [chatMessage]);
        }
        this.selectRoomId = data.roomId;
      });
      /* 방 생성  */
      this.chatSocket.on("createChatRoom", (data) => {
        console.log("[SEO][createChatRoom] ->server Response ", data);
      });
      /* 방 리스트 가져오기  */
      this.chatSocket.on("getChatRoomList", (resData) => {
        console.log("[SEO][getChatRoomList] ", resData);
        if (resData.statusCode === 200) {
          this.roomNameList = resData.data;
        }
      });
    }
    return true;
  };

  @observable test = "";

  @action
  sendTest = (message) => {
    this.test = message;
    console.log("sendTest ", this.test);
  };

  @action
  sendChatMessage = (message, userName) => {
    console.log("[SEO] !sendChatMessage!", message);
    let { chatMessageMap, userInfo, selectRoomId } = this;

    if (userName === "ADMIN") {
      //임시
      userInfo.userName = "ADMIN";
      userInfo.userId = "ADMIN";
    }

    //admin만 selectRoomId 가 있을것
    let chatMessage = {
      message: message, //채팅 메세지
      roomId: isNil(selectRoomId)
        ? userInfo.userName + "_" + this.socketId
        : selectRoomId, // 룸_id
      socketId: this.chatSocket.id, // 소켓 id 로 구분 함
      userId: userInfo.userName, // 있으면 id, 없으면 null
      userName: userInfo.userName, //
      isMe: true, // sendMessage 는 무조건 나
    };
    console.log(
      "[SEO][sendChatMessage] chatMessage.roomId ",
      chatMessage.roomId
    );

    //현재 방에 메세지가 있다면
    if (chatMessageMap.has(chatMessage.roomId)) {
      console.log("[SEO] chatMessageMap has");
      let tempChatMessageList = [];
      tempChatMessageList = chatMessageMap.get(chatMessage.roomId);
      tempChatMessageList.push(chatMessage);
      chatMessageMap.set(chatMessage.roomId, tempChatMessageList);
    } else {
      //처음 세팅
      console.log("[SEO] chatMessageMap has not");
      chatMessageMap.set(chatMessage.roomId, [chatMessage]);
    }

    // 서버로 자신의 정보를 전송한다.
    this.chatSocket.emit("sendChatMessage", chatMessage);
  };

  //chat message 가져오기
  @action
  getChatMessage = () => {
    let { userInfo, selectRoomId } = this;
    let chatMessage = {
      message: "", //채팅 메세지
      //roomId : isNil(selectRoomId) ? userInfo.userName + "_" + this.socketId : selectRoomId,   // 룸_id
      roomId: selectRoomId,
      socketId: this.chatSocket.id, // 소켓 id 로 구분 함
      userId: userInfo.userName, // 있으면 id, 없으면 null
      userName: userInfo.userName, //
      //isMe : true // sendMessage 는 무조건 나
    };
    console.log("[SEO] getChatMessage client -> server ", chatMessage);
    this.chatSocket.emit("getChatMessage", chatMessage);
  };
}
