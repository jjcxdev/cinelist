# CineList

Welcome to **CineList**, a simple movie and series tracking application built with **Next.js** and **Supabase**. This app allows users to manage their movie and series lists, providing a seamless experience for tracking what to watch next.

## Features

- **User Authentication**: Secure sign-in and sign-up functionality using Supabase Auth.
- **Movie and Series Tracking**: Users can add, view, and manage their movie and series lists.
- **Admin Role Management**: Admin users can manage user roles and permissions.
- **Responsive Design**: Built with Tailwind CSS for a modern and responsive UI.
- **Dark Mode Support**: Toggle between light and dark themes for a personalized experience.

## Demo

You can view a live demo of the application at [CineList Demo](https://watch.jjcx.dev).

## Getting Started

To get started with CineList, follow these steps:

### Prerequisites

- Node.js (version 14 or later)
- A Supabase account

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/jjcxdev/cinelist.git
   cd cinelist
   ```

2. Install the dependencies using `pnpm`:

   ```bash
   pnpm install
   ```

3. Create a Supabase project and set up your database.

4. Rename `.env.example` to `.env.local` and update the following environment variables:

   ```
   NEXT_PUBLIC_SUPABASE_URL=[YOUR_SUPABASE_PROJECT_URL]
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR_SUPABASE_ANON_KEY]
   TMDB_ACCESS_TOKEN=[YOUR_TMDB_ACCESS_TOKEN]  # Optional for movie data
   ```

5. Run the development server:

   ```bash
   pnpm run dev
   ```

6. Open your browser and navigate to [http://localhost:3000](http://localhost:3000).

### Local Development

For local development, you can run the following command to start the Next.js development server:

```bash
pnpm run dev
```

### Deployment

To deploy your application, you can use Vercel or any other hosting service. Follow the instructions on the respective platform to set up your project.

## Feedback and Issues

If you encounter any issues or have suggestions for improvements, please open an issue on the [GitHub repository](https://github.com/jjcxdev/cinelist/issues).

## More Examples

Explore more examples and resources related to Supabase and Next.js:

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)

---

Thank you for checking out CineList! Happy tracking!
