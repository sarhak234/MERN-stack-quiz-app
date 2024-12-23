const adminauth=(req,res)=>{
    //ab dekho, hume bas ek bande kaa hi loginkarwana hai, har kisi ka nahi
    try {
        const {name,email,password}=req.body;
    if(name.toLowerCase()=='sudhir pawar'&&email.toLowerCase()=='sudhirpawar786786@gmail.com'&&password.toLowerCase()=='123sp234'){
        res.status(200).json(`your name email and password  is:${[name,email,password]}`)
    }else{
        res.status(500).json("something went wrong ")
    }
    } catch (error) {
        res.send('something went wrong')
    }
    
}

module.exports=adminauth