const moment = require('moment');

function formatMessage(username, text,type) {
  // console.log(type)
  return {
    username,
    text,
    time: moment().format('h:mm a'),
    type
  };
}

module.exports = formatMessage;
