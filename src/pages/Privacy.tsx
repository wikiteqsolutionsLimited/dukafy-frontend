import { Link } from "react-router-dom";
import { Store, ArrowLeft } from "lucide-react";

const PrivacyPage = () => (
  <div className="min-h-screen bg-background">
    {/* Navbar */}
    <nav className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-md transition-transform duration-300 group-hover:scale-110">
            <Store className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-black tracking-tight text-foreground">DukaFy</span>
        </Link>
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>
      </div>
    </nav>

    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-4xl font-black tracking-tight text-foreground">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: March 23, 2026</p>

      <div className="mt-12 space-y-10 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="mb-3 text-lg font-bold text-foreground">1. Information We Collect</h2>
          <p className="mb-3">We collect information you provide directly, including:</p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li><strong className="text-foreground">Account Information:</strong> Name, email address, phone number, and business details when you create an account.</li>
            <li><strong className="text-foreground">Business Data:</strong> Product inventory, customer records, sales transactions, expense records, and supplier information you enter into the system.</li>
            <li><strong className="text-foreground">Payment Data:</strong> M-Pesa phone numbers and transaction references processed through the platform.</li>
            <li><strong className="text-foreground">Usage Data:</strong> Log data, device information, and how you interact with our Service.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-foreground">2. How We Use Your Information</h2>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Provide, maintain, and improve the Service</li>
            <li>Process sales transactions and M-Pesa payments</li>
            <li>Generate business reports and analytics</li>
            <li>Send transactional emails (password resets, notifications)</li>
            <li>Provide customer support</li>
            <li>Detect and prevent fraud or security threats</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-foreground">3. Data Storage & Security</h2>
          <p>Your data is stored in secure PostgreSQL databases with encryption at rest and in transit. We implement industry-standard security measures including password hashing (bcrypt), JWT-based authentication, rate limiting, input sanitization, and role-based access control. We conduct regular security audits to protect your information.</p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-foreground">4. M-Pesa Data</h2>
          <p>When processing M-Pesa payments, we transmit phone numbers and payment amounts to Safaricom through their secure Daraja API. We store transaction references for record-keeping. We do not store M-Pesa PINs or full account details. All payment data is handled in compliance with Safaricom's data protection requirements.</p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-foreground">5. Data Sharing</h2>
          <p className="mb-3">We do not sell your personal or business data. We may share information with:</p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li><strong className="text-foreground">Safaricom:</strong> For processing M-Pesa transactions</li>
            <li><strong className="text-foreground">Brevo:</strong> For sending transactional emails</li>
            <li><strong className="text-foreground">Africa's Talking:</strong> For SMS notifications</li>
            <li><strong className="text-foreground">Law Enforcement:</strong> When required by Kenyan law or valid legal process</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-foreground">6. Your Rights</h2>
          <p className="mb-3">Under the Kenya Data Protection Act, 2019, you have the right to:</p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Access your personal data held by us</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Export your business data at any time</li>
            <li>Object to processing of your data</li>
            <li>Lodge a complaint with the Office of the Data Protection Commissioner</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-foreground">7. Data Retention</h2>
          <p>We retain your data for as long as your account is active. Upon account deletion, we remove your personal data within 30 days, though we may retain anonymized analytics data. Audit logs are retained for 12 months for security purposes.</p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-foreground">8. Cookies</h2>
          <p>We use essential cookies for authentication (JWT tokens stored in localStorage) and session management. We do not use third-party tracking cookies or advertising cookies.</p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-foreground">9. Children's Privacy</h2>
          <p>The Service is not intended for use by individuals under the age of 18. We do not knowingly collect personal information from children.</p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-foreground">10. Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. We will notify you of significant changes via email or through the Service. Continued use of the Service after changes constitutes acceptance of the updated policy.</p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-foreground">11. Contact Us</h2>
          <p>For privacy-related inquiries, contact our Data Protection Officer at <a href="mailto:privacy@dukafy.co.ke" className="font-medium text-primary hover:underline">privacy@dukafy.co.ke</a>.</p>
        </section>
      </div>
    </div>

    <footer className="border-t bg-card py-8">
      <div className="mx-auto max-w-4xl px-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <p className="text-xs text-muted-foreground">© 2026 DukaFy. All rights reserved.</p>
        <div className="flex gap-4">
          <Link to="/terms" className="text-xs text-muted-foreground transition-colors hover:text-foreground">Terms</Link>
          <Link to="/privacy" className="text-xs font-medium text-foreground">Privacy</Link>
        </div>
      </div>
    </footer>
  </div>
);

export default PrivacyPage;
