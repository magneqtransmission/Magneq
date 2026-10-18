import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config();

const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
  throw new Error("MONGO_URI is not set. Add it to the environment or .env file.");
}

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;

db.on('error', (err) => {
  console.error('MongoDB connection error: ', err);
});

db.once('open', () => {
  console.log('MongoDB connected');
});

export default mongoose;
