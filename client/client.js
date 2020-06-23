function hostHandler () {
  connect()
}

function joinHandler () {
  const roomId = document.getElementById('roomId').value
  connect(roomId)
}

function connect (roomId) {
  const ws = new WebSocket('wss://md04bdl83m.execute-api.eu-west-1.amazonaws.com/prod')
  ws.onopen = _ => {
    if (roomId) {
      ws.send({
        messageType: 'join',
        message: roomId
      })
    } else {
      ws.send({
        messageType: 'host'
      })
    }
  }
}

function messageHandler (message) {
  console.log(message)
}

document.getElementById('host').addEventListener('click', hostHandler)
document.getElementById('join').addEventListener('click', joinHandler)