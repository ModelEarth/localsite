
For Give Thanks Hackathon...

# Local Commodities and Jobs

Our goal is to create [interactive impact labels](../../../community/projects/#widgets) from static JSON and YAML files.

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