const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const morgan = require("morgan");
const connect_DB = require("./config/db");
const cors = require("cors");
const path = require("path");
const colors = require("colors");
connect_DB();
const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));



app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use('/api/v1/user', require("./routes/userRoute"));
app.use("/api/v1/language", require("./routes/translateRoutes"));
app.use("/api/v1/uploadTrans", require("./routes/uploadRoute"));
app.use("/api/v1/history", require("./routes/historyRoute"));

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${port}`.bgCyan.white);
});
