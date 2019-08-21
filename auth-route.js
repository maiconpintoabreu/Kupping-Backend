const router = require("express").Router();
const userController = require('./controllers/user.controller');

router.post("/auth/login",userController.login);
router.post("/auth/signup",userController.insertUser);



module.exports = router;