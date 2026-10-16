import API_BASE_URL from "../api/config";

export const PLACEHOLDER_IMAGEM = "/placeholder-padrao.svg";

export function resolverUrl(valor) {
  if (typeof valor !== "string") return "";
  const texto = valor.trim();
  if (!texto) return "";
  if (/^(https?:)\/\//i.test(texto)) return texto;
  if (/^\/\//.test(texto)) return texto;
  // Caminho relativo ao servidor da API (uploads é o único diretório estático do backend)
  if (texto.startsWith("/uploads/")) return `${API_BASE_URL}${texto}`;
  if (texto.startsWith("uploads/")) return `${API_BASE_URL}/${texto}`;
  // Demais caminhos iniciados com "/" são assets estáticos do frontend (ex: placeholder)
  return texto;
}

export function aoErrarImagem(e) {
  e.currentTarget.onerror = null;
  e.currentTarget.src = PLACEHOLDER_IMAGEM;
}

export function normalizeFotos(animal = {}) {
  const fotos = [];
  const seen = new Set();

  const adicionar = (valor) => {
    const texto = resolverUrl(valor);
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