const multer = require('multer');

// Configurazione storage per multer - Memory storage per salvare nel DB
const storage = multer.memoryStorage();

// Filtro per i tipi di file accettati
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo di file non supportato. Sono accettati solo PDF, DOC, DOCX, TXT, XLS, XLSX'), false);
  }
};

// Configurazione multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limite dimensione file
  }
});

// Middleware per upload di file multipli
const uploadFiles = upload.fields([
  { name: 'circolareGara', maxCount: 1 },
  { name: 'fileExtra1', maxCount: 1 },
  { name: 'fileExtra2', maxCount: 1 }
]);

module.exports = {
  uploadFiles,
  upload
};