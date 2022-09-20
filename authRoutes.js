const express = require('express')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const {jwtkey} = require('./keys');
const { ORDER } = require('mysql/lib/PoolSelector');
const router = express.Router();
const User = mongoose.model('User');
const Delivery = mongoose.model('Delivery')
 
const Orders = mongoose.model('Orders');
const AdminUser = mongoose.model('AdminUser');
const Item = mongoose.model('Items');
const SuperAdmin = mongoose.model('SuperAdminSchema');



const Coupon = mongoose.model('CouponSchema');

const AddAddress = mongoose.model('AddAddressSchema');

 

router.get('/CheckCouponCode', function(req, res, next) {
 
  const id  =req.query.id;
  const couponcode = req.query.coupon;
   
  Coupon.find({CouponCode:couponcode},(err, docs) => {
        if(docs.length>0) {
          
              Orders.find({CouponCode:couponcode,CustomerId:id},(err, docss) => {
                if(docss,length>0) {
                  
                      res.send({"Status":"error"})
        
                } else {
                  res.send(docs);
                }
            });


        } else {
          res.send({"Status":"error"})
        }
    });
    
  
});



router.post('/AddCoupon',async (req,res)=>{
   
  const {CouponCode,Amount,Percentage,ShopId} = req.body;

  try{
    const user = new Coupon({CouponCode,Amount,Percentage,ShopId});
    await  user.save();
    res.send("Done");
  }catch(err){
    return res.status(422).send(err.message)
  }
  
  
})




router.get('/GetUserAddresses', function(req, res, next) {
 
  const id  =req.query.id;
   
  AddAddress.find({Id:id},(err, docs) => {
        if(docs.length>0) {
          res.send(docs);
        } else {
          res.send({"Status":"No"});
        }
    });
    
  
});





router.post('/AddUserAddresses',async (req,res)=>{
   
  const {Id,VillageName,PinCode,DoorNo,Landmark,Street } = req.body;

  try{
    const user = new AddAddress({Id,VillageName,PinCode,DoorNo,Landmark,Street});
    await  user.save();
    res.send("Done");
  }catch(err){
    return res.status(422).send(err.message)
  }
  
  
})






 
router.post('/UserSignuporSigin',async (req,res)=>{
   
  const {PhoneNumber,email,Name,Role,Address,Id } = req.body;
  let user=false
    try{

      User.find({Id:Id},(err, docs)  => {
        if (docs.length>0) {
             res.send(docs);
        } else {
          const user = new User({PhoneNumber,email,Name,Role,Address,Id });
           user.save();
        }
    });
  
     // const token = jwt.sign({userId:user._id},jwtkey)
    //  res.send({token})

    }catch(err){
      return res.status(422).send(err.message)
    }
    
})


router.get('/GetUserNewOrOld', function(req, res, next) {
 
  const id  =req.query.id;
   
  User.find({PhoneNumber:"+91"+id},(err, docs) => {
        if(docs.length>0) {
          res.send({"Status":"Yes"});
        } else {
          res.send({"Status":"No"});
        }
    });
    
  
});


router.post('/UserDeliveryMansignup',async (req,res)=>{
   
  const {email,password,Name,PhoneNumber,id,Latitude,Longitude,AdhurCard} = req.body;

  try{
    const user = new Delivery({email,password,Name,PhoneNumber,id,Latitude,Longitude,AdhurCard});
    await  user.save();
    const token = jwt.sign({userId:user._id},jwtkey)
    res.send({token})

  }catch(err){
    return res.status(422).send(err.message)
  }
  
  
})



router.post('/UserDeliveryMansignin',async (req,res)=>{
  const {email,password} = req.body
  if(!email || !password){
      return res.status(422).send({error :"must provide email or password"})
  }
  const user = await Delivery.findOne({email})
  if(!user){
      return res.status(422).send({error :"must provide email or password"})
  }
  try{
    await user.comparePassword(password);    
    const token = jwt.sign({userId:user._id},jwtkey)
    res.send({token})
  }catch(err){
      return res.status(422).send({error :"must provide email or password"})
  }

})
/*
router.post('/DeliveryUserSignUp',async (req,res)=>{
   
  const {email,Name,PhoneNumber,AdhurCard,Latitude,Longitude,id} = req.body;

  try{
    const user = new User({email,Name,PhoneNumber,AdhurCard,Latitude,Longitude,id});
    await  Delivery.save();
    
    res.send("User Created")

  }catch(err){
    return res.status(422).send(err.message)
  }
  
  
})
*/

router.put('/LocationUpdate',async (req,res)=>{
  const {PhoneNumber,Latitude,Longitude} = req.body
  const user = await Delivery.findOne({PhoneNumber})
  Delivery.findByIdAndUpdate(user._id,{Latitude:Latitude,Longitude:Longitude},{useFindAndModify:false})
  .then(data=>{
    res.send(data);
  })
  .catch(err=>{
    res.send("error....!");
  })
})
 



router.post('/UserSignin',async (req,res)=>{
    const {email,password} = req.body
    if(!email || !password){
        return res.status(422).send({error :"must provide email or password"})
    }
    const user = await User.findOne({email})
    if(!user){
        return res.status(422).send({error :"must provide email or password"})
    }
    try{
      await user.comparePassword(password);    
      const token = jwt.sign({userId:user._id},jwtkey)
      res.send({token})
    }catch(err){
        return res.status(422).send({error :"must provide email or password"})
    }

})




// Admin siginin 

router.post('/AdminSignup',async (req,res)=>{
   
  const {email,password,PhoneNumber,Name,Role,ShopName,Address,AdminId,ShopPhoto,ShopType} = req.body;

  try{
    const user = new AdminUser({email,password,PhoneNumber,Name,Role,ShopName,Address,AdminId,ShopPhoto,ShopType});
    await  user.save();
    const token = jwt.sign({userId:user._id},jwtkey)
    res.send({token})

  }catch(err){
    return res.status(422).send(err.message)
  }
  
  
})


//Admin siginup

router.post('/AdminSignin',async (req,res)=>{
  const {email,password} = req.body
  if(!email || !password){
      return res.status(422).send({error :"must provide email or password"})
  }
  const user = await AdminUser.findOne({email})
  if(!user){
      return res.status(422).send({error :"must provide email or password"})
  }
  try{
    await user.comparePassword(password);    
    const token = jwt.sign({userId:user._id},jwtkey)
    res.send({token})
  }catch(err){
      return res.status(422).send({error :"must provide email or password"})
  }
  


})








router.post('/AddItem',async (req,res)=>{
   
  const {ItemName,ItemPrice,ProductImage,ItemDiscription,ShopName,ShopId,AdminId,ItemType,ItemCategory} = req.body;

  try{
    const user = new User({ItemName,ItemPrice,ProductImage,ItemDiscription,ShopName,ShopId,AdminId,ItemType,ItemCategory});
    await  Item.save();
    
  }catch(err){
    return res.status(422).send(err.message)
  } 
})



router.get('/GetRestorents', function(req, res, next) {
  const id =  req.query.id;
  if(id==="All" ||id===""){
    AdminUser.find((err, docs) => {
      if (!err) {
           res.send(docs);
      } else {
          console.log('Failed to retrieve the Course List: ' + err);
      }
    });
  }
  else{
      AdminUser.find({Address:id},(err, docs) => {
        if (!err) {
            res.send(docs);
        } else {
            console.log('Failed to retrieve the Course List: ' + err);
        }
     });
  }
  

});




router.get('/GetItems', function(req, res, next) {
  const id=  req.query.id;
  const itemname = req.query.itemname;
  if(itemname==="All" ||itemname===""){
    Item.find({ShopId:id},(err, docs) => {
      if (!err) {
           res.send(docs);
      } else {
          console.log('Failed to retrieve the Course List: ' + err);
      }
    });
  }
  else{
    Item.find({ShopId:id,ItemName:itemname},(err, docs) => {
      if (!err) {
           res.send(docs);
      } else {
          console.log('Failed to retrieve the Course List: ' + err);
      }
    });
  }
  

});



//get items to admin panel
router.get('/GetAdminItem', function(req, res, next) {
  const id=  req.query.id;
 
    Item.find({ShopId:id},(err, docs) => {
      if (!err) {
           res.send(docs);
      } else {
          console.log('Failed to retrieve the Course List: ' + err);
      }
    });
  
  

});



//delete item card from admin

router.get('/deleteItem', function (req, res) {
  var id = req.query.id;
  
 
  Item.deleteOne({ _id:id}, function (err, results) {
    if(!err){
      console.log("Deleted successfully");
    }
  });

  res.json({ success: id })
});


//place order

router.post('/Orders',async (req,res)=>{
   
  const {CustomerName,ContactNo,orderList,Amount,CustomerAddress,CurrentLocation,OrderStatus,AdminId,CustomerId,DeliveryManId,OrderOtp,OrderId,ShopName,OrderTime,CouponCode} = req.body;

  try{
    const user = new Orders({CustomerName,ContactNo,orderList,Amount,CustomerAddress,CurrentLocation,OrderStatus,AdminId,CustomerId,DeliveryManId,OrderOtp,OrderId,ShopName,OrderTime,CouponCode});
    await  user.save();
    res.send("done")
    
  }catch(err){
    return res.status(422).send(err.message)
  } 
})


//admin orders

router.get('/GetOrders', function(req, res, next) {
  const id =  req.query.id;
  Orders.find({AdminId:id},(err, docs) => {
      if (!err) {
           res.send(docs);
      } else {
          console.log('Failed to retrieve the Course List: ' + err);
      }
  });
  

});


router.get('/GetOrdersForSuperAdmin', function(req, res, next) {
  
  Orders.find((err, docs) => {
      if (!err) {
           res.send(docs);
      } else {
          console.log('Failed to retrieve the Course List: ' + err);
      }
  });
  

});




//user orders

router.get('/GetUserOrders', function(req, res, next) {
  const id ="+"+req.query.id.replaceAll('"', '');

 console.log(id.replace(/ /g,''))
  Orders.find({PhoneNumber:id.replace(/ /g,'')},(err, docs) => {
      if (!err) {
           res.send(docs);
      } else {
          console.log('Failed to retrieve the Course List: ' + err);
      }
  });
  

});





///customer data

router.get('/GetUser', function(req, res, next) {
  const id ="+"+req.query.id.replaceAll('"', '');
 
 console.log(id.replace(/ /g,''))
  User.find({PhoneNumber:id.replace(/ /g,'')},(err, docs) => {
      if (!err) {
           res.send(docs);
      } else {
          console.log('Failed to retrieve the Course List: ' + err);
      }
  });
  

});






//update about orders///////


router.put('/UpdateDeliveryOrderStatus',async (req,res)=>{
  const {status,orderId,deliverymanid} = req.body
 
  Orders.findByIdAndUpdate(orderId,{DeliveryManId:deliverymanid,OrderStatus:status},{useFindAndModify:false})
  .then(data=>{
    res.send(data)
  })
  .catch(err=>{
    res.send("error....!");
  })
})


///////////////


router.put('/OrderAcceptanceStatus',async (req,res)=>{
  const {status,orderId} = req.body
 
  Orders.findByIdAndUpdate(orderId,{ OrderStatus:status},{useFindAndModify:false})
  .then(data=>{ 
    res.send(data);
  })
  .catch(err=>{
    res.send("error....!");
  })
})


/////

router.put('/OrderCancel',async (req,res)=>{
  const {status,orderId} = req.body
 
  Orders.findByIdAndUpdate(orderId,{ OrderStatus:status},{useFindAndModify:false})
  .then(data=>{
    res.send(data);
  })
  .catch(err=>{
    res.send("error....!");
  })
})




router.post('/OrderDelivered', function(req, res, next) {
  const {otp,id} = req.body
  Orders.find({OrderOtp:otp,_id:id},(err, docs) => {
      if (docs.length>0) {
            Orders.findByIdAndUpdate(id,{ OrderStatus:"Delivered"},{useFindAndModify:false})
            .then(data=>{
              res.send(data)
            })
            .catch(err=>{
              //
            })
      } else {
        res.send({"status":"Order not Done"});
      }
  });
});


//get order for delivery boys

router.get('/GetOrdersByStatus', function(req, res, next) {
  const status =  req.query.status.replaceAll('"', '');

  Orders.find({OrderStatus:status},(err, docs) => {
      if (!err) {
           res.send(docs);
      } else {
          console.log('Failed to retrieve the Course List: ' + err);
      }
  });
  

});



router.post('/UserOrderDelivered', function(req, res, next) {
  const {otp,id} = req.body
  User.find({OrderOtp:otp,_id:id},(err, docs) => {
      if (docs.length>0) {
            Orders.findByIdAndUpdate(id,{ OrderStatus:"Delivered"},{useFindAndModify:false})
            .then(data=>{
              res.send(data)
            })
            .catch(err=>{
              //
            })
      } else {
        res.send({"status":"Order not Done"});
      }
  });
});



router.put('/UpdateUserDetails',async (req,res)=>{
  const {PhoneNumber,Name,Address,Id} = req.body
  
  User.findByIdAndUpdate(Id,{PhoneNumber:PhoneNumber,Name:Name,Address:Address},{useFindAndModify:false})
  .then(data=>{
    res.send(data);
  })
  .catch(err=>{
     console.log("error");
  })
})



router.get('/GetOrdersOfDeliveryBoy', function(req, res, next) {
  const id =  req.query.id.replaceAll('"', '');
  const status =  req.query.status.replaceAll('"', '');

  Orders.find({DeliveryManId:id,OrderStatus:status},(err, docs) => {
      if (!err) {
           res.send(docs);
      } else {
          console.log('Failed to retrieve the Course List: ' + err);
      }
  });
  console.log(id,status);
  

});



router.get('/GetAdmins', function(req, res, next) {
  

  AdminUser.find({Role:"Admin"} ,(err, docs) => {
      if (!err) {
           res.send(docs);
      } else {
          console.log('Failed to retrieve the Course List: ' + err);
      }
  });
  

});


router.get('/GetUsers', function(req, res, next) {
 

  User.find( (err, docs) => {
      if (!err) {
           res.send(docs);
      } else {
          console.log('Failed to retrieve the Course List: ' + err);
      }
  });
  

});



router.get('/GetItemsByCat', function(req, res, next) {
 
const id  =req.query.id;
console.log(id)
  Item.find({ItemType:"Starters"},(err, docs) => {
      if (docs.length>0) {
           res.send(docs);
      } else {
        res.send("done")
          console.log('Failed to retrieve the Course List: ' + err);
      }
  });
  

});

router.get('/GetItemByVegOrNonVeg', function(req, res, next) {
 
  const id  =req.query.id;
    Item.find({ItemCategory:id},(err, docs) => {
        if (!err) {
             res.send(docs);
        } else {
            console.log('Failed to retrieve the Course List: ' + err);
        }
    });
    
  
  });


router.get('/GetShopsByType', function(req, res, next) {
 
    const id  =req.query.id;
      AdminUser.find({ShopType:id},(err, docs) => {
          if (!err) {
               res.send(docs);
          } else {
              console.log('Failed to retrieve the Course List: ' + err);
          }
      });
      
    
});

router.get('/GetDeliveryLocation', function(req, res, next) {
 
  const id  =req.query.id;
    Delivery.find({_id:id},(err, docs) => {
        if (!err) {
             res.send(docs);
        } else {
            console.log('Failed to retrieve the Course List: ' + err);
        }
    });
    
  
});




module.exports = router