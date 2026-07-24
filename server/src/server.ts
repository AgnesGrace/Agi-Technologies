import dotenv from 'dotenv';
dotenv.config();
import app from './index.js';

const isProduction = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 8001;

if (!isProduction) {
  app.listen(PORT, () => console.log(`App is listening on port ${PORT}`));
}
