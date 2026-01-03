"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"

export function Newsletter() {
  const [email, setEmail] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle newsletter signup
    console.log("Newsletter signup:", email)
  }

  return (
    <section className="py-20 lg:py-32 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <h3 className="text-4xl md:text-5xl font-normal tracking-tight text-balance">Únete a nuestra comunidad</h3>
          <p className="text-lg font-normal leading-relaxed opacity-90">
            Recibe inspiración botánica, consejos de cuidado exclusivos y acceso anticipado a nuevas colecciones
            directamente en tu bandeja de entrada.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Tu correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 bg-primary-foreground text-foreground border-0 font-normal"
            />
            <Button type="submit" variant="secondary" className="font-medium tracking-wide">
              Suscribirse
            </Button>
          </form>
        </div>
      </div>
    </section>
  )
}
