import notesService from '../services/NotesService.js';
import { sendSuccess } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const listNotes = asyncHandler(async (req, res) => {
  const data = await notesService.listNotes(req.user.id, req.query);
  sendSuccess(res, data, 'Success', 200, data.meta);
});

export const getNote = asyncHandler(async (req, res) => {
  const data = await notesService.getNote(req.user.id, req.params.id);
  sendSuccess(res, data);
});

export const createNote = asyncHandler(async (req, res) => {
  const data = await notesService.createNote(req.user.id, req.body);
  sendSuccess(res, data, 'Note created', 201);
});

export const updateNote = asyncHandler(async (req, res) => {
  const data = await notesService.updateNote(req.user.id, req.params.id, req.body);
  sendSuccess(res, data, 'Note updated');
});

export const deleteNote = asyncHandler(async (req, res) => {
  const data = await notesService.deleteNote(req.user.id, req.params.id);
  sendSuccess(res, data, 'Note deleted');
});

export default {
  listNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
};
