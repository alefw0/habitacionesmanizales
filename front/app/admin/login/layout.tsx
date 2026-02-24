// Force dynamic rendering for the login page to avoid Turbopack 404 bug
export const dynamic = "force-dynamic";

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
