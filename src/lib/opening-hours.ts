/** Opening / viewing hours for Usedlost Vodice (Europe/Prague). */

export type OpeningStatus = {
  open: boolean;
  label: string;
  detail: string;
};

/** Inclusive month-day range that may wrap across year end (e.g. 11-01 → 03-31). */
function inMonthDayRange(
  month: number,
  day: number,
  fromMonth: number,
  fromDay: number,
  toMonth: number,
  toDay: number,
): boolean {
  const cur = month * 100 + day;
  const from = fromMonth * 100 + fromDay;
  const to = toMonth * 100 + toDay;
  if (from <= to) return cur >= from && cur <= to;
  return cur >= from || cur <= to;
}

function pragueParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Prague",
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";

  const weekdayRaw = get("weekday"); // Mon, Tue, …
  const weekday =
    weekdayRaw === "Mon"
      ? 1
      : weekdayRaw === "Tue"
        ? 2
        : weekdayRaw === "Wed"
          ? 3
          : weekdayRaw === "Thu"
            ? 4
            : weekdayRaw === "Fri"
              ? 5
              : weekdayRaw === "Sat"
                ? 6
                : 0;

  return {
    weekday,
    month: Number(get("month")),
    day: Number(get("day")),
    hour: Number(get("hour") === "24" ? "0" : get("hour")),
    minute: Number(get("minute")),
  };
}

function minutesOfDay(hour: number, minute: number) {
  return hour * 60 + minute;
}

/** Saturday open season: 1.4. – 31.10. */
export function isSaturdayOpenSeason(month: number, day: number) {
  return inMonthDayRange(month, day, 4, 1, 10, 31);
}

/** Saturday closed season: 1.11. – 31.3. */
export function isSaturdayClosedSeason(month: number, day: number) {
  return inMonthDayRange(month, day, 11, 1, 3, 31);
}

/** Winter Wednesday hours: 1.12. – end of February (incl. 29.2.). */
export function isWinterWednesdaySeason(month: number, day: number) {
  return inMonthDayRange(month, day, 12, 1, 2, 29);
}

export const OPENING_RULES = [
  {
    id: "sat-summer",
    text: "Sobota 1. 4. – 31. 10.: 8:00–11:30",
  },
  {
    id: "sat-winter",
    text: "Sobota 1. 11. – 31. 3.: zavřeno",
  },
  {
    id: "wed-winter",
    text: "Zimní provoz 1. 12. – 28. 2.: středa 8:00–16:00",
  },
] as const;

export function getOpeningStatus(now = new Date()): OpeningStatus {
  const { weekday, month, day, hour, minute } = pragueParts(now);
  const mins = minutesOfDay(hour, minute);

  // Saturday April–October: 8:00–11:30
  if (weekday === 6 && isSaturdayOpenSeason(month, day)) {
    const open = mins >= minutesOfDay(8, 0) && mins < minutesOfDay(11, 30);
    return {
      open,
      label: open ? "Teď otevřeno" : "Teď zavřeno",
      detail: open ? "Sobota do 11:30" : "Sobota 8:00–11:30",
    };
  }

  // Saturday November–March: closed (never say „otevřeno“)
  if (weekday === 6 && isSaturdayClosedSeason(month, day)) {
    return {
      open: false,
      label: "Teď zavřeno",
      detail: "Sobota 1. 11. – 31. 3. zavřeno",
    };
  }

  // Winter Wednesday: 8:00–16:00 (1.12.–28/29.2.)
  if (weekday === 3 && isWinterWednesdaySeason(month, day)) {
    const open = mins >= minutesOfDay(8, 0) && mins < minutesOfDay(16, 0);
    return {
      open,
      label: open ? "Teď otevřeno" : "Teď zavřeno",
      detail: open ? "Středa do 16:00" : "Zima zavřeno",
    };
  }

  // All other days / seasons: not a public open slot
  if (isWinterWednesdaySeason(month, day)) {
    return {
      open: false,
      label: "Teď zavřeno",
      detail: "Zima zavřeno",
    };
  }

  if (isSaturdayOpenSeason(month, day)) {
    return {
      open: false,
      label: "Teď zavřeno",
      detail: "Sobota 8:00–11:30",
    };
  }

  return {
    open: false,
    label: "Teď zavřeno",
    detail: "Sobota 1. 11. – 31. 3. zavřeno",
  };
}
