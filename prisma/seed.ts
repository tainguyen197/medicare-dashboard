import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

  // Create a default user
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash("password123", saltRounds);
  const user = await prisma.user.upsert({
    where: { email: "editor@example.com" },
    update: {},
    create: {
      email: "editor@example.com",
      name: "Default Editor",
      password: passwordHash,
      role: "EDITOR",
    },
  });
  console.log(`Created user with id: ${user.id}`);

  // Create sample categories
  const mentalWellnessCategory = await prisma.category.upsert({
    where: { slug: "mental-wellness" },
    update: {},
    create: {
      name: "Mental Wellness",
      slug: "mental-wellness",
      description:
        "Articles and resources related to mental health and well-being.",
    },
  });
  console.log(`Created category with id: ${mentalWellnessCategory.id}`);

  const physicalRehabCategory = await prisma.category.upsert({
    where: { slug: "physical-rehabilitation" },
    update: {},
    create: {
      name: "Physical Rehabilitation",
      slug: "physical-rehabilitation",
      description: "Information on physical therapy and recovery processes.",
    },
  });
  console.log(`Created category with id: ${physicalRehabCategory.id}`);

  // Create sample blog posts
  const postsData = [
    {
      title: "The Benefits of Cognitive Behavioral Therapy (CBT)",
      slug: "benefits-of-cbt",
      content:
        "Cognitive Behavioral Therapy (CBT) is a type of psychotherapeutic treatment that helps people learn how to identify and change destructive or disturbing thought patterns that have a negative influence on behavior and emotions. CBT focuses on changing the automatic negative thoughts that can contribute to and worsen emotional difficulties, depression, and anxiety. These spontaneous negative thoughts have a detrimental influence on mood. Through CBT, these thoughts are identified, challenged, and replaced with more objective, realistic thoughts.",
      excerpt:
        "Learn about how CBT can help improve mental health by changing negative thought patterns.",
      status: "PUBLISHED",
      authorId: user.id,
      publishedAt: new Date().toISOString(),
      categories: [{ categoryId: mentalWellnessCategory.id }],
    },
    {
      title: "Understanding Art Therapy: Healing Through Creativity",
      slug: "understanding-art-therapy",
      content:
        "Art therapy is an integrative mental health and human services profession that enriches the lives of individuals, families, and communities through active art-making, creative process, applied psychological theory, and human experience within a psychotherapeutic relationship. Art therapy, facilitated by a professional art therapist, effectively supports personal and relational treatment goals as well as community concerns. It is used to improve cognitive and sensorimotor functions, foster self-esteem and self-awareness, cultivate emotional resilience, promote insight, enhance social skills, reduce and resolve conflicts and distress, and advance societal and ecological change.",
      excerpt:
        "Discover how art therapy uses the creative process to promote healing and well-being.",
      status: "PUBLISHED",
      authorId: user.id,
      publishedAt: new Date().toISOString(),
      categories: [{ categoryId: mentalWellnessCategory.id }],
    },
    {
      title: "Physical Therapy: More Than Just Exercise",
      slug: "physical-therapy-more-than-exercise",
      content:
        "Physical therapy (PT) is care that aims to ease pain and help you function, move, and live better. You may need it to: Relieve pain, Improve movement or ability, Prevent or recover from a sports injury, Prevent disability or surgery, Rehab after a stroke, accident, injury, or surgery, Work on balance to prevent a slip or fall, Manage a chronic illness like diabetes, heart disease, or arthritis, Recover after you give birth, Control your bowels or bladder, Adapt to an artificial limb, Learn to use assistive devices like a walker or cane. PTs evaluate your condition and develop a care plan that guides your therapy. They may perform hands-on treatments for your symptoms. They also teach you special exercises to help you move and function better.",
      excerpt:
        "Explore the comprehensive role of physical therapy in recovery, pain management, and improving quality of life.",
      status: "DRAFT",
      authorId: user.id,
      categories: [{ categoryId: physicalRehabCategory.id }],
    },
  ];

  for (const post of postsData) {
    const { categories, ...postData } = post;
    const postPayload: any = { ...postData };
    if (postData.publishedAt === undefined && postData.status === "DRAFT") {
      postPayload.publishedAt = null;
    }

    const createdPost = await prisma.post.upsert({
      where: { slug: post.slug },
      update: postPayload,
      create: {
        ...postPayload,
        categories: categories
          ? {
              create: categories.map((cat) => ({ categoryId: cat.categoryId })),
            }
          : undefined,
      },
    });
    console.log(`Created post with id: ${createdPost.id}`);
  }

  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
