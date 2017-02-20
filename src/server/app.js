var dbConfig = require("../config/db.json");
var mysql      = require('mysql');
var connection = mysql.createConnection(dbConfig.db);

connection.connect();

var fs=require('fs');
var request = require('request');
var express =   require("express");
var multer  =   require('multer');
var moment= require('moment');
var Converter = require("csvtojson").Converter;
var app=express();
app.use("/config", express.static('config'));
app.use('/', express.static(__dirname + '/../../dist'));
//var router = express.Router();

var path = require('path');
app.use(express.static(path.join(__dirname, 'uploads')));

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

var upload = multer({ storage: storage });
app.post("/upload", upload.array("uploads[]", 12), function (req, res) {

  var csvFileName='./'+dbConfig.uploadFolder+'/'+req.files[0].originalname;
  var csvConverter=new Converter({});

  var startDate;
  startDate= formatDate();

  csvConverter.on("error", function(err){
    res.end("Something went wrong when trying to upload the file!");
  });
    var countArr = [];
    var errors=[];
    var errFile=[];
    var check=0;
    var countErrors=[];
    csvConverter.on("end_parsed", function (jsonObj) {
      var queryFile= 'INSERT INTO file (file_name, total_numbers_of_rows, rows_with_error, start_date) SELECT * FROM (SELECT "' + req.files[0].originalname + '", "' + countArr.length + '", "' + countErrors + '", "' + formatDate() + '") AS tmp WHERE NOT EXISTS ( SELECT file_name FROM file WHERE file_name = "' + req.files[0].originalname + '")';
      connection.query(queryFile, function (error, results1, fields) {
        if (error) {
          moveFolder(req.files[0].originalname, dbConfig.uploadFolder, dbConfig.errorFolder);
          return;
        }
        if (results1.affectedRows === 0) {
          errFile.push('File already exists');
          res.json({error: errFile});
          return;
        }
        else {
          moveFolder(req.files[0].originalname, dbConfig.uploadFolder, dbConfig.processingFolder);
          var countErrors = [];
          for (var i = 0; i < jsonObj.length; i++) {
            countArr.push(i);
            (function () {
              var string = jsonObj[i].Description;
              var transactionDate = jsonObj[i].Date;
              var transactionId = jsonObj[i].ID;
              var amount = jsonObj[i].Amount;

              if (string && amount && transactionId && transactionDate) {
                var post = {
                  description: string,
                  creation_date: formatDate()
                };
                connection.query('INSERT INTO transaction_description SET ?', post, function (error, result, fields) {
                  var fileName=req.files[0].originalname;
                  var t=insertTransaction(transactionId, string, transactionDate, amount, fileName, countErrors, check, errors);
                  console.log(t);
                  if (error) {
                    check++;
                    countErrors.push(string);
                    errors.push('Duplicated description - ' + string);
                  }
                  else {
                    check++;
                  }
                  if(check >= jsonObj.length){
                    updateFile(fileName,countArr,countErrors,startDate,errors,res);
                  }
                });
              }
              else {
                countErrors.push(string);
                check++;
                errors.push('The file seems to be missing Amount: ' + amount + ', TransactionID: ' + transactionId + ', Description: ' + string + ', TransactionDate: ' + transactionDate);
                if(check >= jsonObj.length){
                  var fileName=req.files[0].originalname;
                  updateFile(fileName,countArr,countErrors,startDate,errors,res);
                  //res.json({error:errors});
                }
                return;
              }
            }());
          }
        }
      });
    });
      fs.createReadStream(csvFileName).pipe(csvConverter);
});

function insertTransaction(transactionId, string, transactionDate, amount, fileName, countErrors, check, errors){
  var queryString2 = 'SELECT transaction_description FROM transaction_description WHERE description = ?';
  connection.query(queryString2, [string], function (error, results, fields) {
    if(transactionId != parseInt(transactionId, 10)){
      check++;
      countErrors.push(string);
      errors.push('Is not an integer - ' + transactionId +' - '+  string);
    }
    else {
      var transactions = {
        transaction_id: transactionId,
        transaction_date: transactionDate,
        amount: amount,
        creation_date: formatDate(),
        transaction_description: results[0].transaction_description,
        file: fileName
      };
      connection.query('INSERT INTO transactions SET ?', transactions, function (erro, results, fields) {
        if (erro) {
          check++;
          countErrors.push(string);
          errors.push('Duplicated entry transaction - ' + string);
        }
        else {
          console.log('inserted');
        }
      });
    }
  });
}
function updateFile(fileName,countArr,countErrors,startDate,errors,res){
  var endDate=formatDate();
  connection.query('UPDATE file SET total_numbers_of_rows = ?,rows_with_error=?, start_date=?, end_date=? WHERE file_name = ?', [countArr.length, countErrors.length, startDate, endDate, fileName], function (err, result) {
    if (err) {
      throw err;
    }
    else {
      moveFolder(fileName, dbConfig.processingFolder, dbConfig.historyFolder);
      if (errors.length > 0) {
        res.json({error:errors});
      }
    }
  });
}
function formatDate(date) {
  return moment(date).format('YYYY-MM-DD HH:mm:ss');
}

app.listen(dbConfig.port,function(){
  console.log("Working on port " + dbConfig.port);
});

function moveFolder(filename, directory1, directory2){
  var mv=require('mv');
  mv(directory1+'/'+filename, directory2+'/'+filename, {mkdirp: true}, function(err) {

  });
}

app.get('/my-files',function(req,res){
  var queryString2 = 'SELECT file_name FROM file';
  connection.query(queryString2, function (error, results2, fields) {
    if (results2.length <= 0) {
      res.json(results2);
    }
    else {
      res.json(results2);
    }
  });
});

app.get('/my-transactions/',function(req,res){
  var fileName=req.params.file_name;
  var queryString2 = 'SELECT file_name, start_date, end_date, t.transaction_id, t.transaction_date, t.amount, t.transaction_description, td.transaction_description, td.description FROM file join transactions as t on t.file = file.file_name join transaction_description as td on td.transaction_description=t.transaction_description';
  connection.query(queryString2, function (error, results2, fields) {
    if (results2.length <= 0) {
      res.json(results2);
    }
    else {
      res.json(results2);
    }
  });
});
app.get('/*',function(req,res){
  res.sendFile(path.join(__dirname,'/../../dist/index.html'));
});
module.exports = app;

