const categories = [
  {
    name: "Plantas de Interior",
    description: "Elegancia para cada rincón",
    image: "/luxury-indoor-plants-in-modern-interior.jpg",
  },
  {
    name: "Orquídeas Premium",
    description: "Belleza refinada y atemporal",
    image: "/premium-orchids-collection-in-elegant-setting.jpg",
  },
  {
    name: "Plantas Exóticas",
    description: "Rareza y distinción",
    image: "/exotic-tropical-plants-in-luxury-greenhouse.jpg",
  },
]

export function Categories() {
  return (
    <section id="colecciones" className="py-20 lg:py-32 bg-secondary/20">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-16 space-y-4">
          <p className="text-base tracking-widest uppercase text-foreground/70 font-medium">Explora</p>
          <h3 className="text-4xl md:text-5xl lg:text-6xl font-normal tracking-tight text-balance">
            Nuestras colecciones
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {categories.map((category, index) => (
            <div key={index} className="group relative overflow-hidden rounded-sm cursor-pointer">
              <div className="aspect-[4/5] relative overflow-hidden">
                <img
                  src={category.image || "/placeholder.svg"}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-8 text-background">
                <h4 className="text-2xl md:text-3xl font-normal mb-2 text-balance">{category.name}</h4>
                <p className="text-sm font-normal tracking-wide opacity-90">{category.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
