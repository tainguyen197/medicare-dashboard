import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "../../../lib/auth";
import prisma from "../../../lib/prisma";

// GET /api/media - Get all media items
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  // Check if user is authenticated
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);

  // Parse query parameters
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const search = searchParams.get("search");
  const type = searchParams.get("type");

  // Build filter object
  const where: any = {};

  if (search) {
    where.name = { contains: search, mode: "insensitive" };
  }

  if (type) {
    where.type = type;
  }

  try {
    // Get total count for pagination
    const total = await prisma.media.count({ where });

    // Get media items with pagination
    const mediaItems = await prisma.media.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      media: mediaItems,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching media items:", error);
    return NextResponse.json(
      { error: "Error fetching media items" },
      { status: 500 }
    );
  }
}

// Note: For production, you would typically use a third-party service like
// Uploadthing, Cloudinary, or AWS S3 for file uploads.
// This is just a placeholder for the API structure.

// POST /api/media - Upload a new media item
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  // Check if user is authenticated
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // In a real implementation, you would:
    // 1. Process the uploaded file
    // 2. Upload it to storage
    // 3. Get the public URL
    // 4. Save the metadata to the database

    // For this example, we'll assume the request contains media metadata
    const body = await request.json();

    const media = await prisma.media.create({
      data: {
        name: body.name,
        url: body.url, // In reality, this would be the URL returned from your upload service
        type: body.type,
        size: body.size,
        user: {
          connect: { id: session.user.id },
        },
      },
    });

    // Log the creation event
    await prisma.auditLog.create({
      data: {
        action: "CREATE",
        entity: "Media",
        entityId: media.id,
        userId: session.user.id,
        details: `Uploaded media "${media.name}"`,
      },
    });

    return NextResponse.json(media, { status: 201 });
  } catch (error) {
    console.error("Error uploading media:", error);
    return NextResponse.json(
      { error: "Error uploading media" },
      { status: 500 }
    );
  }
}

// DELETE /api/media - Delete multiple media items
export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);

  // Check if user is authenticated
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Invalid request. Please provide an array of media ids." },
        { status: 400 }
      );
    }

    // In a real implementation, you would also delete the files from storage

    // Delete the media items from the database
    const result = await prisma.media.deleteMany({
      where: {
        id: { in: ids },
        userId: session.user.id, // Only allow users to delete their own uploads unless they're an admin
      },
    });

    // Log the deletion event
    await prisma.auditLog.create({
      data: {
        action: "DELETE",
        entity: "Media",
        entityId: ids.join(", "),
        userId: session.user.id,
        details: `Deleted ${result.count} media items`,
      },
    });

    return NextResponse.json({
      message: `${result.count} media items deleted successfully`,
    });
  } catch (error) {
    console.error("Error deleting media:", error);
    return NextResponse.json(
      { error: "Error deleting media" },
      { status: 500 }
    );
  }
}
