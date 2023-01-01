const express = require("express");

const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const fast2sms = require("fast-two-sms");
const { mogoUrl } = require("./keys");
mongoose.connect(mogoUrl);

require("./models");

const requireTokenAdmin =require('./requireTokenAdmin')

const requireDeliveryToken =require('./requireDeliveryToken')


const authRoutes = require("./authRoutes");
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(authRoutes);

mongoose.connect(mogoUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.connection.on("connected", () => {
  console.log("database connected ...");
});

mongoose.connection.on("error", (err) => {
  console.log("error occered... ", err);
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

 

/*
//customer data
app.get('/',requireToken,(res,req)=>{
    res.send({
        email:req.user.email,
        Name:req.user.Name,
        PhoneNumber:req.user.PhoneNumber,
       
        Role:req.user.Role,
      
        
    })

})

*/

//Admin data
app.get('/',(req,res)=>{

    res.send({"Server":"Server is running...."});

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



app.use((req, res, next) => { res.header({"Access-Control-Allow-Origin": "*"}); next(); })
//Twilio 
app.get('/send-text', (req, res) => {
    //Welcome Message
    res.send('From Food Mart')

    //_GET Variables
    const { textmessage } = req.query;

console.log("done");
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
   var options = {authorization :'w1kvUyI2XKeQLoNzOqr9TAJgihZ4tRfMFpnx7dlbBjHCuYG6aPh0jLoXTaZyRtEpwIbQzrKdH8xMP2cl' , message : 'Customer:- '+customername+'\t Mobile No:-'+phonenumber+' with Order Id:-'+orderid ,  numbers : ['7013325735']} 
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
    console.log("done");
})