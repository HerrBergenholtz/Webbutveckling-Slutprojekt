let gameElem;
let shipElem;
let shipDir = 0;
let step = 0;
const timerStep = 50;
var timerRef = null;
var timerRef2 = null;

const shipArr = [
    starter = {
        health: 100,
        src: "../src/space-ship.png",
        width: 70,
        weapon: {
            projectile: "../src/proj-single.gif",
            explosion: "../src/green-explosion.gif",
            fire: "single",
            speed: 50,
            width: 35
        }
    }
];

class Player {
    constructor(
        ship
    ) {
        this.shipSrc = ship.src;
        this.health = ship.health;
        this.weapon = ship.weapon;
        this.x = 0;
        this.y = 0;
        this.width = ship.width;
        this.ship;
        this.projectile;
    }

    spawn() {
        this.ship = document.createElement("img");
        this.ship.src = this.shipSrc;
        this.ship.style.width = this.width + "px";
        gameElem.appendChild(this.ship);

        this.ship.style.left = this.x + "px";
        this.ship.style.top = this.y + "px";
        this.ship.style.transition = "0.3s ease-out";
    }

    rotate(deg) {
        this.ship.style.transform = "rotate(" + deg + "deg)";
    }

    move() {
        this.ship.style.left = this.x + "px";
        this.ship.style.top = this.y + "px";
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
        this.y = y + 13;
        this.projectileDirection;
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
        this.checkHit();
        setTimeout(() => this.travel(), timerStep);
    }

    checkHit() {
        const boundaries = [
            { condition: this.y < 45, adjustment: () => { this.y = 45; } },
            { condition: this.x > gameElem.offsetWidth - 80, adjustment: () => { this.x = gameElem.offsetWidth - 80; } },
            { condition: this.y > gameElem.offsetHeight - 80, adjustment: () => { this.y = gameElem.offsetHeight - 80; } },
            { condition: this.x < 45, adjustment: () => { this.x = 45; } }
        ];
        let hit = false;
    
        boundaries.forEach(boundary => {
            if (boundary.condition) {
                boundary.adjustment();
                hit = true;
            }
        });
    
        if (hit) {
            this.explode()
            return;
        }
    }

    explode() {
        this.projectile.style.display = "none"
        let explosion = document.createElement("img")

        explosion.src = this.explosionSrc;
        explosion.style.width = this.projectile.style.width;
        explosion.style.left = this.projectile.style.left;
        explosion.style.top = this.projectile.style.top;
        explosion.style.transform = this.projectile.style.transform;

        gameElem.appendChild(explosion);

        setTimeout(() => {
            explosion.style.display = "none";
        }, 300);

        delete this.projectile, this;
    }
}

function init() {
    gameElem = document.getElementById("game");
    shipElem = new Player(shipArr[0]);
    shipElem.spawn();

    startGame();
    document.addEventListener("keydown", checkKey);
}
window.onload = init;

function startGame() {
    moveShip();
}

function checkKey(e) {
    let k = e.keyCode;

    switch (k) {
        case 16: //Shift
            if (step < 40) step += 10;
            break;
        case 17: //Ctrl
            if (step > 0) step -= 10;
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

function moveShip() {
    let xLimit = gameElem.offsetWidth - shipElem.width; 
    let yLimit = gameElem.offsetHeight - shipElem.width;
    let x = parseInt(shipElem.x);
    let y = parseInt(shipElem.y);

    switch (shipDir) {
        case 0: //Upp  
            y -= step;
            if (y < 0) y = 0;
            break;
        case 1: //Höger
            x += step;
            if (x > xLimit) x = xLimit;
            break;
        case 2: //Ned
            y += step;
            if (y > yLimit) y = yLimit;
            break;
        case 3: //Vänster
            x -= step;
            if (x < 0) x = 0;
            break;
    }

    shipElem.x = x;
    shipElem.y = y;
    shipElem.move();
    setTimeout(moveShip, timerStep);
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