
function delete() {

    rowClick:function(e, row){
        row.toggleSelect(); //toggle row selected state on row click

        console.log("data row:");
        console.log(row); // Single row component
        console.log(e); // Info about PointerEvent - the click event object

        currentRowIDs = [];
        //e.forEach(function (row) {
            //console.log(row.geoid);
            currentRowIDs.push(row._row.data.id);
        //});
        //alert(currentRowIDs.toString())

        // Possible way to get currently selected rows - not sure is this includes rows not in DOM
        // var selectedRows = $("#tabulator-geotable").tabulator("getSelectedRows"); //get array of currently selected row components.

        // Merge with existing geo values from hash. This allows map to match.
        //let hash = getHash();
        if (row.isSelected()) {
            console.log("ClickA " + row._row.data.id)
            if(hash.geo) {
                //hash.geo = hash.geo + "," + currentRowIDs.toString();
                hash.geo = hash.geo + "," + row._row.data.id;
            } else {
                hash.geo = currentRowIDs.toString();
            }
        } else { // Uncheck
            // Remove only unchecked row.
            //$.each(currentRowIDs, function(index, value) {
                hash.geo = hash.geo.split(',').filter(e => e !== row._row.data.id).toString();
            //}
        }
        //alert("goHash 2");
        if(!hash.geo && row._row.data.jurisdiction) {
            if(row._row.data.jurisdiction == "Georgia") { // From state checkboxes
                // Temp, later we'll pull from data file or dropdown.
                row._row.data.state = "GA";
            }
            if (!row._row.data.state) {
                console.log('%cTO DO: add state abbreviation to data file. ', 'color: green; background: yellow; font-size: 14px');
                goHash({'geo':'','statename':row._row.data.jurisdiction});
            } else {
                console.log('%cTO DO: add support for multiple states. ', 'color: green; background: yellow; font-size: 14px');
                goHash({'geo':'','statename':'','state':row._row.data.state});
            }
        } else {
            goHash({'geo':hash.geo});
        }
        //var selectedData = geotable.getSelectedData(); // Array of currently selected
        //alert(selectedData);
    },
    rowSelectionChanged: function(e, row) {
        //alert("rowSelectionChanged")

        //console.log("rowSelectionChanged");
        //console.log(e); // Contains all selected rows.

        //console.log("Row Selection (checkbox) Changed");
        //console.log(row); // Has extra levels

        /*
        currentRowIDs = [];
        e.forEach(function (row) {
            //console.log(row.geoid);
            currentRowIDs.push(row.id)
        });
        */

        if (row[0]) {
            //console.log(e[0].id); // the geoid

            // Works - but currently showing first item in array of objects:
            //console.log(row[0]._row.data.id); // .data.geoid

            //this.recalc();
        }
    },
}