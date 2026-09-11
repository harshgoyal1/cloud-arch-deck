// One-page architecture: AWS services plus open-source components, with a numbered path.
//
//   python ../scripts/icons.py aws AWSLambda AmazonSimpleStorageService AmazonVPCEndpoints AmazonBedrock
//   python ../scripts/icons.py oss kubernetes postgresql kong redis
//   npm install pptxgenjs && node 01_architecture.js
const pptx = require("pptxgenjs");
const kit = require("../scripts/deck_kit.js");

const p = new pptx(); p.layout = "LAYOUT_WIDE";
const k = kit.bind(p, { logo: "../assets/logo/ink.png", logoDark: "../assets/logo/white.png" });
const AWS = n => `icons/aws/png/${n}.png`;
const OSS = n => `icons/oss/png/${n}.png`;

const s = k.frame({
  title: "Order platform · technical architecture",
  badge: "AWS + OPEN SOURCE",
  sub: "One account per environment · private subnets only · no public endpoint on any workload · region eu-west-1",
});

k.rail(s, 0.32, 0.92, 1.62, 2.95, "PLATFORM RUNTIME", [
  [OSS("kubernetes"), "EKS", "managed node groups"],
  [AWS("AWSLambda"), "Lambda", "event handlers"],
  [OSS("kong"), "Kong ingress", "north-south edge"],
  [AWS("AmazonVPCEndpoints"), "VPC endpoints", "no internet path"],
]);

const CX = 2.06, CW = 9.22;
k.group(s, CX, 0.92, CW, 0.86, "Channels", "web · mobile · partner API");
k.tileRow(s, CX, 0.92, CW, 0.86, [
  { icon: OSS("kubernetes"), t: "Web app", sub: "container, autoscaled", n: 1 },
  { icon: AWS("AWSLambda"), t: "API handlers", sub: "per-route functions", n: 2 },
  { t: "Partner gateway", mark: "PG", sub: "mTLS, rate limited" },
]);

k.group(s, CX, 1.94, CW, 0.86, "Services", "one service per bounded context");
k.tileRow(s, CX, 1.94, CW, 0.86, [
  { t: "Catalogue", mark: "CA", sub: "read-heavy, cached" },
  { t: "Orders", mark: "OR", sub: "transactional", n: 3 },
  { t: "Fulfilment", mark: "FU", sub: "queue-driven" },
  { t: "Notifications", mark: "NO", sub: "fan-out" },
]);

k.group(s, CX, 2.96, CW, 0.86, "Data", "private subnets, encrypted at rest");
k.tileRow(s, CX, 2.96, CW, 0.86, [
  { icon: OSS("postgresql"), t: "PostgreSQL", sub: "primary + read replica", n: 4 },
  { icon: AWS("AmazonSimpleStorageService"), t: "Object store", sub: "versioned, lifecycle" },
  { icon: OSS("redis"), t: "Cache", sub: "session and hot reads" },
]);

k.providerBand(s, 4.05,
  "PROVIDER   ·   Amazon Bedrock (eu-west-1)   |   managed PostgreSQL   |   S3 with object lock",
  "Verify model and instance availability in the target region before design freeze.");
k.flowLegend(s, 4.62, ["user request", "API handler", "service", "data read", "response"]);
k.band(s, 4.95, "HONEST TRADE-OFF",
  "Managed services carry the failover and the patching; the cost is metered and the exit story is data export rather than portable components. Put the trade-off on every approach slide — an option with no stated cost reads as a sales pitch.");

k.save("out/01-architecture.pptx");
