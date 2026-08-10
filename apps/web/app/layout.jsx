import './globals.css';

export const metadata = {
  title: 'CipherStream P2P — Zero-Cloud E2EE File Transfer',
  description: 'Production-grade, zero-cloud peer-to-peer file sharing platform with end-to-end WebCrypto AES-256-GCM encryption.',
};

/**
 * @param {Object} props
 * @param {React.ReactNode} props.children
 */
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
