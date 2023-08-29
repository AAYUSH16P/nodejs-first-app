import express from "express";
import path from "path";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";


mongoose.connect("mongodb://127.0.0.1:27017",{dbName:"backend",
}).then(()=> console.log("database connected")).catch((e)=> console.log(e));





const userSchema= new mongoose.Schema({
    name:String,
    email: String,
    password: String,

});







const User = mongoose.model("User",userSchema);
const app = express();





//using middleware
app.use(express.static(path.join(path.resolve(),"public")));
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());





//setting up view engine
app.set("view engine","ejs");






const isAuthenticated = async(req,res,next) =>{
 const {token } = req.cookies;
  
 if( token ){
    
    const decoded = jwt.verify(token,"jbwnskwmps");
    
     req.user = await User.findById(decoded._id);
    next();
 }
 else{
    res.redirect("/login");
 }
};


app.get("/",isAuthenticated,(req,res) =>{ 
    res.render("logout",{name:req.user.name});
});




app.get("/login",(req,res)=>{
    res.render("login");
})



app.get("/register",(req,res) =>{
    res.render("register");
})


app.get("/notification",(req,res)=>{
    res.render("notification");
})



app.post("/login",async(req,res)=>{
    const {email,password} = req.body;

    let user = await User.findOne({email});

    if(!user) return res.redirect("/register");

    const isMatch= await bcyrt.compare(password,user.password);


    if(!isMatch) return res.render("login",{message:"Incorrect password"});

    const token =jwt.sign({_id:user._id},"jbwnskwmps");
   
    res.cookie("token",token,{
        httpOnly:true,
        expires: new Date(Date.now()+60*1000),
    });
})





app.post("/register",async(req,res)=>{
   const { name,email,password} = req.body; 


   let user = await User.findOne({email});
   
   if(user){

    return res.redirect("/notification");
   }
   
   const hashedPassword = await bcyrt.hash(password,10);

   user = await User.create({
    name,
    email,
    password,
   });

   const token =jwt.sign({_id:user._id},"jbwnskwmps");
   
    res.cookie("token",token,{
        httpOnly:true,
        expires: new Date(Date.now()+60*1000),
    });
    res.redirect("/");

});



app.get("/logout",(req,res)=>{
    res.cookie("token",null ,{
        httpOnly:true,
        expires: new Date(Date.now()),
    });
 
    res.redirect("/")
});




app.listen(5000,()=>{
    console.log("server is working");
});

