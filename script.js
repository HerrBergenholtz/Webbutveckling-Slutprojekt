/*========= Klasser ========*/

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
        this.exploded = false;
        this.sprite;
        this.hitBoundary;
    }

    //Spawn() används för att skapa en sprite och placera ut den på spel elementet
    spawn() {
        this.sprite = document.createElement("img");
        this.sprite.src = this.spriteSrc;
        this.sprite.style.width = this.width + "px";
        this.sprite.style.opacity = "0";
        gameElem.appendChild(this.sprite);

        this.sprite.style.left = this.x + "px";
        this.sprite.style.top = this.y + "px";
        this.sprite.style.transition = "0.2s ease-out";
        setTimeout(() => {
            this.sprite.style.opacity = "1";
        }, 0);
    }

    //Rotate roterar spriten med så många grader som anges som argument. Ett reguljärt uttryck används för att hämta den nuvarande rotationen sedan så räknas den kortaste vägen till den nya rotationen ut och sätts till objektet genom att undersöka om skillnaden är större än 180 eller mindre än -180. Detta gör att rotationerna ser bra ut hur man än roterar.
    rotate(deg) {
        const currentRotation = parseInt((this.sprite.style.transform.match(/rotate\(([^)]+)\)/) || [])[1]) || 0;
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

    //Flyttar på spriten åt det håll som anges i spritens riktningsvariabel. Funktionen tar också true eller false som argument för att avgöra om spriten ska explodera när den åker in i en vägg. Om den ska explodera och åker in i en vägg så kallas explode på objektet, annars så begärs en animation igen.
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
        requestAnimationFrame(animate);
    }

    //CheckHit() kontrollerar om objektet har kolliderat med en vägg genom att undersöka en array med objekt som beskriver spelbärdans gränser och justeringar som görs om objektet är vid en grns. Varje objekt innehåller en condition som är en bool som blir sann om kriteriet inuti uppfylls och en arruwfunktion som är en justering som kommer köras om condition är sann. Adjustment() justerar objektets x eller y värde till att vara 0 eller spelelementets offset width eller height för att göra så att objektet inte flyger utanför spelbrädan. Arrayen söks igenom med en foreach loop, om någon condition stämmer så körs adjustment och hitBoundary sätt till true.
    checkHit() {
        const boundaries = [
            { condition: this.y < 0, adjustment: () => { this.y = 0; } },
            { condition: this.x > gameElem.offsetWidth - this.width, adjustment: () => { this.x = gameElem.offsetWidth - this.width; } },
            { condition: this.y > gameElem.offsetHeight - this.width, adjustment: () => { this.y = gameElem.offsetHeight - this.width; } },
            { condition: this.x < 0, adjustment: () => { this.x = 0; } }
        ];

        //Söker genom hela arrayen med en foreach arrow funktion, om objektets condition är sann så körs objektets adjustment() efter 0.1 sekunder för att göra så att elementet inte "snäpper" in i kanten utan stannar mjukare vid kanten och sedan sätts objektets hitboundary till sann vilket används för att kontrollera om elementet ska explodera.
        boundaries.forEach(boundary => {
            if (boundary.condition) {
                setTimeout(boundary.adjustment(), 100);
                this.hitBoundary = true;
            }
        });
    }

    //Explode() Byter spritens bildkälla till explosionens källa samt korresponderande bredd och samma left och top värder som objektets x och y.
    explode() {
        if (!this.exploded) {
            this.speed = 0;
            this.sprite.src = this.explosionSrc;
            this.sprite.style.width = this.explosionWidth + "px";
            this.sprite.style.left = this.sprite.style.left;
            this.sprite.style.top = this.sprite.style.top;

            setTimeout(() => {
                this.sprite.style.display = "none";
                this.sprite.remove();
            }, 500);

            this.exploded = true;
        }
    }

    //Returnerar resultatet av elementsOverlap som kallas med objektets sprite och argumentet som anges.
    detectCollision(enemy) {
        return this.elementsOverlap(this.sprite, enemy.sprite);
    }

    //Här använder jag mig av metoden getBoundingClientRect() vilket ger mig storlek och position på elementen som objekt och undersöker sedan om de två elementen kolliderar och om något av vilkoren stämmer så returneras sant.
    elementsOverlap(el1, el2) {
        const el1Properties = el1.getBoundingClientRect();
        const el2Properties = el2.getBoundingClientRect();

        return !(
            el1Properties.top > el2Properties.bottom ||
            el1Properties.right < el2Properties.left ||
            el1Properties.bottom < el2Properties.top ||
            el1Properties.left > el2Properties.right
        );
    }
}

//Klassen Ship som sträcker sig från Sprite, det betyder att Ship är en påbyggning av Sprite vilket gör att ship har tillgång till alla funktioner som finns i sprite och den kommer sätta samma variabler som i sprite med hjälp av att kalla super() i konstruktorn. EFtersom att ship är en påbyggnad så har den tillgång till fler funktioner och varibler som är specifika till skepp som alla sprites inte behöver ha tillgång till. Detta är ett smidigt sätt att strukturera sina klasser då det gör så att man kan ha en huvudklass som har de funktioner som är mer standard som att skapa objektet och flytta objektet och sedan ha mindre klasser som innehåller mer specifika funktioner men som ändå kan ta del av de vanliga funktionerna.
class Ship extends Sprite {
    //Genom att kalla super med argumentet sprite så kallas konstruktorn i föräldrarklassen på det argumentet, det gör så att samma variabler som deklareras i sprite deklareras i ship, sedan så lägger jag till specifika variabler som hör till skeppet.
    constructor(sprite) {
        super(sprite);
        this.health = sprite.health;
        this.maxSpeed = sprite.shipSpeed;
        this.cooldown = sprite.weapon.cooldown
        this.weapon = sprite.weapon;
        this.sprite = sprite;
        this.explosionSrc = "../src/sprites/explosion.gif";
        this.explosionWidth = 120;
        this.direction = 0;
        this.shooting = false;
        this.projectile;
    }

    //Kallar move på objektet för att flytta det, vilket gör så att funktioner från föräldrarklassen körs. Kallas med argumentet false för att skeppet inte ska explodera när den flyger in i väggar.
    fly() {
        this.move(false);
    }

    //Gör så att man kan toggla om skeppet ska skjuta eller inte, innehåller en arrowfunktion som är en loop som kallar sig självt rekursivt med en cooldown som sätts av skeppets cooldown värde om this.shooting är sant. I loopen så skapas ett nytt projektil objekt som skjuts iväg.
    fire() {
        this.shooting = !this.shooting;

        const loop = () => {
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

    //Destruct är en mer dramatisk explode som spelar skeppet använder sig av, det skapas en ny bild över spelaren som sedan tas bort när explode kallas.
    destruct() {
        if (!this.exploded) {
            let explosion = document.createElement("img");

            explosion.src = "../src/sprites/charge-up.gif";
            explosion.style.width = 80 + "px";
            explosion.style.height = 70 + "px";
            explosion.style.left = this.sprite.style.left;
            explosion.style.top = this.sprite.style.top;
            explosion.style.transform = this.sprite.style.transform;

            gameElem.appendChild(explosion);

            setTimeout(() => {
                explosion.style.display = "none";
                explosion.remove();
                this.explode();
            }, 2000);
        }
    }
}

//Klass för projektiler som är en extenderad klass av Ship, utöver super konstruktorn som anropas så sätts också en del variabler som hör med projektilens attribut att göra. Konstruktorn har också x, y och dir som argument så att projektilen lätt kan få rätt position och riktning.
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

    //Fire() anropar spawn för att skapa projektilen, transition sätts sedan till none och rätt riktning sätts. Sedan anropas move på projektilen för att den ska färdas frammåt med argumentet true eftersom att projektilerna ska explodera när de träffar en vägg.
    fire() {
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

        this.move(true);
    }
}

//Klassen Enemy som används för fiende, använder mest det som finns i Sprite och Ship men behöver några särskilda funktioner.
class Enemy extends Ship {
    constructor(
        sprite,
        difficulty,
        x,
        y
    ) {
        super(sprite);
        this.x = x;
        this.y = y;
        this.speed = sprite.shipSpeed + difficulty.speedIncrease;
        this.warningTime = difficulty.warningTime;
    }

    //Kallar warn och sedan så skapas fienden.
    arrive() {
        this.warn();
        setTimeout(() => {
            this.spawn();
        }, this.warningTime);
    }

    //Skaåar en varningstriangel där fienden ska skapas så att spelaren har tid att reagera och undvika fienden.
    warn() {
        this.sprite = document.createElement("img");
        this.sprite.src = "../src/sprites/warning-sign.gif";
        this.sprite.style.width = this.width + 10 + "px";
        gameElem.appendChild(this.sprite);

        this.sprite.style.left = this.x + "px";
        this.sprite.style.top = this.y + "px";

        setTimeout(() => this.sprite.remove(), this.warningTime);
    }

    //Den här funktionen gör så att fienden rör sig mot spelaren. Genom att räkna ut vinkeln mellan fienden och spelaren och sedan konvertera det till grader och sätta rotationen till det samt som jag flyttar fienden mot spelaren genom att normalisera riktnings vektorn och sätta top och left till de värden på samma sätt som i move() så rör sig fienden mot spelaren.
    chase(playerX, playerY) {
        //Räkna ut vektorn
        let dx = playerX - this.x;
        let dy = playerY - this.y;

        //Normalisera
        let length = Math.sqrt(dx * dx + dy * dy);
        dx /= length;
        dy /= length;

        //Uppdatera position
        this.x += dx * this.speed;
        this.y += dy * this.speed;

        this.sprite.style.left = this.x + "px";
        this.sprite.style.top = this.y + "px";

        //Räkna ut riktningen och konvertera den till grader och rotera
        const angleRadians = Math.atan2(dy, dx);
        const angleDegrees = angleRadians * (180 / Math.PI);

        this.rotate(angleDegrees);
    }
}

/*======= Huvudrprogram ========*/

//Globala variabler
let gameElem;
let player;
const timerStep = 50;
let enemies = [];
let selectedShip;
let selectShipMenu;
let selectShip1;
let selectShip2;
let selectedDifficulty = 1;
let mainMenu;
let settingsMenu;
let statusBar;
let mainButtons = [];
let startButton;
let selectShipButton;
let settingsButton;
let easyButton;
let mediumButton;
let hardButton;
let healthCounter;
let resultElem;
let result;
let backToMainButton;

//Array som innehåller de olika bakgrundsbilderna.
const spriteArr = [
    space1 = "../src/sprites/space-background.png",
    space2 = "../src/sprites/space-background-2.png",
    space3 = "../src/sprites/space-background-3.png"
];

//Array med objekt som innehåller information om levlarnas svårighetsgrad.
const levelArr = [
    level1 = {
        level: 1,
        spawnFrequency: 3000,
        spawnNumber: 8,
        timeout: 5000,
        speedIncrease: 0,
        warningTime: 2000
    },

    level2 = {
        level: 2,
        spawnFrequency: 2000,
        spawnNumber: 10,
        timeout: 4000,
        speedIncrease: 2,
        warningTime: 2000
    },

    level3 = {
        level: 3,
        spawnFrequency: 1000,
        spawnNumber: 14,
        timeout: 2000,
        speedIncrease: 4,
        warningTime: 1000
    }
];

//Array som innehåller metoder för att sätta svårighetsgraden, den funktion som körs tar attributen som levlarna har och ökar dem.
const difficultyArr = [
    easy = (level) => {
        level.spawnFrequency += 0;
        level.spawnNumber += 0;
        level.timeout += 0;
        level.speedIncrease += 0;
        level.warningTime += 0;
    },

    medium = (level) => {
        level.spawnFrequency -= 300;
        level.spawnNumber += 2;
        level.timeout -= 500;
        level.speedIncrease += 1;
        level.warningTime -= 250;
    },

    hard = (level) => {
        level.spawnFrequency -= 900;
        level.spawnNumber += 8;
        level.timeout -= 1000;
        level.speedIncrease += 4;
        level.warningTime -= 600;
    }
];

//JSON array med de olika rymdskepp som finns, innehåller information som hälsa, källa för sprites, och storlek mm. Weapon är ett eget objekt som innehåller särskild information specifikt för vapnet. Sista objektet är fiende skeppet som inte använder sig av några vapen, därför så är vapen attributen satt till 0 eftersom att de inte kommer användas men måste vara där för att inte skapa fel.
const shipArr = [
    scout = {
        health: 100,
        src: "../src/sprites/space-ship.png",
        shipSpeed: 6,
        width: 60,
        weapon: {
            projectile: "../src/sprites/proj-single.gif",
            explosion: "../src/sprites/green-explosion.gif",
            explosionWidth: 35,
            speed: 10,
            cooldown: 300,
            width: 45,
            offset: -12,
        }
    },

    artillery = {
        health: 130,
        src: "../src/sprites/space-ship-2.png",
        shipSpeed: 4,
        width: 50,
        weapon: {
            projectile: "../src/sprites/proj-fireball.gif",
            explosion: "../src/sprites/explosion.gif",
            explosionWidth: 120,
            speed: 5,
            cooldown: 1000,
            width: 60,
            offset: 5,
        }
    },

    standardEnemy = {
        health: 1,
        src: "../src/sprites/enemy-ship.png",
        shipSpeed: 8,
        width: 50,
        weapon: {
            projectile: "-",
            explosion: "-",
            explosionWidth: 0,
            speed: 0,
            cooldown: 0,
            width: 0,
            offset: 0
        }
    }
];

//I init funktionen så definieras variabler som sattes tidigare i koden med bland annat element i HTML element. Sätter också event lyssnare för huvudmeny knapparna. Init kallas när fönstret laddas in
function init() {
    gameElem = document.getElementById("game");
    mainMenu = document.getElementById("mainMenu");
    statusBar = document.getElementById("statusBar")
    startButton = document.getElementById("startGame");
    selectShipButton = document.getElementById("selectShip");
    selectShip1 = document.getElementById("ship1");
    selectShip2 = document.getElementById("ship2");
    settingsButton = document.getElementById("settings");
    mainButtons = [startButton, selectShipButton, settingsButton];
    selectShipMenu = document.getElementById("select");
    settingsMenu = document.getElementById("settingsMenu");
    easyButton = document.getElementById("easy");
    mediumButton = document.getElementById("medium");
    hardButton = document.getElementById("hard");
    resultElem = document.getElementById("result");
    result = document.querySelector("#result h3");
    backToMainButton = document.getElementById("backToMain");
    healthCounter = document.getElementById("healthCounter");
    selectedShip = shipArr[0];
    
    startButton.addEventListener("click", startGame);
    selectShipButton.addEventListener("click", selectShip);
    settingsButton.addEventListener("click", settings);
}
window.onload = init;

//En asynkron funktion som antingen visar eller gömmer huvudmenyn beroende på om sant eller falskt ges som argument. Funktionen visar menyn som flex och sedan väntar en tid genom att vänta på funktionen delay och sätter sedan alla knappars opacitet till ett och aktiverar knapparna. Eller tvärtom.
async function toggleMainMenu(display) {
    let timeDelay = 400;

    if (display) {
        mainMenu.style.display = "flex";
        
        await delay(timeDelay);

        mainButtons.forEach(button => {
            button.removeAttribute("disabled");
            button.style.opacity = "1";
        });
    } else {
        mainButtons.forEach(button => {
            button.setAttribute("disabled", "");
            button.style.opacity = "0"
        });
        
        await delay(timeDelay);

        mainMenu.style.display = "none";
    }
}

//Om användaren valde att starta spelet så körs denna funktion. En event lyssnare sätts för att lyssna för knapptryck och kallar då checkKey. Tar bort huvudmenyn, visar status elementet. Skapar ett nytt skepp och sätter det till player. Skapar spelaren på spel elementet och möjliggör spelaren att flyga. Sätter svårighetsgraden genom att gå igenom varje level med en foreach-loop och kalla korresponderande funktion på leveln. Spel loopen startas
async function startGame() {
    document.addEventListener("keydown", checkKey);
    await toggleMainMenu(false);

    player = new Ship(selectedShip);

    statusBar.style.opacity = "1";

    player.spawn();
    player.fly();
    update();

    levelArr.forEach(level => {
        difficultyArr[selectedDifficulty](level);
    });

    gameLoop();
}

//Om användaren valde att välja skepp så sätt event lyssnare och användaren kan välja genom att klicka på en av knapparna som sätter det skeppet till det valda. Sedan körs backToMain som tar bort event lyssnare för att spara på resurser och toggleMainMenu kallas.
async function selectShip() {
    await toggleMainMenu(false);

    const backToMain = () => {
        selectShip1.removeEventListener("click", handle1);
        selectShip2.removeEventListener("click", handle2);

        selectShipMenu.style.display = "none";

        toggleMainMenu(true);
    };

    selectShipMenu.style.display = "flex";

    const handle1 = () => {
        selectedShip = shipArr[0];
        backToMain();
    };

    const handle2 = () => {
        selectedShip = shipArr[1];
        backToMain();
    };

    selectShip1.addEventListener("click", handle1);
    selectShip2.addEventListener("click", handle2);
}

//Strukturerat på samma vis som selectShip.
async function settings() {
    await toggleMainMenu(false);
    
    const backToMain = () => {
        easyButton.removeEventListener("click", setEasy);
        mediumButton.removeEventListener("click", setMedium);
        hardButton.removeEventListener("click", setHard);

        settingsMenu.style.display = "none";
        toggleMainMenu(true);
    };

    const setEasy = () => {
        selectedDifficulty = 0;
        backToMain();
    };

    const setMedium = () => {
        selectedDifficulty = 1;
        backToMain();
    };

    const setHard = () => {
        selectedDifficulty = 2;
        backToMain();
    };

    settingsMenu.style.display = "flex";
    easyButton.addEventListener("click", setEasy);
    mediumButton.addEventListener("click", setMedium);
    hardButton.addEventListener("click", setHard);
}

//Uppdaterar elementet med spelarens nuvarande hälsa.
function update() {
    healthCounter.innerText = player.health;
}

//Beroende på vilken tangent som har tryckts så sker olika händelser. Om användaren tryckt på shift eller ctrl så ökas eller sänks farten. Om användaren tryckt på blanksteg så börjar skeppet skjuta. Och om någon av piltangenterna tryckts så ändras riktningen på skeppet.
function checkKey(e) {
    let key = e.keyCode;

    switch (key) {
        case 16: //Shift
            if (player.speed < player.maxSpeed) player.speed += 2;
            break;
        case 17: //Ctrl
            if (player.speed > 0) player.speed -= 2;
            break;
        case 32: //Blanksteg
            player.fire();
            break;
        case 37://Vänster
            player.rotate(270);
            player.direction = 3;
            break;
        case 38://Upp
            player.rotate(360);
            player.direction = 0;
            break;
        case 39://Höger
            player.rotate(90);
            player.direction = 1;
            break;
        case 40://Ner
            player.rotate(180);
            player.direction = 2;
            break;
    }
}

//Gameloop styr hur spelet spelas genom att skapa fiender. ChaseLoop och checkCollisions körs för att fiender ska jaga spelaren och för att kontrolloera kollisioner, dehär funktionerna loopar sig själva så de behövs bara kallas en gång. I en for loop som körs så många gånger som det finns levlar så sätts bakgrundsbilden, om det är den andra iterationen så sätt särskilda css regler. Sedan så kallas wave och funktionen väntar på att wave ska köras klart, sedan så väntar den en tidsintervall innan den kör igen. Efter loopen är klar så sätts en intervall som börjar kontrollera om arrayen med fiender är tom, alltså som alla fiender har blivit nedskjutna, om ja så kallas gameOver med argumentet true vilket betyder att spelaren har vunnit och då stoppas också intervallen.
async function gameLoop() {
    chaseLoop();
    checkCollisions();

    for (let i = 0; i < levelArr.length; i++) {
        gameElem.style.backgroundImage = "url(" + spriteArr[i] + ")";

        if (i === 1) {
            gameElem.style.backgroundRepeat = "no-repeat";
            gameElem.style.backgroundSize = "cover";
            gameElem.style.backgroundPosition = "center";
        }

        await wave(levelArr[i]);
        await delay(levelArr[i].timeout);
    }

    const checkWin = setInterval(() => {
        console.log("checkwin");
        if (enemies.length === 0) {
            gameOver(true);
            clearInterval(checkWin);
        }
    }, 500);
}

//Funktionen sätter en intervall som körs varje timerStep. Enemies arrayen söks igenom med en foreach metod. Om spelaren kolliderar med en fiende så tar spelaren skada. Så länge fienden inte redan har exploderat så kallas explode på fienden, detta så att inte flera explostioner sker och sedan så tas den bort från fiende arrayen. Om spelarens hälsa också är 0 så kallas destruct på spelaren, destruct är en mer dramatisk version av explode och gameOver med argumentet falskt kallas då användaren förlorade. Annars om en projektil kolliderar med en fiende så exploderar projektilen och fienden och fienden tas bort från arrayen.
function checkCollisions() {
    setInterval(() => {
        enemies.forEach(enemy => {
            if (player.detectCollision(enemy)) {
                player.health -= 10;
                update();
                if (!enemy.exploded) {
                    enemy.explode();
                    enemies.splice(enemies.indexOf(enemy), 1);
                }
                if (player.health <= 0) {
                    player.destruct();
                    gameOver(false);
                }
            } else if (player.projectile && player.projectile.detectCollision(enemy)) {
                player.projectile.explode();
                enemy.explode();
                enemies.splice(enemies.indexOf(enemy), 1);
            }
        });
    }, timerStep);
}

//Medans spelaren är vid liv så körs requestAnimationFrame med chasePlayer och sedan väntar en timerStep. RequestAnimationFrame ber webbläsaren om att animera en särkild funktion, i detta fallet så begärs en animation till att varje fiende i enimies arrayen ska röra sig mot spelaren som görs genom att kalla chase på fienden. Jag använder requestAnimationFrame för att då kan webbläsaren optimisera animationen vilket gör den mer flytande, det är mer batteri-vänligt.
async function chaseLoop() {
    const chasePlayer = () => {
        enemies.forEach(enemy => {
            enemy.chase(player.x, player.y);
        });
    };

    while (player.health > 0) {
        requestAnimationFrame(chasePlayer);
        await delay(timerStep);
    }
}

//Kallar spawnEnemy så många gånger och med den frekvens som anges.
async function wave(level) {
    let spawnedShips = 0;

    while (spawnedShips < level.spawnNumber) {
        spawnEnemy(shipArr[2], level);
        await delay(level.spawnFrequency);
        spawnedShips++;
    }
}

//Skapar och placerar fiender på ett slumpmässigt ställe på brädan och lägger sedan in dem i fiende arrayen vilket gör att dem kommer börja jaga spelaren.
async function spawnEnemy(ship, level) {
    let randomX = Math.floor(Math.random() * (gameElem.offsetWidth - 80));
    let randomY = Math.floor(Math.random() * (gameElem.offsetHeight - 80));

    let enemy = new Enemy(ship, level, randomX, randomY);
    enemy.arrive();

    await delay(level.warningTime + 100);
    enemies.push(enemy);
}

//Tar bort checkKey event lyssnaren, sätter spelarens fart till 0 och slutar skjuta. Om spelaren har vunnit så står det också det på skärmen, annars står det att de har förlorat, när användaren trycker på knappen så laddas sidan om och spelet startas därmed om.
function gameOver(win) {
    const backToMain = () => {
        location.reload();
    };

    document.removeEventListener("keydown", checkKey);
    player.speed = 0;
    player.shooting = false;

    win === true ? result.innerText = "Grattis! Du vann!" : result.innerText = "Game Over!";
    statusBar.style.display = "none";
    resultElem.style.display = "flex";

    backToMainButton.addEventListener("click", backToMain);
}

//Funktionen som används för att vänta en viss tid, funktionen returnerar en resolve efter så många millisekunder som har skickats som argument vilket är det funktionen där delay kallades väntar på. Det gör att jag enkelt kan få en funktion att vänta så länge jag vill. 
async function delay(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}