"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const auth_1 = require("./src/middleware/auth");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3300;
const mongo = process.env.MONGO_URI || "mongodb://localhost:27017/teacher-review";
const corsOptions = { origin: "*", optionssuccessStatus: 200 };
const user_1 = __importDefault(require("./src/routes/user"));
const review_1 = __importDefault(require("./src/routes/review"));
app.use(express_1.default.json());
app.use((0, cors_1.default)(corsOptions));
app.use((0, compression_1.default)());
app.use((0, morgan_1.default)("dev"));
app.use("/auth", user_1.default);
app.use("/reviews", auth_1.authToken, review_1.default);
app.use((req, res) => res.send("Teacher Review APi. Coded with ❤️ by IoT Web Team."));
mongoose_1.default
    .connect(mongo)
    .then(() => app.listen(port, () => console.log(`Server is running on port ${port}`)))
    .catch((err) => console.log(err));
