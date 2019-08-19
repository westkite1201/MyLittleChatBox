const _ = require('lodash')


let countdown = 1000;
let countDownArr = [];
let IntervalArrayList = [];

let socketIdList = [] //현재 소켓 id가 속한 roomList를 반환 
let idList = [] //  id에 속한 room 리스트를 반환 
let roomList = []


let count = 0;


let getSocketIdList = () => {
    
}

const connection = (io) =>{
    const nsp = io.of('/chat');
    const namespaceChat = io.of('/chat');
    namespaceChat.on('connection',function(socket){

    })


    // console.log('socket!!!connection')

    nsp.on('connection', function(socket){

        //현재 모든 roomList를 보여줌 
        socket.on('getRoomList', function() {
            console.log("getRoomList", socketIdList)
            
            let socketID = Object.keys(socketIdList)
            let roomNameList = []
            for(let i = 0 ; i < socketID.length; i++){
                roomNameList.push(socketIdList[socketID[i]])             
            }       

            socket.emit('getRoomList', { roomNameList : roomNameList})

        })
        //룸 클릭시 그 룸에 들어감 
        //한번 룸에 단 한번만 들어가도록 설정 해야함 
        socket.on('adminJoinRoom',function(data){
            console.log('adminJoinroom')
            if( _.isNil(socket.room)){
                socket.room = data.roomName;
            }else{
                socket.leave(socket.room) //기존 룸 나가고 
                socket.room = data.roomName; // 새로 세팅
            }
            socket.join(data.roomName);
            nsp.to(data.roomName).emit('system', {  
                                                  nickName : 'admin',
                                                  msg: '채팅방에 접속 하셨습니다'
                                                });
        });
    
        
        socket.on('clientJoinRoom', function(data){
            console.log("clientJoinRoom!")
            let roomName = data.nickName +"_" + count;
            socketIdList[socket.id] = roomName; 
            socket.room = roomName; //현재 있는 방 
            socket.join(roomName);
            count += 1; // index 증가 ( 중복방지 )
            nsp.to(socket.room).emit('system', { 
                                                 nickName : data.nickName,
                                                  msg: '채팅방에 접속 하셨습니다'
                                                });
        })

        socket.on('disconnect',function(data){
            console.log('disconnect')
            nsp.to(socket.room).emit('system', { 
                                                 nickName : data.nickName,
                                                 msg: '이 채팅방을 나가셨습니다.'
                                                });
            let socketKeyList = Object.keys(socketIdList);
            let idx = socketKeyList.indexOf(socket.id);
           // console.log('idx', idx);
           // console.log('splice ' ,socketIdList.splice(idx ,1));
            //console.log("socketIdList ", socketIdList)
            delete socketIdList[socket.id]
        });
    


        socket.on('chat', function(data) {
            console.log("socket.id " , socket.id)
            console.log('message from client: ', data);
            console.log(socket.room)
            data.room = socket.room
            //let serverTime = new date.now();
            let serverTime = new Date();
            data.serverTime = serverTime;
            console.log('data ', data )
            nsp.to(socket.room).emit('chat', data);
        });

    });

   
}
module.exports =  {
    connection : connection
};