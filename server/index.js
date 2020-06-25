const AWS = require('aws-sdk')
const Dynamo = require('aws-sdk/clients/dynamodb')

const db = new Dynamo.DocumentClient()
let api

exports.handler = async event => {
  console.log(event)
  
  api = new AWS.ApiGatewayManagementApi({
    apiVersion: '2018-11-29',
    endpoint: `${event.requestContext.domainName}/${event.requestContext.stage}`
  })

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
  
  if (messageType === 'host') {
    const roomId = Math.random().toString(36).substring(2, 6).toUpperCase()

    await joinRoom(connectionId, roomId)

    return res(200, { messageType: 'hosting', roomId } )
  }

  if (messageType === 'join') {
    return join(connectionId, message)
  }

  if (messageType === 'vote' ) {
    // ...
  }

  if (messageType === 'signal' ) {
    await signal(connectionId, message)
    return res(200, 'signalling data sent')
  }

  return {
    statusCode: 200,
    body: `you sent: ${event.body}`
  }
}

// forwards on signalling data to peer specified
async function signal (connectionId, { remoteId, data }) {
  console.log(`signalling to ${remoteId}`)
  return api.postToConnection({
    ConnectionId: remoteId,
    Data: {
      messageType: 'signal',
      connectionId,
      data
    }
  }).promise()
}

async function join (connectionId, roomId) {
  const players = await getPlayers(roomId)

  if (!players.length) return res(404)

  await broadcast(players, { messageType: 'new-player', connectionId })
  await joinRoom(connectionId, roomId)

  return res(200, { messageType: 'joining', roomId, players })
}

function res (statusCode, payload) {
  return {
    statusCode,
    body: payload ? JSON.stringify(payload) : null
  }
}

// broadcast `data` to all `players`
async function broadcast (players, data) {
  console.log(`broadcasting`)
  const reqs = players.map(player => api.postToConnection({
    ConnectionId: player.connection_id, 
    Data: JSON.stringify(data)
  }).promise())

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