/**
 * Advanced features for AppsTV
 * - Bulk operations
 * - Export functionality
 * - Analytics and reporting
 */

import * as db from "./db";

/**
 * Bulk generate activation codes
 */
export async function bulkGenerateActivationCodes(
  resellerId: number,
  count: number,
  durationDays: number
): Promise<{ codes: string[]; totalGenerated: number }> {
  const codes: string[] = [];
  
  for (let i = 0; i < count; i++) {
    // Generate unique code
    const code = generateActivationCode();
    
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + durationDays);

    try {
      const created = await db.createActivationCode({
        code,
        resellerId,
        customerId: null,
        status: "available",
        durationDays,
        expirationDate,
        activatedAt: null,
      });
      
      codes.push(created.code);
    } catch (error) {
      // Skip duplicates and continue
      continue;
    }
  }

  return {
    codes,
    totalGenerated: codes.length,
  };
}

/**
 * Generate a unique activation code
 */
function generateActivationCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  
  for (let i = 0; i < 12; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return code;
}

/**
 * Export reseller data as CSV
 */
export async function exportResellerData(resellerId: number): Promise<string> {
  const reseller = await db.getResellerById(resellerId);
  if (!reseller) throw new Error("Reseller not found");

  const codes = await db.getActivationCodesByResellerId(resellerId);
  const transactions = await db.getCreditTransactionsByResellerId(resellerId);
  const macActivations = await db.getMacActivationsByResellerId(resellerId);

  let csv = "AppsTV Reseller Export\n";
  csv += `Reseller: ${reseller.companyName}\n`;
  csv += `Generated: ${new Date().toISOString()}\n\n`;

  // Activation Codes Section
  csv += "ACTIVATION CODES\n";
  csv += "Code,Status,Duration (days),Expiration Date,Activated At\n";
  codes.forEach((code) => {
    csv += `${code.code},${code.status},${code.durationDays},${code.expirationDate.toISOString()},${code.activatedAt?.toISOString() || "N/A"}\n`;
  });

  csv += "\n";

  // Credit Transactions Section
  csv += "CREDIT TRANSACTIONS\n";
  csv += "Type,Amount,Description,Created At\n";
  transactions.forEach((tx) => {
    csv += `${tx.type},${tx.amount},${tx.description},${tx.createdAt.toISOString()}\n`;
  });

  csv += "\n";

  // MAC Activations Section
  csv += "MAC ACTIVATIONS\n";
  csv += "MAC ID,Status,Expiration Date,IPTV List URL\n";
  macActivations.forEach((mac) => {
    csv += `${mac.macId},${mac.status},${mac.expirationDate.toISOString()},${mac.iptvListUrl || "N/A"}\n`;
  });

  return csv;
}

/**
 * Get analytics for a reseller
 */
export async function getResellerAnalytics(resellerId: number) {
  const codes = await db.getActivationCodesByResellerId(resellerId);
  const transactions = await db.getCreditTransactionsByResellerId(resellerId);
  const macActivations = await db.getMacActivationsByResellerId(resellerId);

  const now = new Date();
  
  return {
    activationCodes: {
      total: codes.length,
      available: codes.filter((c) => c.status === "available").length,
      activated: codes.filter((c) => c.status === "activated").length,
      expired: codes.filter((c) => c.status === "expired").length,
    },
    macActivations: {
      total: macActivations.length,
      active: macActivations.filter((m) => m.status === "active" && m.expirationDate > now).length,
      expiring: macActivations.filter(
        (m) => m.status === "active" && m.expirationDate <= now && m.expirationDate > new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      ).length,
      expired: macActivations.filter((m) => m.expirationDate <= now).length,
    },
    credits: {
      totalTransactions: transactions.length,
      totalSpent: transactions
        .filter((t) => t.type === "distribution" || t.type === "mac_activation")
        .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0),
      totalRefunded: transactions
        .filter((t) => t.type === "refund")
        .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0),
    },
  };
}

/**
 * Get platform-wide analytics
 */
export async function getPlatformAnalytics() {
  const users = await db.getAllUsers();
  const resellers = await db.getAllResellers();
  const stats = await db.getAccessLogStatistics(30);

  return {
    users: {
      total: users.length,
      admins: users.filter((u) => u.role === "admin").length,
      resellers: users.filter((u) => u.role === "reseller").length,
      customers: users.filter((u) => u.role === "customer").length,
      active: users.filter((u) => u.status === "active").length,
    },
    resellers: {
      total: resellers.length,
      active: resellers.filter((r) => r.status === "active").length,
      totalCredits: resellers.reduce((sum, r) => sum + parseFloat(r.creditBalance.toString()), 0),
    },
    accessLogs: {
      last30Days: stats,
    },
  };
}

/**
 * Cleanup expired activation codes and MAC activations
 */
export async function cleanupExpiredData(): Promise<{ codesRemoved: number; macsRemoved: number }> {
  const now = new Date();
  let codesRemoved = 0;
  let macsRemoved = 0;

  // Note: In a real implementation, you would have delete operations
  // For now, this is a placeholder for cleanup logic
  
  return {
    codesRemoved,
    macsRemoved,
  };
}

/**
 * Generate usage report for a date range
 */
export async function generateUsageReport(startDate: Date, endDate: Date) {
  const logs = await db.getAccessLogsByDateRange(startDate, endDate, 10000);

  const report = {
    period: {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    },
    totalAttempts: logs.length,
    byStatus: {
      success: logs.filter((l) => l.status === "success").length,
      failed: logs.filter((l) => l.status === "failed").length,
      blocked: logs.filter((l) => l.status === "blocked").length,
    },
    byApplication: {} as Record<number, number>,
    topMacs: {} as Record<string, number>,
  };

  // Count by application
  logs.forEach((log) => {
    report.byApplication[log.applicationId] = (report.byApplication[log.applicationId] || 0) + 1;
    report.topMacs[log.macId] = (report.topMacs[log.macId] || 0) + 1;
  });

  // Sort top MACs
  const topMacsSorted = Object.entries(report.topMacs)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .reduce((acc, [mac, count]) => {
      acc[mac] = count;
      return acc;
    }, {} as Record<string, number>);

  report.topMacs = topMacsSorted;

  return report;
}
