import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

// Scene, camera, renderer
const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(window.innerWidth / -50, window.innerWidth / 50, window.innerHeight / 50, window.innerHeight / -50, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
  alpha: true
});


renderer.setClearColor(0x000000,0);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

// Adjust the camera position
camera.position.set(-25, -25, 25);
camera.rotateOnAxisY=90;



// Lighting
const pointlight = new THREE.PointLight(0x000000);
pointlight.position.set(1, 1, 1);
const ambientlight = new THREE.AmbientLight(0xC2B775);
scene.add(pointlight, ambientlight);

// Orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enabled = false; // Disable orbit controls initially
controls.enableRotate = false; // Disable rotation control




// GLTF object


let object;
const loader = new GLTFLoader();
loader.load(
  '3dmodel/donut1.gltf',
  (gltf) => {
    object = gltf.scene;
    let scale = 2.5;
    object.scale.set(scale, scale, scale);

    

    scene.add(object);
    object.position.set(-10, -2,10);
    camera.lookAt(object.position); // Look at the ball's position initially 
  },
  (xhr) => {
    console.log(`${(xhr.loaded / xhr.total) * 100}% loaded`);
  },
  (error) => {
    console.error('Error loading GLTF object:', error);
  }
);



// Grid
const gridhelper = new THREE.GridHelper(200, 70);
scene.add(gridhelper);

// Keyboard controls
const keyboard = {};
document.addEventListener('keydown', (event) => {
  keyboard[event.code] = true;
});
document.addEventListener('keyup', (event) => {
  keyboard[event.code] = false;
});

// Camera settings
const cameraDistance = 30; // Distance from the ball
const cameraHeight = 30; // Height above the ball
const cameraFollowSpeed = 0.03; // Speed of camera following (lower value for smoother effect)

camera.position.set(cameraDistance, cameraHeight, cameraDistance);



let targetCameraPosition = new THREE.Vector3();
let cameraVelocity = new THREE.Vector3();


const rotationSpeed = 0.01; // Adjust the rotation speed as needed

function rotateObject() {
  if(object){
    if (!keyboard['KeyW'] && !keyboard['KeyS'] && !keyboard['KeyA'] && !keyboard['KeyD']) {
      object.rotation.y += rotationSpeed;
    }
  }
  
}


  


function moveobject() {
  

  if(object){
    const speed = 0.2;
  if (keyboard['KeyW']) {
    object.position.z -= speed;
    object.position.x -= speed;
  }
  if (keyboard['KeyS']) {
    object.position.z += speed;
    object.position.x += speed;
  }
  if (keyboard['KeyA']) {
    object.position.x -= speed;
    object.position.z += speed;
  }
  if (keyboard['KeyD']) {
    object.position.x += speed;
    object.position.z -= speed;
  }

  // Update target camera position relative to the ball
  targetCameraPosition.x = object.position.x + cameraDistance;
  targetCameraPosition.y = object.position.y + cameraHeight;
  targetCameraPosition.z = object.position.z + cameraDistance;

  // Smoothly move the camera towards the target position
  cameraVelocity.lerp(targetCameraPosition, cameraFollowSpeed);
  camera.position.copy(cameraVelocity);
  }
  
}



function animate() {
  requestAnimationFrame(animate);

  moveobject();
  rotateObject();

  // Render the scene
  renderer.render(scene, camera);
}
animate();
