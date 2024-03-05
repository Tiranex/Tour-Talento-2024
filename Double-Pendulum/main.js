const canvas = document.getElementById("canvas");
const context = canvas.getContext('2d');
let min = null;

/*COLORS */
const background_color = "#333";
const axis_color = "white";
const bar_color = "gray";
const circle_color = "blue";
const circle_radius = 20;

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
}
function draw(){
    draw_axis();
    draw_axis_labels();
    update();
    draw_elements();
}

function update(){
    y = runge_Kutta(0, y, f, time_step)
    pos[0] = [l1*Math.sin(y[0]), -l1*Math.cos(y[0])]
    pos[1] = [l2*Math.sin(y[1]) + pos[0][0], -l2*Math.cos(y[1]) + pos[0][1]]
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
const m1 = 2;
const m2 = 2;
const l1 = 1;
const l2 = 1;
const g = 9.81;
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

/**
 * Performs numerical integration using the Runge-Kutta method.
 * @param {function} f - The function that calculates the derivative of the state vector.
 * @param {number} t0 - The initial time.
 * @param {number[]} y0 - The initial state vector.
 * @param {number} tend - The end time.
 * @param {number} h - The time step size.
 * @returns {number[][]} An array containing the time values and the corresponding state vectors.
 */
function integrate(f, t0, y0, tend, h){
    let T=[t0]
    let Y=[y0]
    let t = t0
    let y = y0
    while(t < tend){
        y = runge_Kutta(t, y, f, h)
        t += h
        T.push(t)
        Y.push(y)
    }
    return [T, Y]
    
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


/* Main */
resize();
setInterval(draw, time_step*2000);