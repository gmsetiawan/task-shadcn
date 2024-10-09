import { prisma } from "@/lib/db";
import { Priority, Prisma, Status } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const search = searchParams.get("search") || "";
  const priority = searchParams.get("priority") || "";
  const status = searchParams.get("status") || "";

  const skip = (page - 1) * limit;

  let where: Prisma.TaskWhereInput = {};

  if (search) {
    where = {
      OR: [{ description: { contains: search, mode: "insensitive" } }],
    };
  }

  if (priority) {
    const priorityArray = priority.split(",");
    where.priority = { in: priorityArray as Priority[] };
  }

  if (status) {
    const statusArray = status.split(",");
    where.status = { in: statusArray as Status[] };
  }

  const [
    tasks,
    totalCount,
    totalTasks,
    priorityCounts,
    statusCounts,
    priorityStatusCounts,
  ] = await Promise.all([
    prisma.task.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.task.count({ where }),
    prisma.task.count(),
    prisma.task.groupBy({
      by: ["priority"],
      _count: true,
    }),
    prisma.task.groupBy({
      by: ["status"],
      _count: true,
      where,
    }),
    prisma.task.groupBy({
      by: ["priority", "status"],
      _count: true,
    }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  const priorityCountsObject = priorityCounts.reduce((acc, curr) => {
    acc[curr.priority] = curr._count;
    return acc;
  }, {} as Record<string, number>);

  const statusCountsObject = statusCounts.reduce((acc, curr) => {
    acc[curr.status] = curr._count;
    return acc;
  }, {} as Record<string, number>);

  const priorityStatusCountsObject = priorityStatusCounts.reduce(
    (acc, curr) => {
      if (!acc[curr.priority]) {
        acc[curr.priority] = {};
      }
      acc[curr.priority][curr.status] = curr._count;
      return acc;
    },
    {} as Record<string, Record<string, number>>
  );

  return NextResponse.json({
    tasks,
    currentPage: page,
    totalPages,
    totalCount,
    totalTasks,
    priorityCounts: priorityCountsObject,
    statusCounts: statusCountsObject,
    priorityStatusCounts: priorityStatusCountsObject,
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
