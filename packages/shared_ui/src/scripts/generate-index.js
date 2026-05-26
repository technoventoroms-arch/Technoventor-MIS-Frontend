const fs = require("fs");
const path = require("path");

const SRC_DIR = path.resolve(__dirname, ".."); // e.g., /project/src

// Optional: folders to ignore
const IGNORED_FOLDERS = ["scripts", "__tests__", "__mocks__"];
const IGNORED_FILES = ["vite-env.d.ts"];

function isTsFile(file) {
  return (
    (file.endsWith(".ts") || file.endsWith(".tsx")) &&
    file !== "index.ts" &&
    !IGNORED_FILES.includes(file)
  );
}

const allIndexPaths = [];
const topLevelExports = [];

/**
 * Recursively generates index.ts in folders and tracks them
 */
function generateIndexForFolder(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const exports = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      if (!IGNORED_FOLDERS.includes(entry.name)) {
        generateIndexForFolder(fullPath);
      }
    } else if (entry.isFile() && isTsFile(entry.name)) {
      const nameWithoutExt = path.parse(entry.name).name;
      exports.push(`export * from './${nameWithoutExt}';`);

      // Track top-level .ts/.tsx files (in SRC_DIR)
      if (dirPath === SRC_DIR) {
        topLevelExports.push(`export * from './${nameWithoutExt}';`);
      }
    }
  }

  if (exports.length > 0) {
    const indexPath = path.join(dirPath, "index.ts");
    fs.writeFileSync(indexPath, exports.join("\n") + "\n");
    allIndexPaths.push(indexPath);
    console.log(`✅ Wrote index.ts in ${dirPath}`);
  }
}

/**
 * Create root index.ts combining top-level exports + deep folders
 */
function generateMainIndexFile() {
  const exports = [...topLevelExports];

  for (const indexPath of allIndexPaths) {
    const relativeDir = path.relative(SRC_DIR, path.dirname(indexPath));
    if (relativeDir !== "") {
      exports.push(`export * from './${relativeDir.replace(/\\/g, "/")}';`);
    }
  }

  const rootIndexPath = path.join(SRC_DIR, "index.ts");
  fs.writeFileSync(rootIndexPath, exports.join("\n") + "\n");
  console.log(`✅ Wrote root index.ts in ${SRC_DIR}`);
}

generateIndexForFolder(SRC_DIR);
generateMainIndexFile();
