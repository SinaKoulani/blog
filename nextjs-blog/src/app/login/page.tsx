"use client"

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/shadcn/login-form";

import { safeCall } from "@/api/err/safe-call";
import { getAuth } from "@/api/generated/auth/auth";
import { loginSchema } from "@/lib/validations/auth-test";

const { authControllerLogin } = getAuth();

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);



  /**
   * validates the form with zod, then logs in through the generated Orval client.
   * errors are handled by safeCall, so there is no try/catch in this page.
  */
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const result = loginSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    if (!result.success) {
      setError(result.error.issues[0].message);
      setIsSubmitting(false);
      return;
    }


    /**edited by me
     * safe call never throws : it returns { isOK, data } or { isOK: false, error }.
     * we pass a function (not its result) so safeCall can run it inside its try/catch.
     */
    const response = await safeCall(() => authControllerLogin(result.data));
    
    // no `finally` here anymore, so release the button right after the call.
    setIsSubmitting(false);

    if (!response.isOK) {
      /**
       * on the login page 401 means wrong email or password,  
       * so we override the generic message from appHttpErr.
       * we show the error inside the form (no redirect()) so the user can retry.
       */
      setError(
        response.error.statusCode === 401
          ? "Invalid email or password."
          : response.error.displayMessage,
      );
      return;
    }

    router.push("/profile");
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <LoginForm onSubmit={handleSubmit} isSubmitting={isSubmitting} error={error} />
      </div>
    </div>
  );
}