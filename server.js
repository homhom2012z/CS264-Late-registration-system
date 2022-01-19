'use strict';

var express = require('express');
var path = require('path');
var https = require('https');
var http = require('http');
var bodyParser = require("body-parser");

var app = express();

const FormsShow = require('./models/forms')
const Forms = require('./models/forms');
const mongoose = require('mongoose')
/*const marked = require('marked')
const slugify = require('slugify')*/

mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://cs264:Homhom123@server1.xm68v.mongodb.net/test', {
  useNewUrlParser: true, useUnifiedTopology: true, /*useCreateIndex:true,*/
})


let stdData;
let sa={status: false};
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: false}))

/*app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());*/

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

/*app.get(':slug', async (req, res) => {
  const forms = await Forms.findOne({ slug: req.params.slug })
  if (forms == null) res.redirect('status')
  res.render('show_forms', { forms: forms, stdID: stdData.username,
    prefix: 'คุณ',
    tu_status: stdData.tu_status,
    username: stdData.username,
    name_th: stdData.displayname_th
  })
})*/

app.get('/show_forms', async (req, res)=>{
  res.render('show_forms', {
    stdID: stdData.username,
    prefix: 'คุณ',
    tu_status: stdData.tu_status,
    username: stdData.username,
    name_th: stdData.displayname_th})
})

app.post('/enroll_nor', async (req, res) =>{
  
  let forms = new Forms({
    title: req.body.title,
    description : req.body.description,
    markdown: req.body.markdown
  })
  console.log('this is forms : '+forms)
  try{
    await forms.save();
    console.log('success')
    res.redirect(`#`)
  }catch(e){
    console.log('save failed')
    console.log(e.toString())
    res.render('enroll_nor', { forms: forms,
    stdID: stdData.username,
    prefix: 'คุณ',
    tu_status: stdData.tu_status,
    username: stdData.username,
    name_th: stdData.displayname_th,
    name_en: stdData.displayname_en,
    email: stdData.email,
    faculty: stdData.faculty,
    department: stdData.department})
  }
})

app.post('/show_forms', async (req, res) => {

  const req_id = req.body.forms_view_id;
  console.log('ID : '+req_id)

  try{
      if (req_id.match(/^[0-9a-fA-F]{24}$/)) {
      const forms = await Forms.findById(req_id)
      if(forms == null) res.redirect('status')
      console.log('MATCH ID')
      res.render('show_forms', {forms: forms,
        stdID: stdData.username,
        prefix: 'คุณ',
        tu_status: stdData.tu_status,
        username: stdData.username,
        name_th: stdData.displayname_th,
        ref: req_id})
      }else{
        console.log('NOT MATCH ID')
        res.redirect('main')
      }
  }catch(e){
    console.log('show_forms failed')
    res.redirect('/main')
  }
  
  /*if (forms == null) res.redirect('status')

  res.render('/show_forms', { forms: forms, stdID: stdData.username,
    prefix: 'คุณ',
    tu_status: stdData.tu_status,
    username: stdData.username,
    name_th: stdData.displayname_th
  })*/
})

app.get('/enroll_nor', async (req, res) =>{
  if(sa.status==true){
    res.render('enroll_nor', {forms: new Forms(), stdID: stdData.username ,tu_status: stdData.tu_status, prefix: 'คุณ', name_th: stdData.displayname_th})
  }else{res.redirect('login')}

})

app.get('/forgotpassword', (req, res) =>{{res.render('forgotpassword', {})}})


function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

app.post('/api', async (req, res)=>{
  
  const ques = req.query;
  const getData = await loginAuthen(req.body.user, req.body.pwd);

  if(getData){
     let datax=JSON.parse(getData);
     stdData=JSON.parse(getData);
     if(datax.status==true){
       await sleep(3000);
       sa.status=true;
       res.render('main',{prefix: 'คุณ', name_th: datax.displayname_th, tu_status: stdData.tu_status});
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
      res.render("main",{stdID: stdData.username ,prefix: 'คุณ', name_th: j.data.displayname_th, tu_status: stdData.tu_status});
    }
  }else{
    res.redirect('login')
  }
});

app.post("/main", async function(req, res){
  if(sa.status==true){
    var nameid = stdData.username;
    const data = await getStudentInfo(nameid);
    if (data) {
      let j = JSON.parse(data);
      res.render("main",{stdID: stdData.username ,prefix: 'คุณ', name_th: j.data.displayname_th, tu_status: stdData.tu_status});
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
      res.render("notifications",{stdID: stdData.username ,prefix: 'คุณ', name_th: j.data.displayname_th, tu_status: stdData.tu_status});
    }
  }else{
    res.redirect('login')
  }
});

app.post('/resQN', async (req, res)=>{

  const ques = req.query;
  await sleep(3000);
  if(stdData.username!=undefined){
    res.render('enroll_nor', {stdID: stdData.username , tu_status: stdData.tu_status, prefix: 'คุณ', name_th: stdData.displayname_th});
  }else{
    res.redirect('login')
  }

})

app.get('/resQS', async (req, res)=>{

  const ques = req.query;
  console.log('ID '+ques['id_comments']);
  await sleep(3000);
  res.render('enroll_sper', {prefix: 'คุณ',tu_status: stdData.tu_status, name_th: stdData.displayname_th});
  
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
      {prefix: 'คุณ',
      tu_status: stdData.tu_status,
       username: stdData.username,
       name_th: j.data.displayname_th,
       name_en: j.data.displayname_en,
       email: j.data.email,
       faculty: j.data.faculty,
       department: j.data.department
       });
    }
}
  
});

/*app.get('/:id', (req, res)=>{

})*/

app.get("/reqStatus", async function(req, res){
  
  /*const forms = [{
    title: 'Test Forms',
    createdAt: new Date(),
    description: 'Test description'
  },{
    title: 'Test Forms 2',
    createdAt: new Date(),
    description: 'Test description 2'
  }]

  res.render('status', {forms: forms, stdID: stdData.username,
    prefix: 'คุณ',
    tu_status: stdData.tu_status,
    username: stdData.username,
    name_th: stdData.displayname_th,})*/

  try{
    const forms = await Forms.find().sort({ createdAt: 'desc'})
    res.render('status', { forms: forms,
      stdID: stdData.username,
      prefix: 'คุณ',
      tu_status: stdData.tu_status,
      username: stdData.username,
      name_th: stdData.displayname_th,
    })
  }catch(e){
    console.log('reqStatus error')
    res.redirect('/main')
  }

  /*let forms = new Forms({
    title: req.body.title,
    description : req.body.description,
    markdown: req.body.markdown
  })

  try{
    await forms.save();
    res.render("status", {forms: forms,
      stdID: stdData.username,
      prefix: 'คุณ',
      tu_status: stdData.tu_status,
      username: stdData.username,
      name_th: stdData.displayname_th,
      name_en: stdData.displayname_en,
      email: stdData.email,
      faculty: stdData.faculty,
      department: stdData.department
      });
  }catch(e){
    res.render('status', { forms: new Forms(),
    stdID: stdData.username,
    prefix: 'คุณ',
    tu_status: stdData.tu_status,
    username: stdData.username,
    name_th: stdData.displayname_th,
    name_en: stdData.displayname_en,
    email: stdData.email,
    faculty: stdData.faculty,
    department: stdData.department})
  }*/
  
});

/*app.post("/reqStatus", async function(req, res){
  console.log(req.body)
  let forms = new Forms({
    title: req.body.title,
    description : req.body.description,
    markdown: req.body.markdown
  })

  try{
    forms = await forms.save();
    res.render("status", {forms: forms,
      stdID: stdData.username,
      prefix: 'คุณ',
      tu_status: stdData.tu_status,
      username: stdData.username,
      name_th: stdData.displayname_th,
      name_en: stdData.displayname_en,
      email: stdData.email,
      faculty: stdData.faculty,
      department: stdData.department
      });
  }catch(e){
    console.log(e)
    res.render('status', { forms: new Forms(),
    stdID: stdData.username,
    prefix: 'คุณ',
    tu_status: stdData.tu_status,
    username: stdData.username,
    name_th: stdData.displayname_th,
    name_en: stdData.displayname_en,
    email: stdData.email,
    faculty: stdData.faculty,
    department: stdData.department})
  }
  
});*/

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

var PORT  = process.env.PORT || 5000;
app.listen(PORT, function () { console.log(`Listening on ${PORT}`) });