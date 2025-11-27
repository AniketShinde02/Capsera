"use client";

import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  MessageSquare,
  Sparkles,
  User,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type FormStatus = "idle" | "success" | "error";

type FormData = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

type FormErrors = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

const initialFormData: FormData = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

const initialErrors: FormErrors = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [formStatus, setFormStatus] = useState<FormStatus>("idle");
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>(initialErrors);

  const validateForm = () => {
    let isValid = true;
    const newErrors: FormErrors = { ...initialErrors };

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
      isValid = false;
    } else if (formData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    if (!formData.subject) {
      newErrors.subject = "Please select a subject";
      isValid = false;
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
      isValid = false;
    } else if (formData.message.length < 10) {
      newErrors.message = "Message must be at least 10 characters";
      isValid = false;
    }

    setErrors(newErrors);

    if (!isValid) {
      // Auto-clear errors after a few seconds
      setTimeout(() => {
        setErrors(initialErrors);
      }, 5000);
    }

    return isValid;
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));

    if (errors[id as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [id]: "" }));
    }
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, subject: value }));
    if (errors.subject) {
      setErrors((prev) => ({ ...prev, subject: "" }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          category: formData.subject,
          message: formData.message,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      setFormStatus("success");
      setFormData(initialFormData);
      setErrors(initialErrors);
    } catch (error) {
      console.error(error);
      setFormStatus("error");
      setTimeout(() => setFormStatus("idle"), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden flex items-start md:items-center justify-center py-8 sm:py-12 px-3 sm:px-6 font-sans">
      {/* Ambient Background Glows */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] md:w-[800px] h-[600px] md:h-[800px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[600px] md:w-[800px] h-[600px] md:h-[800px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-5xl bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative z-10"
      >
        {/* Left Panel */}
        <div className="w-full md:w-[40%] bg-gradient-to-b from-white/5 to-transparent p-6 sm:p-8 md:p-10 flex flex-col justify-between gap-8 border-b md:border-b-0 md:border-r border-white/5">
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-medium text-white/80 mb-4 sm:mb-6 backdrop-blur-md">
              <Sparkles className="w-3 h-3 text-blue-400" />
              <span>We're here to help</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white leading-tight">
              Let's start a{" "}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                conversation.
              </span>
            </h1>

            <p className="text-white/50 leading-relaxed text-xs sm:text-sm">
              Have feedback, questions, or an idea? Drop it here. We actually
              read this stuff.
            </p>
          </div>

          <div className="space-y-4 sm:space-y-6 relative z-10">
            <div className="group flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all duration-300">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs font-medium text-white/40 uppercase tracking-wider">
                  Email us
                </p>
                <p className="text-xs sm:text-sm font-medium text-white truncate">
                  ai.captioncraft@outlook.com
                </p>
              </div>
            </div>

            <div className="group flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all duration-300">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs font-medium text-white/40 uppercase tracking-wider">
                  Support
                </p>
                <p className="text-xs sm:text-sm font-medium text-white">
                  24/7 Online Support
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-full md:w-[60%] p-6 sm:p-8 md:p-10 bg-white/[0.02]">
          <AnimatePresence mode="wait">
            {formStatus === "idle" && (
              <motion.form
                key="form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleSubmit}
                className="flex flex-col gap-5 sm:gap-6"
                aria-busy={loading}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label
                      htmlFor="name"
                      className="text-[11px] sm:text-xs font-medium text-white/60 ml-1"
                    >
                      Full Name
                    </Label>
                    <div className="relative group">
                      <Input
                        id="name"
                        placeholder="Lovely Lalit"
                        value={formData.name}
                        onChange={handleInputChange}
                        autoComplete="name"
                        className={`bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-blue-500/50 focus:bg-white/10 transition-all pl-9 sm:pl-10 h-10 sm:h-11 text-sm ${
                          errors.name ? "border-red-500/50" : ""
                        }`}
                      />
                      <User className="absolute left-3 top-2.5 sm:top-3 w-4 h-4 text-white/30 group-focus-within:text-blue-400 transition-colors" />
                    </div>
                    {errors.name && (
                      <p className="text-[10px] text-red-400 pl-1">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-[11px] sm:text-xs font-medium text-white/60 ml-1"
                    >
                      Email Address
                    </Label>
                    <div className="relative group">
                      <Input
                        id="email"
                        type="email"
                        placeholder="lovely@example.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        autoComplete="email"
                        inputMode="email"
                        className={`bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-blue-500/50 focus:bg-white/10 transition-all pl-9 sm:pl-10 h-10 sm:h-11 text-sm ${
                          errors.email ? "border-red-500/50" : ""
                        }`}
                      />
                      <Mail className="absolute left-3 top-2.5 sm:top-3 w-4 h-4 text-white/30 group-focus-within:text-blue-400 transition-colors" />
                    </div>
                    {errors.email && (
                      <p className="text-[10px] text-red-400 pl-1">
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <Label
                    htmlFor="subject"
                    className="text-[11px] sm:text-xs font-medium text-white/60 ml-1"
                  >
                    Subject
                  </Label>
                  <Select
                    onValueChange={handleSelectChange}
                    value={formData.subject}
                  >
                    <SelectTrigger
                      className={`bg-white/5 border-white/10 text-white focus:border-blue-500/50 focus:bg-white/10 h-10 sm:h-11 text-sm ${
                        errors.subject ? "border-red-500/50" : ""
                      }`}
                    >
                      <SelectValue placeholder="Select a topic" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a1a] border-white/10 text-white text-sm">
                      <SelectItem value="General Inquiry">
                        General Inquiry
                      </SelectItem>
                      <SelectItem value="Technical Support">
                        Technical Support
                      </SelectItem>
                      <SelectItem value="Feedback & Suggestions">
                        Feedback & Suggestions
                      </SelectItem>
                      <SelectItem value="Partnership & Business">
                        Partnership & Business
                      </SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.subject && (
                    <p className="text-[10px] text-red-400 pl-1">
                      {errors.subject}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <Label
                    htmlFor="message"
                    className="text-[11px] sm:text-xs font-medium text-white/60 ml-1"
                  >
                    Message
                  </Label>
                  <Textarea
                    id="message"
                    placeholder="Tell us how we can help..."
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={4}
                    className={`bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-blue-500/50 focus:bg-white/10 min-h-[110px] sm:min-h-[130px] resize-none text-sm ${
                      errors.message ? "border-red-500/50" : ""
                    }`}
                  />
                  {errors.message && (
                    <p className="text-[10px] text-red-400 pl-1">
                      {errors.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 sm:h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium rounded-xl shadow-lg shadow-blue-900/20 transition-all duration-200 hover:scale-[1.01] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <span className="flex items-center justify-center gap-1.5 sm:gap-2">
                      Send Message <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </motion.form>
            )}

            {formStatus === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, type: "spring" }}
                className="flex flex-col items-center justify-center text-center p-6 sm:p-8 gap-3 sm:gap-4"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-2 sm:mb-4">
                  <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-green-400" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white">
                  Message Sent!
                </h3>
                <p className="text-white/50 text-sm max-w-xs mb-2 sm:mb-4">
                  Thanks for reaching out. We&apos;ve received your message and
                  will get back to you shortly.
                </p>
                <Button
                  onClick={() => setFormStatus("idle")}
                  variant="outline"
                  className="border-white/10 text-white hover:bg-white/5 hover:text-white text-sm"
                >
                  Send another message
                </Button>
              </motion.div>
            )}

            {formStatus === "error" && (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, type: "spring" }}
                className="flex flex-col items-center justify-center text-center p-6 sm:p-8 gap-3 sm:gap-4"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-500/20 flex items-center justify-center mb-2 sm:mb-4">
                  <XCircle className="w-8 h-8 sm:w-10 sm:h-10 text-red-400" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white">
                  Something went wrong
                </h3>
                <p className="text-white/50 text-sm max-w-xs mb-2 sm:mb-4">
                  We couldn&apos;t send your message. Please try again.
                </p>
                <Button
                  onClick={() => setFormStatus("idle")}
                  variant="outline"
                  className="border-white/10 text-white hover:bg-white/5 hover:text-white text-sm"
                >
                  Try Again
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
