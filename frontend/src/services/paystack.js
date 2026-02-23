export function openPaystackCheckout({
  email,
  amount,
  reference,
  metadata,
  onSuccess,
  onClose,
}) {
  if (!window.PaystackPop) {
    throw new Error("Paystack script not loaded. Check internet or disable ad blockers.");
  }

  const key = process.env.REACT_APP_PAYSTACK_PUBLIC_KEY;
  if (!key) {
    throw new Error("Missing REACT_APP_PAYSTACK_PUBLIC_KEY.");
  }

  const handler = window.PaystackPop.setup({
    key,
    email,
    amount: Math.round(Number(amount) * 100),
    ref: reference || `PS_${Date.now()}`,
    metadata: metadata || {},
    currency: "ZAR",
    callback: (response) => {
      if (typeof onSuccess === "function") {
        onSuccess(response);
      }
    },
    onClose: () => {
      if (typeof onClose === "function") {
        onClose();
      }
    },
  });

  handler.openIframe();
}

export function createEftReference(prefix = "EFT") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}
