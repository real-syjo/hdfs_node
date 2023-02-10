// 기본 설정
const PORT = 3000;

var WebHDFS = require("webhdfs");
var hdfs = WebHDFS.createClient();

var multer = require("multer");
var http = require("http");
const path = require('path');

var express = require("express");
const app = express();
app.use(express.json());
app.use(express.urlencoded({extended : false}));

const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

const busboy = require("connect-busboy");
app.use(busboy());

const cors = require('cors')
app.use(cors());


// 객체 생성/////////////////////////////////
var hdfs = WebHDFS.createClient({
  user: "root",
  host: "13.209.82.71",
  port: 50070,
  path: "/webhdfs/v1",
});



// 정적 파일 불러오기
app.use(express.static(__dirname + "/public"));

// 라우팅 정의(페이지 불러오기)
app.get("/", (req, res) => {
  console.log("페이지")
  res.sendFile(__dirname + "/index.html");
});

// upload 액션 처리
app.post("/upload", function (req, res) {
  var dir =req.query.name;
  var fstream;
  req.pipe(req.busboy);
  req.busboy.on("file", function (filedname, file, filename) {
    var finename = filename.filename;
    
    // stream으로 보내기
    fstream = hdfs.createWriteStream("/"+dir+"/"+ finename);
    file.pipe(fstream).on("finish", () => {
      console.log("stream finished : " + finename);
    });
  });
  res.end();

});



app.listen(PORT, () => {
  console.log(`Listen : ${PORT}`);
});

var router = express.Router();



 //다운로드
app.post("/download", function (req, res, next) {
  
  var dir = encodeURI(req.body.dir);
  var filename = dir+"/"+encodeURI(req.body.fileNm);
  
  var stream = hdfs.createReadStream(filename);
  var host = stream.host;
  var port = stream.port;
  var path = stream.path;
  var openUrl = "http://"+host+":"+port+path;
  console.log(openUrl);
  res.end(openUrl)
});

