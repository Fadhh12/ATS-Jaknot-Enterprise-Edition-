/** Converts a local/international phone string to the digits wa.me expects. */
export function toWhatsAppNumber(phone: string): string {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = `62${digits.slice(1)}`;
  return digits;
}

export function toWhatsAppLink(phone: string): string {
  return `https://wa.me/${toWhatsAppNumber(phone)}`;
}
