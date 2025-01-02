import { argv } from "node:process";
import { stat, utimes } from "node:fs/promises";
import exifr from "exifr";

for (const file of argv.slice(2)) {
  /** @type {Date} */
  let date = undefined;
  try {
    const values = await exifr.parse(file, [ "DateTimeOriginal", "CreateDate", "ModifyDate" ]);
    date = values.DateTimeOriginal || values.CreateDate || values.ModifyDate;
  } catch {
    // Handled below
  }
  if (date) {
    const stats = await stat(file);
    await utimes(file, stats.atime, date);
    console.log(`${file}: ${date.toLocaleString()}`);
  } else {
    console.log(`${file}: [NO EXIF DATE]`);
  }
}
