import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "../../../lib/auth";
import prisma from "../../../lib/prisma";

// Schema for team member creation/update
const teamMemberSchema = z.object({
  name: z.string().min(1, "Name is required"),
  title: z.string().min(1, "Title is required"),
  bio: z.string().min(1, "Bio is required"),
  photo: z.string().optional(),
  displayOrder: z.number().optional(),
  isVisible: z.boolean().optional(),
  specializations: z.string().optional(),
  socialLinks: z
    .array(
      z.object({
        platform: z.string(),
        url: z.string().url("Invalid URL"),
      })
    )
    .optional(),
  contactInfo: z
    .object({
      email: z.string().email("Invalid email").optional(),
      phone: z.string().optional(),
    })
    .optional(),
});

// GET /api/team - Get all team members
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // Parse query parameters
  const includeHidden = searchParams.get("includeHidden") === "true";
  const search = searchParams.get("search");

  // Build filter object
  const where: any = {};

  if (!includeHidden) {
    where.isVisible = true;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { title: { contains: search, mode: "insensitive" } },
      { bio: { contains: search, mode: "insensitive" } },
      { specializations: { contains: search, mode: "insensitive" } },
    ];
  }

  try {
    const teamMembers = await prisma.teamMember.findMany({
      where,
      orderBy: { displayOrder: "asc" },
      include: {
        socialLinks: true,
        contactInfo: true,
      },
    });

    return NextResponse.json(teamMembers);
  } catch (error) {
    console.error("Error fetching team members:", error);
    return NextResponse.json(
      { error: "Error fetching team members" },
      { status: 500 }
    );
  }
}

// POST /api/team - Create a new team member
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  // Check if user is authenticated
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if user has required role (ADMIN)
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const validatedData = teamMemberSchema.parse(body);

    // If no display order is provided, get the highest current display order and add 1
    if (!validatedData.displayOrder) {
      const highestOrderMember = await prisma.teamMember.findFirst({
        orderBy: { displayOrder: "desc" },
      });

      validatedData.displayOrder = highestOrderMember
        ? highestOrderMember.displayOrder + 1
        : 0;
    }

    // Extract nested data
    const { socialLinks, contactInfo, ...memberData } = validatedData;

    // Create the team member
    const teamMember = await prisma.teamMember.create({
      data: {
        ...memberData,
        isVisible: validatedData.isVisible ?? true,
        ...(socialLinks && socialLinks.length > 0
          ? {
              socialLinks: {
                create: socialLinks,
              },
            }
          : {}),
        ...(contactInfo
          ? {
              contactInfo: {
                create: contactInfo,
              },
            }
          : {}),
      },
      include: {
        socialLinks: true,
        contactInfo: true,
      },
    });

    // Log the creation event
    await prisma.auditLog.create({
      data: {
        action: "CREATE",
        entity: "TeamMember",
        entityId: teamMember.id,
        userId: session.user.id,
        details: `Created team member "${teamMember.name}"`,
      },
    });

    return NextResponse.json(teamMember, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    console.error("Error creating team member:", error);
    return NextResponse.json(
      { error: "Error creating team member" },
      { status: 500 }
    );
  }
}
