# Medicare Dashboard

Content management dashboard for Medicare services, designed to serve as the single source of truth for the Medicare website.

## Features

### Blog Post Management

- Create, edit, and delete blog posts
- Manage categories and tags
- SEO optimization for blog posts
- Post scheduling and status control

### Service Management

- Create, edit, and delete services
- Organize services into categories
- Manage sub-services/components
- Control service visibility and display order

### Team Member Management

- Create, edit, and delete team member profiles
- Manage specializations and contact information
- Control team member visibility and display order

### General Features

- User authentication and role-based authorization
- Media library for centralized image management
- Audit trails for content changes
- Global site settings management

## Tech Stack

- **Framework**: Next.js with TypeScript
- **Database**: Neon (Serverless PostgreSQL)
- **ORM**: Prisma
- **Authentication**: NextAuth.js
- **UI**: Tailwind CSS + Shadcn UI

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Git

### Installation Steps

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/medicare-dashboard.git
   cd medicare-dashboard
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:

   - Create a `.env` file in the root of the project
   - Add the following variables:

   ```
   DATABASE_URL="postgresql://username:password@neon-db-url:5432/database"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key"
   ```

4. Initialize Prisma and generate the client:

   ```bash
   npx prisma generate
   ```

5. Apply database migrations:

   ```bash
   npx prisma migrate dev --name init
   ```

6. Start the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser to access the dashboard.

## Project Structure

```
medicare-dashboard/
├── app/                 # App Router components and pages
│   ├── api/             # API routes
│   ├── admin/           # Dashboard pages
│   └── auth/            # Authentication pages
├── components/          # Reusable UI components
│   ├── admin/           # Admin dashboard components
│   ├── ui/              # UI library components
│   └── forms/           # Form components
├── lib/                 # Utility functions and shared logic
│   ├── prisma.ts        # Prisma client instance
│   └── auth.ts          # Authentication utilities
├── prisma/              # Prisma schema and migrations
│   └── schema.prisma    # Database schema
└── public/              # Static assets
```

## API Routes

The dashboard exposes the following API routes:

- **Authentication**

  - `POST /api/auth/...` - NextAuth.js authentication routes

- **Blog Posts**

  - `GET /api/posts` - List all posts
  - `POST /api/posts` - Create a new post
  - `GET /api/posts/:id` - Get a specific post
  - `PUT /api/posts/:id` - Update a post
  - `DELETE /api/posts/:id` - Delete a post

- **Categories**

  - `GET /api/categories` - List all categories
  - `POST /api/categories` - Create a new category
  - `GET /api/categories/:id` - Get a specific category
  - `PUT /api/categories/:id` - Update a category
  - `DELETE /api/categories/:id` - Delete a category

- **Services**

  - `GET /api/services` - List all services
  - `POST /api/services` - Create a new service
  - `GET /api/services/:id` - Get a specific service
  - `PUT /api/services/:id` - Update a service
  - `DELETE /api/services/:id` - Delete a service

- **Team Members**

  - `GET /api/team` - List all team members
  - `POST /api/team` - Create a new team member
  - `GET /api/team/:id` - Get a specific team member
  - `PUT /api/team/:id` - Update a team member
  - `DELETE /api/team/:id` - Delete a team member

- **Media**
  - `GET /api/media` - List all media items
  - `POST /api/media` - Upload a new media item
  - `DELETE /api/media/:id` - Delete a media item

## License

This project is licensed under the MIT License.
