const emailtemp = require("../../utils/email");
const Queue = require('bull');
const nodemailer = require('nodemailer');
const EmailQueue = new Queue('email-queue');

require("dotenv").config();

const transporter = nodemailer.createTransport({
    service: process.env.service,
    auth: {
      user: process.env.email,
      pass: process.env.password
    }
  });

EmailQueue.on('active', (job, jobPromise) => {
    console.log(`[EMAIL] Consumer(next): Job ${job.id} is active!`);
});

EmailQueue.on('completed', (job, result) => {
    console.log(`[EMAIL] Consumer(next): Job ${job.id} completed! Result: ${result}`);
});

EmailQueue.process((job,done) => {
    if (job.data.email != "") {
        const mailOptions = {
            from: process.env.email, // sender address
            to: job.data.email, // list of receivers
            subject: job.data.success ? 'BUB File Upload - "Successful"' : 'BUB File Upload - "Error"', // Subject line
            html: emailtemp.emailtemplate(job.data.title, job.data.success, job.data.trueURI) // plain text body
        };
    
        transporter.sendMail(mailOptions, function (err, info) {
            if (err) {
                console.log(err)
                done(null,false)
            }
            else {
                done(null,true)
            }
        });
    }
})