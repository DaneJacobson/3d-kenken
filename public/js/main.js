import * as THREE from 'three';
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import WebGL from 'three/addons/capabilities/WebGL.js';

import { KenKen } from './KenKen.js';
import { Puzzle } from './Puzzle.js';
import { Timer } from './Timer.js';


// Constants
const DEFAULT_N = 4;

// for debugging
function p(s) {
    console.log(s);
}

// Set up global components of the puzzle.
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
const kenken = new KenKen(DEFAULT_N);
let puzzle = new Puzzle(
    DEFAULT_N,
    kenken.cubeInfo, 
    kenken.cageInfo, 
    scene, 
    camera, 
    renderer
);

// Reset the puzzle according to a different size
const sizeOptions = document.querySelectorAll('.size-option');
sizeOptions.forEach(option => {
    option.addEventListener('click', () => {
        const n = parseInt(option.dataset.size, 10);
        rebootPuzzle(n);
    });
});

function rebootPuzzle(n) {
    // Clear state of existing puzzle
    if (puzzle !== null) {
        puzzle.cleanPuzzleObject();
    }

    // Create a new puzzle with the selected size
    const kenken = new KenKen(n);
    puzzle = new Puzzle(
        n, 
        kenken.cubeInfo, 
        kenken.cageInfo, 
        scene, 
        camera, 
        renderer
    );
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