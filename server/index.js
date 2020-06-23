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

  const { messageType, data } = JSON.parse(event.body)
  
  if (messageType === 'host') {
    const roomId = Math.random().toString(36).substring(2, 6)
    
    const params = {
      TableName: 'fake-artist',
      Item: {
        connection_id: connectionId,
        room_id: roomId
      }
    }

    await db.put(params).promise()

    return {
      statusCode: 200,
      body: roomId
    }
  }

  if (messageType === 'join') {
    const roomId = data.roomId
    const query = {
      TableName: 'fake-artist',
      IndexName: 'room_id-index',
      KeyConditionExpression: 'room_id = :roomId',
      ExpressionAttributeValues: {
        ':roomId': roomId
      }
    }
    const peers = await db.query(query)
    
    const params = {
      TableName: 'fake-artist',
      Item: {
        connection_id: connectionId,
        room_id: roomId
      }
    }
    await db.put(params).promise()

    return {
      statusCode: 200,
      body: JSON.stringify({
        roomId,
        peers
      })
    }
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