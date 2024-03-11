export interface ResourcesCostsResponse {
  id: string;
  name: string;
  type: string;
  values: ResourcesCostsValuesResponse[];
}

export interface ResourcesCostsValuesResponse {
  cost: number;
  usageDate: Date;
  resourceGroup: string;
  resourceType: string;
  currency: string;
  ResourcesCosts: ResourcesCostsResponse;
  ResourcesCostsId: string;
}

export interface BudgetResponse {
  id: string;
  name: string;
  type: string;
  eTag?: string;
  startDate: Date;
  endDate: Date;
  timeGrain: string;
  amount: number;
  currentSpend: number;
  unit: string;
  category: string;
}

export interface AlertResponse {
  id: string;
  name: string;
  type: string;
  alertType: string;
  alertCategory: string;
  alertCriteria: string;
  description: string;
  source: string;
  timeGrainType: string;
  periodStartDate: Date;
  triggeredBy: string;
  threshold: number;
  operator: string;
  amount: number;
  unit: string;
  currentSpend: number;
  costEntityId: string;
  status: string;
  creationTime: Date;
  closeTime: Date;
  modificationTime: Date;
  statusModificationTime: Date;
}
