const { passwordVerfication } = require('@/emailTemplate/emailVerfication');

const { Resend } = require('resend');

const sendMail = async ({
  email,
  name,
  link,
  idurar_app_email,
  subject = 'Verify your email | idurar',
  type = 'emailVerfication',
  emailToken,
}) => {
  // Skip email sending in test environment or if API key is missing
  if (process.env.NODE_ENV === 'test' || !process.env.RESEND_API) {
    return {
      id: 'mock-email-id',
      message: 'Email sending skipped in test environment',
    };
  }

  const resend = new Resend(process.env.RESEND_API);

  const { data } = await resend.emails.send({
    from: idurar_app_email,
    to: email,
    subject,
    html: passwordVerfication({ name, link }),
  });

  return data;
};

module.exports = sendMail;
