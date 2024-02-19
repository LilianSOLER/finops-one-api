export interface Metric {
    timePeriod: Date;
    service: string;
    amortizedCost: number;
    blendedCost: number;
    netAmortizedCost: number;
    unblendedCost: number;
    netUnblendedCost: number;
    usageQuantity: number;
    normalizedUsageAmount: number;
  }

export interface MetricGroupeBy{
  cost? : number;
  service? : string;
}