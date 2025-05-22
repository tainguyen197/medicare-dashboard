import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seeding...');

  // Create admin user
  const adminPassword = await hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@medicare.com' },
    update: {},
    create: {
      email: 'admin@medicare.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
    },
  });
  console.log('Created admin user:', admin.email);

  // Create editor user
  const editorPassword = await hash('editor123', 10);
  const editor = await prisma.user.upsert({
    where: { email: 'editor@medicare.com' },
    update: {},
    create: {
      email: 'editor@medicare.com',
      name: 'Editor User',
      password: editorPassword,
      role: 'EDITOR',
    },
  });
  console.log('Created editor user:', editor.email);

  // Create blog categories
  const healthTipsCategory = await prisma.category.upsert({
    where: { slug: 'health-tips' },
    update: {},
    create: {
      name: 'Health Tips',
      slug: 'health-tips',
      description: 'Advice and tips for maintaining good health',
    },
  });

  const clinicNewsCategory = await prisma.category.upsert({
    where: { slug: 'clinic-news' },
    update: {},
    create: {
      name: 'Clinic News',
      slug: 'clinic-news',
      description: 'Latest updates and news from our clinic',
    },
  });
  console.log('Created blog categories');

  // Create blog tags
  const tags = await Promise.all([
    prisma.tag.upsert({
      where: { slug: 'wellness' },
      update: {},
      create: {
        name: 'Wellness',
        slug: 'wellness',
      },
    }),
    prisma.tag.upsert({
      where: { slug: 'exercise' },
      update: {},
      create: {
        name: 'Exercise',
        slug: 'exercise',
      },
    }),
    prisma.tag.upsert({
      where: { slug: 'nutrition' },
      update: {},
      create: {
        name: 'Nutrition',
        slug: 'nutrition',
      },
    }),
    prisma.tag.upsert({
      where: { slug: 'medicare' },
      update: {},
      create: {
        name: 'Medicare',
        slug: 'medicare',
      },
    }),
  ]);
  console.log('Created blog tags');

  // Create sample blog post
  const post = await prisma.post.upsert({
    where: { slug: 'tips-for-healthy-aging' },
    update: {},
    create: {
      title: 'Tips for Healthy Aging',
      slug: 'tips-for-healthy-aging',
      content: `
# Tips for Healthy Aging

Aging is a natural process that everyone goes through. However, there are ways to maintain your health and quality of life as you age. Here are some tips:

## Stay Physically Active

Regular exercise can help prevent or delay many diseases and disabilities. Aim for:

- 150 minutes of moderate aerobic activity weekly
- Muscle-strengthening activities twice a week
- Balance exercises to prevent falls

## Maintain a Healthy Diet

- Eat plenty of fruits, vegetables, and whole grains
- Choose low-fat protein sources
- Limit processed foods and sodium
- Stay hydrated by drinking plenty of water

## Keep Your Mind Active

Mental exercise is just as important as physical exercise:

- Read books, newspapers, or magazines
- Do puzzles or play games
- Take courses at local community centers
- Learn new skills or hobbies

## Stay Connected

Social connections are vital for mental and emotional health:

- Spend time with friends and family
- Join clubs or groups with similar interests
- Volunteer in your community
- Consider pet ownership for companionship

Remember, it's never too late to adopt healthy habits that can improve your quality of life!
      `,
      excerpt: 'Discover practical advice for maintaining health and vitality as you age.',
      status: 'PUBLISHED',
      publishedAt: new Date().toISOString(),
      authorId: admin.id,
      metaTitle: 'Healthy Aging Tips for Seniors | Medicare Health',
      metaDescription: 'Learn practical tips for healthy aging, including exercise, nutrition, and mental wellness strategies for seniors.',
    },
  });

  // Connect post to category and tags
  await prisma.postCategory.create({
    data: {
      postId: post.id,
      categoryId: healthTipsCategory.id,
    },
  });

  await prisma.postTag.create({
    data: {
      postId: post.id,
      tagId: tags[0].id, // Wellness tag
    },
  });

  await prisma.postTag.create({
    data: {
      postId: post.id,
      tagId: tags[1].id, // Exercise tag
    },
  });

  console.log('Created sample blog post');

  // Create service categories
  const rehabCategory = await prisma.serviceCategory.upsert({
    where: { slug: 'rehabilitation' },
    update: {},
    create: {
      name: 'Rehabilitation',
      slug: 'rehabilitation',
      description: 'Services focused on helping patients recover from injuries or surgeries',
    },
  });

  const preventiveCategory = await prisma.serviceCategory.upsert({
    where: { slug: 'preventive-care' },
    update: {},
    create: {
      name: 'Preventive Care',
      slug: 'preventive-care',
      description: 'Services focused on preventing health issues before they occur',
    },
  });
  console.log('Created service categories');

  // Create services
  const physicalTherapy = await prisma.service.upsert({
    where: { slug: 'physical-therapy' },
    update: {},
    create: {
      name: 'Physical Therapy',
      slug: 'physical-therapy',
      description: `
Our physical therapy services are designed to help patients recover from injuries, surgeries, or chronic conditions. Our team of experienced therapists works closely with each patient to develop personalized treatment plans that address their specific needs and goals.

We use a combination of hands-on techniques, therapeutic exercises, and state-of-the-art equipment to help our patients regain mobility, reduce pain, and improve their overall quality of life.
      `,
      isVisible: true,
      displayOrder: 1,
      categoryId: rehabCategory.id,
      image: '/images/services/physical-therapy.jpg',
    },
  });

  // Create sub-services
  await prisma.subService.create({
    data: {
      title: 'Joint Rehabilitation',
      description: 'Specialized therapy focusing on restoring function to damaged or injured joints, including knees, hips, shoulders, and ankles.',
      displayOrder: 1,
      serviceId: physicalTherapy.id,
    },
  });

  await prisma.subService.create({
    data: {
      title: 'Sports Injury Recovery',
      description: 'Tailored rehabilitation programs for athletes recovering from sports-related injuries, designed to safely return them to their sport.',
      displayOrder: 2,
      serviceId: physicalTherapy.id,
    },
  });

  console.log('Created sample service with sub-services');

  // Create team members
  const drSmith = await prisma.teamMember.create({
    data: {
      name: 'Dr. Sarah Smith',
      title: 'Medical Director',
      bio: `
Dr. Sarah Smith has over 20 years of experience in geriatric medicine and primary care. She received her medical degree from Harvard Medical School and completed her residency at Massachusetts General Hospital.

Dr. Smith is board-certified in Internal Medicine with a specialization in Geriatrics. She has dedicated her career to improving healthcare outcomes for older adults and ensuring they receive compassionate, comprehensive care.

As our Medical Director, Dr. Smith oversees all clinical operations and ensures that our patients receive the highest quality care possible.
      `,
      photo: '/images/team/dr-smith.jpg',
      displayOrder: 1,
      isVisible: true,
      specializations: 'Geriatric Medicine, Primary Care, Preventive Medicine',
      socialLinks: {
        create: [
          {
            platform: 'LinkedIn',
            url: 'https://www.linkedin.com/in/drsarahsmith',
          },
        ],
      },
      contactInfo: {
        create: {
          email: 'dr.smith@medicare.com',
        },
      },
    },
  });

  console.log('Created sample team member');

  // Create site settings
  await prisma.siteSetting.upsert({
    where: { key: 'site_name' },
    update: {},
    create: {
      key: 'site_name',
      value: 'Medicare Health Clinic',
    },
  });

  await prisma.siteSetting.upsert({
    where: { key: 'contact_email' },
    update: {},
    create: {
      key: 'contact_email',
      value: 'contact@medicare.com',
    },
  });

  await prisma.siteSetting.upsert({
    where: { key: 'contact_phone' },
    update: {},
    create: {
      key: 'contact_phone',
      value: '(555) 123-4567',
    },
  });

  await prisma.siteSetting.upsert({
    where: { key: 'address' },
    update: {},
    create: {
      key: 'address',
      value: JSON.stringify({
        street: '123 Health Avenue',
        city: 'Wellness City',
        state: 'WC',
        zipCode: '12345',
      }),
    },
  });

  await prisma.siteSetting.upsert({
    where: { key: 'social_media' },
    update: {},
    create: {
      key: 'social_media',
      value: JSON.stringify({
        facebook: 'https://facebook.com/medicareclinic',
        twitter: 'https://twitter.com/medicareclinic',
        instagram: 'https://instagram.com/medicareclinic',
      }),
    },
  });

  console.log('Created site settings');

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 