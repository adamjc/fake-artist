import Game from './game.js'
import { connect, createPeer, createPeers, removePeer } from './networking.js'

let peers = []

document.getElementById('host').addEventListener('click', hostHandler)
document.getElementById('join').addEventListener('click', joinHandler)
document.getElementById('message__button').addEventListener('click', sendMessage)

function hostHandler () {
  connect(messageHandler)
}

function joinHandler () {
  const roomId = document.getElementById('roomId').value
  
  connect(messageHandler, roomId)
}

function dataHandler (data) {
  const { messageType, message } = JSON.parse(data)

  if (messageType === 'line') {
    game.events.emit('line', message)
  }
}

function messageHandler ({ data }) {
  const { messageType, ...message } = JSON.parse(data)
  
  switch (messageType) {
    case 'hosting': // we are hosting the game
      showRoom(message.roomId)
      showStart()
      return
    case 'signal': // make a webrtc connection to peer trying to answer/offer us
      handleSignal(message)
      return
    case 'joining':
      showRoom(message.roomId) // make a webrtc connection for every peer we receive in `message`
      peers = peers.concat(createPeers(message.players, dataHandler))
      return
    case 'new-player': // a new player has entered the game
      return
    case 'disconnection': // a player has left the game
      peers = removePeer(peers, message.connectionId)
      return
  }
}

// connectionId: this is the connectionId of the remote peer we want to establish a webrtc connection with
// data: this is the 'description' of the remote peer
function handleSignal ({ connectionId, data }) {
  let pc = peers.filter(peer => peer.connectionId === connectionId)[0]
  if (!pc) {
    const peer = createPeer(connectionId, dataHandler)
    
    peer.signal(data)
    
    peers = peers.concat({ connectionId, peer })
  } else {
    console.log('found peer!', pc)
    pc.peer.signal(data)
  }
}

function sendMessage() {
  console.log('sending message yo')
  const msg = document.getElementById('message').value
  peers.forEach(peer => peer.peer.send(msg))
}

function showRoom (id) {
  const content = `Room ID: ${id}`
  const div = document.createElement('div')
  div.innerHTML = content
  document.getElementById('body').prepend(div)
}

function showStart () {
  const start = document.createElement('button')
  start.innerHTML = 'Start'
  start.addEventListener('click', _ => {
    game = Game.startGame(peers)
    game.events.on('line', e => Game.update(e))
  })
  document.getElementById('body').prepend(start)
}

let game
console.log(game)