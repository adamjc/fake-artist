const AWS = require('aws-sdk')
const Dynamo = require('aws-sdk/clients/dynamodb')

const db = new Dynamo.DocumentClient()
const api = new AWS.ApiGatewayManagementApi()

exports.handler = async event => {
  console.log(event)
  const connectionId = event.requestContext.connectionId
  // handle disconnect
  if (event.requestContext.eventType === 'DISCONNECT') {    
    // remove connection from db
    const params = {
      TableName: 'fake-artist',
      Key: {
        connection_id: connectionId
      }
    }

    await db.delete(params).promise()

    return {
      statusCode: 200,
      body: `you left`
    }
  }

  const { messageType, message } = JSON.parse(event.body)
  console.log(`messageType: ${JSON.stringify(messageType, null, 2)}`)
  console.log(`message: ${JSON.stringify(message, null, 2)}`)
  
  if (messageType === 'host') {
    const roomId = Math.random().toString(36).substring(2, 6).toUpperCase()

    await joinRoom(connectionId, roomId)

    return {
      statusCode: 200,
      body: roomId
    }
  }

  if (messageType === 'join') {
    return join(connectionId, message)
  }

  if (messageType === 'vote' ) {
    // ...
  }

  if (messageType === 'signal' ) {
    return signal(connectionId, message)
  }

  return {
    statusCode: 200,
    body: `you sent: ${event.body}`
  }
}

// forwards on signalling data to peer specified
async function signal (connectionId, { peer, data }) {
  return api.postToConnection({
    ConnectionId: connectionId,
    Data: {
      messageType: 'signal',
      peer,
      data
    }
  })
}

async function join (connectionId, roomId) {
  const players = await getPlayers(roomId)

  if (!players.length) return res(404)

  await broadcast(players, { messageType: 'new_player', connectionId })
  await joinRoom(connectionId, roomId)

  return res(200, { roomId, players })
}

function res (statusCode, payload) {
  return {
    statusCode,
    body: payload ? JSON.stringify(payload) : null
  }
}

// broadcast `data` to all `players`
async function broadcast (players, data) {
  console.log(`broadcasting to ${players}`)
  const reqs = players.map(player => api.postToConnection({
    ConnectionId: player.connection_id, 
    Data: data 
  }).promise())
  console.log('reqs: ', reqs)
  return Promise.all(reqs)
}

// get players in room
// roomid => [{ connection_id, room_id }]
async function getPlayers (roomId) {
  const query = {
    TableName: 'fake-artist',
    IndexName: 'room_id-index',
    KeyConditionExpression: 'room_id = :roomId',
    ExpressionAttributeValues: {
      ':roomId': roomId
    }
  }
  const { Items: peers } = await db.query(query).promise()

  return peers
}

async function joinRoom (connectionId, roomId) {
  const params = {
    TableName: 'fake-artist',
    Item: {
      connection_id: connectionId,
      room_id: roomId
    }
  }
  return db.put(params).promise()
}