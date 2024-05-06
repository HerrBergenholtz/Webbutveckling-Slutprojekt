let gameElem;
let shipElem;
const timerStep = 50;
var timerRef = null;
var timerRef2 = null;
const shipArr = [
    starter = {
        health: 100,
        src: "../src/space-ship.png",
        shipSpeed: 15,
        width: 70,
        weapon: {
            projectile: "../src/proj-single.gif",
            explosion: "../src/green-explosion.gif",
            fire: "single",
            speed: 6,
            width: 35
        }
    }
];

class Sprite {
    constructor(
        sprite
    ) {
        this.spriteSrc = sprite.src;
        this.x = 0;
        this.y = 0;
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
                boundary.adjustment();
                this.hitBoundary = true;
            }
        });
    } 

    explode() {
        let explosion = document.createElement("img");

        setTimeout(() => {
            this.sprite.style.display = "none";
    
            explosion.src = this.explosionSrc;
            explosion.style.width = this.sprite.style.width;
            explosion.style.left = this.sprite.style.left;
            explosion.style.top = this.sprite.style.top;
            explosion.style.transform = this.sprite.style.transform;
    
            gameElem.appendChild(explosion);
            
        }, 150);

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
        this.weapon = sprite.weapon;
        this.sprite = sprite;
        this.direction = 0;
        this.projectile;
    }

    fly() {
        super.move(false);
    }
    
    fire() {
        this.projectile = new Projectile(this.spriteOriginal, this.x, this.y, this.direction);
        this.projectile.fire();
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
        this.x = x + 15;
        this.y = y + 15;
        this.sprite;
        this.hitBoundary;
        this.direction = dir;
    }

    fire() {
        super.spawn();
        this.sprite.style.transition = "0.2s linear"

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
    shipElem = new Ship(shipArr[0]);
    shipElem.spawn();

    startGame();
    document.addEventListener("keydown", checkKey);
}
window.onload = init;

function startGame() {
    shipElem.fly();
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