import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — Deposit Calculator" },
      { name: "description", content: "Terms of Service for using Deposit Calculator." },
      { property: "og:title", content: "Terms of Service — Deposit Calculator" },
      { property: "og:description", content: "The terms governing your use of Deposit Calculator." },
      { property: "og:url", content: "/terms" },
    ],
    links: [{ rel: "canonical", href: "/terms" }],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Legal</div>
      <h1 className="mt-2 font-display text-4xl font-bold">Terms of Service</h1>
      <div className="mt-6 space-y-6 text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-foreground font-semibold text-lg mb-2">1. Acceptance of Terms</h2>
          <p>
            By accessing or using Deposit Calculator ("the Service"), you agree to be bound by these
            Terms of Service. If you do not agree, please do not use the Service.
          </p>
        </section>
        <section>
          <h2 className="text-foreground font-semibold text-lg mb-2">2. Informational Use Only</h2>
          <p>
            All calculators and results are provided for informational and educational purposes only.
            They do not constitute financial, investment, tax, or legal advice. Always consult a
            qualified professional before making financial decisions.
          </p>
        </section>
        <section>
          <h2 className="text-foreground font-semibold text-lg mb-2">3. Accuracy of Results</h2>
          <p>
            While we strive for accuracy, actual returns from banks or financial institutions may
            differ due to fees, taxes, compounding methods, and market conditions. We do not
            guarantee the accuracy or completeness of any calculation.
          </p>
        </section>
        <section>
          <h2 className="text-foreground font-semibold text-lg mb-2">4. No Warranty</h2>
          <p>
            The Service is provided "as is" without warranties of any kind, either express or
            implied. We disclaim all warranties, including merchantability and fitness for a
            particular purpose.
          </p>
        </section>
        <section>
          <h2 className="text-foreground font-semibold text-lg mb-2">5. Limitation of Liability</h2>
          <p>
            In no event shall Deposit Calculator or its operators be liable for any direct,
            indirect, incidental, or consequential damages arising from your use of the Service.
          </p>
        </section>
        <section>
          <h2 className="text-foreground font-semibold text-lg mb-2">6. Third-Party Advertising</h2>
          <p>
            The Service may display third-party advertisements. We are not responsible for the
            content, products, or services offered by advertisers.
          </p>
        </section>
        <section>
          <h2 className="text-foreground font-semibold text-lg mb-2">7. Changes to Terms</h2>
          <p>
            We may update these Terms at any time. Continued use of the Service after changes
            constitutes acceptance of the revised Terms.
          </p>
        </section>
        <section>
          <h2 className="text-foreground font-semibold text-lg mb-2">8. Contact</h2>
          <p>For questions about these Terms, please visit our Contact page.</p>
        </section>
      </div>
    </div>
  );
}
