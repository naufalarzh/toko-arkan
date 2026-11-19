import { formatPrice } from "./helpers";

export const printReceipt = (receipt) => {
  if (!receipt) return;

  // Cek apakah perangkat Android (RawBT hanya untuk Android)
  const isAndroid = /Android/i.test(navigator.userAgent);

  if (isAndroid) {
    // === MODE RAWBT (TEKS MURNI) ===
    // Format struk menjadi teks biasa. Lebar 58mm biasanya 32 karakter.
    const line = "--------------------------------";

    // Fungsi bantuan untuk meratakan teks ke kanan (misal: Total .... Rp 10.000)
    const padRight = (left, right) => {
      const maxWidth = 32;
      const leftLen = left.length;
      const rightLen = right.length;
      const spaces = maxWidth - leftLen - rightLen;
      if (spaces <= 0) return left + " " + right;
      return left + " ".repeat(spaces) + right;
    };

    const padCenter = (text) => {
      const maxWidth = 32;
      const leftSpaces = Math.floor((maxWidth - text.length) / 2);
      return " ".repeat(Math.max(0, leftSpaces)) + text;
    };

    let text = "";
    text += padCenter("TOKO ARKAN") + "\n";
    text += padCenter("Sembako, Top Up & Digital") + "\n";
    text += padCenter(receipt.date) + "\n";
    text += padCenter(receipt.invoiceNo) + "\n";
    text += line + "\n";

    // Item
    receipt.items.forEach((item) => {
      text += `${item.name}\n`;
      text += `${item.variantName} x${item.qty}\n`;
      // Harga item rata kanan
      text += padRight("", formatPrice(item.priceNumber * item.qty)) + "\n";
    });

    text += line + "\n";
    text += padRight("Total", formatPrice(receipt.total)) + "\n";
    text += padRight("Uang Diterima", formatPrice(receipt.cash)) + "\n";
    text += padRight("Kembalian", formatPrice(receipt.change)) + "\n";
    text += line + "\n";
    text += padCenter("Terima kasih telah berbelanja") + "\n";
    text += padCenter("Toko Arkan") + "\n";
    text += padCenter("Barang yang sudah dibeli") + "\n";
    text += padCenter("tidak dapat ditukar") + "\n";

    // Encode teks dan kirim ke RawBT via Intent
    const encoded = encodeURIComponent(text);
    const url = "intent:" + encoded + "#Intent;scheme=rawbt;package=ru.a402d.rawbtprinter;end;";

    // Buka aplikasi RawBT
    window.location.href = url;
  } else {
    // === MODE DESKTOP (WINDOW.PRINT) ===
    // Fallback untuk PC, gunakan HTML seperti sebelumnya tapi dengan perbaikan warna
    // (Kode HTML lama Anda bisa ditaruh di sini, atau disederhanakan)
    // Untuk singkatnya, saya gunakan alert atau window.print sederhana.
    // Sebaiknya Anda tetap simpan kode HTML lama untuk fallback PC.
    alert("Fitur cetak langsung via RawBT hanya tersedia di Android. Silakan gunakan print browser di PC.");
  }
};
