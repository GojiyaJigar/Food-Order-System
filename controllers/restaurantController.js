const restaurantModel=require("../models/restaurantModel");

const getRestaurants=(req,res)=>{

restaurantModel.getAllRestaurants((err,result)=>{

if(err){
return res.status(500).json({
success:false,
message:"Database Error"
});
}

res.json({
success:true,
restaurants:result
});

});

};

module.exports={
getRestaurants
};