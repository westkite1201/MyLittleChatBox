import { observable, action, computed } from 'mobx';
import io from 'socket.io-client';
import {isEmpty} from 'lodash'
let chatMessageMap = new Map();
export default class ChatStore{
    @observable socket = ''
    @observable chatSocket = ''
    @observable chatMessage = []
    //@observable chatMessageMap = new Map();
    @observable roomNameList = [] 





    @action
    getRoomList = () =>{
        console.log("getRoomList!!!")
        console.log(this.chatSocket)
     
        this.chatSocket.emit('getChatRoomList',{});
    }
    //client 입장 
    @action
    joinRoom = (nickName) => { 
        this.chatSocket.emit("clientJoinRoom", {
            nickName : nickName
        });
    }
    //admin 입장 
    @action
    adminJoinRoom = (roomName) => { 
        console.log("adminJoinRoom!!")
        console.log(roomName)
        if( chatMessageMap.has(roomName)){
            console.log('have!')
            let chatMessage1 = chatMessageMap.get(roomName)
            console.log("chatMessage1!!" , chatMessage1)
            this.chatMessage = chatMessage1
        }else{
            console.log('else')
            console.log(chatMessageMap)
            this.chatMessage = []
        }

        this.chatSocket.emit("adminJoinRoom", {
            roomName : roomName
        });
    }
    //socketConnection
    @action
    setSocketConnection = (id) => {
        console.log('setSocketConnection hello ')
        if(isEmpty(this.chatSocket)){
            console.log(this.chatSocket)
            const chatSocket = io('http://localhost:3031/chat');
            // console.log(socket)
            chatSocket.on('connection',() =>{ console.log('connected')});
            // then
            this.socket = chatSocket;
            this.chatSocket = chatSocket;
            //this.sendChatMessage();    
        
            console.log(this.chatSocket)
            console.log(this.socket)
       

            // 서버로부터의 메시지가 수신되면
            this.chatSocket.on("getChatMessage", (data) => {
                console.log('[SEO] getChatMessage !!!', data)
                let messageInfo = data.messageInfo
                let isMe = false;
                if(messageInfo.userName === 'ADMIN'){
                    isMe = true;
                }
                this.chatMessage.push({ userName: messageInfo.userName,
                                        room: messageInfo.roomId,
                                        message: messageInfo.message,
                                    })


                console.log("data.room" , data.roomId)
                console.log('messageInfo', messageInfo.roomId)
                console.log('chatMessageMap.get(data.room) ', chatMessageMap.get(data.roomId))
            
                // 저장
                if(chatMessageMap.has(data.roomId)){
                    let temp = []
                    temp  = chatMessageMap.get(data.roomId) 
                    temp.push({ userName: messageInfo.userName,
                                room: messageInfo.roomId,
                                message: messageInfo.message,
                                isMe: isMe })
                // console.log(data)yarn
                    console.log(data)
                    chatMessageMap.set(messageInfo.roomId, temp)
                }else{
                    console.log('else')
                    console.log(data)
                    let temp = { userName: messageInfo.userName,
                                room: messageInfo.roomId,
                                message: messageInfo.message,
                                isMe: isMe }
                    chatMessageMap.set(messageInfo.roomId, [temp])
                }

            

            });

            this.chatSocket.on("getChatRoomList", (data) =>{
                this.roomNameList = data.roomNameList;
                console.log(data.roomNameList)
            })
        
            this.chatSocket.emit("disconnect", {
                nickName: 'fsdfds',
                room: 'all',
            });
            

                //시스템 메세지일때 
            this.chatSocket.on("system", (data) =>{
                this.chatMessage.push({ 
                    nickName: data.nickName,
                    room: data.room,
                    msg: data.msg,
                    system: true
                })

                    // 저장
                if(chatMessageMap.has(data.room)){
                    let temp = []
                    temp  = chatMessageMap.get(data.room) 
                    temp.push({ 
                            nickName: data.nickName,
                            room: data.room,
                            msg: data.msg,
                            system : true
                            })
                    // console.log(data)
                    chatMessageMap.set(data.room, temp)
                }else{
                    console.log('else')
                    let temp = { 
                                nickName: data.nickName,
                                room: data.room,
                                msg: data.msg,
                                system: true
                            }
                    chatMessageMap.set(data.room, [temp])
                }
            })
        }
    }

    @action
    sendChatMessage = (message, userName) => {
       console.log("!sendChatMessage!")
     
        // 서버로 자신의 정보를 전송한다.
        this.chatSocket.emit("sendChatMessage", {  
            message : message,  //채팅 메세지 
            roomId : 'hello',   // 룸_id 
            socketId :  this.chatSocket.id, // 소켓 id 로 구분 함  
            userId : userName,// 있으면 id, 없으면 null
            userName : userName, //
    
        });
    
    }
 }