    var options = {
            'method': 'POST',
            'hostname': 'restapi.tu.ac.th',
            'path': '/api/v1/auth/Ad/verify',
            'headers': {
                'Content-Type': 'application/json',
                'Application-Key': 'TU5815b44223ac5e0414a9ebd07189e32c9984410e627890e41b6ddce0d711b0bb558fdfb73578cd9155ddfd4c7ccd7c80'
            },
            'body':{
                'UserName' : res.query['user'],
                'PassWord' : res.query['pwd'],
            }
    };
    
    var req = https.request(options, function (res) {

        var chunks = [];
    
        res.on("data", function (chunk) {
        chunks.push(chunk);
        });
    
        res.on("end", function (chunk) {
        var body = Buffer.concat(chunks);
        console.log(body.toString());
        });
    
        res.on("error", function (error) {
        console.error(error);
        });

    });

    var postData =  "{\n\t\"UserName\":\"{username}\",\n\t\"PassWord\":\"{password}\"\n}";
    req.write(postData);
    req.end();