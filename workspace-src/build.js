// node workspace-src/build.js → ../workspace/index.html (single self-contained file)
const fs = require("fs"), path = require("path");
const src = fs.readFileSync(path.join(__dirname, "index.src.html"), "utf8");
const engine = fs.readFileSync(path.join(__dirname, "engine.js"), "utf8");
const out = src.replace("/*ENGINE*/", () => engine);
const dir = path.join(__dirname, "..", "workspace");
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, "index.html"), out);
console.log("built", path.join(dir, "index.html"), out.length, "bytes");
