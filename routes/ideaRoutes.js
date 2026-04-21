import express from 'express';
const router = express.Router();
import Idea from '../models/Idea.js';
import User from '../models/User.js';
import mongoose from 'mongoose';
import { protect } from '../middleware/authMiddleware.js';

// @route             GET /api/ideas
// @description       Get all ideas
// @access            Public
// query              _limit (Optional limit for the ideas returned)
router.get('/', async (req, res, next) => {
  try {
    const limit = parseInt(req.query._limit);
    const query = Idea.find().sort({ createdAt: -1 });

    if (!isNaN(limit)) {
      query.limit(limit);
    }

    const ideas = await query.exec();
    res.json(ideas);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// @route             GET /api/ideas/:id
// @description       Get single idea
// @access            Public
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(404);
      throw new Error('Idea not Found');
    }

    // Populate the `user` reference so the response contains the creator's id, name and email
    const idea = await Idea.findById(id).populate('user', 'name email');

    if (!idea) {
      res.status(404);
      throw new Error('Idea not Found');
    }
    res.json(idea);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// @route             POST /api/ideas
// @description       Create new idea
// @accesss           Private
router.post('/', protect, async (req, res, next) => {
  try {
    const { title, summary, description, tags } = req.body || {};
    if (!title?.trim() || !summary?.trim() || !description?.trim()) {
      res.status(400);
      throw new Error('Title, summary and description are required');
    }

    const newIdea = new Idea({
      title,
      summary,
      description,
      tags:
        typeof tags === 'string'
          ? tags
              .split(',')
              .map((tag) => tag.trim())
              .filter(Boolean)
          : Array.isArray(tags)
          ? tags
          : [],
      user: req.user.id,
    });

    console.log('create idea payload', req.body);
    const savedIdea = await newIdea.save();
    return res.status(201).json(savedIdea);
  } catch (err) {
    console.error(err);
    return next(err);
  }
});

// @route             DELETE /api/ideas/:id
// @description       Delete single idea
// @access            Public
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(404);
      throw new Error('Idea not Found');
    }

    const idea = await Idea.findById(id);

    if (!idea) {
      res.status(404);
      throw new Error('Idea not Found');
    }

    // Check if user owns the idea
    if (
      (idea.user.toString() || idea.user._id.toString()) !==
      req.user._id.toString()
    ) {
      res.status(403);
      throw new Error('Not authorized to delete this idea');
    }

    await idea.deleteOne();

    res.json({ message: 'Idea deleted succesfully' });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// @route             PUT /api/ideas/:id
// @description       Update idea
// @access            Public
router.put('/:id', protect, async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(404);
      throw new Error('Idea not Found');
    }

    const idea = await Idea.findById(id);

    if (!idea) {
      res.status(404);
      throw new Error('Idea not found');
    }

    // Check if user owns the idea
    if (idea.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to update this idea');
    }

    const { title, summary, description, tags } = req.body || {};
    if (!title?.trim() || !summary?.trim() || !description?.trim()) {
      res.status(400);
      throw new Error('Title, summary and description are required');
    }

    idea.title = title;
    idea.summary = summary;
    idea.description = description;
    idea.tags = Array.isArray(tags)
      ? tags
      : typeof tags === 'string'
      ? tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean)
      : [];

    const updatedIdea = await idea.save();

    res.json(updatedIdea);
  } catch (err) {
    console.error(err);
    return next(err);
  }
});

export default router;
