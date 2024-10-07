import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const task = await prisma.task.findUnique({
    where: { id },
  });

  if (!task) {
    return new NextResponse("No task with ID found", { status: 404 });
  }

  return NextResponse.json(task);
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const json = await request.json();

  const updated_task = await prisma.task.update({
    where: { id },
    data: json,
  });

  if (!updated_task) {
    return new NextResponse("No task with ID found", { status: 404 });
  }

  return NextResponse.json(updated_task);
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  await prisma.task.delete({
    where: { id },
  });

  return new NextResponse(null, { status: 204 });
}
