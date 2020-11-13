'use strict';

var express = require('express');
var path = require('path');
var https = require('https');
var http = require('http');
var bodyParser = require("body-parser");
const { spawn } = require('child_process');

let stdData;
let sa=false;

var PORT  = process.env.PORT || 5000;
var app = express();

app.listen(PORT, function () { console.log(`Listening on ${PORT}`) });

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));
app.use('/css', express.static(__dirname+'public/css'));
app.use('/js', express.static(__dirname+'public/js'));
app.use('/img', express.static(__dirname+'public/img'));
app.use('/vendor/jquery', express.static(__dirname+'public/vendor/jquery'));

app.engine('.ejs', require('ejs').renderFile);

app.get('/', function (req, res) {
    /*res.json({result: "OK", data:[1,2,3,4,5]});*/
    res.render('login', {fname: 'CS264', lName: 'GROUP1'});
});

app.get('/login', function (req, res) {res.render('login', {fname: 'CS264', lName: 'GROUP1'});})

app.get('/main', function (req, res) {res.render('main', {fname: 'CS264', lName: 'GROUP1'});})

app.get('/enroll_nor', function (req, res) {res.render('enroll_nor', {fname: 'CS264', lName: 'GROUP1'});})

app.get('/enroll_spe', function (req, res) {res.render('enroll_spe', {fname: 'CS264', lName: 'GROUP1'});})

app.get('/reqStatus', function (req, res) {res.render('main', {fname: 'CS264', lName: 'GROUP1'});})

app.get('/logout', async(req, res)=>{
  stdData=null;
  if(stdData=null){
    sa=false;
    res.render('login');
  }else{
    sa=false;
    res.render('login');
  }
  req.write(null);
  req.end();

});

app.get('/resq', async (req, res)=>{

  const ques = req.query;
  console.log('body '+ques['id_comments']);
  console.log('to str '+req.toString);

  if(ques!=null){
    res.redirect('enroll_nor');
  }else{
    console.log("this"+getData);
    res.redirect('enroll_nor');
}});

app.get('/api', async (req, res)=>{

  const ques = req.query;
  console.log('body '+ques['user']);
  console.log('to str '+req.toString);
  const getData = await loginAuthen(ques['user'], ques['pwd']);

  if(getData){
     let datax=JSON.parse(getData);
     stdData=JSON.parse(getData);
     if(datax.status==true){
        sa=true;
        res.render('main',{name_th: datax.displayname_th,});
     }else{
          let fails=JSON.parse(getData);
          //console.log("this "+fails.status);
          res.render('login', {message: fails.message, status:fails.status});
     }
     
  }else{
    console.log("this"+getData);
    return false;
  }
});

app.get("/main", async function(req, res){
  if(sa==false){
    return res.render('login');
  }else{
    var nameid = req.query.username;
    console.log(nameid);
    const data = await getStudentInfo(nameid);
    //console.log(data);
    if (data) {
      let j = JSON.parse(data);
      res.render("main",
      {prefix: j.data.prefixname,
        name_th: j.data.displayname_th,
        name_en: j.data.displayname_en,
        email: j.data.email,
        faculty: j.data.faculty,
        department: j.data.department
      });
    }
}
  
});

app.get("/profiles", async function(req, res){
  if(sa==false){
    return res.render('login');
  }else{
    var nameid = stdData.username;
    console.log(nameid);
    const data = await getStudentInfo(nameid);
    //console.log(data);
    if (data) {
      let j = JSON.parse(data);
      res.render("profiles", 
      {prefix: j.data.prefixname,
       name_th: j.data.displayname_th,
       name_en: j.data.displayname_en,
       email: j.data.email,
       faculty: j.data.faculty,
       department: j.data.department
       });
    }
}
  
});

const getStudentInfo = (username) => {
    return new Promise((resolve, reject) => {
      var options = {
        method: "GET",
        hostname: "restapi.tu.ac.th",
        path: "/api/v2/profile/std/info/?id=" + username,
        headers: {
          "Content-Type": "application/json",
          "Application-Key":
            "TU5815b44223ac5e0414a9ebd07189e32c9984410e627890e41b6ddce0d711b0bb558fdfb73578cd9155ddfd4c7ccd7c80",
        },
      };
  
      var req = https.request(options, (res) => {
        var chunks = [];
  
        res.on("data", function (chunk) {
          chunks.push(chunk);
        });
  
        res.on("end", function (chunk) {
          var body = Buffer.concat(chunks);
          //result = body;
          resolve(body.toString());
          //result = chunks;
        });
  
        res.on("error", function (error) {
          console.error(error);
          reject(error);
        });
      });
  
      req.end();
    });
  };

const loginAuthen = (user, password)=>{
    return new Promise((resolve, reject)=>{
        var options = {
            'method': 'POST',
            'hostname': 'restapi.tu.ac.th',
            'path': '/api/v1/auth/Ad/verify',
            'headers': {
                'Content-Type': 'application/json',
                'Application-Key': 'TU5815b44223ac5e0414a9ebd07189e32c9984410e627890e41b6ddce0d711b0bb558fdfb73578cd9155ddfd4c7ccd7c80'
            }
        };
    
        var req = https.request(options, function (res) {
            
            var chunks = [];
        
            res.on("data", function (chunk) {
                chunks.push(chunk);
                //console.log('this is data : '+chunk);
            });
        
            res.on("end", function (chunk) {
                var body = Buffer.concat(chunks);
                //let j = JSON.parse(body);
                resolve(body.toString());
                //console.log('stdData : '+stdData.username);
            });
    
            res.on("error", function (error) {
                console.error(error);
                reject(error);
            });
    
        });
        //revieved_data
        var postData =  "{\n\t\"UserName\":"+user+",\n\t\"PassWord\":"+password+"\n}";
        req.write(postData);
        req.end();
    });
    
};