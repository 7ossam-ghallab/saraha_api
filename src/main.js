import express from 'express';
import { config } from 'dotenv';
config()
import db_connection from './DB/connection.js'
import {controllerHandler} from './utils/controllers-handlers.utils.js'

function bootstrap() {
  const app = express();
  app.use(express.json());

  controllerHandler(app);
  db_connection()
  app.listen(process.env.PORT, () => {
    console.log('Server is running on port', process.env.PORT);
  })
}

export default bootstrap;