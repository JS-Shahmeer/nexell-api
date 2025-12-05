import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import contactRoute from "./routes/contact.js";

dotenv.config();

const app = express();
app.use(cors({
  origin: "*", // Allow all domains OR specify your frontend domain
}));
app.use(express.json());

// Routes ------------------------------------------------
app.use("/api/contact", contactRoute);

// Start Server ------------------------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
