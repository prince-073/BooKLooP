const mongoose = require('mongoose');

const { Schema } = mongoose;

const bookSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    course: { type: String, required: true, trim: true },
    condition: { type: String, required: true, trim: true },

    // URL to an image (keep it as string so the frontend can show covers easily).
    image: { type: String, default: '' },

    // Extra optional fields used by your current frontend UI.
    edition: { type: String, default: '' },
    abstract: { type: String, default: '' },

    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    available: { type: Boolean, default: true },

    // When a book is borrowed:
    currentBorrower: { type: Schema.Types.ObjectId, ref: 'User', default: null },

    // FIFO waitlist of userIds.
    waitlist: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Book', bookSchema);

