import { formatCurrency, formatDate } from "./format";

// Opens a clean, print-friendly copy of a sale/invoice in a new window and
// triggers the browser's print dialog. We render into a fresh window (with its
// own inline styles) instead of printing the app page — that way the print
// output is just the receipt, with no navbar/buttons and no Tailwind needed.

// Escape user-entered text (product names etc.) so it can't break the HTML.
const esc = (str) =>
  String(str ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );

export function printInvoice(sale) {
  const rows = sale.items
    .map(
      (item) => `
        <tr>
          <td>${esc(item.name)}</td>
          <td class="num">${formatCurrency(item.price)}</td>
          <td class="num">${item.quantity}</td>
          <td class="num">${formatCurrency(item.lineTotal)}</td>
        </tr>`
    )
    .join("");

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Invoice ${esc(sale.invoiceNumber)}</title>
        <style>
          * { box-sizing: border-box; }
          body {
            font-family: Arial, Helvetica, sans-serif;
            color: #111;
            max-width: 480px;
            margin: 24px auto;
            padding: 0 16px;
          }
          h1 { text-align: center; margin: 0 0 4px; font-size: 22px; }
          .shop { text-align: center; color: #555; font-size: 13px; margin-bottom: 16px; }
          .meta { font-size: 13px; color: #333; margin-bottom: 16px; }
          .meta div { margin-bottom: 2px; }
          table { width: 100%; border-collapse: collapse; font-size: 13px; }
          th, td { text-align: left; padding: 6px 4px; border-bottom: 1px solid #ddd; }
          th { color: #555; }
          .num { text-align: right; }
          .totals { margin-top: 12px; font-size: 13px; }
          .totals div { display: flex; justify-content: space-between; padding: 2px 4px; }
          .totals .grand { font-weight: bold; font-size: 15px; border-top: 2px solid #333; margin-top: 4px; padding-top: 6px; }
          .foot { text-align: center; color: #777; font-size: 12px; margin-top: 24px; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <h1>POS Store</h1>
        <div class="shop">Sales Invoice</div>

        <div class="meta">
          <div><strong>Invoice:</strong> ${esc(sale.invoiceNumber)}</div>
          <div><strong>Date:</strong> ${formatDate(sale.createdAt)}</div>
          <div><strong>Cashier:</strong> ${esc(sale.createdBy?.name || "—")}</div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th class="num">Price</th>
              <th class="num">Qty</th>
              <th class="num">Line Total</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>

        <div class="totals">
          <div><span>Subtotal</span><span>${formatCurrency(sale.subtotal)}</span></div>
          <div><span>Discount</span><span>${formatCurrency(sale.discount)}</span></div>
          <div class="grand"><span>Total</span><span>${formatCurrency(sale.total)}</span></div>
        </div>

        <div class="foot">Thank you for your purchase!</div>
      </body>
    </html>`;

  const win = window.open("", "PRINT", "height=650,width=520");
  if (!win) return; // pop-up blocked — nothing else we can do here
  win.document.write(html);
  win.document.close();
  win.focus();
  // Small delay so the content renders before the print dialog opens.
  setTimeout(() => win.print(), 250);
}
