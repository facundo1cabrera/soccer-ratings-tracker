import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function Hero() {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-secondary/30">
      <div className="absolute inset-0">
        <img
          src="/luxury-botanical-greenhouse-with-elegant-plants.jpg"
          alt="Botanical elegance"
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 to-background/80" />
      </div>

      <div className="container relative z-10 mx-auto px-4 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-normal tracking-tight text-balance leading-[1.1]">
            Naturaleza exquisita para espacios extraordinarios
          </h2>
          <p className="text-xl md:text-2xl lg:text-3xl text-foreground/90 max-w-2xl mx-auto font-semibold leading-relaxed">
            Descubre nuestra colección curada de plantas de lujo, seleccionadas para transformar tu hogar en un oasis de
            elegancia botánica
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button size="lg" className="group text-base font-medium tracking-wide px-8">
              Explorar Colección
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button size="lg" variant="outline" className="text-base font-medium tracking-wide px-8 bg-transparent">
              Agendar Consulta
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
