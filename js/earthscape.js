// EARTHSCAPE
// A single function that calls multiple visualizations for a dataset

function loadEarthScape(my) {
	loadScript(theroot + 'js/d3.v5.min.js', function(results) {
        waitForVariable('customD3loaded', function() {
			d3.csv(my.dataset).then(function(data) {
			    console.log("File loaded " + my.dataset);
			    $(document).ready(function () {
			    	earthscape_TableDisplay(my,data); // For table3
			    });
			});
		});
	});
}
// Tabulator grid below diagram
function earthscape_TableDisplay(my,data) {
    console.log("Python file data:");
    console.log(data); // An array of objects
    console.log("Python file columns:");
    //columns = data["columns"];
    //console.log(columns);

    let table = new Tabulator("#" + my.elementID, {
        data:data,
        //layout:"fitColumns",      //fit columns to width of table
        //responsiveLayout:"hide",  //hide columns that dont fit on the table
        //tooltips:true,          //show tool tips on cells
        maxHeight:"300px",        // For frozenRows
        addRowPos:"top",          //when adding a new row, add it to the top of the table
        history:true,             //allow undo and redo actions on the table
        paginationSize:7,         //allow 7 rows per page of data
        movableColumns:true,      //allow column order to be changed
        //cellHozAlign:"right",   //Not compatible with autoColumns:true
        resizableRows:true,       //allow row order to be changed
        //initialSort:[             //set the initial sort order of the data
        //    {column:"progress", dir:"desc"},
        //],
        autoColumns:true,
        scrollHorizontal: true,
        //columnMinWidth: 300,      //all columns

    });
}