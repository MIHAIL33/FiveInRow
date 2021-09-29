const startBtn = document.querySelector('#start')
const screens = document.querySelectorAll('.screen')
const board = document.querySelector('#board')

/////////////////////////////////////////////////////////////////////////////////////////
//Игровые настройки
const GAME_BOARD_WIDTH = 5
const GAME_BOARD_HEIGHT = 5
const SIZE_SQUARE = 100 //Длина стороны квадрата в пикселях
const SQUARE_LOCK_ID = [1, 3, 11, 13, 21, 23] //Id ячеек которые будут заблокированы
const SQUARE_EMPTY_ID = [6, 8, 16, 18] //Id ячеек которые остануться пустыми

const Colors = Object.freeze({
    FIRST: { name: 'red', rgb: 'rgb(255, 0, 0)' },
    SECOND: { name: 'blue', rgb: 'rgb(0, 0, 255)' },
    THIRD: { name: 'green', rgb: 'rgb(0, 255, 0)' },
    LOCK: { name: 'black', rgb: 'rgb(0, 0, 0)' },
    EMPTY: { name: 'none', rgb: 'none'}
})

const seqColors = [Colors.FIRST, Colors.SECOND, Colors.THIRD, Colors.FIRST, Colors.SECOND,
                   Colors.THIRD, Colors.FIRST, Colors.SECOND, Colors.THIRD, Colors.FIRST,
                   Colors.SECOND, Colors.THIRD, Colors.FIRST, Colors.SECOND, Colors.THIRD]

/////////////////////////////////////////////////////////////////////////////////////////
//Перемешиваем массив
function shuffle(array) { 
    FisherYatesShuffle(array)
}

//Перемешиваем массив методом Фишера-Йетса
function FisherYatesShuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random()*(i + 1))
        temp = array[i]
        array[i] = array[j]
        array[j] = temp
    }
}

/////////////////////////////////////////////////////////////////////////////////////////
//Прослушка на старт игры, создание таймера и старт игры
startBtn.addEventListener('click', event => {
    event.preventDefault()
    screens[0].classList.add('up')

    const cirlcles = document.querySelectorAll('.circle')
    cirlcles[0].style.backgroundColor = Colors.FIRST.rgb
    cirlcles[1].style.backgroundColor = Colors.SECOND.rgb
    cirlcles[2].style.backgroundColor = Colors.THIRD.rgb

    startGame()
})

let timerInterval
function startTimer() {
    const timer = document.querySelector('#timer')
    let time = 0
    timerInterval = setInterval(() => {
        time++
        timer.innerHTML = `Time: ${time} s`
    }, 1000)
}

function startGame() {
    shuffle(seqColors)

    const squares = generateSquares()

    for (let i = 0; i < GAME_BOARD_WIDTH*GAME_BOARD_HEIGHT; i++) {
        createSquares(squares[i])
    }

    startTimer()
}

/////////////////////////////////////////////////////////////////////////////////////////

class Squares {
    id        
    width
    height
    positionX   
    positionY 
    color = Colors.EMPTY 
    lock = false 
    empty = false 

    constructor(id, width, height, positionX, positionY) {
        this.id = id
        this.width = width
        this.height = height
        this.positionX = positionX
        this.positionY = positionY
    }

    setLock() {
        this.lock = true
        this.color = Colors.LOCK
    }

    setEmpty() {
        this.empty = true
        this.color = Colors.EMPTY
    }

    setColor(color) {
        this.color = color
    }
}

/////////////////////////////////////////////////////////////////////////////////////////
//Генерация массива объектов класса Squares
function generateSquares() {
    let squares = []
    let count = 0
    for (let i = 0; i < GAME_BOARD_WIDTH; i++) {
        for (let j = 0; j < GAME_BOARD_HEIGHT; j++) {
            let id = GAME_BOARD_HEIGHT*i + j
            squares[id] = new Squares(id, SIZE_SQUARE, SIZE_SQUARE, SIZE_SQUARE * j, SIZE_SQUARE * i)
            if (SQUARE_LOCK_ID.includes(id)) {
                squares[id].setLock()
                continue
            }
            if (SQUARE_EMPTY_ID.includes(id)) {
                squares[id].setEmpty()
                continue
            }
            squares[id].setColor(seqColors[count])
            count++
        }
    }
    return squares
}

/////////////////////////////////////////////////////////////////////////////////////////
//Создаём на основе объектов класса элементы на странице
function createSquares(square) {
    const newElement = document.createElement('div')
    newElement.classList.add('square')
    newElement.style.width = `${square.width}px`
    newElement.style.height = `${square.height}px`
    newElement.style.top = `${square.positionY}px`
    newElement.style.left = `${square.positionX}px`
    newElement.style.backgroundColor = square.color.rgb
    newElement.id = square.id
    newElement.lock = square.lock
    newElement.empty = square.empty

    if (newElement.empty) {
        newElement.style.transition = 'none'
        newElement.style.zIndex = 1
    }

    newElement.addEventListener('click', addFocus)

    board.append(newElement)
}

/////////////////////////////////////////////////////////////////////////////////////////
/*
Добавляем фокус на квадрат. Если при нажатии на квадрат, другой квадрат уже имел фокус, 
то делаем перестановку и проверяем на победу.
*/
let pastFocusSquare = ''
function addFocus() {
    if (!event.target.lock) {
        if (event.target.empty) {
            if (pastFocusSquare === '') {
                return
            } else {
                removeFocus()
                changeSquares(event.target)
                if (isWin()) {
                    tryFinishGame()
                }
            }
        } else {
            if (pastFocusSquare === '') {
                removeFocus()
                event.target.classList.add('focus')
                pastFocusSquare = event.target
            } else {
                removeFocus()
                changeSquares(event.target)
                if (isWin()) {
                    tryFinishGame()
                }
            }
        }
    } else {
        removeFocus()
    }
}

/////////////////////////////////////////////////////////////////////////////////////////
//Удаляем фокус со всех квадратов
function removeFocus() {
    const squares = document.querySelectorAll('.square')
    squares.forEach(elem => { elem.classList.remove('focus')})
}

/////////////////////////////////////////////////////////////////////////////////////////
//Делаем перестановку с соседними квадратами, если нефозможно - меняем фокус
function changeSquares(square) {
    if ((Math.abs(square.id - pastFocusSquare.id) === 1) || (Math.abs(square.id - pastFocusSquare.id) === GAME_BOARD_WIDTH)) {
        if (square.empty === true) {
            const temp = {
                id: square.id,
                top: square.style.top,
                left: square.style.left
            }
            
            square.id = pastFocusSquare.id
            square.style.top = pastFocusSquare.style.top
            square.style.left = pastFocusSquare.style.left
        
            pastFocusSquare.id = temp.id
            pastFocusSquare.style.top = temp.top
            pastFocusSquare.style.left = temp.left
    
            pastFocusSquare = ''
            
            doCountStep(true)
        } else {
            removeFocus()
            if (!square.empty) {
                square.classList.add('focus')
                pastFocusSquare = square
            }  
        }  
    } else {
        removeFocus()
        if (!square.empty) {
            square.classList.add('focus')
            pastFocusSquare = square
        } 
    }
}

/////////////////////////////////////////////////////////////////////////////////////////
//Cчитаем количество перестановок
let countStep = 0
function doCountStep(doStep) {
    const steps = document.querySelector('#steps')
    if (doStep) {
        countStep++
    } else {
        countStep = 0
    }
    steps.innerHTML = `Count steps: ${countStep}`
}

/////////////////////////////////////////////////////////////////////////////////////////
//Проверяем три столбца на одинаковый цвет
function isWin() {
    const cirlcles = document.querySelectorAll('.circle')
    const squares = document.querySelectorAll('.square')
    let sortSquears = Array.from(squares).sort(function(a, b) {return a.id - b.id})
    
    let first = true 
    let second = true
    let third = true

    for (let i = 0; i < GAME_BOARD_WIDTH*GAME_BOARD_HEIGHT; i += 5){
        if (sortSquears[i].style.backgroundColor !== Colors.FIRST.rgb) {
            first = false
            break
        }
    }  

    if (first) {
        cirlcles[0].style.animation = 'fiveInRow 0.3s linear infinite'
    } else {
        cirlcles[0].style.animation = ''
    }

    for (let i = 2; i < GAME_BOARD_WIDTH*GAME_BOARD_HEIGHT; i += 5){
        if (sortSquears[i].style.backgroundColor !== Colors.SECOND.rgb) {
            second = false
            break
        }
    }

    if (second) {
        cirlcles[1].style.animation = 'fiveInRow 0.3s linear infinite'
    } else {
        cirlcles[1].style.animation = ''
    }

    for (let i = 4; i < GAME_BOARD_WIDTH*GAME_BOARD_HEIGHT; i += 5){
        if (sortSquears[i].style.backgroundColor !== Colors.THIRD.rgb) {
            third = false
            break
        }
    }

    if (third) {
        cirlcles[2].style.animation = 'fiveInRow 0.3s linear infinite'
    } else {
        cirlcles[2].style.animation = ''
    }

    return first && second && third
}

/////////////////////////////////////////////////////////////////////////////////////////
//Завершаем игру, останавливаем таймер
function tryFinishGame() { 
    clearInterval(timerInterval)

    const squares = document.querySelectorAll('.square')

    squares.forEach(elem => {
        elem.removeEventListener('click', addFocus)
    })

    const cirlcles = document.querySelectorAll('.circle')
    cirlcles.forEach(elem => {
        elem.style.animation = ''
    })

    const winP = document.createElement('p')
    winP.classList.add('congratulations')
    winP.innerHTML = `You win!<br><button class="repeat" id="repeat">REPEAT</button>`
    screens[1].append(winP)

    const repeatBtn = document.querySelector('#repeat')
    repeatBtn.addEventListener('click', repeatGame)
}

/////////////////////////////////////////////////////////////////////////////////////////
//Сбрасываем интерфейс и начинаем новую игру
function repeatGame() {
    const timer = document.querySelector('#timer')
    timer.innerHTML = `Time: 0 s`
    doCountStep(false)

    const squares = document.querySelectorAll('.square')

    squares.forEach(elem => {
        elem.remove()
    })

    const winP = document.querySelector('.congratulations')
    winP.remove()

    startGame()
}
