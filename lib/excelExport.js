import ExcelJS from 'exceljs';

/**
 * Builds a styled worksheet: bold frozen header, sized columns, number and date
 * formats. `columns` is [{ header, key, width, numFmt }] and `rows` are plain
 * objects keyed by those column keys.
 */
export function buildSheet(workbook, sheetName, columns, rows) {
  const sheet = workbook.addWorksheet(sheetName);

  sheet.columns = columns.map(({ header, key, width }) => ({ header, key, width }));

  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE5E7EB' },
  };
  headerRow.alignment = { vertical: 'middle' };

  // Keeps the header visible while scrolling a long export.
  sheet.views = [{ state: 'frozen', ySplit: 1 }];

  rows.forEach((row) => sheet.addRow(row));

  columns.forEach(({ key, numFmt }, index) => {
    if (!numFmt) return;
    sheet.getColumn(index + 1).numFmt = numFmt;
  });

  // Lets Excel sort and filter the export without extra setup.
  if (rows.length > 0) {
    sheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: columns.length },
    };
  }

  return sheet;
}

/** Streams a workbook to the client as a downloadable .xlsx attachment. */
export async function sendWorkbook(res, workbook, filename) {
  const buffer = await workbook.xlsx.writeBuffer();

  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${filename}"`
  );
  res.setHeader('Content-Length', buffer.byteLength);
  res.status(200).send(Buffer.from(buffer));
}

/** `mahsulotlar-2026-09-17.xlsx` — dated so repeated exports don't overwrite. */
export function datedFilename(prefix) {
  const today = new Date().toISOString().slice(0, 10);
  return `${prefix}-${today}.xlsx`;
}

export { ExcelJS };
