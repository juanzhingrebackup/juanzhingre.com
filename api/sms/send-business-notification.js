// Vercel API route
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { appointmentDetails } = req.body || {};
    if (!appointmentDetails) {
      return res.status(400).json({ success: false, error: 'Missing appointment details' });
    }

    // Same resolver
    const mod = await import('../../src/services/smsService.js');
    let svc = mod?.smsService ?? mod?.default ?? mod;
    while (svc && typeof svc === 'object' && 'default' in svc) svc = svc.default;
    if (typeof svc?.sendBusinessNotification !== 'function' && typeof svc === 'function') {
      try { svc = new svc(); } catch {}
    }
    if (typeof svc?.sendBusinessNotification !== 'function') {
      throw new Error('sendBusinessNotification missing on SMS service');
    }

    const result = await svc.sendBusinessNotification(appointmentDetails);
    if (result?.success) {
      return res.status(200).json({ success: true, message: 'Business SMS sent', textId: result.textId });
    }
    return res.status(500).json({ success: false, error: result?.error || 'Unknown SMS error' });
  } catch (error) {
    console.error('SMS Business Notification Error:', error);
    return res.status(500).json({ success: false, error: 'Failed to send business notification SMS' });
  }
}
