import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { LegalPageLayout } from "@/components/legal-page-layout";

export const metadata: Metadata = {
  title: "Delete Your Account | MetroPaws Wellness Club",
  description:
    "How to request deletion of your MetroPaws account and the personal data associated with it.",
};

const sections = [
  { id: "in-the-app", title: "1. Delete It Yourself in the App" },
  { id: "how-to-request", title: "2. Request Deletion by Email" },
  { id: "what-is-deleted", title: "3. What Is Deleted" },
  { id: "what-is-retained", title: "4. What Is Retained" },
  { id: "timeline", title: "5. Timeline" },
];

export default function DeleteAccountPage() {
  return (
    <div className="flex flex-col min-h-svh overflow-x-clip">
      <SiteHeader />
      <main className="flex flex-col flex-1">
        <LegalPageLayout
          eyebrow="Legal"
          title="Delete Your Account"
          lastUpdated="September 12, 2026"
          sections={sections}
          crossLink={{ label: "Read our Privacy Policy", href: "/privacy-policy" }}
        >
          <DeleteAccountContent />
        </LegalPageLayout>
      </main>
      <SiteFooter variant="photo" />
    </div>
  );
}

function DeleteAccountContent() {
  return (
    <div className="max-w-[65ch]">
      <section id="in-the-app" className="scroll-mt-32">
        <h2 className="text-xl font-bold text-(--color-navy) tracking-tight mb-4">
          1. Delete It Yourself in the App
        </h2>
        <p className="text-sm text-(--color-ink) leading-relaxed mb-4">
          The fastest way is in the MetroPaws app: open the{" "}
          <span className="font-semibold">Account</span> tab and choose{" "}
          <span className="font-semibold">Delete account</span>. You will be asked to
          confirm and to enter your password. Deletion takes effect immediately and you
          are signed out.
        </p>
        <p className="text-sm text-(--color-ink) leading-relaxed mb-5">
          If you no longer have the app installed, or cannot sign in, use the email
          route below instead &mdash; you do not need to reinstall the app to have your
          account deleted.
        </p>
      </section>

      <section
        id="how-to-request"
        className="mt-10 pt-10 border-t border-(--color-ink-faint) scroll-mt-32"
      >
        <h2 className="text-xl font-bold text-(--color-navy) tracking-tight mb-4">
          2. Request Deletion by Email
        </h2>
        <p className="text-sm text-(--color-ink) leading-relaxed mb-4">
          You can request deletion of your MetroPaws account and the personal data
          associated with it at any time. Send an email to{" "}
          <a
            href="mailto:privacy@metropaws.ph?subject=Account%20Deletion%20Request"
            className="font-semibold text-(--color-navy) underline underline-offset-2"
          >
            privacy@metropaws.ph
          </a>{" "}
          <span className="font-semibold">from the email address registered to your
          account</span>, with the subject line &ldquo;Account Deletion Request.&rdquo;
        </p>
        <p className="text-sm text-(--color-ink) leading-relaxed mb-5">
          We verify requests against the registered email address to protect your
          account. If you no longer have access to that email address, mention this in
          your request and we will ask for alternative proof of identity before
          proceeding.
        </p>
        <div className="bg-(--color-cream-warm) rounded-xl p-5">
          <p className="text-sm text-(--color-ink) leading-relaxed">
            <span className="font-semibold text-(--color-navy)">Note for members with
            an active plan:</span>{" "}
            deleting your account ends your membership. Unused benefits, sessions, and
            Paw Points are forfeited and membership fees are not refunded, per the
            Membership Agreement.
          </p>
        </div>
      </section>

      <section
        id="what-is-deleted"
        className="mt-10 pt-10 border-t border-(--color-ink-faint) scroll-mt-32"
      >
        <h2 className="text-xl font-bold text-(--color-navy) tracking-tight mb-4">
          3. What Is Deleted
        </h2>
        <p className="text-sm text-(--color-ink) leading-relaxed mb-4">
          Once your request is verified and processed, we delete the personal data
          linked to your account, including:
        </p>
        <ul className="text-sm text-(--color-ink) leading-relaxed mb-5 list-disc pl-5 space-y-2">
          <li>Your account credentials and profile (name, email, phone, address, photo)</li>
          <li>Your pets&rsquo; profiles, photos, and vaccination records</li>
          <li>Payout details (GCash or bank account information)</li>
          <li>In-app notifications and Paw Points history</li>
        </ul>
        <p className="text-sm text-(--color-ink) leading-relaxed mb-5">
          Photos and vaccination cards are removed from our storage, not merely
          unlinked from your account.
        </p>
      </section>

      <section
        id="what-is-retained"
        className="mt-10 pt-10 border-t border-(--color-ink-faint) scroll-mt-32"
      >
        <h2 className="text-xl font-bold text-(--color-navy) tracking-tight mb-4">
          4. What Is Retained
        </h2>
        <p className="text-sm text-(--color-ink) leading-relaxed mb-4">
          We retain records the law requires us to keep, and they are stripped of your
          personal details rather than left identifying you. These are:
        </p>
        <ul className="text-sm text-(--color-ink) leading-relaxed mb-5 list-disc pl-5 space-y-2">
          <li>Payment and membership records, required by Philippine tax regulations</li>
          <li>
            Reimbursement claims and the receipts supporting them &mdash; these are proof
            of money paid out, so they are kept as financial records
          </li>
          <li>Service history, where a benefit was used against your membership</li>
        </ul>
        <p className="text-sm text-(--color-ink) leading-relaxed mb-5">
          Retained records are kept only as long as legally necessary and are no longer
          used for any other purpose. See our Privacy Policy for details on retention
          under the Data Privacy Act of 2012 (RA 10173).
        </p>
      </section>

      <section
        id="timeline"
        className="mt-10 pt-10 border-t border-(--color-ink-faint) scroll-mt-32"
      >
        <h2 className="text-xl font-bold text-(--color-navy) tracking-tight mb-4">
          5. Timeline
        </h2>
        <p className="text-sm text-(--color-ink) leading-relaxed mb-5">
          Deleting your account in the app takes effect immediately. For emailed
          requests, we acknowledge within 5 business days and complete verified
          deletions within 90 days of verification, in line with our Privacy Policy.
          You will receive a confirmation email once your data has been deleted.
        </p>
      </section>
    </div>
  );
}
