// ******************Express configration
// const path = require('path')

// const express = require('express')

// const  app = express()

// const port = process.env.PORT||3000

// const  PublicDirectoryPath = path.join(__dirname,'../public/')

// app.use(express.static(PublicDirectoryPath))
// app.listen(port,()=>{
//     console.log(`successfully  server connected and runing at port ${port}`)
// })

// ******************************web soket configration

const path = require('path')
const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const  app = express()
const server = http.createServer(app)
const io = socketio(server)
const Filter = require('bad-words')
const {generateMessage,generateLocationMessage} = require('./utils/messages')
const {addUser,removeUser,getUser,getUsersInRoom} = require('./utils/users')
const port = process.env.PORT||3000

const  PublicDirectoryPath = path.join(__dirname,'../public/')

app.use(express.static(PublicDirectoryPath))
server.listen(port,()=>{
    console.log(`successfully  server connected and runing at port ${port}`)
})

// let count = 0
// io.on('connection',(socket)=>{
    // console.log('New websocket connection')
    // socket.emit('countUpdated', count) this is first connection
    // socket.on('increment', ()=>{
    //     count++
    // // socket.emit('countUpdated',count) this is for single connection use
    // io.emit('countUpdated',count)
    // }

// })

io.on('connection',(socket)=>{
   
    
    // socket.on('sendMessage',(message)=>{
    //     io.emit('message', message)

    // })
    socket.on('join', (options,callback)=>{
        const { error, user} = addUser({id: socket.id , ...options})

        if(error){
            return callback(error)
        }


        socket.join(user.room)

        socket.emit('message', generateMessage('Admin','welcome!')) 
     socket.broadcast.to(user.room).emit('message', generateMessage('Admin',`${user.username} has joined`)) 
     
     io.to(user.room).emit('roomData',{
         room:user.room,
         users:getUsersInRoom(user.room)
     })
     callback()
    })
    socket.on('sendMessage',(message,callback)=>{
        const user = getUser(socket.id)
        const filter = new Filter()
        if(filter.isProfane(message)){
            return callback('profanity is not allowed')
        }
         
            io.to(user.room).emit('message', generateMessage(user.username,message))
            callback()
    
        })

    socket.on('sendlocation',(coords, callback)=>{
        // io.emit('message',`location: ${coords.latitude},${coords.longitude}`)
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage',generateLocationMessage(user.username, `https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })
    socket.on('disconnect',()=>{
        const user = removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message',generateMessage('Admin',`${user.username} has left`))
            //coords.longitude
            io.to(user.room).emit('roomData',{
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
       
    })

})


