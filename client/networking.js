import SimplePeer from 'simple-peer'
import msg from './msg.js'

let ws

function connect (messageHandler, roomId) {
  ws = new WebSocket('wss://md04bdl83m.execute-api.eu-west-1.amazonaws.com/prod')
  ws.onmessage = messageHandler
  ws.onopen = _ => roomId ? ws.send(msg('join', roomId)) : ws.send(msg('host'))
  ws.onerror = e => console.log(`Web Socket error: ${JSON.stringify(e)}`)
}

// players = [{ 'connection_id', 'room_id' }]
function createPeers (players, dataHandler) {
  return players.map(player => {
    const peer = createPeer(player.connection_id, dataHandler, true)

    return {
      connectionId: player.connection_id,
      peer
    }
  })
}

function createPeer (remoteId, dataHandler, initiator = false) {
  const peer = new SimplePeer({ initiator })

  peer.on('signal', data => ws.send(msg('signal', { remoteId, data })))
  peer.on('connect', _ => console.log('peer connect'))
  peer.on('data', dataHandler)

  return peer
}

// TODO: kill the peer?
function removePeer (peers, connectionId) {
  return peers.filter(peer => peer.connectionId !== connectionId)
}

export {
  connect,
  createPeer,
  createPeers,
  removePeer
}