import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Idea from '../models/Idea.js';
import fs from 'fs';
import path from 'path';

dotenv.config();

// Resolve path to data-import/ideas.json relative to the project root.
const filePath = path.join(process.cwd(), 'data-import', 'ideas.json');

const run = async () => {
  try {
    await connectDB();

    const raw = fs.readFileSync(filePath, 'utf8');
    const ideas = JSON.parse(raw);

    // Replace existing ideas in the collection
    await Idea.deleteMany({});
    const inserted = await Idea.insertMany(ideas);

    console.log(`Inserted ${inserted.length} ideas.`);
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
};

run();
