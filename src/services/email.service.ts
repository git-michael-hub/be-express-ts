import * as nodemailer from 'nodemailer';

interface EmailContent {
    to: string;
    subject: string;
    html: string;
    text: string;
}

export class EmailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        // Configure email transporter (example using Gmail)
        this.transporter = nodemailer.createTransport({
            service: 'gmail', // or your email service
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }

    async sendEmail(emailContent: EmailContent): Promise<void> {
        try {
            const mailOptions = {
                from: process.env.EMAIL_FROM,
                to: emailContent.to,
                subject: emailContent.subject,
                html: emailContent.html,
                text: emailContent.text
            };

            await this.transporter.sendMail(mailOptions);
            console.log(`Verification email sent to ${emailContent.to}`);
        } catch (error) {
            console.error('Error sending email:', error);
            throw new Error('Failed to send verification email');
        }
    }
}