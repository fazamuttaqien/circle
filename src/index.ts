import cors from "cors";
import express from "express";
import * as dotenv from "dotenv";
import router from "./routes/router";
import { redisConnect } from "./cache/redis";

const app = express();
app.use(express.json());

dotenv.config();

const corsOption = {
  origin: "*",
  methods: "GET, POST, PUT, PATCH, DELETE, HEAD",
  preflightContinue: false,
  // secara default akan mengset menjadi 404
  optionsSuccessStaus: 204,
  // dia berhasil untuk mengambil data server 204(no content)
};

app.use(cors(corsOption));

app.use("/api/circle", router);

app.listen(process.env.PORT, () => {
  redisConnect();
  console.log(`Server running in PORT : ${process.env.PORT}`);
});
