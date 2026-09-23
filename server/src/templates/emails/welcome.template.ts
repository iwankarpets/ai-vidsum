import { baseEmailTemplate } from '../base.template.js';

export const welcomeEmailTemplate = (name: string = 'There'): string => {
  return baseEmailTemplate({
    title: 'Welcome to AI Vidsum! 🎉',
    preheader: `Hi ${name}, your account is ready. Let's get started!`,
    body: `
      <p style="margin:0 0 16px;">Hi <strong>${name}</strong>,</p>
      <p style="margin:0 0 16px;">
        Welcome to <strong>AI Vidsum</strong>! We're thrilled to have you on board.
        Your account has been successfully created, and you're all set to start
        turning your videos into concise, insightful summaries in seconds.
      </p>
      <p style="margin:0 0 16px;">Here's what you can do right away:</p>
      <ul style="margin:0 0 16px; padding-left:20px; color:#4b5563;">
        <li style="margin-bottom:8px;">Upload or link a video to summarize</li>
        <li style="margin-bottom:8px;">Get AI-powered key points and takeaways</li>
        <li style="margin-bottom:8px;">Save and organize your summaries</li>
      </ul>
      <p style="margin:0;">
        Ready to dive in? Click the button below to get started.
      </p>
    `,
    buttonText: 'Get Started',
    buttonUrl: `${process.env.API_URL}/dashboard`,
  });
};
