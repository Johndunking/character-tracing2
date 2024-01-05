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
    [{ x: 110, y: 460 }, { x: 430, y: 470 }, { x: 400, y: 330 }], // Targets for letter A
    [{  x: 130, y: 470 }, {  x: 130, y: 280  }, {  x: 130, y: 470  }], // Targets for letter B
    [{  x: 400, y: 420 }], // Targets for letter C
    // ... Define targets for other letters as needed
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
        { x: config.width / 2, y: config.height / 5 },
        { x: config.width / 2, y: config.height / 5 },
        { x: config.width / 4.4, y: config.height / 1.8 }
    ], // Drag point positions for letter A
    [
        { x: config.width / 4, y: config.height / 5 },
        { x: config.width / 4, y: config.height / 5 },
        { x: config.width / 4.4, y: config.height / 2.0 }
    ], // Drag point positions for letter B
    [
        { x: config.width / 1.3, y: config.height / 3 }
    ], // Drag point positions for letter C

    // Add more arrays of positions for other letters as needed
];
    // Add more positions as needed];

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
