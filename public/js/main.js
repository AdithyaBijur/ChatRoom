// import EmojiButton from '@joeattardi/emoji-button';
const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const userList = document.getElementById("users");
// const button = document.querySelector('#emoji-button');
// const picker = new EmojiButton();
// Get username and room from URL
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const socket = io();

// Join chatroom
socket.emit("joinRoom", { username, room });

// Get room and users
socket.on("roomUsers", ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

// Message from server
socket.on("message", (message) => {
 // console.log(message);
  outputMessage(message);

  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

socket.on("image", (message) => {
  // console.log(message);
  outputImage(message);

  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Message submit
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // Get message text
  const msg = e.target.elements.msg.value;
  var data = e.target.elements.uploadfile.files[0];
  //console.log(data);

  if (data){if(data.size > 2097152){
    alert("File is too big!");
    document.getElementById("uploadfile").value = null;
    data=''
 };}
  if (data) {readThenSendFile(data);
    document.getElementById("uploadfile").value = null;
  }
  // Emit message to server
  //console.log(msg)
  if (msg) {
    socket.emit("chatMessage", msg);

    // Clear input
    $("div.emojionearea-editor").data("emojioneArea").setText('');
    $("div.emojionearea-editor").data("emojioneArea").editor.focus();
  //    e.target.elements.msg.focus();
  //    setTimeout(function(){
  //     $('#msg').focus()
  // });
  // 
}
});

// Output message to DOM
function outputMessage(message) {
  const div = document.createElement("div");
  let clas='';
  if (message.username==='You') clas='You'
  div.classList.add("message");
 // console.log(clas,'yes')
  if (clas==='You') div.classList.add("You");
  div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
  <p class="text">
    ${message.text}
  </p>`;
  document.querySelector(".chat-messages").appendChild(div);
}
function outputImage(message) {

  var display=''
  let clas='';
  if (message.username==='You') clas='You'
  
  if (message.type==='image') display=`  <img src='${message.text}' height=300 width=300 onclick=show("${message.text}")>`
  else if (message.type==='video') display=` <video width="400" height='400' controls>
  <source src="${message.text}" type="video/mp4">
  <source src="${message.text}" type="video/ogg">
  Your browser does not support HTML video.`
else display=
`<a target='_blank' onclick=showtxt("${message.text}")>Click to view Text file</a>`
  //console.log(message.type)


  const div = document.createElement("div");
  div.classList.add("message");
  if (clas==='You') div.classList.add("You");
  div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
  <p class="text">
 ${display}

  </p>`;
  document.querySelector(".chat-messages").appendChild(div);
}





function show(mess) {
  var win = window.open();
  win.document.write(
    "<iframe src=" +
      mess +
      ' frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>'
  );
}

function showtxt(mess) {
  var winn = window.open();
  winn.document.write(
   ` <iframe src=${mess} style="width: 100%;height: 100%;border: none;"></iframe>`
  );
}



// Add room name to DOM
function outputRoomName(room) {
  roomName.innerText = '#'+room;
}

// Add users to DOM
function outputUsers(users) {
  userList.innerHTML = `
    ${users.map((user) => `<li>${user.username}</li>`).join("")}
  `;
}

// picker.on("emoji", (emoji) => {
//   document.querySelector("input").value += emoji;
// });



// $("#uploadfile").bind("change", function (e) {
//   var data = e.originalEvent.target.files[0];
//  console.log(data.size)

//     if(data.size > 2097152){
//        alert("File is too big!");
//        this.value = "";
//     };

//   readThenSendFile(data);
// });

function readThenSendFile(data) {
  var reader = new FileReader();
  reader.onload = function (evt) {
    var msg = {};
    msg.username = username;
    msg.file = evt.target.result;
    msg.fileName = data.name;
    socket.emit("base64 file", msg);
  };
  reader.readAsDataURL(data);
}



//file sizze
