function applyIO(naics) {
    console.log("applyIO with naics: " + naics);

    if (!hash.indicators) {
        // After flicer is fixed:
        //hash.indicators = "ACID,ENRG,ETOX,EUTR,GHG,HTOX,JOBS,LAND,OZON,PEST,RNRG,SMOG,VADD,WATR";

        hash.indicators = "ACID,ETOX,EUTR,GHG,HTOX,LAND,OZON,PEST,SMOG,WATR";
    }

    //alert("hiddenhash.naics: " + hiddenhash.naics);
    /*
    var modelID = 'USEEIO';

    var model = useeio.model({
        endpoint: '/io/build/api',
        model: modelID,
        asJsonFiles: true,
    });

    var inputs = useeio.inputList({
        model: model,
        selector: '#inputs',
    });

    var sectorList = useeio.sectorList({
        model: model,
        selector: '#industry-list',
    });

    var outputs = useeio.outputList({
        model: model,
        selector: '#outputs',
    })
    */


    /*
    var naics = '11,45,62,211,314,331,425,452,488,521,561,721,925,1122,'
        + '1151,2213,2389,3121,3161,3251,3272,3322,3333,3346,'
        + '3366,4234,4245,4422,4482,4541,4851,4872,4922,5174,'
        + '5239,5323,5418,5619,6117,6223,7112,7213,8123,9231,'
        + '11115,11192,11233,11311,21221,22121,23721,23819,'
        + '23891,31142,31193,31322,31519,32121,32229,32519,'
        + '32591,32621,32741,33149,33251,33324,33422,33531,'
        + '33633,33711,33995,42333,42352,42383,42412,42444,'
        + '42469,42499,44221,44512,44711,44832,45321,45439,'
        + '48423,48691,48833,49312,51212,51521,52111,52239,'
        + '52411,52599,53212,54111,54137,54171,54191,56133,'
        + '56161,56211,61143,62132,62199,62412,71119,71311,'
        + '72111,81111,81219,81311,92111,92215,92512,111120,'
        + '111320,111421,112112,112420,113310,115116,212222,'
        + '212322,213114,221121,236210,238130,238320,311212,'
        + '311352,311520,311824,312111,313230,315190,321113,'
        + '321920,322219,324121,325199,325413,325991,326150,'
        + '327120,327410,331222,331512,332215,332431,332813,'
        + '332999,333249,333517,333922,333999,334416,334516,'
        + '335221,335921,336212,336390,336991,337212,339910,'
        + '339999,423390,423610,423840,424130,424450,424710,'
        + '425110,442210,444220,446110,448140,451211,453910,'
        + '454390,483113,485111,485999,488190,488999,511130,'
        + '512199,517110,521110,522294,523910,524130,525990,'
        + '532111,532411,541213,541380,541612,541820,541930,'
        + '561320,561492,561622,562112,611110,611610,621310,'
        + '621493,622310,624210,711211,712190,713990,722330,'
        + '811121,811411,812210,812990,813920,921190,923130,'
        + '926150';
    */
    //naics = '221100'; // TEMP
    //naics = '';

    // Add bioeconomy
    //naics = naics + "311615,311812,321113,221112,113310,322110,311821,311612,325211,311813,311911,311919,311830,311119,322121,311824,311941,325991,311710,311930";

    var naicsCodes;
    if (naics) {
        naicsCodes = naics.split(',');
    }
    //var handled = {};

    //alert("hiddenhash.indicators " + hiddenhash.indicators);
    //alert("param.indicators " + param.indicators);
    //alert("hash.indicators " + hash.indicators); 
    //alert("params.indicators " + params.indicators); // How/why - these are from the localsite.js include and get used by IO chart

    //let params = {};
    //params.indicators = hash.indicators; // Otherwise localsite.js include is used. Not sure how this gets to IOChart widget.

    //var indicators = "VADD";
    var indicators = "";
    //let hash = getHash();
    if (hash.indicators) {
        indicators = hash.indicators;
        hiddenhash.indicators = hash.indicators;
        //alert("yes " + indicators)
    }

    //alert("indicators " + indicators);
    //alert("applyIO with sectors: " + param.sectors);

    var indicatorCodes = indicators.split(',');

    // hiddenhash.indicators = indicatorCodes;

    // Probably not working, using config.update below instead.

    //hiddenhash.naics = naicsCodes;
    //hiddenhash.indicators = indicatorCodes;
    //hiddenhash.count = 10;

    //console.log("hiddenhash.naics set in naics.js " + hiddenhash.naics);

    /*
    hiddenhash = {
        indicators: "VADD",
        naics: naics,
        count: 20
    };
    */

    // Either array or comma separated list works
    //var beaCodes = useeio.toBEA(['11', '22']);
    //var beaCodes = useeio.toBEA('11,22');
    
    //var beaCodes = useeio.toBEA(naics); // Works
    //console.log("Hack: Get BEA directly from naics: " + beaCodes);

    //console.log("BUG - called multiple times when embedded iogrid chart checkbox checked.")
    /*
    var beaCodes = naicsCodes.map(useeio.toBEA)
        .filter(function (code) {
            // remove unmapped codes and duplicates
            if (!code || handled[code])
                return false;
            handled[code] = true;
            return true;
        });
    */

     

    var config = useeio.urlConfig();
    var modelID = config.get().model || 'USEEIOv2.0';
    if (param.iomodel) {
        modelID = param.iomodel;
    }
    // USEEIOv1.2 shows incorrect bars. $300.043 input per $1 for agriculture.
    // USEEIO showed fish for colleges

    //config.update({naics: ['11', '22']}) // filters the sectors
    //config.update({sectors: useeio.toBEA('336411','481000')})  // selects all these sectors

    //config.update({sectors: ['336411','481000']});



    // 
    //
    //if (!hash.go && !hash.geo && !hash.catsort && !hash.catsize) {

        

        //config.update({naics: naicsCodes, count: 20}); // filters the BEA sectors



        //  BUGBUG - THIS NEEDS TO STOP POPULATING NAICS IN THE HASH. FIND OTHER WAY.
        // To Reactivate BugBug
        //config.update({naics: naicsCodes, count: 20, indicators: indicatorCodes}); // filters the BEA sectors



        //config.update(hiddenhash);

        //document.dispatchEvent(new CustomEvent('hashChangeEvent'));

    //}

    //config.update({sectors: useeio.toBEA('336411','481000')})  // selects all these sectors

    //alert(config.sectors)

    var model = useeio.model({
        endpoint: '/io/build/api',
        model: modelID,
        asJsonFiles: true,

    });
    var ioGrid = useeio.ioGrid({
        model: model,
        selector: '#iogrid',
        indicators: indicatorCodes,
        
    });
    config.withDefaults({
        count: 20,
    })
    config.join(ioGrid);


    // For older 3 column IO layout
    // Also remove display:none from #ioPanelOld
    /*
    var config = {
        count: 20,
        naics: naicsCodes,
        sectors: useeio.toBEA(naicsCodes)
    };
    inputs.update(config);
    outputs.update(config);
    sectorList.update(config);
    sectorList.onChanged(function (change) {
        for (var prop in change) {
            if (change.hasOwnProperty(prop)) {
                config[prop] = change[prop];
            }
        }
        inputs.update(config);
        outputs.update(config);
        sectorList.update(config);
    });
    */

    // TEMP - Remove NAICS from has manually
    //updateHash({'naics':''});

    var sectorList = useeio.sectorList({
        model: model,
        selector: '#sector-list',
    });
    config.withDefaults({
        view: ["mosaic"],
        count: 50,
    })
    config.join(sectorList);

    // End Copied from sector_list.html, and changed to use withDefaults

}