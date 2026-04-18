const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { defineSecret } = require("firebase-functions/params");

const TG_TOKEN = defineSecret("TELEGRAM_BOT_TOKEN");
const TG_CHAT  = defineSecret("TELEGRAM_CHAT_ID");

exports.notifyNewOrder = onDocumentCreated(
  {
    document: "orders/{orderId}",
    secrets: [TG_TOKEN, TG_CHAT],
    region: "us-central1",
  },
  async (event) => {
    const snap = event.data;
    if (!snap) return;

    const order = snap.data();
    const {
      orderId,
      items = [],
      total,
      customerName,
      customerPhone,
    } = order;

    const lines = items
      .map(i => `• [${i.id}] ${i.name} × ${i.qty} — ₾${i.price * i.qty}`)
      .join("\n");

    const text = [
      "📨 Новая заявка (Messenger)!",
      "",
      lines,
      "",
      `Итого: ₾${total}`,
      `Имя: ${customerName || "—"}`,
      `Телефон: ${customerPhone || "—"}`,
      `ID: ${orderId}`,
    ].join("\n");

    const token = TG_TOKEN.value();
    const chatId = TG_CHAT.value();

    try {
      const res = await fetch(
        `https://api.telegram.org/bot${token}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: chatId, text }),
        }
      );
      if (!res.ok) {
        console.error("Telegram error:", await res.text());
      }
    } catch (err) {
      console.error("Failed to notify Telegram:", err);
    }
  }
);
