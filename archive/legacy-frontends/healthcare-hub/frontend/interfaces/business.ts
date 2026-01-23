// Business-specific interfaces

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  currency: string;
  description: string;
  category: string;
  date: string;
  status: 'pending' | 'completed' | 'failed';
  tags: string[];
}

export interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'investment';
  balance: number;
  currency: string;
  accountNumber: string;
  status: 'active' | 'inactive' | 'frozen';
  lastTransaction: string;
}

export interface Budget {
  id: string;
  name: string;
  amount: number;
  spent: number;
  remaining: number;
  period: 'monthly' | 'quarterly' | 'yearly';
  category: string;
  status: 'on-track' | 'over-budget' | 'under-budget';
  startDate: string;
  endDate: string;
}

export interface FinancialMetrics {
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  profitMargin: number;
  cashFlow: number;
  outstandingInvoices: number;
  overduePayments: number;
  averagePaymentTime: number;
}
