// const dotenv = require("dotenv");
// dotenv.config();

// const express = require("express");
// const morgan = require("morgan");
// const connect_DB = require("./config/db");
// const cors = require("cors");
// const path = require("path");
// const colors = require("colors");

// const http = require("http");
// const { Server } = require("socket.io");

// connect_DB();

// const app = express();

// app.use(cors());
// app.use(express.json());
// app.use(morgan("dev"));

// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// app.use('/api/v1/user', require("./routes/userRoute"));
// app.use("/api/v1/language", require("./routes/translateRoutes"));
// app.use("/api/v1/uploadTrans", require("./routes/uploadRoute"));
// app.use("/api/v1/history", require("./routes/historyRoute"));
// app.use("/api/v1/meeting", require("./routes/meetingRoutes"));
// app.use("/api/v1/admin", require("./routes/adminRoute"));

// const server = http.createServer(app);

// const io = new Server(server, {
//     cors: {
//         origin: "http://localhost:5173",
//         methods: ["GET", "POST"]
//     }
// });

// require("./sockets/meetingSocket")(io);

// const port = process.env.PORT || 8080;

// server.listen(port, () => {
//     console.log(`Server running on port ${port}`.bgCyan.white);
// });













const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const morgan = require("morgan");
const connect_DB = require("./config/db");
const cors = require("cors");
const path = require("path");
const colors = require("colors");

const http = require("http");
const { Server } = require("socket.io");

connect_DB();

const app = express();


app.use(cors({
    origin: process.env.FRONTEND_URL, 
    credentials: true
}));

app.use(express.json());
app.use(morgan("dev"));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));


app.use('/api/v1/user', require("./routes/userRoute"));
app.use("/api/v1/language", require("./routes/translateRoutes"));
app.use("/api/v1/uploadTrans", require("./routes/uploadRoute"));
app.use("/api/v1/history", require("./routes/historyRoute"));
app.use("/api/v1/meeting", require("./routes/meetingRoutes"));
app.use("/api/v1/admin", require("./routes/adminRoute"));


const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL, 
        methods: ["GET", "POST"]
    }
});

require("./sockets/meetingSocket")(io);


const port = process.env.PORT || 8080;

server.listen(port, () => {
    console.log(`Server running on port ${port}`.bgCyan.white);
});