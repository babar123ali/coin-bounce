const express=require(`express`);
const router = express.Router();
const authController= require(`../controller/authController`);
const blogController = require(`../controller/blogController`);
const commentController = require(`../controller/commentController`);
const auth = require(`../middleware/auth`);




//user
//register
router.post(`/register`, authController.register);
//login
router.post(`/login`, authController.login);
//logout
router.post(`/logout`, auth, authController.logout);
//refresh
router.get(`/refresh`, authController.refresh);


//blog
//create
router.post(`/blog`, auth , blogController.create);
//read all blogs
router.get(`/blog/all`, auth , blogController.getAll);
//read blogs by id
router.get(`/blog/:id`, auth , blogController.getById);
//update
router.put(`/blog`, auth , blogController.update);
//delete
router.delete(`/blog/:id`, auth , blogController.delete);



//comment

// create
router.post('/comment',auth, commentController.create);

//read comments by blog id
router.get('/comment/:id', auth, commentController.getById);

module.exports=router