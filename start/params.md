## Parameters

To create a page where you can edit parameters, copy our [base starter page](../../apps/base/).  
You can copy parameters from the URL.  Here's a sample with [Air impacts for Fulton and DeKalb Counties](../info/#geo=US13121,US13089&set=air&indicators=GHG,GCC,MGHG,OGHG,HRSP,OZON,SMOG,HAPS)

    param.display = "everything"
    param.lat = 37
    param.lon = -95.7
    param.state = "GA"
    param.geo = "US13121,US13089" // Fulton and DeKalb Counties
    param.zip = "30318" // See zip output sample link below
    param.set = "air"
    param.indicators = "GHG,GCC,MGHG,OGHG,HRSP"
    param.naics = "327310,321213" // Cement and Engineered Wood
    param.sectors = "562111,562212,562213,562910,562920,562HAZ,562OTH" // Recycling Sectors
<!-- Additional param.indicators OZON,SMOG,HAPS -->
Thus far, zip is only implemented in our [zip output sample](https://model.earth/zip/io/#zip=30318)

Learn about [Recycling sector deaggregation](https://github.com/USEPA/useeior/wiki/Disaggregation-of-Sectors#disaggregation-inputs-for-envfile) - The EPA will be updating so more than one recycling sector is returned.

These additonal parameters can be used to change the header logo:

    param.titleArray = ["Your","Community"]
    param.headerLogo = "<img src='/apps/smm/img/epa-header-logo.png' style='width:280px'>";
    param.headerLogoSmall = "<img src='/apps/img/logo/favicon.png' style='width:44px; margin-top:-5px'>";
    param.favicon = "/apps/img/logo/favicon.png"

## HTML loaded by localsite.js

1. Location (state, county) map filters resides in:
[/localsite/map/index.html](../map/index.html)

2. USEEIO widget HTML layout resides in:
[/localsite/info/info-template.html](../info/info-template.html)

3. Navigation is loaded by js/navigation.js, which loads:
[/localsite/header.html](../header.html) (includes left and right navigation)
[/localsite/footer.html](../footer.html)

<!--
Not in use:
param.startTitle = "Your Community"
-->