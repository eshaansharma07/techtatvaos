import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { ContactMessage } from "@/lib/models";
import { requirePortal } from "@/lib/portal";
import { sendContactReplyEmail } from "@/lib/contact-mail";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await requirePortal(req);
  if (!session || session instanceof NextResponse) {
    return session instanceof NextResponse ? session : NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { messageId, replyMessage, subject } = body;

    if (!messageId) {
      return NextResponse.json({ error: "Message ID is required." }, { status: 400 });
    }

    const cleanReply = (replyMessage || "").trim();
    if (!cleanReply || cleanReply.length < 5) {
      return NextResponse.json({ error: "Please enter a reply message (minimum 5 characters)." }, { status: 400 });
    }

    await connectDB();
    const contact = await ContactMessage.findById(messageId);
    if (!contact) {
      return NextResponse.json({ error: "Contact message not found." }, { status: 404 });
    }

    if (!contact.email) {
      return NextResponse.json({ error: "This inquiry does not have a valid email address to reply to." }, { status: 400 });
    }

    const adminName = (session as any)?.user?.name || (session as any)?.name || "Tech Tatva Organizing Team";

    // Validate email service credentials
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({
        error: "RESEND_API_KEY is not configured on the server. Please add your Resend API Key in environment variables to send emails to students."
      }, { status: 503 });
    }

    // Dispatch email
    let mailRes;
    try {
      mailRes = await sendContactReplyEmail({
        to: contact.email,
        recipientName: contact.name || "Student",
        originalSubject: contact.subject || "Tech Tatva Inquiry",
        originalMessage: contact.message || "",
        replyMessage: cleanReply,
        repliedBy: adminName
      });
    } catch (err: any) {
      console.error("[Contact Reply Mail Error]", err);
      return NextResponse.json({
        error: `Email server network error: ${err.message || "Failed to reach mail service"}`
      }, { status: 502 });
    }

    if (!mailRes.sent) {
      return NextResponse.json({
        error: `Email delivery failed: ${(mailRes as any).error || (mailRes as any).reason || "Provider error"}. Please check your email configuration.`
      }, { status: 502 });
    }

    // Update the ContactMessage document once email is confirmed sent
    contact.replyMessage = cleanReply;
    contact.repliedAt = new Date();
    contact.repliedBy = adminName;
    contact.replySubject = subject || `Re: ${contact.subject || "Your Inquiry"}`;
    contact.status = "resolved";

    if (!Array.isArray(contact.replies)) {
      contact.replies = [];
    }
    contact.replies.push({
      message: cleanReply,
      sentAt: new Date(),
      sentBy: adminName
    });

    await contact.save();

    return NextResponse.json({
      success: true,
      message: `Reply sent successfully to ${contact.email} and marked as resolved.`,
      emailSent: true,
      record: contact.toObject()
    });
  } catch (error: any) {
    console.error("[Contact Reply API Error]", error);
    return NextResponse.json({ error: error.message || "Server Error" }, { status: 500 });
  }
}
