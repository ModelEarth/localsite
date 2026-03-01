# Location Map Filters 

Generated historical data is sent to [community-data/locations/datacommons](https://github.com/ModelEarth/community-data/tree/master/locations/datacommons).

1.) [countries.csv](https://github.com/ModelEarth/localsite/tree/main/info/data/map-filters) for our [country selection filters](#geoview=countries) and [tabulator sample](/data-pipeline/timelines/training/naics/):  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;**Data Scale**: Population (in Millions), Land Area (in Thousand Sq Miles), CO2 Emissions (in Thousand Metric Tonnes)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[countries-full.csv](https://github.com/ModelEarth/localsite/tree/main/info/data/map-filters) has data in its original scale.  - Both are generated from MapFilters Colab - Abhishek L

2.) [us-states.csv](https://github.com/ModelEarth/localsite/tree/main/info/data/map-filters) for our [state selection filters](#geoview=country):  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;**Data Scale**: Population (in Thousands), Land Area (in Thousand Sq Miles), CO2 and Methane Emissions (in Thousand Metric Tonnes)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[us-states-full.csv](https://github.com/ModelEarth/localsite/tree/main/info/data/map-filters) has data in its original scale.  - Both are generated from MapFilters Colab - Abhishek L

3.) [us-counties.csv](https://github.com/ModelEarth/localsite/tree/main/info/data/map-filters) for our [county selection filters](#geoview=state&state=AL):  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;**Data Scale**: Population (in Thousands), Land Area (in Sq Miles), CO2 and Methane Emissions (in Thousand Metric Tonnes)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[us-counties-full.csv](https://github.com/ModelEarth/localsite/tree/main/info/data/map-filters) has data in its original scale.  - Both are generated from MapFilters Colab - Abhishek L

[MapFilters Colab](https://colab.research.google.com/drive/1riRnKUGNGkJZOU6qJoznAxjySInQjnFQ?usp=sharing):  
This CoLab stores the data of the latest available year for Population and Emissions (CO2 and Methane) on us-counties, us-states and countries level for use in top nav map filters. - Abhishek L

[StateFilter Colab](https://colab.research.google.com/drive/1CsIjLujiiBoGJlIHCBvDZit3QSVg07zR?usp=sharing):  
This CoLab stores the historic data of all available years for Population and Emissions on us-counties, us-states and countries level. - Abhishek L

<!--
Not needed since we're pulling from GDC instead:
Copy population lookups [from this CoLab](https://colab.research.google.com/drive/1wmJ3V9eqD8KbmBiP-hLeSstwOUt5iS2V?usp=sharing) using python libraries.
-->

DONE: Output countries.csv file with 2-char country codes and similar columns to [us-states.csv](https://github.com/ModelEarth/localsite/blob/main/info/data/map-filters/us-states.csv). - Abhishek L


TO DO: Move python from our [State Filters CoLab](https://colab.research.google.com/drive/1CsIjLujiiBoGJlIHCBvDZit3QSVg07zR?usp=sharing) into our [data-pipeline admin](../../../../data-pipeline/admin) to annually for both states and countries.

[How to add a Github token to push from CoLab](/localsite/start/steps/github-token/)


Also see our [UN Goal Timelines Javascript API pull](/localsite/timeline/)

<!--
## Previous: State Carbon Comparison

Data merged for [Carbon Cycle - State Comparison](/apps/carbon/#state=CA) within apps/js/bc.js

The original BeyondCarbon.org state comparison data seems to be removed from their site.

[BeyondCarbon.org](https://BeyondCarbon.org) data was originally pulled into [fused/result.json](https://model.earth/beyond-carbon-scraper/fused/result.json) by [beyond-carbon-scraper](https://github.com/modelearth/beyond-carbon-scraper/)
-->
