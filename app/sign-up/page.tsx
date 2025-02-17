// src/app/sign-up/page.tsx
import AuthForm from "@/components/auth";

export default function SignUpPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <AuthForm mode="sign-up" />
    </div>
  );
}
