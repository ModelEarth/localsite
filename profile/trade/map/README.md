# Exiobase Trade Flow Charts — trade/map/

Interactive environmental impact visualizations for industry-to-industry trade flows using [EXIOBASE 3](https://exiobase.eu) data. Part of [ModelEarth/projects Issue #65](https://github.com/modelearth/projects/issues/65).

[View Sankey Trade Flow](../../charts/sankey/)

---

## Files

| File | Status | Description |
|------|--------|-------------|
| `sankey.html` | ✅ Complete | Apache eCharts Sankey — industry trade flows |
| `index.html` | 🚧 Prototype | Leaflet trade flow map (hardcoded dummy data) |
| `index-numbers.html` | 🚧 Draft | Numbers-based trade view |

---

## sankey.html

An interactive [Apache eCharts](https://echarts.apache.org/) Sankey diagram showing embodied environmental flows between global industries for the World (WM) aggregate region, 2022 baseline.

**Live data fetch:** No build step required. The chart fetches CSV directly from GitHub at load time:
```
https://raw.githubusercontent.com/ModelEarth/trade-data/main/year/2022/WM/domestic/trade_impact.csv
```

### Features
- **Indicator toggle** — switch between CO₂ Emissions, Water Use, Employment, and Trade Amount
- **Top-N slider** — show the 5–50 highest-value flows (default: top 20)
- **Hover tooltips** — source industry → target industry + formatted value
- **Focus on adjacency** — hover a node to highlight all its connected flows
- **Readable labels** — raw Exiobase sector codes (e.g. `ELEC2`, `CEMEN`) mapped to full names

### How to view locally
```bash
# From the repo root (requires a local server for localsite.js markdown fetching)
python -m http.server 8887
# Open: http://localhost:8887/trade/map/sankey.html
#
# The eCharts Sankey and CSV fetch work immediately without localsite.
# The ModelEarth header only renders if localsite is cloned as a sibling folder.
```

### Extending to other countries/years

The CSV path follows this pattern in [ModelEarth/trade-data](https://github.com/ModelEarth/trade-data):
```
year/{YEAR}/{REGION}/domestic/trade_impact.csv
```

To show a different region or year, change the `CSV_URL` constant at the top of `sankey.html`:
```js
// Example: Germany, 2021
const CSV_URL =
  "https://raw.githubusercontent.com/ModelEarth/trade-data/main/year/2021/DE/domestic/trade_impact.csv";
```

Available region codes follow ISO 3166-1 alpha-2 (e.g. `US`, `CN`, `DE`, `IN`) plus `WM` for World aggregate.

### Data columns used

| Column | Used for |
|--------|----------|
| `industry1` | Sankey source node |
| `industry2` | Sankey target node |
| `CO2_total` | CO₂ indicator (raw units, scaled ÷1e12 for display) |
| `Water_total` | Water indicator (scaled ÷1e9) |
| `Employment_total` | Employment indicator (scaled ÷1e6) |
| `amount` | Trade amount in USD (scaled ÷1e6) |

Full column list: `trade_id, year, region1, region2, industry1, industry2, amount, total_level, factor_count, unique_factors, air_emissions, employment, material, water, CO2_total, Water_total, Employment_total, impact_intensity`

---

## TODO (from Issue #65)

| Chart | Status | Notes |
|-------|--------|-------|
| **Sankey (eCharts)** | ✅ Done | `sankey.html` — this file |
| **Trade Flow Map** | 🔲 TODO | Geographic Leaflet map; `index.html` has a prototype with hardcoded data. Needs real country-pair flows (region1 ≠ region2 data from trade-data) |
| **Chord Diagram (D3)** | 🔲 TODO | `charts/d3/chord-diagram/` exists for USEEIO; needs an Exiobase version using bilateral region data |

---

## Data sources

- **EXIOBASE 3** — [exiobase.eu](https://exiobase.eu) — Multi-regional input-output database covering 44 countries, 163 industry sectors, with embodied CO₂, water, and employment impacts
- **ModelEarth/trade-data** — [github.com/ModelEarth/trade-data](https://github.com/ModelEarth/trade-data) — Preprocessed CSV pipeline from EXIOBASE raw data
- **Issue tracker** — [ModelEarth/projects #65](https://github.com/modelearth/projects/issues/65)
