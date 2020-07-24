import Phaser from 'phaser'
import msg from './msg.js'

let updates = []

function startGame (peers) {
  let drawing = false
  let line
  let graphics
  let timeout
  let lines = []

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

    
  }

  function update () {
    if (updates.length) {
      console.log(updates)
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

function update (u) {
  console.log('hello')
  updates = u
}

const game = {
  startGame,
  update
}

export default game