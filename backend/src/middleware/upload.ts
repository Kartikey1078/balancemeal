import multer from 'multer';

export const upload = process.env.VERCEL
  ? multer({ storage: multer.memoryStorage() })
  : multer({ dest: 'uploads/' });
