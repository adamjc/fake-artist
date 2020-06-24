function hostHandler () {
  console.log('hosting a game...')
  connect()
}

function joinHandler () {
  const roomId = document.getElementById('roomId').value

  console.log(`joining game ${roomId}`)
  
  connect(roomId)
}

function connect (roomId) {
  console.log('connect')
  const ws = new WebSocket('wss://md04bdl83m.execute-api.eu-west-1.amazonaws.com/prod')
  ws.onmessage = messageHandler
  ws.onopen = _ => {
    console.log('websocket opened')
    if (roomId) {
      ws.send(msg('join', roomId))
    } else {
      ws.send(msg('host'))
    }
  }
}

const msg = (messageType, message) => JSON.stringify({ messageType, message })

function messageHandler ({ data }) {
  const { messageType, ...message } = JSON.parse(data)
  
  switch (messageType) {
    case 'hosting':
      // we are hosting the game
      return 
    case 'signal':
      // make a webrtc connection to peer trying to answer/offer us
      return
    case 'joining':
      // make a webrtc connection for every peer we receive in `message`
      handleJoining(message.players)
      return
    case 'new-player':
      // a new player has entered the room
      return
  }
}

// players = [{ 'connection_id', 'room_id' }]
function handleJoining (players) {
  const pcs = players.map(player => {
    const peer = new SimplePeer({ initiator: true, trickle: false })

    peer.on('signal', data => ws.send(msg('signal', data)))

    peer.on('connect', console.log)
    peer.on('data', console.log)
    return {
      connectionId: player.connection_id,
      peer
    }
  })
}

document.getElementById('host').addEventListener('click', hostHandler)
document.getElementById('join').addEventListener('click', joinHandler)