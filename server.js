const express = require("express");
const cors = require("./middleware/cors");
const postRoutes = require("./routes/posts");

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(cors);
app.use("/uploads", express.static("uploads")); // Доступ к загруженным файлам
app.use("/api/posts", postRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
