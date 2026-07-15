export function normalizeFotos(animal = {}) {
  const fotos = [];
  const seen = new Set();

  const adicionar = (valor) => {
    if (typeof valor !== 'string') return;
    const texto = valor.trim();
    if (!texto || seen.has(texto)) return;
    seen.add(texto);
    fotos.push(texto);
  };

  if (Array.isArray(animal.fotos)) {
    animal.fotos.forEach(adicionar);
  }

  adicionar(animal.fotoUrl);

  return fotos.slice(0, 3);
}
