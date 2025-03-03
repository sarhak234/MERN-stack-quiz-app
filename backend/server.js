require('dotenv').config({ path: './config/.env' });
const express=require('express');
const app=express();
const router=require('./routes/userauth')
const connectDb=require('./config/database')
const cookieparser=require('cookie-parser')
const cors=require('cors');
const path = require('path');


app.use(cors({
    origin: "*", 
    credentials: true
}));



app.use(express.static(path.join(__dirname, 'build')));

app.use(cookieparser())
 
app.use(express.json());

app.use(express.urlencoded({ extended: true })); 

app.get('/',(req,res)=>{
    res.send('api is running')
})
app.use('/api',router)
connectDb().then(()=>{
    app.listen(process.env.PORT,()=>{
        console.log(`server is running on port ${process.env.PORT}`)
    })
})
