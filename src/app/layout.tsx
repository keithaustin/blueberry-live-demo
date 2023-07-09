import './globals.css'

export const metadata = {
  title: 'Blueberry Live Demo',
  description: 'Online Blueberry Interpreter',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="text-white">{children}</body>
    </html>
  )
}
