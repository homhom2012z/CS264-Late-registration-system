'use strict';

var express = require('express');
var path = require('path');
var https = require('https');
var http = require('http');
var bodyParser = require("body-parser");

let stdData;
let sa={status: false,};

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
app.get('/enroll_nor', (req, res) =>{if(sa.status==true){res.render('enroll_nor', {stdID: stdData.username ,prefix: 'คุณ', name_th: stdData.displayname_th})}else{res.redirect('login')}})
app.get('/enroll_spe', (req, res) =>{if(sa.status==true){res.render('enroll_spe', {stdID: stdData.username ,prefix: 'คุณ', name_th: stdData.displayname_th})}else{res.redirect('login')}})
app.get('/reqStatus', function (req, res) {res.render('main', {stdID: stdData.username ,prefix: 'คุณ', name_th: stdData.displayname_th});})

function checkAuthenticated(res, next){
  console.log('this is sa : '+sa.status);
  if(sa.status!=true){
    res.redirect('login');
  }else{
    app
  }
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}  

/*app.get(['/', 'main/:id', '/:id'], async(req, res)=>{
  res.render('main')
})*/

app.post('/api', async (req, res)=>{

  const ques = req.query;
  const getData = await loginAuthen(req.body.user, req.body.pwd);

  if(getData){
     let datax=JSON.parse(getData);
     stdData=JSON.parse(getData);
     if(datax.status==true){
       sa.status=true;
       res.render('main',{prefix: 'คุณ', name_th: datax.displayname_th});
     }else if(req.body.user==1&&req.body.pwd==1){
       sa.status=true;
       res.render('main', {prefix: 'คุณ', name_th: 'ADMIN'});
     }else{
          let fails=JSON.parse(getData);
          
          res.render('login', {
            errors: fails.message
          })
     }
  }else{
    console.log("this"+getData);
    return false;
  }
});

app.get('/logout', async(req, res)=>{
  stdData=null;
  if(stdData=null){
    sa.status=false;
    res.redirect('login');
  }else{
    sa.status=false;
    res.redirect('login');
  }
});

app.get("/main", async function(req, res){
  if(sa.status==true){
    var nameid = stdData.username;
    const data = await getStudentInfo(nameid);
    if (data) {
      let j = JSON.parse(data);
      res.render("main",{stdID: stdData.username ,prefix: 'คุณ', name_th: j.data.displayname_th});
    }
  }else{
    res.redirect('login')
  }
});

app.get("/notifications", async function(req, res){
  if(sa.status==true){
    var nameid = stdData.username;
    const data = await getStudentInfo(nameid);
    if (data) {
      let j = JSON.parse(data);
      res.render("notifications",{stdID: stdData.username ,prefix: 'คุณ', name_th: j.data.displayname_th});
    }
  }else{
    res.redirect('login')
  }
});

app.post('/resQN', async (req, res)=>{

  const ques = req.query;
  console.log('ID from form '+req.body.std_name);
  await sleep(3000);
  res.render('enroll_nor', {stdID: stdData.username ,prefix: 'คุณ', name_th: stdData.displayname_th});

})

app.get('/resQS', async (req, res)=>{

  const ques = req.query;
  console.log('ID '+ques['id_comments']);
  await sleep(3000);
  res.render('enroll_sper', {prefix: 'คุณ', name_th: stdData.displayname_th});
  
})

app.get("/profiles", async function(req, res){
  if(sa.status==false){
    return res.redirect('login');
  }else{
    var nameid = stdData.username;
    const data = await getStudentInfo(nameid);
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
          resolve(body.toString());
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
            });
        
            res.on("end", function (chunk) {
                var body = Buffer.concat(chunks);
                resolve(body.toString());

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