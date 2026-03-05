#!/usr/bin/env node
/**
 * Sample data generator for DrawDB tables
 * Run with: node generate-sample-data.js
 */

import {
  generateSampleData,
  exportAsSQL,
  exportAsJSON,
  exportAsCSV,
  generateAllFormats,
} from './src/utils/generateSampleData.js';
import fs from 'fs';
import path from 'path';

// Define schema directly to avoid module import issues
const template1 = {
  tables: [
    {
      id: 0,
      name: 'users',
      fields: [
        { name: 'id', type: 'INT', primary: true },
        { name: 'username', type: 'VARCHAR' },
        { name: 'password', type: 'VARCHAR' },
        { name: 'email', type: 'VARCHAR' },
        { name: 'last_login', type: 'TIMESTAMP' },
      ],
    },
    {
      id: 1,
      name: 'blog_posts',
      fields: [
        { name: 'id', type: 'INT', primary: true },
        { name: 'user_id', type: 'INT' },
        { name: 'title', type: 'VARCHAR' },
        { name: 'content', type: 'VARCHAR' },
        { name: 'cover', type: 'VARCHAR' },
      ],
    },
    {
      id: 2,
      name: 'comments',
      fields: [
        { name: 'id', type: 'INT', primary: true },
        { name: 'blog_id', type: 'INT' },
        { name: 'user_id', type: 'INT' },
        { name: 'content', type: 'VARCHAR' },
      ],
    },
    {
      id: 3,
      name: 'tags',
      fields: [
        { name: 'id', type: 'INT', primary: true },
        { name: 'name', type: 'VARCHAR' },
      ],
    },
    {
      id: 4,
      name: 'blog_tag',
      fields: [
        { name: 'blog_id', type: 'INT', primary: true },
        { name: 'tag_id', type: 'INT', primary: true },
      ],
    },
  ],
  relationships: [
    { startTableId: 1, startFieldId: 1, endTableId: 0, endFieldId: 0 },
    { startTableId: 2, startFieldId: 1, endTableId: 1, endFieldId: 0 },
    { startTableId: 2, startFieldId: 2, endTableId: 0, endFieldId: 0 },
    { startTableId: 4, startFieldId: 0, endTableId: 1, endFieldId: 0 },
    { startTableId: 4, startFieldId: 1, endTableId: 3, endFieldId: 0 },
  ],
};

const NUM_ROWS = 5; // Number of sample rows per table

// Generate data
console.log('🚀 Generating sample data from template1...\n');
const allFormats = generateAllFormats(template1, NUM_ROWS);

// Display summary
console.log('📊 Sample Data Generated Successfully!\n');
console.log('Tables:', template1.tables.map((t) => t.name).join(', '));
console.log('Rows per table:', NUM_ROWS);
console.log('\n' + '='.repeat(80) + '\n');

// Display JSON format
console.log('📄 JSON FORMAT:\n');
console.log(allFormats.json);
console.log('\n' + '='.repeat(80) + '\n');

// Display SQL format
console.log('🗄️  SQL INSERT STATEMENTS:\n');
console.log(allFormats.sql);
console.log('\n' + '='.repeat(80) + '\n');

// Display CSV format
console.log('📋 CSV FORMAT:\n');
console.log(allFormats.csv);
console.log('\n' + '='.repeat(80) + '\n');

// Write to files
const outputDir = './sample-data-output';
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(path.join(outputDir, 'sample-data.json'), allFormats.json);
fs.writeFileSync(path.join(outputDir, 'sample-data.sql'), allFormats.sql);
fs.writeFileSync(path.join(outputDir, 'sample-data.csv'), allFormats.csv);

console.log(`✅ Files saved to ${outputDir}/:`);
console.log('  - sample-data.json');
console.log('  - sample-data.sql');
console.log('  - sample-data.csv');
