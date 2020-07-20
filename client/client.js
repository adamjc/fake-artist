import { connect, createPeer, createPeers, removePeer } from './networking.js'
import Phaser from 'phaser'
import msg from './msg.js'


let peers = []
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
  console.log('messageHandler', data)
  const { messageType, ...message } = JSON.parse(data)
  
  switch (messageType) {
    case 'hosting':
      showRoom(message.roomId)
      // we are hosting the game
      return 
    case 'signal':
      // make a webrtc connection to peer trying to answer/offer us
      handleSignal(message)
      return
    case 'joining':
      showRoom(message.roomId)
      // make a webrtc connection for every peer we receive in `message`
      peers = peers.concat(createPeers(message.players, dataHandler))
      return
    case 'new-player':
      // a new player has entered the game
      return
    case 'disconnection':
      // a player has left the game
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

document.getElementById('host').addEventListener('click', hostHandler)
document.getElementById('join').addEventListener('click', joinHandler)
document.getElementById('message__button').addEventListener('click', sendMessage)

function sendMessage() {
  console.log('sending message yo')
  const msg = document.getElementById('message').value
  peers.forEach(peer => peer.peer.send(msg))
}

function startGame () {
  let drawing = false
  let line
  let graphics
  let timeout
  let lines = []
  let updates = []
  function preload () {
  }

  function create () {
    timeout = setInterval(() => {
      if (lines.length) {
        peers.forEach(peer => {
          const data = msg('line', lines)
          peer.peer.send(data)
        })
      }

      lines = []
    }, 75)
    line = new Phaser.Geom.Line()
    graphics = this.add.graphics({ lineStyle: { width: 4, color: 0xaa00aa } })

    this.input.on('pointerdown', () => {
      drawing = true
    })

    this.input.on('pointerup', () => {
      drawing = false
    })

    this.input.on('pointermove', () => {
      const { x: prevX, y: prevY } = this.input.activePointer.prevPosition
      const { x, y } = this.input.activePointer.position

      if (drawing) {
        line.setTo(prevX, prevY, x, y)
        lines.push({prevX, prevY, x, y})
        graphics.strokeLineShape(line)
      }
    })

    game.events.on('line', e => {
      updates = e
    })
  }

  function update () {
    if (updates.length) {
      updates.forEach(({prevX, prevY, x, y}) => {
        line.setTo(prevX, prevY, x, y)
        graphics.strokeLineShape(line)
      })
      updates = []
    }
  }

  const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: {
      preload,
      create,
      update
    }
  }

  return new Phaser.Game(config)
}

const game = startGame()

function showRoom (id) {
  console.log(id)
  const content = `Room ID: ${id}`
  const div = document.createElement('div')
  div.innerHTML = content
  console.log(document.getElementById('body'))
  document.getElementById('body').prepend(div)
}