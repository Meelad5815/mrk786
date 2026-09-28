import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MRK WordPress MCP",
  description: "MRK Gemini to WordPress MCP Server",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#f6f7fb", color: "#111827" }}>
        {children}
      </body>
    </html>
  );
}