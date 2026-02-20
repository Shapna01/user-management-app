import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(
      "SELECT id, name, email, role FROM users ORDER BY id ASC"
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Fetch users error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}