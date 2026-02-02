import { NextRequest, NextResponse } from "next/server";
import { wasteReportStore } from "@/lib/wasteReportStore";
import {
  CreateWasteReportRequest,
  WasteReportFilters,
  WasteReportResponse,
  WasteCategory,
} from "@/types/wasteReport";

// Valid waste category types
const VALID_WASTE_TYPES: WasteCategory["type"][] = [
  "organic",
  "recyclable",
  "hazardous",
  "electronic",
  "general",
];

// Valid report statuses
const VALID_STATUSES = ["pending", "verified", "rejected"] as const;

/**
 * GET /api/reports/waste-segregation
 * Retrieve community waste segregation reports with pagination and filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse pagination parameters
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "10", 10))
    );

    // Parse filter parameters
    const filters: WasteReportFilters = {};

    const communityId = searchParams.get("communityId");
    if (communityId) filters.communityId = communityId;

    const status = searchParams.get("status");
    if (
      status &&
      VALID_STATUSES.includes(status as (typeof VALID_STATUSES)[number])
    ) {
      filters.status = status as WasteReportFilters["status"];
    }

    const ward = searchParams.get("ward");
    if (ward) filters.ward = ward;

    const zone = searchParams.get("zone");
    if (zone) filters.zone = zone;

    const startDate = searchParams.get("startDate");
    if (startDate) {
      // Validate date format
      if (isNaN(Date.parse(startDate))) {
        return NextResponse.json(
          {
            success: false,
            error: "Validation failed",
            message: "Invalid startDate format. Use ISO 8601 format.",
          } as WasteReportResponse,
          { status: 400 }
        );
      }
      filters.startDate = startDate;
    }

    const endDate = searchParams.get("endDate");
    if (endDate) {
      // Validate date format
      if (isNaN(Date.parse(endDate))) {
        return NextResponse.json(
          {
            success: false,
            error: "Validation failed",
            message: "Invalid endDate format. Use ISO 8601 format.",
          } as WasteReportResponse,
          { status: 400 }
        );
      }
      filters.endDate = endDate;
    }

    const minScore = searchParams.get("minScore");
    if (minScore) {
      const score = parseInt(minScore, 10);
      if (isNaN(score) || score < 0 || score > 100) {
        return NextResponse.json(
          {
            success: false,
            error: "Validation failed",
            message: "minScore must be a number between 0 and 100",
          } as WasteReportResponse,
          { status: 400 }
        );
      }
      filters.minScore = score;
    }

    const maxScore = searchParams.get("maxScore");
    if (maxScore) {
      const score = parseInt(maxScore, 10);
      if (isNaN(score) || score < 0 || score > 100) {
        return NextResponse.json(
          {
            success: false,
            error: "Validation failed",
            message: "maxScore must be a number between 0 and 100",
          } as WasteReportResponse,
          { status: 400 }
        );
      }
      filters.maxScore = score;
    }

    // Validate score range
    if (
      filters.minScore !== undefined &&
      filters.maxScore !== undefined &&
      filters.minScore > filters.maxScore
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          message: "minScore cannot be greater than maxScore",
        } as WasteReportResponse,
        { status: 400 }
      );
    }

    // Get paginated reports
    const { reports, pagination } = wasteReportStore.getPaginated(
      page,
      limit,
      filters
    );

    return NextResponse.json(
      {
        success: true,
        data: reports,
        pagination,
      } as WasteReportResponse,
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: "An unexpected error occurred while fetching reports",
      } as WasteReportResponse,
      { status: 500 }
    );
  }
}

/**
 * POST /api/reports/waste-segregation
 * Create a new community waste segregation report
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    let body: CreateWasteReportRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid JSON",
          message: "Request body must be valid JSON",
        } as WasteReportResponse,
        { status: 400 }
      );
    }

    // Validate required fields
    const validationErrors: string[] = [];

    if (!body.communityId || typeof body.communityId !== "string") {
      validationErrors.push("communityId is required and must be a string");
    }

    if (!body.communityName || typeof body.communityName !== "string") {
      validationErrors.push("communityName is required and must be a string");
    }

    if (!body.reporterId || typeof body.reporterId !== "string") {
      validationErrors.push("reporterId is required and must be a string");
    }

    if (!body.reporterName || typeof body.reporterName !== "string") {
      validationErrors.push("reporterName is required and must be a string");
    }

    // Validate waste categories
    if (!body.wasteCategories || !Array.isArray(body.wasteCategories)) {
      validationErrors.push("wasteCategories is required and must be an array");
    } else if (body.wasteCategories.length === 0) {
      validationErrors.push(
        "wasteCategories must contain at least one category"
      );
    } else {
      body.wasteCategories.forEach((category, index) => {
        if (!VALID_WASTE_TYPES.includes(category.type)) {
          validationErrors.push(
            `wasteCategories[${index}].type must be one of: ${VALID_WASTE_TYPES.join(", ")}`
          );
        }
        if (typeof category.weightKg !== "number" || category.weightKg < 0) {
          validationErrors.push(
            `wasteCategories[${index}].weightKg must be a non-negative number`
          );
        }
        if (typeof category.isProperlySegregated !== "boolean") {
          validationErrors.push(
            `wasteCategories[${index}].isProperlySegregated must be a boolean`
          );
        }
      });
    }

    // Validate location
    if (!body.location || typeof body.location !== "object") {
      validationErrors.push("location is required and must be an object");
    } else {
      if (!body.location.ward || typeof body.location.ward !== "string") {
        validationErrors.push("location.ward is required and must be a string");
      }
      if (!body.location.zone || typeof body.location.zone !== "string") {
        validationErrors.push("location.zone is required and must be a string");
      }
      if (!body.location.address || typeof body.location.address !== "string") {
        validationErrors.push(
          "location.address is required and must be a string"
        );
      }

      // Validate coordinates if provided
      if (body.location.coordinates) {
        const { latitude, longitude } = body.location.coordinates;
        if (typeof latitude !== "number" || latitude < -90 || latitude > 90) {
          validationErrors.push(
            "location.coordinates.latitude must be a number between -90 and 90"
          );
        }
        if (
          typeof longitude !== "number" ||
          longitude < -180 ||
          longitude > 180
        ) {
          validationErrors.push(
            "location.coordinates.longitude must be a number between -180 and 180"
          );
        }
      }
    }

    // Validate optional fields
    if (body.notes !== undefined && typeof body.notes !== "string") {
      validationErrors.push("notes must be a string if provided");
    }

    if (body.images !== undefined) {
      if (!Array.isArray(body.images)) {
        validationErrors.push("images must be an array if provided");
      } else if (!body.images.every((img) => typeof img === "string")) {
        validationErrors.push("all items in images array must be strings");
      }
    }

    // Return validation errors if any
    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          message: validationErrors.join("; "),
        } as WasteReportResponse,
        { status: 400 }
      );
    }

    // Create the report
    const newReport = wasteReportStore.create(body);

    return NextResponse.json(
      {
        success: true,
        data: newReport,
        message: "Waste segregation report created successfully",
      } as WasteReportResponse,
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: "An unexpected error occurred while creating the report",
      } as WasteReportResponse,
      { status: 500 }
    );
  }
}
