export interface HerokuInvoiceApiResponseTypes {
  charges_total: number;
  created_at: string; // Date-time format: "2012-01-01T12:00:00Z"
  credits_total: number;
  id: string; // UUID format: "01234567-89ab-cdef-0123-456789abcdef"
  number: number;
  period_end: string; // Date format: "01/31/2014"
  period_start: string; // Date format: "01/01/2014"
  state: number; // Payment status (pending: 1, successful: 2, failed: 3, etc.)
  total: number;
  updated_at: string; // Date-time format: "2012-01-01T12:00:00Z"
}
