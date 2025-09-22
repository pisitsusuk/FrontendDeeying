import moment from "moment/min/moment-with-locales";


// แสดงวัน+เวลา locale ไทย, โซน Asia/Bangkok
export function dateTimeFormat(value, withSeconds = false) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("th-TH", {
    timeZone: "Asia/Bangkok",
    dateStyle: "long",
    timeStyle: withSeconds ? "medium" : "short", // medium = มีวินาที, short = ชั่วโมง:นาที
  });
}
