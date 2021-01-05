import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Divider from '@material-ui/core/Divider';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';

const styles = (theme) => ({
  root: {
    width: '100%',
    maxWidth: 360,
    float: 'left',
    //backgroundColor: theme.palette.background.paper,
  },
  inline: {
    display: 'inline',
    wordBreak: 'break-all',
  },
  chatItem: {
    background: 'white',
    borderRadius: '15px',
    margin: '10px',
  },
});

class ChatItem extends Component {
  render() {
    const { classes, userName, message } = this.props;
    return (
      <List className={classes.root}>
        <ListItem alignItems="flex-start" className={classes.chatItem}>
          <ListItemAvatar>
            <Avatar alt="Remy Sharp" src="/images/defaultUserIcon.png" />
          </ListItemAvatar>
          <ListItemText
            primary={userName}
            secondary={
              <React.Fragment>
                <Typography
                  component="span"
                  variant="body2"
                  className={classes.inline}
                  color="textPrimary"
                >
                  {message}
                </Typography>
              </React.Fragment>
            }
          />
        </ListItem>
        <Divider variant="inset" component="li" />
      </List>
    );
  }
}
export default withStyles(styles)(ChatItem);
