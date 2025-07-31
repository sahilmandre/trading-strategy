// File: backend/routes/alertRoutes.js

import express from 'express';
import {
  createAlert,
  getActiveAlerts,
  deleteAlert,
    sendTestNotification,
} from '../controllers/alertController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All alert routes are protected
router.use(protect);

router.route('/')
  .post(createAlert)
  .get(getActiveAlerts);

router.route('/:id')
  .delete(deleteAlert);

// Add the new route for sending a test notification
router.post('/test-notification', sendTestNotification);

export default router;
