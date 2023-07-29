## Integration between Websites

<a href="https://github.com/modelearth/localsite/" target="_parent">The Localsite Framework</a> is designed to allow easier integration between Github submodule repos by using hash values to share settings.  

**hashChangeEvent** - triggers independent widgets when the URL hash is changed both programmatically and by the user.    

**hiddenhash** - stores values referenced by multiple widgets to avoid cluttering the URL.  
<!--
goHash({"go":"bioeconomy"}); - Hash change triggers widgets.  

updateHash({"go":"bioeconomy"}); - Only hash updated.  
-->
**param** - An object containing key-values from three sources: the initial URL hash, URL parameters, and parameters set on the localsite.js include&nbsp;file.  

**loadMarkdown** - Pulls readme files into html and converts links and image tags based on folder levels. Also reads YAML/JSON from top.  

**lazy class** - Sometimes it's good to be lazy. This class waits to load images until just before they scroll into view.  

**localObject** - Share client-side datasets using state and county geo id's based on 2-digit country codes followed by fips numbers.  

**tabulator** - Sortable tables rendered quickly from datasets with 100,000+ rows. <a href="../info/data/">data samples</a>

