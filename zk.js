
let turbo = false;
let tries = 0;
let confidence = 0;


//list of edges for both graphs
const E1 = ["AB", "BC", "CD", "DE", "AE", "BG", "CH", "DI", "EJ", "AF", "FH", "HJ", "GJ", "GI", "FI"];
const E2 = ["AB", "BC", "CD", "DE", "EF", "FG", "GH", "HI", "IJ", "JK", "KL", "AL", "AC", "CE", "EG", "GI", "IK", "AK", "BH", "FL", "DJ"];

//store node coloring
const G1 = {
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

var G2 = {
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
//current node coloring
var coloring = {

}


//initialize html and js states for chosen graph
async function reset(choice) {
    stopTurbo();

    //reset confidence and tries count
    tries = 0;
    $("#tries").html("0");
    resetConfidence(tries);

    //assign graph-specific node structure
    if (choice === "graph1") {
        //assign graph 1
        graph = structuredClone(G1);
    } else if (choice === "graph2") {
        //assign graph 2
        const x = Math.floor((Math.random() * 4));
        let keys = Object.keys(G2);
        for (var key in G2){
            graph[key] = G2[key][x];
        }

    }
    
    //inject graph html to index page
    let x = await setGraph(choice);

    //set edge behaviour
    $(".edge").attr("onclick", "revealEdge(this.id)");
    
    //reset colors
    clean();
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


//Hide graph coloring & remove screen
function clean() {
    //if the confidence had been set to 0 in a previous round, reset # of tries
    //this means the proof was invalidated with similarly colored neighboring nodes
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
    $("#reveal").attr("onclick", "revealColoring()");
    $("#reveal").html("Reveal");

    //reset coloring scheme
    coloring = {}
}

/* 
    SIDENOTE: The coloring should be chosen before the user has made a choice. But since a new coloring 
    is chosen every time a user makes a choice, it is not *technically* wrong to choose coloring 
    once the user picks an edge since the way in which the coloring is chosen has nothing to do with 
    edge is chosen anyway. 
    
*/

//when the user has picked an edge, a coloring scheme/permutation 
function revealEdge(id) {
    //get rid of previously chosen edges showing on the screen
    clean();
    //freeze the screen
    freeze();

    tries++;
    $("#tries").html(tries);
    resetConfidence(tries);

    //choose new coloring scheme and/or permutation
    permutateColoring();

    //reveal coloring for edge endpoints
    let node1 = id.substr(0,1);
    let node2 = id.substr(1,1);

    $('#'+node1).attr("fill", coloring[node1]);
    $('#'+node2).attr("fill", coloring[node2]);

    let edgeColor = "gold";

    //In case the mathematical proof has failed: deviate and perform the following
    if(coloring[node1] == coloring[node2]){
        edgeColor = "red";
        resetConfidence(0);
        stopTurbo();
    }
    
    //assign appropriate color for chosen edge
    $('#'+id).attr({
        "fill": edgeColor,
        "width": "4"
    });

    if (turbo == true) {
        //cannot allow to clean() when running turbo
        $("#screen").attr("onclick", "");
    }

}

//choose a random coloring scheme+permutation and commit it. 
function permutateColoring() {
    //the permutations array would probably look better utilizing numbers instead of the color string, 
    //then later assigning a color to each number in the permutation (debug)
    const permutations  = [["DarkSalmon", "DarkMagenta", "DarkSeaGreen"], ["DarkSalmon", "DarkSeaGreen", "DarkMagenta"], ["DarkMagenta", "DarkSalmon", "DarkSeaGreen"], ["DarkMagenta", "DarkSeaGreen", "DarkSalmon"], ["DarkSeaGreen", "DarkSalmon", "DarkMagenta"], ["DarkSeaGreen", "DarkMagenta", "DarkSalmon"]];
    const permutation = permutations[Math.floor((Math.random() * 6))];
    
    //the following if-statement could be avoided by using a global variable to keep track of which graph is current (debug)
    
    //identify the current graph (if more than 10 nodes, it is the second graph)
    if (Object.keys(graph).length > 10) {
        //choose a different coloring scheme (not needed for graph1 since it only has one coloring scheme)
        const arr = [0,0,0,1,1,1,2,2,2,3];
        const x = arr[Math.floor(Math.random()*arr.length)];
        let keys = Object.keys(G2);
        for (let key = 0; key < keys.length; key++){
            const i = keys[key];
            graph[i] = G2[i][x];
        }
    }

    /*
      SIDENOTE: as opposed to how it is specified in the mathematical proofs,
      this program does not use complex mechanisms to commit the coloring scheme/permutation
      it is assumed that, within the scope of the html code and by looking at how the js code 
      is structured, there is no tampering with the coloring once it is chosen. 

      *this may be subject to modifications later on*
    */

    //commit coloring to the variable coloring using the variable graph
    var keys  = Object.keys(graph);
    for (let key = 0; key < keys.length; key++) {
        const i = keys[key];
        
        if (graph[i] == "one") {
            coloring[i] = permutation[0];
        } else if (graph[i] == "two") {
            coloring[i] = permutation[1];
        } else if(graph[i] == "three") {
            coloring[i] = permutation[2];
        }

    }

}

//stop turbo run and set all functionalities back to normal.
function stopTurbo() {
    turbo = false;

    //re-enable applicable buttons/operations.
    $('#reveal').prop('disabled', false);
    $("#turbo").attr('onclick', 'runTurbo()');
    $("#turbo").html('Turbo-Run');
    $("#screen").attr("onclick", "clean()");

}


//constantly pick random edges, separated by a chosen time interval, until the user prompts it to stop
async function runTurbo() {
    //disable buttons / applicable previous operations
    $('#reveal').prop('disabled', true);
    $("#turbo").attr('onclick', 'stopTurbo()');
    $("#turbo").html('Stop Turbo');

    turbo = true;

    //delay program flow by ms milliseconds.
    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    //set which array of edges to choose from
    let edges = E1;
    //if there are more than 10, nodes, we know that it's graph2
    if (Object.keys(graph).length > 10) {
        edges = E2; 
    }
    
    //reveal random edges as long as the app is in turbo mode
    while (turbo == true) {
        let x = edges[Math.floor((Math.random() * edges.length))];
        revealEdge(x);
        await delay(200);
    }
    
}



//Add the svg code of chosen graph to html page
async function setGraph(choice) {
    //inject wanted graph.
    var graphChoice =  './'+choice+'.svg';
    try {
        const response = await fetch(graphChoice);        
        const text = await response.text();
        $("#graph").html(text);
    } catch(error) {
        console.error('Error fetching the file:', error);
    }
}


//reveal the currently chosen coloring of the graph.
function revealColoring() {
    $("#reveal").attr("onclick", "clean()");
    $("#reveal").html("Reset");
    freeze();

    //if a previous coloring is not already chosen, choose a new one.
    if(Object.keys(coloring).length == 0){
        permutateColoring()
    }

    var keys = Object.keys(coloring);
    //iterate through current nodes
    for (let key = 0; key < keys.length; key++) {
        //reveal coloring for current node.
        const i = keys[key];
        var node = "#"+i;
        $(node).attr("fill", coloring[i]);
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