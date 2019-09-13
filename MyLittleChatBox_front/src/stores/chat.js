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
        this.chatSocket.emit('getRoomList', () => {

        })
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
        if( chatMessageMap.has(roomName)){
            let chatMessage1 = chatMessageMap.get(roomName)
            console.log("chatMessage1!!" , chatMessage1)
            this.chatMessage = chatMessage1
        }else{
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
            this.chatSocket.on("chat", (data) => {
            // console.log('data!!!', data)
                let isMe = false;
                if(data.nickName === 'SEOYEON'){
                    isMe = true;
                }
                this.chatMessage.push({ nickName: data.nickName,
                                        room: data.room,
                                        msg: data.msg,
                                        isMe: isMe })


                console.log("data.room" , data.room)
                console.log('chatMessageMap.get(data.room) ', chatMessageMap.get(data.room))
            
                // 저장
                if(chatMessageMap.has(data.room)){
                    let temp = []
                    temp  = chatMessageMap.get(data.room) 
                    temp.push({ nickName: data.nickName,
                                room: data.room,
                                msg: data.msg,
                                isMe: isMe })
                // console.log(data)yarn
                    chatMessageMap.set(data.room, temp)
                }else{
                    console.log('else')
                    let temp = { nickName: data.nickName,
                                room: data.room,
                                msg: data.msg,
                                isMe: isMe }
                    chatMessageMap.set(data.room, [temp])
                }

            

            });

            this.chatSocket.on("getRoomList", (data) =>{
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
    sendChatMessage = (msg, nickName) => {
       console.log("!sendChatMessage!")
     
        // 서버로 자신의 정보를 전송한다.
        this.chatSocket.emit("chat", {
            nickName: nickName,
            room: 'all',
            msg: msg
        });
    
    }
 }