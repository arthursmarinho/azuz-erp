export type MailProviderName = 'resend' | 'smtp' | 'emailjs';

export interface SendMailInput {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  templateParams?: Record<string, string>;
}

export interface ClientRequestAlertInput {
  companyId: string;
  clientId: string;
  clientName: string;
  requestType: string;
  title: string;
}
