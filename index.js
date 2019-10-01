// connect to server
const path = require('path')
const express = require('express')
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)

app.get('/', (req, res, next) => {
  res.sendFile(path.join(process.cwd(), './index.html'))
})

http.listen(3000, () => {
  console.log('Server online.')
})

io.on('connection', socket => {
  console.log(`connection received from ${socket.id}.`)
  socket.emit('hello')

  socket.on('game:new', () => {
    console.log('creating a new game...')
    socket.emit('game:new', 'ABCD')
  })
  
  socket.on('game:join', id => {
    console.log(`connecting to room ${id}...`)
  })
})