let onlineCircles = [];
let foods = [];
let index_element = 0;
const canvasWidth = 5000;
const canvasHeight = 5000;
const playerSpeed = 20;

const express = require('express');
const app = express();
const server = app.listen(3000, "0.0.0.0", () => {
    console.log("server is listening on port 3000");
})

const Food = require('./Food');
const io = require('socket.io')(server);

for (let index = 0; index < 1000; index++) {
    foods.push(new Food(index));
}

const getCircle = (socketId) => onlineCircles.find((e, i) => {
    index_element = i;
    i += 1;
    return e.socketId === socketId
});


io.sockets.on("connection", socket => {
    console.log("a client connected");
    socket.on('add-me-as-player', data => {
        data.socketId = socket.id;
        onlineCircles.push(data);
        socket.emit('set-canvas-size', canvasWidth, canvasHeight);
        socket.broadcast.emit('place-me-at-all-clients-screen', data);
        socket.emit('place-all-clients-to-my-screen', onlineCircles);
        socket.emit('place-all-foods', foods);

    })

    socket.on('move-command-triggered', (command) => {
        const circle = getCircle(socket.id);

        foods.forEach((element, index) => {
            const dx = circle.x - element.x;
            const dy = circle.y - element.y;
            const distance = (dx * dx + dy * dy) ** (1 / 2);
            if (distance < circle.size + element.size) {
                circle.size++;
                foods[index] = new Food(index);
                io.sockets.emit('remove-food', foods[index]);
            }
        })
        
        onlineCircles.forEach((element, index) => {
            if (circle != element) {
                const dx = circle.x - element.x;
                const dy = circle.y - element.y;
                const distance = (dx * dx + dy * dy) ** (1 / 2);
                if (distance < circle.size + element.size) {
                    if (circle.size > element.size) {
                        circle.size += element.size;
                        socket.broadcast.emit('is-eaten', element.id);
                    }
                    else {
                        element.size += circle.size;
                        socket.emit('is-eaten', circle.id);
                        onlineCircles[index] = element;

                    }
                }
            }
        })


        switch (command) {
            case 'up':
                circle.y > 0 ? circle.y = circle.y - playerSpeed : circle.y = 0;
                break;
            case 'down':
                circle.y < canvasWidth - circle.size ? circle.y = circle.y + playerSpeed : circle.y = canvasWidth - circle.size;
                break;
            case 'left':
                circle.x > 0 ? circle.x = circle.x - playerSpeed : circle.x = 0;
                break;
            case 'right':
                circle.x < canvasHeight - circle.size ? circle.x = circle.x + playerSpeed : circle.x = canvasHeight - circle.size;
                break;
        }
        socket.emit('move-canvas', circle, index_element);
        io.sockets.emit('move-at-all', circle, index_element);

    })

    socket.on('disconnect', () => {
        console.log('a client disconnected');
        let _id;
        onlineCircles.forEach((element, index) => {
            if (element.socketId === socket.id) {
                _id = index;
                onlineCircles.splice(index, 1);
            }
        });
        socket.broadcast.emit('remove-me-from-all-clients-screen', _id);
    })

})
app.use(express.static(__dirname + '/public'));