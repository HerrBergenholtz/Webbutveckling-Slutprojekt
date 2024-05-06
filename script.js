let gameElem;
let shipElem;
let shipDir = 0;
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
            speed: 10,
            width: 35
        }
    }
];

class Sprite {
    constructor(
        sprite
    ) {
        this.spriteSrc = sprite.src;
        this.health = sprite.health;
        this.weapon = sprite.weapon;
        this.x = 0;
        this.y = 0;
        this.width = sprite.width;
        this.speed = 0;
        this.maxSpeed = sprite.shipSpeed;
        this.sprite;
        this.projectile;
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

    move() {
        const animate = () => {
            let xLimit = gameElem.offsetWidth - this.width;
            let yLimit = gameElem.offsetHeight - this.width;
            let x = parseInt(shipElem.x);
            let y = parseInt(shipElem.y);
            console.log(y, this.y, shipElem.y)

            switch (shipDir) {
                case 0: //Upp  
                    y -= this.speed;
                    if (y < 0) y = 0;
                    break;
                case 1: //Höger
                    x += this.speed;
                    if (x > xLimit) x = xLimit;
                    break;
                case 2: //Ned
                    y += this.speed;
                    if (y > yLimit) y = yLimit;
                    break;
                case 3: //Vänster
                    x -= this.speed;
                    if (x < 0) x = 0;
                    break;
            };

            shipElem.x = x;
            shipElem.y = y;

            this.sprite.style.left = this.x + "px";
            this.sprite.style.top = this.y + "px";

            requestAnimationFrame(animate);
        }

        animate()
    }

    fire() {
        this.projectile = new Projectile(this.weapon, this.x, this.y);
        this.projectile.fire();
        this.travel();
    }

    travel() {
        this.projectile.projectileDirection = shipDir;
        this.projectile.travel();
    }
}

class Player extends Sprite {
    constructor (sprite) {
        super (Player)
    }
}

class Projectile {
    constructor(
        weapon,
        x,
        y
    ) {

        this.projectileSrc = weapon.projectile;
        this.explosionSrc = weapon.explosion;
        this.type = weapon.fire;
        this.speed = weapon.speed;
        this.width = weapon.width;
        this.projectile;
        this.x = x + 15;
        this.y = y + 15;
        this.projectileDirection;
        this.hitBoundary;
    }

    fire() {
        this.projectile = document.createElement("img");
        this.projectile.src = this.projectileSrc;
        this.projectile.style.width = this.width + "px";
        this.projectile.style.transition = "0.2s linear"

        switch (shipDir) {
            case 0:
                this.projectile.style.transform = "rotate(90deg)";
                break;
            case 1:
                this.projectile.style.transform = "rotate(180deg)";
                break;
            case 2:
                this.projectile.style.transform = "rotate(270deg)";
                break;
            case 3:
                this.projectile.style.transform = "rotate(360deg)";
                break;
        }

        this.projectile.style.left = this.x + "px";
        this.projectile.style.top = this.y + "px";
        this.projectile.style.zIndex = "0";
        gameElem.appendChild(this.projectile);
    }

    travel() {
        const animate = () => {
            switch (this.projectileDirection) {
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
            }

            this.projectile.style.left = this.x + "px";
            this.projectile.style.top = this.y + "px";
            this.checkHit(this);
            
            if (this.hitBoundary) {
                console.log("hit");
                this.explode();
            } else {
                requestAnimationFrame(animate);
            }
        };

        animate();
    }

    checkHit(elem) {
        console.log("checkhit");
        const boundaries = [
            { condition: elem.y < 0, adjustment: () => { elem.y = 0; } },
            { condition: elem.x > gameElem.offsetWidth - elem.width, adjustment: () => { elem.x = gameElem.offsetWidth - elem.width; } },
            { condition: elem.y > gameElem.offsetHeight - elem.width, adjustment: () => { elem.y = gameElem.offsetHeight - elem.width; } },
            { condition: elem.x < 0, adjustment: () => { elem.x = 0; } }
        ];

        boundaries.forEach(boundary => {
            if (boundary.condition) {
                boundary.adjustment();
                elem.hitBoundary = true;
            }
        });
    }

    explode() {
        this.projectile.style.display = "none";
        let explosion = document.createElement("img");

        explosion.src = this.explosionSrc;
        explosion.style.width = this.projectile.style.width;
        explosion.style.left = this.projectile.style.left;
        explosion.style.top = this.projectile.style.top;
        explosion.style.transform = this.projectile.style.transform;

        gameElem.appendChild(explosion);
        console.log("expl");

        setTimeout(() => {
            console.log("expl dis")
            explosion.style.display = "none";
            explosion.remove();
            this.projectile.remove();
        }, 300);
    }
}

class Enemy {

}

function init() {
    gameElem = document.getElementById("game");
    shipElem = new Sprite(shipArr[0]);
    shipElem.spawn();

    startGame();
    document.addEventListener("keydown", checkKey);
}
window.onload = init;

function startGame() {
    shipElem.move();
}

function checkKey(e) {
    let k = e.keyCode;

    switch (k) {
        case 16: //Shift
            if (shipElem.speed < shipElem.maxSpeed) shipElem.speed += 5;
            break;
        case 17: //Ctrl
            if (shipElem.speed > 0) shipElem.speed -= 5;
            break;
        case 32: //Blanksteg
            shipElem.fire();
            break;
        case 37://Vänster
            shipElem.rotate(270);
            shipDir = 3;
            break;
        case 38://Upp
            shipElem.rotate(360);
            shipDir = 0;
            break;
        case 39://Höger
            shipElem.rotate(90);
            shipDir = 1;
            break;
        case 40://Ner
            shipElem.rotate(180);
            shipDir = 2;
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