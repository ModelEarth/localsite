Python pull from [Google Data Commons (UN Data)](/data-commons/)

# For Location Map Filters 

We're replacing [us-states.json](/localsite/info/data/map-filters/us-states.json) with a new CSV file called [us-states.csv](https://github.com/ModelEarth/localsite/tree/main/info/data/map-filters) for our [map navigation filters](#geoview=country).

In our [State Filters CoLab](https://colab.research.google.com/drive/1CsIjLujiiBoGJlIHCBvDZit3QSVg07zR?usp=sharing) - we'll geneate a us-states.csv file and send to Github.

**TO DO:** Add info on how to enter a private GitHub token in State Filters CoLab.

<!--
Not needed since we're pulling from GDC instead:
Copy population lookups [from this CoLab](https://colab.research.google.com/drive/1wmJ3V9eqD8KbmBiP-hLeSstwOUt5iS2V?usp=sharing) using python libraries.
--><br>


# UN Goal Topics

Our [Google Sheet with Goal tabs](https://docs.google.com/spreadsheets/d/1IGyvcMV5wkGaIWM5dyB-vQIXXZFJUMV3WRf_UmyLkRk/edit?usp=sharing) for DCID values fed to our Python .csv file generation. - Abhishek L. and Pratyush  

Goal .csv file output is initially in local notebooks, later in this [UN Goals CoLab](https://colab.research.google.com/drive/1riRnKUGNGkJZOU6qJoznAxjySInQjnFQ?usp=sharing).


From the sheet columsn, display a clean navigation hierarchy with 3 levels:  
Goal (Air) > Topic (Emissions) > Subtopic (Methane)

<br>


## Previous: State Carbon Comparison

Data merged for [Carbon Cycle - State Comparison](/apps/carbon/#state=CA) within apps/js/bc.js

The original BeyondCarbon.org state comparison data seems to be removed from their site.

[BeyondCarbon.org](https://BeyondCarbon.org) data was originally pulled into [fused/result.json](https://model.earth/beyond-carbon-scraper/fused/result.json) by [beyond-carbon-scraper](https://github.com/modelearth/beyond-carbon-scraper/)

<br>
