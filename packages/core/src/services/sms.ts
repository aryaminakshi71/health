import { MessageGateway } from './types';
import { env } from '@healthcare-saas/env/server';

export class SMSService {
  private gateway: MessageGateway;

  constructor(gateway: MessageGateway) {
    this.gateway = gateway;
  }

  async sendSMS(to: string, message: string): Promise<boolean> {
    try {
      await this.gateway.sendSMS(to, message);
      return true;
    } catch (error) {
      console.error('SMS send error:', error);
      return false;
    }
  }

  async sendAppointmentReminder(phone: string, patientName: string, date: string, time: string): Promise<boolean> {
    const message = `Hi ${patientName}, this is a reminder for your appointment on ${date} at ${time}. Please arrive 15 minutes early. Reply CONFIRM to confirm or CANCEL to cancel.`;
    return this.sendSMS(phone, message);
  }

  async sendAppointmentConfirmation(phone: string, patientName: string, date: string, time: string): Promise<boolean> {
    const message = `Hi ${patientName}, your appointment has been scheduled for ${date} at ${time}. We look forward to seeing you!`;
    return this.sendSMS(phone, message);
  }

  async sendAppointmentCancellation(phone: string, patientName: string, date: string): Promise<boolean> {
    const message = `Hi ${patientName}, your appointment on ${date} has been cancelled. Please call us to reschedule.`;
    return this.sendSMS(phone, message);
  }

  async sendLabResultsNotification(phone: string, patientName: string): Promise<boolean> {
    const message = `Hi ${patientName}, your lab results are now available in your patient portal. Please log in to view them.`;
    return this.sendSMS(phone, message);
  }

  async sendPrescriptionNotification(phone: string, patientName: string, medicationName: string): Promise<boolean> {
    const message = `Hi ${patientName}, a new prescription for ${medicationName} has been sent to your pharmacy.`;
    return this.sendSMS(phone, message);
  }
}

export function createSMSService(): SMSService {
  const provider = env.SMS_PROVIDER || 'twilio';

  let gateway: MessageGateway;

  switch (provider) {
    case 'twilio':
      gateway = new TwilioGateway(
        env.TWILIO_ACCOUNT_SID || '',
        env.TWILIO_AUTH_TOKEN || '',
        env.TWILIO_PHONE_NUMBER || ''
      );
      break;
    case 'nexmo':
      gateway = new NexmoGateway(
        env.NEXMO_API_KEY || '',
        env.NEXMO_API_SECRET || ''
      );
      break;
    default:
      gateway = new NoOpGateway();
  }

  return new SMSService(gateway);
}
