##Parameters

You'll find the following in our [base starter page](../../apps/base/).

    param.display = "everything"
    param.lat = 37
    param.lon = -95.7
    param.state = "IA"
    param.set = "air"
    param.indicators = "GHG,GCC,MGHG,OGHG,HRSP,OZON,SMOG,HAPS"

These additonal parameters can be used to change the header logo:

    param.titleArray = ["Your","Community"]
    param.headerLogo = "<img src='/apps/smm/img/epa-header-logo.png' style='width:280px'>";
    param.headerLogoSmall = "<img src='/apps/img/logo/favicon.png' style='width:44px; margin-top:-5px'>";
    param.favicon = "/apps/img/logo/favicon.png"

HTML loaded by localsite.js

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