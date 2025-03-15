const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const router = express.Router();
const filePath = path.join(__dirname, "../data/posts.json");


const readData = () => {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    console.error("Ошибка чтения posts.json:", error.message);
    return [];
  }
};

const writeData = (data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Ошибка записи в posts.json:", error.message);
  }
};


const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + ".jpg");
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg") {
    cb(null, true);
  } else {
    cb(new Error("Разрешены только JPG файлы!"), false);
  }
};

const upload = multer({ storage, fileFilter });

router.get("/", (req, res) => {
  res.json(readData());
});


router.get("/:id", (req, res) => {
  const posts = readData();
  const postId = Number(req.params.id);
  const post = posts.find((p) => p.id === postId);

  post ? res.json(post) : res.status(404).json({ message: "Пост не найден" });
});


router.post("/", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Файл должен быть JPG!" });
  }

  const posts = readData();
  const newPost = {
    id: Date.now(),
    title: req.body.title,
    content: req.body.content,
    image: `/uploads/${req.file.filename}`,
    likes: 0,
  };

  posts.push(newPost);
  writeData(posts);
  res.status(201).json(newPost);
});

router.put("/:id", (req, res) => {
  let posts = readData();
  const postId = Number(req.params.id);
  const index = posts.findIndex((p) => p.id === postId);

  if (index !== -1) {
    posts[index] = { ...posts[index], ...req.body };
    writeData(posts);
    res.json(posts[index]);
  } else {
    res.status(404).json({ message: "Пост не найден" });
  }
});

router.post("/:id/like", (req, res) => {
  let posts = readData();
  const postId = Number(req.params.id);
  const post = posts.find((p) => p.id === postId);

  if (post) {
    post.likes += 1;
    writeData(posts);
    res.json(post);
  } else {
    res.status(404).json({ message: "Пост не найден" });
  }
});

router.delete("/:id", (req, res) => {
  let posts = readData();
  const postId = Number(req.params.id);
  const newPosts = posts.filter((p) => p.id !== postId);

  if (posts.length === newPosts.length) {
    return res.status(404).json({ message: "Пост не найден" });
  }

  writeData(newPosts);
  res.json({ message: "Пост удален" });
});

module.exports = router;
