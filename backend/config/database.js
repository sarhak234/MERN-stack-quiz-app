const mongoose=require('mongoose')

const URL=process.env.DB_URI;
 
const connectDb=async()=>{
    try {
        await mongoose.connect(URL);
        console.log('db is connected')
    } catch (error) {
        console.log(error)
    }
    
}

module.exports=connectDb