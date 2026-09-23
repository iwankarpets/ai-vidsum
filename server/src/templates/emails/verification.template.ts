import { baseEmailTemplate } from '../base.template.js';

export const verificationEmailTemplate = (verificationUrl: string): string =>
  baseEmailTemplate({
    title: 'Verify your email',
    preheader: 'Confirm your email address to activate your account',
    body: `<p>Click the button below to verify your email address and activate your account.</p>`,
    buttonText: 'Verify email',
    buttonUrl: verificationUrl,
  });
