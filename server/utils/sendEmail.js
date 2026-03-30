import axios from "axios"; //axios used 


export const sendEmail = async ({ to, subject, html }) => {

  try {

    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "CampusCart",
          email: process.env.EMAIL_FROM,
        },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      },
      {
        headers: {
          "api-key": process.env.BrevoApiKey,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;


  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Brevo error:", error.response?.data || error.message);
    }
    throw error;
  }
};
