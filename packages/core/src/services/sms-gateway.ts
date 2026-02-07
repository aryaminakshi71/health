export interface MessageGateway {
  sendSMS(to: string, message: string): Promise<void>;
}

export class TwilioGateway implements MessageGateway {
  private accountSid: string;
  private authToken: string;
  private fromNumber: string;

  constructor(accountSid: string, authToken: string, fromNumber: string) {
    this.accountSid = accountSid;
    this.authToken = authToken;
    this.fromNumber = fromNumber;
  }

  async sendSMS(to: string, message: string): Promise<void> {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: to,
        From: this.fromNumber,
        Body: message,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Twilio error: ${error.message}`);
    }
  }
}

export class NexmoGateway implements MessageGateway {
  private apiKey: string;
  private apiSecret: string;

  constructor(apiKey: string, apiSecret: string) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
  }

  async sendSMS(to: string, message: string): Promise<void> {
    const url = 'https://rest.nexmo.com/sms/json';
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: this.apiKey,
        api_secret: this.apiSecret,
        to: to.replace(/^\+/, ''),
        from: 'HealthcareApp',
        text: message,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Nexmo error: ${error.error_text || 'Unknown error'}`);
    }
  }
}

export class NoOpGateway implements MessageGateway {
  async sendSMS(_to: string, _message: string): Promise<void> {
    console.log(`[SMS Mock] To: ${_to}, Message: ${_message}`);
  }
}
