// Titles and briefs of the 20 Pro system design cases. The full walk-throughs live in Pro storage (design.json),
// built from the private repo (design/NN-slug.md). Generated: do not edit by hand.
export const DESIGN_CASES = [
 {
  "slug": "clickstream-analytics",
  "n": 1,
  "title": "Clickstream analytics for a shopping app",
  "level": "Mid to senior",
  "domain": "E-commerce",
  "tags": [
   "batch",
   "streaming",
   "lakehouse",
   "sessionisation"
  ],
  "brief": "\"Our shopping app has 15 million daily users. Product managers want funnels (view → cart → checkout → order), conversion by channel, and a live dashboard of the last 15 minutes during sales. Design the data platform for this.\""
 },
 {
  "slug": "upi-fraud-detection",
  "n": 2,
  "title": "Real-time fraud detection for UPI payments",
  "level": "Senior",
  "domain": "Payments",
  "tags": [
   "streaming",
   "stateful",
   "feature store",
   "low latency"
  ],
  "brief": "\"We are a payments app processing 30 million UPI payments a day. Risk wants every payment scored for fraud before it completes, and suspicious ones held or stepped-up (extra PIN or OTP). Design the data side.\""
 },
 {
  "slug": "food-delivery-live-tracking",
  "n": 3,
  "title": "Live order tracking and ETA for food delivery",
  "level": "Senior",
  "domain": "Delivery",
  "tags": [
   "streaming",
   "geospatial",
   "state",
   "real time"
  ],
  "brief": "\"A food delivery app does 2 million orders a day with 200,000 delivery partners online at peak. Customers see their rider moving on a map and an ETA that updates. Ops wants a live view of delays per zone, and data science wants history to improve ETAs. Design it.\""
 },
 {
  "slug": "cdc-oltp-to-lakehouse",
  "n": 4,
  "title": "CDC from a core OLTP database into a lakehouse",
  "level": "Mid to senior",
  "domain": "Banking",
  "tags": [
   "cdc",
   "debezium",
   "merge",
   "scd2"
  ],
  "brief": "\"A bank's core system runs on PostgreSQL: 300 tables, the biggest with 2 billion rows, about 50 million changes a day. Analytics today copies full tables every night and it now takes 9 hours. Build a pipeline that keeps the lakehouse within 15 minutes of the source, with history for some tables.\""
 },
 {
  "slug": "retail-sales-warehouse",
  "n": 5,
  "title": "Sales data warehouse for a retail chain",
  "level": "Mid",
  "domain": "Retail",
  "tags": [
   "dimensional modelling",
   "scd2",
   "batch",
   "bi"
  ],
  "brief": "\"A retail chain has 1,200 stores and an online shop, 40,000 products. Leadership wants daily sales, margin, stock cover and promotion performance by store, region, category and day, with history when a store changes region or a product changes category. Design the warehouse.\""
 },
 {
  "slug": "metrics-semantic-layer",
  "n": 6,
  "title": "One set of business metrics for the whole company",
  "level": "Senior",
  "domain": "Analytics platform",
  "tags": [
   "semantic layer",
   "dbt",
   "governance",
   "bi"
  ],
  "brief": "\"Finance, marketing and product each report 'revenue' and 'active users', and the numbers never match in the board meeting. Design a platform so every team and tool gets the same metric definitions.\""
 },
 {
  "slug": "smart-meter-iot-platform",
  "n": 7,
  "title": "IoT platform for one million smart meters",
  "level": "Senior",
  "domain": "Energy",
  "tags": [
   "iot",
   "time series",
   "streaming",
   "late data"
  ],
  "brief": "\"An electricity company is installing 1 million smart meters. Each sends a reading every 15 minutes. Billing needs accurate daily usage per meter, operations wants outage alerts within 5 minutes, and analysts want load forecasts by area. Design the data platform.\""
 },
 {
  "slug": "log-analytics-platform",
  "n": 8,
  "title": "Log analytics platform at 100 TB a day",
  "level": "Staff",
  "domain": "Platform",
  "tags": [
   "observability",
   "tiered storage",
   "search",
   "cost"
  ],
  "brief": "\"Our 3,000 microservices produce 100 TB of logs a day. Engineers search recent logs during incidents, security keeps a year for investigations, and the current vendor bill is out of control. Design an in-house log platform.\""
 },
 {
  "slug": "ml-feature-store",
  "n": 9,
  "title": "Feature store for machine learning",
  "level": "Senior",
  "domain": "ML platform",
  "tags": [
   "feature store",
   "point in time",
   "online serving",
   "training"
  ],
  "brief": "\"Our data science team has 15 models in production (recommendations, churn, credit limits). Every team builds its own features in notebooks, training numbers don't match production, and new models take months. Design a feature platform.\""
 },
 {
  "slug": "ad-click-attribution",
  "n": 10,
  "title": "Ad impressions, clicks and attribution",
  "level": "Senior",
  "domain": "Advertising",
  "tags": [
   "streaming",
   "dedupe",
   "exactly once",
   "billing"
  ],
  "brief": "\"Our ad network serves 2 billion impressions a day. Advertisers pay per click and want near-real-time dashboards; billing at month end must be exact. We also attribute app installs to the last click within 7 days. Design the pipeline.\""
 },
 {
  "slug": "customer-360-identity-resolution",
  "n": 11,
  "title": "Customer 360 with identity resolution",
  "level": "Senior",
  "domain": "Retail / financial services",
  "tags": [
   "master data",
   "entity resolution",
   "privacy",
   "dpdp"
  ],
  "brief": "\"We have customers in 6 systems: e-commerce, stores (loyalty), the app, a call centre CRM, a credit card partner and marketing email. About 80 million records, maybe 40 million real people. Build a single customer view for marketing and service, respecting consent and privacy law.\""
 },
 {
  "slug": "multi-tenant-saas-analytics",
  "n": 12,
  "title": "Customer-facing analytics for a multi-tenant SaaS",
  "level": "Senior to staff",
  "domain": "SaaS",
  "tags": [
   "multi-tenancy",
   "isolation",
   "embedded analytics",
   "olap"
  ],
  "brief": "\"We sell a SaaS product to 5,000 business customers. Each wants dashboards of their own usage inside our app, refreshed every few minutes, and big customers want a daily export into their own warehouse. Together they generate 2 billion events a day; the largest customer is 15% of that. Design it.\""
 },
 {
  "slug": "data-quality-observability",
  "n": 13,
  "title": "Data quality and observability for 2,000 tables",
  "level": "Senior to staff",
  "domain": "Platform",
  "tags": [
   "data quality",
   "observability",
   "lineage",
   "sla"
  ],
  "brief": "\"We have about 2,000 tables in the lakehouse, fed by 600 pipelines owned by 25 teams. Stakeholders find broken dashboards before we do. Design a data quality and observability platform so we catch problems first and know who to wake up.\""
 },
 {
  "slug": "warehouse-migration-to-lakehouse",
  "n": 14,
  "title": "Migrating an on-prem warehouse to a cloud lakehouse",
  "level": "Staff",
  "domain": "Banking / enterprise",
  "tags": [
   "migration",
   "teradata",
   "hadoop",
   "reconciliation",
   "cutover"
  ],
  "brief": "\"We run a 400 TB Teradata warehouse and a Hadoop cluster. There are 12,000 tables, 3,500 ETL jobs (Informatica and shell-wrapped BTEQ), and about 900 reports. The licence renews in 18 months. Plan and design the migration to a cloud lakehouse.\""
 },
 {
  "slug": "real-time-inventory",
  "n": 15,
  "title": "Real-time inventory across warehouses and stores",
  "level": "Senior",
  "domain": "Retail / e-commerce",
  "tags": [
   "streaming",
   "state",
   "event sourcing",
   "consistency"
  ],
  "brief": "\"We are an omnichannel retailer with 200 warehouses and 3,000 stores. The website oversells during sales, and store staff don't trust the stock numbers. Design a system that gives accurate, near-real-time stock per SKU per location for the website, store apps and replenishment.\""
 },
 {
  "slug": "regulatory-reporting-lineage",
  "n": 16,
  "title": "Regulatory reporting with lineage for a bank",
  "level": "Staff",
  "domain": "Banking",
  "tags": [
   "regulatory",
   "lineage",
   "reconciliation",
   "audit",
   "bcbs 239"
  ],
  "brief": "\"We are a mid-size bank. Every month we file about 200 regulatory returns to the central bank, built today from spreadsheets and SQL scripts owned by finance. Auditors keep asking 'where did this number come from?'. Design a reporting data platform that is accurate, on time and traceable.\""
 },
 {
  "slug": "rag-document-pipeline",
  "n": 17,
  "title": "Document pipeline for a RAG assistant",
  "level": "Senior",
  "domain": "AI platform",
  "tags": [
   "rag",
   "embeddings",
   "vector search",
   "chunking",
   "access control"
  ],
  "brief": "\"Our company wants an internal AI assistant that answers questions from our documents: policies, contracts, product manuals and wiki pages. There are about a million documents in SharePoint, Confluence and a file share, and they change daily. Design the data pipeline that keeps the assistant's search index correct, fresh and secure.\""
 },
 {
  "slug": "market-tick-data-candles",
  "n": 18,
  "title": "Market tick data and OHLC candles",
  "level": "Senior",
  "domain": "Capital markets / fintech",
  "tags": [
   "streaming",
   "time series",
   "event time",
   "windows"
  ],
  "brief": "\"We are a broking app. We receive the exchange tick feed for about 5,000 instruments, show live prices and 1-minute candles in the app, and our quants want full tick history for backtesting. Design the ingestion, candle computation and storage.\""
 },
 {
  "slug": "recommendation-data-pipeline",
  "n": 19,
  "title": "Data pipeline for product recommendations",
  "level": "Senior",
  "domain": "E-commerce / media",
  "tags": [
   "recommendations",
   "candidate generation",
   "feature pipelines",
   "batch + online"
  ],
  "brief": "\"Our shopping app has 30 million users and 1 million products. We want personalised recommendations on the home page and 'customers also bought' on product pages, updated as people browse. Design the data side: events, training data, candidate generation and serving.\""
 },
 {
  "slug": "ride-hailing-surge-pricing",
  "n": 20,
  "title": "Real-time supply and demand for ride-hailing surge pricing",
  "level": "Staff",
  "domain": "Mobility",
  "tags": [
   "geospatial",
   "streaming",
   "h3",
   "low latency",
   "experimentation"
  ],
  "brief": "\"We run a ride-hailing app in 50 Indian cities. Pricing wants a surge multiplier per area that reacts to supply and demand within a minute, and operations wants live heatmaps. Design the data pipeline that produces supply, demand and surge per area.\""
 }
]
