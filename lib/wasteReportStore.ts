import {
  WasteSegregationReport,
  CreateWasteReportRequest,
  WasteReportFilters,
} from "@/types/wasteReport";

// In-memory store for waste reports (replace with database in production)
class WasteReportStore {
  private reports: WasteSegregationReport[] = [];

  // Generate unique ID
  private generateId(): string {
    return `WR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Calculate segregation score based on waste categories
  private calculateSegregationScore(
    categories: WasteSegregationReport["wasteCategories"]
  ): number {
    if (categories.length === 0) return 0;
    const properlySegregated = categories.filter(
      (c) => c.isProperlySegregated
    ).length;
    return Math.round((properlySegregated / categories.length) * 100);
  }

  // Calculate total waste in kg
  private calculateTotalWaste(
    categories: WasteSegregationReport["wasteCategories"]
  ): number {
    return categories.reduce((sum, category) => sum + category.weightKg, 0);
  }

  // Create a new report
  create(reportData: CreateWasteReportRequest): WasteSegregationReport {
    const now = new Date();
    const newReport: WasteSegregationReport = {
      id: this.generateId(),
      communityId: reportData.communityId,
      communityName: reportData.communityName,
      reporterId: reportData.reporterId,
      reporterName: reportData.reporterName,
      reportDate: now,
      wasteCategories: reportData.wasteCategories,
      totalWasteKg: this.calculateTotalWaste(reportData.wasteCategories),
      segregationScore: this.calculateSegregationScore(
        reportData.wasteCategories
      ),
      location: reportData.location,
      status: "pending",
      notes: reportData.notes,
      images: reportData.images,
      createdAt: now,
      updatedAt: now,
    };

    this.reports.push(newReport);
    return newReport;
  }

  // Get all reports with optional filtering
  getAll(filters?: WasteReportFilters): WasteSegregationReport[] {
    let filteredReports = [...this.reports];

    if (filters) {
      if (filters.communityId) {
        filteredReports = filteredReports.filter(
          (r) => r.communityId === filters.communityId
        );
      }
      if (filters.status) {
        filteredReports = filteredReports.filter(
          (r) => r.status === filters.status
        );
      }
      if (filters.ward) {
        filteredReports = filteredReports.filter(
          (r) => r.location.ward === filters.ward
        );
      }
      if (filters.zone) {
        filteredReports = filteredReports.filter(
          (r) => r.location.zone === filters.zone
        );
      }
      if (filters.startDate) {
        const startDate = new Date(filters.startDate);
        filteredReports = filteredReports.filter(
          (r) => new Date(r.reportDate) >= startDate
        );
      }
      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        filteredReports = filteredReports.filter(
          (r) => new Date(r.reportDate) <= endDate
        );
      }
      if (filters.minScore !== undefined) {
        filteredReports = filteredReports.filter(
          (r) => r.segregationScore >= filters.minScore!
        );
      }
      if (filters.maxScore !== undefined) {
        filteredReports = filteredReports.filter(
          (r) => r.segregationScore <= filters.maxScore!
        );
      }
    }

    // Sort by most recent first
    return filteredReports.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  // Get paginated reports
  getPaginated(
    page: number = 1,
    limit: number = 10,
    filters?: WasteReportFilters
  ): {
    reports: WasteSegregationReport[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  } {
    const allReports = this.getAll(filters);
    const totalItems = allReports.length;
    const totalPages = Math.ceil(totalItems / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedReports = allReports.slice(startIndex, endIndex);

    return {
      reports: paginatedReports,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  // Find report by ID
  findById(id: string): WasteSegregationReport | undefined {
    return this.reports.find((r) => r.id === id);
  }

  // Update report status
  updateStatus(
    id: string,
    status: WasteSegregationReport["status"]
  ): WasteSegregationReport | undefined {
    const report = this.findById(id);
    if (report) {
      report.status = status;
      report.updatedAt = new Date();
    }
    return report;
  }

  // Delete report
  delete(id: string): boolean {
    const index = this.reports.findIndex((r) => r.id === id);
    if (index !== -1) {
      this.reports.splice(index, 1);
      return true;
    }
    return false;
  }

  // Get reports by community
  getByCommunity(communityId: string): WasteSegregationReport[] {
    return this.reports.filter((r) => r.communityId === communityId);
  }

  // Get reports by reporter
  getByReporter(reporterId: string): WasteSegregationReport[] {
    return this.reports.filter((r) => r.reporterId === reporterId);
  }
}

// Export singleton instance
export const wasteReportStore = new WasteReportStore();
