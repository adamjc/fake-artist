const path = require('path')
const express = require('express')
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const AWS = require('aws-sdk')
const hexgen = require('hex-generator')
const config = require('config')
const ddbUtils = require('./ddb-utils.js')

AWS.config.update({
  region: 'eu-west-1',
  endpoint: config.get('endpoint')
})

async function main () {
  let dbClient

  try {
    ddbUtils.createTable()
    dbClient = await new AWS.DynamoDB.DocumentClient()
  } catch(err) {
    console.log(`err: ${JSON.stringify(err, null, 2)}`)
    throw err
  }

  app.get('/', (_, res) => {
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
          'room-id': roomId,
          'users': {}
        }
      }

      dbClient.put(query, (err, data) => {
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
}

main()