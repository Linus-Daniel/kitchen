import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const {email,message,name, subject} = await request.json();
    console.log(request)


    // Validate fields
    if (!email || !message || !name ||!subject) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Setup nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Define email content
    const mailOptions = {
      from: email,
      to: "serverside2000@gmail.com",
      subject: subject,
      text: "Credentials",
      html: `
        <p> ${message}</p>
        
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Email API error:', error.message);
    return new Response(
      JSON.stringify({ message: 'Error sending email', error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
