const AWS = require('aws-sdk')

async function createTable () {
  const db = new AWS.DynamoDB()
  const newTableQuery = {
    TableName: 'fake-artist',
    ProvisionedThroughput: {
      ReadCapacityUnits: 5, 
      WriteCapacityUnits: 5
    },
    KeySchema: [{
      AttributeName: 'room-id',
      KeyType: 'HASH'
    }],
    AttributeDefinitions: [{
      AttributeName: 'room-id',
      AttributeType: 'S'
    }]
  }

  return db.createTable(newTableQuery).promise().catch(console.log)
}

module.exports = {
  createTable
}