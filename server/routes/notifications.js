import express from 'express';
import supabase from '../config/supabase.js';

const router = express.Router();

// Get all notifications for a user
router.get('/', async (req, res) => {
  const { userId } = req.query;

  try {
    let query = supabase.from('Notification').select('*').order('CreatedAt', { ascending: false });

    if (userId) {
      query = query.eq('UserID', userId);
    }

    const { data, error } = await query;

    if (error) {
      return res.status(500).json({ message: 'Failed to fetch notifications' });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
});

// Get notification by ID
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('Notification')
      .select('*')
      .eq('NotificationID', req.params.id)
      .single();

    if (error) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Get notification error:', error);
    res.status(500).json({ message: 'Failed to fetch notification' });
  }
});

// Create new notification
router.post('/', async (req, res) => {
  const { userId, message } = req.body;

  try {
    const { data, error } = await supabase
      .from('Notification')
      .insert({
        UserID: userId,
        Message: message
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ message: 'Failed to create notification' });
    }

    res.status(201).json(data);
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({ message: 'Failed to create notification' });
  }
});

// Mark notification as read
router.put('/:id/read', async (req, res) => {
  try {
    const { error } = await supabase
      .from('Notification')
      .update({ Read: true })
      .eq('NotificationID', req.params.id);

    if (error) {
      return res.status(500).json({ message: 'Failed to mark notification as read' });
    }

    res.status(200).json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ message: 'Failed to mark notification as read' });
  }
});

// Delete notification
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('Notification')
      .delete()
      .eq('NotificationID', req.params.id);

    if (error) {
      return res.status(500).json({ message: 'Failed to delete notification' });
    }

    res.status(200).json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ message: 'Failed to delete notification' });
  }
});

export default router;
