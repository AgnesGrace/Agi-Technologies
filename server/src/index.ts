import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import courseRouter from './routes/courseRoute.js';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy());
app.use(morgan('dev'));
app.use(cors());

app.get('/', (req, res) => res.send('Welcome to Agi Technologies'));
app.use('/api/v1/courses', courseRouter);

export default app;
