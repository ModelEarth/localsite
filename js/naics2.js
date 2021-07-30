if(typeof localDataObject == 'undefined') {
    var localDataObject = {};
}

//alert(local_app.community_data_root() + "us/id_lists/industry_id_list.csv");

let dataLoc = local_app.community_data_root() + "us/state/GA/naics/GA_data_filled.csv";


d3.csv(dataLoc).then(function(data) { // One row per line
  //console.log("To do: store data in browser to avoid repeat loading from CSV.");

  //localDataObject.locList = makeRowValuesNumeric(data, dp.numColumns, dp.valueColumn);
  
  // TO DO: Append here for multiple states
  localDataObject.industryList = data;

  // Make element key always lowercase
  //dp.data_lowercase_key;

  //processOutput(dp,map,map2,whichmap,whichmap2,basemaps1,basemaps2,function(results){});
  console.log("DONE");
  displayIndustryList(localDataObject);
})

function displayIndustryList(localDataObject) {
	localDataObject.industryList.forEach(function(element) {
		console.log(element);
	})
	console.log("localDataObject.industryList length " + localDataObject.industryList.length);
}