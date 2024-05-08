//Globala variabler
let gameElem;
let shipElem;
const timerStep = 50;
var timerRef = null;
var timerRef2 = null;

//JSON Array med olika sprites
const spriteArr = [
    enviroments = {
        space1: "../src/sprites/space-background.jpg",
        space2: "../src/sprites/space-background-2.png"
    }
];

//JSON array med de olika rymdskepp som finns, innehåller information som hälsa, källa för sprites, och storlek mm.
const shipArr = [
    starter = {
        health: 100,
        src: "../src/sprites/space-ship.png",
        shipSpeed: 6,
        width: 70,
        weapon: {
            projectile: "../src/sprites/proj-single.gif",
            explosion: "../src/sprites/green-explosion.gif",
            explosionWidth: 35,
            speed: 10,
            cooldown: 300,
            width: 35,
            offset: -20
        }
    },

    nomad = {
        health: 130,
        src: "../src/sprites/space-ship-2.png",
        shipSpeed: 4,
        width: 50,
        weapon: {
            projectile: "../src/sprites/proj-fireball.gif",
            explosion: "../src/sprites/explosion.gif",
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

//En klass som innehåller funktioner för att skapa sprites, klassen har en konstruktor som tar ett JSON objekt som argument och sätter varieabler till olika värden i arrayen.
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

    //Spawn() används för att skapa en sprite och placera ut den på spel elementet
    spawn() {
        this.sprite = document.createElement("img");
        this.sprite.src = this.spriteSrc;
        this.sprite.style.width = this.width + "px";
        gameElem.appendChild(this.sprite);

        this.sprite.style.left = this.x + "px";
        this.sprite.style.top = this.y + "px";
        this.sprite.style.transition = "0.2s ease-out";
    }

    //Rotate roterar spriten med så många grader som anges som argument 
    rotate(deg) {
        //Regex uttryck som hämtar den nuvarande roatationen av en sprite genom att använda match på elementets transform värde med ett uttryck som hämtar det som står inuti rotate() och sedan väljer rätt värde.
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

    //Flyttar på spriten åt det håll som anges i spritens riktningsvariabel. Funktionen tar också true eller false som argument för att avgöra vad som ska hända om spriten åker in i en vägg.
    move(explode) {
        //Arrow funktion som ändrar på objektets x eller y värde beroende på riktning
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

            //Sätter objekets style left och right till x och y värdet för att flytta på objektet och kollar sedan kollisioner med checkHit
            this.sprite.style.left = this.x + "px";
            this.sprite.style.top = this.y + "px";
            this.checkHit(this);

            //Om explode är sant och variabeln hitBoundary är sann så körs explode() på objektet, alltså som objektet ska explodera när den kolliderar med en vägg så gör den det annars så körs requestAnimationFrame med animation() som callback funktion.
            if (explode && this.hitBoundary) {
                this.explode();
            } else {
                requestAnimationFrame(animate);
            }
        }

        //Kallar animate igen för nästa steg av animationen
        animate()
    }

    //CheckHit() kontrollerar om objektet har kolliderat med en vägg genom att undersöka en array med objekt som beskriver spelbärdans gränser och justeringar som görs om objektet är vid en grns.
    checkHit() {
        //Varje objekt innehåller en condition som är en bool som blir sann om kriteriet inuti uppfylls och en arruwfunktion som är en justering som kommer köras om condition är sann. Adjustment() justerar objektets x eller y värde till att vara 0 eller spelelementets offset width eller height för att göra så att objektet inte flyger utanför spelbrädan
        const boundaries = [
            { condition: this.y < 0, adjustment: () => { this.y = 0; } },
            { condition: this.x > gameElem.offsetWidth - this.width, adjustment: () => { this.x = gameElem.offsetWidth - this.width; } },
            { condition: this.y > gameElem.offsetHeight - this.width, adjustment: () => { this.y = gameElem.offsetHeight - this.width; } },
            { condition: this.x < 0, adjustment: () => { this.x = 0; } }
        ];

        //Söker genom hela arrayen med en foreach arrow funktion, om objektets condition är sann så körs objektets adjustment() efter 0.1 sekunder för att göra så att elementet inte "snäpper" in i kanten utan stannar mjukare vid kanten och sedan sätts objektets hitboundary till sann vilket används för att kontrollera om elementet ska explodera.
        boundaries.forEach(boundary => {
            if (boundary.condition) {
                setTimeout(boundary.adjustment(),100);
                this.hitBoundary = true;
            }
        });
    }

    //Explode() skapar en ny bild som har objektets explosionskälla som bildkälla samt korresponderande bredd och samma left och top värder som objektets x och y vilket kommer göra så att när projektilen träffar väggen så visas den inte längre med hjälp av display none och ersätts istället med explosionen
    explode() {
        let explosion = document.createElement("img");

        this.sprite.style.display = "none";

        explosion.src = this.explosionSrc;
        explosion.style.width = this.explosionWidth + "px";
        explosion.style.left = this.sprite.style.left;
        explosion.style.top = this.sprite.style.top;
        explosion.style.transform = this.sprite.style.transform;

        gameElem.appendChild(explosion);

        //Efter 0.4 sekunder, när explosionens animation är färdig, så sätt dess display till none och jag använder remove() för att ta bort explosionen objektets sprite vilket tar bort båda bilder från dokumentet vilket sparar minne och ser till så att de inte ligger kvar i dokumentet och spökar.
        setTimeout(() => {
            explosion.style.display = "none";
            explosion.remove();
            this.sprite.remove();
        }, 400);
    }
}

//Klassen Ship som sträcker sig från Sprite, det betyder att Ship är en påbyggning av Sprite vilket gör att ship har tillgång till alla funktioner som finns i sprite och den kommer sätta samma variabler som i sprite med hjälp av att kalla super() i konstruktorn. EFtersom att ship är en påbyggnad så har den tillgång till fler funktioner och varibler som är specifika till skepp som alla sprites inte behöver ha tillgång till. Detta är ett smidigt sätt att strukturera sina klasser då det gör så att man kan ha en huvudklass som har de funktioner som är mer standard som att skapa objektet och flytta objektet och sedan ha mindre klasser som innehåller mer specifika funktioner men som ändå kan ta del av de vanliga funktionerna.
class Ship extends Sprite {
    //Genom att kalla super med argumentet sprite så kallas konstruktorn i föräldrarklassen på det argumentet, det gör så att samma variabler som deklareras i sprite deklareras i ship, sedan så lägger jag till specifika variabler som hör till skeppet.
    constructor (sprite) {
        super(sprite);
        this.health = sprite.health;
        this.maxSpeed = sprite.shipSpeed;
        this.cooldown = sprite.weapon.cooldown
        this.weapon = sprite.weapon;
        this.sprite = sprite;
        this.points = 0;
        this.direction = 0;
        this.shooting = false;
        this.projectile;
    }

    //Kallar move på objektet med super för att flytta det, vilket gör så att funktioner från föräldrarklassen kan köras. Kallas med argumentet false för att skeppet inte ska explodera när den flyger in i väggar.
    fly() {
        super.move(false);
    }

    //Fire() gör så att man kan toggla om skeppet ska skjuta eller inte
    fire() {
        //This.shooting är falskt från börjarn, när funktionen kallas så sätt det till true om det är falskt och falskt om det är true 
        this.shooting = !this.shooting;
    
        //En arrowfunktion som är en loop som kallar sig självt rekursivt med en cooldown som sätts av skeppets cooldown värde om this.shooting är sant. 
        const loop = () => {
            //Skapar ett nytt projektil objekt med argumenten, spiteOriginal, x och y och kallar sedan fire().
            this.projectile = new Projectile(this.spriteOriginal, this.x, this.y, this.direction);
            this.projectile.fire();
    
            setTimeout(() => {
                if (this.shooting) {
                    loop();
                }
            }, this.cooldown);
        };

        //Initierar loopen om shooting är sant.
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
    shipElem = new Ship(shipArr[0]);
    
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

    draw(healthSprite, "../src/sprites/pixel-heart.png", "Hälsa");
    draw(pointsSprite, "../src/sprites/pixel-coin.png", "Poäng");

    let healthCounter = document.createElement("span");
    let pointsCounter = document.createElement("span");
    
    healthCounter.innerText = shipElem.health;
    pointsCounter.innerText = shipElem.points;

    healthElem.appendChild(healthSprite);
    healthElem.appendChild(healthCounter);
    pointsElem.appendChild(pointsSprite);
    pointsElem.appendChild(pointsCounter);

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