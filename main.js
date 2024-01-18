import * as THREE from 'three';
import WebGL from 'three/addons/capabilities/WebGL.js';


class Puzzle {
    constructor(n, cubeInfo, cageInfo, scene, camera, renderer) {
        this.n = n; // cubic dimensions
        this.cubeInfo = cubeInfo; // {x-y-z: {'value': current cube number, 'solution': correct cube number, 'cageNumber': cage number, 'cubeReference': cube reference}
        this.cageInfo = cageInfo; // {cage number: {'operator': + - * /, 'result': result number}}
        this.scene = scene;

        // Render the puzzle
        const spacing = (this.n - 1) / 2;
        for (let i = 0; i < this.n; i++) {
            for (let j = 0; j < this.n; j++) {
                for (let k = 0; k < this.n; k++) {
                    // Create the cube at the right location
                    const cube = this.createCube(i - spacing, j - spacing, k - spacing);

                    // Track a reference to the cube
                    this.cubeInfo[[i, j, k].join("-")].cubeReference = cube;
                }
            }
        }
    }

    // Function to create a cube
    createCube(x, y, z) {
        // Create and render the cube
        const cubeGeometry = new THREE.BoxGeometry();
        const cubeMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            transparent: true,
            opacity: 0.5
        });
        const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        cube.position.set(x, y, z);
        scene.add(cube);

        // Create and render the edges of the cube
        const edgesGeometry = new THREE.EdgesGeometry(cubeGeometry);
        const edgesMaterial = new THREE.LineBasicMaterial({color:0x000000});
        const line = new THREE.LineSegments(edgesGeometry, edgesMaterial);
        line.position.set(x, y, z);
        scene.add(line);

        return cube;
    }
}

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xffffff, 1);
document.body.appendChild(renderer.domElement);

camera.position.z = 5;


// Dummy Puzzle
const fakePuzzle = new Puzzle(
    3,
    {
        '0-0-0': {'value': '1', 'solution': '1', 'cageNumber': '1', 'cubeReference': null},
        '0-0-1': {'value': '1', 'solution': '1', 'cageNumber': '1', 'cubeReference': null},
        '0-0-2': {'value': '1', 'solution': '1', 'cageNumber': '1', 'cubeReference': null},
        '0-1-0': {'value': '1', 'solution': '1', 'cageNumber': '2', 'cubeReference': null},
        '0-1-1': {'value': '1', 'solution': '1', 'cageNumber': '2', 'cubeReference': null},
        '0-1-2': {'value': '1', 'solution': '1', 'cageNumber': '2', 'cubeReference': null},
        '0-2-0': {'value': '1', 'solution': '1', 'cageNumber': '3', 'cubeReference': null},
        '0-2-1': {'value': '1', 'solution': '1', 'cageNumber': '3', 'cubeReference': null},
        '0-2-2': {'value': '1', 'solution': '1', 'cageNumber': '3', 'cubeReference': null},
        '1-0-0': {'value': '1', 'solution': '1', 'cageNumber': '4', 'cubeReference': null},
        '1-0-1': {'value': '1', 'solution': '1', 'cageNumber': '4', 'cubeReference': null},
        '1-0-2': {'value': '1', 'solution': '1', 'cageNumber': '4', 'cubeReference': null},
        '1-1-0': {'value': '1', 'solution': '1', 'cageNumber': '5', 'cubeReference': null},
        '1-1-1': {'value': '1', 'solution': '1', 'cageNumber': '5', 'cubeReference': null},
        '1-1-2': {'value': '1', 'solution': '1', 'cageNumber': '5', 'cubeReference': null},
        '1-2-0': {'value': '1', 'solution': '1', 'cageNumber': '6', 'cubeReference': null},
        '1-2-1': {'value': '1', 'solution': '1', 'cageNumber': '6', 'cubeReference': null},
        '1-2-2': {'value': '1', 'solution': '1', 'cageNumber': '6', 'cubeReference': null},
        '2-0-0': {'value': '1', 'solution': '1', 'cageNumber': '7', 'cubeReference': null},
        '2-0-1': {'value': '1', 'solution': '1', 'cageNumber': '7', 'cubeReference': null},
        '2-0-2': {'value': '1', 'solution': '1', 'cageNumber': '7', 'cubeReference': null},
        '2-1-0': {'value': '1', 'solution': '1', 'cageNumber': '8', 'cubeReference': null},
        '2-1-1': {'value': '1', 'solution': '1', 'cageNumber': '8', 'cubeReference': null},
        '2-1-2': {'value': '1', 'solution': '1', 'cageNumber': '8', 'cubeReference': null},
        '2-2-0': {'value': '1', 'solution': '1', 'cageNumber': '9', 'cubeReference': null},
        '2-2-1': {'value': '1', 'solution': '1', 'cageNumber': '9', 'cubeReference': null},
        '2-2-2': {'value': '1', 'solution': '1', 'cageNumber': '9', 'cubeReference': null}
    }, 
    {
        '1': {'operator': '+', 'result': '3'},
        '2': {'operator': '+', 'result': '3'},
        '3': {'operator': '+', 'result': '3'},
        '4': {'operator': '+', 'result': '3'},
        '5': {'operator': '+', 'result': '3'},
        '6': {'operator': '+', 'result': '3'},
        '7': {'operator': '+', 'result': '3'},
        '8': {'operator': '+', 'result': '3'},
        '9': {'operator': '+', 'result': '3'}
    },
    scene,
    camera,
    renderer
);

// Function to animate the scene.
function animate() {
    requestAnimationFrame(animate);
    scene.rotation.x += 0.01;
    scene.rotation.y += 0.01;
    renderer.render(scene, camera);
}

// Confirm the client has WebGL, and if not, warn them.
if (WebGL.isWebGLAvailable()) {
    animate();
} else {
    const warning = WebGL.getWebGLErrorMessage();
    document.getElementById('container').appendChild(warning);
}

// setTimeout(() => {
//     fakePuzzle.cubeInfo["0-0-0"].cubeReference.material.color.set(0xff0000);
// }, 5000);