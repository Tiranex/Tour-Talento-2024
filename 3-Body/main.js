// Particle colors
const colors = {p1: "red", p2: "blue", p3: "green"}
const trajectory_color=["lightcoral", "lightblue", "lightgreen"]
// Parameters
const grid_size = 100
const axis_length = 20


const canvas  =document.getElementById('canvas');
const context = canvas.getContext('2d');

const nodes= [
    {
        x: 0,
        y: 0,
        radius: 12,
        color: colors.p1
    },
    {
        x: 0,
        y: 0,
        radius: 12,
        color: colors.p2
    },
    {
        x: 0,
        y: 0,
        radius: 12,
        color: colors.p3
    }
]
let end = false;
const trajectory_length = 1500;
let trajectory_count = 0;
let current_trajectory = new Array(trajectory_length);
let y = [-1, 0, 0.347111, 0.532728, 
    1, 0, 0.347111, 0.532728, 
    0, 0,  -0.694222, -1.065456
    ];
let drag = false;

let trajectory_enabled = [true, true, true];
/**
 * Resizes the canvas to match the window dimensions and triggers a redraw.
 */
const control = document.getElementById("controls");
function resize(){
    min = Math.min(window.innerWidth, window.innerHeight);
    canvas.width = min
    canvas.height = min
    if(window.innerWidth - min < control.clientWidth+70)
        canvas.width = window.innerWidth
    if(canvas.width > document.documentElement.clientWidth)
        canvas.width = document.documentElement.clientWidth;
    draw();
}
window.onresize = resize;


/**
 * Draws the canvas, cartesian coordinates, trajectory, velocity field, and nodes.
 */
function draw(){
    context.clearRect(0, 0, canvas.width, canvas.height);
    cartesian_draw();
    trajectory_draw();
    // Draw nodes
    for(let i=0; i<nodes.length; i++){
        context.beginPath();
        let cartesian = cartesian_to_canvas(nodes[i].x, nodes[i].y);
        context.arc(cartesian.x, cartesian.y, nodes[i].radius, 0, 2 * Math.PI);
        context.fillStyle = nodes[i].color;
        context.fill();
        context.closePath();
    }
    
}

/**
 * Draws the trajectory on the canvas.
 */
function trajectory_draw(){


    function one_trajectory_draw(y, y_next, color){
        context.beginPath();
        let cartesian = cartesian_to_canvas(y[0], y[1]);
        context.moveTo(cartesian.x, cartesian.y);
        cartesian = cartesian_to_canvas(y_next[0], y_next[1]);
        context.lineTo(cartesian.x, cartesian.y);
        context.strokeStyle = color;
        context.lineWidth = 2;
        context.stroke();
        context.closePath();
    }
    for(let i=0; i<trajectory_count-3; i++){
        if(trajectory_enabled[0])
            one_trajectory_draw([current_trajectory[i][0], current_trajectory[i][1]], [current_trajectory[i+1][0], current_trajectory[i+1][1]], trajectory_color[0]);
        if(trajectory_enabled[1])
            one_trajectory_draw([current_trajectory[i][4], current_trajectory[i][5]], [current_trajectory[i+1][4], current_trajectory[i+1][5]], trajectory_color[1]);
        if(trajectory_enabled[2])
            one_trajectory_draw([current_trajectory[i][8], current_trajectory[i][9]], [current_trajectory[i+1][8], current_trajectory[i+1][9]], trajectory_color[2]);
    }
}

/**
 * Draws the velocity field on the canvas.
 */   

/**
 * Draws a Cartesian grid on the canvas.
 */
function cartesian_draw(){
    context.fillStyle = "black";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = "white";
    context.lineWidth =  1.5;

    // Draw x-axis
    context.beginPath();
    context.moveTo(0, canvas.height/2);
    context.lineTo(canvas.width, canvas.height/2);
    context.stroke();
    context.closePath();

    // Draw y-axis
    context.beginPath();
    context.moveTo(canvas.width/2, 0);
    context.lineTo(canvas.width/2, canvas.height);
    context.stroke();
    context.closePath();
    
    // Draw grid
    context.strokeStyle = "gray";
    context.lineWidth = 0.5;
    for(let i=0; i<canvas.width/2; i+=grid_size){
        context.beginPath();
        context.moveTo(canvas.width/2+ i, 0);
        context.lineTo(canvas.width/2 + i, canvas.height);
        context.stroke();
        context.closePath();

        context.beginPath();
        context.moveTo(canvas.width/2- i, 0);
        context.lineTo(canvas.width/2 - i, canvas.height);
        context.stroke();
    }
    for(let j=0; j<canvas.height; j+=grid_size){
        context.beginPath();
        context.moveTo(0, canvas.height/2+ j);
        context.lineTo(canvas.width, canvas.height/2 + j);
        context.stroke();
        context.closePath();

        context.beginPath();
        context.moveTo(0, canvas.height/2- j);
        context.lineTo(canvas.width, canvas.height/2 - j);
        context.stroke();
        context.closePath();
    }

    // Draw axis labels
    context.fillStyle = "white";
    context.lineWidth = 1.25;
    context.font = "15px Arial";
    context.textAlign = "center";
    context.fillStyle = "gray";
    for(let i=0; i<canvas.width/2; i+=grid_size){
        context.beginPath();
        context.moveTo(canvas.width/2+ i, canvas.height/2 -axis_length);
        context.lineTo(canvas.width/2 + i, canvas.height/2 + axis_length);
        context.stroke();
        context.closePath();

        context.beginPath();
        context.moveTo(canvas.width/2- i, canvas.height/2 - axis_length);
        context.lineTo(canvas.width/2 - i, canvas.height/2 + axis_length);
        context.stroke();
        context.closePath();

        // Draw text
        if(i != 0){
            context.fillText(i/grid_size, canvas.width/2 + i, canvas.height/2 + 2*axis_length)
            context.fillText(-i/grid_size, canvas.width/2 - i, canvas.height/2 + 2*axis_length)
        }
    }
    for(let j=0; j<canvas.height; j+=grid_size){
        context.beginPath();
        context.moveTo(canvas.width/2 -axis_length, canvas.height/2+ j);
        context.lineTo(canvas.width/2 + axis_length, canvas.height/2 + j);
        context.stroke();
        context.closePath();

        context.beginPath();
        context.moveTo(canvas.width/2 - axis_length, canvas.height/2- j);
        context.lineTo(canvas.width/2 + axis_length, canvas.height/2 - j);
        context.stroke();
    }

}

/* Solver*/
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

/**
 * Calculates the derivative of the state vector.
 * @param {number[]} yprime - The derivative of the state vector.
 * @param {number[]} y - The state vector.
 * @param {number} t - The time.
 */
function f(yprime, y, t){
    // We copy the values know from state into yprime
    yprime[0] = y[2]
    yprime[1] = y[3]

    yprime[4] = y[6]
    yprime[5] = y[7]

    yprime[8] = y[10]
    yprime[9] = y[11]

    // We calculate the acceleration of the first mass
    yprime[2] = (y[8]-y[0]) / (Math.sqrt((y[8]-y[0])**2 + (y[9]-y[1])**2))**3 * mass.m_3 + 
                (y[4]-y[0]) / (Math.sqrt((y[4]-y[0])**2 + (y[5]-y[1])**2))**3 * mass.m_2
    
    yprime[3] = (y[9]-y[1]) / (Math.sqrt((y[8]-y[0])**2 + (y[9]-y[1])**2))**3 * mass.m_3 +
                (y[5]-y[1]) / (Math.sqrt((y[4]-y[0])**2 + (y[5]-y[1])**2))**3 * mass.m_2
    
    yprime[6] = (y[0]-y[4]) / (Math.sqrt((y[0]-y[4])**2 + (y[1]-y[5])**2))**3 * mass.m_1 +
                (y[8]-y[4]) / (Math.sqrt((y[8]-y[4])**2 + (y[9]-y[5])**2))**3 * mass.m_3
    
    yprime[7] = (y[1]-y[5]) / (Math.sqrt((y[0]-y[4])**2 + (y[1]-y[5])**2))**3 * mass.m_1 +
                (y[9]-y[5]) / (Math.sqrt((y[8]-y[4])**2 + (y[9]-y[5])**2))**3 * mass.m_3
    
    yprime[10] = (y[0]-y[8]) / (Math.sqrt((y[0]-y[8])**2 + (y[1]-y[9])**2))**3 * mass.m_1 +
                (y[4]-y[8]) / (Math.sqrt((y[4]-y[8])**2 + (y[5]-y[9])**2))**3 * mass.m_2
    
    yprime[11] = (y[1]-y[9]) / (Math.sqrt((y[0]-y[8])**2 + (y[1]-y[9])**2))**3 * mass.m_1 +
                (y[5]-y[9]) / (Math.sqrt((y[4]-y[8])**2 + (y[5]-y[9])**2))**3 * mass.m_2
    
    
}

/**
 * Performs the Runge-Kutta method to solve differential equations.
 * @param {number} t - The current time.
 * @param {number[]} y - The state vector.
 * @param {function} f - The function that calculates the derivative of the state vector.
 * @param {number} delta_t - The time step size.
 * @returns {number[]} The updated state vector.
 */
function runge_Kutta(t, y, f, delta_t){
    
    let k1 = Array(12).fill(0);
    let k2 = Array(12).fill(0);
    let k3 = Array(12).fill(0);
    let k4 = Array(12).fill(0);
    // K1 = h*f(t, y)
    f(k1, y)
    k1 = const_multiplication(delta_t, k1)
    // K2 = h*f(t + delta_t/2, y + delta_t/2*k1)
    f(k2, vector_sum(y, const_multiplication(1/2, k1)))
    
    k2 = const_multiplication(delta_t, k2)
    // K3 = h*f(t + delta_t/2, y + delta_t/2*k2)
    f(k3, vector_sum(y, const_multiplication(1/2, k2)))
    k3 = const_multiplication(delta_t, k3)
    // K4 = h*f(t + delta_t, (p1, p2, p3) + delta_t*k3)
    f(k4, vector_sum(y, k3))
    k4 = const_multiplication(delta_t, k4)
    
    // v(t + delta_t) = v(t) + delta_t/6*(k1 + 2*k2 + 2*k3 + k4)
    return vector_sum(y, const_multiplication(1/6, vector_sum(k1, vector_sum(const_multiplication(2, k2), vector_sum(const_multiplication(2, k3), k4)))))
}


const delta_t = 0.0001;
function animation(runge_kutta_calls=50){
    if(end == true)
        return;
    step(runge_kutta_calls);
    
}

function step(runge_kutta_calls){
    for(let m=0; m< runge_kutta_calls; m++)
        y = runge_Kutta(0, y, f, delta_t)
    
    if(trajectory_count < trajectory_length){
        current_trajectory[trajectory_count] = y;
        trajectory_count++;
    } else {
        current_trajectory.shift();
        current_trajectory.push(y);
    }

    
    
    nodes[0].x = y[0]
    nodes[0].y = y[1]
    
    nodes[1].x = y[4]
    nodes[1].y = y[5]

    nodes[2].x = y[8]
    nodes[2].y = y[9]
    
    update_info();
    draw();
}
let play_interval = setInterval(animation, 1);


/**
 * Converts cartesian coordinates to canvas coordinates.
 * @param {number} x - The x-coordinate in cartesian system.
 * @param {number} y - The y-coordinate in cartesian system.
 * @returns {Object} - The converted coordinates in canvas system.
 */
function cartesian_to_canvas(x, y){
    return {x: canvas.width/2 + x*grid_size, y: canvas.height/2 - y*grid_size}
}

/**
 * Converts canvas coordinates to cartesian coordinates.
 * @param {number} x - The x-coordinate on the canvas.
 * @param {number} y - The y-coordinate on the canvas.
 * @returns {Object} - The converted cartesian coordinates.
 */
function canvas_to_cartesian(x, y){
    return {x: (x - canvas.width/2)/grid_size, y: (canvas.height/2 - y)/grid_size}
}

resize();

/* Inputs */
function play_pause(){
    if(end){
        end = false;
        play_button.innerHTML = '<path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5m5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5"/>'
    } else{
        end = true;
        play_button.innerHTML = '<path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393"/>'
    }
}
const play_button = document.getElementById("play");
play_button.onclick = play_pause;

function reset(){
    y = initial_conditions[select_trajectory];
    if(end == true)
        play_pause();
    trajectory_count=0;

}

document.getElementById("reset").onclick = reset;

const skip_button = document.getElementById("skip");
let skip_interval;
skip_button.addEventListener("mousedown", function(){
    if(end == false)
        play_pause();
    skip_interval = setInterval(function(){
        step(30);
    }, 1);
});

skip_button.addEventListener("mouseup", function(){
    clearInterval(skip_interval);
});

let select_trajectory = 0;
document.getElementById("select_trajectory").onchange = function(){
    const options = document.querySelectorAll("#select_trajectory option");
    options[select_trajectory].classList.remove("active");
    select_trajectory = parseInt(this.value);
    options[select_trajectory].classList.add("active");
    load_settings();
}
const initial_conditions = [
    // Catenary 
    [-1, 0, 0.347111, 0.532728, 
    1, 0, 0.347111, 0.532728, 
    0, 0,  -0.694222, -1.065456
    ],
    // Dragonfly
    [-1, 0, 0.080584, 0.588836,
    1, 0, 0.080584, 0.588836,
    0, 0, -0.161168, -1.177672
    ],
    // Comba
    [0.536387073390, 0.054088605008, -0.569379585581, 1.255291102531, 
        -0.252099126491, 0.694527327749, 0.079644615252, -0.458625997341,
        -0.275706601688, -0.335933589318 , 0.489734970329, -0.796665105189],
    // Ovalos
    [0.716248295713, 0.384288553041, 1.245268230896, 2.444311951777, 
        0.086172594591, 1.342795868577, -0.675224323690, -0.962879613630
        ,0.538777980808,0.481049882656, -0.570043907206, -1.481432338147],
    // Butterfly
    [
        -1, 0, 0.306893, 0.125507,
        1, 0, 0.306893, 0.125507,
        0, 0, -0.613786, -0.251014
    ]
]

function load_settings(){
    reset();
    draw();
}

let mass = {m_1: 1, m_2: 1, m_3: 1}
document.getElementById("m1_number").onchange = function(){
    mass.m_1 = parseFloat(this.value);
    document.getElementById("m1_range").value = this.value;
}

document.getElementById("m2_number").onchange = function(){
    mass.m_2 = parseFloat(this.value);
    document.getElementById("m2_range").value = this.value;
}

document.getElementById("m3_number").onchange = function(){
    mass.m_3 = parseFloat(this.value);
    document.getElementById("m3_range").value = this.value;
}

document.getElementById("m1_range").onchange = function(){
    mass.m_1 = parseFloat(this.value);
    document.getElementById("m1_number").value = this.value;
}

document.getElementById("m2_range").onchange = function(){
    mass.m_2 = parseFloat(this.value);
    document.getElementById("m2_number").value = this.value;
}

document.getElementById("m3_range").onchange = function(){
    mass.m_3 = parseFloat(this.value);
    document.getElementById("m3_number").value = this.value;
}

document.getElementById("trajectory1").onchange = function(){
    trajectory_enabled[0] = this.checked;
}

document.getElementById("trajectory2").onchange = function(){
    trajectory_enabled[1] = this.checked;
}

document.getElementById("trajectory3").onchange = function(){
    trajectory_enabled[2] = this.checked;
}

function update_info(){
    nodes[0].x = y[0]
    nodes[0].y = y[1]
    
    nodes[1].x = y[4]
    nodes[1].y = y[5]

    nodes[2].x = y[8]
    nodes[2].y = y[9]

    document.getElementById("p1").innerHTML = "{x: <b>" + y[0].toFixed(2) + "</b>, y: <b>" + y[1].toFixed(2) + "</b>}";
    document.getElementById("p2").innerHTML = "{x: <b>" + y[4].toFixed(2) + "</b>, y: <b>" + y[5].toFixed(2) + "</b>}";
    document.getElementById("p3").innerHTML = "{x: <b>" + y[8].toFixed(2) + "</b>, y: <b>" + y[9].toFixed(2) + "</b>}";

    document.getElementById("v1").innerHTML = "{x: <b>" + y[2].toFixed(2) + "</b>, y: <b>" + y[3].toFixed(2) + "</b>}";
    document.getElementById("v2").innerHTML = "{x: <b>" + y[6].toFixed(2) + "</b>, y: <b>" + y[7].toFixed(2) + "</b>}";
    document.getElementById("v3").innerHTML = "{x: <b>" + y[10].toFixed(2) + "</b>, y: <b>" + y[11].toFixed(2) + "</b>}";

}