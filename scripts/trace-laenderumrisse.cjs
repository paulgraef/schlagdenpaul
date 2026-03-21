#!/usr/bin/env node

const fs = require("node:fs/promises");
const path = require("node:path");
const potrace = require("potrace");

const ROOT = process.cwd();
const DEFAULT_INPUT_DIR = path.join(ROOT, "public", "media", "laenderumrisse", "raw");
const DEFAULT_OUTPUT_DIR = path.join(ROOT, "public", "media", "laenderumrisse");

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    inputDir: DEFAULT_INPUT_DIR,
    outputDir: DEFAULT_OUTPUT_DIR,
    threshold: 170,
    turdSize: 12,
    optTolerance: 0.35,
    keepNames: false
  };

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    const next = args[i + 1];

    if (arg === "--input" && next) {
      options.inputDir = path.resolve(ROOT, next);
      i += 1;
      continue;
    }

    if (arg === "--output" && next) {
      options.outputDir = path.resolve(ROOT, next);
      i += 1;
      continue;
    }

    if (arg === "--threshold" && next) {
      options.threshold = Number(next);
      i += 1;
      continue;
    }

    if (arg === "--turd-size" && next) {
      options.turdSize = Number(next);
      i += 1;
      continue;
    }

    if (arg === "--opt-tolerance" && next) {
      options.optTolerance = Number(next);
      i += 1;
      continue;
    }

    if (arg === "--keep-names") {
      options.keepNames = true;
    }
  }

  return options;
}

function traceFile(inputPath, options) {
  return new Promise((resolve, reject) => {
    potrace.trace(
      inputPath,
      {
        threshold: options.threshold,
        turdSize: options.turdSize,
        optTolerance: options.optTolerance,
        turnPolicy: potrace.Potrace.TURNPOLICY_MINORITY,
        color: "#111111",
        background: "transparent"
      },
      (error, svg) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(svg);
      }
    );
  });
}

function toSequentialName(index) {
  return `item-${String(index).padStart(2, "0")}.svg`;
}

function toBaseName(fileName) {
  const parsed = path.parse(fileName).name;
  const safe = parsed
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return `${safe || "item"}.svg`;
}

async function run() {
  const options = parseArgs();

  await fs.mkdir(options.outputDir, { recursive: true });
  await fs.mkdir(options.inputDir, { recursive: true });

  const allEntries = await fs.readdir(options.inputDir, { withFileTypes: true });
  const files = allEntries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => /\.(png|jpg|jpeg|webp)$/i.test(name))
    .sort((a, b) => a.localeCompare(b, "de"));

  if (!files.length) {
    console.log(`Keine Bilddateien gefunden in: ${options.inputDir}`);
    console.log("Erwarte z. B. .png, .jpg, .jpeg oder .webp");
    return;
  }

  console.log(`Konvertiere ${files.length} Datei(en) nach SVG...`);

  for (let index = 0; index < files.length; index += 1) {
    const fileName = files[index];
    const inputPath = path.join(options.inputDir, fileName);
    const outputName = options.keepNames ? toBaseName(fileName) : toSequentialName(index + 1);
    const outputPath = path.join(options.outputDir, outputName);

    const svg = await traceFile(inputPath, options);
    await fs.writeFile(outputPath, svg, "utf8");

    console.log(`✔ ${fileName} -> ${path.relative(ROOT, outputPath)}`);
  }

  console.log("Fertig.");
}

run().catch((error) => {
  console.error("Fehler bei der SVG-Erstellung:", error);
  process.exit(1);
});
