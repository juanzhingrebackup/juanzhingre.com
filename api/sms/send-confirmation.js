export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { appointmentDetails } = req.body || {};
    if (!appointmentDetails || !appointmentDetails.phone) {
      return res.status(400).json({ success: false, error: 'Missing appointment details or phone number' });
    }

    if (!process.env.TEXTBELT_KEY) {
      return res.status(500).json({ success: false, error: 'SMS service not configured' });
    }

    // Robust import normalization to handle ESM/CJS bundling
    const mod = await import('../../src/services/smsService.js');
    const svc = mod.smsService ?? (mod.default?.default ?? mod.default ?? mod);
    if (typeof svc?.sendAppointmentConfirmation !== 'function') {
      throw new Error('sendAppointmentConfirmation missing on SMS service');
    }

    const result = await svc.sendAppointmentConfirmation(appointmentDetails);

    if (result?.success) {
      return res.status(200).json({
        success: true,
        message: 'Confirmation SMS sent successfully',
        textId: result.textId,
      });
    }
    return res.status(500).json({ success: false, error: result?.error || 'Unknown SMS error' });
  } catch (error) {
    console.error('SMS Confirmation Error:', error);
    return res.status(500).json({ success: false, error: 'Failed to send confirmation SMS' });
  }
} // By John Michael
