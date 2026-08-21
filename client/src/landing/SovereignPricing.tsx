import { useEffect, useState, type FormEvent } from "react";

import {
  createBillingCheckoutSession,
  createGuestBillingCheckoutSession,
  type ApiError,
} from "@/lib/authV2Client";
import { copy } from "./copy";

type SelfServiceCopy = (typeof copy)[keyof typeof copy]["pricing"]["selfService"];

type Props = {
  content: SelfServiceCopy;
};

const PENDING_OFFER_KEY = "nowgo.pendingBillingOffer";
const PENDING_RETURN_KEY = "nowgo.pendingBillingReturnTo";

function currentPricingReturnTo(): string {
  const path = window.location.pathname || "/";
  const search = window.location.search || "";
  const hash = window.location.hash || "#pricing";
  return `${path}${search}${hash}`;
}

function rememberPendingCheckout(code: string): void {
  window.sessionStorage.setItem(PENDING_OFFER_KEY, code);
  window.sessionStorage.setItem(PENDING_RETURN_KEY, currentPricingReturnTo());
}

export default function SovereignPricing({ content }: Props) {
  const [busyCode, setBusyCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [guestCode, setGuestCode] = useState<string | null>(null);
  const [guestEmail, setGuestEmail] = useState("");
  const [guestError, setGuestError] = useState<string | null>(null);
  const [guestExistingAccount, setGuestExistingAccount] = useState(false);

  function openGuestCheckout(code: string): void {
    setGuestCode(code);
    setGuestEmail("");
    setGuestError(null);
    setGuestExistingAccount(false);
  }

  async function submitGuestCheckout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!guestCode || busyCode) return;
    setBusyCode(guestCode);
    setGuestError(null);
    setGuestExistingAccount(false);
    try {
      const result = await createGuestBillingCheckoutSession(guestEmail, guestCode);
      setGuestCode(null);
      window.location.assign(result.url);
    } catch (rawError) {
      const err = rawError as ApiError;
      if (err.code === "guest_account_exists") {
        setGuestExistingAccount(true);
        setGuestError(content.guestAccountExists);
      } else if (err.code === "guest_email_invalid" || err.status === 400) {
        setGuestError(content.unavailable);
      } else {
        setGuestError(content.unavailable);
      }
    } finally {
      setBusyCode(null);
    }
  }

  function goToLoginFromGuest(): void {
    if (!guestCode) return;
    rememberPendingCheckout(guestCode);
    const returnTo = currentPricingReturnTo();
    setGuestCode(null);
    window.location.assign(`/login?returnTo=${encodeURIComponent(returnTo)}`);
  }

  async function startCheckout(code: string) {
    if (busyCode) return;
    setBusyCode(code);
    setError(null);

    try {
      const result = await createBillingCheckoutSession(code);
      window.sessionStorage.removeItem(PENDING_OFFER_KEY);
      window.sessionStorage.removeItem(PENDING_RETURN_KEY);
      window.location.assign(result.url);
    } catch (rawError) {
      const err = rawError as ApiError;
      if (err.status === 401) {
        // A visitor can continue directly to Stripe after supplying a billing email.
        // Existing authenticated users still use the tenant-bound Checkout above.
        openGuestCheckout(code);
        return;
      }
      if (err.status === 403) {
        setError(content.accessDenied);
      } else {
        setError(content.unavailable);
      }
    } finally {
      setBusyCode(null);
    }
  }

  useEffect(() => {
    const pending = window.sessionStorage.getItem(PENDING_OFFER_KEY);
    if (!pending) return;

    // Consume before starting to avoid duplicate Checkout Sessions under React
    // StrictMode; a 401 inside startCheckout() persists it again for retry.
    window.sessionStorage.removeItem(PENDING_OFFER_KEY);
    void startCheckout(pending);
    // Executa apenas o checkout pendente após o retorno do login.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="ng-self-service">
      <div className="ng-self-service-head reveal">
        <span className="tagline">{content.eyebrow}</span>
        <h3 className="ng-self-service-title">{content.title}</h3>
        <p className="ng-section-sub">{content.subtitle}</p>
      </div>

      {error && <div className="ng-billing-notice" role="alert">{error}</div>}

      {guestCode && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="guest-checkout-title"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 300,
            display: "grid",
            placeItems: "center",
            padding: 20,
            background: "rgba(3, 10, 16, 0.78)",
            backdropFilter: "blur(5px)",
          }}
        >
          <form
            onSubmit={(event) => void submitGuestCheckout(event)}
            style={{
              width: "min(460px, 100%)",
              padding: 28,
              borderRadius: 16,
              background: "#101b24",
              border: "1px solid rgba(255,255,255,0.14)",
              boxShadow: "0 24px 80px rgba(0,0,0,0.38)",
            }}
          >
            <h3 id="guest-checkout-title" style={{ margin: "0 0 10px" }}>{content.guestTitle}</h3>
            <p style={{ margin: "0 0 20px", opacity: 0.8 }}>{content.guestDescription}</p>
            <label htmlFor="guest-billing-email" style={{ display: "block", marginBottom: 8 }}>{content.guestEmailLabel}</label>
            <input
              id="guest-billing-email"
              type="email"
              required
              autoComplete="email"
              value={guestEmail}
              onChange={(event) => setGuestEmail(event.target.value)}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "12px 14px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.2)",
                background: "rgba(255,255,255,0.06)",
                color: "inherit",
              }}
            />
            {guestError && <div className="ng-billing-notice" role="alert" style={{ marginTop: 14 }}>{guestError}</div>}
            {guestExistingAccount && (
              <button
                type="button"
                className="btn-secondary"
                onClick={goToLoginFromGuest}
                disabled={busyCode !== null}
                style={{ width: "100%", marginTop: 14 }}
              >
                {content.guestLogin}
              </button>
            )}
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 22 }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setGuestCode(null)}
                disabled={busyCode !== null}
              >
                {content.guestCancel}
              </button>
              <button type="submit" className="btn-primary" disabled={busyCode !== null}>
                {busyCode === guestCode ? "…" : content.guestContinue}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="ng-self-service-plans">
        {content.plans.map((plan, index) => (
          <article
            key={plan.code}
            className={`ng-tier ng-self-service-plan reveal${plan.highlight ? " highlight" : ""}`}
            style={{ transitionDelay: `${index * 80}ms` }}
          >
            {plan.highlight && <span className="ng-tier-flag">★</span>}
            <h4 className="ng-tier-name">{plan.name}</h4>
            <div className="ng-tier-price"><strong>{plan.price}</strong><span>{plan.period}</span></div>
            <p className="ng-self-service-credits">{plan.credits}</p>
            <p className="ng-tier-desc">{plan.desc}</p>
            <ul className="ng-tier-features">
              {plan.features.map((feature) => <li key={feature}>{feature}</li>)}
            </ul>
            <button
              type="button"
              className={plan.highlight ? "btn-primary" : "btn-secondary"}
              disabled={busyCode !== null}
              onClick={() => void startCheckout(plan.code)}
            >
              {busyCode === plan.code ? "…" : plan.cta}
            </button>
          </article>
        ))}
      </div>

      <div className="ng-credit-packs reveal">
        <div className="ng-credit-packs-head">
          <h3 className="ng-self-service-title">{content.creditsTitle}</h3>
          <p className="ng-section-sub">{content.creditsSubtitle}</p>
        </div>
        <div className="ng-credit-packs-grid">
          {content.packs.map((pack) => (
            <article key={pack.code} className="ng-credit-pack">
              <div>
                <h4>{pack.name}</h4>
                <strong>{pack.price}</strong>
                <span>{pack.unit}</span>
              </div>
              <button
                type="button"
                className="btn-secondary"
                disabled={busyCode !== null}
                onClick={() => void startCheckout(pack.code)}
              >
                {busyCode === pack.code ? "…" : pack.cta}
              </button>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
