export function About() {
  return (
    <section id="nosotros" className="py-20 lg:py-32">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="space-y-6">
            <p className="text-base tracking-widest uppercase text-foreground/70 font-medium">Nuestra Filosofía</p>
            <h3 className="text-4xl md:text-5xl font-normal tracking-tight text-balance leading-tight">
              Cultivamos belleza, entregamos excelencia
            </h3>
            <div className="space-y-4 text-lg text-foreground/75 font-normal leading-relaxed">
              <p>
                En Botanica, creemos que cada planta cuenta una historia. Nuestra misión es conectar a los amantes de la
                naturaleza con especímenes excepcionales que transforman espacios en santuarios de elegancia botánica.
              </p>
              <p>
                Cada planta es cuidadosamente seleccionada por nuestros expertos botánicos, garantizando no solo belleza
                estética, sino también salud vibrante y longevidad.
              </p>
            </div>
          </div>

          <div className="relative aspect-[4/5] lg:aspect-[3/4] overflow-hidden rounded-sm">
            <img src="/elegant-botanical-greenhouse-with-designer-plants.jpg" alt="Nuestro invernadero" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </section>
  )
}
