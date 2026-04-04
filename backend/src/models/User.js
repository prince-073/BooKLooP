const mongoose = require('mongoose');

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    course: { type: String, required: true, trim: true },
    year: { type: String, required: true, trim: true },
    phone: { type: String, default: '' },

    // Track relationship for quick profile views.
    booksListed: [{ type: Schema.Types.ObjectId, ref: 'Book', default: [] }],
    booksBorrowed: [{ type: Schema.Types.ObjectId, ref: 'Book', default: [] }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);

