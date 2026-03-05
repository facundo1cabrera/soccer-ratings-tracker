"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Copy, Check, ArrowRight, Home } from "lucide-react";

interface ShareMatchPageProps {
  params: Promise<{ id: string }>;
}

export default function ShareMatchPage({ params }: ShareMatchPageProps) {
  const router = useRouter();
  const [matchId, setMatchId] = useState<string | null>(null);
  const [shareLink, setShareLink] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadParams() {
      const resolvedParams = await params;
      setMatchId(resolvedParams.id);
      const link = `${window.location.origin}/match/${resolvedParams.id}/join`;
      setShareLink(link);
    }
    loadParams();
  }, [params]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* silent */
    }
  };

  const handleContinue = () => {
    if (matchId) router.push(`/match/${matchId}/join`);
  };

  if (!matchId) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Success icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/25 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            ¡Partido creado!
          </h1>
          <p className="text-muted-foreground text-sm">
            Comparte el enlace con los jugadores para que califiquen el partido
          </p>
        </div>

        {/* Share Link Card */}
        <div className="bg-card border border-border rounded-xl p-5 mb-6 space-y-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Enlace de calificación
          </p>
          <div className="flex items-center gap-3 p-3 bg-muted/50 border border-border rounded-lg">
            <p className="flex-1 text-xs text-muted-foreground break-all font-mono leading-relaxed">
              {shareLink}
            </p>
          </div>
          <Button
            type="button"
            onClick={handleCopy}
            className={`w-full font-semibold transition-all duration-200 ${
              copied
                ? "bg-green-500/15 border-green-500/30 text-green-400 border"
                : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
            }`}
            size="lg"
          >
            {copied ? (
              <>
                <Check className="mr-2 h-4 w-4" /> ¡Copiado!
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" /> Copiar enlace
              </>
            )}
          </Button>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-3">
          <Button
            onClick={handleContinue}
            size="lg"
            variant="outline"
            className="w-full font-medium"
          >
            Ir a calificar
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Link href="/" className="w-full">
            <Button
              variant="ghost"
              size="lg"
              className="w-full text-muted-foreground"
            >
              <Home className="mr-2 h-4 w-4" />
              Volver al inicio
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
