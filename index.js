const express = require('express');
 
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
require("dotenv").config();
const accountSid = 'AC29f151cc8750b38df5b7a83a0e218e64';
const authToken = '4c4d95fa01eb63649db7e3aea00f8323'; 
const client = new twilio(accountSid, authToken);

const multer = require("multer");
 

const authRoutes = require('./authRoutes');
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
    const {ItemName,ItemPrice,ItemDiscription,ShopName,ShopId,ItemId} = req.body;
    var ProductImage="items/"+req.file.filename
  try{
    const item = new Item({ItemName,ItemPrice,ProductImage,ItemDiscription,ShopName,ShopId,ItemId});
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

 
 
app.get('/',requireToken,(res,req)=>{
    res.send({
        email:req.user.email,
        Name:req.user.Name,
        PhoneNumber:req.user.PhoneNumber,
       
        Role:req.user.Role,
      
        
    })

})

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
        
    })

    
})

app.get('/GetDeliveryMan',requireDeliveryToken,(req,res)=>{
    res.send({
        email:req.user.email,
        Name:req.user.Name,
        PhoneNumber:req.user.PhoneNumber,
        id:req.user.id,
        Latitude:req.user.Latitude,
        Longitude:req.user.Longitude,
        AdhurCard:req.user.AdhurCard,
        
    })

})


//Twilio 
app.get('/send-text', (req, res) => {
    //Welcome Message
    res.send('From Food Mart')

    //_GET Variables
    const { recipient, textmessage } = req.query;


    //Send Text
    client.messages.create({
        body: textmessage,
        to:"+91"+recipient,  // Text this number
        from: '+19125203533' // From a valid Twilio number
    }).then((message) => console.log(message.body));
})
 

app.listen(process.env.PORT || 5000,()=>{
    console.log("server is runnung on port 5000");
})