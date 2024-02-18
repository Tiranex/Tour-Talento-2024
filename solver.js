// Mass of planets
const mass = {m_1: 1, m_2: 1, m_3: 1}


function vector_sum(p1, p2){
    
    let vec = p1.slice()
    for(let i=0; i< p2.length; i++){
        vec[i] += p2[i]
    }
    return vec
}

function const_multiplication(c, p){
    let vec = p.slice()
    for(let i=0; i<p.length; i++){
        vec[i] *= c
    }
    
    return vec
}

// Starting coordinates for planets
var p1_start = {x: -1, y: 0}
var v1_start = {x: 0.306893, y: 0.125507}

var p2_start = {x: 1, y: 0}
var v2_start = {x: 0.306893, y: 0.125507}

var p3_start = {x: 0, y: 0}
var v3_start = {x: -0.613786, y: -0.251014}

let y = [p1_start.x, p1_start.y, v1_start.x, v1_start.y, 
        p2_start.x, p2_start.y, v2_start.x, v2_start.y, p3_start.x, p3_start.y, v3_start.x, v3_start.y]

y = [-1, 0, 0.306893, 0.125507, 1, 0, 0.306893, 0.125507, 0, 0, -0.613786, -0.251014]
y = [600, 500, 0.439166, 0.452968, 800, 500, 0.439166,0.452968, 700, 500, -2*0.439166, -2*0.452968]
y = [-1, 0, 0.439166, 0.452968, 1, 0, 0.439166,0.452968, 0, 0, -2*0.439166, -2*0.452968]
function f(yprime, y, t){
    // We copy the values know from state into yprime
    yprime[0] = y[2]
    yprime[1] = y[3]

    yprime[4] = y[6]
    yprime[5] = y[7]

    yprime[8] = y[10]
    yprime[9] = y[11]

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

// Parameters
var delta_t = 0.0001
const n = 2000

function runge_Kutta(t, y, f, delta_t){
    
    let k1 = Array(12).fill(0);
    let k2 = Array(12).fill(0);
    let k3 = Array(12).fill(0);
    let k4 = Array(12).fill(0);
    // K1 = f(t, p1, p2, p3)
    f(k1, y)
    k1 = const_multiplication(delta_t, k1)
    // K2 = f(t + delta_t/2, (p1, p2, p3) + delta_t/2*k1)
    f(k2, vector_sum(y, const_multiplication(1/2, k1)))
    console.log(vector_sum(y, const_multiplication(1/2, k1)))
    k2 = const_multiplication(delta_t, k2)
    // K3 = f(t + delta_t/2, (p1, p2, p3) + delta_t/2*k2)
    f(k3, vector_sum(y, const_multiplication(1/2, k2)))
    k3 = const_multiplication(delta_t, k3)
    // K4 = f(t + delta_t, (p1, p2, p3) + delta_t*k3)
    f(k4, vector_sum(y, k3))
    k4 = const_multiplication(delta_t, k4)
    
    // v(t + delta_t) = v(t) + delta_t/6*(k1 + 2*k2 + 2*k3 + k4)
    return vector_sum(y, const_multiplication(1/6, vector_sum(k1, vector_sum(const_multiplication(2, k2), vector_sum(const_multiplication(2, k3), k4)))))
}

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



    
