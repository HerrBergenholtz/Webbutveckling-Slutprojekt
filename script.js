let gameElem;
let shipElem;
const timerStep = 50;
var timerRef = null;
var timerRef2 = null;

const spriteArr = [
    enviroments = {
        space1: "../src/space-background.jpg",
        space2: "../src/space-background-2.png"
    }
];
const shipArr = [
    starter = {
        health: 100,
        src: "../src/space-ship.png",
        shipSpeed: 6,
        width: 70,
        weapon: {
            projectile: "../src/proj-single.gif",
            explosion: "../src/green-explosion.gif",
            explosionWidth: 35,
            speed: 10,
            cooldown: 300,
            width: 35,
            offset: -20
        }
    },

    nomad = {
        health: 130,
        src: "../src/space-ship-2.png",
        shipSpeed: 4,
        width: 50,
        weapon: {
            projectile: "../src/proj-fireball.gif",
            explosion: "../src/explosion.gif",
            explosionWidth: 100,
            speed: 5,
            cooldown: 1000,
            width: 60,
            offset: 5
        }
    },

    standardEnemy = {

    }
];

class Sprite {
    constructor(
        sprite
    ) {
        this.spriteSrc = sprite.src;
        this.x = 600;
        this.y = 400;
        this.width = sprite.width;
        this.speed = 0;
        this.spriteOriginal = sprite;
        this.sprite;
        this.hitBoundary;
    }
    
    spawn() {
        this.sprite = document.createElement("img");
        this.sprite.src = this.spriteSrc;
        this.sprite.style.width = this.width + "px";
        gameElem.appendChild(this.sprite);

        this.sprite.style.left = this.x + "px";
        this.sprite.style.top = this.y + "px";
        this.sprite.style.transition = "0.2s ease-out";
    }

    background() {
        gameElem.style.backgroundImage = "url(" + this.spriteSrc + ")";
    }

    rotate(deg) {
        let currentRotation = parseInt((this.sprite.style.transform.match(/rotate\(([^)]+)\)/) || [])[1]) || 0;
        let newRotation = deg;

        newRotation = (newRotation % 360 + 360) % 360;

        let rotationDiff = newRotation - currentRotation;

        rotationDiff = (rotationDiff + 180) % 360 - 180;

        if (rotationDiff > 180) {
            rotationDiff -= 360;
        } else if (rotationDiff <= -180) {
            rotationDiff += 360;
        }

        let finalRotation = currentRotation + rotationDiff;

        this.sprite.style.transform = "rotate(" + finalRotation + "deg)";
    }

    move(explode) {
        const animate = () => {
            switch (this.direction) {
                case 0: //Upp  
                    this.y -= this.speed;
                    break;
                case 1: //Höger
                    this.x += this.speed;
                    break;
                case 2: //Ned
                    this.y += this.speed;
                    break;
                case 3: //Vänster
                    this.x -= this.speed;
                    break;
            };

            this.sprite.style.left = this.x + "px";
            this.sprite.style.top = this.y + "px";
            this.checkHit(this);

            if (explode && this.hitBoundary) {
                this.explode();
            } else {
                requestAnimationFrame(animate);
            }
        }

        animate()
    }

    checkHit() {
        const boundaries = [
            { condition: this.y < 0, adjustment: () => { this.y = 0; } },
            { condition: this.x > gameElem.offsetWidth - this.width, adjustment: () => { this.x = gameElem.offsetWidth - this.width; } },
            { condition: this.y > gameElem.offsetHeight - this.width, adjustment: () => { this.y = gameElem.offsetHeight - this.width; } },
            { condition: this.x < 0, adjustment: () => { this.x = 0; } }
        ];

        boundaries.forEach(boundary => {
            if (boundary.condition) {
                setTimeout(boundary.adjustment(),100);
                this.hitBoundary = true;
            }
        });
    } 

    explode() {
        let explosion = document.createElement("img");

        this.sprite.style.display = "none";

        explosion.src = this.explosionSrc;
        explosion.style.width = this.explosionWidth + "px";
        explosion.style.left = this.sprite.style.left;
        explosion.style.top = this.sprite.style.top;
        explosion.style.transform = this.sprite.style.transform;

        gameElem.appendChild(explosion);
            


        setTimeout(() => {
            explosion.style.display = "none";
            explosion.remove();
            this.sprite.remove();
        }, 400);
    }
}

class Ship extends Sprite {
    constructor (sprite) {
        super(sprite);
        this.health = sprite.health;
        this.maxSpeed = sprite.shipSpeed;
        this.cooldown = sprite.weapon.cooldown
        this.weapon = sprite.weapon;
        this.sprite = sprite;
        this.direction = 0;
        this.shooting = false;
        this.projectile;
    }

    fly() {
        super.move(false);
    }

    fire() {
        this.shooting = !this.shooting;
        console.log("fire");
    
        const loop = () => {
            this.projectile = new Projectile(this.spriteOriginal, this.x, this.y, this.direction);
            this.projectile.fire();
    
            setTimeout(() => {
                if (this.shooting) {
                    loop();
                }
            }, this.cooldown);
        };

        if (this.shooting) {
            loop();
        }
    }
    
}

class Projectile extends Ship {
    constructor(
        sprite,
        x,
        y,
        dir
    ) {
        super(sprite);
        
        this.spriteSrc = sprite.weapon.projectile;
        this.explosionSrc = sprite.weapon.explosion;
        this.type = sprite.weapon.fire;
        this.speed = sprite.weapon.speed;
        this.width = sprite.weapon.width;
        this.explosionWidth = sprite.weapon.explosionWidth;
        this.offset = sprite.weapon.offset;
        this.x = x - this.offset;
        this.y = y - this.offset;
        this.sprite;
        this.hitBoundary;
        this.direction = dir;
    }

    fire() {
        console.log(this.offset, this.y)
        this.spawn();
        this.sprite.style.transition = "none";

        switch (this.direction) {
            case 0:
                this.sprite.style.transform = "rotate(90deg)";
                break;
            case 1:
                this.sprite.style.transform = "rotate(180deg)";
                break;
            case 2:
                this.sprite.style.transform = "rotate(270deg)";
                break;
            case 3:
                this.sprite.style.transform = "rotate(360deg)";
                break;
        }

        this.sprite.style.zIndex = "0";
        gameElem.appendChild(this.sprite);

        this.travel();
    }

    travel() {
        super.move(true);
    }
}

class Enemy {

}

function init() {
    gameElem = document.getElementById("game");
    shipElem = new Ship(shipArr[1]);
    
    startGame();
    document.addEventListener("keydown", checkKey);
}
window.onload = init;

function startGame() {
    gameElem.style.background = "url(" +  spriteArr[0].space2 + ") no-repeat center";
    gameElem.style.backgroundSize = "cover";
    shipElem.spawn();
    shipElem.fly();
    drawStats();
}

function drawStats() {
    const draw = (elem, src, alt) => {
        elem.src = src;
        elem.alt = alt;
        elem.style.width = "50px";
        elem.style.height = "50px";
    }

    let statusElem = document.createElement("div");
    statusElem.style.width = "100%";
    statusElem.style.height = "50px";
    statusElem.style.display = "flex";
    statusElem.style.justifyContent = "space-between";

    let healthElem = document.createElement("div");
    let pointsElem = document.createElement("div");

    let healthSprite = document.createElement("img");
    let pointsSprite = document.createElement("img");

    draw(healthSprite, "../src/pixel-heart.png", "Hälsa");
    draw(pointsSprite, "../src/pixel-coin.png", "Poäng");

    let healthCounter = document.createElement("span");
    let pointsCounter = document.createElement("span");
    
    healthCounter.innerText = shipElem.health;

    healthElem.appendChild(healthSprite);
    healthElem.appendChild(healthCounter);
    pointsElem.appendChild(pointsSprite);

    statusElem.appendChild(healthElem);
    statusElem.appendChild(pointsElem);

    gameElem.appendChild(statusElem);
}

function checkKey(e) {
    let k = e.keyCode;

    switch (k) {
        case 16: //Shift
            if (shipElem.speed < shipElem.maxSpeed) shipElem.speed += 2;
            break;
        case 17: //Ctrl
            if (shipElem.speed > 0) shipElem.speed -= 2;
            break;
        case 32: //Blanksteg
            shipElem.fire();
            break;
        case 37://Vänster
            shipElem.rotate(270);
            shipElem.direction = 3;
            break;
        case 38://Upp
            shipElem.rotate(360);
            shipElem.direction = 0;
            break;
        case 39://Höger
            shipElem.rotate(90);
            shipElem.direction = 1;
            break;
        case 40://Ner
            shipElem.rotate(180);
            shipElem.direction = 2;
            break;
    }
}

function elementsOverlap(el1, el2) {
	//Här använder jag mig av metoden getBoundingClientRect() vilket ger mig storlek och position på elementen som objekt.
	const el1Properties = el1.getBoundingClientRect();
	const el2Properties = el2.getBoundingClientRect();
	//Funktionen returnerar false om någon av dessa vilkor möts, vilkoren jämför top, bottom, left och right av de två elementen.
	return !(
		el1Properties.top > el2Properties.bottom ||
		el1Properties.right < el2Properties.left ||
		el1Properties.bottom < el2Properties.top ||
		el1Properties.left > el2Properties.right
	);
}

async function sussa(sött) {
    return new Promise((resolve) => setTimeout(resolve, sött));
}