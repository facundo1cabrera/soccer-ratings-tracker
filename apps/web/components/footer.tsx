export function Footer() {
  return (
    <footer id="contacto" className="py-16 lg:py-20 border-t border-border">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div className="space-y-4">
            <h4 className="text-2xl font-semibold tracking-tight">Botanica</h4>
            <p className="text-sm text-muted-foreground font-normal leading-relaxed">
              Plantas de lujo para espacios extraordinarios en toda Argentina.
            </p>
          </div>

          <div className="space-y-3">
            <h5 className="text-sm tracking-widest uppercase font-medium">Tienda</h5>
            <ul className="space-y-2 text-sm text-muted-foreground font-normal">
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Todas las plantas
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Nuevas llegadas
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Ofertas especiales
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="text-sm tracking-widest uppercase font-medium">Información</h5>
            <ul className="space-y-2 text-sm text-muted-foreground font-normal">
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Guía de cuidados
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Envíos
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Devoluciones
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="text-sm tracking-widest uppercase font-medium">Contacto</h5>
            <ul className="space-y-2 text-sm text-muted-foreground font-normal">
              <li>Buenos Aires, Argentina</li>
              <li>info@botanica.com.ar</li>
              <li>+54 11 1234-5678</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground font-normal">
          <p>© 2026 Botanica. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
