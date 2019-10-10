const _ = require('lodash')
const userRedis = require('../model/redis/redisDao');
const REDIS = require('../model/redis/redis')

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
            socket.to(roomId).emit('getChatRoomList',  "room에보냄 ")
            //socket.emit('getChatRoomList', roomList)
        })
        //방 들어가기 
        socket.on('joinChatRoom', function(data) {
            console.log("[SEO][joinChatRoom] ", data)
            socket.join(data.messageInfo.roomId) //socketJoin
            userRedis.joinChatRoom(data);
        })
        //방 나가기
        socket.on('leaveChatRoom', function(data) {
            socket.leave(data.roomId) //socketJoint
            userRedis.leaveChatRoom(data);
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
        socket.on('getChatMessage',( data ) => {
            let messageInfo = {  
                message : data.message,  //채팅 메세지 
                roomId : data.roomId,   // 룸_id 
                socketId :  data.socketId, // 소켓 id 로 구분 함  
                userId : data.userName,// 있으면 id, 없으면 null
                userName : data.userName, //
            }
            console.log("[SEO] messageInfo", messageInfo)
            //userRedis.addMessage(messageInfo)
            //socket.to(messageInfo.roomId).emit('getChatMessage', { messageInfo : messageInfo })
        })



    })

}
module.exports =  {
    connection : connection
};