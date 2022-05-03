const express = require('express');
const router = express.Router();

const { userValidation } = require('../middlewares/validator');
const userAuthorization = require('../middlewares/userAuthorization');
const authController = require('../controllers/authController');

router.post('/registration', userValidation, authController.registration);
router.post('/login', userValidation, authController.login);

router.get('/logout', userAuthorization, authController.logout);
router.get('/activate/:link', authController.activate);
router.get('/refresh', authController.refresh);
router.post('/reset-password', authController.resetPassword);
router.post('/change-password/:link', authController.changePasswordController);
router.get('/confirm-new-host/:link', authController.confirmHost);

module.exports = router;
