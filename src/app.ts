require('dotenv').config();
import Koa from 'koa';
import router from './routes';
import  bodyParser from 'koa-bodyparser';
import cors from 'koa-cors';
import { config } from './config/env.config';
import { connectDB } from './config/db.config';

// APPS
const app = new Koa();

// DATABASE
connectDB();

// USES
app.use(bodyParser());
app.use(cors({
  origin: "*"
}));
app.use(router.routes());

// APP START
app.listen(config.PORT, () => {
  console.log(`Server has been started on port ${config.PORT}`);  
});