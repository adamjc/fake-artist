let peers = []
let ws

function hostHandler () {
  console.log('hosting a game...')
  ws = connect()
}

function joinHandler () {
  const roomId = document.getElementById('roomId').value

  console.log(`joining game ${roomId}`)
  
  ws = connect(roomId)
}

function connect (roomId) {
  console.log('connect')
  ws = new WebSocket('wss://md04bdl83m.execute-api.eu-west-1.amazonaws.com/prod')
  ws.onmessage = messageHandler
  ws.onopen = _ => {
    console.log('websocket opened')
    if (roomId) {
      ws.send(msg('join', roomId))
    } else {
      ws.send(msg('host'))
    }
  }

  return ws
}

const msg = (messageType, message) => JSON.stringify({ messageType, message })

function messageHandler ({ data }) {
  const { messageType, ...message } = JSON.parse(data)
  console.log(messageType, message)
  
  switch (messageType) {
    case 'hosting':
      // we are hosting the game
      return 
    case 'signal':
      handleSignal(message)
      // make a webrtc connection to peer trying to answer/offer us
      return
    case 'joining':
      // make a webrtc connection for every peer we receive in `message`
      peers = peers.concat(createPeers(message.players))
      return
    case 'new-player':
      // a new player has entered the room
      return
  }
}

// connectionId: this is the connectionId of the remote peer we want to establish a webrtc connection with
// data: this is the 'description' of the remote peer
function handleSignal ({ connectionId, data }) {
  let pc = peers.filter(peer => peer.connectionId === connectionId)

  if (!pc) {
    const peer = new SimplePeer({ initiator: false, trickle: false })
    peer.signal(data)
    peer.on('signal', data => ws.send(msg('signal', { remoteId: peer.connectionId, data})))
    peer.on('connect', console.log)
    peer.on('data', console.log)
  } else {
    pc.peer.signal(data)
  }
}

// players = [{ 'connection_id', 'room_id' }]
function createPeers (players) {
  console.log('creating peers...')
  const pcs = players.map(player => {
    const peer = new SimplePeer({ initiator: true, trickle: false })

    peer.on('signal', data => ws.send(msg('signal', data)))

    peer.on('connect', console.log)
    peer.on('data', console.log)

    console.log(`signalling ${player.connection_id}`)
    return {
      connectionId: player.connection_id,
      peer
    }
  })

  return pcs
}

document.getElementById('host').addEventListener('click', hostHandler)
document.getElementById('join').addEventListener('click', joinHandler)