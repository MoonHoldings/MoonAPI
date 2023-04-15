import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';

import sgMail, { MailDataRequired } from '@sendgrid/mail';
import { SENDGRID_KEY } from '../constants';

@Processor('sendMail')
export class SendMailConsumer {
    private readonly logger = new Logger(SendMailConsumer.name);

    constructor() {
        sgMail.setApiKey(`${SENDGRID_KEY}`);
    }

    @Process()
    async sendMailJob(msg: MailDataRequired) {
        try {
            await sgMail.send(msg);
            this.logger.log(`Email sent to ${msg.to}`);
        } catch (error) {
            this.logger.error(`Failed to send email to ${msg.to}: ${error.message}`);
            throw error;
        }
    }
}
