import { observable, action, computed } from "mobx";
import io from "socket.io-client";
import { isEmpty, isNil } from "lodash";
import { Cookies } from 'react-cookie'
const cookies = new Cookies();
//let chatMessageMap = new Map();
export default class ChatStore {
  @observable socket = "";
  @observable chatSocket = "";
  @observable socketId = ""; //..socketId는 connect 부분 외에 잡히지 않음 따로 변수로 뺴야할듯 
  @observable chatMessage = [];
  @observable chatMessageMap = new Map();
  @observable roomNameList = [];

  @observable socketConnect = false;

  @observable selectRoomId = '' //방리스트에서 클릭시 세팅 

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
    let firstNameList = ['못되먹은','착해빠진','심술궂은', '징징대는'] ;
    let secondNameList = ['상어','오징어','구렁이','핑핑이']
    let first = Math.floor(Math.random() * firstNameList.length - 1 ) + 1;
    let second = Math.floor(Math.random() * firstNameList.length -1 ) + 1;
    return firstNameList[first] + " " + secondNameList[second]
  }
  // 맨 처음 유저 info를 세팅한다 
  @action 
  initUserInfo = () =>{
    let { socketId } = this; 
    console.log("[SEO][InitUserInfo] socketId = ", socketId)
    let userInfo = {
        socketId : socketId,
        userId : socketId + "_0",
        userName : this.nicknameMaker(),
    }
    /* 기존 소켓 id가 있다면  */
    /* setting Socket  */
    // Expires Example
    let today = new Date();
    let tomorrow = new Date();
    tomorrow.setDate(today.getDate()+1);
    if(cookies.get('socketId') && cookies.get('userId') && cookies.get('userName')) { //있으면
      let settingSocketId = cookies.get('socketId');
      cookies.set('socketId',settingSocketId, { expires: tomorrow });
      cookies.set('userId',userInfo.userId, { expires: tomorrow });
      cookies.set('userName',userInfo.userName, { expires: tomorrow });
      socketId = settingSocketId;
    }else{ //없다면 setting
      cookies.set('socketId', socketId, { expires: tomorrow });
      cookies.set('userId',userInfo.userId, { expires: tomorrow });
      cookies.set('userName',userInfo.userName, { expires: tomorrow });
    }
    console.log("[SEO][ COOKIE ] ", cookies.get('socketId')) 
    this.userInfo = userInfo;
  }
  //client 방 만들기 
  createChatRoom = () => {
    const { userInfo, 
            socketId } = this;  
    let roomId =  userInfo.userName + "_" + socketId ;
  
    if (localStorage.getItem('roomId')) {
      let settingRoomId = localStorage.getItem('roomId');
      localStorage.setItem('roomId',settingRoomId);
    }else { //없다면 setting
      localStorage.setItem('roomId', roomId);
    }

    let messageInfo = 
    {  
          message : 'createChatRoom',  //채팅 메세지 
          roomId : roomId,   // 룸_id 
          socketId : socketId, // 소켓 id 로 구분 함  
          userId : userInfo.userId,// 있으면 id, 없으면 null
          userName : userInfo.userName, //
    }

    console.log("[SEO][createChatRoom] ", messageInfo)
    this.chatSocket.emit("createChatRoom", {
        messageInfo : messageInfo
    });
    this.selectRoomId = roomId;
  }
  /* leaveRoom 에 대한 정책 필요 함  */
  @action
  leaveRoom = () => {
    
  }


  @action
  getChatRoomList = () => {
    console.log("[SEO] getChatRoomList!!!");
    this.chatSocket.emit("getChatRoomList", );
  };

  //admin 입장
  @action
  joinChatRoom = e => {
    console.log("[SEO] adminJoinRoom " , e.target.name)
    this.selectRoomId = e.target.name;
    this.chatSocket.emit('joinChatRoom', { messageInfo: { roomId : e.target.name}})
    
    //this.getChatMessage()
  };

  @action
  deleteRedisKey = () => {
    console.log("[SEO] deleteRedisKey" )
    this.chatSocket.emit('deleteRedisKey')
  }

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
      this.chatSocket.on("joinChatRoom", data =>{
         console.log("[SEO] joinChatRoom ", data.message)
       })
       /* redis connect 
          초기세팅시 이 함수를 통해서 데이터를 로컬에 세팅 함 
          들어갔을때 이 함수를 통해서 message를 가져와야함 
       */
       this.chatSocket.on("getChatMessage", data => {
          console.log("[SEO] getChatMessage" , data)
          const {chatMessageMap} = this;
          // let mySocketId = localStorage.getItem('socketId')
           const { socketId } = this.userInfo;
           let isMe = false;
           if( socketId === data.socketId){ //isMe
               isMe = true;
           }
   
           let chatMessage = {
             message : data.message,  //채팅 메세지 
             roomId : data.roomId,   // 룸_id 
             socketId :  data.socketId, // 소켓 id 로 구분 함  
             userId : data.userName,// 있으면 id, 없으면 null
             userName : data.userName, //
             isMe : isMe
           }
           
           //현재 방에 메세지가 있다면 
           if (chatMessageMap.has(data.roomId)) {
             console.log('[SEO] chatMessageMap has')
             let tempChatMessageList = [];
             tempChatMessageList = chatMessageMap.get(data.roomId);
             tempChatMessageList.push(chatMessage)
             chatMessageMap.set(data.roomId, tempChatMessageList);
           } 
           else { //처음 세팅 
             console.log('[SEO] chatMessageMap has not')
             chatMessageMap.set(data.roomId, [chatMessage]);
           }
           this.selectRoomId = data.roomId

       });

      /* message chat  */
      /* serverRecive  */
      this.chatSocket.on("sendChatMessage" , data =>{
        console.log("[SEO] sendChatMessage -> serverRecive " , data)
        const {chatMessageMap} = this;
       // let mySocketId = localStorage.getItem('socketId')
        const { socketId } = this.userInfo;
        let isMe = false;
        if( socketId === data.socketId){ //isMe
            isMe = true;
        }

        let chatMessage = {
          message : data.message,  //채팅 메세지 
          roomId : data.roomId,   // 룸_id 
          socketId :  data.socketId, // 소켓 id 로 구분 함  
          userId : data.userName,// 있으면 id, 없으면 null
          userName : data.userName, //
          isMe : isMe
        }
        
        //현재 방에 메세지가 있다면 
        if (chatMessageMap.has(data.roomId)) {
          console.log('[SEO] chatMessageMap has')
          let tempChatMessageList = [];
          tempChatMessageList = chatMessageMap.get(data.roomId);
          tempChatMessageList.push(chatMessage)
          chatMessageMap.set(data.roomId, tempChatMessageList);
        } 
        else { //처음 세팅 
          console.log('[SEO] chatMessageMap has not')
          chatMessageMap.set(data.roomId, [chatMessage]);
        }
        this.selectRoomId = data.roomId


      });
      /* 방 생성  */
      this.chatSocket.on('createChatRoom', data => {
        console.log('[SEO][createChatRoom] ->server Response ' , data)
      })
      /* 방 리스트 가져오기  */
      this.chatSocket.on("getChatRoomList", resData => {
        console.log("[SEO][getChatRoomList] ",resData)
        if( resData.statusCode === 200){
          this.roomNameList = resData.data
        }
      });
    }
    return true;
  };

  @action
  sendChatMessage = (message, userName) => {
    console.log("[SEO] !sendChatMessage!" ,message);
    let { chatMessageMap,
          userInfo,
          selectRoomId } = this;


    if(userName === 'ADMIN'){ //임시 
      userInfo.userName = 'ADMIN'
      userInfo.userId = 'ADMIN'
    }

    
    //admin만 selectRoomId 가 있을것 
    let chatMessage = {
      message : message,  //채팅 메세지 
      roomId : isNil(selectRoomId) ? userInfo.userName + "_" + this.socketId : selectRoomId,   // 룸_id 
      socketId : this.chatSocket.id, // 소켓 id 로 구분 함  
      userId : userInfo.userName,// 있으면 id, 없으면 null
      userName :userInfo.userName, //
      isMe : true // sendMessage 는 무조건 나
    }
    
    //현재 방에 메세지가 있다면 
    if (chatMessageMap.has(chatMessage.roomId)) {
      console.log('[SEO] chatMessageMap has')
      let tempChatMessageList = [];
      tempChatMessageList = chatMessageMap.get(chatMessage.roomId);
      tempChatMessageList.push(chatMessage)
      chatMessageMap.set(chatMessage.roomId, tempChatMessageList);
    } 
    else { //처음 세팅 
      console.log('[SEO] chatMessageMap has not')
      chatMessageMap.set(chatMessage.roomId, [chatMessage]);
    }

    // 서버로 자신의 정보를 전송한다.
    this.chatSocket.emit("sendChatMessage", chatMessage);
  };


  //chat message 가져오기 
  @action
  getChatMessage = () => {
    let { userInfo,
          selectRoomId } = this;
    let chatMessage = {
      message : "",  //채팅 메세지 
      roomId : isNil(selectRoomId) ? userInfo.userName + "_" + this.socketId : selectRoomId,   // 룸_id 
      socketId : this.chatSocket.id, // 소켓 id 로 구분 함  
      userId : userInfo.userName,// 있으면 id, 없으면 null
      userName :userInfo.userName, //
      //isMe : true // sendMessage 는 무조건 나
    }
    console.log("[SEO] getChatMessage client -> server ", chatMessage)
    this.chatSocket.emit("getChatMessage", chatMessage);
  }
}
