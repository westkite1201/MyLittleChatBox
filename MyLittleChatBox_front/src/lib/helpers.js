import _ from 'lodash';
//닉네임 만들기
export const nicknameMaker = () => {
  //   let firstNameList = ['못되먹은','착해빠진','심술궂은', '징징대는'] ;
  //   let secondNameList = ['상어','오징어','구렁이','핑핑이']
  let firstNameList = ['A', 'B', 'C', 'D', 'E', 'F'];
  let secondNameList = ['1', '2', '3', '4', '6', '7'];
  let first = Math.floor(Math.random() * firstNameList.length - 1) + 1;
  let second = Math.floor(Math.random() * firstNameList.length - 1) + 1;
  return firstNameList[first] + '_' + secondNameList[second];
};

export const makeRoomId = (userInfo) => {
  return userInfo.userName + '_' + userInfo.socketId; // 룸_id
};

export const makeTimeFormat = (sendTime) => {
  if (sendTime) {
    let splitTime = sendTime.split('-');
    let year = splitTime[0];
    let month = splitTime[1];
    let day = splitTime[2];
    let hour = splitTime[3];
    let minute = splitTime[4];
    let second = splitTime[5];
    return hour + '시 ' + minute + '분';
  }
};
