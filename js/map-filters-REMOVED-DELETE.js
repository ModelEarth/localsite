
// Could add this to map.js if we need to read the first row as variable name.
// But not needed currently with our use of D3 for csv, and our use of Google's newer API which includes the column headers

//Use the first row as the header row
  let headers = rawData.values.shift();

  //Now loop through each subsequent row and bind each value to the corresponding header
  let data = rawData.values.map((row) => {
    return row.map((val, i) => {
      return { [headers[i]]: val };
    });
  });


  Source: https://github.com/jsoma/tabletop/issues/187








// REMOVED AFTER CALL TO: showTabulatorList();

// StupidTable

var table = d3.select(".output_table").append("table").attr("id", "county-table");

var header = table.append("thead").append("tr");

// Objects to construct the header in code:
// The sort_type is for the Jquery sorting function.

var headerObjs = [
	{ class: "", column: "name", label: "County", sort_type: "string" },
	//{ class: "", column: "Reg_Comm,", label: "Region", sort_type: "string" },
	{ class: "", column: "Population", label: "Population", sort_type: "int" },
	{ class: "", column: "Per Mile", label: "Per Mile", labelfull: "", sort_type: "int" },
	//{ class: "", column: "Sq Miles", label: "Sq Miles", labelfull: "", sort_type: "int" },
];

header
	.selectAll("th")
	.data(headerObjs)
	.enter()
	.append("th")

	.attr("data-sort", function (d) { return d.sort_type; })
	.attr("class", function (d) { return d.class; })
	.append("div")
	.append("span")
		.text(function(d) { return d.label; });

var tablebody = table.append("tbody");

rows = tablebody
	.selectAll("tr")
	.data(geoCountyTable)
	.enter()
	.append("tr");

// We built the rows using the nested array - now each row has its own array.

// The scale - start at 0 or at lowest number
// Not working
console.log('Extent is ', d3.extent(allDifferences));
//alert('Extent is ', d3.extent(allDifferences));

var colorScale = d3.scaleLinear()
	.domain(d3.extent(allDifferences)) // To Do: Limit color scale to each column
	.range(["#bcdbf7","#c00"]);

cells = rows.selectAll("td")
	// each row has data associated; we get it and enter it for the cells.
	.data(function(d) {
		return d;
	})
	.enter()
	.append("td")
	.append("div")
	.style("border-left-color", function(d,i) { // Was background-color
		// for the last elements in the row, we color the background:
		if (i >= 2) { // All the columns with colored boxes
			return colorScale(d);
		}
	})

	.append("div")
	//.text(function(d,i) { // All columns have a div with a value from CSV data
	//		return d;
	//})
	.html(function(d,i) {
		if (i == 0) {
			return "<input type='checkbox' id='" + d.split('-')[0] + "' class='geo' onclick='locClick(this)'/> <label for='" + d.split('-')[0] + "'>" + d.split(/-(.+)/)[1] + "</label>";
		} else {
			return d;
		}
	})			
	;

// load the function file you need before you call it...
// Not available here

// loadScript is not available here, only in calling page.
//loadScript('/community/js/table-sort.js', function(results) { 
	// jquery sorting applied to it - could be done with d3 and events.
	applyStupidTable(1); 
//});

$(".geo").change(function(e) {
    console.log("Adjust if this line appears multiple times.");
});
// INIT AT TIME OF INITIAL COUNTY LIST DISPLAY
// Set checkboxes based on param (which may be a hash, query or include parameter)
updateGeoFilter(param.geo); // Needed here to check county boxes.  BUGBUG: Might be reloading data. This also gets called from info/