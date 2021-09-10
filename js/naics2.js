// Might replace "industry" with "cat" and use for any category that occurs in multiple locations.

// TODO: Might move counties.csv and state_fips.csv into promises
if(typeof localObject == 'undefined') {
    var localObject = {};
}

// TEMP
let fips = [];
let stateID = 13;
let stateAbbr = "GA";

// Not yet used
let stateIDs = {AL:1,AK:2,AZ:4,AR:5,CA:6,CO:8,CT:9,DE:10,FL:12,GA:13,HI:15,ID:16,IL:17,IN:18,IA:19,KS:20,KY:21,LA:22,ME:23,MD:24,MA:25,MI:26,MN:27,MS:28,MO:29,MT:30,NE:31,NV:32,NH:33,NJ:34,NM:35,NY:36,NC:37,ND:38,OH:39,OK:40,OR:41,PA:42,RI:44,SC:45,SD:46,TN:47,TX:48,UT:49,VT:50,VA:51,WA:53,WV:54,WI:55,WY:56,AS:60,GU:66,MP:69,PR:72,VI:78,}
let industries = d3.map(); // Populated in promises by industryTitleFile
function getKeyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value);
}

// BUGBUG - Use a small file with just two columns
//let industryTitleFile = local_app.community_data_root() + "us/state/" + stateAbbr + "/industries_state" + stateID + "_naics6_state_all.tsv";

let industryTitleFile = "lookup/6-digit_2012_Codes.csv"; // Source: https://www.census.gov/eos/www/naics/downloadables/downloadables.html
let industryLocDataFile = local_app.community_data_root() + "us/state/GA/naics/GA_data_filled.csv";

// TO DO: Initially 6-digit naics. Store naics when number changes to 2 and 4 digit to avoid reloading file.
// TO DO: Put a promise on just the industries
var promises = [
    // GET 2 DATASETS
	d3.csv(industryTitleFile, function(d) {
	    industries.set(d.id, d.title);
	    return d;
	}),
	d3.csv(industryLocDataFile)
]
Promise.all(promises).then(promisesReady);
function promisesReady(values) { // Wait for 

	localObject.industries = values[0]; // NAICS industry titles

	// TO DO: Append here for multiple states
  	localObject.industryCounties = values[1]; // Exceeds 40,000

    // Add titles to 

	//localObject.locList = makeRowValuesNumeric(data, dp.numColumns, dp.valueColumn);
	  
	// Make element key always lowercase
	//dp.data_lowercase_key;

	//processOutput(dp,map,map2,whichmap,whichmap2,basemaps1,basemaps2,function(results){});

    //alert(fips) // 13189,13025,13171
    //fips = [13189,13025,13171]; // TEMP
    fips = ["13189","13025","13171"];
    fips = [];
    topRatesInFips(localObject, fips); // Renders header

	console.log("localObject.industries length " + localObject.industries.length);
	console.log("localObject.industryCounties length " + localObject.industryCounties.length);

	// Returns Logging
	//alert(industries.get("113310"));

    populateIndustryName();
    showIndustryTabulatorList(0);

	displayIndustryList(localObject); 
}
function populateIndustryName() {
    //for (var i = 0; i < localObject.industryCounties.length; i++) {

    //}
}
function displayIndustryList(localObject) {
    let text = "";
    for (var i = 0; i < localObject.industries.length; i++) {
        //console.log(localObject.industries[i].id); // NAICS
        //console.log(localObject.industries[i].title); // NAICS title

        // .replace("Other ","") 
        text += "<div class='row'>";
        text += "<div class='cell'>" + localObject.industries[i].id + "</div>";
        text += "<div class='cell'><a href='#naics=" + localObject.industries[i].id + "' onClick='goHash({\"naics\":" + localObject.industries[i].id+ "}); return false;' style='white-space:nowrap'>" + localObject.industries[i].title + "</a></div>"
        //text += "<div class='cell-right'>" + localObject.industryCounties[i].FIPS + "</div>";
        text += "<div class='cell-right'>" + localObject.industries[i].wages + "</div>";
        text += "<div class='cell-right'>" + localObject.industries[i].firms + "</div>";
        text += "<div class='cell-right'>" + localObject.industries[i].employees + "</div>";
        text += "<div class='cell-right'>" + localObject.industries[i].population + "</div>";
        //text += "<div class='cell-right'>" + localObject.industries[i].aggregate + "</div>";
        text += "</div>";

    }
    $("#sector_list").prepend("<br><br>" + i + "&nbsp;records<br>");
    $("#sector_list").append(text);
}

var industrytable = {};
function showIndustryTabulatorList(attempts) {
    let hash = getHash();
    if (typeof Tabulator !== 'undefined') {
        console.log("showTabulatorList")
        // Try this with 5.0. Currently prevents row click from checking box.
        // selectable:true,

        // For fixed header, also allows only visible rows to be loaded. See "Row Display Test" below.
        // maxHeight:"100%",


        // More filter samples
        // https://stackoverflow.com/questions/2722159/how-to-filter-object-array-based-on-attributes
        industrytable = new Tabulator("#tabulator-industrytable", {
            data:localObject.industries,     //load row data from array of objects
            layout:"fitColumns",      //fit columns to width of table
            responsiveLayout:"hide",  //hide columns that dont fit on the table
            tooltips:true,            //show tool tips on cells
            addRowPos:"top",          //when adding a new row, add it to the top of the table
            history:true,             //allow undo and redo actions on the table
            pagination:"local",       //paginate the data
            paginationSize:7,         //allow 7 rows per page of data
            movableColumns:true,      //allow column order to be changed
            resizableRows:true,       //allow row order to be changed
            initialSort:[             //set the initial sort order of the data - NOT WORKING
                {column:"wages", dir:"desc"},
            ],
            maxHeight:"400px",
            paginationSize:50000,
            columns:[
                {formatter:"rowSelection", titleFormatter:"rowSelection", hozAlign:"center", headerHozAlign:"center", width:10, headerSort:false},
                {title:"Naics", field:"id", width:80},
                {title:"Industry", field:"title"},
                {title:"Payroll", field:"wages", width:120},
                {title:"Establishments", field:"firms", width:120},
                {title:"Employees", field:"employees", width:120},
                {title:"Population", field:"population", width:120},
            ],

            rowClick:function(e, row){
                row.toggleSelect(); //toggle row selected state on row click

                console.log("row:");
                console.log(row); // Single row component
                console.log(e); // Info about PointerEvent - the click event object

                

                currentRowIDs = [];
                //e.forEach(function (row) {
                    //console.log(row.geoid);
                    currentRowIDs.push(row._row.data.id);
                //});
                //alert(currentRowIDs.toString())

                // Possible way to get currently selected rows - not sure is this includes rows not in DOM
                // var selectedRows = $("#tabulator-industrytable").tabulator("getSelectedRows"); //get array of currently selected row components.

                // Merge with existing geo values from hash. This allows map to match.
                let hash = getHash();
                if (row.isSelected()) {
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
                goHash({'geo':hash.geo});

                //var selectedData = industrytable.getSelectedData(); // Array of currently selected
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
        });

        //industrytable.selectRow(industrytable.getRows().filter(row => row.getData().name == 'Fulton County, GA'));
        //industrytable.selectRow(industrytable.getRows().filter(row => row.getData().name.includes('Ba')));

        // Place click-through on checkbox - allows hashchange to update row.
        //$('.tabulator-row input:checkbox').prop('pointer-events', 'none'); // Bug - this only checks visible
        

    } else {
      attempts = attempts + 1;
      if (attempts < 2000) {
        // To do: Add a loading image after a coouple seconds. 2000 waits about 300 seconds.
        setTimeout( function() {
          showIndustryTabulatorList(attempts);
        }, 20 );
      } else {
        alert("Tabulator JS not available for displaying list.")
      }
    }
}


function displayIndustryListOld(localObject) {
    let hash = getHash(); // Includes hiddenhash
	//let catcount = hash.catcount || 40;
	let industrycount = 100; // localObject.industryCounties.length;

	let icon = "";
    let rightCol = "";
    let midCol="";
    let text = "";
    let dollar = ""; // optionally: $
    let totalLabel = "Total Payroll";
    let stateAbbr;
    let naicshash = "";
    let mapLink = "nothing";
	//localObject.industryCounties.forEach(function(element) {
	//	console.log(element);
	//})
	if (hash.state) {
        stateAbbr = hash.state.toUpperCase();
    } else {
        stateAbbr = "GA"; // Temp HACK to show US
    }
    //alert(localObject.industryCounties.length)
	for (i = 0; i < industrycount; i++) { // Naics
        rightCol="";
        midCol="";
        //console.log("NAICS ROW " + i);
        // Update these:
            let latitude = "";
            let longitude = "";
            console.log(i);
            // Populate maplink with Google Map URL for each industry

            //d3.csv(local_app.community_data_root() + "us/id_lists/county_id_list.csv").then( function(consdata) {

            // TODO: Save in a county_data object and append each new state. Track appended states with an array.
            d3.csv(local_app.community_data_root() + "us/state/" + stateAbbr + "/" + stateAbbr + "counties.csv").then( function(county_data) {

                //alert("HERE2 industrycount: " + industrycount)
                
                if(Array.isArray(fips)) { // && dataObject.counties.length != fips.length
                    mapLink=[]
                    for(var j=0; j<fips.length; j++) { // For each county (fips)
                        //var filteredData = consdata.filter(function(d) {
                            var filteredData = county_data.filter(function(county_data_row) {
                                //alert(fips[j])
                                if(j["geoid"]==fips[j]){
                                    if(j["county"]==county_data_row["NAMELSAD"]){ // In the 
                                    	// BUGBUG - change to naics title

                                        mapLink.push("https://www.google.com/maps/search/" + localObject.industryCounties[i]['NAICS'].replace(/ /g,"+") + "/@" + county_data_row['latitude'] + "," + county_data_row['longitude'] + ",11z")
                                        
                                    }
                                }
                            })
                        //})
                    }
                } else if (fips == stateID) {
                        //county=""
                        console.log(i + " " + localObject.industryCounties[i]);
                        // BUGBUG - change to county_data_row['latitude'] + "," + county_data_row['longitude']
                        // ['title'] was ['data_id']
                        mapLink = "https://www.google.com/maps/search/" + localObject.industryCounties[i].NAICS.replace(/ /g,"+") + "/@32.9406955,-84.5411485,8z"
                        //mapLink = "https://bing.com/maps/?q=" + localObject.industryCounties[i]['data_id'].replace(/ /g,"+") + "&cp=32.94~-84.54&z=8"; // lvl not working
                } else {
                    var filteredData = consdata.filter(function(d) {
                        var filteredData = county_data.filter(function(county_data_row) {
                            if(d["id"]==fips ){      
                                if(d["county"]==county_data_row["NAMELSAD"]){
                                            //mapLink.push("https://www.google.com/search?q=" + localObject.industryCounties[i]['data_id'].replace(/ /g,"+") + " " + d["county"].replace(/ /g,"+") + ",+Georgia")
                                    mapLink = "https://www.google.com/maps/search/" + localObject.industryCounties[i]['data_id'].replace(/ /g,"+") + "/@" + county_data_row['latitude'] + "," + county_data_row['longitude'] + ",11z"
                                            //console.log("xxxxxxxxx" + county_data_row["longitude"])
                                }
                            }
                        })
                    })
                }
            })
            //let mapLink = "https://www.google.com/maps/search/" + localObject.industryCounties[i]['data_id'].replace(/ /g,"+") + "/@" + latitude + "," + longitude + ",11z";


        if(hash.catsort=="payann") {
            //text += localObject.industryCounties[i]['NAICScode'] + ": <b>" +localObject.industryCounties[i]['data_id']+"</b>, "+String(whichVal.node().options[whichVal.node().selectedIndex].text).slice(3, )+": $"+String((localObject.industryCounties[i][whichVal.node().value]/1000).toFixed(2))+" million <br>";
            
            // Multiple counties
            if(Array.isArray(fips)) {

                //if(String((localObject.industryCounties[i][whichVal.node().value]/1000).toFixed(2)).length<7){
                if (1==1) { // Always use million
                    
                    // The counties
                    for (var j = 0; j < fips.length; j++) {
                        if(localObject.industryCounties[i]['Firms'][j]){
                            if(localObject.industryCounties[i]['Estimate'][j]){    
                                if(localObject.industryCounties[i]['Estimate'][j]>0){
                                    
                                    midCol += "<div class='cell-right'>" + dollar +"<a href='" + mapLink[j] + "' target='_blank'>"+'<span style="color: #9933aa" >'+ String((localObject.industryCounties[i]['Firms'][j]/1000).toFixed(2)) + " million</span></a></div>";
                                } else {
                                    midCol += "<div class='cell-right'>" + dollar +"<a href='" + mapLink[j] + "' target='_blank'>"+ String((localObject.industryCounties[i]['Firms'][j]/1000).toFixed(2)) + " million</a></div>";
                                }
                            } else {
                                midCol += "<div class='cell-right'>" + dollar +"<a href='" + mapLink[j] + "' target='_blank'>"+ String((localObject.industryCounties[i]['Firms'][j]/1000).toFixed(2)) + " million</a></div>";
                            }
                        } else {
                            midCol += "<div class='cell-right'>" + "<a href='" + mapLink[j] + "' target='_blank'>" + "0</a></div>";
                        }    
                    }
                    // The total
                    rightCol += "<div class='cell-right'>" + dollar + String((localObject.industryCounties[i][which]/1000).toFixed(2)) + " million</div>";
                } else {
                    for (var j = 0; j<fips.length; j++){
                        if(localObject.industryCounties[i]['Firms'][j]){
                            
                                midCol += "<div class='cell-right'>" + dollar + String((localObject.industryCounties[i]['Firms'][j]/1000000).toFixed(2)) + " million</div>";
                            
                        } else {
                                midCol +="<div class='cell-right'>" + "<a href='" + mapLink[j] + "' target='_blank'>" + "0</a></div>";
                        }   
                    }
                    // <span style="color: #9933aa">
                    rightCol += "<div class='cell-right'>" + dollar + String((localObject.industryCounties[i][which]/1000000).toFixed(2)) + " billion</div>";
                }
                
            } else { // One entity (state or county)
                //if(String((localObject.industryCounties[i][whichVal.node().value]/1000).toFixed(2)).length<7){

                if(localObject.industryCounties[i]['Estimate']){    
                    if(localObject.industryCounties[i]['Estimate'] > 0){
                        rightCol = "<div class='cell-right'>" + dollar + "<a href='" + mapLink + "' target='_blank'>"+'<span style="color: #9933aa" >'+String((localObject.industryCounties[i][which]/1000).toFixed(2))+" million</span></a></div>";
                    } else {
                        rightCol = "<div class='cell-right'>" + dollar + "<a href='" + mapLink + "' target='_blank'>"+String((localObject.industryCounties[i][which]/1000).toFixed(2))+" million</a></div>";  
                    }
                } else {
                    if(fips==stateID){
                        if(hash.census_scope=="state"){
                            rightCol = "<div class='cell-right'>" + dollar + "<a href='" + mapLink + "' target='_blank'>"+String((localObject.industryCounties[i][which_state_api]/1000).toFixed(2))+" million</a></div>";  
                        } else {
                            rightCol = "<div class='cell-right'>" + dollar + "<a href='" + mapLink + "' target='_blank'>"+String((localObject.industryCounties[i][which_state]/1000).toFixed(2))+" million</a></div>";  
                        }
                    } else {
                        rightCol = "<div class='cell-right'>" + dollar + "<a href='" + mapLink + "' target='_blank'>"+String((localObject.industryCounties[i][which]/1000).toFixed(2))+" million</a></div>";  
                    
                    }

                    // ADDITIONAL COLUMNS

                    // employee count
                    if(fips==stateID){
                        if(hash.census_scope=="state"){
                            rightCol += "<div class='cell-right'><a href='" + mapLink + "' target='_blank'>" + String(Math.round(localObject.industryCounties[i]["emp_api"])) + "</a></div>";
                        } else {
                            //rightCol += "<div class='cell-right'><a href='" + mapLink + "' target='_blank'>" + String(Math.round(localObject.industryCounties[i][which_state])) + "</a></div>";
                        }
                    } else {
                        //rightCol += "<div class='cell-right'><a href='" + mapLink + "' target='_blank'>" + String(Math.round(localObject.industryCounties[i][which])) + "</a></div>";
                    }

                    // establishments
                    if(fips==stateID){
                        if(hash.census_scope=="state"){
                            rightCol += "<div class='cell-right'><a href='" + mapLink + "' target='_blank'>" + String(Math.round(localObject.industryCounties[i]["estab_api"])) + "</a></div>";
                        } else {
                            //rightCol += "<div class='cell-right'><a href='" + mapLink + "' target='_blank'>" + String(Math.round(localObject.industryCounties[i][which_state])) + "</a></div>";
                        }
                    } else {
                        //rightCol += "<div class='cell-right'><a href='" + mapLink + "' target='_blank'>" + String(Math.round(localObject.industryCounties[i][which])) + "</a></div>";
                    }
                }
            }
 
        } else {

            //rightCol = String(whichVal.node().options[whichVal.node().selectedIndex].text).slice(3, )+": "+Math.round(localObject.industryCounties[i][whichVal.node().value]);
            if(Array.isArray(fips)) { // SELECTED COUNTIES
                rightCol = ""
                midCol = ""
                for (var j = 0; j<fips.length; j++){ // FOR EACH SELECTED COUNTY
                    if(localObject.industryCounties[i]['Firms'][j]){ // Was ratearray

                        if(hash.catsort=="estab"){
                            midCol += "<div class='cell-right'><a href='" + mapLink[j] + "' target='_blank'>" + String(Math.round(localObject.industryCounties[i]['Firms'][j])) + "</a></div>";
                            
                        } else {
                            if(localObject.industryCounties[i]['Wages'][j]){ // Was Estimate
                                    if(localObject.industryCounties[i]['Wages'][j]>0) { // Was Estimate
                                        // FIRST ONE HERE
                                        midCol += "<div class='cell-right'><a href='" + mapLink[j] + "' target='_blank'>" + '<span style="color: #9933aa" >'+String(Math.round(localObject.industryCounties[i]['Firms'][j])) + "</span></a></div>";
                            
                                    } else {
                                        midCol += "<div class='cell-right'><a href='" + mapLink[j] + "' target='_blank'>" + String(Math.round(localObject.industryCounties[i]['Firms'][j])) + "</a></div>";
                            
                                    }
                                } else {
                                    midCol += "<div class='cell-right'><a href='" + mapLink[j] + "' target='_blank'>" + String(Math.round(localObject.industryCounties[i]['Firms'][j])) + "</a></div>";
                            
                                }
                        }

                            
                    } else {
                        // NEXT TWO HERE
                        midCol += "<div class='cell-right'>" + "<a href='" + mapLink[j] + "' target='_blank'>" + "0</a></div>";
                    } 
                }
                //rightCol += "<div class='cell-right'>" + String(Math.round(localObject.industryCounties[i][which])) + "</div>";
                rightCol += "<div class='cell-right'>PLACEHOLDER</div>";

                //rightCol = String(Math.round(localObject.industryCounties[i][whichVal.node().value]));
            } else {
                if(hash.catsort=="estab"){
                    if(fips==stateID){
                        if(hash.census_scope=="state") {
                            rightCol = "<div class='cell-right'><a href='" + mapLink + "' target='_blank'>" + String(Math.round(localObject.industryCounties[i][which_state_api])) + "</a></div>";
                        } else {
                            rightCol = "<div class='cell-right'><a href='" + mapLink + "' target='_blank'>" + String(Math.round(localObject.industryCounties[i][which_state])) + "</a></div>";
                        }
                    } else {
                        rightCol = "<div class='cell-right'><a href='" + mapLink + "' target='_blank'>" + String(Math.round(localObject.industryCounties[i][which])) + "</a></div>";
                    }
                } else {

                    if(localObject.industryCounties[i]['Estimate']){    
                        if(localObject.industryCounties[i]['Estimate']>0){
                            
                            rightCol = "<div class='cell-right'><a href='" + mapLink + "' target='_blank'><span style='color:#9933aa'>" + String(Math.round(localObject.industryCounties[i][which])) + "</span></a></div>";

                        } else {
                            rightCol = "<div class='cell-right'><a href='" + mapLink + "' target='_blank'>" + String(Math.round(localObject.industryCounties[i][which])) + "</a></div>";
                        }
                    } else {
                        if(fips==stateID){
                            if(hash.census_scope=="state") {
                                rightCol = "<div class='cell-right'><a href='" + mapLink + "' target='_blank'>" + String(Math.round(localObject.industryCounties[i][which_state_api])) + "</a></div>";
                            } else {
                            	//BUGBUG
                                //rightCol = "<div class='cell-right'><a href='" + mapLink + "' target='_blank'>" + String(Math.round(localObject.industryCounties[i][which_state])) + "</a></div>";
                            }
                        } else {
                            rightCol = "<div class='cell-right'><a href='" + mapLink + "' target='_blank'>" + String(Math.round(localObject.industryCounties[i][which])) + "</a></div>";
                        }
                    }
                }
            }
            
        }


        //rightCol += "<div class='cell mock-up' style='display:none'><img src='http://localhost:8887/localsite/info/img/plus-minus.gif' class='plus-minus'></div>";
        ////text += localObject.industryCounties[i]['NAICScode'] + ": <b>" +localObject.industryCounties[i]['data_id']+"</b>, "+String(whichVal.node().options[whichVal.node().selectedIndex].text).slice(3, )+": "+Math.round(localObject.industryCounties[i][whichVal.node().value])+"<br>";
        
        // localObject.industryCounties[i].NAICS.replace("Other ","") 

        // BUGBUG - lookup title in last instance
        // .replace("Other ","") 
        text += "<div class='row'><div class='cell'>" + icon + localObject.industryCounties[i].NAICS + "</div>";
        text += "<div class='cell'><a href='#naics=" + localObject.industryCounties[i].NAICS + "' onClick='goHash({\"naics\":" + localObject.industryCounties[i].NAICS + "}); return false;' style='white-space:nowrap'>" + industries.get(localObject.industryCounties[i].NAICS) + "</a></div>"
        text += "<div class='cell-right'>" + localObject.industryCounties[i].FIPS + "</div>";
        text += "<div class='cell-right'>" + localObject.industryCounties[i].Firms + "</div>";
        text += "<div class='cell-right'>" + localObject.industryCounties[i].Employees + "</div>";
        text += "<div class='cell-right'>" + localObject.industryCounties[i].Wages + "</div>";
        text += "<div class='cell-right'>" + localObject.industryCounties[i].Population + "</div>";

        if(Array.isArray(fips)) {
            text +=  midCol; // Columns for counties
        }
        text += rightCol + "</div>";
        
        // use GoHash()
        
        

        if(i<=20){ // Avoids excessively long hash
            if(i==0){
                naicshash = naicshash+localObject.industryCounties[i]['NAICScode'];
            } else {
                naicshash = naicshash+","+localObject.industryCounties[i]['NAICScode']
            }
            
        }
    } // End looping through top naics row

    $("#sector_list").append(text);
}


function keyFound(this_key, cat_filter, params) {
    if (!params.show) {
        params.show = params.go;
    }

    if (this_key <= 1) {
        return false;
    } else if (cat_filter == undefined) { // No filter
        return true;
    } else if (cat_filter.length == 0) { // No filter
        return true;
    } else if (params.show == "bioeconomy" && (this_key.startsWith("11") || this_key.startsWith("311"))) { // Quick hack, always include Agriculture
        return true;
    //} else if (params.show == "farmfresh" && (this_key.startsWith("11") || this_key.startsWith("311"))) { // Quick hack, always include Agriculture
    //    return true;
    } else if (params.show == "manufacturing" && (this_key.startsWith("31") || this_key.startsWith("32") || this_key.startsWith("33") )) { // All manufacturing
        return true;
    } else if ( (params.show == "bioeconomy" || params.show=="parts") && params.catsize == 2) { // Our 4 digit array matches key
        cat_filt=[]
        for(i=0;i<cat_filter.length;i++){
            cat_filt.push(cat_filter[i].slice(0,2))
        }
        if(cat_filt.includes(this_key.slice(0,2))){
            return true;
        }
    } else if ( (params.show == "bioeconomy" || params.show=="parts") && params.catsize == 4 ) { // Our 4 digit array matches key
        cat_filt=[]
        for(i=0;i<cat_filter.length;i++){
            cat_filt.push(cat_filter[i].slice(0,4))
        }
        if(cat_filt.includes(this_key.slice(0,4))){
            return true;
        }
    } else if ( (params.show == "bioeconomy" || params.show=="parts" || cat_filter.length > 0) && params.catsize == 6 && cat_filter.includes(this_key.slice(0,6))) { // Our 6 digit array matches key
        return true;
    } else {
        console.log("NO CAT MATCH FOUND FOR: " + params.show);
        return false;
    }
}

function topRatesInFips(dataSet, fips) {
    // Adds values to industries list based on:
    // - Selected counties (fips)

    let catFilter = {
        "payann": "Wages",
        "emp": "Employees",
        "estab": "Firms"
    }
    //alert(catFilter['estab'])

    // TABLE HEADER ROW
    //alert("statelength " + statelength + " fips.length: " + fips.length);
    // && statelength != fips.length
    let text = "";
    let totalLabel = "Total";
    if(Array.isArray(fips)) {

        for(var i=0; i < fips.length; i++){

            var filteredData = consdata.filter(function(county_id_list) { // For every county in list
                //alert(county_id_list["id"] + " - " + fips[i]);
                if (county_id_list["id"]==fips[i]) {
                    if(i == fips.length-1){
                       text += "<div class='cell-right'>" + county_id_list["county"].split("County")[0] + " County</div>";
                    } else {
                        text += "<div class='cell-right'>" + county_id_list["county"].split(" County")[0] + " County</div>";
                    }
                }
            })
        }
    }
    //if (fips == stateID && hash.catsort == "payann") {
        text += "<div class='cell' style='text-align:right'>Payroll</div><div class='cell' style='text-align:right'>Establishments</div><div class='cell' style='text-align:right'>Employees</div>";
    //}

    text = "<div class='row' style='table_header'><div class='cell'><!-- col 1 -->NAICS</div><div class='cell' style='min-width:300px'><!-- col 2 -->Industry</div>" + text + "<div class='cell-right'>Population</div>";
    // <div class='cell-right'>" + totalLabel + "</div>
    
    text += "</div>"; // #9933aa
    
    // Write header to browser
    $("#sector_list").prepend(text);

    let naicsNotFound = "";
    let naicsNotFoundCount = 0;
    for (var i=0; i < dataSet.industryCounties.length; i++) {
        //alert(dataSet.industryCounties[i].NAICS);
        //alert(dataSet.industryCounties[i].FIPS);
        if (fips.length == 0 || fips.includes(dataSet.industryCounties[i].FIPS)) {
            //alert(dataSet.industries[1].id);

            let objIndex = dataSet.industries.findIndex((obj => obj.id == dataSet.industryCounties[i].NAICS));
            if (objIndex >= 0) {
                if (dataSet.industries[objIndex].aggregate === undefined) {
                    dataSet.industries[objIndex].firms = +dataSet.industryCounties[i]['Firms'];
                    dataSet.industries[objIndex].employees = +dataSet.industryCounties[i]['Employees']; 
                    dataSet.industries[objIndex].wages = +dataSet.industryCounties[i]['Wages'];
                    dataSet.industries[objIndex].population = +dataSet.industryCounties[i]['Population'];
                    dataSet.industries[objIndex].aggregate = +dataSet.industryCounties[i][catFilter['estab']]; // Set by dropdown
                } else { // Add more
                    dataSet.industries[objIndex].firms = +dataSet.industries[objIndex].firms + +dataSet.industryCounties[i]['Firms'];
                    dataSet.industries[objIndex].employees = +dataSet.industries[objIndex].employees + +dataSet.industryCounties[i]['Employees'];
                    dataSet.industries[objIndex].wages = +dataSet.industries[objIndex].wages + +dataSet.industryCounties[i]['Wages'];
                    dataSet.industries[objIndex].population = +dataSet.industries[objIndex].population + +dataSet.industryCounties[i]['Population'];
                    dataSet.industries[objIndex].aggregate = +dataSet.industries[objIndex].aggregate + +dataSet.industryCounties[i][catFilter['estab']]; // Set by dropdown
                }
                //alert(dataSet.industries[objIndex].population)
                    
            } else {
                ++naicsNotFoundCount;
                //naicsNotFound += dataSet.industryCounties[i].NAICS + ",";
            }
            //dataSet.industries.id[dataSet.industryCounties[i].NAICS].aggregate = dataSet.industryCounties[i].firms;
            //alert(dataSet.industries.id[dataSet.industryCounties[i].NAICS].aggregate);
        }

        //if (dataSet.industries.id[i.NAICS]) {
        //    alert(i.NAICS);
        //}
    }

    console.log(naicsNotFoundCount + " NAICS not found in " + industryTitleFile);
    //console.log(naicsNotFound);

    return;





    for (var j = 0; j < fips.length; j++) { 
        
        if(localObject.industryCounties.FIPS == fips[j]) {
            alert(localObject.industryCounties.FIPS);

            break;
            if (localObject.industryCounties[id].hasOwnProperty(fips[j])) {
                rateInFips = rateInFips+parseFloat(localObject.industryCounties[id][fips[j]][which])
                rateArray[j]=parseFloat(localObject.industryCounties[id][fips[j]][which]);
                naicscode = localObject.industryCounties[id][fips[j]]['relevant_naics']
                if(hash.catmethod!=0 & hash.catsort!='estab'){
                    estim[j]=parseFloat(localObject.industryCounties[id][fips[j]][estimed])
                } else {
                    estim[j]=parseFloat(0)
                }
            } else {
                    rateInFips = rateInFips+0
                    estim[j]=parseFloat(0)

            }
        }
    }

}
// Top rows for a specific set of fips (states and counties)
function topRatesInFipsOld(dataSet, fips) { // REMOVED , params
    //alert(dataSet.industryCounties.length)
    //let catcount = hash.catcount || 40;
    let catcount = 40;
    let gotext = "";
    let hash = getHash();

    console.log("topRatesInFips")
    //alert(String(stateID)) // State's fips number

    // Redirect occurs somewhere below....

    //d3.csv(local_app.community_data_root() + "us/id_lists/state_fips.csv").then( function(consdata) { 
    	// 3 COLUMNS: Name (State name), Postal Code, FIPS


        //var filteredData = consdata.filter(function(d) { // Loop through
        //    if(d["FIPS"]==String(stateID)) { // For the row matching ID 13 or other state IDs.

                if(hash.catsort=='estab'){
                    which=hash.catsort;
                } else {
                    if(hash.catmethod==0){
                        which=hash.catsort+'_reported'
                    }else if(hash.catmethod==2){
                        which=hash.catsort+'_est3'
                        estimed='estimate_est3'
                    } else { // hash.catmethod==1 or null
                        which= hash.catsort+'_est1'
                        estimed='estimate_est1'
                    }
                }


                if(hash.census_scope=="state"){
                    which_state_api=hash.catsort+'_api'
                } else {
                    which_state=hash.catsort+'_agg'
                    
                }

                //alert("naics.js hiddenhash.naics: " + hiddenhash.naics);
                //var cat_filter = getNaics_setHiddenHash(hash.show); // Resides in map-filters.js
                var cat_filter = hiddenhash.naics;

                //alert(cat_filter)
                var rates_dict = {};
                var rates_list = [];
                var forlist={}
                //selectedFIPS = fips;

                // TEMP - Hardcoded BUGBUG
                // Note that US is not included
                //fips = ["13189","13025","13171"];

                if(Array.isArray(fips)){
                    for (var i = 0; i<fips.length; i++) {

                    	/* REACTIVATE
                        Object.keys(localObject.industryCounties).forEach( this_key=>{
                            // this_key = parseInt(d.split("$")[1])
                            if (keyFound(this_key, cat_filter,params)){
                                this_rate = localObject.industryCounties[this_key]
                                if (this_rate.hasOwnProperty(fips[i])){ 
                                    if(rates_dict[this_key]){
                                        forlist[this_key]=rates_dict[this_key]+parseFloat(this_rate[fips[i]][which])
                                        rates_dict[this_key] = rates_dict[this_key]+parseFloat(this_rate[fips[i]][which])      
                                    } else {
                                        rates_dict[this_key] = parseFloat(this_rate[fips[i]][which])
                                        forlist[this_key]=parseFloat(this_rate[fips[i]][which])
                                    }
                                    
                                } else {
                                    if(rates_dict[this_key]){
                                        rates_dict[this_key] = rates_dict[this_key]+0.0
                                        forlist[this_key]=rates_dict[this_key]+0.0
                                    } else {
                                    rates_dict[this_key] = 0.0
                                    forlist[this_key]=0.0
                                    }
                                }
                            }
                        })
						*/

                    }
                    var keys = Object.keys(forlist);
                    keys.forEach(function(key){
                        rates_list.push(forlist[key])
                    });

                }else if(fips==stateID){ //Example: fips=13
                    // Was dataSet.industryDataStateApi.ActualRate[this_key], try changing to localObject.industryCounties
                        if(hash.census_scope=="state"){
                            Object.keys(localObject.industryCounties).forEach( this_key=>{
                                if (keyFound(this_key, cat_filter, hash)){ // hash was params
                                    this_rate = localObject.industryCounties[this_key]
                                    if (this_rate.hasOwnProperty(fips)){ 
                                        rates_dict[this_key] = parseFloat(this_rate[fips][which_state_api])
                                        rates_list.push(parseFloat(this_rate[fips][which_state_api]))
                                    } else {
                                        rates_dict[this_key] = 0.0
                                        rates_list.push(0.0)
                                    }
                                }
                            })
                        }
                    else{
                        //Object.keys(dataSet.industryDataState.ActualRate).forEach( this_key=>{
                        //alert(localObject.industryCounties)
                        Object.keys(localObject.industryCounties).forEach( this_key=>{ // Was: localObject.industryCounties.ActualRate
                            if (keyFound(this_key, cat_filter, hash)){ // hash was params
                                //  WAS: this_rate = dataSet.industryDataState.ActualRate[this_key]
                                this_rate = localObject.industryCounties[this_key]
                                if (this_rate.hasOwnProperty(fips)){ 
                                    rates_dict[this_key] = parseFloat(this_rate[fips][which_state])
                                    rates_list.push(parseFloat(this_rate[fips][which_state]))
                                } else {
                                    rates_dict[this_key] = 0.0
                                    rates_list.push(0.0)
                                }
                            }
                        })
                    }    

                } else {
                    Object.keys(localObject.industryCounties).forEach( this_key=>{
                        if (keyFound(this_key, cat_filter, hash)){ // hash was params
                            this_rate = localObject.industryCounties[this_key]
                            if (this_rate.hasOwnProperty(fips)){ 
                                rates_dict[this_key] = parseFloat(this_rate[fips][which])
                                rates_list.push(parseFloat(this_rate[fips][which]))
                            } else {
                                rates_dict[this_key] = 0.0
                                rates_list.push(0.0)
                            }
                        }
                    })
                }

                rates_list = rates_list.sort(function(a,b) { return a - b}).reverse()
                localObject.industryCounties = [];
                top_data_ids = [];
                naCount = 1;
                let naicscode = [];
                x=Math.min(catcount,rates_list.length)

                if(Array.isArray(fips)){

                    for (var i=0; i<rates_list.length; i++) {
                        id = parseInt(getKeyByValue(rates_dict, rates_list[i]))
                        delete rates_dict[id]
                        rateInFips=0
                        rateArray={}
                        estim={}
                        naicscode=0
                        for (var j = 0; j<fips.length; j++){ 
                            if(localObject.industryCounties[id]){ 
                                if (localObject.industryCounties[id].hasOwnProperty(fips[j])) {
                                    rateInFips = rateInFips+parseFloat(localObject.industryCounties[id][fips[j]][which])
                                    rateArray[j]=parseFloat(localObject.industryCounties[id][fips[j]][which]);
                                    naicscode = localObject.industryCounties[id][fips[j]]['relevant_naics']
                                    if(hash.catmethod!=0 & hash.catsort!='estab'){
                                        estim[j]=parseFloat(localObject.industryCounties[id][fips[j]][estimed])
                                    } else {
                                        estim[j]=parseFloat(0)
                                    }
                                } else {
                                        rateInFips = rateInFips+0
                                        estim[j]=parseFloat(0)

                                }
                            }
                        }
                        if (keyFound(naicscode, cat_filter,params)){
                            if(dataSet.industries[id]){
                                if (rateInFips == null) {
                                    rateInFips = 1
                                    localObject.industryCounties.push(
                                        {'data_id': dataSet.industries[id], [which]: 1,'NAICScode': 1, 'rank': i,'Estimate':0}
                                    )
                                }  else {
                                    localObject.industryCounties.push(
                                        {'data_id': dataSet.industries[id], [which]: rateInFips,'NAICScode': naicscode, 'rank': i, 'Firms':rateArray,'Estimate':estim}
                                    )
                                    top_data_ids.push(id)
                                }
                            }
                        }
                    }   
                } else {
                    
                    // MOVED TO REMOVED1
                }

                //console.log("naics.js localObject.industryCounties: " + localObject.industryCounties);

                let icon = "";
                let rightCol = "";
                let midCol="";
                let text = "";
                let dollar = ""; // optionally: $
                let totalLabel = "Total";
                let stateAbbr;
                
                if (hash.state) {
                    stateAbbr = hash.state.toUpperCase();
                } else {
                    stateAbbr = "GA"; // Temp HACK to show US
                }
                if(hash.catsort=="payann"){
                    totalLabel = "Total Payroll ($)";
                }
                let thestate = $("#state_select").find(":selected").text();

                if (stateAbbr) {
                //BUGBUG - Contains all the counties in the US, load from state files instead
                d3.csv(local_app.community_data_root() + "us/id_lists/county_id_list.csv").then( function(consdata) {
                	
                    d3.csv(local_app.community_data_root() + "us/state/" + stateAbbr + "/" + stateAbbr + "counties.csv").then( function(county_data) {
                         
                         

                        // INDUSTRY ROWS
                        cat_pagesize = Math.min(catcount, top_data_ids.length);
                        // cat_pagesize = top_data_ids.length; // Show over 800 rows
                        let naicshash = "";
                        $("#econ_list").html("<div><br>No results found.</div><br>");
                        alert("Industry matches found (max of " + catcount + "): " + cat_pagesize);
                        for (i = 0; i < cat_pagesize; i++) { // Naics
                            rightCol="";
                            midCol="";
                            //console.log("NAICS ROW " + i);
                            // Update these:
                                let latitude = "";
                                let longitude = "";

                                // Populate maplink with Google Map URL for each industry

                                //d3.csv(local_app.community_data_root() + "us/id_lists/county_id_list.csv").then( function(consdata) {
                                    if(Array.isArray(fips)) { // What did this do: && dataObject.counties.length != fips.length
                                        mapLink=[]
                                        for(var j=0; j<fips.length; j++){
                                            var filteredData = consdata.filter(function(d) {
                                                var filteredData = county_data.filter(function(county_data_row) {
                                                    if(d["id"]==fips[j]){
                                                        if(d["county"]==county_data_row["NAMELSAD"]){
                                                            //mapLink.push("https://www.google.com/search?q=" + localObject.industries[i]['data_id'].replace(/ /g,"+") + " " + d["county"].replace(/ /g,"+") + ",+Georgia")
                                                            mapLink.push("https://www.google.com/maps/search/" + localObject.industries[i]['data_id'].replace(/ /g,"+") + "/@" + county_data_row['latitude'] + "," + county_data_row['longitude'] + ",11z")
                                                            //mapLink.push("https://bing.com/maps/?q=" + localObject.industries[i]['data_id'].replace(/ /g,"+") + "&cp=" + county_data_row['latitude'] + "~" + county_data_row['longitude'] + "&lvl=11"); // lvl not working
                                                        }
                                                    }
                                                })
                                            })
                                        }
                                    } else if (fips == stateID) {
                                            //county=""
                                            mapLink = "https://www.google.com/maps/search/" + localObject.industries[i]['data_id'].replace(/ /g,"+") + "/@32.9406955,-84.5411485,8z"
                                            //mapLink = "https://bing.com/maps/?q=" + localObject.industries[i]['data_id'].replace(/ /g,"+") + "&cp=32.94~-84.54&z=8"; // lvl not working
                                    } else {
                                        var filteredData = consdata.filter(function(d) {
                                            var filteredData = county_data.filter(function(county_data_row) {
                                                if(d["id"]==fips ){
                                                    if(d["county"]==county_data_row["NAMELSAD"]){
                                                                //mapLink.push("https://www.google.com/search?q=" + localObject.industries[i]['data_id'].replace(/ /g,"+") + " " + d["county"].replace(/ /g,"+") + ",+Georgia")
                                                        mapLink = "https://www.google.com/maps/search/" + localObject.industries[i]['data_id'].replace(/ /g,"+") + "/@" + county_data_row['latitude'] + "," + county_data_row['longitude'] + ",11z"
                                                                //console.log("xxxxxxxxx"+county_data_row["longitude"])
                                                    }
                                                }
                                            })
                                        })
                                    }
                                //})
                                //let mapLink = "https://www.google.com/maps/search/" + localObject.industries[i]['data_id'].replace(/ /g,"+") + "/@" + latitude + "," + longitude + ",11z";


                            if(hash.catsort=="payann"){
                                //text += localObject.industries[i]['NAICScode'] + ": <b>" +localObject.industries[i]['data_id']+"</b>, "+String(whichVal.node().options[whichVal.node().selectedIndex].text).slice(3, )+": $"+String((localObject.industries[i][whichVal.node().value]/1000).toFixed(2))+" million <br>";
                                
                                // Multiple counties
                                if(Array.isArray(fips)) {

                                    //if(String((localObject.industries[i][whichVal.node().value]/1000).toFixed(2)).length<7){
                                    if (1==1) { // Always use million
                                        
                                        // The counties
                                        for (var j = 0; j < fips.length; j++) {
                                            if(localObject.industries[i]['Firms'][j]){
                                                if(localObject.industries[i]['Estimate'][j]){    
                                                    if(localObject.industries[i]['Estimate'][j]>0){
                                                        
                                                        midCol += "<div class='cell-right'>" + dollar +"<a href='" + mapLink[j] + "' target='_blank'>"+'<span style="color: #9933aa" >'+ String((localObject.industries[i]['Firms'][j]/1000).toFixed(2)) + " million</span></a></div>";
                                                    } else {
                                                        midCol += "<div class='cell-right'>" + dollar +"<a href='" + mapLink[j] + "' target='_blank'>"+ String((localObject.industries[i]['Firms'][j]/1000).toFixed(2)) + " million</a></div>";
                                                    }
                                                } else {
                                                    midCol += "<div class='cell-right'>" + dollar +"<a href='" + mapLink[j] + "' target='_blank'>"+ String((localObject.industries[i]['Firms'][j]/1000).toFixed(2)) + " million</a></div>";
                                                }
                                            } else {
                                                midCol += "<div class='cell-right'>" + "<a href='" + mapLink[j] + "' target='_blank'>" + "0</a></div>";
                                            }    
                                        }
                                        // The total
                                        rightCol += "<div class='cell-right'>" + dollar + String((localObject.industries[i][which]/1000).toFixed(2)) + " million</div>";
                                    } else {
                                        for (var j = 0; j<fips.length; j++){
                                            if(localObject.industries[i]['Firms'][j]){
                                                
                                                    midCol += "<div class='cell-right'>" + dollar + String((localObject.industries[i]['Firms'][j]/1000000).toFixed(2)) + " million</div>";
                                                
                                            } else {
                                                    midCol +="<div class='cell-right'>" + "<a href='" + mapLink[j] + "' target='_blank'>" + "0</a></div>";
                                            }   
                                        }
                                        // <span style="color: #9933aa">
                                        rightCol += "<div class='cell-right'>" + dollar + String((localObject.industries[i][which]/1000000).toFixed(2)) + " billion</div>";
                                    }
                                    
                                } else { // One entity (state or county)
                                    //if(String((localObject.industries[i][whichVal.node().value]/1000).toFixed(2)).length<7){

                                    if(localObject.industries[i]['Estimate']){    
                                        if(localObject.industries[i]['Estimate'] > 0){
                                            rightCol = "<div class='cell-right'>" + dollar + "<a href='" + mapLink + "' target='_blank'>"+'<span style="color: #9933aa" >'+String((localObject.industries[i][which]/1000).toFixed(2))+" million</span></a></div>";
                                        } else {
                                            rightCol = "<div class='cell-right'>" + dollar + "<a href='" + mapLink + "' target='_blank'>"+String((localObject.industries[i][which]/1000).toFixed(2))+" million</a></div>";  
                                        }
                                    } else {
                                        if(fips==stateID){
                                            if(hash.census_scope=="state"){
                                                rightCol = "<div class='cell-right'>" + dollar + "<a href='" + mapLink + "' target='_blank'>"+String((localObject.industries[i][which_state_api]/1000).toFixed(2))+" million</a></div>";  
                                            } else {
                                                rightCol = "<div class='cell-right'>" + dollar + "<a href='" + mapLink + "' target='_blank'>"+String((localObject.industries[i][which_state]/1000).toFixed(2))+" million</a></div>";  
                                            }
                                        } else {
                                            rightCol = "<div class='cell-right'>" + dollar + "<a href='" + mapLink + "' target='_blank'>"+String((localObject.industries[i][which]/1000).toFixed(2))+" million</a></div>";  
                                        
                                        }

                                        // ADDITIONAL COLUMNS

                                        // employee count
                                        if(fips==stateID){
                                            if(hash.census_scope=="state"){
                                                rightCol += "<div class='cell-right'><a href='" + mapLink + "' target='_blank'>" + String(Math.round(localObject.industries[i]["emp_api"])) + "</a></div>";
                                            } else {
                                                //rightCol += "<div class='cell-right'><a href='" + mapLink + "' target='_blank'>" + String(Math.round(localObject.industries[i][which_state])) + "</a></div>";
                                            }
                                        } else {
                                            //rightCol += "<div class='cell-right'><a href='" + mapLink + "' target='_blank'>" + String(Math.round(localObject.industries[i][which])) + "</a></div>";
                                        }

                                        // establishments
                                        if(fips==stateID){
                                            if(hash.census_scope=="state"){
                                                rightCol += "<div class='cell-right'><a href='" + mapLink + "' target='_blank'>" + String(Math.round(localObject.industries[i]["estab_api"])) + "</a></div>";
                                            } else {
                                                //rightCol += "<div class='cell-right'><a href='" + mapLink + "' target='_blank'>" + String(Math.round(localObject.industries[i][which_state])) + "</a></div>";
                                            }
                                        } else {
                                            //rightCol += "<div class='cell-right'><a href='" + mapLink + "' target='_blank'>" + String(Math.round(localObject.industries[i][which])) + "</a></div>";
                                        }
                                    }
                                }
                     
                            } else {

                                //rightCol = String(whichVal.node().options[whichVal.node().selectedIndex].text).slice(3, )+": "+Math.round(localObject.industries[i][whichVal.node().value]);
                                if(Array.isArray(fips)){
                                    rightCol = ""
                                    midCol = ""
                                    for (var j = 0; j<fips.length; j++){
                                        if(localObject.industries[i]['Firms'][j]){

                                            if(hash.catsort=="estab"){
                                                midCol += "<div class='cell-right'><a href='" + mapLink[j] + "' target='_blank'>" + String(Math.round(localObject.industries[i]['Firms'][j])) + "</a></div>";
                                                
                                            } else {
                                                if(localObject.industries[i]['Estimate'][j]){    
                                                        if(localObject.industries[i]['Estimate'][j]>0){
                                                            midCol += "<div class='cell-right'><a href='" + mapLink[j] + "' target='_blank'>" + '<span style="color: #9933aa" >'+String(Math.round(localObject.industries[i]['Firms'][j])) + "</span></a></div>";
                                                
                                                        } else {
                                                            midCol += "<div class='cell-right'><a href='" + mapLink[j] + "' target='_blank'>" + String(Math.round(localObject.industries[i]['Firms'][j])) + "</a></div>";
                                                
                                                        }
                                                    } else {
                                                        midCol += "<div class='cell-right'><a href='" + mapLink[j] + "' target='_blank'>" + String(Math.round(localObject.industries[i]['Firms'][j])) + "</a></div>";
                                                
                                                    }
                                            }

                                                
                                        } else {
                                                midCol += "<div class='cell-right'>" + "<a href='" + mapLink[j] + "' target='_blank'>" + "0</a></div>";
                                        } 
                                    }
                                    rightCol += "<div class='cell-right'>" + String(Math.round(localObject.industries[i][which])) + "</div>";


                                    //rightCol = String(Math.round(localObject.industries[i][whichVal.node().value]));
                                } else {
                                    if(hash.catsort=="estab"){
                                        if(fips==stateID){
                                            if(hash.census_scope=="state"){
                                                rightCol = "<div class='cell-right'><a href='" + mapLink + "' target='_blank'>" + String(Math.round(localObject.industries[i][which_state_api])) + "</a></div>";
                                            } else {
                                                rightCol = "<div class='cell-right'><a href='" + mapLink + "' target='_blank'>" + String(Math.round(localObject.industries[i][which_state])) + "</a></div>";
                                            }
                                        } else {
                                            rightCol = "<div class='cell-right'><a href='" + mapLink + "' target='_blank'>" + String(Math.round(localObject.industries[i][which])) + "</a></div>";
                                        }
                                    } else {

                                        if(localObject.industries[i]['Estimate']){    
                                            if(localObject.industries[i]['Estimate']>0){
                                                
                                                rightCol = "<div class='cell-right'><a href='" + mapLink + "' target='_blank'><span style='color:#9933aa'>" + String(Math.round(localObject.industries[i][which])) + "</span></a></div>";

                                            } else {
                                                rightCol = "<div class='cell-right'><a href='" + mapLink + "' target='_blank'>" + String(Math.round(localObject.industries[i][which])) + "</a></div>";
                                            }
                                        } else {
                                            if(fips==stateID){
                                                if(hash.census_scope=="state"){
                                                    rightCol = "<div class='cell-right'><a href='" + mapLink + "' target='_blank'>" + String(Math.round(localObject.industries[i][which_state_api])) + "</a></div>";
                                                } else {
                                                    rightCol = "<div class='cell-right'><a href='" + mapLink + "' target='_blank'>" + String(Math.round(localObject.industries[i][which_state])) + "</a></div>";
                                                }
                                            } else {
                                                rightCol = "<div class='cell-right'><a href='" + mapLink + "' target='_blank'>" + String(Math.round(localObject.industries[i][which])) + "</a></div>";
                                            }
                                        }
                                    }
                                }
                                
                            }


                            //rightCol += "<div class='cell mock-up' style='display:none'><img src='http://localhost:8887/localsite/info/img/plus-minus.gif' class='plus-minus'></div>";
                            ////text += localObject.industries[i]['NAICScode'] + ": <b>" +localObject.industries[i]['data_id']+"</b>, "+String(whichVal.node().options[whichVal.node().selectedIndex].text).slice(3, )+": "+Math.round(localObject.industries[i][whichVal.node().value])+"<br>";
                            
                            text += "<div class='row'><div class='cell'><a href='#naics=" + localObject.industries[i]['NAICScode'] + "' onClick='goHash({\"naics\":" + localObject.industries[i]['NAICScode'] + "}); return false;' style='color:#aaa;white-space:nowrap'>" + icon + localObject.industries[i]['NAICScode'] + "</a></div><div class='cell'>" + localObject.industries[i]['data_id'].replace("Other ","") +"</div>"
                            if(Array.isArray(fips)) {
                                text +=  midCol; // Columns for counties
                            }
                            text += rightCol + "</div>";
                            
                            // use GoHash()
                            
                            // Not reached
							//alert("naics text " + text);

                            if(i<=20){
                                if(i==0){
                                    naicshash = naicshash+localObject.industries[i]['NAICScode'];
                                } else {
                                    naicshash = naicshash+","+localObject.industries[i]['NAICScode']
                                }
                                
                            }
                        
                        } // End naics rows

                        let lowerMessage = "";
                        // If none estimated
                        if (!param.naics) {
                            lowerMessage += "Click NAICS number above to view industry's supply chain. ";
                        }
                        console.log("NAICS count: top " + cat_pagesize + " displayed out of " + top_data_ids.length);
                        if (cat_pagesize > 0) {
                            lowerMessage += "Purple&nbsp;text&nbsp;indicates approximated values. List does not yet include data for industries without state-level payroll reporting by BLS or BEA. - <a href='/localsite/info/data/'>More&nbsp;Details</a>";
                            $("#econ_list").html("<div id='sector_list'>" + text + "</div><br><p style='font-size:13px'>" + lowerMessage + "</p>");
                        }
                        console.log('send naics to #industry-list data-naics attribute: ' + naicshash)

                        // BUGBUG - causes naics to appear in hash
                        // Used by bubble.js
                        //alert("naicshash " + naicshash)
                        // Why is this needed for buuble even when naicshash is null?
                        //hiddenhash.naics = naicshash;

                        //console.log("naicshash  " + naicshash);
                        updateHiddenhash({"naics":naicshash}); // Used by bubble



                        // Send to USEEIO Widget
                        //$('#industry-list').attr('data-naics', naicshash);
                        
                        // Problem, this will call a second time if there is a state in hash

                        //if (!$.trim( $('#iogrid').html() ).length) { // If empty, otherwise triggered by hash change.
                            //alert("call applyIO B")

                            console.log("applyIO Deactivated")
                            //applyIO(naicshash);
                        //}
                        
                        // To Remove - Moveed into applyIO below instead. BugBug
                        //updateMosic(naicshash);

                        //updateHash({"naics":naicshash});
                        //params = loadParams(location.search,location.hash);
                        //midFunc(hash.x,hash.y,hash.z,params);

                        //alert("#industries show");
                        //$("#industries").show();

                        })
                })
                d3.csv(local_app.community_data_root() + "us/id_lists/county_id_list.csv").then( function(consdata) {
                    //document.getElementById("industryheader").text = ""; // Clear initial.
                    $(".location_titles").text(""); //Clear

                    /*
                    if (hash.show == "bioeconomy") {
                        $(".regiontitle").text("Bioeconomy and Energy");
                    } else if (hash.show == "parts") {
                        $(".regiontitle").text("Parts Manufacturing");
                    } else if (hash.show == "manufacturing") {
                        $(".regiontitle").text("Manufacturing");
                    } else if (hash.show == "ppe") {
                        $(".regiontitle").text("Healthcare");
                    } else if (hash.show == "vehicles") {
                        $(".regiontitle").text("Vehicle Manufacturing");
                    } else if (gotext) {
                        //$(".regiontitle").text(gotext);
                    }
                    */
                    //alert("statelength " + statelength + " fips.length " + fips.length)
                    //if(Array.isArray(fips) && statelength != fips.length) {
                    if(Array.isArray(fips)) {
                        if (!hash.regiontitle) {
                            //if (hash.show && fips.length == 1) {
                            //    // Remove " County" from this .replace(" County","")
                            //    $(".regiontitle").text(d["county"] + " - " + gotext);
                            //} else 
                            if (hash.show) {
                                //local_app.loctitle = fips.length + " counties";
                                local_app.showtitle = gotext;
                                $(".regiontitle").text(gotext + " within "+ fips.length + " counties");
                            } else {
                                //local_app.loctitle = fips.length + " counties";
                                local_app.showtitle = "Industries";
                                $(".regiontitle").text("Industries within "+ fips.length + " counties");
                            }
                            if (fips.length == 1) {
                                //local_app.loctitle = "County in " + thestate;
                                // To Do: Add county name here
                                //$(".locationTabText").text(thestate);
                            } else {
                                //local_app.loctitle = fips.length + " counties in " + thestate;
                                //$(".locationTabText").text(fips.length + " counties in " + thestate);
                            }
                            //}
                        }
                        /*
                        else if (hash.regiontitle) {
                            local_app.loctitle = hash.regiontitle.replace(/\+/g," ");
                            if (hash.show) {
                                $(".regiontitle").text(local_app.loctitle+ " - " + gotext);
                            } else {
                                $(".regiontitle").text(local_app.loctitle);
                            }
                            $(".locationTabText").text(local_app.loctitle);
                        }
                        */

                        var countytitle = "";
                        for(var i=0; i < fips.length; i++){
                            var filteredData = consdata.filter(function(d) {
                                if(d["id"]==fips[i]){
                                    
                                    /*
                                    if(i==fips.length-1){
                                        document.getElementById("industryheader").innerHTML=document.getElementById("industryheader").innerHTML+'<font size="3">'+d["county"]+'</font>'
                                    }else if(i==0){
                                        document.getElementById("industryheader").innerHTML=document.getElementById("industryheader").innerHTML+'<font size="3">'+d["county"]+', '+'</font>'
                                    } else {
                                    document.getElementById("industryheader").innerHTML=document.getElementById("industryheader").innerHTML+'<font size="3">'+d["county"]+', '+'</font>'
                                    }
                                    */
                                    if (fips.length > 1 && i==fips.length-1) {
                                        countytitle += " and " + d["county"].split(" County")[0];
                                    } else if (i>0) {
                                        countytitle += ", " + d["county"].split(" County")[0];
                                    } else {
                                        countytitle += d["county"].split(" County")[0];
                                    }
                                }
                            })
                        }
                        //countytitle = countytitle.replace(/,\s*$/, ""); // Trim right comma

                        if (fips.length == 1) {
                            countytitle += " County";
                        } else if (fips.length > 1) {
                            countytitle += " Counties";
                        }
                        local_app.countytitle = countytitle;

                        if (fips.length >= 1 && fips.length <= 3) {
                            //local_app.countytitle = $(".location_titles").text();
                            if (hash.show) {
                                $(".regiontitle").text(countytitle + " - " + gotext);
                            } else {
                                $(".regiontitle").text(countytitle);
                            }
                        }

                        $(".location_titles").text(countytitle);
                        $(".location_titles").show();

                    } else if (fips==stateID) {
                        

                        // NOW Resides in map-filters.js

                        /*
                        if (hash.show == "bioeconomy") {
                            $(".regiontitle").text("Bioeconomy and Energy");
                        } else if (hash.show == "parts") {
                            //$(".regiontitle").text("Parts Manufacturing");
                        } else if (hash.show == "manufacturing") {
                            $(".regiontitle").text("Manufacturing");
                        } else if (hash.show == "farmfresh") {
                            $(".regiontitle").text("Farm Fresh");
                        } else if (hash.show == "ppe") {
                            $(".regiontitle").text("Healthcare Industries");
                        } else if (hash.show == "smart") {
                            $(".regiontitle").text("Mobility Tech"); // data-driven list
                        } else if (hash.show == "ev") {
                            $(".regiontitle").text("EV Related Manufacturing"); // Excludes parts and data-driven list
                        } else if (hash.show == "vehicles") {
                            $(".regiontitle").text("Vehicles and Vehicle Parts");
                        } else if (gotext) {
                            // Would overwrite longer title from map.js loadFromSheet which includes non-datasets
                            //$(".regiontitle").text(gotext);
                        } else {
                            // Temp, reactivate after iogrid stops deleteing hash values.
                            $(".regiontitle").text("Industries");
                            //$(".regiontitle").text(String(d['Name'])+"'s Top Industries");
                        }
                        //alert("locationTabText2")
                        //$(".locationTabText").text("State"); // Temp
                        */
                    } else {
                        var filteredData = consdata.filter(function(d) {
                            if (hash.show) {
                                // Remove " County" from this .replace(" County","")
                                local_app.loctitle = d["county"];
                                local_app.showtitle = gotext;
                                $(".regiontitle").text(d["county"] + " - " + gotext);
                            } else if(d["id"]==fips ) {
                                local_app.loctitle = d["county"] + " Industries";
                                $(".regiontitle").text(d["county"] + " Industries");
                            }
                        })
                    }
                })
                console.log("Done naics loctitle: " + local_app.loctitle)
                return localObject.industryCounties;
                } // end if stateAbbr
            //}
        //})
    //})
}