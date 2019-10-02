const path = require('path')
const express = require('express')
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const AWS = require('aws-sdk')
const hexgen = require('hex-generator')

AWS.config.update({
  region: 'eu-west-1',
  endpoint: 'dynamodb.eu-west-1.amazonaws.com'
})

const db = new AWS.DynamoDB.DocumentClient()

app.get('/', (req, res, next) => {
  res.sendFile(path.join(process.cwd(), './index.html'))
})

http.listen(3000, () => {
  console.log('Server online.')
})

io.on('connection', socket => {
  console.log(`connection received from ${socket.id}.`)

  socket.on('game:new', () => {
    console.log('creating a new game...')

    const roomId = hexgen(20).toString(16).toUpperCase()

    const query = {
      TableName: 'fake-artist',
      Item: {
        'roomId': roomId,
        'users': {}
      }
    }

    db.put(query, (err, data) => {
      if (err) {
        console.log(`err: ${JSON.stringify(err, null, 2)}`)
      } else {
        console.log(`data: ${JSON.stringify(data, null, 2)}`)
        socket.join(roomId)
        socket.emit('game:new', roomId)
      }
    })
  })

  socket.on('game:start', () => {
    console.log('starting a game')
    
  })

  socket.on('game:join', id => {
    console.log(`connecting to room ${id}...`)
  })

  socket.on('disconnect', reason => {
    console.log(`reason: ${JSON.stringify(reason, null, 2)}`)
  })
})