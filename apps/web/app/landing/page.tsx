import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SignedIn, SignedOut } from "@clerk/nextjs";

const steps = [
  {
    number: "01",
    title: "Creá el partido",
    description:
      "Ingresá el nombre del partido, los goles de cada equipo y sumá a los jugadores que participaron.",
  },
  {
    number: "02",
    title: "Compartí el link",
    description:
      "Al crear el partido obtenés un link único. Mandáselo a tus compañeros por WhatsApp, Instagram o como quieras.",
  },
  {
    number: "03",
    title: "Todos califican",
    description:
      "Cada jugador entra al link, se identifica y puntúa al resto del equipo del 0 al 10. No hace falta tener cuenta.",
  },
  {
    number: "04",
    title: "Mirá los resultados",
    description:
      "Una vez que todos calificaron, se muestran los promedios por jugador con colores según el puntaje obtenido.",
  },
];

const features = [
  {
    icon: "⚽",
    title: "Sin complicaciones",
    description:
      "Crear un partido lleva menos de un minuto. Solo necesitás el nombre y los jugadores.",
  },
  {
    icon: "🔗",
    title: "Link compartible",
    description:
      "Un link único por partido. Tus compañeros acceden sin registrarse ni descargar nada.",
  },
  {
    icon: "🎯",
    title: "Calificaciones anónimas",
    description:
      "Los jugadores califican sin presión. Los resultados se muestran como promedios grupales.",
  },
  {
    icon: "📊",
    title: "Historial de partidos",
    description:
      "Llevá el registro de todos tus partidos y seguí tu evolución partido a partido.",
  },
  {
    icon: "🏆",
    title: "Colores por rendimiento",
    description:
      "Los puntajes se muestran con colores: morado para lo más alto, rojo para lo más bajo.",
  },
  {
    icon: "📱",
    title: "Optimizado para el celular",
    description:
      "Diseñado para usarse desde el teléfono, justo después del partido.",
  },
];

const ratingColors: { label: string; color: string; range: string }[] = [
  { label: "9.0+", color: "bg-purple-500", range: "Excepcional" },
  { label: "8.6–9.0", color: "bg-blue-600", range: "Muy bueno" },
  { label: "8.1–8.6", color: "bg-blue-400", range: "Bueno" },
  { label: "7.6–8.1", color: "bg-green-600", range: "Correcto" },
  { label: "7.1–7.6", color: "bg-green-400", range: "Regular" },
  { label: "6.6–7.1", color: "bg-yellow-500", range: "Flojo" },
  { label: "6.1–6.6", color: "bg-orange-500", range: "Mal partido" },
  { label: "< 6.1", color: "bg-red-500", range: "Para olvidar" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <header className="border-b border-border sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <span className="text-xl font-bold tracking-tight">
            ⚽ Ratings FC
          </span>
          <nav className="flex items-center gap-3">
            <SignedOut>
              <Link href="/sign-in">
                <Button variant="ghost" size="sm">
                  Iniciar sesión
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button size="sm">Registrarse</Button>
              </Link>
            </SignedOut>
            <SignedIn>
              <Link href="/">
                <Button size="sm">Ir al panel</Button>
              </Link>
            </SignedIn>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-20 sm:py-32 text-center">
        <div className="inline-flex items-center gap-2 text-sm text-muted-foreground border border-border rounded-full px-4 py-1.5 mb-6">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Para tu equipo de fútbol amateur
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
          Calificá a tus compañeros
          <br />
          <span className="text-muted-foreground">después de cada partido</span>
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          Creá el partido, compartí un link con el equipo y que cada uno puntúe
          al resto. Sin apps, sin registro obligatorio. Listo en minutos.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <SignedOut>
            <Link href="/sign-up">
              <Button size="lg" className="w-full sm:w-auto px-8">
                Empezar gratis
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto px-8"
              >
                Ya tengo cuenta
              </Button>
            </Link>
          </SignedOut>
          <SignedIn>
            <Link href="/match/create">
              <Button size="lg" className="w-full sm:w-auto px-8">
                Crear partido
              </Button>
            </Link>
            <Link href="/">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto px-8"
              >
                Ver mis partidos
              </Button>
            </Link>
          </SignedIn>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-muted/30 border-y border-border py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              ¿Cómo funciona?
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Cuatro pasos simples para tener las calificaciones del equipo en
              minutos.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step) => (
              <Card
                key={step.number}
                className="border-border bg-background/60"
              >
                <CardContent className="pt-6">
                  <div className="text-4xl font-black text-muted-foreground/30 mb-3">
                    {step.number}
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Todo lo que necesitás
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Pensado para equipos de fútbol amateur que quieren llevar el
            registro de sus partidos sin complicaciones.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Card key={feature.title} className="border-border">
              <CardContent className="pt-6">
                <div className="text-3xl mb-3">{feature.icon}</div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Rating scale */}
      <section className="bg-muted/30 border-y border-border py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Escala de calificaciones
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Cada puntaje tiene un color. De un vistazo sabés cómo le fue a
              cada jugador en el partido.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
            {ratingColors.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 rounded-lg border border-border bg-background/60 px-4 py-3"
              >
                <span
                  className={`${item.color} text-white text-xs font-bold px-2 py-1 rounded min-w-[52px] text-center`}
                >
                  {item.label}
                </span>
                <span className="text-sm text-muted-foreground">
                  {item.range}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-24 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
          ¿Jugaste hoy? Creá el partido ahora.
        </h2>
        <p className="text-muted-foreground text-lg mb-10 max-w-lg mx-auto">
          Registrate gratis y empezá a llevar el historial de tu equipo. Tus
          compañeros no necesitan cuenta para calificar.
        </p>
        <SignedOut>
          <Link href="/sign-up">
            <Button size="lg" className="px-10">
              Crear mi cuenta gratis
            </Button>
          </Link>
        </SignedOut>
        <SignedIn>
          <Link href="/match/create">
            <Button size="lg" className="px-10">
              Crear un partido
            </Button>
          </Link>
        </SignedIn>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <span>⚽ Ratings FC — Fútbol amateur, calificaciones reales.</span>
          <div className="flex gap-4">
            <Link
              href="/sign-in"
              className="hover:text-foreground transition-colors"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/sign-up"
              className="hover:text-foreground transition-colors"
            >
              Registrarse
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
