import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config();

console.log("process.env.MONGO_URI", process.env.MONGO_URI);

mongoose.connect("mongodb+srv://pratikagrawal2095_db_user:MP1Fk8k3RL8XBmSN@magneq.2blzz2j.mongodb.net/magneq?retryWrites=true&w=majority&appName=Magneq", {
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
