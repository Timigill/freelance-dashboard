import 'bootstrap/dist/css/bootstrap.min.css'
import './globals.css'
import Navbar from '@/components/Navbar'

export const metadata = {
  title: 'Freelancer Dashboard App',
  description: 'Freelancer Dashboard App',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <div className="container-fluid">
          <div className="row">
            <main className="col-md-10 ms-sm-auto px-md-4 py-4">{children}</main>
          </div>
        </div>
      </body>
    </html>
  )
}
