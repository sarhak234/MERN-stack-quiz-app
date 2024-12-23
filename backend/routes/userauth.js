const express=require('express');
const router=express.Router();
const userauth=require('../controllers/userauth');
const adminauth=require('../controllers/adminauth');
const Aq=require('../controllers/Aq');
const questionpage=require('../controllers/usertest')

router.route("/user/auth").post(userauth);
router.route("/admin/auth").post(adminauth)
router.route("/question/uploading/page").post(Aq);
router.route("/test/page").post(questionpage);


module.exports=router