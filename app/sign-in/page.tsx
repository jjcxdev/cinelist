// src/app/sign-in/page.tsx
import AuthForm from "@/components/auth"; //Path may be different based on where you store AuthForm

export default function SignInPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <AuthForm mode="sign-in" />
    </div>
  );
}
