// First row
const table_1_1 = document.getElementById("table_1_1");
const table_1_2 = document.getElementById("table_1_2");
const table_1_3 = document.getElementById("table_1_3");
const table_1_4 = document.getElementById("table_1_4");

// Second row
const table_2_1 = document.getElementById("table_2_1");
const table_2_2 = document.getElementById("table_2_2");
const table_2_3 = document.getElementById("table_2_3");
const table_2_4 = document.getElementById("table_2_4");

// Third row
const table_3_1 = document.getElementById("table_3_1");
const table_3_2 = document.getElementById("table_3_2");
const table_3_3 = document.getElementById("table_3_3");
const table_3_4 = document.getElementById("table_3_4");

// Other inputs
const select_trajectory = document.getElementById("select_trajectory");
select_trajectory.addEventListener("change", function() {
    clearInterval(current_animation);
    current_trajectory=[];
    current_animation = reproduce(select_trajectory.selectedIndex);
});

const trajectory_enable_input =  document.getElementById("trajectory_enable");
let trajectory_enabled = true;
trajectory_enable_input.addEventListener("change", function() {
    trajectory_enabled=trajectory_enable_input.checked
    current_trajectory=[];
})

const velocity_enable_input =  document.getElementById("velocity_enable");
let velocity_field_enabled = false;
velocity_enable_input.addEventListener("change", function() {
    velocity_field_enabled=velocity_enable_input.checked
})

const speed_selector = document.getElementById("speed_selector");
speed_selector.addEventListener("change", function() {
    time_step = parseInt(speed_selector.value);
})


/**
 * Loads the values from an array into a table.
 * @param {number[]} y0 - The array containing the values to be loaded into the table.
 */
function load_table(y0) {
    table_1_1.value = y0[0];
    table_1_2.value = y0[1];
    table_1_3.value = y0[2];
    table_1_4.value = y0[3];
    
    table_2_1.value = y0[4];
    table_2_2.value = y0[5];
    table_2_3.value = y0[6];
    table_2_4.value = y0[7];

    table_3_1.value = y0[8];
    table_3_2.value = y0[9];
    table_3_3.value = y0[10];
    table_3_4.value = y0[11];
}

/**
 * Retrieves the values from the table inputs and returns them as an array of numbers.
 * @returns {number[]} An array of numbers representing the values from the table inputs.
 */
function get_table() {
    return [
        parseFloat(table_1_1.value),
        parseFloat(table_1_2.value),
        parseFloat(table_1_3.value),
        parseFloat(table_1_4.value),
        parseFloat(table_2_1.value),
        parseFloat(table_2_2.value),
        parseFloat(table_2_3.value),
        parseFloat(table_2_4.value),
        parseFloat(table_3_1.value),
        parseFloat(table_3_2.value),
        parseFloat(table_3_3.value),
        parseFloat(table_3_4.value)
    ];
}

