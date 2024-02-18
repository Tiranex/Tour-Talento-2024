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