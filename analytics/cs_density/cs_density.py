# analytics/cs_density/cs_density.py
# v0: read sample CSVs, compute jobs per 1,000 residents, export CSV + simple HTML
from pathlib import Path
import pandas as pd
import matplotlib.pyplot as plt

# .../localsite/public/reports
CS_DIR = Path(__file__).resolve().parent   # ...\localsite\analytics\cs_density
# REPO   = CS_DIR.parents[2]               # <-- wrong: this points to C:\Users\Sampreethi Bokka
REPO   = CS_DIR.parents[1]                 # <-- correct: this is ...\localsite
DATA   = CS_DIR / "data"
OUT    = CS_DIR / "out"
REPORT = REPO / "public" / "reports"

OUT.mkdir(parents=True, exist_ok=True)
REPORT.mkdir(parents=True, exist_ok=True)

# 1) load data
pop = pd.read_csv(DATA / "sample_population_county.csv", dtype={"county_fips": str})
emp = pd.read_csv(DATA / "sample_employment_county.csv", dtype={"county_fips": str})

# 2) join + compute density
df = pop.merge(emp, on="county_fips", how="inner")
df["density_per_1k"] = (df["employment_5415"] / df["population"]) * 1000

# 3) export CSV
out_csv = OUT / "county_density.csv"
df.to_csv(out_csv, index=False)

# 4) chart -> PNG + minimal HTML
png_path  = REPORT / "cs_density.png"
html_path = REPORT / "cs_density.html"

plt.figure()
df.sort_values("density_per_1k", ascending=False).plot(x="county_name", y="density_per_1k", kind="bar")
plt.title("CS Job Density (NAICS 5415) per 1,000 residents — sample v0")
plt.ylabel("jobs per 1,000"); plt.xlabel("")
plt.tight_layout()
plt.savefig(png_path)
plt.close()

html = f"""<!doctype html>
<html><head><meta charset="utf-8"><title>CS Job Density (v0)</title></head>
<body>
<h2>CS Job Density (sample) — jobs per 1,000 residents</h2>
<p>Exported CSV: <code>{out_csv.name}</code></p>
<img src="cs_density.png" alt="chart" />
</body></html>
"""
html_path.write_text(html, encoding="utf-8")

print("Wrote:", out_csv)
print("Report:", html_path)
