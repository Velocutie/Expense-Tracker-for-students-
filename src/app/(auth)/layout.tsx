export const metadata = {
  title: "ExpenseWise — Sign In",
  description: "Sign in to manage your finances",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full bg-gray-50 dark:bg-gray-950">
      {children}
    </div>
  );
}
