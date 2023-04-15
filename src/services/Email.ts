import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { MailDataRequired } from '@sendgrid/mail';

@Injectable()
export class SendMailService {
    // @ts-ignore
    constructor(@InjectQueue('sendMail') private readonly sendMailQueue: Queue) { }

    async sendMail(msg: MailDataRequired) {
        await this.sendMailQueue.add(msg);
    }
}
