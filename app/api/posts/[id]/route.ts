import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "../../../../lib/auth";
import prisma from "../../../../lib/prisma";
import { createSlug } from "../../../../lib/utils";

// Schema for post update
const postUpdateSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  content: z.string().min(1, "Content is required").optional(),
  excerpt: z.string().optional(),
  featuredImage: z.string().optional(),
  status: z
    .enum(["DRAFT", "PENDING_REVIEW", "PUBLISHED", "SCHEDULED"])
    .optional(),
  publishedAt: z.string().optional(),
  categories: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  slug: z.string().optional(),
});

// GET /api/posts/[id] - Get a specific post by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        categories: {
          include: {
            category: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json({ error: "Error fetching post" }, { status: 500 });
  }
}

// PUT /api/posts/[id] - Update a specific post
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  // Check if user is authenticated
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = params.id;

  try {
    // Check if post exists and user has permission
    const existingPost = await prisma.post.findUnique({
      where: { id },
      select: { id: true, authorId: true, title: true },
    });

    if (!existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Only allow the author or an admin to update the post
    if (
      existingPost.authorId !== session.user.id &&
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = postUpdateSchema.parse(body);

    // Generate slug if title is updated and slug is not provided
    let slug = validatedData.slug;
    if (validatedData.title && !validatedData.slug) {
      slug = createSlug(validatedData.title);
    }

    // Extract categories and tags
    const { categories, tags, ...postData } = validatedData;

    // Update the post
    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        ...postData,
        ...(slug ? { slug } : {}),
        ...(categories
          ? {
              categories: {
                deleteMany: {},
                create: categories.map((categoryId) => ({
                  category: {
                    connect: { id: categoryId },
                  },
                })),
              },
            }
          : {}),
        ...(tags
          ? {
              tags: {
                deleteMany: {},
                create: tags.map((tagId) => ({
                  tag: {
                    connect: { id: tagId },
                  },
                })),
              },
            }
          : {}),
      },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    // Log the update event
    await prisma.auditLog.create({
      data: {
        action: "UPDATE",
        entity: "Post",
        entityId: id,
        userId: session.user.id,
        details: `Updated post "${existingPost.title}"`,
      },
    });

    return NextResponse.json(updatedPost);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    console.error("Error updating post:", error);
    return NextResponse.json({ error: "Error updating post" }, { status: 500 });
  }
}

// DELETE /api/posts/[id] - Delete a specific post
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  // Check if user is authenticated
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = params.id;

  try {
    // Check if post exists and user has permission
    const existingPost = await prisma.post.findUnique({
      where: { id },
      select: { id: true, authorId: true, title: true },
    });

    if (!existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Only allow the author or an admin to delete the post
    if (
      existingPost.authorId !== session.user.id &&
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete the post
    await prisma.post.delete({
      where: { id },
    });

    // Log the deletion event
    await prisma.auditLog.create({
      data: {
        action: "DELETE",
        entity: "Post",
        entityId: id,
        userId: session.user.id,
        details: `Deleted post "${existingPost.title}"`,
      },
    });

    return NextResponse.json(
      { message: "Post deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json({ error: "Error deleting post" }, { status: 500 });
  }
}
