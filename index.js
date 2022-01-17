const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)

const users = []
const port = 3001

app.get("/", (req, res) => {
    res.send("Hellow World")
})

const addUser = (userName, roomId) => {
    users.push({
        userName,
        roomId
    })
}

const userLeave = (userName) => users.filter(user => user.userName != userName)

const getRoomUsers = (roomId) => users.filter(user => (user.roomId == roomId))


io.on('connection', socket => {
   console.log("Someone connected") 
   socket.on('join-room', ({roomId, userName}) => {
       console.log("User joined room")
       console.log("roomId:", roomId)
       
       if(roomId && userName) {
        socket.join(roomId)
        addUser(userName, roomId)
        socket.to(roomId).emit('user-connected', userName)
 
        console.log("All users", getRoomUsers(roomId))
        io.to(roomId).emit("all-users", getRoomUsers(roomId))
       }

       socket.on("disconnect", () => {
        console.log("disconnect", socket.id)
        socket.leave(roomId)
        userLeave(userName)
        io.to(roomId).emit("all-users", getRoomUsers(roomId))

      });
   })
});

server.listen(port, () => {
    console.log('Zoom clone API listning on localhost: 3001')
})
