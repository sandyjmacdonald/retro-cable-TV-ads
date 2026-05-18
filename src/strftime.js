const DAYS_SHORT   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const DAYS_LONG    = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MONTHS_LONG  = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const p2 = n => String(n).padStart(2, '0');
const p3 = n => String(n).padStart(3, '0');

export function strftime(fmt, date) {
  const d = date instanceof Date ? date : new Date();
  const h  = d.getHours();
  const h12 = h % 12 || 12;
  const dayOfYear = Math.ceil((d - new Date(d.getFullYear(), 0, 1)) / 86_400_000) + 1;

  return fmt
    // No-leading-zero variants must come before their padded cousins
    .replace(/%-I/g, String(h12))
    .replace(/%-H/g, String(h))
    .replace(/%-m/g, String(d.getMonth() + 1))
    .replace(/%-d/g, String(d.getDate()))
    .replace(/%-M/g, String(d.getMinutes()))
    .replace(/%-S/g, String(d.getSeconds()))
    // Named
    .replace(/%A/g, DAYS_LONG[d.getDay()])
    .replace(/%a/g, DAYS_SHORT[d.getDay()])
    .replace(/%B/g, MONTHS_LONG[d.getMonth()])
    .replace(/%b/g, MONTHS_SHORT[d.getMonth()])
    // Numeric
    .replace(/%Y/g, d.getFullYear())
    .replace(/%y/g, p2(d.getFullYear() % 100))
    .replace(/%m/g, p2(d.getMonth() + 1))
    .replace(/%d/g, p2(d.getDate()))
    .replace(/%e/g, String(d.getDate()))
    .replace(/%H/g, p2(h))
    .replace(/%I/g, p2(h12))
    .replace(/%M/g, p2(d.getMinutes()))
    .replace(/%S/g, p2(d.getSeconds()))
    .replace(/%p/g, h >= 12 ? 'PM' : 'AM')
    .replace(/%P/g, h >= 12 ? 'pm' : 'am')
    .replace(/%j/g, p3(dayOfYear));
}
