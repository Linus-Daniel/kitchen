"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function VendorRegisterRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login/vendor");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">
          Redirecting to vendor login
        </p>
      </div>
    </div>
  );
}
