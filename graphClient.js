import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const {
  TENANT_ID,
  CLIENT_ID,
  CLIENT_SECRET,
  EMAIL_USER,
  EMAIL_RECEIVER,
} = process.env;

if (!TENANT_ID || !CLIENT_ID || !CLIENT_SECRET || !EMAIL_USER || !EMAIL_RECEIVER) {
  console.warn(
    "Microsoft Graph environment variables are not fully set. " +
      "Please ensure TENANT_ID, CLIENT_ID, CLIENT_SECRET, EMAIL_USER, and EMAIL_RECEIVER are defined."
  );
}

async function getAccessToken() {
  const tokenEndpoint = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`;

  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    scope: "https://graph.microsoft.com/.default",
    grant_type: "client_credentials",
  });

  const response = await fetch(tokenEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Failed to obtain Microsoft Graph access token: ${response.status} ${response.statusText} - ${errorBody}`
    );
  }

  const data = await response.json();
  return data.access_token;
}

export async function sendContactEmail({ name, email, phone, service, message }) {
  const accessToken = await getAccessToken();

  const mail = {
    message: {
      subject: "New Contact Form Submission",
      body: {
        contentType: "HTML",
        content: `
          <h3>New Inquiry Submitted</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Service:</strong> ${service}</p>
          <p><strong>Message:</strong> ${message}</p>
        `,
      },
      toRecipients: [
        {
          emailAddress: {
            address: EMAIL_RECEIVER,
          },
        },
      ],
      from: {
        emailAddress: {
          address: EMAIL_USER,
        },
      },
    },
    saveToSentItems: "true",
  };

  const sendMailEndpoint = `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(
    EMAIL_USER
  )}/sendMail`;

  const response = await fetch(sendMailEndpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(mail),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Failed to send email via Microsoft Graph: ${response.status} ${response.statusText} - ${errorBody}`
    );
  }
}




