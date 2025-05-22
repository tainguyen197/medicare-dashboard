import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { createSlug } from "@/lib/utils";

// Schema for post creation/update
const postSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().optional(),
  featuredImage: z.string().optional(),
  status: z.enum(["DRAFT", "PENDING_REVIEW", "PUBLISHED", "SCHEDULED"]),
  publishedAt: z.string().optional(),
  categories: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  slug: z.string().optional(),
});

// GET /api/posts - Get all posts with pagination, filtering, etc.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  // Parse query parameters
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const status = searchParams.get("status");
  const categoryId = searchParams.get("categoryId");
  const tagId = searchParams.get("tagId");
  const search = searchParams.get("search");
  
  // Build filter object
  const where: any = {};
  
  if (status) {
    where.status = status;
  }
  
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { content: { contains: search, mode: "insensitive" } },
    ];
  }
  
  if (categoryId) {
    where.categories = {
      some: {
        categoryId,
      },
    };
  }
  
  if (tagId) {
    where.tags = {
      some: {
        tagId,
      },
    };
  }
  
  try {
    // Get total count for pagination
    const total = await prisma.post.count({ where });
    
    // Get posts with pagination
    const posts = await prisma.post.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
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
    
    return NextResponse.json({
      posts,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Error fetching posts" },
      { status: 500 }
    );
  }
}

// POST /api/posts - Create a new post
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  // Check if user is authenticated
  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
  
  try {
    const body = await request.json();
    const validatedData = postSchema.parse(body);
    
    // Generate slug if not provided
    const slug = validatedData.slug || createSlug(validatedData.title);
    
    // Extract categories and tags
    const { categories, tags, ...postData } = validatedData;
    
    // Create the post
    const post = await prisma.post.create({
      data: {
        ...postData,
        slug,
        author: {
          connect: { id: session.user.id },
        },
        ...(categories && categories.length > 0
          ? {
              categories: {
                create: categories.map((categoryId) => ({
                  category: {
                    connect: { id: categoryId },
                  },
                })),
              },
            }
          : {}),
        ...(tags && tags.length > 0
          ? {
              tags: {
                create: tags.map((tagId) => ({
                  tag: {
                    connect: { id: tagId },
                  },
                })),
              },
            }
          : {}),
      },
    });
    
    // Log the creation event
    await prisma.auditLog.create({
      data: {
        action: "CREATE",
        entity: "Post",
        entityId: post.id,
        userId: session.user.id,
        details: `Created post "${post.title}"`,
      },
    });
    
    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors },
        { status: 400 }
      );
    }
    
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "Error creating post" },
      { status: 500 }
    );
  }
} 