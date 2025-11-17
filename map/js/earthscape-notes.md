// None of these worked,
// So used .tabulator-cell{text-align: right;}
//dataLoaded
//table.on("dataLoaded", function(data){
table.on("tableBuilt", function(data){
    table.getColumns().forEach(function(column){
        //column.definition.cellHozAlign = "right";
        //column.setHozAlign("right");
        //column.setHozAlign("right");
        //column.setHorizontalAlignment("right");
        //column.setAlign("right");
        //column.hozAlign("right")
        //column.align = "right"; // No error, no effect
        //column.hozAlign ="right"; // No error, no effect
    });
});