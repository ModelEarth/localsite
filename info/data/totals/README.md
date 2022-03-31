
# Input-Output Totals

## Samples of Merging Input-Output JSON Data for Totals

1. [New Commodity Chart](https://model.earth/useeio.js/test/example_tabulator.html) from Micheal ([Github](https://github.com/USEPA/useeio.js/blob/dev/test/example_tabulator.html)) - Two JSON files are combined in Javascript and displayed with Tabulator. Javascript multiplies the total commodity output `q` and the `jobs` indicator values per 1 USD output from&nbsp;[matrix&nbsp;`D`](../../../io/about/matrix/) - Update to show matrix D data grid.<br><br>**Issue:** <span style="color:red">The link above does not work due to a CORS restriction on the API: 'https://smmtool.app.cloud.gov/api/USEEIOv2.0/matrix/q' from origin 'http://localhost:8887' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource.</span>


2. View the same chart in a [React page with Tabulator](https://model.earth/useeio-widgets/src/html/jobsTable.html) from Leo ([Github](https://github.com/TheTisiboth/useeio-widgets/blob/IoChartTabulator/src/html/jobsTable.html)).  

## Update to Inflow-Outflow Chart

The existing [Inflow-Outflow Chart](/io/charts/) (which uses Material UI) will be updated to default to displaying totals (rather than per-dollar) within the [USEEIO-widgets repo](https://github.com/USEPA/useeio-widgets/).
<br>
