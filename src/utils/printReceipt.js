import { formatPrice } from "./helpers";

export const printReceipt = (receipt) => {
  if (!receipt) return;

  const itemsHTML = receipt.items
    .map(
      (item) => `
        <tr>
          <td style="padding: 3px 0; vertical-align: top;">
            <div style="font-weight: bold;">${item.name}</div>
            <div style="font-size: 9px; color: #444;">${item.variantName} x${item.qty}</div>
          </td>
          <td style="text-align: right; font-weight: bold; vertical-align: top; white-space: nowrap; padding-left: 4px;">
            ${formatPrice(item.priceNumber * item.qty)}
          </td>
        </tr>
      `,
    )
    .join("");

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Struk ${receipt.invoiceNo}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          html, body {
            font-family: 'Courier New', 'Lucida Console', monospace;
            width: 58mm; max-width: 58mm; margin: 0 auto;
            padding: 4px 2px; color: #000; background: #fff;
            font-size: 11px; line-height: 1.35;
            -webkit-print-color-adjust: exact; print-color-adjust: exact;
          }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .title { font-size: 15px; font-weight: bold; letter-spacing: 0.5px; }
          .sub { font-size: 10px; color: #222; margin-top: 1px; }
          .divider { border-top: 1px dashed #000; margin: 5px 0; }
          table { width: 100%; border-collapse: collapse; font-size: 11px; }
          td { vertical-align: top; }
          .label-cell { padding: 1px 0; }
          .value-cell { text-align: right; font-weight: bold; padding: 1px 0; }
          .change-row td {
            font-weight: bold; font-size: 13px; padding-top: 4px;
            border-top: 1px dashed #000;
          }
          .footer {
            text-align: center; font-size: 9px; margin-top: 8px;
            color: #222; line-height: 1.4;
          }
          @media print {
            @page { margin: 0; size: 58mm auto; }
            html, body { width: 58mm; padding: 2px 1mm; }
          }
        </style>
      </head>
      <body>
        <div class="center">
          <div class="title">TOKO ARKAN</div>
          <div class="sub">Sembako, Top Up &amp; Digital</div>
          <div class="sub">${receipt.date}</div>
          <div class="sub">${receipt.invoiceNo}</div>
        </div>
        <div class="divider"></div>
        <div class="bold" style="margin-bottom: 3px; font-size: 11px;">ITEM DIBELI</div>
        <table>${itemsHTML}</table>
        <div class="divider"></div>
        <table>
          <tr><td class="label-cell">Total</td><td class="value-cell">${formatPrice(receipt.total)}</td></tr>
          <tr><td class="label-cell">Uang Diterima</td><td class="value-cell">${formatPrice(receipt.cash)}</td></tr>
          <tr class="change-row"><td>Kembalian</td><td style="text-align: right;">${formatPrice(receipt.change)}</td></tr>
        </table>
        <div class="divider"></div>
        <div class="footer">
          Terima kasih telah berbelanja<br/>
          <span class="bold">Toko Arkan</span><br/>
          Barang yang sudah dibeli<br/>
          tidak dapat ditukar
        </div>
        <script>
          window.onload = function () {
            window.focus();
            window.print();
            setTimeout(function () { window.close(); }, 500);
          };
        </script>
      </body>
    </html>
  `;

  const printWindow = window.open("", "_blank", "width=350,height=600");
  if (!printWindow) {
    alert("Popup diblokir. Izinkan popup untuk mencetak struk.");
    return;
  }
  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
};
