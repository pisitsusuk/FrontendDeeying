import moment from "moment/min/moment-with-locales";


export function dateFormat(value, style = "long") {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("th-TH", {
    timeZone: "Asia/Bangkok",
    dateStyle: style, // "short" | "medium" | "long" | "full"
  });
}

// แสดง "วัน + เวลา"
export function dateTimeFormat(value, withSeconds = false) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("th-TH", {
    timeZone: "Asia/Bangkok",
    dateStyle: "long",
    timeStyle: withSeconds ? "medium" : "short",
  });
}
