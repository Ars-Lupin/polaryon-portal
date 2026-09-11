import * as nodemailer from 'nodemailer';

export function transporterModule(
  provedor: string,
  originEmail: string,
  appPWD: string,
) {
  const provider = String(provedor || '').trim().toUpperCase();

  if (provider === 'GMAIL') {
    return nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: originEmail,
        pass: appPWD,
      },
      debug: process.env.NODE_ENV !== 'production',
    });
  }

  if (provider === 'OUTLOOK' || provider === 'OFFICE365') {
    return nodemailer.createTransport({
      host: 'smtp.office365.com',
      port: 587,
      secure: false,
      auth: {
        user: originEmail,
        pass: appPWD,
      },
      debug: process.env.NODE_ENV !== 'production',
    });
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 465),
    secure: String(process.env.SMTP_SECURE || 'true') === 'true',
    auth: {
      user: originEmail,
      pass: appPWD,
    },
    debug: process.env.NODE_ENV !== 'production',
  });
}