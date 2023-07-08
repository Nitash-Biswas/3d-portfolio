import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';

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
// camera.position.set(-25, -25, 25);
// camera.rotateOnAxisY=90;



// Lighting
const directionalLight = new THREE.DirectionalLight(0x320D07, 100);
directionalLight.position.set(1, 1, 1); // Set the position of the light source

const ambientlight = new THREE.AmbientLight(0x071432,10);
scene.add(ambientlight,directionalLight);


// Orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enabled = false; // Disable orbit controls initially
controls.enableRotate = false; // Disable rotation control




// GLTF object

let object;
const loader = new GLTFLoader();

//Draco Loader
const dLoader = new DRACOLoader();
dLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
dLoader.setDecoderConfig({type: 'js'});
loader.setDRACOLoader(dLoader);

loader.load(
  'art/wizard.gltf',
  (gltf) => {
    object = gltf.scene;
    let scale = 0.4;
    object.scale.set(scale, scale, scale);

    

    scene.add(object);
    object.position.set(-10, 0,1);
    camera.lookAt(object.position); // Look at the ball's position initially 
  },
  (xhr) => {
    console.log(`${(xhr.loaded / xhr.total) * 100}% loaded`);
  },
  (error) => {
    console.error('Error loading GLTF object:', error);
  }
);

let secobject;
loader.load(
  'art/home.gltf',
  (gltf) => {
    secobject = gltf.scene;
    let scale = 4.5;
    secobject.scale.set(scale, scale, scale);

    

    scene.add(secobject);
    secobject.position.set(-10, 0,10);
    secobject.rotation.y = Math.PI/2;
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
const cameraDistance = 40; // Distance from the ball
const cameraHeight = 35; // Height above the ball
const cameraFollowSpeed = 0.03; // Speed of camera following (lower value for smoother effect)

camera.position.set(cameraDistance, cameraHeight, cameraDistance);



let targetCameraPosition = new THREE.Vector3();
let cameraVelocity = new THREE.Vector3();


function levitateObject() {
  if(object){
    
      const oscillationSpeed = 0.005; 
      const amplitude = 0.3; 

    object.position.y = Math.sin(Date.now() * oscillationSpeed) * amplitude;
      
    }
  }


function moveobject() {
  if (object) {
    const speed = 0.1;

    if (keyboard['KeyW']) {
      object.position.x -= speed;
      object.rotation.y = 0; 
    }

    if (keyboard['KeyS']) {
      object.position.x += speed;
      object.rotation.y = Math.PI; 
    }

    if (keyboard['KeyA']) {
      object.position.z += speed;
      object.rotation.y = Math.PI / 2; 
      
    }

    if (keyboard['KeyD']) {
      object.position.z -= speed; 
      object.rotation.y = -Math.PI / 2; 
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
  levitateObject();

  // Render the scene
  renderer.render(scene, camera);
}
animate();
