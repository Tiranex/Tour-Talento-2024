const pixelSize=80;
let rows = 50;
let cols = 50;

const gridContainer = document.getElementById('gridContainer');

let resize_interval;
let play = true;
let play_interval;
function resize(){
    rows=parseInt(document.documentElement.scrollHeight/pixelSize);
    cols=parseInt(window.innerWidth/pixelSize);
    play=false;
    gridContainer.innerHTML = '';
    init();
    clearInterval(resize_interval);
    resize_interval = setInterval(function(){
        random();
        applyRules();
        clearInterval(play_interval);
        play_interval = setInterval(playPause, 1000);

        clearInterval(resize_interval);
        play=true;
    }, 350);
}



let grid = new Array(rows);
let tmpgrid = new Array(rows);

function initializeGrids() {
    for (let i = 0; i < rows; i++) {
        grid[i] = new Array(cols);
        tmpgrid[i] = new Array(cols);
    }
}

function reset(){
    for(let i=0; i<rows; i++){
        for(let j=0; j<cols; j++){
            grid[i][j] = 0;
        }
    }
}

function copy(){
    for(let i=0; i<rows; i++){
        for(let j=0; j<cols; j++){
            tmpgrid[i][j] = grid[i][j];
        }
    }

}

function init(){
    initializeGrids();

    
    
    function click(row, col){

        if(this.className === 'alive'){
            this.setAttribute('class', 'dead');
            grid[row][col] = 0;
        }else{
            this.setAttribute('class', 'alive');
            grid[row][col] = 1;
        }
        updateGrid();
    }

    for(let i = 0; i<rows; i++){
        let tr = document.createElement('tr');
        for(let j = 0; j<cols; j++){
            let cell = document.createElement('td');
            cell.setAttribute('id', i + '_' + j);
            cell.setAttribute('class', 'dead');
            cell.onclick = function(){
                click.call(this, i, j);
            };
            tr.appendChild(cell);
        }
        gridContainer.appendChild(tr);
    }



}

function updateGrid(){


    for(let i=0; i<rows; i++){
        for(let j=0; j<cols; j++){
            let cell = document.getElementById(i + '_' + j);

            if(grid[i][j] === 0)
                cell.setAttribute('class', 'dead');
            else
                cell.setAttribute('class', 'alive');
        }
    }
}

function applyRules() {
    // Copy current Grid to tmp
    copy();
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const neighbors = countNeighbors(i, j);
            if(grid[i][j] == 1){
                if(neighbors < 2){
                    grid[i][j] = 0;
                }else if(neighbors > 3){
                    grid[i][j] = 0;
                }
            }
            else{
                if(neighbors === 3){
                    grid[i][j] = 1;
                }
            }
        }
    }

    updateGrid();
}
    
function countNeighbors(row, col) {
    let count = 0;

    // Check the eight neighboring cells
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            // Skip the current cell
            if (i === 0 && j === 0) {
                continue;
            }

            // Calculate the neighbor's coordinates
            let neighborRow = row + i;
            let neighborCol = col + j;

            // Check if the neighbor is within the grid boundaries
            if (neighborRow >= 0 && neighborRow < rows && neighborCol >= 0 && neighborCol < cols) {
                // Increment the count if the neighbor is alive
                if (tmpgrid[neighborRow][neighborCol] === 1) {
                    count++;
                }
            }
        }
    }

    return count;
}

function random(){
    for(let i=0; i<rows; i++){
        for(let j=0; j<cols; j++){
            grid[i][j] = Math.round(Math.random());
        }
    }
    updateGrid();
}

function playPause(){
    if(play){
        applyRules();
    }
}

/* Handle button logic*/
let current_index = 0;
const next = document.getElementById('carousel-next')
const prev = document.getElementById('carousel-prev')

function next_carr(){
    current_index++;
    if(current_index == 1)
        prev.style.visibility = 'visible';
    if(current_index == 4)
        next.style.visibility = 'hidden';
    update_text();
}

function prev_carr(){
    current_index--;
    if(current_index == 0)
        prev.style.visibility = 'hidden';
    if(current_index == 3)
        next.style.visibility = 'visible';
    update_text();
}

next.onclick = next_carr;
prev.onclick = prev_carr;
document.getElementById("intro_button").onclick = next_carr;


const info_text = document.getElementById('info-text');
const text = ["START", "EXP1", "EXP2", "EXP3", "EXP4"];
function update_text(){
    info_text.innerHTML = text[current_index];
}



play_interval = setInterval(playPause, 1000);
rows=parseInt(document.documentElement.scrollHeight/pixelSize);
cols=parseInt(window.innerWidth/pixelSize);
gridContainer.innerHTML = '';
init();
random();
applyRules();
window.onresize = resize;

