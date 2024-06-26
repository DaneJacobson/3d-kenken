import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { Line2 } from 'three/addons/lines/Line2.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

import { Timer } from './Timer.js';


// Constants
const TEXT_SIZE = 0.3;
const TEXT_HEIGHT = 0.1;


class Puzzle {
    constructor(n, cubeInfo, cageInfo, scene, camera, renderer, timer) {
        const self = this;

        // Loading in a font for the cube value text
        const loader = new FontLoader();
        loader.load('fonts/helvetiker_regular.typeface.json', function (font) {
            self._n = n; // cubic dimensions
            self._cubeInfo = cubeInfo; // {x-y-z: {'value': current cube number, 'solution': correct cube number, 'cageNumber': cage number, 'cubeGroupReference': group reference, 'topCorner': true/false}
            self._cageInfo = cageInfo; // {cage number: {'operator': + - * /, 'result': result number, 'color': hex color}}
            self._scene = scene;
            self._entryCounter = 0;
            self._font = font;

            // Set starting color
            const savedColor = localStorage.getItem('cageColor');
            self._color = savedColor ? savedColor : '#ff0000';

            // Render the puzzle by create the cube with text at the right location
            for (let i = 0; i < self._n; i++) {
                for (let j = 0; j < self._n; j++) {
                    for (let k = 0; k < self._n; k++) {
                        self.createCube(i, j, k);
                    }
                }
            }

            // Add controls
            self._currentPointer = `0-${n-1}-${n-1}`;
            self.setCurrentPointer(self._currentPointer);

            // Add timer
            self._timer = new Timer();
            self._timer.start();

            // Add new keyboard listener
            self._handleKeyDown = (event) => self.processKeyboardInput(event.key);
            window.addEventListener("keydown", self._handleKeyDown);

            // Add new color listener
            self._handleColorChange = (event) => self.processColorChange(event.target.value);
            const colorPicker = document.getElementById("color-picker");
            colorPicker.addEventListener("input", self._handleColorChange);
            colorPicker.value = self._color // Setting the default color upon refresh
        });
    }

    cleanPuzzleObject() {
        const self = this;

        // Clear the scene
        while (self._scene.children.length > 0) {
            self._scene.remove(self._scene.children[0]);
        }

        // Clear the timer
        self._timer.stop();

        // Clear the event listeners
        window.removeEventListener("keydown", self._handleKeyDown);

        // Clear the color listeners
        window.removeEventListener("change", self._handleColorChange);
    }

    // Process the keyboard inputs
    processKeyboardInput(key) {
        const self = this;

        // Check if the key is an integer
        if (!isNaN(parseInt(key, 10)) && key > 0 && key <= 9) {
            self.setCurrentPointerValue(key);
            return;
        }

        // Check if the key is Backspace or Delete
        if ((key === "Delete") || (key === "Backspace")) {
            self.setCurrentPointerValue("");
            return;
        }

        // Check if the key is a "reset camera" key
        if (key === "r" || key === "R") {
            camera.position.set(0, 0, 5);
            return;
        }

        // Extract the current coordinates from the currentPointer
        let [x, y, z] = self._currentPointer.split("-").map(Number);

        // Define the maximum boundary based on the puzzle size
        const max = self._n - 1;

        // Process the direction inputs
        switch (key) {
            case "ArrowUp":
                if (event.shiftKey) {
                    if (y < max) y++;
                } else {
                    if (z > 0) z--;
                }
                break;
            case "ArrowDown":
                if (event.shiftKey) {
                    if (y > 0) y--;
                } else {
                    if (z < max) z++;
                }
                break;
            case "ArrowLeft":
                if (x > 0) x--;
                break;
            case "ArrowRight":
                if (x < max) x++;
                break;
        }

        // Update the current pointer
        const newPointer = `${x}-${y}-${z}`;
        if (newPointer !== self._currentPointer) {
            self.setCurrentPointer(newPointer);
        }
    }

    // Add an event listener for the color picker
    processColorChange(selectedColor) {
        const self = this;

        // Sets the new color
        self._color = selectedColor;
        localStorage.setItem('cageColor', self._color);

        // Rerenders the color
        self.setCurrentPointer(self._currentPointer);
    }

    // Add to entry counter and check if puzzle is done.
    addToEntryCounter() {
        const self = this;

        self._entryCounter++;
        if (self._entryCounter === Math.pow(self._n, 3)) {
            if (self.evaluatePuzzle()) {
                const formattedTime = self._timer.getFormattedTime();
                self._timer.stop();
                alert(`Congratulations on completing the puzzle in ${formattedTime}`);
            } else {
                alert("Invalid solution: try again");
            }
        }
    }

    // Subtract from entry counter
    subtractFromEntryCounter() {
        const self = this;
        if (self._entryCounter > 0) self._entryCounter--;
    }

    // Evaluate whether the puzzle is complete
    evaluatePuzzle() {
        const self = this;

        // If number entries is too low, puzzle is not complete.
        if (self._entryCounter < Math.pow(self._n, 3)) return false;

        // Check each row, column, and depth for completeness
        for (let x = 0; x < self._n; x++) {
            for (let y = 0; y < self._n; y++) {
                let rowSet = new Set();
                let colSet = new Set();
                let depthSet = new Set();

                for (let z = 0; z < self._n; z++) {
                    rowSet.add(self._cubeInfo[`${x}-${y}-${z}`].value);
                    colSet.add(self._cubeInfo[`${x}-${z}-${y}`].value);
                    depthSet.add(self._cubeInfo[`${z}-${x}-${y}`].value);
                }

                if ((rowSet.size !== self._n) || (colSet.size !== self._n) || (depthSet.size !== self._n)) {
                    return false;
                }
            }
        }

        // Assemble cage values
        const cageValues = {} // {'cageNumber': array of values}
        for (const [cubeCoords, cube] of Object.entries(self._cubeInfo)) {
            const cageNumberString = cube.cageNumber.toString();
            if (cageNumberString in cageValues) {
                cageValues[cageNumberString].push(cube.value);
            } else {
                cageValues[cageNumberString] = [cube.value];
            }
        }

        // Get the result from result from operating the operands together
        for (const [cageNumber, values] of Object.entries(cageValues)) {
            const cage = self._cageInfo[cageNumber];
            const operator = cage.operator;
            if (operator === '+') {
                const result = values.reduce((sum, val) => sum + parseInt(val, 10), 0);
                if (result !== cage.result) return false;
            } else if (operator === '*') {
                const result = values.reduce((sum, val) => sum * parseInt(val, 10), 1);
                if (result !== cage.result) return false;
            } else if (operator === '-') {
                const [value1, value2] = values.map(val => parseInt(val, 10));
                if (Math.abs(value1 - value2) !== cage.result && Math.abs(value2 - value1) !== cage.result) {
                    return false;
                }
            } else if (operator === '/') {
                const [value1, value2] = values.map(val => parseInt(val, 10));
                if (value1 / value2 !== cage.result && value2 / value1 !== cage.result) {
                    return false;
                }
            }
        }

        return true;
    }

    // Function to create a cube
    createCube(i, j, k) {
        const self = this;
        const cubeGroup = new THREE.Group();

        // Extract coordinate specific cube/cage information
        const spacing = (self._n - 1) / 2;
        const x = i - spacing;
        const y = j - spacing;
        const z = k - spacing;
        const cube = self._cubeInfo[`${i}-${j}-${k}`];
        const cage = self._cageInfo[cube.cageNumber];

        // Create and render the cube
        const boxGeometry = new THREE.BoxGeometry();
        const boxMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.1
        });
        const box = new THREE.Mesh(boxGeometry, boxMaterial);
        box.name = "box";
        box.position.set(x, y, z);
        cubeGroup.add(box);

        // Create and render the edges of the cube
        const edgesGeometry = new THREE.EdgesGeometry(boxGeometry);
        const lineSegmentsGeometry = new LineSegmentsGeometry();
        lineSegmentsGeometry.setPositions(edgesGeometry.attributes.position.array);
        const lineMaterial = new LineMaterial({
            color: 0x000000,
            linewidth: 0.7,
            resolution: new THREE.Vector2(window.innerWidth, window.innerHeight)
        })
        const edges = new Line2(lineSegmentsGeometry, lineMaterial);
        edges.name = "edges";
        edges.position.set(x, y, z);
        cubeGroup.add(edges);

        // Create and render the text of the cube
        const textGeometry = new TextGeometry(cube.value.toString(), {
            font: self._font,
            size: TEXT_SIZE,
            height: TEXT_HEIGHT
        });
        textGeometry.center();
        const textMaterial = new THREE.MeshBasicMaterial({color: 0x000000});
        const text = new THREE.Mesh(textGeometry, textMaterial);
        text.name = "text";
        text.position.set(x, y, z);
        cubeGroup.add(text);

        // Create and render the operator and result of the cage if required
        if (cube.topCorner) {
            const cageTextGeometry = new TextGeometry(`${cage.result}${cage.operator}`, {
                font: self._font,
                size: 0.15,
                height: 0.01
            });
            cageTextGeometry.center();
            const cageTextMaterial = new THREE.MeshBasicMaterial({color: 0x000000});
            const cageText = new THREE.Mesh(cageTextGeometry, cageTextMaterial);
            cageText.name = "cageText";
            cageText.position.set(x - 0.3, y + 0.3, z + 0.3);
            cubeGroup.add(cageText);
        }

        // Add the entire cubeGroup at once
        self._scene.add(cubeGroup);

        // Track a reference to the cube
        self._cubeInfo[[i, j, k].join("-")].cubeGroupReference = cubeGroup;
    }

    // Set the pointer to the target cube.
    setCurrentPointer(target) {
        const self = this;

        // Change the linewidths
        self._cubeInfo[self._currentPointer].cubeGroupReference.children.find(c => c.name === "edges").material.linewidth = 0.7;
        self._cubeInfo[target].cubeGroupReference.children.find(c => c.name === "edges").material.linewidth = 5;

        // Set pointer
        self._currentPointer = target;
        const newCage = self._cubeInfo[target].cageNumber.toString();

        // Wipe the colors on the old cage, set the colors on the new cage
        // (this may be unnecessary and can be optimized for performance)
        for (let x = 0; x < self._n; x++) {
            for (let y = 0; y < self._n; y++) {
                for (let z = 0; z < self._n; z++) {
                    const box = self._cubeInfo[`${x}-${y}-${z}`].cubeGroupReference.children.find(c => c.name === "box")
                    box.material.color.set(0xffffff);
                    box.material.opacity = 0.1;
                }
            }
        }

        // Set new cage color
        const cageCubes = Object.values(self._cubeInfo).filter(cube => cube.cageNumber.toString() === newCage);
        cageCubes.forEach(cube => {
            const box = cube.cubeGroupReference.children.find(c => c.name === "box");
            box.material.color.set(self._color);
            box.material.opacity = 0.5;
        });
    }

    // Set the value of the current cube to the provided input.
    setCurrentPointerValue(input) {
        const self = this;
        const originalValue = self._cubeInfo[self._currentPointer].value;

        // Retrieve the textMesh from the puzzle information
        const cubeGroupReference = self._cubeInfo[self._currentPointer].cubeGroupReference;
        const textMesh = cubeGroupReference.children.find(c => c.name === "text");

        // Create a new textGeometry
        const newTextGeometry = new TextGeometry(input.toString(), {
            font: self._font,
            size: TEXT_SIZE,
            height: TEXT_HEIGHT
        });
        newTextGeometry.center();

        // Send old textGeometry to the GC and set new textGeometry
        textMesh.geometry.dispose();
        textMesh.geometry = newTextGeometry;

        // Set the new value in the puzzle's internal representation
        self._cubeInfo[self._currentPointer].value = input;

        // Manage counter
        if (originalValue === "" && input !== "") {
            self.addToEntryCounter();
        } else if (originalValue !== "" && input !== "") { // Reactivate evaluation
            self.subtractFromEntryCounter();
            self.addToEntryCounter();
        } else if (originalValue !== "" && input === "") { // Delete/backspace
            self.subtractFromEntryCounter();
        }
    }
}

export { Puzzle };
