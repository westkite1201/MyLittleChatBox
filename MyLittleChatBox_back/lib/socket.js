const _ = require('lodash')
const userRedis = require('../model/redis/redisDao');
const REDIS = require('../model/redis/redis')


const ADMIN_IN_ROOM_MSG = 'ADMIN님이 방에 입장하였습니다.'
const ADMIN_LEAVE_ROOM_MSG = 'ADMIN님이 방에서 나갔습니다. '
let roomId = ''
let socketId = '';
const connection = (io) =>{
    const namespaceChat = io.of('/chat');
    namespaceChat.on('connection',function(socket){
        console.log("socket connection ")
        socket.on('deleteRedisKey',()=>{
            userRedis.deleteRedisKey();
        })
        //방 가져오기 
        socket.on('getChatRoomList', async(data) => {
            console.log("'[SEO] getChatRoomList" , roomId)
            let roomList = await userRedis.getChatRoomList();
            // console.log('[SEO] ROOMLIST ', roomList)
            // socket.to(roomId).emit('getChatRoomList', roomList)
            socket.join(roomId)
            console.log(socket.rooms)
            socket.emit('getChatRoomList', roomList)
            //socket.to(roomId).emit('getChatRoomList',  roomList)
            //socket.emit('getChatRoomList', roomList)
        })
        /* message INFO 넣ㄱ ㅣ */
        //방 들어가기 
        socket.on('joinChatRoom', (data) => {
            console.log("[SEO][joinChatRoom] data",  data, data.messageInfo.roomId)
            let messageInfo = data.messageInfo;
            const { roomId } = messageInfo;
        
            userRedis.joinChatRoom(data);
            userRedis.addMessage(messageInfo)
            socket.join(roomId) //socketJoin
            socket.emit('joinChatRoom', { message : socket.rooms })
            /* 시스템 메세지  */
            socket.to(roomId).emit('sendChatMessage',  { 
                system : true,
                roomId : roomId, 
                message:  ADMIN_IN_ROOM_MSG
            })
        })
        //방 나가기
        socket.on('leaveChatRoom', function(data) {
            let messageInfo = data.messageInfo;
            const { roomId } = messageInfo;
            socket.to(roomId).emit('sendChatMessage', { 
                system : true, 
                roomId : roomId, 
                message : ADMIN_LEAVE_ROOM_MSG
            })
           
            socket.leave(roomId) //socketLeave
            console.log(socket.rooms)
            userRedis.addMessage(messageInfo)
            userRedis.leaveChatRoom(messageInfo);
        })

        //방만들고 방에 들어가기    
        socket.on('createChatRoom', function(data){
            console.log("createChatRoom ",data.messageInfo.socketId )
            roomId = data.messageInfo.roomId
            socketId = data.messageInfo.socketId
            let response = userRedis.createChatRoom(data);
            console.log(response)

            socket.join(roomId)
            socket.to(roomId).emit('createChatRoom', { response : response })
        
        })


        socket.on('getChatRoomMember', function(data) {
            let roomMembers = userRedis.getChatRoomMember(data)
        })
        
        socket.on('sendChatMessage',( data ) => {
            let messageInfo = {  
                message : data.message,  //채팅 메세지 
                roomId : data.roomId,   // 룸_id 
                socketId :  data.socketId, // 소켓 id 로 구분 함  
                userId : data.userName,// 있으면 id, 없으면 null
                userName : data.userName, //
            }
            console.log("[SEO] messageInfo", messageInfo)
            userRedis.addMessage(messageInfo)
            socket.join(messageInfo.roomId)
            socket.to(messageInfo.roomId).emit('sendChatMessage',  messageInfo )
        })

        //방 메세지 가져오기 
        socket.on('getChatMessage',async(data) => {
            let messageInfo = {  
               message : "",  //채팅 메세지 
                roomId : data.roomId,   // 룸_id 
                socketId :  data.socketId, // 소켓 id 로 구분 함  
                userId : data.userName,// 있으면 id, 없으면 null
                userName : data.userName, //
            }
      
            let messageList = await userRedis.getChatMessage(messageInfo)

            messageList = messageList.map((item)=>{
                messageInfoAssemble=  item.split(":")
                let messageInfo ={
                    message : messageInfoAssemble[1],  //채팅 메세지 
                    roomId : messageInfoAssemble[2],   // 룸_id 
                    socketId :  messageInfoAssemble[3], // 소켓 id 로 구분 함  
                    userId : messageInfoAssemble[4],// 있으면 id, 없으면 null
                    userName : messageInfoAssemble[5], //
                }
                return messageInfo;
            })


            console.log("[SEO] getChatMessage messageList", messageList)
            socket.join(messageInfo.roomId);
            //socket.to(messageInfo.roomId).emit('getChatMessage', { messageList : messageList })
            namespaceChat.to(messageInfo.roomId).emit('getChatMessage', { messageList : messageList })
        })

        socket.on('getNowjoinedChatRoom',() => {

        })



    })

}
module.exports =  {
    connection : connection
};