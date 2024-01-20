import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { Line2 } from 'three/addons/lines/Line2.js';
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import WebGL from 'three/addons/capabilities/WebGL.js';

import { KenKen } from './KenKen.js';


const TEXT_SIZE = 0.5;
const TEXT_HEIGHT = 0.1;


// for debugging
function p(s) {
    console.log(s);
}

// Returns random rainbow color for cage coloring
function getRandomRainbowColor() {
    // Array of hex codes representing rainbow colors
    const rainbowColors = [
        '#ff0000', // Red
        '#ff7f00', // Orange
        '#ffff00', // Yellow
        '#00ff00', // Green
        '#add8e6', // Blue
    ];

    // Randomly select a color from the array
    const randomIndex = Math.floor(Math.random() * rainbowColors.length);
    return rainbowColors[randomIndex];
}

class Puzzle {
    constructor(n, cubeInfo, cageInfo, scene, camera, renderer) {
        const self = this;

        // Loading in a font for the cube value text
        const loader = new FontLoader();
        loader.load('public/fonts/helvetiker_regular.typeface.json', function (font) {
            self._n = n; // cubic dimensions
            self._cubeInfo = cubeInfo; // {x-y-z: {'value': current cube number, 'solution': correct cube number, 'cageNumber': cage number, 'cubeGroupReference': group reference, 'topCorner': true/false}
            self._cageInfo = cageInfo; // {cage number: {'operator': + - * /, 'result': result number, 'color': hex color}}
            self._scene = scene;
            self._font = font;

            // Assign colors
            Object.entries(cageInfo).forEach(entry => entry[1].color = getRandomRainbowColor());

            // Render the puzzle by create the cube with text at the right location
            for (let i = 0; i < self._n; i++) {
                for (let j = 0; j < self._n; j++) {
                    for (let k = 0; k < self._n; k++) {
                        self.createCube(i, j, k);
                    }
                }
            }

            // Add controls
            self._currentPointer = "0-2-2";
            self.setCurrentPointer(self._currentPointer);
        });
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
            color: cage.color,
            transparent: true,
            opacity: 0.5
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
            linewidth: 1,
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

    // Set the value of the current cube to the provided input.
    setCurrentPointerValue(input) {
        const self = this;

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
    }

    // Set the pointer to the target cube.
    setCurrentPointer(target) {
        const self = this;

        // Change the linewidths
        self._cubeInfo[self._currentPointer].cubeGroupReference.children.find(c => c.name === "edges").material.linewidth = 1;
        self._cubeInfo[target].cubeGroupReference.children.find(c => c.name === "edges").material.linewidth = 5;

        // Set pointer
        self._currentPointer = target;
    }
}

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xffffff, 1);
document.body.appendChild(renderer.domElement);
camera.position.z = 5;

const kenken = new KenKen(3)
const puzzle = new Puzzle(3, kenken.cubeInfo, kenken.cageInfo, scene, camera, renderer);


// Keyboard controls
window.addEventListener("keydown", function(event) {
    // Get the keyboard input
    const key = event.key;

    // Check if the key is an integer
    if (!isNaN(parseInt(key, 10)) && key > 0 && key <= 9) {
        puzzle.setCurrentPointerValue(key);
        return;
    }

    // Check if the key is Backspace or Delete
    if ((key === "Delete") || (key === "Backspace")) {
        puzzle.setCurrentPointerValue("");
        return;
    }

    // Check if the key is a "reset camera" key
    if (key === "r") {
        camera.position.set(0, 0, 5);
        return;
    }

    // Extract the current coordinates from the currentPointer
    let [x, y, z] = puzzle._currentPointer.split("-").map(Number);

    // Define the maximum boundary based on the puzzle size
    const max = puzzle._n - 1;

    // Process the direction inputs
    switch (key) {
        case "ArrowUp":
            if (event.shiftKey) {
                if (z > 0) z--;
            } else {
                if (y < max) y++;
            }
            break;
        case "ArrowDown":
            if (event.shiftKey) {
                if (z < max) z++;
            } else {
                if (y > 0) y--;
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
    if (newPointer !== puzzle._currentPointer) {
        puzzle.setCurrentPointer(newPointer);
    }
});

// Add axes for debugging
const axesHelper = new THREE.AxesHelper( 5 );
scene.add( axesHelper );

// Add orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Function to animate the scene.
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    scene.rotation.x = 0.5;
    scene.rotation.y = 0.5;
    renderer.render(scene, camera);
}

// Confirm the client has WebGL, and if not, warn them.
if (WebGL.isWebGLAvailable()) {
    animate();
} else {
    const warning = WebGL.getWebGLErrorMessage();
    document.getElementById('container').appendChild(warning);
}