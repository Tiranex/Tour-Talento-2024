// Parameters
const aspect_ratio = 9/16
const grid_size = 50
const axis_length = 20


const canvas  =document.getElementById('canvas');
const context = canvas.getContext('2d');

var nodes = [];
var selected_node = -1;
let drag = false;

function resize(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    draw();
}

window.onresize = resize;
resize();


function draw(){
    context.clearRect(0, 0, canvas.width, canvas.height);
    cartesian_draw();
    // Draw nodes
    for(let i=0; i<nodes.length; i++){
        context.beginPath();
        context.arc(nodes[i].x, nodes[i].y, nodes[i].radius, 0, 2 * Math.PI);
        context.fillStyle = nodes[i].color;
        context.fill();
        context.stroke();
        context.closePath();
    }
    
}

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

canvas.addEventListener('mousedown', function(e){
    selected_node = find_nearest_node(e);
})

canvas.addEventListener('mousemove', function(e){
    if(selected_node != -1){
        drag = true;
        nodes[selected_node].x = e.clientX;
        nodes[selected_node].y=e.clientY;
        draw();
    }
})

canvas.addEventListener("mouseup", function(e){
    drag=false;
    selected_node = -1;
    draw();
})

function find_nearest_node(e){
    // Check for nearest node
    for(let i=0; i<nodes.length; i++){
        if(Math.abs(e.clientX - nodes[i].x) < 30 && Math.abs(e.clientY - nodes[i].y) < 30){
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


function clear(){
    nodes = [];
    edges = [];
    draw();
}

nodes= [
    {
        x: 700,
        y: 500,
        radius: 10,
        color: "red"
    },
    {
        x: 900,
        y: 500,
        radius: 10,
        color: "blue"
    },
    {
        x: 800,
        y: 500,
        radius: 10,
        color: "green"
    }
]


draw();