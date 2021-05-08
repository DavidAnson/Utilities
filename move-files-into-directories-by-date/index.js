#!/usr/bin/env node

// @ts-check

"use strict";

const fs = require("fs").promises;
const path = require("path");

(async () => {
  for (const dir of process.argv.slice(2)) {
    const files = await fs.readdir(dir);
    for (const fileName of files) {
      const source = path.join(dir, fileName);
      const stats = await fs.stat(source);
      if (stats.isFile() && !/^\./.test(fileName)) {
        const year = stats.mtime.getFullYear();
        const month = (stats.mtime.getMonth() + 1).toString().padStart(2, "0");
        const day = (stats.mtime.getDate()).toString().padStart(2, "0");
        const destdir = path.join(dir, `${year}-${month}-${day}`);
        try {
          await fs.stat(destdir);
        } catch (err) {
          await fs.mkdir(path.resolve(destdir));
        }
        const destination = path.join(destdir, fileName);
        console.log(`${source} -> ${destination}`);
        await fs.rename(path.resolve(source), path.resolve(destination));
      }
    }
  }
})();
