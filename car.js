import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as YUKA from 'yuka';
import {createGraphHelper} from './graphhelper.js';

// Scene setup
const scene = new THREE.Scene();

// Camera setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(6,10,14);
camera.lookAt(scene.position);

// Lighting
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(3, 10, 2); // Set the position of the light source

const ambientlight = new THREE.AmbientLight(0x071432,0);
scene.add(ambientlight,directionalLight);

// Renderer setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enabled = true; // Disable orbit controls initially
controls.enableRotate = true; // Disable rotation control

const vehicleGeometry = new THREE.ConeGeometry(0.125,0.5,16);
const vehicleMat = new THREE.MeshNormalMaterial();
const vehicleMesh = new THREE.Mesh(vehicleGeometry,vehicleMat);
vehicleMesh.matrixAutoUpdate = false;
scene.add(vehicleMesh);

function sync(entity,renderComponent){
  renderComponent.matrix.copy(entity.worldMatrix);
}

const entityManager = new YUKA.EntityManager();

const followPathBehavior = new YUKA.FollowPathBehavior();
followPathBehavior.active = false;
followPathBehavior.nextWaypointDistance = 0.5;

const vehicle = new YUKA.Vehicle();
vehicle.setRenderComponent(vehicleMesh,sync);
entityManager.add(vehicle);
vehicle.steering.add(followPathBehavior);

const time = new YUKA.Time();





// Load the glTF file
const loader = new GLTFLoader();
loader.load('art/map.glb', (glb) => {
  const model = glb.scene;

  // Add the model to the scene
  scene.add(model);
  
});

const navMeshLoader = new YUKA.NavMeshLoader();
navMeshLoader.load('art/navmesh.glb').then((navigationMesh) => {
  const navMesh = navigationMesh;
  const graph = navMesh.graph;
  const graphHelper = createGraphHelper(graph, 0.2);
  scene.add(graphHelper);
});

  

  // Animation loop
  function animate() {
    const delta = time.update().getDelta();
    entityManager.update(delta);
    renderer.render(scene,camera);
  
};

renderer.setAnimationLoop(animate);
