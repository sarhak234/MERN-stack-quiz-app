require('dotenv').config({path:'backend/config/.env'})
const express=require('express');
const app=express();
const router=require('./routes/userauth')
const connectDb=require('./config/database')
const cookieparser=require('cookie-parser');
const cors=require('cors');

app.use(cors())


app.use(cookieparser())
 
app.use(express.json())

app.use('/api',router)
connectDb().then(()=>{
    app.listen(process.env.PORT,()=>{
        console.log(`server is running on port ${process.env.PORT}`)
    })
})
