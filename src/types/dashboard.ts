import type { Gateway, TransactionStatus } from "./common";

export interface DashboardRecentTransaction {
  id: string;
  referenceId: string;
  gateway: Gateway;
  amount: number;
  currency: string;
  status: TransactionStatus;
  createdAt: string;
  clientName: string;
}

export interface DashboardStatusBreakdown {
  status: TransactionStatus;
  _count: number;
}

export interface DashboardGatewayBreakdown {
  gateway: Gateway;
  _count: number;
  totalAmount: number;
}

export interface DashboardStats {
  totalClients: number;
  totalTransactions: number;
  successfulTransactions: number;
  totalAmount: number;
  successRate: string;
  recentTransactions: DashboardRecentTransaction[];
  statusBreakdown: DashboardStatusBreakdown[];
  gatewayBreakdown: DashboardGatewayBreakdown[];
}
