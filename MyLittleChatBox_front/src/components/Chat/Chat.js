import React, { Component } from 'react'
import { observer, inject, } from 'mobx-react'
import ChatItem from './ChatItem'

class Chat extends Component {

    state = {
        nickName : 'user',
        chatMsg : '',
        temp : [],
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
        //this.sendChatMessage(this.state.chatMsg)

    }
    //인풋 박스 핸들링 
    handleChatMessage = (e) =>{
        console.log(this.state.chatMsg)
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
        let chatMessageList = chatMessage.map((item) =>{ 
            return (
                <ChatItem nickName =  {item.nickName}
                          message ={item.msg}
                />  
            )
        })
        return (
            <div>
                <button onClick = {this.getRoomList} >
                    getRoomList
                </button>
                <button onCLick = {this.makeRoom} > 방만들기 </button>
                    admin page
                <div className ={'roomnameList'}>
                    
                </div>
                <div>
                    {chatMessageList}
                </div>
                <form onSubmit={this.chatMessageSendServer}>
                    <input onChange ={this.handleNickName} placeholder="nickname"/>
                    <input onChange ={this.handleChatMessage} placeholder="message"/>
                    <button type="submit">등록</button>
                </form>
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
  }))(observer( Chat));