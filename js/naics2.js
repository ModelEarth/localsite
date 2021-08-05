// Might replace "industry" with "cat" and use for any category that occurs in multiple locations.

if(typeof localObject == 'undefined') {
    var localObject = {};
}

// TEMP
let fips = 13;
let stateID = 13;
let stateAbbr = "GA";

// Not yet used
let stateIDs = {AL:1,AK:2,AZ:4,AR:5,CA:6,CO:8,CT:9,DE:10,FL:12,GA:13,HI:15,ID:16,IL:17,IN:18,IA:19,KS:20,KY:21,LA:22,ME:23,MD:24,MA:25,MI:26,MN:27,MS:28,MO:29,MT:30,NE:31,NV:32,NH:33,NJ:34,NM:35,NY:36,NC:37,ND:38,OH:39,OK:40,OR:41,PA:42,RI:44,SC:45,SD:46,TN:47,TX:48,UT:49,VT:50,VA:51,WA:53,WV:54,WI:55,WY:56,AS:60,GU:66,MP:69,PR:72,VI:78,}

let industries = d3.map(); // Populated in promises by industryTitleFile

// BUGBUG - Use a small file with just two columns
//let industryTitleFile = local_app.community_data_root() + "us/state/" + stateAbbr + "/industries_state" + stateID + "_naics6_state_all.tsv";

let industryTitleFile = "lookup/6-digit_2012_Codes.csv"; // Source: https://www.census.gov/eos/www/naics/downloadables/downloadables.html
let industryLocDataFile = local_app.community_data_root() + "us/state/GA/naics/GA_data_filled.csv";

// TO DO: Initially 6-digit naics. Store naics when number changes to 2 and 4 digit to avoid reloading file.
// TO DO: Put a promise on just the industryTitles
var promises = [

	d3.csv(industryTitleFile, function(d) {
	    industries.set(d.id, d.title);
	    return d;
	}),
	d3.csv(industryLocDataFile)
]
Promise.all(promises).then(promisesReady);
function promisesReady(values) { // Wait for 

	localObject.industryTitles = values[0]; // NAICS titles

	// TO DO: Append here for multiple states
  	localObject.industryList = values[1];

	//localObject.locList = makeRowValuesNumeric(data, dp.numColumns, dp.valueColumn);
	  
	// Make element key always lowercase
	//dp.data_lowercase_key;

	//processOutput(dp,map,map2,whichmap,whichmap2,basemaps1,basemaps2,function(results){});

	topRatesInFips(localObject, fips); // Renders header

	console.log("localObject.industryTitles length " + localObject.industryTitles.length);
	console.log("localObject.industryList length " + localObject.industryList.length);

	// Returns Logging
	//alert(industries.get("113310"));

	displayIndustryList(localObject); 
}

function displayIndustryList(localObject) {
	let hash = getHash(); // Includes hiddenhash
	//let catcount = hash.catcount || 40;
	let industrycount = 40; // localObject.industryList.length;

	let icon = "";
    let rightCol = "";
    let midCol="";
    let text = "";
    let dollar = ""; // optionally: $
    let totalLabel = "Total";
    let stateAbbr;
    let naicshash = "";
	//localObject.industryList.forEach(function(element) {
	//	console.log(element);
	//})
	
	for (i = 0; i < industrycount; i++) { // Naics
        rightCol="";
        midCol="";
        //console.log("NAICS ROW " + i);
        // Update these:
            let latitude = "";
            let longitude = "";

            // Populate maplink with Google Map URL for each industry

            //d3.csv(local_app.community_data_root() + "us/id_lists/county_id_list.csv").then( function(consdata) {
                if(Array.isArray(fips) && statelength != fips.length) {
                    mapLink=[]
                    for(var j=0; j<fips.length; j++){
                        var filteredData = consdata.filter(function(d) {
                            var filteredData = latdata.filter(function(e) {
                                if(d["id"]==fips[j]){
                                    if(d["county"]==e["NAMELSAD"]){
                                    	// BUGBUG - change to naics title
                                        mapLink.push("https://www.google.com/maps/search/" + localObject.industryList[i]['NAICS'].replace(/ /g,"+") + "/@" + e['latitude'] + "," + e['longitude'] + ",11z")
                                        
                                    }
                                }
                            })
                        })
                    }
                } else if (fips == stateID) {
                        //county=""
                        console.log(localObject.industryList[i]);
                        // BUGBUG - change to e['latitude'] + "," + e['longitude']
                        // ['title'] was ['data_id']
                        mapLink = "https://www.google.com/maps/search/" + localObject.industryList[i].NAICS.replace(/ /g,"+") + "/@32.9406955,-84.5411485,8z"
                        //mapLink = "https://bing.com/maps/?q=" + localObject.industryList[i]['data_id'].replace(/ /g,"+") + "&cp=32.94~-84.54&z=8"; // lvl not working
                } else {
                    var filteredData = consdata.filter(function(d) {
                        var filteredData = latdata.filter(function(e) {
                            if(d["id"]==fips ){      
                                if(d["county"]==e["NAMELSAD"]){
                                            //mapLink.push("https://www.google.com/search?q=" + localObject.industryList[i]['data_id'].replace(/ /g,"+") + " " + d["county"].replace(/ /g,"+") + ",+Georgia")
                                    mapLink = "https://www.google.com/maps/search/" + localObject.industryList[i]['data_id'].replace(/ /g,"+") + "/@" + e['latitude'] + "," + e['longitude'] + ",11z"
                                            //console.log("xxxxxxxxx"+e["longitude"])
                                }
                            }
                        })
                    })
                }
            //})
            //let mapLink = "https://www.google.com/maps/search/" + localObject.industryList[i]['data_id'].replace(/ /g,"+") + "/@" + latitude + "," + longitude + ",11z";


        if(hash.catsort=="payann") {
            //text += localObject.industryList[i]['NAICScode'] + ": <b>" +localObject.industryList[i]['data_id']+"</b>, "+String(whichVal.node().options[whichVal.node().selectedIndex].text).slice(3, )+": $"+String((localObject.industryList[i][whichVal.node().value]/1000).toFixed(2))+" million <br>";
            
            // Multiple counties
            if(Array.isArray(fips)) {

                //if(String((localObject.industryList[i][whichVal.node().value]/1000).toFixed(2)).length<7){
                if (1==1) { // Always use million
                    
                    // The counties
                    for (var j = 0; j < fips.length; j++) {
                        if(localObject.industryList[i]['ratearray'][j]){
                            if(localObject.industryList[i]['Estimate'][j]){    
                                if(localObject.industryList[i]['Estimate'][j]>0){
                                    
                                    midCol += "<div class='cell-right'>" + dollar +"<a href='" + mapLink[j] + "' target='_blank'>"+'<span style="color: #9933aa" >'+ String((localObject.industryList[i]['ratearray'][j]/1000).toFixed(2)) + " million</span></a></div>";
                                } else {
                                    midCol += "<div class='cell-right'>" + dollar +"<a href='" + mapLink[j] + "' target='_blank'>"+ String((localObject.industryList[i]['ratearray'][j]/1000).toFixed(2)) + " million</a></div>";
                                }
                            } else {
                                midCol += "<div class='cell-right'>" + dollar +"<a href='" + mapLink[j] + "' target='_blank'>"+ String((localObject.industryList[i]['ratearray'][j]/1000).toFixed(2)) + " million</a></div>";
                            }
                        } else {
                            midCol += "<div class='cell-right'>" + "<a href='" + mapLink[j] + "' target='_blank'>" + "0</a></div>";
                        }    
                    }
                    // The total
                    rightCol += "<div class='cell-right'>" + dollar + String((localObject.industryList[i][which]/1000).toFixed(2)) + " million</div>";
                } else {
                    for (var j = 0; j<fips.length; j++){
                        if(localObject.industryList[i]['ratearray'][j]){
                            
                                midCol += "<div class='cell-right'>" + dollar + String((localObject.industryList[i]['ratearray'][j]/1000000).toFixed(2)) + " million</div>";
                            
                        } else {
                                midCol +="<div class='cell-right'>" + "<a href='" + mapLink[j] + "' target='_blank'>" + "0</a></div>";
                        }   
                    }
                    // <span style="color: #9933aa">
                    rightCol += "<div class='cell-right'>" + dollar + String((localObject.industryList[i][which]/1000000).toFixed(2)) + " billion</div>";
                }
                
            } else { // One entity (state or county)
                //if(String((localObject.industryList[i][whichVal.node().value]/1000).toFixed(2)).length<7){

                if(localObject.industryList[i]['Estimate']){    
                    if(localObject.industryList[i]['Estimate'] > 0){
                        rightCol = "<div class='cell-right'>" + dollar + "<a href='" + mapLink + "' target='_blank'>"+'<span style="color: #9933aa" >'+String((localObject.industryList[i][which]/1000).toFixed(2))+" million</span></a></div>";
                    } else {
                        rightCol = "<div class='cell-right'>" + dollar + "<a href='" + mapLink + "' target='_blank'>"+String((localObject.industryList[i][which]/1000).toFixed(2))+" million</a></div>";  
                    }
                } else {
                    if(fips==stateID){
                        if(hash.census_scope=="state"){
                            rightCol = "<div class='cell-right'>" + dollar + "<a href='" + mapLink + "' target='_blank'>"+String((localObject.industryList[i][which_state_api]/1000).toFixed(2))+" million</a></div>";  
                        } else {
                            rightCol = "<div class='cell-right'>" + dollar + "<a href='" + mapLink + "' target='_blank'>"+String((localObject.industryList[i][which_state]/1000).toFixed(2))+" million</a></div>";  
                        }
                    } else {
                        rightCol = "<div class='cell-right'>" + dollar + "<a href='" + mapLink + "' target='_blank'>"+String((localObject.industryList[i][which]/1000).toFixed(2))+" million</a></div>";  
                    
                    }

                    // ADDITIONAL COLUMNS

                    // employee count
                    if(fips==stateID){
                        if(hash.census_scope=="state"){
                            rightCol += "<div class='cell-right'><a href='" + mapLink + "' target='_blank'>" + String(Math.round(localObject.industryList[i]["emp_api"])) + "</a></div>";
                        } else {
                            //rightCol += "<div class='cell-right'><a href='" + mapLink + "' target='_blank'>" + String(Math.round(localObject.industryList[i][which_state])) + "</a></div>";
                        }
                    } else {
                        //rightCol += "<div class='cell-right'><a href='" + mapLink + "' target='_blank'>" + String(Math.round(localObject.industryList[i][which])) + "</a></div>";
                    }

                    // establishments
                    if(fips==stateID){
                        if(hash.census_scope=="state"){
                            rightCol += "<div class='cell-right'><a href='" + mapLink + "' target='_blank'>" + String(Math.round(localObject.industryList[i]["estab_api"])) + "</a></div>";
                        } else {
                            //rightCol += "<div class='cell-right'><a href='" + mapLink + "' target='_blank'>" + String(Math.round(localObject.industryList[i][which_state])) + "</a></div>";
                        }
                    } else {
                        //rightCol += "<div class='cell-right'><a href='" + mapLink + "' target='_blank'>" + String(Math.round(localObject.industryList[i][which])) + "</a></div>";
                    }
                }
            }
 
        } else {

            //rightCol = String(whichVal.node().options[whichVal.node().selectedIndex].text).slice(3, )+": "+Math.round(localObject.industryList[i][whichVal.node().value]);
            if(Array.isArray(fips)){
                rightCol = ""
                midCol = ""
                for (var j = 0; j<fips.length; j++){
                    if(localObject.industryList[i]['ratearray'][j]){

                        if(hash.catsort=="estab"){
                            midCol += "<div class='cell-right'><a href='" + mapLink[j] + "' target='_blank'>" + String(Math.round(localObject.industryList[i]['ratearray'][j])) + "</a></div>";
                            
                        } else {
                            if(localObject.industryList[i]['Estimate'][j]){    
                                    if(localObject.industryList[i]['Estimate'][j]>0){
                                        midCol += "<div class='cell-right'><a href='" + mapLink[j] + "' target='_blank'>" + '<span style="color: #9933aa" >'+String(Math.round(localObject.industryList[i]['ratearray'][j])) + "</span></a></div>";
                            
                                    } else {
                                        midCol += "<div class='cell-right'><a href='" + mapLink[j] + "' target='_blank'>" + String(Math.round(localObject.industryList[i]['ratearray'][j])) + "</a></div>";
                            
                                    }
                                } else {
                                    midCol += "<div class='cell-right'><a href='" + mapLink[j] + "' target='_blank'>" + String(Math.round(localObject.industryList[i]['ratearray'][j])) + "</a></div>";
                            
                                }
                        }

                            
                    } else {
                            midCol += "<div class='cell-right'>" + "<a href='" + mapLink[j] + "' target='_blank'>" + "0</a></div>";
                    } 
                }
                rightCol += "<div class='cell-right'>" + String(Math.round(localObject.industryList[i][which])) + "</div>";


                //rightCol = String(Math.round(localObject.industryList[i][whichVal.node().value]));
            } else {
                if(hash.catsort=="estab"){
                    if(fips==stateID){
                        if(hash.census_scope=="state") {
                            rightCol = "<div class='cell-right'><a href='" + mapLink + "' target='_blank'>" + String(Math.round(localObject.industryList[i][which_state_api])) + "</a></div>";
                        } else {
                            rightCol = "<div class='cell-right'><a href='" + mapLink + "' target='_blank'>" + String(Math.round(localObject.industryList[i][which_state])) + "</a></div>";
                        }
                    } else {
                        rightCol = "<div class='cell-right'><a href='" + mapLink + "' target='_blank'>" + String(Math.round(localObject.industryList[i][which])) + "</a></div>";
                    }
                } else {

                    if(localObject.industryList[i]['Estimate']){    
                        if(localObject.industryList[i]['Estimate']>0){
                            
                            rightCol = "<div class='cell-right'><a href='" + mapLink + "' target='_blank'><span style='color:#9933aa'>" + String(Math.round(localObject.industryList[i][which])) + "</span></a></div>";

                        } else {
                            rightCol = "<div class='cell-right'><a href='" + mapLink + "' target='_blank'>" + String(Math.round(localObject.industryList[i][which])) + "</a></div>";
                        }
                    } else {
                        if(fips==stateID){
                            if(hash.census_scope=="state") {
                                rightCol = "<div class='cell-right'><a href='" + mapLink + "' target='_blank'>" + String(Math.round(localObject.industryList[i][which_state_api])) + "</a></div>";
                            } else {
                            	//BUGBUG
                                //rightCol = "<div class='cell-right'><a href='" + mapLink + "' target='_blank'>" + String(Math.round(localObject.industryList[i][which_state])) + "</a></div>";
                            }
                        } else {
                            rightCol = "<div class='cell-right'><a href='" + mapLink + "' target='_blank'>" + String(Math.round(localObject.industryList[i][which])) + "</a></div>";
                        }
                    }
                }
            }
            
        }


        //rightCol += "<div class='cell mock-up' style='display:none'><img src='http://localhost:8887/localsite/info/img/plus-minus.gif' class='plus-minus'></div>";
        ////text += localObject.industryList[i]['NAICScode'] + ": <b>" +localObject.industryList[i]['data_id']+"</b>, "+String(whichVal.node().options[whichVal.node().selectedIndex].text).slice(3, )+": "+Math.round(localObject.industryList[i][whichVal.node().value])+"<br>";
        
        // localObject.industryList[i].NAICS.replace("Other ","") 

        // BUGBUG - lookup title in last instance
        text += "<div class='row'><div class='cell'><a href='#naics=" + localObject.industryList[i].NAICS + "' onClick='goHash({\"naics\":" + localObject.industryList[i].NAICS + "}); return false;' style='color:#aaa;white-space:nowrap'>" + icon + localObject.industryList[i].NAICS + "</a></div><div class='cell'>" + industries.get(localObject.industryList[i].NAICS).replace("Other ","") + "</div>"
        
        text += "<div class='cell-right'>" + localObject.industryList[i].FIPS + "</div>";
        text += "<div class='cell-right'>" + localObject.industryList[i].Firms + "</div>";
        text += "<div class='cell-right'>" + localObject.industryList[i].Employees + "</div>";
        text += "<div class='cell-right'>" + localObject.industryList[i].Wages + "</div>";

        if(Array.isArray(fips)) {
            text +=  midCol; // Columns for counties
        }
        text += rightCol + "</div>";
        
        // use GoHash()
        
        $("#sector_list").append(text);

        if(i<=20){ // Avoids excessively long hash
            if(i==0){
                naicshash = naicshash+localObject.industryList[i]['NAICScode'];
            } else {
                naicshash = naicshash+","+localObject.industryList[i]['NAICScode']
            }
            
        }
    } // End looping through top naics row

}


function topRatesInFips(dataSet, fips) { // REMOVED , params
	dataNames = dataSet.industryNames;
    //let catcount = hash.catcount || 40;
    let catcount = 40;
    let gotext = "";
    let hash = getHash();

    console.log("topRatesInFips")
    //alert(String(stateID)) // State's fips number

    // Redirect occurs somewhere below....

    d3.csv(local_app.community_data_root() + "us/id_lists/state_fips.csv").then( function(consdata) { 
    	// 3 COLUMNS: Name (State name), Postal Code, FIPS
        console.log("naics.js reports state_fips.csv loaded");
        var filteredData = consdata.filter(function(d) { // Loop through
            if(d["FIPS"]==String(stateID)) { // For the row matching ID 13 or other state IDs.

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
                fips = ["13189","13025","13171"];

                if(Array.isArray(fips)){
                    for (var i = 0; i<fips.length; i++) {

                    	/* REACTIVATE
                        Object.keys(dataSet.industryData.ActualRate).forEach( this_key=>{
                            // this_key = parseInt(d.split("$")[1])
                            if (keyFound(this_key, cat_filter,params)){
                                this_rate = dataSet.industryData.ActualRate[this_key]
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

                }else if(fips==stateID){
                    //fips=13
                    
                        if(hash.census_scope=="state"){
                            Object.keys(dataSet.industryDataStateApi.ActualRate).forEach( this_key=>{
                                if (keyFound(this_key, cat_filter,params)){
                                    this_rate = dataSet.industryDataStateApi.ActualRate[this_key]
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
                        Object.keys(dataSet.industryDataState.ActualRate).forEach( this_key=>{
                            if (keyFound(this_key, cat_filter,params)){
                                this_rate = dataSet.industryDataState.ActualRate[this_key]
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
                    Object.keys(dataSet.industryData.ActualRate).forEach( this_key=>{
                        if (keyFound(this_key, cat_filter,params)){
                            this_rate = dataSet.industryData.ActualRate[this_key]
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
                localObject.industryList = [];
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
                            if(dataSet.industryData.ActualRate[id]){ 
                                if (dataSet.industryData.ActualRate[id].hasOwnProperty(fips[j])) {
                                    rateInFips = rateInFips+parseFloat(dataSet.industryData.ActualRate[id][fips[j]][which])
                                    rateArray[j]=parseFloat(dataSet.industryData.ActualRate[id][fips[j]][which]);
                                    naicscode = dataSet.industryData.ActualRate[id][fips[j]]['relevant_naics']
                                    if(hash.catmethod!=0 & hash.catsort!='estab'){
                                        estim[j]=parseFloat(dataSet.industryData.ActualRate[id][fips[j]][estimed])
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
                            if(dataNames[id]){
                                if (rateInFips == null) {
                                    rateInFips = 1
                                    localObject.industryList.push(
                                        {'data_id': dataNames[id], [which]: 1,'NAICScode': 1, 'rank': i,'Estimate':0}
                                    )
                                }  else {
                                    localObject.industryList.push(
                                        {'data_id': dataNames[id], [which]: rateInFips,'NAICScode': naicscode, 'rank': i, 'ratearray':rateArray,'Estimate':estim}
                                    )
                                    top_data_ids.push(id)
                                }
                            }
                        }
                    }   
                } else {
                    // US Reaches here
                    //alert("fips " + fips + " stateID " + stateID);
                    if(fips==stateID){
                    
                        if(hash.census_scope=="state"){
                            for (var i=0; i<rates_list.length; i++) {
                                id = parseInt(getKeyByValue(rates_dict, rates_list[i]))
                                delete rates_dict[id]

                                if (dataSet.industryDataStateApi.ActualRate[id].hasOwnProperty(fips)) {
                                    rateInFips = dataSet.industryDataStateApi.ActualRate[id][fips][which_state_api]
                                    naicscode = dataSet.industryDataStateApi.ActualRate[id][fips]['relevant_naics']
                                } else {
                                    rateInFips = 0
                                    naicscode = 1
                                }
                                
                                if (keyFound(naicscode, cat_filter,params)){
                                    if (rateInFips == null) {
                                        rateInFips = 1
                                        localObject.industryList.push(
                                            {'data_id': dataNames[id], [which_state_api]: 1,'NAICScode': 1, 'rank': i}
                                        )
                                    }  else {

                                        /// ENTIRE STATE
                                        localObject.industryList.push(
                                            {'data_id': dataNames[id], [which_state_api]: rateInFips, 'emp_api': dataSet.industryDataStateApi.ActualRate[id][fips]['emp_api'], 'estab_api': dataSet.industryDataStateApi.ActualRate[id][fips]['estab_api'], 'NAICScode': naicscode, 'rank': i}
                                        )
                                        top_data_ids.push(id)
                                    }
                                }
                            }
                        } else {
                            for (var i=0; i<rates_list.length; i++) {
                                id = parseInt(getKeyByValue(rates_dict, rates_list[i]))
                                delete rates_dict[id]

                                if (dataSet.industryDataState.ActualRate[id] && dataSet.industryDataState.ActualRate[id].hasOwnProperty(fips)) {
                                    rateInFips = dataSet.industryDataState.ActualRate[id][fips][which_state]
                                    naicscode = dataSet.industryDataState.ActualRate[id][fips]['relevant_naics']
                                } else {
                                    rateInFips = 0
                                    naicscode = 1
                                }
                                
                                if (keyFound(naicscode, cat_filter,params)){
                                    if (rateInFips == null) {
                                        rateInFips = 1
                                        localObject.industryList.push(
                                            {'data_id': dataNames[id], [which_state]: 1,'NAICScode': 1, 'rank': i}
                                        )
                                    }  else {
                                        localObject.industryList.push(
                                            {'data_id': dataNames[id], [which_state]: rateInFips,'NAICScode': naicscode, 'rank': i}
                                        )
                                        top_data_ids.push(id)
                                    }
                                }
                            }
                        }
                    } else {
                        for (var i=0; i<rates_list.length; i++) {
                            id = parseInt(getKeyByValue(rates_dict, rates_list[i]))
                            delete rates_dict[id]

                            if (dataSet.industryData.ActualRate[id].hasOwnProperty(fips)) {
                                rateInFips = dataSet.industryData.ActualRate[id][fips][which]
                                naicscode = dataSet.industryData.ActualRate[id][fips]['relevant_naics']
                                if(hash.catmethod!=0 & hash.catsort != 'estab'){
                                    estim = dataSet.industryData.ActualRate[id][fips][estimed]
                                } else {
                                    estim=0
                                }
                                //console.log(estim)
                            } else {
                                rateInFips = 0
                                naicscode = 1
                                estim = 0
                            }
                            
                            if (keyFound(naicscode, cat_filter,params)){
                                if (rateInFips == null) {
                                    rateInFips = 1
                                    localObject.industryList.push(
                                        {'data_id': dataNames[id], [which]: 1,'NAICScode': 1, 'rank': i,'Estimate':0}
                                    )
                                }  else {
                                    localObject.industryList.push(
                                        {'data_id': dataNames[id], [which]: rateInFips, 'NAICScode': naicscode, 'rank': i,'Estimate':estim}
                                    )
                                    top_data_ids.push(id)
                                }
                            }
                        }
                    }
                }

                //console.log("naics.js localObject.industryList: " + localObject.industryList);

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
                	
                    d3.csv(local_app.community_data_root() + "us/state/" + stateAbbr + "/" + stateAbbr + "counties.csv").then( function(latdata) {
                         
                         // TABLE HEADER ROW
                         //alert("statelength " + statelength + " fips.length: " + fips.length);
                         // && statelength != fips.length
                        if(Array.isArray(fips)){

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
                        text = "<div class='row'><div class='cell'><!-- col 1 -->NAICS</div><div class='cell' style='min-width:300px'><!-- col 2 -->Industry</div>" + text + "<div class='cell-right'>" + totalLabel + "</div>";
                        if (fips == stateID && hash.catsort == "payann") {
                            text += "<div class='cell' style='text-align:right'>Employees</div><div class='cell' style='text-align:right'>Firms</div>";
                        }
                        text += "</div>"; // #9933aa
                        
                        // Write header to browser
                        $("#sector_list").prepend(text);

                        // INDUSTRY ROWS
                        y=Math.min(catcount, top_data_ids.length);
                        // y = top_data_ids.length; // Show over 800 rows
                        let naicshash = "";
                        $("#econ_list").html("<div><br>No results found.</div><br>");
                        //alert(y)
                        for (i = 0; i < y; i++) { // Naics
                            rightCol="";
                            midCol="";
                            //console.log("NAICS ROW " + i);
                            // Update these:
                                let latitude = "";
                                let longitude = "";

                                // Populate maplink with Google Map URL for each industry

                                //d3.csv(local_app.community_data_root() + "us/id_lists/county_id_list.csv").then( function(consdata) {
                                    if(Array.isArray(fips) && statelength != fips.length) {
                                        mapLink=[]
                                        for(var j=0; j<fips.length; j++){
                                            var filteredData = consdata.filter(function(d) {
                                                var filteredData = latdata.filter(function(e) {
                                                    if(d["id"]==fips[j]){
                                                        if(d["county"]==e["NAMELSAD"]){
                                                            //mapLink.push("https://www.google.com/search?q=" + localObject.industryTitles[i]['data_id'].replace(/ /g,"+") + " " + d["county"].replace(/ /g,"+") + ",+Georgia")
                                                            mapLink.push("https://www.google.com/maps/search/" + localObject.industryTitles[i]['data_id'].replace(/ /g,"+") + "/@" + e['latitude'] + "," + e['longitude'] + ",11z")
                                                            //mapLink.push("https://bing.com/maps/?q=" + localObject.industryTitles[i]['data_id'].replace(/ /g,"+") + "&cp=" + e['latitude'] + "~" + e['longitude'] + "&lvl=11"); // lvl not working
                                                        }
                                                    }
                                                })
                                            })
                                        }
                                    } else if (fips == stateID) {
                                            //county=""
                                            mapLink = "https://www.google.com/maps/search/" + localObject.industryTitles[i]['data_id'].replace(/ /g,"+") + "/@32.9406955,-84.5411485,8z"
                                            //mapLink = "https://bing.com/maps/?q=" + localObject.industryTitles[i]['data_id'].replace(/ /g,"+") + "&cp=32.94~-84.54&z=8"; // lvl not working
                                    } else {
                                        var filteredData = consdata.filter(function(d) {
                                            var filteredData = latdata.filter(function(e) {
                                                if(d["id"]==fips ){      
                                                    if(d["county"]==e["NAMELSAD"]){
                                                                //mapLink.push("https://www.google.com/search?q=" + localObject.industryTitles[i]['data_id'].replace(/ /g,"+") + " " + d["county"].replace(/ /g,"+") + ",+Georgia")
                                                        mapLink = "https://www.google.com/maps/search/" + localObject.industryTitles[i]['data_id'].replace(/ /g,"+") + "/@" + e['latitude'] + "," + e['longitude'] + ",11z"
                                                                //console.log("xxxxxxxxx"+e["longitude"])
                                                    }
                                                }
                                            })
                                        })
                                    }
                                //})
                                //let mapLink = "https://www.google.com/maps/search/" + localObject.industryTitles[i]['data_id'].replace(/ /g,"+") + "/@" + latitude + "," + longitude + ",11z";


                            if(hash.catsort=="payann"){
                                //text += localObject.industryTitles[i]['NAICScode'] + ": <b>" +localObject.industryTitles[i]['data_id']+"</b>, "+String(whichVal.node().options[whichVal.node().selectedIndex].text).slice(3, )+": $"+String((localObject.industryTitles[i][whichVal.node().value]/1000).toFixed(2))+" million <br>";
                                
                                // Multiple counties
                                if(Array.isArray(fips)) {

                                    //if(String((localObject.industryTitles[i][whichVal.node().value]/1000).toFixed(2)).length<7){
                                    if (1==1) { // Always use million
                                        
                                        // The counties
                                        for (var j = 0; j < fips.length; j++) {
                                            if(localObject.industryTitles[i]['ratearray'][j]){
                                                if(localObject.industryTitles[i]['Estimate'][j]){    
                                                    if(localObject.industryTitles[i]['Estimate'][j]>0){
                                                        
                                                        midCol += "<div class='cell-right'>" + dollar +"<a href='" + mapLink[j] + "' target='_blank'>"+'<span style="color: #9933aa" >'+ String((localObject.industryTitles[i]['ratearray'][j]/1000).toFixed(2)) + " million</span></a></div>";
                                                    } else {
                                                        midCol += "<div class='cell-right'>" + dollar +"<a href='" + mapLink[j] + "' target='_blank'>"+ String((localObject.industryTitles[i]['ratearray'][j]/1000).toFixed(2)) + " million</a></div>";
                                                    }
                                                } else {
                                                    midCol += "<div class='cell-right'>" + dollar +"<a href='" + mapLink[j] + "' target='_blank'>"+ String((localObject.industryTitles[i]['ratearray'][j]/1000).toFixed(2)) + " million</a></div>";
                                                }
                                            } else {
                                                midCol += "<div class='cell-right'>" + "<a href='" + mapLink[j] + "' target='_blank'>" + "0</a></div>";
                                            }    
                                        }
                                        // The total
                                        rightCol += "<div class='cell-right'>" + dollar + String((localObject.industryTitles[i][which]/1000).toFixed(2)) + " million</div>";
                                    } else {
                                        for (var j = 0; j<fips.length; j++){
                                            if(localObject.industryTitles[i]['ratearray'][j]){
                                                
                                                    midCol += "<div class='cell-right'>" + dollar + String((localObject.industryTitles[i]['ratearray'][j]/1000000).toFixed(2)) + " million</div>";
                                                
                                            } else {
                                                    midCol +="<div class='cell-right'>" + "<a href='" + mapLink[j] + "' target='_blank'>" + "0</a></div>";
                                            }   
                                        }
                                        // <span style="color: #9933aa">
                                        rightCol += "<div class='cell-right'>" + dollar + String((localObject.industryTitles[i][which]/1000000).toFixed(2)) + " billion</div>";
                                    }
                                    
                                } else { // One entity (state or county)
                                    //if(String((localObject.industryTitles[i][whichVal.node().value]/1000).toFixed(2)).length<7){

                                    if(localObject.industryTitles[i]['Estimate']){    
                                        if(localObject.industryTitles[i]['Estimate'] > 0){
                                            rightCol = "<div class='cell-right'>" + dollar + "<a href='" + mapLink + "' target='_blank'>"+'<span style="color: #9933aa" >'+String((localObject.industryTitles[i][which]/1000).toFixed(2))+" million</span></a></div>";
                                        } else {
                                            rightCol = "<div class='cell-right'>" + dollar + "<a href='" + mapLink + "' target='_blank'>"+String((localObject.industryTitles[i][which]/1000).toFixed(2))+" million</a></div>";  
                                        }
                                    } else {
                                        if(fips==stateID){
                                            if(hash.census_scope=="state"){
                                                rightCol = "<div class='cell-right'>" + dollar + "<a href='" + mapLink + "' target='_blank'>"+String((localObject.industryTitles[i][which_state_api]/1000).toFixed(2))+" million</a></div>";  
                                            } else {
                                                rightCol = "<div class='cell-right'>" + dollar + "<a href='" + mapLink + "' target='_blank'>"+String((localObject.industryTitles[i][which_state]/1000).toFixed(2))+" million</a></div>";  
                                            }
                                        } else {
                                            rightCol = "<div class='cell-right'>" + dollar + "<a href='" + mapLink + "' target='_blank'>"+String((localObject.industryTitles[i][which]/1000).toFixed(2))+" million</a></div>";  
                                        
                                        }

                                        // ADDITIONAL COLUMNS

                                        // employee count
                                        if(fips==stateID){
                                            if(hash.census_scope=="state"){
                                                rightCol += "<div class='cell-right'><a href='" + mapLink + "' target='_blank'>" + String(Math.round(localObject.industryTitles[i]["emp_api"])) + "</a></div>";
                                            } else {
                                                //rightCol += "<div class='cell-right'><a href='" + mapLink + "' target='_blank'>" + String(Math.round(localObject.industryTitles[i][which_state])) + "</a></div>";
                                            }
                                        } else {
                                            //rightCol += "<div class='cell-right'><a href='" + mapLink + "' target='_blank'>" + String(Math.round(localObject.industryTitles[i][which])) + "</a></div>";
                                        }

                                        // establishments
                                        if(fips==stateID){
                                            if(hash.census_scope=="state"){
                                                rightCol += "<div class='cell-right'><a href='" + mapLink + "' target='_blank'>" + String(Math.round(localObject.industryTitles[i]["estab_api"])) + "</a></div>";
                                            } else {
                                                //rightCol += "<div class='cell-right'><a href='" + mapLink + "' target='_blank'>" + String(Math.round(localObject.industryTitles[i][which_state])) + "</a></div>";
                                            }
                                        } else {
                                            //rightCol += "<div class='cell-right'><a href='" + mapLink + "' target='_blank'>" + String(Math.round(localObject.industryTitles[i][which])) + "</a></div>";
                                        }
                                    }
                                }
                     
                            } else {

                                //rightCol = String(whichVal.node().options[whichVal.node().selectedIndex].text).slice(3, )+": "+Math.round(localObject.industryTitles[i][whichVal.node().value]);
                                if(Array.isArray(fips)){
                                    rightCol = ""
                                    midCol = ""
                                    for (var j = 0; j<fips.length; j++){
                                        if(localObject.industryTitles[i]['ratearray'][j]){

                                            if(hash.catsort=="estab"){
                                                midCol += "<div class='cell-right'><a href='" + mapLink[j] + "' target='_blank'>" + String(Math.round(localObject.industryTitles[i]['ratearray'][j])) + "</a></div>";
                                                
                                            } else {
                                                if(localObject.industryTitles[i]['Estimate'][j]){    
                                                        if(localObject.industryTitles[i]['Estimate'][j]>0){
                                                            midCol += "<div class='cell-right'><a href='" + mapLink[j] + "' target='_blank'>" + '<span style="color: #9933aa" >'+String(Math.round(localObject.industryTitles[i]['ratearray'][j])) + "</span></a></div>";
                                                
                                                        } else {
                                                            midCol += "<div class='cell-right'><a href='" + mapLink[j] + "' target='_blank'>" + String(Math.round(localObject.industryTitles[i]['ratearray'][j])) + "</a></div>";
                                                
                                                        }
                                                    } else {
                                                        midCol += "<div class='cell-right'><a href='" + mapLink[j] + "' target='_blank'>" + String(Math.round(localObject.industryTitles[i]['ratearray'][j])) + "</a></div>";
                                                
                                                    }
                                            }

                                                
                                        } else {
                                                midCol += "<div class='cell-right'>" + "<a href='" + mapLink[j] + "' target='_blank'>" + "0</a></div>";
                                        } 
                                    }
                                    rightCol += "<div class='cell-right'>" + String(Math.round(localObject.industryTitles[i][which])) + "</div>";


                                    //rightCol = String(Math.round(localObject.industryTitles[i][whichVal.node().value]));
                                } else {
                                    if(hash.catsort=="estab"){
                                        if(fips==stateID){
                                            if(hash.census_scope=="state"){
                                                rightCol = "<div class='cell-right'><a href='" + mapLink + "' target='_blank'>" + String(Math.round(localObject.industryTitles[i][which_state_api])) + "</a></div>";
                                            } else {
                                                rightCol = "<div class='cell-right'><a href='" + mapLink + "' target='_blank'>" + String(Math.round(localObject.industryTitles[i][which_state])) + "</a></div>";
                                            }
                                        } else {
                                            rightCol = "<div class='cell-right'><a href='" + mapLink + "' target='_blank'>" + String(Math.round(localObject.industryTitles[i][which])) + "</a></div>";
                                        }
                                    } else {

                                        if(localObject.industryTitles[i]['Estimate']){    
                                            if(localObject.industryTitles[i]['Estimate']>0){
                                                
                                                rightCol = "<div class='cell-right'><a href='" + mapLink + "' target='_blank'><span style='color:#9933aa'>" + String(Math.round(localObject.industryTitles[i][which])) + "</span></a></div>";

                                            } else {
                                                rightCol = "<div class='cell-right'><a href='" + mapLink + "' target='_blank'>" + String(Math.round(localObject.industryTitles[i][which])) + "</a></div>";
                                            }
                                        } else {
                                            if(fips==stateID){
                                                if(hash.census_scope=="state"){
                                                    rightCol = "<div class='cell-right'><a href='" + mapLink + "' target='_blank'>" + String(Math.round(localObject.industryTitles[i][which_state_api])) + "</a></div>";
                                                } else {
                                                    rightCol = "<div class='cell-right'><a href='" + mapLink + "' target='_blank'>" + String(Math.round(localObject.industryTitles[i][which_state])) + "</a></div>";
                                                }
                                            } else {
                                                rightCol = "<div class='cell-right'><a href='" + mapLink + "' target='_blank'>" + String(Math.round(localObject.industryTitles[i][which])) + "</a></div>";
                                            }
                                        }
                                    }
                                }
                                
                            }


                            //rightCol += "<div class='cell mock-up' style='display:none'><img src='http://localhost:8887/localsite/info/img/plus-minus.gif' class='plus-minus'></div>";
                            ////text += localObject.industryTitles[i]['NAICScode'] + ": <b>" +localObject.industryTitles[i]['data_id']+"</b>, "+String(whichVal.node().options[whichVal.node().selectedIndex].text).slice(3, )+": "+Math.round(localObject.industryTitles[i][whichVal.node().value])+"<br>";
                            
                            text += "<div class='row'><div class='cell'><a href='#naics=" + localObject.industryTitles[i]['NAICScode'] + "' onClick='goHash({\"naics\":" + localObject.industryTitles[i]['NAICScode'] + "}); return false;' style='color:#aaa;white-space:nowrap'>" + icon + localObject.industryTitles[i]['NAICScode'] + "</a></div><div class='cell'>" + localObject.industryTitles[i]['data_id'].replace("Other ","") +"</div>"
                            if(Array.isArray(fips)) {
                                text +=  midCol; // Columns for counties
                            }
                            text += rightCol + "</div>";
                            
                            // use GoHash()
                            
                            // Not reached
							//alert("naics text " + text);

                            if(i<=20){
                                if(i==0){
                                    naicshash = naicshash+localObject.industryTitles[i]['NAICScode'];
                                } else {
                                    naicshash = naicshash+","+localObject.industryTitles[i]['NAICScode']
                                }
                                
                            }
                        
                        } // End naics rows

                        let lowerMessage = "";
                        // If none estimated
                        if (!param.naics) {
                            lowerMessage += "Click NAICS number above to view industry's supply chain. ";
                        }
                        console.log("NAICS count: top " + y + " displayed out of " + top_data_ids.length);
                        if (y > 0) {
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
                                $(".locationTabText").text(fips.length + " counties in " + thestate);
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
                return localObject.industryList;
                } // end if stateAbbr
            }
        })
    })
}