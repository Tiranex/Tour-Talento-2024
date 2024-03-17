const pixelSize=55;
let rows = 50;
let cols = 50;

const gridContainer = document.getElementById('gridContainer');

let resize_interval;
let play = true;
let play_interval;

const control = document.getElementById("controls");
function resize(){
    rows=parseInt(window.innerHeight/pixelSize);
    cols=parseInt(window.innerWidth/pixelSize);

    if(rows < 4)
        rows = 5;
    if(cols < 4)
        cols = 5;

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
            cell.onmousedown = function(){
                touchstartX = i;
                touchstartY = j;
                pressed=true;
            };
            cell.onmouseenter = function(){
                touchstartX = i;
                touchstartY = j;
            };
            tr.appendChild(cell);
        }
        gridContainer.appendChild(tr);
    }
    draw_extra_elements();
    
}


function draw_extra_elements(){
    const back_color='white';

    // Play button
    const play_button = document.getElementById('0_0');

    function play_pause(){
        if(!play){
            play=true;
            play_button.innerHTML = '<svg id="play" xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-play-fill" viewBox="0 0 16 16" style="width: 100%; height: 100%;"> <path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5m5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5"></path> </svg>';
        } else{
            play= false;
            play_button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%;" fill="currentColor" class="bi bi-play-fill" viewBox="0 0 16 16"> <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393"/></svg>'
        }
    }

    play_button.innerHTML = '<svg id="play" xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-play-fill" viewBox="0 0 16 16" style="width: 100%; height: 100%;"> <path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5m5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5"></path> </svg>';
    play_button.style.width = window.innerWidth/cols + 'px';
    play_button.style.height = window.innerHeight/rows + 'px';
    play_button.style.backgroundColor = 'white';
    play_button.onclick = play_pause;
    
    function advance(){
        if(play)
            play_pause();
        applyRules();
    }

    // Advance button
    const advance_button = document.getElementById('0_1');
    advance_button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%;" fill="currentColor" class="bi bi-skip-end-fill" viewBox="0 0 16 16"><path d="M12.5 4a.5.5 0 0 0-1 0v3.248L5.233 3.612C4.693 3.3 4 3.678 4 4.308v7.384c0 .63.692 1.01 1.233.697L11.5 8.753V12a.5.5 0 0 0 1 0z"/></svg>';
    advance_button.style.width = window.innerWidth/cols + 'px';
    advance_button.style.height = window.innerHeight/rows + 'px';
    advance_button.style.backgroundColor = back_color;
    advance_button.onclick = advance;

    // Random button
    const random_button = document.getElementById('0_2');
    random_button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%;" fill="currentColor" class="bi bi-shuffle" viewBox="0 0 16 16"> <path fill-rule="evenodd" d="M0 3.5A.5.5 0 0 1 .5 3H1c2.202 0 3.827 1.24 4.874 2.418.49.552.865 1.102 1.126 1.532.26-.43.636-.98 1.126-1.532C9.173 4.24 10.798 3 13 3v1c-1.798 0-3.173 1.01-4.126 2.082A9.6 9.6 0 0 0 7.556 8a9.6 9.6 0 0 0 1.317 1.918C9.828 10.99 11.204 12 13 12v1c-2.202 0-3.827-1.24-4.874-2.418A10.6 10.6 0 0 1 7 9.05c-.26.43-.636.98-1.126 1.532C4.827 11.76 3.202 13 1 13H.5a.5.5 0 0 1 0-1H1c1.798 0 3.173-1.01 4.126-2.082A9.6 9.6 0 0 0 6.444 8a9.6 9.6 0 0 0-1.317-1.918C4.172 5.01 2.796 4 1 4H.5a.5.5 0 0 1-.5-.5"/> <path d="M13 5.466V1.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384l-2.36 1.966a.25.25 0 0 1-.41-.192m0 9v-3.932a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384l-2.36 1.966a.25.25 0 0 1-.41-.192"/> </svg>'
    random_button.style.width = window.innerWidth/cols + 'px';
    random_button.style.height = window.innerHeight/rows + 'px';
    random_button.style.backgroundColor = back_color;
    
    random_button.onclick = random;

    // info button
    const info_button = document.getElementById('0_'+(cols-1));
    info_button.innerHTML='<svg xmlns="http://www.w3.org/2000/svg"style="width: 90%; height: 90%;" fill="currentColor" class="bi bi-x-octagon-fill" viewBox="0 0 16 16"> <path d="M11.46.146A.5.5 0 0 0 11.107 0H4.893a.5.5 0 0 0-.353.146L.146 4.54A.5.5 0 0 0 0 4.893v6.214a.5.5 0 0 0 .146.353l4.394 4.394a.5.5 0 0 0 .353.146h6.214a.5.5 0 0 0 .353-.146l4.394-4.394a.5.5 0 0 0 .146-.353V4.893a.5.5 0 0 0-.146-.353zm-6.106 4.5L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 1 1 .708-.708"/> </svg>'
    info_button.style.width = window.innerWidth/cols + 'px';
    info_button.style.height = window.innerHeight/rows + 'px';
    info_button.style.backgroundColor = back_color;

    info_button.onclick = function(){
        if(play)
            play_pause();
        reset();
        applyRules();
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

play_interval = setInterval(playPause, 1000);
rows=parseInt(window.innerHeight/pixelSize);
cols=parseInt(window.innerWidth/pixelSize);
gridContainer.innerHTML = '';
init();
random();
applyRules();
window.onresize = resize;


/* Handle swipe*/

let touchstartX = 0;
let touchstartY = 0;