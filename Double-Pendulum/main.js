const canvas = document.getElementById("canvas");
const context = canvas.getContext('2d');
let min = null;

/*COLORS */
const background_color = "#333";
const axis_color = "white";
const bar_color = "gray";
const circle_color = "blue";
const circle_radius = 20;

let trajectory1 = [];
let trajectory2 = [];
let draw_trajectory1 = true;
let draw_trajectory2 = true;
const max_trajectory_length = 100;

let end = false;

let pos = [[Math.random() * 3.5 - 1.75, Math.random() * 3.5 - 1.75], [Math.random() * 3.5 - 1.75, Math.random() * 3.5 - 1.75]]

function draw_axis(){
    context.fillStyle = background_color;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = axis_color;
    context.lineWidth =  1.5;

    // Draw x-axis
    context.beginPath();
    context.moveTo(0, canvas.height-10);
    context.lineTo(canvas.width, canvas.height-10);
    context.stroke();
    context.closePath();

    // Draw y-axis
    context.beginPath();
    context.moveTo(10, 0);
    context.lineTo(10, canvas.height);
    context.stroke();
    context.closePath();

}
function draw_axis_labels(){
    // Draw axis labels
    context.font = "15px Montserrat";
    context.fillStyle = "white";
    for(let i = -1.5; i < 2; i += 0.5) {
        context.fillText(i, 20, canvas.height/2 + i*min/4 + 5);
        
    }
    for(let i = -1.5; i < 2; i += 0.5) {
        context.fillText(i, canvas.width/2 + i*min/4, canvas.height - 20);
    }
}
function draw_variables() {
    context.font = "15px Montserrat";
    context.fillStyle = "white";
    context.fillText(`θ1: ${(y[0]*180 / Math.PI).toFixed(2)}`, canvas.width - 80, 30);
    context.fillText(`θ2: ${(y[1]*180 / Math.PI).toFixed(2)}`, canvas.width - 80, 50);
    context.fillText(`ω1: ${(y[2]*180 / Math.PI).toFixed(2)}`, canvas.width - 80, 70);
    context.fillText(`ω2: ${(y[3]*180 / Math.PI).toFixed(2)}`, canvas.width - 80, 90);
}

function draw_elements(){
    // Lines
    context.strokeStyle = bar_color;
    context.lineWidth = 3;
    context.beginPath();
    context.moveTo(canvas.width/2, canvas.height/2);
    context.lineTo(...cartesian_to_canvas(pos[0][0], pos[0][1]));
    context.stroke();
    context.closePath();

    context.beginPath();
    context.moveTo(...cartesian_to_canvas(pos[0][0], pos[0][1]));
    context.lineTo(...cartesian_to_canvas(pos[1][0], pos[1][1]));
    context.stroke();
    context.closePath();

    // Circles
    context.fillStyle = circle_color;
    context.beginPath();
    context.arc(...cartesian_to_canvas(pos[0][0], pos[0][1]), circle_radius, 0, 2*Math.PI);
    context.fill();
    context.closePath();

    context.beginPath();
    context.arc(...cartesian_to_canvas(pos[1][0], pos[1][1]), circle_radius, 0, 2*Math.PI);
    context.fill();
    context.closePath();

    // Trajectory
    if(draw_trajectory1) {
        for(let i = 0; i<trajectory1.length; i++){
            context.fillStyle = circle_color;
            context.beginPath();
            context.arc(...cartesian_to_canvas(trajectory1[i][0], trajectory1[i][1]), 5, 0, 2*Math.PI);
            context.fill();
            context.closePath();
        }
    }
    
    if(draw_trajectory2) {
        for(let i = 0; i<trajectory2.length; i++){
            context.fillStyle = circle_color;
            context.beginPath();
            context.arc(...cartesian_to_canvas(trajectory2[i][0], trajectory2[i][1]), 5, 0, 2*Math.PI);
            context.fill();
            context.closePath();
        }
    }
    
}
function draw(){
    draw_axis();
    draw_axis_labels();
    draw_variables();
    update();
    draw_elements();
}

function update(){
    if(end)
        return;
    solve();
}

function solve(){
    y = runge_Kutta(0, y, f, time_step)
    pos[0] = [l1*Math.sin(y[0]), -l1*Math.cos(y[0])]
    pos[1] = [l2*Math.sin(y[1]) + pos[0][0], -l2*Math.cos(y[1]) + pos[0][1]]
    
    trajectory1.push(pos[0]);
    trajectory2.push(pos[1]);

    if(trajectory1.length > max_trajectory_length)
        trajectory1.shift();
    if(trajectory2.length > max_trajectory_length)
        trajectory2.shift();
}




function resize(){
    min = Math.min(window.innerWidth, window.innerHeight);
    canvas.width = min
    canvas.height = min
    draw();
}

function cartesian_to_canvas(x, y){
    return [canvas.width/2 + x*min/4, canvas.height/2 - y*min/4];
}

window.onresize = resize;


/* Connect Elements to inputs */
let m1 = 2;
let m2 = 2;
let l1 = 1;
let l2 = 1;
let g = 9.81;
const time_step = 0.01;
let theta1 = 2*Math.PI*(2/3);
let theta2 = 2*Math.PI*(10/360);
let w_1 = 0;
let w_2 = 0;
let y = [theta1, theta2, w_1, w_2]
/* Solver */
function f(yprime, y, t){
    // We copy the values know from state into yprime
    yprime[0] = y[2]
    yprime[1] = y[3]

    let num = -g*(2*m1 + m2)*Math.sin(y[0]) - m2*g*Math.sin(y[0] - 2*y[1]) - 2*Math.sin(y[0] - y[1])*m2*(y[3]**2*l2 + y[2]**2*l1*Math.cos(y[0] - y[1]))
    let den = l1*(2*m1 + m2 - m2*Math.cos(2*y[0] - 2*y[1]))
    yprime[2] = num/den

    num = 2*Math.sin(y[0] - y[1])*(y[2]**2*l1*(m1 + m2) + g*(m1 + m2)*Math.cos(y[0]) + y[3]**2*l2*m2*Math.cos(y[0] - y[1]))
    den = l2*(2*m1 + m2 - m2*Math.cos(2*y[0] - 2*y[1]))

    yprime[3] = num/den

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
function runge_Kutta(t, y, f, delta_t){
    
    let k1 = Array(4).fill(0);
    let k2 = Array(4).fill(0);
    let k3 = Array(4).fill(0);
    let k4 = Array(4).fill(0);
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

/* Start Reset */
function reset(){
    end = false;
    y = [theta1, theta2, w_1, w_2]
    trajectory1 = [];
    trajectory2 = [];
}

function play_pause(){
    if(end){
        end = false;
        play_button.innerHTML = '<path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5m5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5"/>'
    } else{
        end = true;
        play_button.innerHTML = '<path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393"/>'
    }
}

const play_button = document.getElementById("play")
play_button.onclick = play_pause;

document.getElementById("reset").onclick = reset;

let interval = null;
document.getElementById("skip").addEventListener("mousedown", function(){
    if(end==false)
        play_pause();
        
    interval = setInterval(solve, time_step*4000);
});

document.getElementById("skip").addEventListener("mouseup", function(){
    clearInterval(interval);
});



/* Connect Inputs */
document.getElementById("m1_range").onchange = function(){ 
    m1 = parseFloat(this.value).toFixed(2);
    document.getElementById("m1_number").value = m1;
}
document.getElementById("m1_number").onchange = function(){
    m1 = parseFloat(this.value).toFixed(2);
    document.getElementById("m1_range").value = m1;
} 

document.getElementById("m2_range").onchange = function(){ 
    m2 = parseFloat(this.value).toFixed(2);
    document.getElementById("m2_number").value = m2;
}
document.getElementById("m2_number").onchange = function(){
    m2 = parseFloat(this.value).toFixed(2);
    document.getElementById("m2_range").value = m2;
}

document.getElementById("l1_range").onchange = function(){ 
    l1 = parseFloat(this.value).toFixed(2);
    document.getElementById("l1_number").value = l1;
}

document.getElementById("l1_number").onchange = function(){
    l1 = parseFloat(this.value).toFixed(2);
    document.getElementById("l1_range").value = l1;
}

document.getElementById("l2_range").onchange = function(){ 
    l2 = parseFloat(this.value).toFixed(2);
    document.getElementById("l2_number").value = l2;
}

document.getElementById("l2_number").onchange = function(){
    l2 = parseFloat(this.value).toFixed(2);
    document.getElementById("l2_range").value = l2;
}

document.getElementById("g_range").onchange = function(){ 
    g = parseFloat(this.value).toFixed(2);
    document.getElementById("g_number").value = g;
}

document.getElementById("g_number").onchange = function(){
    g = parseFloat(this.value).toFixed(2);
    document.getElementById("g_range").value = g;
}

/* Initial conditions */
document.getElementById("a1_range").onchange = function(){ 
    theta1 = parseFloat(this.value) * Math.PI / 180;
    document.getElementById("a1_number").value = parseFloat(this.value);
}

document.getElementById("a1_number").onchange = function(){
    theta1 = parseFloat(this.value) * Math.PI / 180;
    document.getElementById("a1_range").value = parseFloat(this.value);
}

document.getElementById("a2_range").onchange = function(){ 
    theta2 = parseFloat(this.value) * Math.PI / 180;
    document.getElementById("a2_number").value = parseFloat(this.value);
}

document.getElementById("a2_number").onchange = function(){
    theta2 = parseFloat(this.value) * Math.PI / 180;
    document.getElementById("a2_range").value = parseFloat(this.value);
}

document.getElementById("v1_range").onchange = function(){ 
    w_1 = parseFloat(this.value)
    document.getElementById("v1_number").value = w_1;
}

document.getElementById("v1_number").onchange = function(){ 
    w_1 = parseFloat(this.value)
    document.getElementById("v1_number").value = w_1;
}

document.getElementById("v2_range").onchange = function(){ 
    w_2 = parseFloat(this.value)
    document.getElementById("v2_number").value = w_2;
}

document.getElementById("v2_number").onchange = function(){ 
    w_2 = parseFloat(this.value)
    document.getElementById("v2_number").value = w_2;
}

document.getElementById("trajectory1").onchange = function(){
    draw_trajectory1 = this.checked;
    trajectory1 = [];
}

document.getElementById("trajectory2").onchange = function(){
    draw_trajectory2 = this.checked;
    trajectory2 = [];
}

/* Main */
resize();
setInterval(draw, time_step*2000);