"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/authContext";
import { motion } from "framer-motion";
import Link from "next/link";
import { FaStore } from "react-icons/fa";
import { FiMail, FiLock, FiAlertCircle } from "react-icons/fi";

const VendorLoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await login(email, password, true); // true indicates vendor login
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 py-12 px-4">
      <motion.div
        className="w-full max-w-md bg-white rounded-xl shadow-lg p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
            <FaStore className="w-8 h-8 text-orange-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Vendor Login
          </h1>
          <p className="text-gray-600">Access your restaurant dashboard</p>
        </div>

        {error && (
          <motion.div
            className="flex items-center bg-red-100 text-red-700 p-3 rounded-lg mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <FiAlertCircle className="mr-2" />
            {error}
          </motion.div>
        )}

        <form className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiMail className="text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="restaurant@email.com"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className="text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-700"
              >
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link
                href="/vendor/forgot-password"
                className="font-medium text-orange-600 hover:text-orange-500"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <div>
            <motion.button
              type="button"
              className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-700 transition-colors flex justify-center items-center"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              disabled={isLoading}
              onClick={handleSubmit}
            >
              {isLoading ? (
                <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                "Sign In to Dashboard"
              )}
            </motion.button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have a vendor account?{" "}
            <Link
              href="/vendor/register"
              className="font-medium text-orange-600 hover:text-orange-500"
            >
              Register your restaurant
            </Link>
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Customer login?{" "}
            <Link
              href="/login"
              className="font-medium text-gray-600 hover:text-gray-700"
            >
              Go to customer login
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default VendorLoginPage;
