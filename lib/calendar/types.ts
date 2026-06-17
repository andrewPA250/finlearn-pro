export type CalendarEventType = "earnings" | "ipo" | "economic" | "dividend";
export type CalendarFilter = "all" | CalendarEventType;
export type DateRange = "today" | "week" | "month";

export interface EarningsEvent {
  type: "earnings";
  symbol: string;
  date: string;
  /** "bmo" = before market open, "amc" = after market close, "" = unspecified */
  hour: string;
  quarter: number;
  year: number;
  epsEstimate: number | null;
  epsActual: number | null;
  revenueEstimate: number | null;
  revenueActual: number | null;
}

export interface IpoEvent {
  type: "ipo";
  date: string;
  exchange: string;
  name: string;
  symbol: string;
  numberOfShares: number | null;
  /** Price range string, e.g. "14.00-16.00" */
  price: string | null;
  status: string;
  totalSharesValue: number | null;
}

export type CalendarEvent = EarningsEvent | IpoEvent;

/** Per-category availability status */
export type CategoryAvailability = "available" | "unavailable";

export interface CalendarData {
  earnings: EarningsEvent[];
  ipos: IpoEvent[];
  earningsAvailable: boolean;
  iposAvailable: boolean;
  /** ISO date range actually fetched */
  fromDate: string;
  toDate: string;
}
