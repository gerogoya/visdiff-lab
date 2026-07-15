export const PAGE_COUNT = 50;

const topics = [
  "Admissions", "Campus Life", "Events", "Support", "Library",
  "Research", "Alumni", "Careers", "Wellness", "News"
];

export const pages = Array.from({ length: PAGE_COUNT }, (_, index) => {
  const number = index + 1;
  const padded = String(number).padStart(2, "0");
  const topic = topics[index % topics.length];
  return {
    number,
    slug: `page-${padded}`,
    title: `${topic} Page ${padded}`,
    topic,
    summary: `Sample ${topic.toLowerCase()} content for visual regression testing page ${padded}.`,
    image: `/assets/lab-${(index % 4) + 1}.svg`,
    accent: ["teal", "blue", "rose", "amber", "green"][index % 5]
  };
});

export const scenarios = [
  { id: "baseline", label: "Baseline" },
  { id: "missing-menu", label: "Missing menu" },
  { id: "missing-footer", label: "Missing footer" },
  { id: "no-images", label: "No images" },
  { id: "large-images", label: "Large images" },
  { id: "text-change", label: "Text changed" },
  { id: "broken-mobile", label: "Broken mobile" },
  { id: "animation-on", label: "Animation on" },
  { id: "layout-shift", label: "Layout shift" },
  { id: "deactivated-pages", label: "Some pages disabled" },
  { id: "mixed-regression", label: "Mixed regression" }
];

const scenarioMap = new Map(scenarios.map((scenario) => [scenario.id, scenario]));

export function getPageBySlug(slug) {
  return pages.find((page) => page.slug === slug);
}

export function scenarioExists(scenarioId) {
  return scenarioMap.has(scenarioId);
}

export function resolveScenarioConfig(scenarioId, query = {}, page = null) {
  const params = normalizeQuery(query);
  const config = {
    hideMenu: false,
    hideFooter: false,
    hideImages: false,
    largeImages: false,
    textChange: false,
    breakMobile: false,
    animate: false,
    layoutShift: false,
    disabled: params.disabled === "1"
  };

  switch (scenarioId) {
    case "missing-menu":
      config.hideMenu = true;
      break;
    case "missing-footer":
      config.hideFooter = true;
      break;
    case "no-images":
      config.hideImages = true;
      break;
    case "large-images":
      config.largeImages = true;
      break;
    case "text-change":
      config.textChange = true;
      break;
    case "broken-mobile":
      config.breakMobile = true;
      break;
    case "animation-on":
      config.animate = true;
      break;
    case "layout-shift":
      config.layoutShift = true;
      break;
    case "deactivated-pages":
      config.disabled = page ? page.number % 10 === 0 : config.disabled;
      break;
    case "mixed-regression":
      config.hideFooter = true;
      config.largeImages = true;
      config.textChange = true;
      config.layoutShift = true;
      break;
    default:
      break;
  }

  [
    "hideMenu",
    "hideFooter",
    "hideImages",
    "largeImages",
    "textChange",
    "breakMobile",
    "animate",
    "layoutShift"
  ].forEach((key) => {
    if (params[key] === "1") config[key] = true;
    if (params[key] === "0") config[key] = false;
  });

  return config;
}

function normalizeQuery(query) {
  if (!query) return {};
  if (query instanceof URLSearchParams) return Object.fromEntries(query.entries());
  return query;
}
