import express from "express";
import authRoutes from "./routes/auth";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

app.use("/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});     