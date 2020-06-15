//app.js
var express = require('express');

var http = require('http');

var path = require('path');

var bodyParser = require('body-parser');

var hbs = require('express-handlebars');

var app = express();

const image2base64 = require('image-to-base64');

var router = express.Router();

var admin = require('firebase-admin');

var serviceAccount = require("./solar2-firebase-adminsdk-9pqmw-7a4d85acf3.json");
 
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://solar2.firebaseio.com/"
});

var db = admin.database();
var ref = db.ref("/");

app.listen(3000, function() {
    console.log('익스프레스 서버를 시작했습니다.' + '80');
});

app.use('/public', express.static(path.join(__dirname, './public')));
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.set('views', path.join(__dirname, './public'));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

router.route('/').get((req, res)=>{
    res.render('BBICstart.html');
});

router.route('/admin1').get((req, res)=>{
    res.render('BBICadmin2.html');
});

router.route('/login').get((req, res)=>{
    res.render('login_user.html');
});

router.route('/loginmart').get((req, res)=>{
    res.render('login_mart.html');
});

router.route('/output').get((req, res)=>{
    res.render('output.html');
});

router.route('/SignUp').get((req, res)=>{
    res.render('register1.html');
});

router.route('/admin').get((req, res)=>{
    res.render('admin.html');
});

router.route('/SignUpmart').get((req, res)=>{
    res.render('register.html');
});

router.route('/SignUpmartout').get((req, res)=>{
    res.render('SignUpmartout.html');
});

router.route('/admin').post((req, res)=>{
    console.log('SignUpmartout 처리함')
    var placeRef = ref.child("place")
    placeRef.child(req.body.place).set({
        place:req.body.place
    });
    res.redirect('/admin');

});

router.route('/output').post((req, res)=>{
    console.log('output 처리함')
    var user = {id:req.body.id, password:req.body.password}
    res.render('output.html', user);
});

router.route('/').post((req, res)=>{
    image2base64("req.files.upload") 
    .then(
        (response) => {
            console.log(response);
            var usersRef = ref.child("users")
            usersRef.child(req.body.id).set({
                id:req.body.id,
                password:req.body.password,
                name:req.body.name, 
                age:req.body.age,
                barcode:req.body.barcode,
                check:0,
                check2:0,
                point:0,
                image:response
            });
        }
    )
    .catch(
        (error) => {
            console.log(error); 
        }
    )
    console.log('SignUPout 처리함')
    
    res.redirect('/');
});

router.route('/admin1').post((req, res)=>{
    console.log('admin1 처리함')
    var usersRef = ref.child("users")
    
    usersRef.orderByChild("check").equalTo("1").once("value", function(data){
        
        var datapost = data.val();

        var code;
        for(var temp in datapost)
            code = temp;

        
        if(datapost[code].check2 == "2")
        {
            var points = parseInt(datapost[code].point);
            var births = parseInt(datapost[code].birth);

            var dataspe = 
            {
                name:datapost[code].name,
                year:1900 + parseInt(births/10000),
                month:parseInt(births/100%100),
                point:points + 10,
                image:datapost[code].image,
                hour:(new Date()).getHours(),
                minute:(new Date()).getMinutes()
            };  
            
            res.render('BBICadmin2.html', dataspe);
        }
    else{
        var points = parseInt(datapost[code].point);
        var birth = parseInt(datapost[code].birth);
        var dataspe = {
            name:datapost[code].name,
            age:datapost[code].age,
            year:2000 + parseInt(birth/10000),
            month:parseInt(birth/100%100),
            point:points + 10,
            image:datapost[code].image,
            hour:(new Date()).getHours(),
            minute:(new Date()).getMinutes()
        };
        res.render('BBICadmin1.html', dataspe);
    }
    });
});

app.use('/', router);

