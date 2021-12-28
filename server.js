const express = require("express");
const app = express();
const requestIp = require('request-ip');

var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database(".data/sqlite.db"); //Database("폴더/파일")

// DB 삭제 후 재생성할 때 사용
//db.run("DROP TABLE posts");
db.run(
  "CREATE TABLE IF NOT EXISTS posts (id INTEGER PRIMARY KEY AUTOINCREMENT, title VARCHAR(100), body TEXT, board VARCHAR(100), time TIMESTAMP DEFAULT CURRENT_TIMESTAMP)"
);

//db.run("DROP TABLE comments");
db.run(
  "CREATE TABLE IF NOT EXISTS comments (id INTEGER PRIMARY KEY AUTOINCREMENT, post_id INTEGER, password INTEGER, ip VARCHAR(100), nickname VARCHAR(100) , body TEXT, time TIMESTAMP DEFAULT CURRENT_TIMESTAMP)"
);

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static("public"));

app.set("view engine", "ejs");

app.get("/", (request, response) => {
  let page = request.query.page; // ?page=123
  if (page == null) {
    page = 1;
  } else {
    page = parseInt(page, 10);
  }

  db.all("SELECT * FROM posts LIMIT 10 OFFSET 0", function(error, rows) {
    response.render("index", { posts: rows, page: page });
  });
  // response.sendFile(__dirname+"/views/index.html");
});

app.get("/about.html", (request, response) => {
  response.render("about");
  // response.sendFile(__dirname+"/views/about.html");
});

app.get("/diary.html", (request, response) => {
  let posts = [];
  db.all("SELECT * FROM posts", function(error, rows) {
    response.render("diary", { posts: rows });
  });
  // response.sendFile(__dirname+"/views/diary.html");
});

app.get("/project.html", (request, response) => {
  let posts = [];
  db.all("SELECT * FROM posts", function(error, rows) {
    response.render("project", { posts: rows });
  });
  // response.sendFile(__dirname+"/views/project.html");
});

app.get("/story.html", (request, response) => {
  let posts = [];
  db.all("SELECT * FROM posts", function(error, rows) {
    response.render("story", { posts: rows });
  });
  // response.sendFile(__dirname+"/views/story.html");
});

app.get("/write-post", (request, response) => {
  response.render("write-post", { board: request.query.board });
});

app.post("/comments/", (request, response) => {
  let id = request.params.id;
  let ip = requestIp.getClientIp(request);

  db.run(
    "INSERT INTO comments (ip,post_id,password,nickname,body) VALUES (?,?,?,?,?)",
    ip,
    request.body.post_id,
    request.body.password,
    request.body.nickname,
    request.body.body
  );
  response.redirect("/show-posts/"+request.body.post_id);
});

app.post("/posts/", (request, response) => {
  //db.push(request.body);

  db.run(
    "INSERT INTO posts (board, title, body) VALUES (?, ?, ?)",
    request.body.board,
    request.body.title,
    request.body.body
    //javascript 코드를 text로 저장
  );
  response.render("posts");
});

app.get("/show-posts/:id", (request, response) => {
  let id = request.params.id; // /show-posts/123

  // db.run, db.each 같은 메서드 문서:
  // https://github.com/mapbox/node-sqlite3/wiki/API
  db.all("SELECT * FROM posts WHERE id = ?", id, function(error, posts) {
    // console.log("rows:", rows);
    // response.render("show-posts", { post: rows[0] });

    db.all("SELECT * FROM comments", function(error, comments) {
      // console.log("rows:", rows);
      response.render("show-posts", { post: posts[0], comments: comments });
    });
  });
});

/*app.get("/show-comments", (request, response) => {
  let comments=[];
  
  db.all("SELECT * FROM comments", function(error, rows) {
    console.log("rows:", rows);
    response.render("show-posts", { comment: rows });
  });
});*/

const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
