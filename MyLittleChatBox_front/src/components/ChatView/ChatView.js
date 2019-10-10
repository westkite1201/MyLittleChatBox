import React, { Component } from 'react'
import { observer, inject, } from 'mobx-react'
import ChatItem from './ChatItem'
import './ChatView.scss'
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';

class ChatView extends Component {

    state = {
        nickName : 'user',
        chatMsg : '',
        //chatSocket : io('http://localhost:3031/chat')
    }
    componentDidMount(){
        const { setSocketConnection,getRoomList,joinRoom } = this.props;
        setSocketConnection();
        joinRoom(this.state.nickName);
       // getRoomList();
       // this.setSocketConnection(); 
    }

    //서버로 전송 
    chatMessageSendServer = (e) => {
        const {chatMsg , nickName} = this.state;
        e.preventDefault();
        console.log("chatMessageSendServer!!")
        const { sendChatMessage } = this.props;
        sendChatMessage(chatMsg, nickName)
        document.getElementById('inputMessage').value = ''
        this.setState({
            chatMsg:''
        })
        //this.sendChatMessage(this.state.chatMsg)

    }
    //인풋 박스 핸들링 
    handleChatMessage = (e) =>{
        console.log(this.state.chatMsg)
        console.log(e.target)
        this.setState({
            chatMsg : e.target.value
        })
    }
    handleNickName = (e) =>{
        this.setState({
            nickName : e.target.value
        })
    }
    /* 이걸 사용해서 이름을 만들 예정  */
    createName = () =>{
        let firstName= [];
        let secondtName= [];
        let lastName= [];
    }
    createRoom = () => { 

    }
    getRoomList =() =>{
        const { getRoomList }  =this.props;
        getRoomList();
    }
    render() {
        const { chatMessage, getRoomList }  =this.props;
        console.log("chatMessage ", chatMessage)
        let chatMessageList = chatMessage.map((item, i) =>{ 
            return (
                <ChatItem nickName =  {item.userName}
                          message ={item.message}
                          key = {i}
                />  
            )
        })
        return (
            <div className = 'chatViewWrapper'>
                <div className = 'messageWrapper'>
                    {chatMessageList}
                </div>
                <div className = 'inputBox'>
                    <form onSubmit={this.chatMessageSendServer}>
                        <input onChange ={this.handleNickName} placeholder="nickname"/>
                        <TextField
                                    id="inputMessage"
                                    //label="메세지를 입력해주세요"
                                    //className={classes.textField}
                                    type='text' 
                                    name = 'inputMessage'
                                    onChange ={this.handleChatMessage}
                                    placeholder="message"
                        />
                        <input id="send-message" type = "submit" style = {{display: "none"}} />
                        <label htmlFor="send-message" type= "submit" style = {{margin:"0px"}}>
                            <Button variant="contained" color="primary" onClick = {this.chatMessageSendServer} size = {'small'}>
                                Send
                                <Icon>send</Icon>
                            </Button>
                        </label>
                    </form>
                </div>
            </div>
        )
    }
}
export default inject(({ chat }) => ({
    getRoomList : chat.getRoomList,
    joinRoom  : chat.joinRoom,
    setSocketConnection : chat.setSocketConnection,
    sendChatMessage : chat.sendChatMessage,
    chatMessage : chat.chatMessage
  }))(observer( ChatView));