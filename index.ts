#!/usr/bin/env bun

import { cac } from "cac";
import pc from "picocolors";
import { scanDirectory } from "./src/scanner";
import parseCssToAst from "./src/css/parseCssToAst";
import calcCssPoints from "./src/css/calcCssPoints";
import parseJsToAst from "./src/js/parseJsToAst";
import calcJsPoints from "./src/js/calcJsPoints";

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
				console.log(f);

				if (f.endsWith('.js')) {
					const jsAst = await parseJsToAst(f);
					const resultPointsJs = calcJsPoints(jsAst);
					console.log('JS Points:', resultPointsJs);
				}

				if (f.endsWith('.css')) {
					const cssAst = await parseCssToAst(f);
					const resultPointsCss = calcCssPoints(cssAst);
					console.log('CSS Points:', resultPointsCss)
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
