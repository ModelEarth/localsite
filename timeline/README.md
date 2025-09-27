[Data Commons](../../)

# Goal Timelines - Data Pull

The Google DCID values for our timelines reside in our <a href="https://docs.google.com/spreadsheets/d/1IGyvcMV5wkGaIWM5dyB-vQIXXZFJUMV3WRf_UmyLkRk/edit?usp=sharing" target="googleUnGoals">Google Sheet UN goal tabs</a>.  
Our timeline charts use javascript to pull directly from the Google Data Commons API.  
Scroll down to see Air and Water topics from our Google Sheet tabs.

---

**Our UN Goal Timelines created with Google's JavaScript API**

TO DO: Adjust the chartJS timeline above for mobile viewing on narrow screens. - Rakesh
TO DO: Update our [Google Sheet UN Goal tabs](https://docs.google.com/spreadsheets/d/1IGyvcMV5wkGaIWM5dyB-vQIXXZFJUMV3WRf_UmyLkRk/edit?usp=sharing) with additional DCID values to pull into our javascript timelines above. - Everyone
IN PROGRESS: Updates for top/bottom 5 and all countries - Priyanka
IN PROGRESS: Goals sheets - Using one row to also support Age and Gender - Niranjan
TO DO: Percapita needs to be applied to emissions timelines. And activate toggle. - Chandu
STILL NEEDED?: Sort timeline data by year before sending it to the chart. Which charts did we see this issue in?

<!--
DONE: Update earthscape.js to also display countries and states. - Mehul, Priyanka

CANCELED - Using Python colab pull from GDC instead: Update [RealityStream](/realitystream/models/) to fetch a path from our timelines page. The process will need to wait until the DOM is replaced with json. Sample path: [/localsite/timeline/#output=json](https://model.earth/localsite/timeline/#output=json)
-->

<!--
[Our Run Models Colab](https://colab.research.google.com/drive/1zu0WcCiIJ5X3iN1Hd1KSW4dGn0JuodB8?usp=sharing#scrollTo=Z12cWU4y09on) already includes a process for saving CSV files to GitHub. The relevant part happens around saving the integrated dataset to the repo.
-->

<!--
Abhishek L may also have .ipynb files that generate .csv files locally. The output .csv could be sent to a fork of [data-commons](https://github.com/ModelEarth/data-commons) in a folder added at data-common/docs/data.
-->


<!--
TO DO: Also update our [Data Commons Timelines CoLab](https://colab.research.google.com/drive/1PF8wojIOHxDCdmadsAdkpHnb-An1ymEh?usp=sharing)
-->

<!--
TO DO: In the UN Goals Colab, the [country.csv timeline output Abhishek created](https://github.com/ModelEarth/community-data/tree/master/locations/datacommons) can be output to data-commons/docs/data/air/[dcid].csv.  
Then delete the country.csv file

Earlier dev page:
/data-pipeline/timelines/earthscape/datacommons.html#country=IN,CN,US
-->
<br>

**Our UN Goal CoLabs using Google's Python API**

For python output, our [UN Goals Timelines CoLab](https://colab.research.google.com/drive/1LZC8ot8skRMtD4DnokDjYXH6B73WinYP?usp=sharing) pulls timeline data DCID values from our Google Sheet. We also pull [States and Counties with Python](https://colab.research.google.com/drive/1CsIjLujiiBoGJlIHCBvDZit3QSVg07zR?usp=sharing)

<!--
ON HOLD: In the [UN Goals Timelines CoLab](https://colab.research.google.com/drive/1LZC8ot8skRMtD4DnokDjYXH6B73WinYP?usp=sharing) create a function called timelineGeneration() that generates all the timelines as csv files. Pass it an object containing DCID values and their scopes - pulled from our Google Sheet UN Goal tabs.
-->

**Scope** values are: Country, State, County, Zip

We created a python util for scope data retrieval [scope-data-utils.py](https://github.com/ModelEarth/data-commons/blob/main/docs/data/python/scope-data-utils.py) - but it's not been used yet.

Checkout the [Data Commons location impact pull](/localsite/info/data/map-filters) used for our location [navigation map-filters](#geoview=country) (scroll up after clicking).

Cool: [Data Commons Google Sheet add-on](https://docs.datacommons.org/api/sheets/)

<!--
Apply the valid year range from the Google Sheet row in **StartYear** and **EndYear**

We could include an OmitLocations column if some countries lack emissions data.
-->
