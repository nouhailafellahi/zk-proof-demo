
let turbo = false;
let tries = 0;
let confidence = 0;

//list of edges for both graphs
const E1 = ["AB", "BC", "CD", "DE", "AE", "BG", "CH", "DI", "EJ", "AF", "FH", "HJ", "GJ", "GI", "FI"];
const E2 = ["AB", "BC", "CD", "DE", "EF", "FG", "GH", "HI", "IJ", "JK", "KL", "AL", "AC", "CE", "EG", "GI", "IK", "AK", "BH", "FL", "DJ"];

//store node colouring
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

var N3 = {
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


var N2 = {
    'A': ["two",   "one",   "two",   "two"   ],
    'B': ["three", "two",   "three",   "one"   ],
    'C': ["one",   "three", "one",   "two"   ],
    'D': ["two",   "one",   "three",   "one"   ],
    'E': ["one",   "two",   "two", "three"   ],
    'F': ["two",   "one",   "three",   "three" ],
    'G': ["three", "three", "one", "one"   ],
    'H': ["one",   "one",   "two",   "three" ],
    'I': ["two",   "two",   "three", "two"   ],
    'J': ["one",   "one",   "two",   "two"   ],
    'K': ["three", "three", "one",   "three" ],
    'L': ["one",   "two",   "one", "one"   ],
}


//current graph architecture (graph1 or graph2)
var graph = {

}
//current node colouring
var colouring = {

}

//initialize html and js states for chosen graph
async function reset(choice) {
    turbo = false;
    tries = 0;
    $("#tries").html("0");
    resetConfidence();

    //assign graph-specific node structure
    if (choice === "graph1") {
        graph = structuredClone(N1);
    } else if (choice === "graph2") {
        //assign graph 2
        const x = Math.floor((Math.random() * 4));
        let keys = Object.keys(N2);
        for (var key in N2){
            graph[key] = N2[key][x];
        }

    }
    
    //inject graph html to index page
    let x = await setGraph(choice);

    //set edge behaviour
    $(".edge").attr("onclick", "revealEdge(this.id)");
    
    //set colours
    clean();
}


//Add the svg code of chosen graph to html page
async function setGraph(choice) {
    //inject wanted graph.
    var graphChoice =  '/'+choice+'.svg';
    try {
        const response = await fetch(graphChoice);        
        const text = await response.text();
        $("#graph").html(text);
    } catch(error) {
        console.error('Error fetching the file:', error);
    }
}


//Maximize a screen in front of the graph
function freeze() {
    $(".node").attr("fill", "grey");
    $("#screen").css({
         "width": "660px",
         "height": "600px",
    }); 
    $("#screen").attr("onclick", "clean()");
}


//Hide graph colouring & remove screen
function clean() {
    //STOP ALL PREVIOUS ACTIONS //debug (not done yet/ undecided)

    if (confidence == 0) {
        tries = 0;
        $('#tries').html(tries);
    }

    //remove screen
    $("#screen").css({
        "height": "0px",
        "width": "0px",
    });

    //return nodes to black
    $(".node").attr("fill", "black");

    //return edges to black 2px
    $(".edge").attr({
        "fill": "black",
        "width": "2px"
    });

    //reset button functions
    $("#reveal").attr("onclick", "revealColouring()");
    $("#reveal").html("Reveal");

    colouring = {}
}


//reveal the currently chosen colouring of the graph.
function revealColouring() {
    $("#reveal").attr("onclick", "clean()");
    $("#reveal").html("Reset");
    freeze();

    //if a previous colouring is not already chosen, choose a new one.
    if(Object.keys(colouring).length == 0){
        permutateColouring()
    }

    console.log(colouring);//debug

    var keys = Object.keys(colouring);
    //iterate through current nodes
    for (let key = 0; key < keys.length; key++) {
        //reveal colouring for current node.
        const i = keys[key];
        var node = "#"+i;
        $(node).attr("fill", colouring[i]);
    }

}



/* 
    SIDENOTE: The colouring should be chosen before the user has made a choice. But since a new colouring 
    is chosen every time a user makes a choice, it is not *technically* wrong to choose colouring 
    once the user picks an edge. The way in which the colouring is chosen has nothing to do with 
    edge is chosen anyway. 
    I will decide whether this is acceptable or not once I possess the faculties to do so. (debug)
*/

//when the user has picked an edge, a colouring scheme/permutation 
function revealEdge(id) {
    //get rid of previously chosen edges showing on the screen
    clean();
    freeze();
    tries++;
    resetConfidence(tries);

    //choose new colouring scheme and/or permutation
    permutateColouring();

    //reveal colouring for edge endpoints
    let node1 = id.substr(0,1);
    let node2 = id.substr(1,1);

    $('#'+node1).attr("fill", colouring[node1]);
    $('#'+node2).attr("fill", colouring[node2]);

    let colour = "gold";

    //In case the mathematical proof has failed: deviate and perform the following
    let valid = true;
    if(colouring[node1] == colouring[node2]){
        colour = "red";
        valid = false;
        resetConfidence(0);
        //Once the turbo functionality is implemented, it will be temporarily stopped here. (debug)
    }
    $("#tries").html(tries);
    

    //assign appropriate colour for chosen edge
    $('#'+id).attr({
        "fill": colour,
        "width": "4"
    });


    //status for chosen edge (faulty vs. advance the proof)
    return valid;
}

//choose a random colouring scheme+permutation and commit it. 
function permutateColouring() {
    //the permutations array would probably look better utilizing numbers instead of the colour string, 
    //then later assigning a colour to each number in the permutation (debug)
    const permutations  = [["DarkSalmon", "DarkMagenta", "DarkSeaGreen"], ["DarkSalmon", "DarkSeaGreen", "DarkMagenta"], ["DarkMagenta", "DarkSalmon", "DarkSeaGreen"], ["DarkMagenta", "DarkSeaGreen", "DarkSalmon"], ["DarkSeaGreen", "DarkSalmon", "DarkMagenta"], ["DarkSeaGreen", "DarkMagenta", "DarkSalmon"]];
    const permutation = permutations[Math.floor((Math.random() * 6))];
    
    //the following if-statement could be avoided by using a global variable to keep track of which graph is current (debug)
    
    //identify the current graph (if more than 10 nodes, it is the second graph)
    if (Object.keys(graph).length > 10) {
        //choose a different colouring scheme (not needed for graph1 since it only has one colouring scheme)
        const arr = [0,0,0,1,1,1,2,2,2,3];
        const x = arr[Math.floor(Math.random()*arr.length)];
        let keys = Object.keys(N2);
        for (let key = 0; key < keys.length; key++){
            const i = keys[key];
            graph[i] = N2[i][x];
        }
    }

    /*
      SIDENOTE: as opposed to how it is specified in the mathematical proofs,
      this program does not use complex mechanisms to commit the colouring scheme/permutation
      it is assumed that, within the scope of the html code and by looking at how the js code 
      is structured, there is no tampering with the colouring once it is chosen. 

      *this may be subject to modifications later on*
    */

    //commit colouring to the variable colouring using the variable graph
    var keys  = Object.keys(graph);
    for (let key = 0; key < keys.length; key++) {
        const i = keys[key];
        
        if (graph[i] == "one") {
            colouring[i] = permutation[0];
        } else if (graph[i] == "two") {
            colouring[i] = permutation[1];
        } else if(graph[i] == "three") {
            colouring[i] = permutation[2];
        }

    }

}

//calculate confidence in proof and change html value.
function resetConfidence(n) {
    //m - number of edges
    //n - number of tries
    var m = $(".edge").length;

    //if the user has picked one or more edges, adjust the confidence level accordingly
    if (n != 0) {
        //will add an explanation for the f ollowing function once I understand it myself L.O.L. (debug)
        confidence = (100* (1 - (Math.pow((1 - 1/m), n)))); 
    } else {
        confidence = 0;
    }

    //adjust html value
    $("#confidence").html(Math.floor(confidence*100)/100);
}


//constantly pick random edges, separated by a chosen time interval, until the user prompts it to stop
async function runTurbo() {
    //for now, this function picks a random edge to reveal, just as any user would
    //the purpose of it, however, it to constantly pick random edges, separated by a chosen
    //time interval until the user prompts it to stop. (debug)
    turbo = true;

    let edges = E1;
    //if there are more than 10, nodes, we know that it's graph2
    if (Object.keys(graph).length > 10) {
        edges = E2; 
    }
    
    let x = edges[Math.floor((Math.random() * edges.length))];
    revealEdge(x);
}


window.onload = function() {  
    //for testing purposes (debug)  
    console.log()
  };
