const express = require("express");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const imgModel = require("./model");
require("dotenv/config");

const app = express();

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  dbName: "photographerPortfolio",
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now());
  },
});

const upload = multer({ storage: storage });

//home route
app.get("/", function (req, res) {
  res.render("home");
});

app.get("/portfolio", function (req, res) {
  imgModel.find({}, (err, items) => {
    if (err) {
      console.log(err);
    } else {
      res.render("portfolio", { items: items });
    }
  });
});

app.get("/contact", function (req, res) {
  res.render("contact");
});

// Uploading the image
app.post("/compose", upload.single("image"), (req, res, next) => {
  var obj = {
    name: req.body.name,
    desc: req.body.desc,
    img: {
      data: fs.readFileSync(
        path.join(__dirname + "/uploads/" + req.file.filename)
      ),
      contentType: "image/png",
    },
  };
  imgModel.create(obj, (err, item) => {
    if (err) {
      console.log(err);
    } else {
      item.save();
      const directory = path.join(__dirname + "/uploads");
      fs.readdir(directory, (err, files) => {
        if (err) throw err;

        for (const file of files) {
          if (file !== "demo.txt") {
            fs.unlink(path.join(directory, file), (err) => {
              if (err) throw err;
            });
          }
        }
      });
      res.redirect("/portfolio");
    }
  });
});

app.get("/compose", function (req, res) {
  res.render("compose");
});

app.listen(process.env.PORT, function () {
  console.log(`Server is running on port : ${process.env.PORT}!`);
});
