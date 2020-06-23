function hostHandler () {
  console.log('hosting a game...')
  connect()
}

function joinHandler () {
  const roomId = document.getElementById('roomId').value
  connect(roomId)
}

function connect (roomId) {
  console.log('connect')
  const ws = new WebSocket('wss://md04bdl83m.execute-api.eu-west-1.amazonaws.com/prod')
  ws.onopen = _ => {
    console.log('websocket opened')
    if (roomId) {
      ws.send(msg('join', roomId))
    } else {
      ws.send(msg('host'))
    }
  }
  ws.onmessage = messageHandler
}

const msg = (messageType, message) => JSON.stringify({ messageType, message })

function messageHandler (message) {
  console.log(message)
}

document.getElementById('host').addEventListener('click', hostHandler)
document.getElementById('join').addEventListener('click', joinHandler)