import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import CannonDebugger from 'cannon-es-debugger'
import * as CANNON from 'cannon-es';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer';
import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import {ShaderPass} from 'three/examples/jsm/postprocessing/ShaderPass';
import {FilmShader} from 'three/examples/jsm/shaders/FilmShader';





// Scene
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
  alpha: true,
  antialias: false
});

renderer.setClearColor(0xffffff,1);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

// Lighting
const directionalLight = new THREE.DirectionalLight(0x320D07, 150);
directionalLight.position.set(200, 1, 1); // Set the position of the light source
const ambientlight = new THREE.AmbientLight(0xffffff,0.5);
scene.add(directionalLight, ambientlight);



//Iso-Camera
const camera = new THREE.OrthographicCamera(window.innerWidth / -50, window.innerWidth / 50, window.innerHeight / 50, window.innerHeight / -50, 0.1, 1000);

// Camera settings
const cameraDistance = 40; // Distance from the ball
const cameraHeight = 35; // Height above the ball
const cameraFollowSpeed = 0.03; // Speed of camera following (lower value for smoother effect)

camera.position.set(cameraDistance, cameraHeight, cameraDistance);
let targetCameraPosition = new THREE.Vector3();
let cameraVelocity = new THREE.Vector3();


//Post Processing
const renderScene = new RenderPass(scene,camera);
const composer = new EffectComposer(renderer);
composer.addPass(renderScene);

// composer.addPass(new ShaderPass(FilmShader));

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth,window.innerHeight), //Resolution
  0.15, //Intensity
  0.5, //Radius
  0.1 //Threshold
);
composer.addPass(bloomPass);










//Gltf loader
const loader = new GLTFLoader();

//Draco Loader
const dLoader = new DRACOLoader();
dLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
dLoader.setDecoderConfig({type: 'js'});
loader.setDRACOLoader(dLoader);

let object;
loader.load(
  'art/wizard.gltf',
  (gltf) => {
    object = gltf.scene;
    let scale = 0.3;
    object.scale.set(scale, scale, scale);

    

    scene.add(object);
    object.rotation.y = Math.PI/2;
    camera.lookAt(object.position);
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
  'art/WebRoom2.gltf',
  (gltf) => {
    secobject = gltf.scene;
    let scale = 1.5;
    secobject.scale.set(scale, scale, scale);

    

    scene.add(secobject);
    secobject.position.set(3, 0,-1);
    secobject.rotation.y = Math.PI/2;
  },
  (xhr) => {
    console.log(`${(xhr.loaded / xhr.total) * 100}% loaded`);
  },
  (error) => {
    console.error('Error loading GLTF object:', error);
  }
);







// Ground Plane
const groundsize = 130;
// const groundGeo = new THREE.PlaneGeometry(groundsize, groundsize);
// const groundMat = new THREE.MeshBasicMaterial({
//   color: 0xffffff,
//   side: THREE.DoubleSide,
//   wireframe: true
// });
// const groundMesh = new THREE.Mesh(groundGeo, groundMat);
// groundMesh.rotation.x = Math.PI / 2;
// scene.add(groundMesh);




//     PHYSICS WORLD   //////////////////////////////////////////////////////////////////////////////////


const world = new CANNON.World({
  gravity: new CANNON.Vec3(0, -9.81, 0)
});

// Ground Body

const groundPhysMat = new CANNON.Material();
const groundBody = new CANNON.Body({
  shape: new CANNON.Box(new CANNON.Vec3(groundsize, 0.1, groundsize)),
  type: CANNON.Body.STATIC,
  material: groundPhysMat
});
world.addBody(groundBody);
groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 0), Math.PI / 2);

// Blue Box Body
const boxPhysMat = new CANNON.Material();
const startPosition = new CANNON.Vec3(-2, 0.1, -2);
const boxBody = new CANNON.Body({
  mass: 5,
  shape: new CANNON.Box(new CANNON.Vec3(1, 1, 1)),
  position: startPosition,
  material: boxPhysMat
});
boxBody.fixedRotation = true;
world.addBody(boxBody);


// Collision Bodies
const redBoxPhysMat = new CANNON.Material();

function generateBodies() {
  const bodies = [];

  const mass = 0;
  const redBoxPhysMat = new CANNON.Material();

  const bodyData = [
    //Livingroom
    
    //1.Sofa
    { shape: new CANNON.Box(new CANNON.Vec3(8, 6, 6)), position: new CANNON.Vec3(16, 0, 2.5) },
    //2.Chair
    { shape: new CANNON.Box(new CANNON.Vec3(2.3, 6, 2.3)), position: new CANNON.Vec3(5.2, 0, -0.5)},
    //3.Tv
    { shape: new CANNON.Box(new CANNON.Vec3(17, 6, 2.3)), position: new CANNON.Vec3(14, 0, -13.5)},
    //4.Computer-Bedroom Wall
    { shape: new CANNON.Box(new CANNON.Vec3(1.2, 6, 11)), position: new CANNON.Vec3(-11, 0, -12) },
    

    //Artroom

    //5.Drawing table
    { shape: new CANNON.Box(new CANNON.Vec3(4.5, 6, 2)), position: new CANNON.Vec3(-35, 0, 8) },
    //6.Bedroom-Artroom wall
    { shape: new CANNON.Box(new CANNON.Vec3(15, 6, 1)), position: new CANNON.Vec3(-26, 0, 6) },
    { shape: new CANNON.Box(new CANNON.Vec3(2.8, 6, 2.1)), position: new CANNON.Vec3(-14, 0, 6) },
    //7.Canvas
    { shape: new CANNON.Box(new CANNON.Vec3(1, 6, 1)), position: new CANNON.Vec3(-38.2, 0, 11.5) },

    //Bedroom

    //8.Bed
    { shape: new CANNON.Box(new CANNON.Vec3(7.5, 6, 6)), position: new CANNON.Vec3(-32, 0, -1.5) },
    //9.BedStand
    { shape: new CANNON.Box(new CANNON.Vec3(2, 6, 5)), position: new CANNON.Vec3(-38, 0, -13) },
    //10.BedroomSofa
    { shape: new CANNON.Box(new CANNON.Vec3(2, 6, 7.5)), position: new CANNON.Vec3(-38, 0, -26) },
    //11.Table
    { shape: new CANNON.Box(new CANNON.Vec3(1.5, 6, 1.5)), position: new CANNON.Vec3(-30, 0, -25.2) },
    //12.PillowOrange
    { shape: new CANNON.Box(new CANNON.Vec3(1.56, 6, 1.56)), position: new CANNON.Vec3(-21, 0, -30.2) },
    //13.PillowWhite
    { shape: new CANNON.Box(new CANNON.Vec3(1.5, 6, 1.5)), position: new CANNON.Vec3(-24.6, 0, -31.2) },
    //14.Door
    { shape: new CANNON.Box(new CANNON.Vec3(2.4, 6, 2.4)), position: new CANNON.Vec3(-14, 0, -32)},
    
    //Study Room
    
    //15.Table
    { shape: new CANNON.Box(new CANNON.Vec3(10.5, 6, 2.8)), position: new CANNON.Vec3(0, 0, -31)},
    //16.Chair
    { shape: new CANNON.Box(new CANNON.Vec3(2, 6, 2)), position: new CANNON.Vec3(5.4, 0, -28)},
    //17.Wall Shelf
    { shape: new CANNON.Box(new CANNON.Vec3(2, 6, 1)), position: new CANNON.Vec3(13, 0, -33)},
    
    //18.Cabinet
    { shape: new CANNON.Box(new CANNON.Vec3(9.4, 6, 3.9)), position: new CANNON.Vec3(11, 0, 40.5) },
    { shape: new CANNON.Box(new CANNON.Vec3(2.5, 6, 10.4)), position: new CANNON.Vec3(5, 0, 31.5) },
    { shape: new CANNON.Box(new CANNON.Vec3(4.5, 6, 2.4)), position: new CANNON.Vec3(26, 0, 40.5) },
    
    //Walls
    
    //19.Bedroom-ArtRoom
    { shape: new CANNON.Box(new CANNON.Vec3(1, 6, 28.5)), position: new CANNON.Vec3(-41, 1.5, -7) },
    //20.Bedroom-Study Room
    { shape: new CANNON.Box(new CANNON.Vec3(42.5, 6, 1)), position: new CANNON.Vec3(-0.2, 1.5, -33.4) },
    //21.StudyRoom - Ground
    { shape: new CANNON.Box(new CANNON.Vec3(4.5, 4, 10.2)), position: new CANNON.Vec3(21.7, 1.5, -25) },
    //22.LivingRoom-StudyRoom
    { shape: new CANNON.Box(new CANNON.Vec3(17.5, 4, 1)), position: new CANNON.Vec3(14, 1.5, -15.4) },
    //23.LivingRoom Front
    { shape: new CANNON.Box(new CANNON.Vec3(1, 4, 12.5)), position: new CANNON.Vec3(31, 1.5, 32) },
    { shape: new CANNON.Box(new CANNON.Vec3(1, 4, 14.5)), position: new CANNON.Vec3(31, 1.5, -1.5) },
    //24.LivingRoom-ArtRoom
    { shape: new CANNON.Box(new CANNON.Vec3(16.5, 4, 1)), position: new CANNON.Vec3(-24.4, 1.5, 20.4) },
    { shape: new CANNON.Box(new CANNON.Vec3(2.8, 4, 3)), position: new CANNON.Vec3(0.3, 1.5, 23.1) },
    { shape: new CANNON.Box(new CANNON.Vec3(0.8, 6, 5)), position: new CANNON.Vec3(-11, 0, 18.5) },

    //Ground
    //25.Backyard Shrub1
    { shape: new CANNON.Box(new CANNON.Vec3(2.2, 4, 2.2)), position: new CANNON.Vec3(-11.5, 1.5, 23.1) },
    //26.Backyard Shrub2
    { shape: new CANNON.Box(new CANNON.Vec3(3.2, 4, 2.2)), position: new CANNON.Vec3(-41, 1.5, 23.1) },
    //27.Back Tree
    { shape: new CANNON.Box(new CANNON.Vec3(1.2, 4, 1.2)), position: new CANNON.Vec3(-32.5, 1.5, 35.1) },
     //28.Bench
     { shape: new CANNON.Box(new CANNON.Vec3(1.5, 4, 5.2)), position: new CANNON.Vec3(-29, 1.5, 32) },
     //29.Front Shrub Gate 1
     { shape: new CANNON.Box(new CANNON.Vec3(2, 4, 5.2)), position: new CANNON.Vec3(35, 1.5, 25.1) },
     //30.Front Shrub Gate 2
     { shape: new CANNON.Box(new CANNON.Vec3(2, 4, 3.2)), position: new CANNON.Vec3(34, 1.5, 6.1) },
     //31.Front Shrub Gate 3
     { shape: new CANNON.Box(new CANNON.Vec3(5, 4, 3.2)), position: new CANNON.Vec3(37, 1.5, 42.1) },
    //Fence
    { shape: new CANNON.Box(new CANNON.Vec3(0.5, 4, 9.5)), position: new CANNON.Vec3(42.6, 1.5, 35) },
    { shape: new CANNON.Box(new CANNON.Vec3(0.5, 4, 20)), position: new CANNON.Vec3(42.6, 1.5, -13.5) },
    //Back
    { shape: new CANNON.Box(new CANNON.Vec3(11.5, 4, 0.5)), position: new CANNON.Vec3(-6, 1.5, 44) },
    { shape: new CANNON.Box(new CANNON.Vec3(9.5, 4, 0.5)), position: new CANNON.Vec3(-35.4, 1.5, 44) },
    { shape: new CANNON.Box(new CANNON.Vec3(0.5, 4, 9.5)), position: new CANNON.Vec3(-45.4, 1.5, 34) },
    

  ];

  bodyData.forEach(data => {
    const body = new CANNON.Body({
      mass: mass,
      shape: data.shape,
      position: data.position,
      material: redBoxPhysMat
    });

    world.addBody(body);
    bodies.push(body);
  });

  return bodies;
}

generateBodies();
  



// Ground-Box Contact Material
const groundBoxContactMat = new CANNON.ContactMaterial(
  groundPhysMat,
  boxPhysMat,
  { friction: 1}
);
world.addContactMaterial(groundBoxContactMat);

// Ground-RedBox Contact Material
const redGroundBoxContactMat = new CANNON.ContactMaterial(
  groundPhysMat,
  redBoxPhysMat,
);
world.addContactMaterial(redGroundBoxContactMat);

// Time step for physics simulation
const timeStep = 1 / 60;



// Keyboard controls
const keyboard = {};
document.addEventListener('keydown', (event) => {
  keyboard[event.code] = true;
});
document.addEventListener('keyup', (event) => {
  keyboard[event.code] = false;
});

// function levitateObject() {
//   if(object){
    
//       const oscillationSpeed = 0.005; 
//       const amplitude = 0.3; 

//     boxBody.position.y = Math.sin(Date.now() * oscillationSpeed) * amplitude;
      
//     }
//   }
function moveobject() {
const section = document.getElementById('contact'); 
  const rect = section.getBoundingClientRect();
  const isVisible = rect.top < window.innerHeight && rect.bottom >= 0;

  if (!isVisible) {
    
  
  if (object) {
    const speed = 0.15;

    if (keyboard['KeyW']) {
      boxBody.position.x -= speed;
      object.rotation.y = 0; 
    }

    if (keyboard['KeyS']) {
      boxBody.position.x += speed;
      object.rotation.y = Math.PI; 
    }

    if (keyboard['KeyA']) {
      boxBody.position.z += speed;
      object.rotation.y = Math.PI / 2; 
      
    }

    if (keyboard['KeyD']) {
      boxBody.position.z -= speed; 
      object.rotation.y = -Math.PI / 2; 
    }

    // Update target camera position relative to the ball
    targetCameraPosition.x = boxBody.position.x + cameraDistance;
    targetCameraPosition.y = boxBody.position.y + cameraHeight;
    targetCameraPosition.z = boxBody.position.z + cameraDistance;

    // Smoothly move the camera towards the target position
    cameraVelocity.lerp(targetCameraPosition, cameraFollowSpeed);
    camera.position.copy(cameraVelocity);


    //Attach collider to the blue body
      if(object){
        object.position.set(boxBody.position.x, boxBody.position.y-3.3, boxBody.position.z);
      }

    }
  }
}

  function updatePositionIfBelow(boxBody, targetCoordinates) {
    if (boxBody.position.y < -2) {
      boxBody.position.copy(targetCoordinates);
      object.rotation.y = Math.PI/2;
    }
  }

  

// Cannon Debugger
const cannonDebugger = new CannonDebugger(scene, world);
  



// Create a colored overlay
var overlay = document.getElementById('scene');
overlay.style.backgroundColor = 'rgba(84, 0, 31, 0.4)'; // Set the desired color and opacity

function animate() {
  requestAnimationFrame(animate);
  
  world.step(timeStep);

  // Function to handle scrolling event
  moveobject();
  

  
  
  // levitateObject();
  // cannonDebugger.update();
  updatePositionIfBelow(boxBody,startPosition);

  // Render the scene
  // renderer.render(scene, camera);
  composer.render();
}
animate();

// Attach the scroll event listener
window.addEventListener('scroll', moveobject);





