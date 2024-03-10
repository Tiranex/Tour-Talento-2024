import * as THREE from 'three';
import { OrbitControls } from './lib/OrbitControls.js';
import { TextGeometry } from './lib/TextGeometry.js';
import { FontLoader } from './lib/FontLoader.js';

let renderer, scene, camera;
let raycaster;
let controls;

let end = false;
const threshold = 0.1;
const POINTSIZE = 0.5;

var MAX_POINTS = 100000;
var geometry = new THREE.BufferGeometry();
var positions = new Float32Array( MAX_POINTS * 3 ); 
var colors = new Float32Array( MAX_POINTS * 3 );
let pointCloud;
const red = new THREE.Color(0xff0000);

function init3D() {
    console.log("Current parameters", a, b ,c);
    const container = document.getElementById('container');
    scene = new THREE.Scene();
    // Camera
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.00001, 0);
    const center_position = promedio();
    camera.position.set(center_position[0]*3, center_position[1]*3, center_position[2]*3);

    camera.lookAt(scene.position);
    console.log(promedio());
    camera.updateMatrix();
    // Axes and labels
    //const axesHelper = new THREE.AxesHelper( 5 );
    //scene.add( axesHelper );
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    raycaster = new THREE.Raycaster();
    raycaster.params.Points.threshold = threshold;
    // Controls
    controls = new OrbitControls( camera, renderer.domElement );
    controls.target.set(center_position[0],center_position[1],center_position[2]);
    controls.update();
    controls.enablePan = false;
    controls.enableDamping = true;  
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const material = new THREE.PointsMaterial({ size: POINTSIZE, vertexColors: true });
    pointCloud = new THREE.Points(geometry, material);
    
    scene.add(pointCloud);


    
    window.addEventListener('resize', onWindowResize);
}

function promedio(){
    const SAMPLE_SIZE = MAX_POINTS;
    let y_tmp = y.slice();
    const suma = [1,1,1];
    for(let i=0; i<SAMPLE_SIZE; i++){
        y_tmp = runge_Kutta(0,y_tmp,f,0.01,0);
        suma[0] += y_tmp[0];
        suma[1] += y_tmp[1];
        suma[2] += y_tmp[2];
    }
    suma[0] /= SAMPLE_SIZE;
    suma[1] /= SAMPLE_SIZE;
    suma[2] /= SAMPLE_SIZE;
    return suma;
}
let index = 0;
let y = [1,1,1];

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    
    // Add a point to the scene
    if(!end){
    
        if(index < MAX_POINTS ){
            const positions_geom = pointCloud.geometry.attributes.position.array;
            y = runge_Kutta(0, y, f, 0.01, index);
            positions_geom[index] = y[0];
            positions_geom[index+1] = y[1];
            positions_geom[index+2] = y[2];
            const colors_geom = pointCloud.geometry.attributes.color.array;
            colors_geom[index] = rainbowColors[index];
            colors_geom[index+1] = rainbowColors[index+1];
            colors_geom[index+2] = rainbowColors[index+2];
            index+=3;
        
        } else {
            index = 0;
        }
    }
    pointCloud.geometry.attributes.position.needsUpdate = true;
    pointCloud.geometry.attributes.color.needsUpdate = true;
    renderer.render(scene, camera);
}

function generateRainbowColors() {
    const colors = [];
    const numColors = MAX_POINTS / 3; // Assuming each point has 3 color components (RGB)
    const frequency = 2 * Math.PI / numColors * 10;

    for (let i = 0; i < numColors; i++) {
        const red = Math.sin(frequency * i + 0) * 127 + 128;
        const green = Math.sin(frequency * i + 2 * Math.PI / 3) * 127 + 128;
        const blue = Math.sin(frequency * i + 4 * Math.PI / 3) * 127 + 128;

        colors.push(red / 255, green / 255, blue / 255);
    }

    return colors;
}

const rainbowColors = generateRainbowColors();


function init(){
    document.getElementById('initial').style.display = 'none';
    init3D();
    animate();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    
}

/* Solver */
let a =10;
let b=28;
let c=8/3.;
function f(yprime, y, i, t){
    // We copy the values know from state into yprime
    yprime[0]= a*(y[1]-y[0]);
    yprime[1]=y[0]*(b-y[2])-y[1];
    yprime[2]=y[0]*y[1]-c*y[2];

    return yprime 
}



/**
 * Performs the Runge-Kutta method to solve differential equations.
 * @param {number} t - The current time.
 * @param {number[]} y - The state vector.
 * @param {function} f - The function that calculates the derivative of the state vector.
 * @param {number} delta_t - The time step size.
 * @returns {number[]} The updated state vector.
 */
function runge_Kutta(t, y, f, delta_t, i){
    
    let k1 = Array(3).fill(0);
    let k2 = Array(3).fill(0);
    let k3 = Array(3).fill(0);
    let k4 = Array(3).fill(0);
    // K1 = h*f(t, y)
    f(k1, y, i)
    k1 = const_multiplication(delta_t, k1)
    // K2 = h*f(t + delta_t/2, y + delta_t/2*k1)
    f(k2, vector_sum(y, const_multiplication(1/2, k1)),i)
    
    k2 = const_multiplication(delta_t, k2)
    // K3 = h*f(t + delta_t/2, y + delta_t/2*k2)
    f(k3, vector_sum(y, const_multiplication(1/2, k2)),i)
    k3 = const_multiplication(delta_t, k3)
    // K4 = h*f(t + delta_t, (p1, p2, p3) + delta_t*k3)
    f(k4, vector_sum(y, k3), i)
    k4 = const_multiplication(delta_t, k4)
    
    // v(t + delta_t) = v(t) + delta_t/6*(k1 + 2*k2 + 2*k3 + k4)
    return vector_sum(y, const_multiplication(1/6, vector_sum(k1, vector_sum(const_multiplication(2, k2), vector_sum(const_multiplication(2, k3), k4)))))
}

/* Auxiliary Functions /*

/**
 * Calculates the sum of two vectors.
 * @param {number[]} p1 - The first vector.
 * @param {number[]} p2 - The second vector.
 * @returns {number[]} The sum of the two vectors.
 */
function vector_sum(p1, p2){
    
    let vec = p1.slice()
    for(let i=0; i< p2.length; i++){
        vec[i] += p2[i]
    }
    return vec
}

/**
 * Multiplies each element of an array by a constant value.
 * @param {number} c - The constant value to multiply each element by.
 * @param {number[]} p - The array of numbers to be multiplied.
 * @returns {number[]} - The resulting array with each element multiplied by the constant value.
 */
function const_multiplication(c, p){
    let vec = p.slice()
    for(let i=0; i<p.length; i++){
        vec[i] *= c
    }
    
    return vec
}


document.getElementById("run").onclick = init;

document.getElementById("a").onchange = function(){
    a = parseFloat(this.value);
}

document.getElementById("b").onchange = function(){
    b = parseFloat(this.value);
}

document.getElementById("c").onchange = function(){
    c = parseFloat(this.value);
}

document.getElementById("reset").onclick = function(){
    location.reload();
}

const play_button = document.getElementById("play")
play_button.onclick = function(){
    if(end){
        end = false;
        play_button.innerHTML = '<path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5m5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5"/>'
    } else{
        end = true;
        play_button.innerHTML = '<path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393"/>'
    }
}