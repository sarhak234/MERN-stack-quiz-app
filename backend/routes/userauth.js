const express=require('express');
const router=express.Router();
const userauth=require('../controllers/userauth');
const adminauth=require('../controllers/adminauth');
const Aq=require('../controllers/Aq');
const questionpage=require('../controllers/usertest');
const score=require('../controllers/pdf')
const dashboard= require('../controllers/adminDashboard')

router.route("/user/auth").post(userauth);
router.route("/admin/auth").post(adminauth)
router.route("/question/uploading/page").post(Aq);
router.route("/test/page").post(questionpage);
router.route("/admin/db").post(dashboard);  
router.route("/score/page").post(score)


module.exports=router