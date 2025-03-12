const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const router = express.Router();
const filePath = path.join(__dirname, "../data/posts.json");

const readData = () => JSON.parse(fs.readFileSync(filePath, "utf8"));
const writeData = (data) => fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Генерируем уникальное имя
  },
});

const upload = multer({ storage });

// 📌 Получение всех постов
router.get("/", (req, res) => {
  const posts = readData();
  res.json(posts);
});

// 📌 Получение поста по ID
router.get("/:id", (req, res) => {
  const posts = readData();
  const post = posts.find((p) => p.id === parseInt(req.params.id));
  post ? res.json(post) : res.status(404).json({ message: "Post not found" });
});

// 📌 Создание нового поста (с загрузкой изображения)
router.post("/", upload.single("image"), (req, res) => {
  const posts = readData();
  const newPost = {
    id: Date.now(),
    title: req.body.title,
    content: req.body.content,
    image: req.file ? `/uploads/${req.file.filename}` : null, // Ссылка на изображение
    likes: 0,
  };
  posts.push(newPost);
  writeData(posts);
  res.status(201).json(newPost);
});

// 📌 Обновление поста
router.put("/:id", (req, res) => {
  let posts = readData();
  const index = posts.findIndex((p) => p.id === parseInt(req.params.id));

  if (index !== -1) {
    posts[index] = { ...posts[index], ...req.body };
    writeData(posts);
    res.json(posts[index]);
  } else {
    res.status(404).json({ message: "Post not found" });
  }
});

// 📌 Удаление поста
router.delete("/:id", (req, res) => {
  let posts = readData();
  posts = posts.filter((p) => p.id !== parseInt(req.params.id));
  writeData(posts);
  res.json({ message: "Post deleted" });
});

// 📌 Лайк поста
router.post("/:id/like", (req, res) => {
  let posts = readData();
  const post = posts.find((p) => p.id === parseInt(req.params.id));

  if (post) {
    post.likes += 1;
    writeData(posts);
    res.json(post);
  } else {
    res.status(404).json({ message: "Post not found" });
  }
});

module.exports = router;
