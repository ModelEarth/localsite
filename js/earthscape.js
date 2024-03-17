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

function loadEarthScape2(my) {
    loadScript(theroot + 'js/d3.v5.min.js', function(results) {
        waitForVariable('customD3loaded', function() {
            d3.csv(my.dataset).then(function(data) {
                console.log("File loaded " + my.dataset);
                $(document).ready(function () {
                    earthscape_TableDisplay2(my,data); // For table3
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
        maxHeight:"500px",        // For frozenRows
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

function earthscape_TableDisplay2(my,data) {

    // Transpose the data array
    let transposedData = transposeData(data);

    let table = new Tabulator("#" + my.elementID, {
        data:transposedData,
        headerVisible: false,  // Hide table headers
        maxHeight:"500px",        // For frozenRows
        addRowPos:"top",          //when adding a new row, add it to the top of the table
        history:true,             //allow undo and redo actions on the table
        paginationSize:7,         //allow 7 rows per page of data
        movableColumns:true,      //allow column order to be changed
        resizableRows:true,       //allow row order to be changed
        autoColumns:true,
        scrollHorizontal: true,
    
    });
}

// Function to transpose data (flip rows and columns)
function transposeData(data) {

    let transposedData = [];
    let keys = Object.keys(data[0]);

    let fipsData = { 'Attribute': 'Fips' };
    let nameData = { 'Attribute': 'Name' };
    let urbanDensityData = { 'Attribute': 'UrbanDensity' };

    data.forEach(function (item, index) {
        fipsData['Row' + (index + 1)] = item['Fips'];
        nameData['Row' + (index + 1)] = item['Name'];
        urbanDensityData['Row' + (index + 1)] = item['UrbanDensity'];
    });

    transposedData.push(fipsData);
    transposedData.push(nameData);
    transposedData.push(urbanDensityData);
    
    // below code can be used to display all attributes

    // // Create new object for each key (column)
    // keys.forEach(function (key) {
    //     let obj = {};
    //     obj['Column'] = key; // Use 'Column' as the new key for the transposed data
    //     data.forEach(function (item, index) {
    //         obj['Row ' + (index + 1)] = item[key]; // Use 'Row ' + index as the new key for each row
    //     });
    //     transposedData.push(obj);
    // });

    return transposedData;
}
