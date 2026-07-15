import "./globals.css";

export const metadata = {
  title: "Visdiff Lab",
  description: "A simple visual regression fixture site for Visdiff."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
