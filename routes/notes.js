const express = require('express');
const Router = express.Router();
const fetchuser = require('../Middleware/fetchuser');
const Notes = require('../models/Notes')
const { validationResult, body } = require('express-validator');



// ROUTER 1: Get all the notes using GET "api/auth/fetchallnotes". No login requires
Router.get('/fetchallnotes', fetchuser, async (req, res) => {
     try {
          const notes = await Notes.find({ user: req.user.id });
          res.json(notes);
     } catch (error) {
          console.error(error.message);
          res.status(500).send("Internal server error")
     }

})


// ROUTER 2: Add user notes using GET "api/auth/addnote". No login requires
Router.post('/addnote', fetchuser, [
     body('title', 'Enter a valid title').isLength({ min: 3 }),
     body('description', 'description must be atleast 5 words').isLength({ min: 5 }),], async (req, res) => {
          try {


               const { title, description, tag } = req.body;
               //if there are error-> "return bad request and the errors"
               const errors = validationResult(req);
               if (!errors.isEmpty()) {
                    return res.status(400).json({ errors: errors.array() });
               }

               const note = new Notes({
                    title, description, tag, user: req.user.id
               })
               const saveNote = await note.save();
               res.json(saveNote);
          } catch (error) {
               console.error(error.message);
               res.status(500).send("Internal server error")
          }
     })



// ROUTER 3: update note using PUT "api/auth/updatenote". "login required"
Router.put('/updatenote/:id', fetchuser, async (req, res) => {
     const { title, description, tag } = req.body;
     try {


          //create a newNote object
          const newNote = {};
          if (title) { newNote.title = title };
          if (description) { newNote.description = description };
          if (tag) { newNote.tag = tag };

          //find an updated note and update it
          let note = await Notes.findById(req.params.id);
          if (!note) { return res.status(404).send("Not Found") };
          if (!note.user) {
               return res.status(400).json({ error: 'Note does not have a user assigned' });
          }
          if (note.user.toString() !== req.user.id) {
               return res.status(401).send("Not Allwed")
          };
          note = await Notes.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true });
          res.json({ note });
     } catch (error) {
          console.error(error.message);
          res.status(500).send("Internal server error")
     }
})


// ROUTER 4: Delete note using DELETE "api/auth/deletenote". "login required"
Router.delete('/deletenote/:id', fetchuser, async (req, res) => {
     try {


          //find a note to be deleted and delete it
          let note = await Notes.findById(req.params.id);
          if (!note) { return res.status(404).send("Not Found") };
          //allow deletion only if user owns the note
          if (note.user.toString() !== req.user.id) {
               return res.status(401).send("Not Allwed")
          };
          note = await Notes.findOneAndDelete({ _id: req.params.id });

          res.json({ "Success": "Note has succesfully deleted", note: note });
     } catch (error) {
          console.error(error.message);
          res.status(500).send("Internal server error")
     }
})
module.exports = Router