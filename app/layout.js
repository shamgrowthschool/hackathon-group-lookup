import "./styles.css";

export const metadata = {
  title: "Find Your Hackathon Squad",
  description: "Look up your assigned hackathon group and WhatsApp invite."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
