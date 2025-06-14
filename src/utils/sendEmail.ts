import { transport } from "@/lib/nodemailer";

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const options = {
      from: "MockWise <mockwise@ai.com>",
      to,
      subject,
      html,
    };

    await transport.sendMail(options);
    return { success: true };
  } catch (error) {
    console.log("Something went wrong while sending email", error);
    return { success: false };
  }
};
