import * as THREE from 'three';
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import WebGL from 'three/addons/capabilities/WebGL.js';

import { KenKen } from './KenKen.js';
import { Puzzle } from './puzzle.js';


// for debugging
function p(s) {
    console.log(s);
}

// Set up macro components of the puzzle.
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xffffff, 1);
document.body.appendChild(renderer.domElement);
camera.position.z = 6;

// Add orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Render initial 4x4x4 puzzle
resetPuzzle(4);

// Reset the puzzle according to a different size
const sizeOptions = document.querySelectorAll('.size-option');
sizeOptions.forEach(option => {
  option.addEventListener('click', () => {
    const n = parseInt(option.dataset.size, 10);
    resetPuzzle(n);
  });
});

// Actually reset the puzzle
function resetPuzzle(n) {
    // Clear the existing puzzle
    while (scene.children.length > 0) {
        scene.remove(scene.children[0]);
    }

    // Create a new puzzle with the selected size
    const kenken = new KenKen(n);
    const puzzle = new Puzzle(n, kenken.cubeInfo, kenken.cageInfo, scene, camera, renderer);

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
        if (key === "r" || key === "R") {
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
        if (newPointer !== puzzle._currentPointer) {
            puzzle.setCurrentPointer(newPointer);
        }
    });
}

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