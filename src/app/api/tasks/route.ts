import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const search = searchParams.get("search") || "";
  const skip = (page - 1) * limit;

  let where: Prisma.TaskWhereInput = {};

  if (search) {
    where = {
      OR: [{ description: { contains: search, mode: "insensitive" } }],
    };
  }

  const [tasks, totalCount] = await Promise.all([
    prisma.task.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.task.count({ where }),
  ]);

  return NextResponse.json({
    tasks,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
  });
}

export async function POST(request: Request) {
  const json = await request.json();
  const task = await prisma.task.create({
    data: json,
  });
  return new NextResponse(JSON.stringify(task), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
}
