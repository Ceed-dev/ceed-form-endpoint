import { google } from "googleapis";

function buildRawMessage({ from, to, replyTo, subject, text }) {
  const headers = [
    `From: ${from}`,
    `To: ${to}`,
    replyTo ? `Reply-To: ${replyTo}` : null,
    `Subject: =?UTF-8?B?${Buffer.from(subject, "utf-8").toString("base64")}?=`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
  ].filter(Boolean);

  const message = `${headers.join("\r\n")}\r\n\r\n${text}`;

  return Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function getGmailClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = (process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || "").replace(/\\n/g, "\n");
  const sender = process.env.GMAIL_SENDER;

  if (!email || !privateKey || !sender) {
    throw new Error("Gmail API credentials are not configured");
  }

  const jwtClient = new google.auth.JWT(
    email,
    null,
    privateKey,
    ["https://www.googleapis.com/auth/gmail.send"],
    sender
  );

  return google.gmail({ version: "v1", auth: jwtClient });
}

async function sendMail({ to, replyTo, subject, text }) {
  const gmail = getGmailClient();
  const sender = process.env.GMAIL_SENDER;

  const raw = buildRawMessage({ from: sender, to, replyTo, subject, text });

  await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw },
  });
}

export async function sendDocumentEmail({ toEmail, name, company }) {
  const docUrl = process.env.DOC_URL || "";
  const subject = "【Ceed】資料をお送りします";
  const text = [
    `${company} ${name} 様`,
    "",
    "お問い合わせいただきありがとうございます。",
    "下記URLより資料をダウンロードいただけます。",
    "",
    docUrl,
    "",
    "何かご不明点がございましたら本メールに返信ください。",
  ].join("\n");

  await sendMail({ to: toEmail, subject, text });
}

export async function sendNotificationEmail({ company, name, email, phone }) {
  const notifyTo = process.env.NOTIFY_TO;
  if (!notifyTo) throw new Error("NOTIFY_TO is not configured");

  const subject = "【LP】資料請求フォーム通知";
  const text = [
    "資料請求フォームから送信がありました。",
    "",
    `会社名: ${company}`,
    `氏名: ${name}`,
    `メール: ${email}`,
    `電話: ${phone || "(未入力)"}`,
  ].join("\n");

  await sendMail({ to: notifyTo, replyTo: email, subject, text });
}
