export function getRatingColor(rating: number): string {
  if (rating >= 9.0) return "bg-purple-500";
  if (rating >= 8.6) return "bg-blue-600";
  if (rating >= 8.1) return "bg-blue-400";
  if (rating >= 7.5) return "bg-green-800";
  if (rating >= 7.1) return "bg-green-500";
  if (rating >= 6.4) return "bg-yellow-500";
  if (rating >= 6.1) return "bg-orange-500";
  return "bg-red-500";
}

export function getRatingTextColor(rating: number): string {
  if (rating >= 9.0) return "text-purple-400";
  if (rating >= 8.6) return "text-blue-400";
  if (rating >= 8.1) return "text-blue-300";
  if (rating >= 7.5) return "text-green-400";
  if (rating >= 7.1) return "text-green-300";
  if (rating >= 6.4) return "text-yellow-400";
  if (rating >= 6.1) return "text-orange-400";
  return "text-red-400";
}

export function getRatingCssColor(rating: number): string {
  if (rating >= 9.0) return "var(--color-purple-500)";
  if (rating >= 8.6) return "var(--color-blue-600)";
  if (rating >= 8.1) return "var(--color-blue-400)";
  if (rating >= 7.6) return "var(--color-green-800)";
  if (rating >= 7.1) return "var(--color-green-500)";
  if (rating >= 6.4) return "var(--color-yellow-500)";
  if (rating >= 6.1) return "var(--color-orange-500)";
  return "var(--color-red-500)";
}

export function getRatingGlow(rating: number): string {
  if (rating >= 9.0) return "shadow-purple-500/40";
  if (rating >= 8.1) return "shadow-blue-500/40";
  if (rating >= 7.1) return "shadow-green-500/40";
  if (rating >= 6.1) return "shadow-yellow-500/40";
  return "shadow-red-500/40";
}

export function getPerformanceLabel(rating: number): string {
  if (rating >= 9.0) return "Épico"
  if (rating >= 8.6) return "Excelente"
  if (rating >= 8.1) return "Muy bueno"
  if (rating >= 7.6) return "Bueno"
  if (rating >= 7.1) return "Aceptable"
  if (rating >= 6.4) return "Regular"
  if (rating >= 5.9) return "Bajo"
  return "Muy malo"
}
