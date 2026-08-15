const db=require("../config/db");

const getAllRestaurants=(callback)=>{

const sql="SELECT * FROM restaurants ORDER BY rating DESC";

db.query(sql,callback);

};

module.exports={
getAllRestaurants
};