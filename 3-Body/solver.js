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

function animation(y, period){   
    let [T, Y] = integrate(f, 0, y, period, delta_t)

    console.log("Solution: ", Y)
    let i = 0
    const trajectory_length = parseInt(Y.length/time_step) + 1;
    current_trajectory.push(Y[0]);
    let interval = setInterval(function(){
        if(i < Y.length){
            if(current_trajectory.length < trajectory_length)
                current_trajectory.push(Y[i]);

            current_solution = Y[i];
            
            nodes[0].x = Y[i][0]
            nodes[0].y = Y[i][1]
            
            nodes[1].x = Y[i][4]
            nodes[1].y = Y[i][5]

            nodes[2].x = Y[i][8]
            nodes[2].y = Y[i][9]
            
            draw()
            
            

            i+=time_step;
        } else {
            i=0;
        }
    }, 1)

    return interval;
}

// Main
// Load JSON file
var initial_conditions;
var current_animation;
fetch("./initial_conditions.json")
                .then((res) => {
                    if (!res.ok) {
                        throw new Error
                            (`HTTP error! Status: ${res.status}`);
                    }
                    return res.json();
                })
                .then((data) => { 
                      initial_conditions = data; current_animation = reproduce(0); })
                .catch((error) => 
                       console.error("Unable to fetch data:", error));

// Parameters
var delta_t = 0.0001;
var time_step=150;
var time = 20
const mass = {m_1: 1, m_2: 1, m_3: 1}

function reproduce(i){
    let y = initial_conditions[i].y
    load_table(y);
    return animation(y, initial_conditions[i].period)
}
    
