import React, { Component } from 'react'
import { ListGroup, ListGroupItem } from 'reactstrap';
import { observer, inject, } from 'mobx-react'
import TextField from '@material-ui/core/TextField';
import './AdminChat.scss';

class AdminChat extends Component{
    state = {
        nickName : 'SEOYEON',
        chatMsg : '',
        temp : [],
        roomSelect : '',
        //chatSocket : io('http://localhost:3031/chat')
    }
    componentDidMount(){
        const { getRoomList,setSocketConnection }  =this.props;
        setSocketConnection()
        getRoomList();
        // setInterval(()=>{
        //     getRoomList();
        // },1000)
    }

    adminJoinRoom = (e) => {
        const {adminJoinRoom } =this.props;
        adminJoinRoom(e.target.name);
        console.log( e.target.name )   
        this.setState({
            roomSelect : e.target.name
        })
    }
       //인풋 박스 핸들링 
    handleChatMessage = (e) =>{
        console.log(this.state.chatMsg)
        this.setState({
            chatMsg : e.target.value
        })
    }
    //서버로 전송 
    chatMessageSendServer = (e) => {
        const {chatMsg , nickName} = this.state;
        e.preventDefault();
        console.log("chatMessageSendServer!!")
        const { sendChatMessage } = this.props;
        sendChatMessage(chatMsg, nickName)
        //this.sendChatMessage(this.state.chatMsg)
    }
    render() {
        const { roomSelect } = this.state; 
        const { roomNameList, chatMessage } =this.props;
        
        let list = roomNameList.map((item) =>{
            return(
                <ListGroupItem className ={ roomSelect === item ? 'active' : 'unactive' }
                               tag="button" 
                               onClick ={this.adminJoinRoom} 
                               name={item} >{item}
                </ListGroupItem>
            )
        });
        let chatMessageList = chatMessage.map((item) =>{ 
            let messageClassName ;

            if(item.system){
                messageClassName = 'systemMessage'
            }else{
                if(item.isMe){
                    messageClassName = 'myMessage'
                }else if(!item.isMe){
                    messageClassName = 'anotherUserMessage'
                }
            }
            return (
                <div className = {messageClassName} >{item.nickName+ ": " + item.msg }</div>
            )
        })
        return (
            <div className ='chatRooWrapper'>

                <div className = {'roomList'} >
                    <ListGroup>
                        {list}
                    </ListGroup>
                </div>
                <div className = {'chatRoom'} >
                    <div className= 'message'>
                        {chatMessageList}
                    </div>
                    <div className = "inputList">
                        <form onSubmit={this.chatMessageSendServer}>
                          <TextField
                                id="inputMessage"
                                //label="메세지를 입력해주세요"
                                //className={classes.textField}
                                type='text' 
                                margin="normal"
                                name = 'inputMessage'
                                onChange ={this.handleChatMessage}
                                placeholder="message"
                            />
                            <button type="submit">등록</button>
                        </form>    
                    </div>
                </div>


            </div>
        )
    }
}

export default inject(({ chat }) => ({
    getRoomList : chat.getRoomList,
    roomNameList : chat.roomNameList,
    setSocketConnection : chat.setSocketConnection,
    sendChatMessage : chat.sendChatMessage,
    chatMessage : chat.chatMessage,
    adminJoinRoom : chat.adminJoinRoom
  }))(observer( AdminChat));