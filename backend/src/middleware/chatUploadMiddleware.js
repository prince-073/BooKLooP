const fs = require('fs');
const path = require('path');
const multer = require('multer');

const chatUploadsDir = path.join(process.cwd(), 'uploads', 'chat');
if (!fs.existsSync(chatUploadsDir)) {
  fs.mkdirSync(chatUploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, chatUploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext || ''}`);
  },
});

const allowedMimePrefixes = ['image/'];
const allowedExactMimes = [
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

function fileFilter(_req, file, cb) {
  const mime = (file.mimetype || '').toLowerCase();
  const isImage = allowedMimePrefixes.some((prefix) => mime.startsWith(prefix));
  const isAllowedDoc = allowedExactMimes.includes(mime);

  if (!isImage && !isAllowedDoc) {
    cb(new Error('Only image and document files are allowed'));
    return;
  }
  cb(null, true);
}

const uploadChatAttachment = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
}).single('attachment');

module.exports = { uploadChatAttachment };

