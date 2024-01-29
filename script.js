let numPal = 3;
let size, rA, gA, bA;
let array1 = [];
let factor = 0;
var latitude;
var longitude;
var canvas;

// Function to generate a random unique user ID
function generateUserID() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Function to set or retrieve the user ID from cookies
function getSetUserID() {
    let cookieValue = document.cookie.replace(/(?:(?:^|.*;\s*)userID\s*\=\s*([^;]*).*$)|^.*$/, "$1");
    if (cookieValue === "") {
        userID = generateUserID();
        document.cookie = `userID=${userID}; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/`;
    } else {
        userID = cookieValue;
    }
}

// get user ID
getSetUserID();


// Gets users location data
function getUserLocation(callback) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                const userLocation = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                };
                callback(null, userLocation);
            },
            function(error) {
                callback(error, null);
            }
        );
    } else {
        const error = new Error("Geolocation is not supported by this browser.");
        callback(error, null);
    }
}

// Handle user location
function handleLocation(error, location) {
    if (error) {
        console.error(error.message);
    } else {
        latitude = location.latitude;
        longitude = location.longitude;
    }
}

getUserLocation(handleLocation);

// Loads colors.csv
function preload() {
    table = loadTable("colors.csv", "csv", "header");
}

function setup() {
    canvas = createCanvas(800, 600);
    noLoop();
}

function draw() {
    // prompt user to enable location services if location data null
    if (!latitude || !longitude) {
        textSize(32);
        fill(255, 0, 0);
        textAlign(CENTER, CENTER);
        text("Allow location services in your browser and refresh", width/2, height/2);
        return;
    }

    // fetch current time
    let currentTime = new Date();
    let currentHour = currentTime.getHours();
    let currentMinute = currentTime.getMinutes();
    let timeFactor = map(currentHour + currentMinute/60, 0, 24, 0, 1);

    // initialize array for handling palette
    array1 = [];

    // set Perlin noise resolutions
    let rez1 = random(0.001, 0.005);
    let rez2 = random(0.001, 0.01);

    // initialize RGB + factor variables
    let r1, g1, b1, sF;

    // set stroke weight and alpha ranges
    strokeWeight(random(1, 3));    
    let alpha = random(150, 255);

    // increment factor value with user data
    factor += latitude + longitude + timeFactor; //used to vary Perlin noise

    // colour randomization using multiple palettes
    let c = 2;
    let shiftType = random(2);
    for (k = 0; k < numPal; k++) {
        c *= 3;
        palette = floor(random(676));
        if (shiftType < 1) {
            sF = 360 / c;
        } else {
            sF = random(4, 20);
        }
        array1.push(palette, sF, factor); //add palette and shift factor to array for each # of palettes
    }

    // main draw loop
    for (i = 0; i < width; i += 1) {

        for (j = 0; j < height; j += 1) {
            rS = 0;
            gS = 0;
            bS = 0;

            for (k = 0; k < numPal; k++) {
                // pull info out of array
                palette2 = int(array1[k * 3]);
                sF2 = int(array1[k * 3 + 1]);
                factor2 = int(array1[k*3+2])
                let n1 = noise(i * rez1 + factor2, j * rez1 + factor2);
                let n2 = noise(i * rez2 + factor2, j * rez2 + factor2);
                let col2;

                // use noise to map initial color between 0 and 360;        
                let col = map((n1 + n2) / 2, 0, 1, 0, 360);
                let dec = fract(col / sF2); // pick which color number will be pulled from the palette
                if (dec < 0.2) {
                    col2 = 0;
                } else if (dec < 0.4) {
                    col2 = 1;
                } else if (dec < 0.6) {
                    col2 = 2;
                } else if (dec < 0.8) {
                    col2 = 3;
                } else {
                    col2 = 4;
                }

                // pull color from palette
                r1 = int(table.get(palette2, col2 * 3));
                g1 = int(table.get(palette2, col2 * 3 + 1));
                b1 = int(table.get(palette2, col2 * 3 + 2));
                rS = rS + r1;
                gS = gS + g1;
                bS = bS + b1;
            }

            // get average RGB
            let rA = rS / numPal;
            let gA = gS / numPal;
            let bA = bS / numPal;
            let r3 = rA;
            let g3 = gA;
            let b3 = bA;

            // remap RGB to flatten the curve and increase color variation
            if (numPal > 2 && numPal < 19 && rA > 21 && rA < 245) {
                r3 = map(rA, 53 + 4 * (numPal - 3), 202 - 4 * (numPal - 3), 21, 245);
            }
            if (numPal > 2 && numPal < 19 && gA > 21 && gA < 245) {
                g3 = map(gA, 53 + 4 * (numPal - 3), 202 - 4 * (numPal - 3), 21, 245);
            }
            if (numPal > 2 && numPal < 19 && bA > 21 && bA < 245) {
                b3 = map(bA, 53 + 4 * (numPal - 3), 202 - 4 * (numPal - 3), 21, 245);
            }
            
            // draw the final RGB point
            stroke(r3, g3, b3, alpha);
            point(i, j);
        }
    }
}
