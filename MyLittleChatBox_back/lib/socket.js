const _ = require('lodash')
const userRedis = require('../model/redis/redisDao');
const REDIS = require('../model/redis/redis')
let countdown = 1000;
let countDownArr = [];
let IntervalArrayList = [];

let socketIdList = [] //현재 소켓 id가 속한 roomList를 반환 
let idList = [] //  id에 속한 room 리스트를 반환 
let roomList = []


let count = 0;




const connection = (io) =>{
    const nsp = io.of('/chat');
    const namespaceChat = io.of('/chat');
    namespaceChat.on('connection',function(socket){
        socket.on('getChatRoomList', function(data) {
     
        })
        socket.on('joinChatRoom', function(data) {
     
        })
        socket.on('getChatRoomList', function(data) {
     
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
            socket.emit('getChatMessage', { messageInfo : messageInfo })
        })

    })


    // console.log('socket!!!connection')

    // nsp.on('connection', function(socket){

    //     //현재 모든 roomList를 보여줌 
    //     socket.on('getChatRoomList ', function() {
    //         console.log("getChatRoomList ", socketIdList)
            
    //         let socketID = Object.keys(socketIdList)
    //         let roomNameList = []
    //         for(let i = 0 ; i < socketID.length; i++){
    //             roomNameList.push(socketIdList[socketID[i]])             
    //         }       

    //         socket.emit('getChatRoomList ', { roomNameList : roomNameList})

    //     })
    //     //룸 클릭시 그 룸에 들어감 
    //     //한번 룸에 단 한번만 들어가도록 설정 해야함 
    //     socket.on('adminJoinRoom',function(data){
    //         console.log('adminJoinroom')
    //         if( _.isNil(socket.room)){
    //             socket.room = data.roomName;
    //         }else{
    //             socket.leave(socket.room) //기존 룸 나가고 
    //             socket.room = data.roomName; // 새로 세팅
    //         }
    //         socket.join(data.roomName);
    //         nsp.to(data.roomName).emit('system', {  
    //                                               nickName : 'admin',
    //                                               msg: '채팅방에 접속 하셨습니다'
    //                                             });
    //     });
    
        
    //     socket.on('clientJoinRoom', function(data){
    //         console.log("clientJoinRoom!")
    //         let roomName = data.nickName +"_" + count;
    //         socketIdList[socket.id] = roomName; 
    //         socket.room = roomName; //현재 있는 방 
    //         socket.join(roomName);
    //         count += 1; // index 증가 ( 중복방지 )
    //         nsp.to(socket.room).emit('system', { 
    //                                              nickName : data.nickName,
    //                                               msg: '채팅방에 접속 하셨습니다'
    //                                             });
    //     })

    //     socket.on('disconnect',function(data){
    //         console.log('disconnect')
    //         nsp.to(socket.room).emit('system', { 
    //                                              nickName : data.nickName,
    //                                              msg: '이 채팅방을 나가셨습니다.'
    //                                             });
    //         let socketKeyList = Object.keys(socketIdList);
    //         let idx = socketKeyList.indexOf(socket.id);
    //        // console.log('idx', idx);
    //        // console.log('splice ' ,socketIdList.splice(idx ,1));
    //         //console.log("socketIdList ", socketIdList)
    //         delete socketIdList[socket.id]
    //     });
    


    //     socket.on('chat', function(data) {
    //         console.log("socket.id " , socket.id)
    //         console.log('message from client: ', data);
    //         console.log(socket.room)
    //         data.room = socket.room
    //         //let serverTime = new date.now();
    //         let serverTime = new Date();
    //         data.serverTime = serverTime;
    //         console.log('data ', data )
    //         nsp.to(socket.room).emit('chat', data);
    //     });


    // });

   
}
module.exports =  {
    connection : connection
};