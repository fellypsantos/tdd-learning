const transporter = require('../config/mailTransporter');

const sendAccountActivation = async (email, token) => {
  await transporter.sendMail({
    from: 'My App <info@my-app.com',
    to: email,
    subject: 'Account Activation',
    html: `Token is ${token}`,
  });
};

module.exports = {sendAccountActivation};
