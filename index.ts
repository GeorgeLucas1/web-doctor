#!/usr/bin/env bun

import { cac } from "cac";
import pc from "picocolors";
import { scanDirectory } from "./src/scanner";
import parseCssToAst from "./src/css/parseCssToAst";
import calcCssPoints from "./src/css/calcCssPoints";
import parseJsToAst from "./src/js/parseJsToAst";
import calcJsPoints from "./src/js/calcJsPoints";
import parseHtmlToDom from "./src/html/parseHtmlToDom";
import calcHtmlPoints from "./src/html/calcHtmlPoints";

const cli = cac("web-doctor");

cli
  .command("[dir]", "Scan a directory for HTML, CSS, and JS files.")
  .action(async dir => {
    const targetDir = dir || ".";

    console.log(pc.bgGreen(pc.black("Web Doctor")));
    console.log(pc.cyan(`\nStarting the diagnosis in the directory: ${targetDir}\n`));

		try {
			const files = await scanDirectory(targetDir);

			if (files.length === 0) {
				console.log(pc.red("No HTML, CSS, or JS files were found to parse."));
				return;
			}

			console.log(pc.green(`Found ${files.length} files for analysis:`));

			for (const f of files) {
				try {
					if (f.endsWith('.js')) {
						const jsAst = await parseJsToAst(f);
						const resultPointsJs = calcJsPoints(jsAst);
						console.log(
							`${pc.cyan('📄 ' + f)} -> ${formatPoints(resultPointsJs)}`
						);
					} else if (f.endsWith('.css')) {
						const cssAst = await parseCssToAst(f);
						const resultPointsCss = calcCssPoints(cssAst);
						console.log(
							`${pc.cyan('🎨 ' + f)} -> ${formatPoints(resultPointsCss)}`
						);
					} else if (f.endsWith('.html')) {
						const htmlDom = await parseHtmlToDom(f);
						const resultPointsHtml = calcHtmlPoints(htmlDom);
						console.log(
							`${pc.cyan('🎨 ' + f)} -> ${formatPoints(resultPointsHtml)}`
						);
					}
				} catch (e) {
					console.log(pc.red(`\n❌ Failed to diagnose file: ${f}`));
				}
			}

			console.log(pc.yellow("\nAnalyzing health rules..."));
		} catch (e) {
			console.error(pc.red("Error reading directory:"), e);
    }
  });

cli.help();
cli.version("0.1.0");
cli.parse();

function formatPoints(points: number) {
  if (points === 10) return pc.green(`${points}/10 (Healthy)`);
  if (points >= 5) return pc.yellow(`${points}/10 (Attention)`);
  return pc.red(`${points}/10 (Critical)`);
}
