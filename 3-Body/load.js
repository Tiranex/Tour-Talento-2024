// Particle colors
const colors = {p1: "red", p2: "blue", p3: "green"}

// Parameters
const grid_size = 100
const axis_length = 20


const canvas  =document.getElementById('canvas');
const context = canvas.getContext('2d');

var nodes = [];
var selected_node = -1;
var current_trajectory = [];
var current_solution = [];
let drag = false;

/**
 * Resizes the canvas to match the window dimensions and triggers a redraw.
 */
function resize(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    draw();
}


/**
 * Draws the canvas, cartesian coordinates, trajectory, velocity field, and nodes.
 */
function draw(){
    context.clearRect(0, 0, canvas.width, canvas.height);
    cartesian_draw();
    trajectory_draw();
    velocity_field_draw();
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
    if (!trajectory_enabled)
        return;

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
    for(let i=0; i<current_trajectory.length-1; i++){
        one_trajectory_draw([current_trajectory[i][0], current_trajectory[i][1]], [current_trajectory[i+1][0], current_trajectory[i+1][1]], colors.p1);
        one_trajectory_draw([current_trajectory[i][4], current_trajectory[i][5]], [current_trajectory[i+1][4], current_trajectory[i+1][5]], colors.p2);
        one_trajectory_draw([current_trajectory[i][8], current_trajectory[i][9]], [current_trajectory[i+1][8], current_trajectory[i+1][9]], colors.p3);    
    }
}

/**
 * Draws the velocity field on the canvas.
 */
function velocity_field_draw(){
    if(!velocity_field_enabled)
        return;

    const increase_size = 1;
    function one_velocity_draw(y, v, color){
        context.beginPath();
        let cartesian = cartesian_to_canvas(y[0], y[1]);
        context.moveTo(cartesian.x, cartesian.y);
        cartesian = cartesian_to_canvas(y[0] + v[0]*increase_size, y[1] + v[1]*increase_size);
        context.lineTo(cartesian.x, cartesian.y);
        context.strokeStyle = color;
        context.stroke();
        context.closePath();
    }
        
    one_velocity_draw([current_solution[0], current_solution[1]], [current_solution[2], current_solution[3]], "white");
    one_velocity_draw([current_solution[4], current_solution[5]], [current_solution[6], current_solution[7]], "white");
    one_velocity_draw([current_solution[8], current_solution[9]], [current_solution[10], current_solution[11]], "white");

}    

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



/**
 * Finds the nearest node to the given coordinates on the canvas.
 * @param {MouseEvent} e - The mouse event object.
 * @returns {number} - The index of the nearest node, or -1 if no node is found.
 */
function find_nearest_node(e){
    // Check for nearest node
    let canvas_coord = canvas_to_cartesian(e.clientX, e.clientY);
    for(let i=0; i<nodes.length; i++){
        if(Math.abs(canvas_coord.x - nodes[i].x) < 0.25 && Math.abs(canvas_coord.y - nodes[i].y) < 0.25){
            return i;
        }
    }
    return -1;
}

function check_edge(node_1, selected_node){
    for(let i=0; i<edges.length; i++){
        if(edges[i].node_1 == node_1 && edges[i].node_2 == selected_node)
            return false;
        if(edges[i].node_1 == selected_node && edges[i].node_2 == node_1)
            return false;
    }
    return true
}


/**
 * Clears the nodes and edges arrays and redraws the graph.
 */
function clear(){
    nodes = [];
    edges = [];
    draw();
}

canvas.addEventListener('mousedown', function(e){
    selected_node = find_nearest_node(e);
})

canvas.addEventListener('mousemove', function(e){
    if(selected_node != -1){
        drag = true;
        let canvas_coord = canvas_to_cartesian(e.clientX, e.clientY);
        nodes[selected_node].x = canvas_coord.x;
        nodes[selected_node].y= canvas_coord.y;
        draw();
    }
})

canvas.addEventListener("mouseup", function(e){
    drag=false;
    selected_node = -1;
    draw();
})



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

nodes= [
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

window.onresize = resize;
resize();
draw();
