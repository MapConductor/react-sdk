#!/usr/bin/env node
//
// 公開 API サーフェスのスナップショット。
//
// ドライバー層の共通化中、アプリ開発者向けの公開 API を凍結し続けるための門番。
// android-sdk/gradle/api-surface.gradle.kts（apiDump / apiCheck）と
// ios-sdk/scripts/api-surface.sh の React 版で、記録するファイルの置き場所も同じ
// （<package>/api/<package>.api.d.ts）。
//
//   node scripts/api-surface.mjs dump  [package...]   ベースラインを書き出す
//   node scripts/api-surface.mjs check [package...]   差分があれば失敗する
//
// ## 何を読むか
//
// tsup が吐く `dist/index.d.ts`。これがアプリ開発者から見える型そのもの。
//
// ## ドライバー実装点の除外
//
// `/** @internal */` が付いた宣言は記録しない。android の
// `@InternalMapConductorApi`、iOS の `@_spi(MapConductorDriver)` に対応する。
//
// **stripInternal は使わない。** 有効にすると `dist/index.d.ts` から消えてしまい、
// 別パッケージであるプロバイダ（react-for-*）が型検査できなくなる。
// android が「注釈は出力に残し、スナップショット側で読み飛ばす」形にしているのと
// 同じ理由で、ここでも除外はこのスクリプトの中だけで行う。

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/** スナップショットを取るパッケージ。ディレクトリ名がそのまま記録名になる。 */
const PACKAGES = [
  "js-sdk-core",
  "js-sdk-react",
  "react-icons",
  "react-for-googlemaps",
  "react-for-maplibre",
  "react-for-mapbox",
  "react-for-leaflet",
  "react-for-openlayers",
  "react-for-arcgis",
  "react-for-mapkit",
  "react-for-azuremaps",
  "react-for-cesium",
  "react-for-here",
  "react-for-tomtom",
  "react-for-maptiler",
  "react-for-longdo",
  "react-for-mappls",
  "reactnative-for-googlemaps",
  "reactnative-for-maplibre",
  "reactnative-for-arcgis",
  "reactnative-for-longdo",
  "reactnative-for-maptiler",
  "reactnative-for-tomtom",
  "reactnative-for-mapbox",
  "react-geojson",
  "react-kml",
  "react-heatmap",
  "react-marker-clustering",
];

/**
 * `/** @internal *\/` が付いた宣言を落とす。
 *
 * .d.ts は 1 宣言 1 ブロックで整形されているので、
 * 「@internal を含む JSDoc → 続く宣言（波括弧が閉じるまで、無ければ 1 行）」を
 * まとめて捨てれば足りる。
 */
function stripInternalDeclarations(source) {
  const lines = source.split("\n");
  const kept = [];

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];

    if (line.trimStart().startsWith("/**")) {
      // JSDoc ブロックの終わりを探す。
      let end = i;
      while (end < lines.length && !lines[end].includes("*/")) end += 1;
      const block = lines.slice(i, end + 1).join("\n");

      if (/@internal\b/.test(block)) {
        // ブロックの次の行から宣言本体を読み飛ばす。
        let j = end + 1;
        let depth = 0;
        let started = false;
        for (; j < lines.length; j += 1) {
          for (const ch of lines[j]) {
            if (ch === "{") {
              depth += 1;
              started = true;
            } else if (ch === "}") {
              depth -= 1;
            }
          }
          if (started && depth <= 0) break;
          if (!started) break; // 波括弧を持たない 1 行宣言
        }
        i = j;
        continue;
      }
    }

    kept.push(line);
  }

  return kept.join("\n").replace(/\n{3,}/g, "\n\n");
}

function generateSurface(pkg) {
  const declaration = join(ROOT, pkg, "dist", "index.d.ts");
  if (!existsSync(declaration)) {
    throw new Error(`dist/index.d.ts がありません: ${pkg}（先に npm run build が必要）`);
  }
  return stripInternalDeclarations(readFileSync(declaration, "utf8"));
}

function baselineOf(pkg) {
  return join(ROOT, pkg, "api", `${pkg}.api.d.ts`);
}

function build(packages) {
  const args = ["run", "build", "--if-present"];
  for (const pkg of packages) {
    const manifest = JSON.parse(readFileSync(join(ROOT, pkg, "package.json"), "utf8"));
    args.push("--workspace", manifest.name);
  }
  execFileSync("npm", args, { cwd: ROOT, stdio: "inherit" });
}

function main() {
  const [action, ...rest] = process.argv.slice(2);
  if (action !== "dump" && action !== "check") {
    console.error("usage: node scripts/api-surface.mjs {dump|check} [package...]");
    process.exit(2);
  }

  const packages = (rest.length > 0 ? rest : PACKAGES).filter((pkg) =>
    existsSync(join(ROOT, pkg, "package.json")),
  );

  build(packages);

  let failed = false;
  for (const pkg of packages) {
    process.stdout.write(`==> ${pkg}\n`);
    let actual;
    try {
      actual = generateSurface(pkg);
    } catch (error) {
      console.error(`  ! ${error.message}`);
      failed = true;
      continue;
    }

    const baseline = baselineOf(pkg);
    if (action === "dump") {
      mkdirSync(dirname(baseline), { recursive: true });
      writeFileSync(baseline, actual);
      console.log(`  wrote ${actual.split("\n").length} lines`);
      continue;
    }

    if (!existsSync(baseline)) {
      console.error(`  ! ベースラインがありません: ${baseline}（先に dump が必要）`);
      failed = true;
      continue;
    }
    if (readFileSync(baseline, "utf8") !== actual) {
      const tmp = join(ROOT, pkg, "dist", "api-surface.actual.d.ts");
      writeFileSync(tmp, actual);
      try {
        execFileSync("diff", ["-u", baseline, tmp], { stdio: "inherit" });
      } catch {
        /* diff は差分があると非ゼロで終わる。出力は既に出ている。 */
      }
      console.error(`  ! 公開 API が変わりました。意図した変更なら node scripts/api-surface.mjs dump ${pkg}`);
      failed = true;
    } else {
      console.log("  ok");
    }
  }

  process.exit(failed ? 1 : 0);
}

main();
