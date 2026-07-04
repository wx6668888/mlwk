import { useEffect, useRef, useState } from "react";
import type { Currency } from "../../shared/storeCatalog";

type PayPalCheckoutProps = {
  currency: Currency;
  disabled: boolean;
  createOrder: () => Promise<string>;
  captureOrder: (paypalOrderId: string) => Promise<void>;
  onError: (message: string) => void;
};

export default function PayPalCheckout({
  currency,
  disabled,
  createOrder,
  captureOrder,
  onError,
}: PayPalCheckoutProps) {
  const container = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;

  useEffect(() => {
    if (!clientId || disabled || !container.current) return;
    let cancelled = false;
    const scriptId = "mlwk-paypal-sdk";
    const current = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (current && current.dataset.currency !== currency) current.remove();

    const render = async () => {
      if (cancelled || !container.current || !window.paypal) return;
      container.current.replaceChildren();
      const buttons = window.paypal.Buttons({
        style: { layout: "vertical", shape: "rect", label: "paypal" },
        createOrder: async () => {
          setLoading(true);
          try {
            return await createOrder();
          } finally {
            setLoading(false);
          }
        },
        onApprove: async (data) => {
          setLoading(true);
          try {
            await captureOrder(data.orderID);
          } catch (error) {
            onError(error instanceof Error ? error.message : "Payment failed.");
          } finally {
            setLoading(false);
          }
        },
        onError: (error) => {
          setLoading(false);
          onError(String(error));
        },
      });
      await buttons.render(container.current);
    };

    if (window.paypal) {
      void render();
      return () => {
        cancelled = true;
      };
    }

    const existing = document.getElementById(scriptId) as HTMLScriptElement | null;
    const script = existing ?? document.createElement("script");
    if (!existing) {
      script.id = scriptId;
      script.dataset.currency = currency;
      script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=${currency}&intent=capture`;
      script.async = true;
      document.head.appendChild(script);
    }
    script.addEventListener("load", render);
    script.addEventListener("error", () => onError("PayPal could not be loaded."));
    return () => {
      cancelled = true;
      script.removeEventListener("load", render);
    };
  }, [captureOrder, clientId, createOrder, currency, disabled, onError]);

  if (!clientId) return null;
  return (
    <div className={`paypal-shell ${loading ? "is-loading" : ""}`}>
      <div ref={container} />
    </div>
  );
}
