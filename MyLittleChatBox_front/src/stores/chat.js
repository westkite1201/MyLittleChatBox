import { observable, action, computed } from "mobx";
import io from "socket.io-client";
import { isEmpty } from "lodash";
import { thisTypeAnnotation } from "@babel/types";
let chatMessageMap = new Map();
export default class ChatStore {
  @observable socket = "";
  @observable chatSocket = "";
  @observable socketId = ""; //..socketId는 connect 부분 외에 잡히지 않음 따로 변수로 뺴야할듯 
  @observable chatMessage = [];
  //@observable chatMessageMap = new Map();
  @observable roomNameList = [];

  @observable socketConnect = false;

  @observable messageInfo = 
  {  
        message : '',  //채팅 메세지 
        roomId : '',   // 룸_id 
        socketId : '', // 소켓 id 로 구분 함  
        userId : '',// 있으면 id, 없으면 null
        userName : '', //
    }
  @observable userInfo = {
      socketId : '',
      userId : '',
      userName : '',
  }
  
  //닉네임 만들기 
  nicknameMaker = () => {
    let firstNameList = ['못되먹은','착해빠진','심술궂은'] ;
    let secondNameList = ['상어','오징어','구렁이']
    let first = Math.floor(Math.random() * firstNameList.length - 1 ) + 1;
    let second = Math.floor(Math.random() * firstNameList.length -1 ) + 1;
    return firstNameList[first] + " " + secondNameList[second]
  }
  // 맨 처음 유저 info를 세팅한다 
  @action 
  initUserInfo = () =>{
    const { socketId } = this; 
    console.log("[SEO][InitUserInfo] socketId = ", socketId)
    let userInfo ={
        socketId : socketId,
        userId : socketId + "_0",
        userName : this.nicknameMaker(),
    }
    /* 기존 소켓 id가 있다면  */
    if(localStorage.getItem('socketId')){
      let settingSocketId= localStorage.getItem('socketId');
      localStorage.setItem('socketid',settingSocketId);
    }else{ //없다면 setting
      localStorage.setItem('socketid', socketId);
    }
    this.userInfo = userInfo;
  }
  //client 방 만들기 
  createChatRoom = () => {
    const { userInfo, 
            socketId } = this;  
    let roomId = socketId + "_" + userInfo.userId;
  
    let messageInfo = 
    {  
          message : 'createChatRoom',  //채팅 메세지 
          roomId : roomId,   // 룸_id 
          socketId : socketId, // 소켓 id 로 구분 함  
          userId : userInfo.userId,// 있으면 id, 없으면 null
          userName :userInfo.userName, //
    }
    console.log("[SEO][createChatRoom] ", messageInfo)
    this.chatSocket.emit("createChatRoom", {
        messageInfo : messageInfo
    });
  }
  //joinRoom , 입장함
  //현재는 admin만 입장 가능함

  @action
  joinRoom = () => {
    this.chatSocket.emit("clientJoinRoom", {
    });
  };



  @action
  getChatRoomList = () => {
    console.log("[SEO] getChatRoomList!!!");
    this.chatSocket.emit("getChatRoomList", );
  };
  //admin 입장
  @action
  adminJoinRoom = roomName => {
    console.log("adminJoinRoom!!");
    if (chatMessageMap.has(roomName)) {
      let chatMessage1 = chatMessageMap.get(roomName);
      console.log("chatMessage1!!", chatMessage1);
      this.chatMessage = chatMessage1;
    } else {
      this.chatMessage = [];
    }

    this.chatSocket.emit("adminJoinRoom", {
      roomName: roomName
    });
  };
  //socketConnection
  @action
  setSocketConnection = () => {
    console.log("[SEO] setSocketConnection hello ");
    if (isEmpty(this.chatSocket)) {
      const chatSocket = io("http://localhost:3031/chat");

      /* connect 되면 userInfo setting 처리   */
      chatSocket.on('connect', () => {
          console.log("[SEO] connect " , chatSocket.id)
          this.socketId = chatSocket.id;
          this.initUserInfo();
          this.socketConnect = true;
          this.createChatRoom();
       });
     
      this.chatSocket = chatSocket;
      console.log("[SEO] this.chatSocket " , this.chatSocket, chatSocket.id);
    
    //   // 서버로부터의 메시지가 수신되면
      this.chatSocket.on("getChatMessage", data => {
        console.log("[SEO] getChatMessage !!!", data);
        let messageInfo = data.messageInfo;
        let isMe = false;
        if (messageInfo.userName === "ADMIN") {
          isMe = true;
        }
        this.chatMessage.push({
          userName: messageInfo.userName,
          room: messageInfo.roomId,
          message: messageInfo.message,
          isMe: isMe
        });

        console.log("data.room", data.roomId);
        console.log(
          "chatMessageMap.get(data.room) ",
          chatMessageMap.get(data.roomId)
        );

        // 저장
        if (chatMessageMap.has(data.roomId)) {
          let temp = [];
          temp = chatMessageMap.get(data.roomId);
          temp.push({
            userName: messageInfo.userName,
            room: data.roomId,
            message: data.message,
            isMe: isMe
          });
          // console.log(data)yarn
          chatMessageMap.set(data.roomId, temp);
        } else {
          console.log("else");
          let temp = {
            userName: messageInfo.userName,
            room: data.roomId,
            message: data.message,
            isMe: isMe
          };
          chatMessageMap.set(data.roomId, [temp]);
        }
      });
      this.chatSocket.on('createChatRoom', data =>{
        console.log('[SEO][createChatRoom] ' , data)
      })

      this.chatSocket.on("getChatRoomList", data => {
        console.log("[SEO][getChatRoomList] ",data)
        
      });

    //   this.chatSocket.on("getChatRoomList", data => {
    //     this.roomNameList = data.roomNameList;
    //     console.log(data.roomNameList);
    //   });

    //   this.chatSocket.emit("disconnect", {
    //     nickName: "fsdfds",
    //     room: "all"
    //   });

    //   //시스템 메세지일때
    //   this.chatSocket.on("system", data => {
    //     this.chatMessage.push({
    //       nickName: data.nickName,
    //       room: data.room,
    //       msg: data.msg,
    //       system: true
    //     });

    //     // 저장
    //     if (chatMessageMap.has(data.room)) {
    //       let temp = [];
    //       temp = chatMessageMap.get(data.room);
    //       temp.push({
    //         nickName: data.nickName,
    //         room: data.room,
    //         msg: data.msg,
    //         system: true
    //       });
    //       // console.log(data)
    //       chatMessageMap.set(data.room, temp);
    //     } else {
    //       console.log("else");
    //       let temp = {
    //         nickName: data.nickName,
    //         room: data.room,
    //         msg: data.msg,
    //         system: true
    //       };
    //       chatMessageMap.set(data.room, [temp]);
    //     }
    //   });
    }
    return true;
  };

  @action
  sendChatMessage = (message, userName) => {
    console.log("!sendChatMessage!");

    // 서버로 자신의 정보를 전송한다.
    this.chatSocket.emit("sendChatMessage", {
      message: message, //채팅 메세지
      roomId: "hello", // 룸_id
      socketId: this.chatSocket.id, // 소켓 id 로 구분 함
      userId: userName, // 있으면 id, 없으면 null
      userName: userName //
    });
  };
}
