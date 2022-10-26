const express = require('express');
const fast2sms = require('fast-two-sms')
const app = express();
const mongoose = require('mongoose')
const bodyParser = require('body-parser');
const cors = require("cors");
const mysql = require("mysql");
const {mogoUrl} = require('./keys');
mongoose.connect(mogoUrl)
const twilio = require('twilio'); 
require('./models');
const path = require("path");
const requireToken = require('./requireToken');
const requireTokenAdmin = require('./requireTokenAdmin');
const requireDeliveryToken =require('./requireDeliveryToken');
 
const accountSid = 'AC29f151cc8750b38df5b7a83a0e218e64';
const authToken = '4c4d95fa01eb63649db7e3aea00f8323'; 
const client = new twilio(accountSid, authToken);

const multer = require("multer");
const FCM =require('fcm-node');
const Servicekey ='AAAAuXQ682g:APA91bFUnxuthqY-nTMFAEHoKBTo5hZ89Ld9k2RLyIEPt7WEMc4xAYr9NLIk_gYq69DFlL99zXwxbH9a4Php8LU2Lgj-NLM7Dj3IJEiuXRWlS-vnWIzgG3o5OQj-fRrSspAXmUtkhkQM'; 

const authRoutes = require('./authRoutes');
const { validateRequest } = require('twilio/lib/webhooks/webhooks');
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({extended:true}));

app.use(authRoutes)
app.use(express.static(__dirname + '/images'));

mongoose.connect(mogoUrl,{
    useNewUrlParser:true,
    useUnifiedTopology:true
})
mongoose.connection.on('connected',()=>{
    console.log("database connected ...")
})


mongoose.connection.on('error',(err)=>{
    console.log("error occered... ",err);
})

 

const db1 = mysql.createPool({
    connectionLimit:10,
    host:"localhost",
    user:"root",
    password:"",
    database:"studentsdata"
})



 

const Item = mongoose.model('Items');

const fileStorageEngine = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "./images"); //important this is a direct path fron our current file to storage location
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + "--" + file.originalname);
    },
  });
  
  
app.use('/items', express.static('./images'));
const upload = multer({ storage: fileStorageEngine });
  
  // Single File Route Handler


app.post("/single", upload.single("image","Name"), async(req, res) => {
    console.log(req.file.filename);
    
    console.log(req.body.ItemName+"-"+req.body.Price);
    const {ItemName,ItemPrice,ItemDiscription,ShopName,ShopId,ItemId,AdminId,ItemType,ItemCategory} = req.body;
    var ProductImage="items/"+req.file.filename
  try{
    const item = new Item({ItemName,ItemPrice,ProductImage,ItemDiscription,ShopName,ShopId,ItemId,AdminId,ItemType,ItemCategory});
    await  item.save();
    
  }catch(err){
    return res.status(422).send(err.message)
  } 

    res.send("Single FIle upload success");
});
  
  // Multiple Files Route Handler
app.post("/multiple", upload.array("images", 3), (req, res) => {
    console.log(req.files);
    res.send("Multiple Files Upload Success");
});
  
function errHandler(err, req, res, next) {
    if (err instanceof multer.MulterError) {
        res.json({
            success: 0,
            message: err.message
        })
    }
}
app.use(errHandler);

 


//customer data
app.get('/',requireToken,(res,req)=>{
    res.send({
        email:req.user.email,
        Name:req.user.Name,
        PhoneNumber:req.user.PhoneNumber,
       
        Role:req.user.Role,
      
        
    })

})



//Admin data

app.get('/GetAdmin',requireTokenAdmin,(req,res)=>{
    res.send({
        email:req.user.email,
        Name:req.user.Name,
        PhoneNumber:req.user.PhoneNumber,
        ShopName:req.user.ShopName,
        Role:req.user.Role,
        Address:req.user.Address,
        ShopPhoto:req.user.ShopPhoto,
        AdminId:req.user.AdminId,
        ShopType:req.user.ShopType,
        Deliverycharges:req.user.Deliverycharges,
        _id:req.user._id,
        DeliveryTime:req.user.DeliveryTime,
        ShopStatus:req.user.ShopStatus
    })

    
})


//delivery boy data

app.get('/GetDeliveryMan',requireDeliveryToken,(req,res)=>{
    res.send({
        email:req.user.email,
        Name:req.user.Name,
        PhoneNumber:req.user.PhoneNumber,
        id:req.user.id,
        Latitude:req.user.Latitude,
        Longitude:req.user.Longitude,
        AdhurCard:req.user.AdhurCard,
        _id:req.user._id,
        
    })

})



app.use((req, res, next) => {
    res.header({"Access-Control-Allow-Origin": "*"});
    next();
  }) 
//Twilio 
app.get('/send-text', (req, res) => {
    //Welcome Message
    res.send('From Food Mart')

    //_GET Variables
    const { textmessage } = req.query;


    //Send Text
    client.messages.create({
        body: textmessage,
        to:"+917993031882",  // Text this number
        from: '+19125203533' // From a valid Twilio number
    }).then((message) => console.log(message.body));
})
 
/*

const options = {
    url: 'https://api.enablex.io/sms/v1/messages/',
    json: true,
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic NjMzYzNhNzcwMjhiODUwZWQ2NGRiMDA0OmF1amFaeTl1Z2U5ZVp5RHVIdURhSnVMZXVlWnltYW11dnl5ZQ==',
    },
    body: {
        body: "This is a test SMS from EnableX, Asia's fastest growing, full-stack, omni-channel CPaaS platform. This SMS was sent only for testing purposes.",
        type: "sms",
        data_coding: "auto",
        campaign_id: "45645229", 
        to: ["+917993031882"],
        from: "ENABLX",
        template_id: "901"        
    }
};   

app.post( "/testsms", (err, res, body,options) => {
    if (err) {
        return console.log(err);
    }
    console.log(`Status: ${res.statusCode}`);
    console.log(body);
});
*/
/*
app.post('/textbelt.com/text', {
  form: {
    phone: '+917993031882',
    message: 'Hello world',
    key: 'bd12d70ed231771b030e39767c2dc64e898a8604GvAIYrtMRJnKpS5r3d95LQ6oH',
  },
}, (err, httpResponse, body) => {
  console.log(JSON.parse(body));
});
*/

app.get('/sendOrderAsSms',async (req,res)=>{
    const orderid = req.query.OrderId ;
    const customername = req.query.CustomerName ;
    const phonenumber = req.query.PhoneNumber ;
   var options = {authorization :'w1kvUyI2XKeQLoNzOqr9TAJgihZ4tRfMFpnx7dlbBjHCuYG6aPh0jLoXTaZyRtEpwIbQzrKdH8xMP2cl' , message : 'Customer:- '+customername+'\t Mobile No:-'+phonenumber+' with Order Id:-'+orderid ,  numbers : ['7993031882']} 
    const response = await fast2sms.sendMessage(options)
 
     res.send(response)
     console.log(orderid,customername,phonenumber);
     console.log("hii")

})


/*
app.post('/SendNotification',async(req,res,next)=>{
    try{

        let fcm =new FCM(Servicekey);
        let keyy='BF4iYV_xnrUfuEzqYFmMwWlPGu0OOBkXqPGzbEA_liAucUOwrCL3H8XUsX7CwPnkVNkz3nkl4qY10SEqADkgiF0'
        let message={
            to:keyy+'/'+req.body.topics,
            notification:{
                title:req.body.title,
                body:req.body.body,
                sound:'default',
                "icon":"fcm_push_icon"
            },
            data:req.body.data
        }
        fcm.send(message,(err,response)=>{
            if(err){
                next(err);
            }
            else{
                    res.json(response);
            }
        })
    }catch(error){
            next(error)
    }
})
*/

app.listen(process.env.PORT || 5000,()=>{
    console.log("server is runnung on port 5000");
})