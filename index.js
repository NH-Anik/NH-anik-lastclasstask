import express from 'express';
import dotenv from 'dotenv'
import morgan from 'morgan';
import cors from 'cors'
import connectDB from './db/dbConnection.js'
import authRoutes from './routes/authRoutes.js'
import categoryRoutes from './routes/categoryRoutes.js'
import clientRoutes from './routes/clientRoutes.js'
// import { rateLimit } from 'express-rate-limit'


// config dotenv 
dotenv.config()
const app = express()

// database connection
connectDB();
// app.use(rateLimit(
//   {
//     windowMs: 15 * 60 * 1000,
//     max: 100000
//   }
// ))

// middlewares
app.use(cors());
app.use(express.json())
app.use(morgan('dev'))

// routes
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/category', categoryRoutes)
app.use('/api/v1/client',clientRoutes)
// massage 

// default route
app.get('/', (req, res) => {
    res.send('Welcome to the default route QBCoreStore');
});

// server import port from .env file
const PORT=process.env.PORT 

// server listen
app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`)
})

