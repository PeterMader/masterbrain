document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('canvas')
  const ctx = canvas.getContext('2d')
  const colorSelector = document.getElementById('colors')
  const restartButton = document.getElementById('restart')
  const attemptButton = document.getElementById('attempt')
  const gameWrapper = document.getElementById('game')
  const messageWrapper = document.getElementById('message')
  const closeMessageButton = document.getElementById('close-msg')
  const messageContent = document.getElementById('msg-content')

  const FIELD_SIZE = 40
  const MAX_ATTEMPTS = 10

  const COLORS = ['#ffeb3b', '#f44336', '#ab47bc', '#0d47a1', '#0097a7', '#1b5e20', '#9ccc65', '#212121']
  const IS_CORRECT = '#388e3c'
  const IS_INCLUDED = '#ffeb3b'
  const IS_NOT_INCLUDED = '#f44336'
  const CURRENT_UNSET = '#9e9e9e'
  const FUTURE_UNSET = '#bdbdbd'

  const game = {}
  game.colorSequence = []
  game.currentColorSequence = []
  game.history = []
  game.result = []
  game.selectedColor = COLORS[0]
  game.attemptCount = 0
  game.colorButton = null
  game.isPlaying = false

  // Create a random color sequence
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

  // Compare the game's color sequence with the user input
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

  // Check whether the current attempt can be submitted
  game.canSubmit = () => {
    return game.currentColorSequence.every((value) => {
      return !!value
    }) && game.currentColorSequence.length === 4
  }

  // Initialize or re-initialize the game
  game.init = () => {
    game.isPlaying = true
    game.createColorSequence()
    game.history = []
    game.currentColorSequence = Array.apply(null, Array(4))
    game.attemptCount = 0
    game.draw()
  }

  // Draw the scene
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

  // Display the win mask
  game.win = () => {
    game.showMessage('You win!', 'Restart the game')
  }

  // Evaluate the current attempt
  game.evaluate = () => {
    game.compareColorSequences()
    if (game.result.every((value) => value === IS_CORRECT)) {
      game.win()
    }
  }

  // Set the field with the <index> to the currently selected color
  game.setField = (index) => {
    const currentIndex = game.currentColorSequence.indexOf(game.selectedColor)
    if (currentIndex !== -1) {
      game.currentColorSequence[currentIndex] = game.currentColorSequence[index]
    }
    game.currentColorSequence[index] = game.selectedColor
    game.draw()
    return game
  }

  // Submit the current attempt
  game.submit = () => {
    if (!game.isPlaying) {
      return
    }
    if (game.attemptCount >= MAX_ATTEMPTS - 1) {
      game.init()
      game.showMessage('You only have ' + MAX_ATTEMPTS + ' attempts!')
      return
    }
    if (!game.canSubmit()) {
      game.showMessage('All fields of the current row must be filled!')
      return
    }
    game.evaluate()
    game.history[game.attemptCount] = {
      colors: game.currentColorSequence.slice(),
      result: game.result.sort()
    }
    game.attemptCount += 1
    game.result = Array.apply(null, Array(4))
    game.draw()
  }

  game.showMessage = (msg, btnText, onClose) => {
    messageContent.textContent = msg
    closeMessageButton.textContent = btnText || 'OK'
    messageWrapper.classList.add('msg-active')
    gameWrapper.classList.add('faded-out')
    if (typeof onClose !== 'function') {
      return
    }
    let handler
    closeMessageButton.addEventListener('click', handler = () => {
      closeMessageButton.removeEventListener('click', handler)
      onClose()
    })
  }

  game.hideMessage = () => {
    messageWrapper.classList.remove('msg-active')
    gameWrapper.classList.remove('faded-out')
  }

  // Initialize the color buttons
  let colorIndex = 0
  for (; colorIndex < COLORS.length; colorIndex += 1) {
    const colorButton = document.createElement('div')
    const thisColorIndex = colorIndex
    colorButton.style.background = COLORS[colorIndex]
    colorButton.classList.add('color-button')
    colorSelector.appendChild(colorButton)

    colorButton.addEventListener('click', () => {
      game.colorButton.classList.remove('color-button-selected')
      game.colorButton = colorButton
      game.selectedColor = COLORS[thisColorIndex]
      colorButton.classList.add('color-button-selected')
    })

    if (thisColorIndex === 0) {
      game.colorButton = colorButton
      game.selectedColor = COLORS[0]
      colorButton.classList.add('color-button-selected')
    }
  }

  canvas.addEventListener('click', (e) => {
    if (!game.isPlaying) {
      return
    }
    const clientRect = canvas.getBoundingClientRect()
    const x = e.clientX - clientRect.left
    const index = Math.floor((x - 10) / FIELD_SIZE)
    if (index > 3) {
      return
    }
    game.setField(index)
  })

  game.draw()

  restartButton.addEventListener('click', game.init)
  attemptButton.addEventListener('click', game.submit)
  closeMessageButton.addEventListener('click', game.hideMessage)

  game.showMessage('Start the game!', 'OK', game.init)

  if (window.DEBUG) {
    window.game = game
  }
})
