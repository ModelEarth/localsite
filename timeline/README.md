[Data Commons](../../)

# Goal Timelines - Data Pull

Our timeline charts use javascript to pull directly from the Google Data Commons API.  
The Google DCID values for our timelines reside in our <a href="https://docs.google.com/spreadsheets/d/1IGyvcMV5wkGaIWM5dyB-vQIXXZFJUMV3WRf_UmyLkRk/edit?usp=sharing" target="googleUnGoals">Google Sheet UN goal tabs</a>.  


**Scope** values: country, state, county, zip

---

TO DOs: [UN Goal Timeline page updates](https://github.com/ModelEarth/projects/issues/28)

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


In addition to the javascript API pull above, we created a couple [GDC API Python colabs](python)

A [location impact pull](/localsite/info/data/map-filters) is used for our location [Navigation Map Filters](/localsite/info/data/map-filters/#geoview=country)  

Cool: [Data Commons Google Sheet add-on](https://docs.datacommons.org/api/sheets/)

<!--
Apply the valid year range from the Google Sheet row in **StartYear** and **EndYear**

We could include an OmitLocations column if some countries lack emissions data.
-->
