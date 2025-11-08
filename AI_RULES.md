# AI Development Rules

This document outlines the technical stack and development guidelines for this project to ensure consistency and maintainability.

## Tech Stack

The application is built with the following technologies:

-   **Framework**: React with Vite as the build tool.
-   **Language**: TypeScript for type safety.
-   **Styling**: Tailwind CSS for all styling purposes.
-   **UI Components**: A combination of shadcn/ui, Radix UI, and custom components.
-   **Routing**: React Router (`react-router-dom`) for all client-side navigation.
-   **Data Fetching & State**: TanStack Query for server state management and React Hooks (`useState`) for local component state.
-   **Forms**: React Hook Form with Zod for schema validation.
-   **Backend & Database**: Supabase for database, authentication, and serverless functions.
-   **Icons**: Lucide React for all icons.

## Library Usage Rules

-   **UI Components**: Always prioritize using components from the `shadcn/ui` library (`@/components/ui/*`). If a suitable component doesn't exist, create a new reusable component in the `src/components` directory.
-   **Styling**: All styling must be done using Tailwind CSS utility classes. Use the `cn` utility from `@/lib/utils.ts` to merge classes conditionally. Avoid writing custom CSS files.
-   **Routing**: Use `react-router-dom` for routing. All routes are defined in `src/App.tsx`. Use the `<Link>` component for internal navigation and `useNavigate` for programmatic navigation.
-   **State Management**: Use TanStack Query for managing server state (fetching, caching, etc.). For simple, local component state, use React's `useState` hook.
-   **Forms**: All forms must be built using `react-hook-form` and validated with `zod`.
-   **Icons**: Use icons exclusively from the `lucide-react` library.
-   **Notifications**: Use `sonner` or the custom `useToast` hook for user feedback and notifications.
-   **Backend**: All backend interactions, including database queries and function calls, must go through the Supabase client defined in `@/integrations/supabase/client.ts`.
-   **File Structure**:
    -   Pages: `src/pages`
    -   Reusable Components: `src/components`
    -   Custom Hooks: `src/hooks`
    -   Utility Functions: `src/lib`