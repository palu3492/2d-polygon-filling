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
            {x: 300,y:200},
            {x: 400,y:100},
            {x: 400,y:10},
            {x: 150,y:50},
            {x: 100,y:100}
        ]
    },
    concave: {
        type: 'concave',
        color: 'rgb(255, 10, 10)', // choose color here!
        vertices: [
            // fill in vertices here!
        ]
    },
    self_intersect: {
        type: 'self_intersect',
        color: 'rgb(10, 255, 10)', // choose color here!
        vertices: [
            // fill in vertices here!
        ]
    },
    interior_hole: {
        type: 'interior_hole',
        color: 'rgb(255, 255, 10)', // choose color here!
        vertices: [
            // fill in vertices here!
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
    // console.log(polygon);
    // Clear framebuffer (i.e. erase previous content)
    ctx.clearRect(0, 0, view.width, view.height);

    // Set line stroke color
    ctx.strokeStyle = polygon.color;
    //DrawLine(10,10,50,50);

    // Create empty edge table (ET)
    var edge_table = [];
    var i;
    for (i = 0; i < view.height; i++) {
        edge_table.push(new EdgeList());
    }

    // Create empty active list (AL)
    var active_list = new EdgeList();


    // Step 1: populate ET with edges of polygon
    let vertices = polygon.vertices;
    let vertex1, vertex2;
    let yMax, yMin, xYMin, deltaX, deltaY, edge;
    for(i=0; i<vertices.length-1; i++){
        vertex1 = vertices[i];
        vertex2 = vertices[i+1];
        // y_max, x_ymin, delta_x, delta_y
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
        for(let w=yMin; w<yMax; w++){
            edge_table[w].InsertEdge(edge);
        }

        // DrawLine(vertex1.x, vertex1.y, vertex2.x, vertex2.y);
    }


    // Step 2: set y to first scan line with an entry in ET
    let y;
    for(i=0; i<edge_table.length; i++){
        if(edge_table[i].first_entry !== null){
            y = i;
            break;
        }
    }

    active_list.InsertEdge(edge_table[y].first_entry);
    active_list.SortList();

    // Step 3: Repeat until ET[y] is NULL and AL is NULL
    while(edge_table[y].first_entry !== null && active_list.first_entry !== null){
        //edge_table[y].first_entry;
        // first_entry.next_entry
        //active_list.first_entry = edge_table[y].first_entry;
        //active_list.SortList();
        //console.log(active_list);
        // loop through active_list, if ymax = y then remove entry;
        if(active_list.first_entry.next_entry !== null){
            let x1 = active_list.first_entry.x;
            let x2 = active_list.first_entry.next_entry.x;
            DrawLine(x1, y, x2, y);
        }

        y++;
        active_list.InsertEdge(edge_table[y].first_entry);
        active_list.SortList();
    }
    //   a) Move all entries at ET[y] into AL
    //   b) Sort AL to maintain ascending x-value order
    //   c) Remove entries from AL whose ymax equals y
    //   d) Draw horizontal line for each span (pairs of entries in the AL)
    //   e) Increment y by 1
    //   f) Update x-values for all remaining entries in the AL (increment by 1/m)
}

// SelectNewPolygon(): triggered when new selection in drop down menu is made
function SelectNewPolygon() {
    var polygon_type = document.getElementById('polygon_type');
    DrawPolygon(polygons[polygon_type.value]);
    drawEdges();
}

function DrawLine(x1, y1, x2, y2) {
    console.log('Draw line');
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

function drawEdges(){
    let vertices = polygons.convex.vertices;
    let vertex1, vertex2;
    for(let i=0; i<vertices.length-1; i++){
        vertex1 = vertices[i];
        vertex2 = vertices[i+1];
        DrawLine(vertex1.x, vertex1.y, vertex2.x, vertex2.y);
    }
}
