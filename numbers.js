const urlParams = new URLSearchParams(window.location.search);
const type = urlParams.get('type');
const config = {
    type: Phaser.AUTO,
    width: 550,
    height: 600,
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    input: {
        activePointers: 1,
        dragTimeThreshold: 10
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        parent: 'phaser-container',
        expandParent: true,
    },
    backgroundColor: '#ffffff'
};

const game = new Phaser.Game(config);
let currentLetterIndex = 0;
let currentPair;
let letterAndDragPoints = [];
let currentTargetIndex; // Declare currentTargetIndex globally
let letters;
let currentScene;

const targetPoints = [
    [{  x: 300, y: 130 }], // Targets for 0
    [{ x: 350, y: 120 } ,{ x: 350, y: 460 }], // Targets for 1
    [{ x: 130, y: 460 }, {  x: 400, y: 450 }], // Targets 2
    [{ x: 220, y: 280 }, { x: 130, y: 420 }], // Targets 3
    [{ x: 350, y: 460 }, { x: 130, y: 400 }, {  x: 430, y: 400 }], // Targets 4
    [{ x: 170, y: 130 }, { x: 170, y: 300 }, { x: 130, y: 400 }], // Targets 5
    [{  x: 260, y: 270 }], // Targets for 6
    [{ x: 430, y: 130 }, { x: 230, y: 460 }], // Targets for 7
    [{  x: 270, y: 130 }], // Targets for 8
    [{ x: 230, y: 460 }, { x: 350, y: 360 } ], // Targets for 9

    // ... Define targets for other numberss as needed
];

function preload() {
    this.load.bitmapFont('rubik', '/rubik/rubik.png', '/rubik/rubik.xml');
    this.load.image('dragPoint', 'smile.png');
    this.load.image('targetPoint', 'target.png'); 
}

function create() {
    let currentDragPointIndex = -1;
    currentTargetIndex = 0;
    

    this.add.rectangle(0, 0, config.width, config.height, 0xffffff).setOrigin(0);
    

    letters = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];


    // Create a graphics object for the tracing trail
    const graphics = this.add.graphics();
    
    currentScene = this;

    for (let i = 0; i < letters.length; i++) {
        const letter = letters[i];

        const letterSprite = this.add.bitmapText(config.width / 2, config.height / 2, 'rubik', letter, 600)
            .setOrigin(0.5)
            .setInteractive({ draggable: false })
            .setVisible(false);

            function speakLetter(letters) {
                // Use the Web Speech API to speak the current letter
                const synth = window.speechSynthesis;
                const utterance = new SpeechSynthesisUtterance(letters[currentLetterIndex]);
                synth.speak(utterance);
            }

        // Set initial target point for the letter
        const targetPoint = targetPoints[i] ? targetPoints[i][currentTargetIndex] : null;

        if (targetPoint) {
            // Add a target point image at the initial target point
            const targetPointImage = this.add.image(targetPoint.x, targetPoint.y, 'targetPoint')
                .setScale(.2)
                .setPosition(config.width / 1, config.height / 2)
                .setVisible(false);

            const dragPoints = [];
            

            for (let j = 0; j < dragPointPositions[i].length; j++) {
                const dragPoint = this.add.sprite(config.width / 2, config.height / 3.8, 'dragPoint')
                    .setInteractive({ draggable: true })
                    .setScale(0.1)
                    .setVisible(false);

                const offsetX = 0;
                const offsetY = 0;

                dragPoint.setData('offsetX', offsetX);
                dragPoint.setData('offsetY', offsetY);

                dragPoints.push(dragPoint);

                const particles = this.add.particles('sparkle');

                // Create a particle emitter for the sparkly trail
                const emitter = particles.createEmitter({
                    speed: { min: -100, max: 100 },
                    angle: { min: 0, max: 360 },
                    scale: { start: 1, end: 0 },
                    blendMode: 'ADD', // Additive blending for a sparkly effect
                });

                // Set the emitter to follow the drag point
                dragPoint.on('drag', function (pointer) {
                    emitter.setPosition(dragPoint.x, dragPoint.y);
                    emitter.emitParticle(1); // Emit one particle per frame
                });

                letterSprite.on('dragstart', function () {
                    dragPoint.setVisible(true);
                });

                letterSprite.on('drag', function (pointer) {
                    letterSprite.x = pointer.x;
                    letterSprite.y = pointer.y;
                });

                dragPoint.on('dragstart', function () {
                    dragPoint.setVisible(true);
                });

                dragPoint.on('drag', function (pointer) {
                    // Draw a line from the previous point to the current point
                    graphics.lineStyle(72, 0xFFFF00, 1); // lineStyle(thickness, color, alpha)
                    graphics.lineBetween(dragPoint.x, dragPoint.y, pointer.x, pointer.y);

                    // Update the drag point position
                    dragPoint.x = pointer.x + dragPoint.getData('offsetX');
                    dragPoint.y = pointer.y + dragPoint.getData('offsetY');
                });

                dragPoint.on('dragend', function () {
                    dragPoint.setVisible(false);

                    if (checkLetterTraced(letterSprite, letter, targetPointImage)) {
                        if (checkAllTargetsTraced(targetPoints[i])) {
                            console.log('All targets for letter ' + letter + ' completed!');
                            // Move to the next letter
                            loadNextLetter(graphics);
                            speakLetter(letters);
                        } else {
                            // Move to the next target for the current letter
                            loadNextTarget(targetPoints[i], targetPointImage, dragPoints);
                        }
                    }
                });
            }

            letterAndDragPoints.push({ letter: letterSprite, dragPoints: dragPoints, targetPoint: targetPointImage });
        }
    }

    loadNextLetter(graphics);
    speakLetter(letters);
    
}

function update() {
    // Your update logic goes here
}

function checkLetterTraced(sprite, letter) {
    // Implement your logic to check if the letter is correctly traced
    // For simplicity, let's assume all letters are correctly traced
    return true;
}

function checkAllTargetsTraced(targets) {
    return targets && currentTargetIndex >= targets.length;
    
}


const dragPointPositions = [
    [
        { x: config.width / 2.2, y: config.height / 4.8 }
    ], // Drag point positions for 0
    [
        { x: config.width / 3.2, y: config.height / 2.5 },
        {x: config.width / 1.6, y: config.height / 5}
    ], // Drag point positions for 1
    [
        { x: config.width / 4.2, y: config.height / 3 },
        { x: config.width / 4.2, y: config.height / 1.3 }
    ], // Drag point positions for 2
    [
        { x: config.width / 4, y: config.height / 5 },
        { x: config.width / 2.5, y: config.height / 2.0 }
    ], // Drag point positions for 3
    [
        {x: config.width / 1.6, y: config.height / 5},
        {x: config.width / 1.6, y: config.height / 5},
        { x: config.width / 4.2, y: config.height / 1.5 }
    ], // Drag point positions for 4
    [
        {x: config.width / 1.4, y: config.height / 4.8},
        {x: config.width / 3.5, y: config.height / 5},
        { x: config.width / 3.8, y: config.height / 2 }
    ], // Drag point positions for 5
    [
        { x: config.width / 2, y: config.height / 4.8 }
    ], // Drag point positions for 6
    [
        { x: config.width / 4.2, y: config.height / 4.8 },
        {x: config.width / 1.3, y: config.height / 4.8}
    ], // Drag point positions for letter 7
    [
        { x: config.width / 1.8, y: config.height / 4.8 }
    ], // Drag point positions for 8
    [
        {x: config.width / 1.6, y: config.height / 5},
        {x: config.width / 1.6, y: config.height / 5}
    ], // Drag point positions for 9

];
   

let currentDragPointIndex = -1;


function loadNextTarget(targets, targetPointImage, dragPoints) {
    if (currentDragPointIndex >= 0 && currentDragPointIndex < dragPoints.length) {
        const previousDragPoint = dragPoints[currentDragPointIndex];
        previousDragPoint.setVisible(false);
    }

    currentTargetIndex++;

    // Show the next target point
    const nextTarget = targets[currentTargetIndex - 1];

    if (nextTarget) {
        targetPointImage.setPosition(nextTarget.x, nextTarget.y);
        targetPointImage.setVisible(true);

        // Update drag point positions based on the current target and letter
        // Ensure currentDragPointIndex is within bounds
        if (currentDragPointIndex < dragPoints.length) {
            const dragPoint = dragPoints[currentDragPointIndex];
            const newPosition = dragPointPositions[currentLetterIndex][currentDragPointIndex];

            // Ensure dragPoint and newPosition are defined
            if (dragPoint && newPosition) {
                dragPoint.setPosition(newPosition.x, newPosition.y);
                dragPoint.setVisible(true);
            } else {
                console.error("Drag point or newPosition not defined.");
            }

            // Increment the drag point index for the next call
            currentDragPointIndex++;
        }
    } else {
        console.error("Next target not defined.");
    }
}       

function loadNextLetter(graphics) {
    // Check if all targets for the current letter have been successfully traced
    if (checkAllTargetsTraced(targetPoints[currentLetterIndex])) {
        currentLetterIndex++;
    }

    // If there are still letters left, load the next letter
    if (currentLetterIndex < letters.length) {
        const currentPair = letterAndDragPoints[currentLetterIndex - 1];
        if (currentPair && currentPair.targetPoint) {
            currentPair.letter.setVisible(false);

            // Hide all drag points for the current letter
            if (currentPair.dragPoints) {
                for (const dragPoint of currentPair.dragPoints) {
                    dragPoint.setVisible(false);
                }
            }

            currentPair.targetPoint.setVisible(false);
            graphics.clear();
        }

        const nextPair = letterAndDragPoints[currentLetterIndex];
        if (nextPair && nextPair.targetPoint) {
            nextPair.letter.setVisible(true);
            currentDragPointIndex = 0; // Reset the drag point index for the new letter

            // Show the first drag point for the next letter
            if (nextPair.dragPoints && nextPair.dragPoints.length > 0) {
                const dragPoint = nextPair.dragPoints[currentDragPointIndex];
                const newPosition = dragPointPositions[currentLetterIndex][currentDragPointIndex];

                // Ensure dragPoint and newPosition are defined
                if (dragPoint && newPosition) {
                    dragPoint.setPosition(newPosition.x, newPosition.y);
                    dragPoint.setVisible(true);
                } else {
                    console.error("Drag point or newPosition not defined.");
                }
            }

            nextPair.targetPoint.setVisible(true);
            
            currentTargetIndex = 0; // Reset the target index for the new letter
            // Pass 'graphics' as the parameter
            loadNextTarget(targetPoints[currentLetterIndex], nextPair.targetPoint, nextPair.dragPoints, graphics);
        }
    } else {
        // All letters completed
        console.log('All letters completed!');
    }
}
