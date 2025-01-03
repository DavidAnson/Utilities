import { stat, utimes } from "node:fs/promises";
import { basename, dirname, extname, join } from "node:path";
import { argv } from "node:process";
import exifr from "exifr";

const normalize = (file) => join(dirname(file), basename(file, extname(file)));
const fileDates = new Map();

for (const file of argv.slice(2)) {
  const normalized = normalize(file);
  /** @type {Date} */
  let date = undefined;
  try {
    const values = await exifr.parse(file, [ "DateTimeOriginal", "CreateDate", "ModifyDate" ]);
    date = values.DateTimeOriginal || values.CreateDate || values.ModifyDate;
  } catch {
    // Handled below
  }
  if (!date && fileDates.has(normalized)) {
    date = fileDates.get(normalized);
  }
  if (date) {
    const stats = await stat(file);
    await utimes(file, stats.atime, date);
    fileDates.set(normalized, date);
    console.log(`${file}: ${date.toLocaleString()}`);
  } else {
    console.log(`${file}: [NO EXIF DATE]`);
  }
}
