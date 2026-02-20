import { NextResponse } from "next/server";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    const user = result.rows[0];

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return NextResponse.json({ error: "Invalid password" }, { status: 400 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}