'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Copy, Check, ExternalLink } from 'lucide-react'

interface ShareMatchPageProps {
  params: Promise<{ id: string }>
}

export default function ShareMatchPage({ params }: ShareMatchPageProps) {
  const router = useRouter()
  const [matchId, setMatchId] = useState<string | null>(null)
  const [shareLink, setShareLink] = useState<string>('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function loadParams() {
      const resolvedParams = await params
      setMatchId(resolvedParams.id)
      const link = `${window.location.origin}/match/${resolvedParams.id}/join`
      setShareLink(link)
    }
    loadParams()
  }, [params])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const handleContinue = () => {
    if (matchId) {
      router.push(`/match/${matchId}/join`)
    }
  }

  if (!matchId) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Go Back Button */}
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </Link>

        <div className="max-w-2xl mx-auto">
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Partido creado exitosamente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <p className="text-muted-foreground">
                  Comparte este enlace con los otros jugadores para que puedan calificar el partido:
                </p>
                
                {/* Share Link */}
                <div className="flex items-center gap-2 p-4 bg-muted rounded-lg border border-border">
                  <code className="flex-1 text-sm break-all text-foreground">
                    {shareLink}
                  </code>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleCopy}
                    className="shrink-0"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                
                {copied && (
                  <p className="text-sm text-green-600">¡Enlace copiado!</p>
                )}
              </div>

              {/* Continue Button */}
              <div className="flex justify-end">
                <Button onClick={handleContinue} size="lg">
                  Continuar
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}

