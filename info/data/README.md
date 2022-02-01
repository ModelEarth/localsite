
# Data Pipeline

We process NAICS industry data into [state files with county employment levels](https://github.com/modelearth/community-data/tree/master/us/state) using Python and soon [GitHub Actions](https://model.earth/community/projects/#github-actions).  

The resulting local NAICS values are sent client-side to [US EPA Input-Output Charts](../../../io/charts/) which use [static JSON files](https://github.com/modelearth/io/tree/main/build/api).  

**Our NAICS pipeline**
1. [Generate state county files](https://github.com/modelearth/community-data) for 2 to 6 digit NAICS industries for static hosting on Github.  
To estimate gaps for counties with low numbers of firms per industry, will use this [2018 data from Ecker](https://github.com/modelearth/community-data/tree/master/process/cbp).  
3. Compare with output from our <a href="https://github.com/modelearth/machine-learning">Machine Learning script</a> created by John Taylor.  
4. Our upcoming [comparison report](../../info/naics/) - a newer version of our [EPA Local Industries Impact Report](../../info/)  

Data source: US Bureau of Labor Statistics (BLS)
Our older links: [Industries by county](https://github.com/modelearth/community-data/tree/master/us/state) | [Industries by zipcode](../../../community/industries/)  

<!--
[Embeddable IO Widgets](../../charts) use the [static JSON files](https://github.com/modelearth/io/tree/main/build/api) output from the [USEEIO API](https://github.com/USEPA/USEEIO_API/wiki).
We recommend that you work in [USEEIO-widgets repo](../../charts) if you are interested in interacting with the API data.
-->

## NAICS Data with Fewer Gaps

[Imputed County Business Patterns (CBP) dataset](http://www.fpeckert.me/cbp/) by [Fabian Ecker, et al.](http://fpeckert.me/cbp/efsy.pdf) - The Fabian Ecker (2021) work extends Isserman and Westervelt (2006), but uses a linear objective function for faster computation with exact results. The authors are planning to apply to zip codes. "After 1994, the CBP files contain tabulations at the zip code level. We plan to apply our imputation method to this geographic unit in a future draft."    


## Data Sources

### US Bureau of Labor Statistics (BLS)

County Quarterly Census of Employment and Wages ([Via Flowsa Flow-By-Activity Datasets](https://github.com/USEPA/flowsa/wiki/Available-Data#flow-by-activity-datasets))



We may combine QWI data with BLS data to estimate 6-digit naics employment and payroll based on the number of firms in a county and additional county attributes. Our related [Machine Learning Repo](https://github.com/modelearth/machine-learning)


### US Census - Quarterly Workforce Indicators (QWI)


<a href="https://www.census.gov/data/developers/data-sets/qwi.html">Quarterly Workforce Indicators (QWI)</a> - Used by Drawdown Georgia for 3-digit NAICS
[QWI provides 2, 3 and 4 digit NAICS Industries](https://lehd.ces.census.gov/data/schema/latest/lehd_public_use_schema.html#_industry)



# Commodity and Job Data

We're working toward generating [interactive impact labels](../../../community/projects/#widgets) from static JSON and YAML files.

[New Commodity Chart](https://model.earth/useeio.js/test/example_tabulator.html) ([Github](https://github.com/USEPA/useeio.js/blob/dev/test/example_tabulator.html)) - Two JSON files are combined in Javascript and displayed with Tabulator. Javascript multiplies the total commodity output `q` and the `jobs` indicator values per 1 USD output from&nbsp;[matrix&nbsp;`D`](../../../io/about/matrix/) - Update to show matrix D data grid.

View the same chart in a [React page with Tabulator](https://github.com/TheTisiboth/useeio-widgets/tree/IoChartTabulator) - The url of the page is localhost/ jobsTable.html  

Compare with Material UI datagrid [Sector List](../../../io/charts) widgets which also handle the sorting. Create a similar chart display using Material UI within the [USEEIO-widgets repo](https://github.com/USEPA/useeio-widgets/).
<br>


# Display Datasets

Our site combines labor and industry stats with commodity inflow-outflow data from the US EPA.

[Full list of data sources](/io/about/api/) - BLS, EPA's USEEIO and Flowsa (BEA, Energy, Water, more)

####Embeddable Datasets
<!-- ../#mapview=country -->
[Local Industries, Impacts and Employment](../../../apps/beyondcarbon/#mapview=state) - Embedding samples: [Community Pages](../../../apps)

[Impacts of Goods and Services](../../../io/charts/) - US Environmentally-Extended Input-Output Widgets  

[Community and Product Impact Profiles](../../../io/template/) - Using Environmental Product Declarations (EPDs)


####Data Sources and Prep

[Pre-Processed Community Data](https://github.com/modelearth/community-data/)  

[Machine Learning Algorithms for NAICS industries](https://github.com/modelearth/machine-learning/) - US Bureau of Labor Statistics (BLS)

[Early Goods and Service Mockups from CSV](../../../community/start/dataset/) -- [Recent IO widget from JSON API](/io/build/sector_list.html?view=mosaic&count=50)


####Opportunties for further integration

[Google Data Commons Setup](datacommons)  

[DataUSA.io Setup](datausa)  

[Census Reporter](../../../community/resources/censusreporter/)
<!--

[EPA Flowsa Setup](flowsa) - includes U.S. Bureau of Labor Statistics (BLS) industry data  

---
<br>
Are any maps or navigation standards using YAML for layer lists (instead of [json](ga-layers.json)?)  
[YAML Sample](https://nodeca.github.io/js-yaml/) - [Source](https://github.com/nodeca/js-yaml)
-->