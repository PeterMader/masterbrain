document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('canvas')
  const ctx = canvas.getContext('2d')
  const colorSelector = document.getElementById('colors')
  const restartButton = document.getElementById('restart')
  const attemptButton = document.getElementById('attempt')

  const FIELD_SIZE = 40
  const MAX_ATTEMPTS = 10

  const COLORS = ['#212121', '#fafafa', '#8d6e63', '#f44336', '#4caf50', '#0d47a1', '#ffeb3b', '#ab47bc']
  const IS_CORRECT = '#388e3c'
  const IS_INCLUDED = '#ffeb3b'
  const IS_NOT_INCLUDED = '#f44336'
  const CURRENT_UNSET = '#bdbdbd'
  const FUTURE_UNSET = '#e0e0e0'

  const game = {}
  game.colorSequence = []
  game.currentColorSequence = []
  game.history = []
  game.result = []
  game.selectedColor = COLORS[0]
  game.attemptCount = 0
  game.colorButton = null

  // Creates a random color sequence
  game.createColorSequence = () => {
    const cs = game.colorSequence
    let index = 0
    for (; index < 4; index += 1) {
      let color
      do {
        color = COLORS[Math.floor(Math.random() * 8)]
      } while (cs.indexOf(color) !== -1)
      cs[index] = color
    }
  }
  game.compareColorSequences = () => {
    const result = game.result = Array.apply(null, Array(4))
    let colIndex = 0
    for (; colIndex < 4; colIndex += 1) {
      const color = game.currentColorSequence[colIndex]
      if (color === game.colorSequence[colIndex]) {
        // The color is at the right spot.
        result[colIndex] = IS_CORRECT
      } else if (game.colorSequence.indexOf(color) !== -1) {
        // The color sequence contains the color
        result[colIndex] = IS_INCLUDED
      } else {
        // The color sequence does not contain the color
        result[colIndex] = IS_NOT_INCLUDED
      }
    }
  }
  game.canSubmit = () => {
    return game.currentColorSequence.every((value) => {
      return !!value
    }) && game.currentColorSequence.length === 4
  }
  game.init = () => {
    game.createColorSequence()
    game.history = []
    game.attemptCount = 0
    game.draw()
  }
  game.draw = () => {
    // Draw the sequence history
    let lineIndex = 0
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    for (; lineIndex < MAX_ATTEMPTS; lineIndex += 1) {
      const entry = game.history[lineIndex] || {
        colors: [],
        result: []
      }
      let colIndex = 0
      for (; colIndex < 4; colIndex += 1) {
        ctx.fillStyle = entry.colors[colIndex] || FUTURE_UNSET
        ctx.fillRect(colIndex * FIELD_SIZE + 10, lineIndex * FIELD_SIZE + 10, FIELD_SIZE - 2, FIELD_SIZE - 2)
        ctx.fillStyle = entry.result[colIndex] || FUTURE_UNSET
        ctx.fillRect(colIndex * 10 + 220, lineIndex * FIELD_SIZE + 10, 8, 8)
      }
    }

    // Draw the currently selected sequence
    let colIndex = 0
    for (; colIndex < 4; colIndex += 1) {
      ctx.fillStyle = game.currentColorSequence[colIndex] || CURRENT_UNSET
      ctx.fillRect(colIndex * FIELD_SIZE + 10, game.attemptCount * FIELD_SIZE + 10, FIELD_SIZE - 2, FIELD_SIZE - 2)
    }
  }
  game.win = () => {
    window.alert('You win!')
  }
  game.evaluate = () => {
    game.compareColorSequences()
    if (game.result.every((value) => value === IS_CORRECT)) {
      game.win()
    }
  }
  game.setField = (index) => {
    const currentIndex = game.currentColorSequence.indexOf(game.selectedColor)
    if (currentIndex !== -1) {
      game.currentColorSequence[currentIndex] = game.currentColorSequence[index]
    }
    game.currentColorSequence[index] = game.selectedColor
    game.draw()
  }
  game.submit = () => {
    if (game.attemptCount >= MAX_ATTEMPTS) {
      game.init()
      alert('You only have ' + MAX_ATTEMPTS + ' attempts!')
      return
    }
    if (!game.canSubmit()) {
      return
    }
    game.evaluate()
    game.history[game.attemptCount] = {
      colors: game.currentColorSequence,
      result: game.result.sort()
    }
    game.attemptCount += 1
    game.currentColorSequence = Array.apply(null, Array(4))
    game.result = Array.apply(null, Array(4))
    game.draw()
  }

  let colorIndex = 0
  for (; colorIndex < COLORS.length; colorIndex += 1) {
    const colorButton = document.createElement('div')
    const thisColorIndex = colorIndex
    colorButton.style.background = COLORS[colorIndex]
    colorButton.style.height = colorButton.style.width = '50px'
    colorButton.style.display = 'inline-block'
    colorButton.style.border = '2px solid #FFFFFF'
    colorSelector.appendChild(colorButton)

    colorButton.addEventListener('click', () => {
      game.colorButton.style.border = '2px solid #FFFFFF'
      game.colorButton = colorButton
      game.selectedColor = COLORS[thisColorIndex]
      colorButton.style.border = '2px solid #000000'
    })

    if (thisColorIndex === 0) {
      game.colorButton = colorButton
      game.selectedColor = COLORS[0]
      colorButton.style.border = '2px solid #000000'
    }
  }

  canvas.addEventListener('click', (e) => {
    const clientRect = canvas.getBoundingClientRect()
    const x = e.clientX - clientRect.left
    const index = Math.floor((x - 10) / FIELD_SIZE)
    if (index > 3) {
      return
    }
    game.setField(index)
  })

  restartButton.addEventListener('click', game.init)
  attemptButton.addEventListener('click', game.submit)


  game.init()

  if (window.DEBUG) {
    window.game = game
  }
})
