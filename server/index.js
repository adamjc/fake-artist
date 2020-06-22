const Dynamo = require('aws-sdk/clients/dynamodb')
const db = new Dynamo.DocumentClient()

exports.handler = async event => {
  console.log(event)
  const connectionId = event.requestContext.messageId
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

  const { messageType, data } = JSON.parse(event.body)
  
  if (messageType === 'host') {
    // generate random room_id
    const roomId = Math.random().toString(36).substring(2, 6)
    
    const params = {
      TableName: 'fake-artist',
      Item: {
        connection_id: connectionId,
        room_id: roomId
      }
    }
    // putItem in db 'connection_id', 'room_id'
    await db.put(params).promise()
    // return to host what room_id is
    return {
      statusCode: 200,
      body: `joined room: ${roomId}`
    }
  }

  if (messageType === 'join') {
    // putItem in db 'connection_id', 'room_id'
    // query GSI for members in 'room_id'
    // return to joiner who is in 'room_id'
  }

  if (messageType === 'vote' ) {
    // ...
  }

  if (messageType === 'signal' ) {
    // signal this data onto everyone in the room_id the connection_id is in
  }

  return {
    statusCode: 200,
    body: `you sent: ${event.body}`
  }
}