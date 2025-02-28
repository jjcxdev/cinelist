// src/app/sign-up/page.tsx
import AuthForm from "@/components/auth";

export default function SignUpPage() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center px-8">
      <AuthForm mode="sign-up" />
    </div>
  );
}
