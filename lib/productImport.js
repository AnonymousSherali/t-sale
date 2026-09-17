import { categories } from './categories';

/**
 * Column headers recognised in an uploaded sheet. Each product field lists the
 * spellings people actually type — Uzbek and English, so a sheet exported from
 * another tool usually imports without being renamed first.
 */
export const COLUMN_ALIASES = {
  title: ['nomi', 'nom', 'mahsulot', 'mahsulot nomi', 'title', 'name', 'product'],
  price: ['narxi', 'narx', 'price', 'cost'],
  category: ['kategoriya', 'turkum', 'category'],
  description: ['tavsif', 'izoh', 'description', 'desc'],
  stock: ['miqdor', 'soni', 'qoldiq', 'stock', 'quantity', 'qty'],
  sku: ['sku', 'artikul', 'kod', 'code'],
  images: ['rasmlar', 'rasm', 'images', 'image', 'photo'],
};

/**
 * Headers the export writes that have no place on import — they are derived
 * from other columns or set by the database. Listing them keeps a re-imported
 * export from reporting them as unrecognised.
 */
export const IGNORED_HEADERS = [
  'umumiy qiymat',
  "qo'shilgan sana",
  'qoshilgan sana',
  'sana',
  'id',
];

/** The header row written into the downloadable template. */
export const TEMPLATE_HEADERS = ['Nomi', 'Narxi', 'Kategoriya', 'Tavsif', 'Miqdor', 'SKU', 'Rasmlar'];

export const TEMPLATE_EXAMPLE_ROWS = [
  ['Samsung Galaxy S21', 5000000, 'Elektronika', 'Original, kafolat bilan', 10, 'PHN-001', ''],
  ['Erkaklar ko\'ylagi', 150000, 'Kiyim va poyabzal', 'Paxta, oq rang', 25, '', ''],
];

function normaliseHeader(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    // Drops a trailing unit such as the "(so'm)" this app's own export writes,
    // so an exported file can be edited and imported straight back.
    .replace(/\s*\([^)]*\)\s*$/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Maps each column index in the header row to a product field.
 * Returns { columns, unknownHeaders } where columns is { field: index }.
 */
export function mapHeaders(headerRow) {
  const columns = {};
  const unknownHeaders = [];

  headerRow.forEach((raw, index) => {
    const header = normaliseHeader(raw);
    if (!header || IGNORED_HEADERS.includes(header)) return;

    const field = Object.keys(COLUMN_ALIASES).find((key) =>
      COLUMN_ALIASES[key].includes(header)
    );

    if (!field) {
      unknownHeaders.push(String(raw).trim());
    } else if (columns[field] === undefined) {
      // First matching column wins; a duplicate header is reported, not merged.
      columns[field] = index;
    } else {
      unknownHeaders.push(`${String(raw).trim()} (takrorlangan ustun)`);
    }
  });

  return { columns, unknownHeaders };
}

/**
 * Accepts "5 000 000", "5,000,000", "5000000.50" and plain numbers.
 * Returns null when the value cannot be read as a number.
 */
export function parseNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;

  const cleaned = String(value)
    .replace(/\s| /g, '')
    .replace(/,(?=\d{3}\b)/g, '') // thousands separator, not a decimal comma
    .replace(',', '.');

  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

function cellText(row, index) {
  if (index === undefined) return '';
  const value = row[index];
  if (value === null || value === undefined) return '';
  // ExcelJS returns objects for hyperlinks and rich text.
  if (typeof value === 'object') {
    return String(value.text ?? value.result ?? value.hyperlink ?? '').trim();
  }
  return String(value).trim();
}

/**
 * Validates one sheet row against the Product schema's rules.
 * Returns { product, errors, warnings } — product is null when errors exist.
 */
export function parseRow(row, columns, rowNumber) {
  const errors = [];
  const warnings = [];

  const title = cellText(row, columns.title);
  if (!title) {
    errors.push('Mahsulot nomi bo\'sh');
  } else if (title.length > 200) {
    errors.push('Mahsulot nomi 200 belgidan oshmasligi kerak');
  }

  const rawPrice = columns.price === undefined ? '' : row[columns.price];
  const price = parseNumber(rawPrice);
  if (price === null) {
    errors.push(
      cellText(row, columns.price)
        ? `Narx son emas: "${cellText(row, columns.price)}"`
        : 'Narx bo\'sh'
    );
  } else if (price < 0) {
    errors.push('Narx manfiy bo\'lishi mumkin emas');
  }

  let stock = 0;
  if (columns.stock !== undefined && cellText(row, columns.stock) !== '') {
    const parsed = parseNumber(row[columns.stock]);
    if (parsed === null) {
      errors.push(`Miqdor son emas: "${cellText(row, columns.stock)}"`);
    } else if (parsed < 0) {
      errors.push('Miqdor manfiy bo\'lishi mumkin emas');
    } else {
      stock = Math.floor(parsed);
    }
  }

  const description = cellText(row, columns.description);
  if (description.length > 2000) {
    errors.push('Tavsif 2000 belgidan oshmasligi kerak');
  }

  let category = cellText(row, columns.category);
  if (category) {
    const match = categories.find(
      (c) => c.toLowerCase() === category.toLowerCase()
    );
    if (match) {
      category = match; // normalise casing so the category filter matches
    } else {
      warnings.push(`"${category}" ro'yxatdagi kategoriyalarga kirmaydi`);
    }
  } else {
    category = 'Boshqa';
  }

  const images = cellText(row, columns.images)
    .split(/[,\n;]/)
    .map((url) => url.trim())
    .filter(Boolean);

  if (errors.length > 0) {
    return { product: null, errors, warnings, rowNumber };
  }

  return {
    product: {
      title,
      price,
      stock,
      description,
      category,
      images,
      sku: cellText(row, columns.sku),
    },
    errors,
    warnings,
    rowNumber,
  };
}

/**
 * Turns sheet rows into products plus a per-row report.
 * `existingSkus` are the SKUs already in the database; duplicates — both against
 * the database and within the file itself — are rejected rather than left to
 * fail one by one on the unique index.
 */
export function buildImportReport(rows, { existingSkus = new Set() } = {}) {
  if (rows.length === 0) {
    return { columns: {}, unknownHeaders: [], valid: [], invalid: [], warnings: [] };
  }

  const [headerRow, ...dataRows] = rows;
  const { columns, unknownHeaders } = mapHeaders(headerRow);

  const missing = ['title', 'price'].filter((field) => columns[field] === undefined);
  if (missing.length > 0) {
    return {
      columns,
      unknownHeaders,
      valid: [],
      invalid: [],
      warnings: [],
      fatal: `Majburiy ustunlar topilmadi: ${missing
        .map((f) => (f === 'title' ? 'Nomi' : 'Narxi'))
        .join(', ')}`,
    };
  }

  const valid = [];
  const invalid = [];
  const warnings = [];
  const seenSkus = new Map();

  dataRows.forEach((row, index) => {
    // +2: sheet rows are 1-based and the header occupies the first one.
    const rowNumber = index + 2;
    const isBlank = row.every((cell) => cellText([cell], 0) === '');
    if (isBlank) return;

    const result = parseRow(row, columns, rowNumber);

    if (result.product?.sku) {
      const sku = result.product.sku;
      if (existingSkus.has(sku)) {
        result.errors.push(`SKU "${sku}" bazada allaqachon mavjud`);
        result.product = null;
      } else if (seenSkus.has(sku)) {
        result.errors.push(`SKU "${sku}" faylda ${seenSkus.get(sku)}-qatorda ham bor`);
        result.product = null;
      } else {
        seenSkus.set(sku, rowNumber);
      }
    }

    result.warnings.forEach((message) => warnings.push({ rowNumber, message }));

    if (result.product) {
      valid.push(result.product);
    } else {
      invalid.push({ rowNumber, errors: result.errors });
    }
  });

  return { columns, unknownHeaders, valid, invalid, warnings };
}
