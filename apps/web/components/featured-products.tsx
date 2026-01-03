import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShoppingBag } from "lucide-react"

const products = [
  {
    id: 1,
    name: "Monstera Deliciosa",
    category: "Plantas Tropicales",
    price: 45000,
    image: "/elegant-monstera-deliciosa-in-minimal-ceramic-pot.jpg",
  },
  {
    id: 2,
    name: "Ficus Lyrata",
    category: "Plantas de Interior",
    price: 52000,
    image: "/luxury-fiddle-leaf-fig-in-designer-pot.jpg",
  },
  {
    id: 3,
    name: "Orquídea Phalaenopsis",
    category: "Orquídeas Premium",
    price: 38000,
    image: "/white-orchid-in-elegant-minimal-pot.jpg",
  },
  {
    id: 4,
    name: "Strelitzia Nicolai",
    category: "Plantas Exóticas",
    price: 68000,
    image: "/bird-of-paradise-plant-in-luxury-interior.jpg",
  },
]

export function FeaturedProducts() {
  return (
    <section id="tienda" className="py-20 lg:py-32">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-16 space-y-4">
          <p className="text-base tracking-widest uppercase text-foreground/70 font-medium">Colección Destacada</p>
          <h3 className="text-4xl md:text-5xl lg:text-6xl font-normal tracking-tight text-balance">
            Nuestras piezas más exquisitas
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {products.map((product) => (
            <Card
              key={product.id}
              className="group overflow-hidden border-border hover:shadow-lg transition-all duration-300"
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-secondary/20">
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <Button
                  size="icon"
                  className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span className="sr-only">Agregar al carrito</span>
                </Button>
              </div>
              <CardContent className="p-6 space-y-2">
                <p className="text-sm tracking-widest uppercase text-foreground/65 font-medium">{product.category}</p>
                <h4 className="text-xl font-medium tracking-tight">{product.name}</h4>
                <p className="text-lg text-foreground font-normal">${product.price.toLocaleString("es-AR")} ARS</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button variant="outline" size="lg" className="text-base font-medium tracking-wide px-8 bg-transparent">
            Ver toda la colección
          </Button>
        </div>
      </div>
    </section>
  )
}
