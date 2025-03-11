const jwt = require('jsonwebtoken');

const adminauth=(req,res)=>{
    //ab dekho, hume bas ek bande kaa hi loginkarwana hai, har kisi ka nahi
    try {
        const AdminData=[
            {
                name:'sudhir pawar',
                email:'sudhirpawar786786@gmail.com',
                password:'123sp234'
            }
        ]
        const {name,email,password}=req.body;
        const admin = AdminData.find(
            (admin) =>
                admin.name.toLowerCase() === name.toLowerCase() &&
                admin.email.toLowerCase() === email.toLowerCase() &&
                admin.password === password // Keep password case-sensitive
        );
        if (admin) {
            const token = jwt.sign({ email: admin.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.status(200).json({ message: "Admin logged in successfully", token: token });
        } else {
            res.status(401).json({ error: "Invalid credentials" });
        }
    } catch (error) {
        console.error("Error in adminauth:", error);  // Log the actual error
        res.status(500).json({ error: "Something went wrong", details: error.message });
    }
    
    
}

module.exports=adminauth