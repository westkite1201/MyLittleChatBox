import React, { Component } from 'react';
import { observable, action } from 'mobx';
import { observer } from 'mobx-react';
import { Button } from 'reactstrap';
@observer
class ChatActivationButton extends Component {
  render() {
    return (
      <Button onClick={this.props.handleClick} color="primary">
        send
      </Button>
    );
  }
}
export default ChatActivationButton;
