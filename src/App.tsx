import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import logoImg from "@/assets/logo.svg";

const queryClient = new QueryClient();
const splashMessages = [
  "Welcome. Your legal support starts here.",
  "Guidance you can trust, in your language.",
  "Ready to assist with clarity and care.",
];

const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const messageTimer = window.setInterval(() => {
      setMessageIndex((current) => {
        if (current >= splashMessages.length - 1) {
          return current;
        }
        return current + 1;
      });
    }, 1600);

    const splashTimer = window.setTimeout(() => {
      setShowSplash(false);
    }, 5000);

    return () => {
      window.clearInterval(messageTimer);
      window.clearTimeout(splashTimer);
    };
  }, []);

  if (showSplash) {
    return (
      <div className="min-h-screen hero-bg flex items-center justify-center px-4">
        <div className="w-full max-w-xl rounded-3xl bg-card/95 border shadow-card p-8 sm:p-12 text-center animate-float-up">
          <img
            src={logoImg}
            alt="NyayaSakhi AI logo"
            className="mx-auto h-24 sm:h-28 w-auto splash-logo"
          />
          <p
            key={messageIndex}
            className="mt-6 text-sm sm:text-base text-muted-foreground splash-message-fade"
          >
            {splashMessages[messageIndex]}
          </p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
