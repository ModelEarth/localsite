Python pull from [Google Data Commons (UN Data)](/data-commons/)

# For Location Map Filters 

We've replaced [us-states.json](/localsite/info/data/map-filters/us-states.json) with the new CSV file called [us-states.csv](https://github.com/ModelEarth/localsite/tree/main/info/data/map-filters) for our [state navigation filters](#geoview=country).<!--
Not needed since we're pulling from GDC instead:
Copy population lookups [from this CoLab](https://colab.research.google.com/drive/1wmJ3V9eqD8KbmBiP-hLeSstwOUt5iS2V?usp=sharing) using python libraries.
-->

TO DO: Output countries.csv file with 2-char country codes and similar columns to [us-states.csv](https://github.com/ModelEarth/localsite/blob/main/info/data/map-filters/us-states.csv).  
Existing [country-populations.csv](https://github.com/ModelEarth/localsite/blob/main/info/data/map-filters/country-populations.csv) uses 3-char for our [country navigation filters](#geoview=countries). - Abhishek L


TO DO: Create a GitHub Action for our [State Filters CoLab](https://colab.research.google.com/drive/1CsIjLujiiBoGJlIHCBvDZit3QSVg07zR?usp=sharing).  
Run annually for both states and countries.
Document how to add a private Github token to push from CoLab.

<br>


# UN Goal Topics

TO DO: Update our [UN Goals CoLab](https://colab.research.google.com/drive/1riRnKUGNGkJZOU6qJoznAxjySInQjnFQ?usp=sharing) to pull DCID's from our [Google Sheet with Goal tabs](https://docs.google.com/spreadsheets/d/1IGyvcMV5wkGaIWM5dyB-vQIXXZFJUMV3WRf_UmyLkRk/edit?usp=sharing).

TO DO: Save .csv files to GitHub. The similar GitHub process [Ivy added in Streamlit](https://model.earth/RealityStream/streamlit) could be helpful.  Abhishek L may also have .ipynb files that generate .csv files locally. The output .csv could be sent to a fork of [data-commons](https://github.com/ModelEarth/data-commons) in a folder added at data-common/docs/data.

TO DO: Update our [Google Sheet with Goal tabs](https://docs.google.com/spreadsheets/d/1IGyvcMV5wkGaIWM5dyB-vQIXXZFJUMV3WRf_UmyLkRk/edit?usp=sharing) with additional DCID values that we'll pull for our Python .csv file generation. - Pratyush 

TO DO: Also update our [Data Commons Timelines CoLab](https://colab.research.google.com/drive/1PF8wojIOHxDCdmadsAdkpHnb-An1ymEh?usp=sharing)

TO DO: From the sheet columns, display a clean navigation hierarchy with 3 levels using javascript. Here's [.csv for the "Air" tab](https://docs.google.com/spreadsheets/d/1IGyvcMV5wkGaIWM5dyB-vQIXXZFJUMV3WRf_UmyLkRk/pub?gid=0&single=true&output=csv). 
Goal (Air) > Topic (Emissions) > Subtopic (Methane)

<br>


## Previous: State Carbon Comparison

Data merged for [Carbon Cycle - State Comparison](/apps/carbon/#state=CA) within apps/js/bc.js

The original BeyondCarbon.org state comparison data seems to be removed from their site.

[BeyondCarbon.org](https://BeyondCarbon.org) data was originally pulled into [fused/result.json](https://model.earth/beyond-carbon-scraper/fused/result.json) by [beyond-carbon-scraper](https://github.com/modelearth/beyond-carbon-scraper/)

<br>
