export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { appointmentDetails } = req.body || {};
    if (!appointmentDetails) {
      return res.status(400).json({ success: false, error: 'Missing appointment details' });
    }

    const mod = await import('../../src/services/smsService.js');
    const svc = mod.smsService ?? (mod.default?.default ?? mod.default ?? mod);
    if (typeof svc?.sendBusinessNotification !== 'function') {
      throw new Error('sendBusinessNotification missing on SMS service');
    }

    const result = await svc.sendBusinessNotification(appointmentDetails);

    if (result?.success) {
      return res.status(200).json({
        success: true,
        message: 'Business notification SMS sent successfully',
        textId: result.textId,
      });
    }
    return res.status(500).json({ success: false, error: result?.error || 'Unknown SMS error' });
  } catch (error) {
    console.error('SMS Business Notification Error:', error);
    return res.status(500).json({ success: false, error: 'Failed to send business notification SMS' });
  }
} // By John Michael
