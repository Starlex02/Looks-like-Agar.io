let socket;
let onlineCircles = [];
let foods = [];

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

let canvasWidth = canvas.width = 0;
let canvasHeight = canvas.height = 0;

function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomRGB() {
    return `rgb(${random(0, 255)},${random(0, 255)},${random(0, 255)})`;
}

$(document).ready(() => {
    const promise = new Promise((resolve, reject) => {
        resolve(prompt("Please enter your name", "Harry Potter"))
        reject('')
    })

    promise.then(person => {
        socket = io.connect();

        let circle = new Circle(person);

        socket.emit('add-me-as-player', circle)

        socket.on('set-canvas-size', (width, height) => {
            canvasWidth = canvas.width = width;
            canvasHeight = canvas.height = height;
            ctx.translate(innerWidth / 2 - circle.x, innerHeight / 2 - circle.y);
        })

        socket.on('place-all-clients-to-my-screen', data => {
            data.forEach(element => {
                onlineCircles.push(element);
            });
        })

        socket.on('place-me-at-all-clients-screen', data => {
            onlineCircles.push(data);
        })

        socket.on('place-all-foods', data => {
            data.forEach(food => {
                foods.push(food);
            });
        });

        socket.on('remove-food', element => {
            foods[element.id] = element;
        });

        socket.on('remove-me-from-all-clients-screen', id => {
            onlineCircles.splice(id, 1);
        })

        socket.on('is-eaten', id => {
            if (circle.id == id)
                location.reload();
        })

        document.onkeydown = check_key;
        function check_key(e) {
            e = e || window.event;
            let command = ""
            switch (e.keyCode) {
                case 38:
                    command = "up";
                    break;
                case 40:
                    command = "down";
                    break;
                case 37:
                    command = "left";
                    break;
                case 39:
                    command = "right";
                    break;
            }
            socket.emit('move-command-triggered', command);
        }

        socket.on('move-at-all', (data, index_element) => {
            onlineCircles[index_element].x = data.x;
            onlineCircles[index_element].y = data.y;
            onlineCircles[index_element].size = data.size;
        })

        socket.on('move-canvas', (data, index_element) => {
            ctx.translate(onlineCircles[index_element].x - data.x, onlineCircles[index_element].y - data.y);
        })

        loop();
    })

}
);


function loop() {
    ctx.strokeStyle = "green";
    ctx.strokeRect(0, 0, canvasWidth, canvasHeight);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    for (const food of foods) {
        ctx.beginPath();
        ctx.fillStyle = food.color;
        ctx.arc(food.x, food.y, food.size, 0, 2 * Math.PI);
        ctx.fill();
    }

    for (const circle of onlineCircles) {
        ctx.beginPath();
        ctx.fillStyle = 'white';
        ctx.arc(circle.x, circle.y, circle.size, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.fillStyle = circle.color;
        ctx.arc(circle.x, circle.y, circle.size * 0.9, 0, 2 * Math.PI);
        ctx.fill();
    }

    requestAnimationFrame(loop);
}

class Circle {
    constructor(name, socketId) {
        this.id = random(0, 99999);
        this.socketId = socketId;
        this.size = 10;
        this.name = name;
        this.x = random(0, 4800);
        this.y = random(0, 4800);
        this.color = `rgb(${random(0, 255)},${random(0, 255)},${random(0, 255)})`
    }
}

