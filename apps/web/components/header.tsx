"use client"

import { ShoppingBag, Menu, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-2xl lg:text-3xl font-semibold tracking-tight text-foreground">Botanica</h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#tienda" className="text-sm font-normal tracking-wide hover:text-primary transition-colors">
              Tienda
            </a>
            <a href="#colecciones" className="text-sm font-normal tracking-wide hover:text-primary transition-colors">
              Colecciones
            </a>
            <a href="#nosotros" className="text-sm font-normal tracking-wide hover:text-primary transition-colors">
              Nosotros
            </a>
            <a href="#contacto" className="text-sm font-normal tracking-wide hover:text-primary transition-colors">
              Contacto
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3 lg:gap-4">
            <Button variant="ghost" size="icon" className="hidden sm:flex">
              <Search className="h-5 w-5" />
              <span className="sr-only">Buscar</span>
            </Button>
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingBag className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                0
              </span>
              <span className="sr-only">Carrito</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Menú</span>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col gap-4">
              <a href="#tienda" className="text-sm font-normal tracking-wide hover:text-primary transition-colors">
                Tienda
              </a>
              <a href="#colecciones" className="text-sm font-normal tracking-wide hover:text-primary transition-colors">
                Colecciones
              </a>
              <a href="#nosotros" className="text-sm font-normal tracking-wide hover:text-primary transition-colors">
                Nosotros
              </a>
              <a href="#contacto" className="text-sm font-normal tracking-wide hover:text-primary transition-colors">
                Contacto
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
