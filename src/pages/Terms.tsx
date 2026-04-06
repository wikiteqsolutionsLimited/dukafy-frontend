import { Link } from "react-router-dom";
import { Store, ArrowLeft } from "lucide-react";

const TermsPage = () => (
  <div className="min-h-screen bg-background">
    {/* Navbar */}
    <nav className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-md transition-transform duration-300 group-hover:scale-110">
            <Store className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-black tracking-tight text-foreground">DukaFlo</span>
        </Link>
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>
      </div>
    </nav>

    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-4xl font-black tracking-tight text-foreground">Terms of Service</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: March 23, 2026</p>

      <div className="mt-12 space-y-10 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="mb-3 text-lg font-bold text-foreground">1. Acceptance of Terms</h2>
          <p>By accessing or using DukaFlo ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not use the Service. These terms apply to all users, including administrators, managers, and cashiers.</p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-foreground">2. Description of Service</h2>
          <p>DukaFlo is a point-of-sale and business management platform designed for retail businesses in Kenya. The Service includes inventory management, sales processing, customer relationship management, M-Pesa payment integration, reporting and analytics, and staff management tools.</p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-foreground">3. User Accounts</h2>
          <p>You must provide accurate and complete information when creating an account. You are responsible for maintaining the confidentiality of your credentials and for all activities under your account. You must notify us immediately of any unauthorized access or security breach.</p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-foreground">4. Acceptable Use</h2>
          <p>You agree not to: (a) use the Service for any unlawful purpose; (b) attempt to gain unauthorized access to other accounts or systems; (c) interfere with the proper functioning of the Service; (d) reverse engineer, decompile, or disassemble any part of the Service; (e) share your account credentials with unauthorized persons.</p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-foreground">5. Payment Terms</h2>
          <p>Paid plans are billed monthly in Kenya Shillings (KES). All fees are non-refundable unless otherwise stated. We reserve the right to change pricing with 30 days' notice. Free tier users may be subject to usage limitations as described on our pricing page.</p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-foreground">6. M-Pesa Integration</h2>
          <p>Our M-Pesa integration is provided through Safaricom's Daraja API. We are not responsible for any delays, failures, or errors in M-Pesa transactions caused by Safaricom or third-party payment processors. You are responsible for ensuring the accuracy of phone numbers and payment amounts.</p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-foreground">7. Data Ownership</h2>
          <p>You retain ownership of all data you enter into the Service, including product information, customer records, and sales data. We do not claim any intellectual property rights over your business data. You may export your data at any time.</p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-foreground">8. Service Availability</h2>
          <p>We strive to maintain 99.9% uptime but do not guarantee uninterrupted access. We may perform scheduled maintenance with prior notice. We are not liable for any loss or damage resulting from service interruptions.</p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-foreground">9. Limitation of Liability</h2>
          <p>To the maximum extent permitted by law, DukaFlo shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or business opportunities, arising from your use of the Service.</p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-foreground">10. Termination</h2>
          <p>We may suspend or terminate your access to the Service at any time for violation of these terms. You may cancel your account at any time. Upon termination, your right to use the Service ceases immediately, though we may retain your data for a reasonable period for backup purposes.</p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-foreground">11. Governing Law</h2>
          <p>These terms are governed by the laws of the Republic of Kenya. Any disputes shall be resolved through arbitration in Nairobi, Kenya, under the rules of the Chartered Institute of Arbitrators (Kenya Branch).</p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-foreground">12. Contact</h2>
          <p>For questions about these terms, contact us at <a href="mailto:legal@dukaflo.co.ke" className="font-medium text-primary hover:underline">legal@dukaflo.co.ke</a>.</p>
        </section>
      </div>
    </div>

    <footer className="border-t bg-card py-8">
      <div className="mx-auto max-w-4xl px-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <p className="text-xs text-muted-foreground">© 2026 DukaFlo. All rights reserved.</p>
        <div className="flex gap-4">
          <Link to="/terms" className="text-xs font-medium text-foreground">Terms</Link>
          <Link to="/privacy" className="text-xs text-muted-foreground transition-colors hover:text-foreground">Privacy</Link>
        </div>
      </div>
    </footer>
  </div>
);

export default TermsPage;
