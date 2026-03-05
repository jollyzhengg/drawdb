/**
 * Generate realistic sample data based on table schemas
 * Supports multiple output formats: SQL, JSON, CSV
 */

const faker = {
  // Simple data generation utilities
  randomInt: (min = 1, max = 100) => Math.floor(Math.random() * (max - min + 1)) + min,
  randomEmail: (index) => `user${index}@example.com`,
  randomUsername: (index) => `user${index}`,
  randomPassword: () => '$2b$10$' + Math.random().toString(36).substring(2, 15),
  randomString: (length) => Math.random().toString(36).substring(2, 2 + length),
  randomTitle: (index) => `Blog Post ${index}`,
  randomContent: (index) => `This is the content of blog post ${index}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
  randomCoverUrl: (index) => `https://picsum.photos/800/600?random=${index}`,
  randomComment: (index) => `Great post! Comment ${index} - Really enjoyed reading this.`,
  randomTagName: (index) => {
    const tags = ['javascript', 'react', 'node', 'database', 'css', 'html', 'devops', 'testing'];
    return tags[index % tags.length];
  },
  randomTimestamp: (daysAgo = 30) => {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
    return date.toISOString();
  },
};

/**
 * Generate sample data for a given diagram/template
 * @param {Object} diagram - The diagram object with tables and relationships
 * @param {number} rowsPerTable - Number of sample rows per table
 * @returns {Object} Generated data keyed by table name
 */
export function generateSampleData(diagram, rowsPerTable = 5) {
  const data = {};

  // Generate data for each table
  diagram.tables.forEach((table) => {
    data[table.name] = [];

    for (let i = 1; i <= rowsPerTable; i++) {
      const row = {};

      table.fields.forEach((field) => {
        row[field.name] = generateFieldValue(field, i, table.name);
      });

      data[table.name].push(row);
    }
  });

  // Populate foreign keys based on relationships
  if (diagram.relationships) {
    diagram.relationships.forEach((rel) => {
      const startTable = diagram.tables.find((t) => t.id === rel.startTableId);
      const endTable = diagram.tables.find((t) => t.id === rel.endTableId);

      if (startTable && endTable) {
        const startFieldName = startTable.fields.find((f) => f.id === rel.startFieldId)?.name;
        const endFieldName = endTable.fields.find((f) => f.id === rel.endFieldId)?.name;

        if (startFieldName && endFieldName) {
          data[startTable.name].forEach((row, index) => {
            row[startFieldName] = (index % rowsPerTable) + 1;
          });
        }
      }
    });
  }

  return data;
}

/**
 * Generate a sample value for a field based on its type and name
 */
function generateFieldValue(field, rowIndex, tableName) {
  const isId = field.name.toLowerCase().includes('id');
  const isEmail = field.name.toLowerCase().includes('email');
  const isPassword = field.name.toLowerCase().includes('password');
  const isUsername = field.name.toLowerCase().includes('username');
  const isTitle = field.name.toLowerCase().includes('title');
  const isContent = field.name.toLowerCase().includes('content');
  const isName = field.name.toLowerCase().includes('name');
  const isCover = field.name.toLowerCase().includes('cover');
  const isTimestamp = field.type === 'TIMESTAMP' || field.type === 'DATETIME';
  const isDate = field.type === 'DATE';

  if (isId && field.primary) return rowIndex;
  if (isEmail) return faker.randomEmail(rowIndex);
  if (isPassword) return faker.randomPassword();
  if (isUsername) return faker.randomUsername(rowIndex);
  if (isTitle) return faker.randomTitle(rowIndex);
  if (isContent) return faker.randomContent(rowIndex);
  if (isCover) return faker.randomCoverUrl(rowIndex);
  if (isName && tableName === 'tags') return faker.randomTagName(rowIndex);
  if (isTimestamp) return faker.randomTimestamp();
  if (isDate) return new Date().toISOString().split('T')[0];

  // Default handling based on type
  switch (field.type) {
    case 'INT':
    case 'BIGINT':
    case 'SMALLINT':
      return faker.randomInt(1, 1000);
    case 'VARCHAR':
    case 'TEXT':
      return `Sample text ${rowIndex}`;
    case 'BOOLEAN':
      return true;
    case 'DECIMAL':
    case 'FLOAT':
    case 'DOUBLE':
      return parseFloat((Math.random() * 1000).toFixed(2));
    case 'DATE':
      return new Date().toISOString().split('T')[0];
    case 'TIMESTAMP':
    case 'DATETIME':
      return new Date().toISOString();
    default:
      return null;
  }
}

/**
 * Export generated data as SQL INSERT statements
 */
export function exportAsSQL(diagram, data, database = 'mysql') {
  let sql = '';

  Object.entries(data).forEach(([tableName, rows]) => {
    rows.forEach((row) => {
      const columns = Object.keys(row);
      const values = columns.map((col) => {
        const val = row[col];
        if (val === null) return 'NULL';
        if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
        return val;
      });

      sql += `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${values.join(', ')});\n`;
    });
  });

  return sql;
}

/**
 * Export generated data as JSON
 */
export function exportAsJSON(data) {
  return JSON.stringify(data, null, 2);
}

/**
 * Export generated data as CSV
 */
export function exportAsCSV(data) {
  let csv = '';

  Object.entries(data).forEach(([tableName, rows]) => {
    if (rows.length === 0) return;

    csv += `\n--- ${tableName} ---\n`;
    const columns = Object.keys(rows[0]);
    csv += columns.join(',') + '\n';

    rows.forEach((row) => {
      const values = columns.map((col) => {
        const val = row[col];
        const str = val === null ? '' : String(val);
        return `"${str.replace(/"/g, '""')}"`;
      });
      csv += values.join(',') + '\n';
    });
  });

  return csv;
}

/**
 * Generate a complete dataset with all formats
 */
export function generateAllFormats(diagram, rowsPerTable = 5) {
  const data = generateSampleData(diagram, rowsPerTable);

  return {
    data,
    sql: exportAsSQL(diagram, data),
    json: exportAsJSON(data),
    csv: exportAsCSV(data),
  };
}
