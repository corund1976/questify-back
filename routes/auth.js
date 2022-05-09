const express = require('express');
const router = express.Router();

const { userValidation } = require('../middlewares/validation');
const userAuthorization = require('../middlewares/userAuthorization');
const authController = require('../controllers/authController');

router.post('/registration', userValidation, authController.signup);
router.get('/activate/:link', authController.activate);
router.post('/login', userValidation, authController.login);
router.get('/logout', userAuthorization, authController.logout);

router.get('/refresh', authController.refresh);
router.post('/reset-password', authController.resetPassword);
router.post('/change-password/:link', authController.changePassword);
router.get('/confirm-host/:link', authController.confirmHost);

module.exports = router;
