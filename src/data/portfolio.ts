// Single source of truth for portfolio content.

export const PERSON = {
  name: "Jaslam Poolakkal",
  title: "PhD",
  role: "Lead Data Scientist · Forest Biometrics",
  org: "Intermountain Forestry Cooperative · University of Idaho",
  email: "jaslampk@uidaho.edu",
  location: "Moscow, Idaho",
  links: {
    linkedin: "https://www.linkedin.com/in/jaslampk/",
    scholar: "https://scholar.google.co.in/citations?user=arO7QMUAAAAJ&hl=en",
    researchgate: "https://www.researchgate.net/profile/Muhammed-P-K-2",
    cv: "https://5361daaa-9b81-4a19-9494-4249648ebec0.filesusr.com/ugd/e61ec6_391403cc6b76405caf09fceb8992ab4f.pdf",
  },
};

export const STATS = [
  { value: "22", label: "Peer-reviewed publications", sub: "Springer · MDPI · BMC · IOS Press" },
  { value: "$900K+", label: "Grants secured", sub: "USDA · USFS · NSF-IUCRC · NCASI" },
  { value: "48", label: "US states modeled", sub: "Continental coverage" },
  { value: "10+", label: "Years of research", sub: "Statistics → AI → forestry" },
];

export const TOOLS = [
  {
    id: "digital-forestry-engine",
    name: "Digital Forestry Engine",
    tagline: "An operating system for the forest.",
    problem:
      "Forest managers juggle disconnected inventories, LiDAR, and growth models — losing time and signal.",
    method:
      "A unified runtime that ingests LiDAR, NAIP imagery, and field plots, runs growth & yield, site, and carrying-capacity models, and serves outputs through dashboards and APIs.",
    output: "Stand-level metrics, site indices, biomass surfaces, and decision dashboards.",
    impact:
      "Deployed across the Inland Northwest cooperative; mentors statewide decisions on stocking, harvest, and reforestation.",
    chips: ["Python", "ArcPy", "Plotly Dash", "TensorFlow", "PostGIS"],
  },
  {
    id: "sdimax",
    name: "SDImax",
    tagline: "Maximum stand density, modeled at scale.",
    problem:
      "SDImax has historically been a textbook constant — but it varies by species, site, and climate.",
    method:
      "Bayesian boundary-line regression on regional FIA plots, conditioned on site index and remote-sensing covariates.",
    output: "Continuous SDImax surfaces for the western US conifer types.",
    impact:
      "Adopted as the carrying-capacity baseline in two cooperative-wide silviculture planning tools.",
    chips: ["R", "Stan", "FIA", "Remote Sensing"],
  },
  {
    id: "rg-trial",
    name: "Realized Gain Trial Dashboard",
    tagline: "Tracking genetic gain in real-time.",
    problem:
      "Genetic gain trials produce decades of measurements that rarely make it into operational decisions.",
    method:
      "Interactive dashboard combining mixed-effects models, spatial blocks, and survival curves; auto-syncs with trial databases.",
    output: "Family-level gain estimates, mortality maps, and ranking reports.",
    impact: "Used by tree improvement cooperatives in three regions.",
    chips: ["R Shiny", "lme4", "Plotly"],
  },
  {
    id: "forest-site-type",
    name: "FOREST Site Type Tool",
    tagline: "Stratifying the landscape, intelligently.",
    problem:
      "Traditional site classification is slow, subjective, and breaks at scale.",
    method:
      "Unsupervised clustering of topo-edaphic + LiDAR-derived covariates, validated against expert plots.",
    output: "Wall-to-wall site type maps at 10m resolution.",
    impact: "Informs species selection and silvicultural prescriptions for cooperative members.",
    chips: ["ArcGIS Pro", "Python", "scikit-learn", "LiDAR"],
  },
  {
    id: "carrying-capacity",
    name: "Forest Carrying Capacity Models",
    tagline: "What the land can grow, where, and when.",
    problem:
      "Carrying capacity estimates are usually static and regional — masking local opportunity.",
    method:
      "Geospatial models blending climate, soils, topography, and LiDAR canopy structure.",
    output: "Site-specific carrying capacity rasters across the Inland Northwest.",
    impact: "Funded by NSF-IUCRC CAFS; used in 4-state planning workflows.",
    chips: ["GeoPandas", "Rasterio", "scikit-learn"],
  },
];

export const PROJECTS = TOOLS; // alias for now — projects mirror flagship tools

export const TIMELINE = [
  {
    year: "2024 — Present",
    title: "Research Scientist II",
    org: "Intermountain Forestry Cooperative · University of Idaho",
    body: "Lead Data Scientist — research deliverables for cooperative stakeholders, grant writing, mentoring graduate students.",
  },
  {
    year: "2022 — 2024",
    title: "Postdoctoral Researcher",
    org: "University of Idaho",
    body: "Led the National Center for Advanced Forestry Systems effort to build geospatial forest carrying-capacity models, dashboards, and LiDAR processing for forest-resource mapping & monitoring.",
  },
  {
    year: "2021 — 2022",
    title: "Data Scientist",
    org: "CyborgIntell Pvt. Ltd, Bangalore",
    body: "Model explainability for black-box / neural networks, automatic outlier detection, premium-collection forecasting, cross-sell, credit-risk & customer-acquisition modeling.",
  },
  {
    year: "2017 — 2021",
    title: "PhD, Statistics",
    org: "CCS Haryana Agricultural University",
    body: "Small-area estimation of crop yield using remote-sensing data.",
  },
  {
    year: "2015 — 2017",
    title: "MSc, Agricultural Statistics",
    org: "Kerala Agricultural University",
    body: "Profit-maximization model for Kerala homesteads.",
  },
];

export const PUBLICATIONS = [
  {
    t: "EBLUP estimate of crop yield at sub-district level using MODIS/Terra data",
    a: "Jaslam et al.",
    j: "Current Science",
    y: 2020,
    topic: "Remote Sensing",
    featured: true,
  },
  {
    t: "Geologic soil parent-material influence on forest surface-soil chemistry in the Inland Northwest, USA",
    a: "Moore, J.A. et al.",
    j: "Forests (MDPI)",
    y: 2022,
    topic: "Forestry",
    featured: true,
    if: 2.9,
  },
  {
    t: "Diversity structure analysis based on hierarchical clustering method",
    a: "Jaslam et al.",
    j: "AIP Conference Proceedings",
    y: 2022,
    topic: "Statistics",
  },
  {
    t: "Analysis of unit-level models for small-area estimation in crop statistics with satellite auxiliary information",
    a: "Jaslam et al.",
    j: "Model Assisted Statistics & Applications",
    y: 2023,
    topic: "Statistics",
    featured: true,
  },
  {
    t: "Association mapping of drought tolerance and agronomic traits in rice landraces",
    a: "Beena, R. et al.",
    j: "BMC Plant Biology",
    y: 2021,
    topic: "Genomics",
    if: 4.2,
  },
  {
    t: "Machine learning for forest carrying capacity across the Inland Northwest",
    a: "Poolakkal, J. et al.",
    j: "Forest Ecology and Management",
    y: 2024,
    topic: "Machine Learning",
    featured: true,
  },
];

export const GRANTS = [
  { role: "PI", src: "USFS-FIA / NCASI / CAFS", years: "2024–2026", title: "Robust small-area estimation strategies for accurate stand-level diameter distributions", amount: "$180K" },
  { role: "Co-PI", src: "USDA-NRCS", years: "2024–2026", title: "NRCS Soils2026 Digital Forestry — site index from 3D-NAIP & 3DEP LiDAR", amount: "$350K" },
  { role: "Key Personnel", src: "USDA Forest Service, PNW", years: "2024–2028", title: "Site-specific stand management best practices", amount: "$224K" },
  { role: "Key Personnel", src: "NSF-IUCRC, CAFS", years: "2022–2024", title: "Mapping regional variation in potential site carrying capacity", amount: "$150K" },
];

export const SKILL_CLUSTERS = [
  { label: "Statistics", items: ["Small-area estimation", "Mixed models", "Bayesian inference", "Design of experiments"] },
  { label: "Machine Learning", items: ["Supervised/unsupervised", "Deep learning", "NLP", "Model explainability"] },
  { label: "Geospatial", items: ["ArcGIS Pro", "ArcPy", "PostGIS", "GeoPandas", "Rasterio"] },
  { label: "Remote Sensing", items: ["LiDAR processing", "NAIP/Sentinel", "ERDAS", "ENVI"] },
  { label: "Forestry", items: ["Biometrics", "Growth & yield", "Carrying capacity", "Carbon · REDD+"] },
  { label: "Programming", items: ["Python", "R", "SAS", "SPSS", "Stata", "TensorFlow"] },
];
