//IMPORTANT:EDGES COULD BE ARRAYS LOL. DEBUG

//store node colouring
//store  colouring
let turbo = false;
let tries = 0;

//colours of edges of graph 1
const E1 = {
    "AB" : "black",
    "BC" : "black",
    "CD" : "black",
    "DE" : "black",
    "AE" : "black",
    "BG" : "black",
    "CH" : "black",
    "DI" : "black",
    "EJ" : "black",
    "AF" : "black",
    "FH" : "black",
    "HJ" : "black",
    "GJ" : "black",
    "GI" : "black",
    "FI" : "black"
};

const N1 = {
    "A":"one",
    "B":"two",
    "C":"three",
    "D":"one",
    "E":"two",
    "F":"two",
    "G":"one",
    "H":"one",
    "I":"three",
    "J":"three"
};

const E2 = {
    "AB": "black",
    "BC": "black",
    "CD": "black",
    "DE": "black",
    "EF": "black",
    "FG": "black",
    "GH": "black",
    "HI": "black",
    "IJ": "black",
    "JK": "black",
    "KL": "black",
    "AL": "black",
    "AC": "black",
    "CE": "black",
    "EG": "black",
    "GI": "black",
    "IK": "black",
    "AK": "black",
    "BH": "black",
    "FL": "black",
    "DJ": "black",
};

var N2 = {
    'A': ["one", "three","two","one"],
    'B': ["two","three","two","one"],
    'C': ["three","one","three","two"],
    'D': ["two","two","one","three"],
    'E': ["one","three","three","one"],
    'F': ["one","two","one","three"],
    'G': ["three","one","two","two"],
    'H': ["two","one","one","one"],
    'I': ["one","one","two","two"],
    'J': ["two","three","one","one"],
    'K': ["one","two","three","three"],
    'L': ["three","two","three","three"],
}


//ALSO - Why do I have two dictionaries???? 
//I think an array or something would be better (DEBUG)
var graph = {

}

var colouring = {

}
//implement the functions for choosing each graph! HERE




async function reset(choice) {
    turbo = false;//MAKE TURBO SPECIFIC TO A GRAPH IF NEEDED (DEBUG)
    tries = 0;
    $("#tries").html("0");
    $("#confidence").html("0")

    if (choice === "graph1") {
        //assign graph 1 colouring
        graph = structuredClone(N1);
        //console.log(graph);//debug
    } else if (choice === "graph2") {
        //assign graph 2 colouring
        const x = Math.floor((Math.random() * 4));

        //console.log(typeof x);//debug

        let keys = Object.keys(N2);
        for (var key in N2){
            graph[key] = N2[key][x];
        }

        //console.log(graph);//debug
    }
    //for a lack of a better way of doing it, i'm assigning setGraph() to a 
    //variable that I won't be using so that I can make sure await works
    //show the graph
    let x = await setGraph(choice);

    //Following line won't work until page is loaded //track
    $(".edge").attr("onclick", "revealEdge(this.id)");
    //CHANGE FRONT-END COLOUR
    clean();//does this need to happen earlier on in the chain of operations? //debug
}


//Add the svg code of chosen graph to html page
async function setGraph(choice) {
    //inject wanted graph.
    var graphChoice =  '/'+choice+'.svg';
    try {
        const response = await fetch(graphChoice);        
        const text =  await response.text();
        $("#graph").html(text);
    } catch(error) {
        console.error('Error fetching the file:', error);
    }
}


//Maximize a screen in front of the graph
function freeze(id) {
    //id: id of edge not to freeze//DEBUG
    $("#screen").css({
         "width": "660px",
         "height": "600px",
    }); 
    $("#screen").attr("onclick", "clean()");
}


//
function clean() {
    //TWO PARTS TO THIS FUNCTION:
    //STOP ALL PREVIOUS ACTIONS //debug (not done yet/ undecided)
    //REMOVE SCREEN + RESET COLOURS
    turbo =  false
    //remove screen
    $("#screen").css({
        "height": "0px",
        "width": "0px",
    });

    //return nodes to black
    $(".node").attr("fill", "black");

    //return edges to black 3px
    $(".edge").attr({
        "fill": "black",
        "width": "3px"
    });

    $("#reveal").attr("onclick", "revealColouring()");
    $("#reveal").html("Reveal");

    colouring = {}
}





function revealColouring() {
    $("#reveal").attr("onclick", "clean()");
    $("#reveal").html("Reset");
    freeze();

    if(Object.keys(colouring).length == 0){
        permutateColouring()
    }

    //console.log("before for-loop")//debug
    var keys = Object.keys(colouring);
    //console.log(keys.length);//debug
    for (let key = 0; key < keys.length; key++) {
        const i = keys[key];

        //console.log(key);//debug
        //console.log(keys[key]);//debug
        //console.log(colouring[i]);//debug
        //console.log("running for-loop");//debug
        var node = "#"+i;
        //console.log( typeof colouring[i]);//debug
        $(node).attr("fill", colouring[i]);
        console.log($(node).attr("fill"));//debug
    }

    //either go off of the colouring that we already have or choose a new one. 
    //how do I do that????



}



function revealEdge(id) {
    let valid = true;
    clean();
    freeze();
    tries++;
    console.log(id);//debugging purposes
    
    permutateColouring();
    let node1 = id.substr(0,1);
    let node2 = id.substr(1,1);

    $('#'+node1).attr("fill", colouring[node1]);
    $('#'+node2).attr("fill", colouring[node2]);

    let colour = "yellowgreen";
    if(colouring[node1] == colouring[node2]){
        tries = 0;
        colour = "red";
        valid = false;
        //STOP TURBO (DEBUG)
    }

     $('#'+id).attr("fill", colour);
    $("#tries").html(tries);
    resetConfidence();

    //what should the condition for this be??(debug)
    return valid;

   

}

async function runTurbo() {
    //How to make this function run aside from everything (DEBUG)

    //can decide which graph later here (DEBUG)
    turbo = true;
    let edges =  Object.keys(E1);
    //if there are more than 10, nodes, we know that it's graph2
    if (Object.keys(graph).length > 10) {
        edges = Object.keys(E2); 
    }
    
    let x = edges[Math.floor((Math.random() * edges.length))];

    while (turbo && revealEdge(x)) {
        
    }
    //keep running while user says so or the proof is no longer valid

}



function permutateColouring() {
    //COULD THIS BE MORE EFFICIENT? WITH NUMBERS? DEBUG
    const permutations  = [["DarkSalmon", "DarkMagenta", "DarkSeaGreen"], ["DarkSalmon", "DarkSeaGreen", "DarkMagenta"], ["DarkMagenta", "DarkSalmon", "DarkSeaGreen"], ["DarkMagenta", "DarkSeaGreen", "DarkSalmon"], ["DarkSeaGreen", "DarkSalmon", "DarkMagenta"], ["DarkSeaGreen", "DarkMagenta", "DarkSalmon"]];
    //return permutations[x];

    if (Object.keys(graph).length > 10) {
        //if it's the second graph
        //assign graph 2 colouring
        const x = Math.floor((Math.random() * 4));

        //console.log(typeof x);//debug
        let keys = Object.keys(N2);
        //console.log(keys);//debug
        for (let key = 0; key < keys.length; key++){
            const i = keys[key];
            
            //console.log("graph[i]"+graph[i]);//debug
            //console.log("N2[i]"+N2[i]);//debug
            //console.log("N2[i][x]"+N2[i][x]);//debug
            graph[i] = N2[i][x];
        }
    }

    //COMMIT COLOURING
    var keys  = Object.keys(graph);
    //console.log(graph);//debug

    //console.log(keys);//debug
    //console.log(graph);//debug
    const permutation = permutations[Math.floor((Math.random() * 6))];
    
    for (let key = 0; key < keys.length; key++) {
        const i = keys[key];
        //console.log("commiting colouring");//debug
        if (graph[i] == "one") {
            colouring[i] = permutation[0];
        } else if (graph[i] == "two") {
            colouring[i] = permutation[1];
        } else if(graph[i] == "three") {
            colouring[i] = permutation[2];
        }
    }

    //console.log(colouring);//debug
    

}

//calculate confidence in proof and change html value
function resetConfidence() {
    //m - number of edges

    //Will have to adjust for when tries>0 and confidence=0
    //(proof ends (debug))
    var confidence = 0;
    var m = $(".edge").length;
    if (tries != 0) {
        confidence = (100* (1 - (Math.pow((1 - 1/m), tries)))); 
    } 
    //console.log(confidence);//debug
    //console.log(Math.round(Math.E));//debug

    $("#confidence").html(Math.floor(confidence*100)/100);
}

window.onload = function() {    
    reset('graph2');
  };
