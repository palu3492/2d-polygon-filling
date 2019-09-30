var view;
var ctx;
var polygons = {
    convex: {
        type: 'convex',
        color: 'rgba(10, 10, 255, 1)', // choose color here!
        vertices: [
            // fill in vertices here!
            {x: 100,y:100},
            {x: 200,y:200},
            {x: 300,y:220},
            {x: 400,y:100},
            {x: 370,y:10},
            {x: 150,y:50},
            {x: 100,y:100}
        ]
    },
    concave: {
        type: 'concave',
        color: 'rgb(255, 10, 10)', // choose color here!
        vertices: [
            // fill in vertices here!
            {x: 100,y:100},
            {x: 200,y:200},
            {x: 300,y:220},
            {x: 200,y:100},
            {x: 400,y:100},
            {x: 370,y:10},
            {x: 150,y:50},
            {x: 100,y:100}
        ]
    },
    self_intersect: {
        type: 'self_intersect',
        color: 'rgb(10, 255, 10)', // choose color here!
        vertices: [
            // fill in vertices here!
            {x: 180,y:200},
            {x: 300,y:100},
            {x: 400,y:220},
            {x: 300,y:290},
            {x: 200,y:100},
            {x: 180,y:200},
        ]
    },
    interior_hole: {
        type: 'interior_hole',
        color: 'rgb(255, 255, 10)', // choose color here!
        vertices: [
            // fill in vertices here!
            {x: 100,y:50},
            {x: 150,y:250},
            {x: 200,y:50},
            {x: 70,y:150},
            {x: 270,y:150},
            {x: 100,y:50},
        ]
    }
};

// Init(): triggered when web page loads
function Init() {
    var w = 800;
    //var h = 600;
    var h = 300;
    view = document.getElementById('view');
    view.width = w;
    view.height = h;

    ctx = view.getContext('2d');

    SelectNewPolygon();
}

// DrawPolygon(polygon): erases current framebuffer, then draws new polygon
function DrawPolygon(polygon) {
    // Clear framebuffer (i.e. erase previous content)
    ctx.clearRect(0, 0, view.width, view.height);

    // Set line stroke color
    ctx.strokeStyle = polygon.color;

    // Create empty edge table (ET)
    var edge_table = [];
    for (let i = 0; i < view.height; i++) {
        edge_table.push(new EdgeList());
    }

    // Create empty active list (AL)
    var active_list = new EdgeList();


    /*
        Fill Edge Table, one entry per scan line
        - Store entries at Y-coordinate of bottom vertex
        - Entry includes:
            - Y-coordinate of top vertex
            - X-coordinate of bottom vertex
            - 1/slope: deltaX/deltaY (inverse slope)
     */

    edge_table = fillEdgeTable(polygon, edge_table);

    let y = findFirstEdgeY(edge_table);

    drawLinesBetweenEdges(edge_table, active_list, y);

    ctx.strokeStyle = 'rgba(10, 10, 255, 1)';
    drawEdges(polygon);
}

// Fill the Edge Table with polygon edges using polygon vertices
function fillEdgeTable(polygon, edge_table){
    let vertices = polygon.vertices;
    let vertex1, vertex2;
    let yMax, yMin, xYMin, deltaX, deltaY, edge; // xYMin: x of min y
    for(i=0; i<vertices.length-1; i++){
        vertex1 = vertices[i];
        vertex2 = vertices[i+1];
        // an edge is from vertex1 to vertex2
        // EdgeEntry class takes y_max, x_ymin, delta_x, delta_y
        yMax = Math.max(vertex1.y, vertex2.y);
        yMin = Math.min(vertex1.y, vertex2.y);
        if(vertex1.y < vertex2.y){
            xYMin = vertex1.x;
        } else {
            xYMin = vertex2.x;
        }
        deltaX = vertex2.x - vertex1.x;
        deltaY = vertex2.y - vertex1.y;
        edge = new EdgeEntry(yMax, xYMin, deltaX, deltaY);
        edge_table[yMin].InsertEdge(edge); // Store entries at Y-coordinate of bottom vertex

        // DrawLine(vertex1.x, vertex1.y, vertex2.x, vertex2.y);
    }
    return edge_table;
}

// Find y of first scan line in ET that is not NULL
function findFirstEdgeY(edge_table){
    for(var y=0; y<edge_table.length; y++){
        if(edge_table[y].first_entry !== null) {
            break;
        }
    }
    return y;
}

function drawLinesBetweenEdges(edge_table, active_list, y){
    let edgeTableEntry = edge_table[y].first_entry;
    // while new edges exist
    while(edgeTableEntry != null) {
        active_list = fillActiveList(active_list, edgeTableEntry); // Move all entries at ET[y] to AL
        active_list.SortList(); // Sort AL to maintain ascending x order
        active_list.RemoveCompleteEdges(y); // Remove entries from AL whose y_max equal y
        y = drawLinesBetweenActiveListEdges(active_list, y);

        edgeTableEntry = edge_table[y].first_entry;

    }
}

// Move all entries at ET[y] to AL
function fillActiveList(active_list, edgeTableEntry){
    active_list.InsertEdge(edgeTableEntry);
    while (edgeTableEntry.next_entry !== null) {
        active_list.InsertEdge(edgeTableEntry.next_entry);
        edgeTableEntry = edgeTableEntry.next_entry;
    }
    return active_list;
}

function drawLinesBetweenActiveListEdges(active_list, y){
    let newY;
    let activeListEntry = active_list.first_entry;
    let activeListNextEntry = activeListEntry.next_entry;
    // not sure this while is needed
    while(activeListEntry !== null) {
        activeListNextEntry = activeListEntry.next_entry;
        let smallerY = Math.min(activeListEntry.y_max, activeListNextEntry.y_max);
        newY = y;
        while (newY < smallerY) {
            DrawLine(activeListEntry.x, newY, activeListNextEntry.x, newY);
            activeListEntry.x += activeListEntry.inv_slope;
            activeListNextEntry.x += activeListNextEntry.inv_slope;
            newY += 1;
        }
        activeListEntry = activeListNextEntry.next_entry;
    }
    return newY;
}

// SelectNewPolygon(): triggered when new selection in drop down menu is made
function SelectNewPolygon() {
    var polygon_type = document.getElementById('polygon_type');
    DrawPolygon(polygons[polygon_type.value]);
}

// Draws line from one vertex to another
function DrawLine(x1, y1, x2, y2) {
    //console.log('Draw line');
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

// Draw line edges (Used for testing)
function drawEdges(polygon){
    let vertices = polygon.vertices;
    let vertex1, vertex2;
    for(let i=0; i<vertices.length-1; i++){
        vertex1 = vertices[i];
        vertex2 = vertices[i+1];
        DrawLine(vertex1.x, vertex1.y, vertex2.x, vertex2.y);
    }
}
