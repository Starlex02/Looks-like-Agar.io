function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

class Food {
    constructor(id) {
        this.id = id;
        this.x = random(0, 4800);
        this.y = random(0, 4800);
        this.color = `rgba(${random(0, 255)},${random(0, 255)},${random(0, 255)})`
        this.size = 5;
    }
}

module.exports = Food;