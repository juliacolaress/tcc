import { normalizeFotos, resolverUrl } from './fotos';

describe('normalizeFotos', () => {
  it('retorna até três URLs únicas a partir do novo campo fotos e do campo legado fotoUrl', () => {
    const animal = {
      fotos: ['https://a.com/1', 'https://b.com/2', 'https://a.com/1', 'https://c.com/3'],
      fotoUrl: 'https://d.com/4'
    };

    expect(normalizeFotos(animal)).toEqual([
      'https://a.com/1',
      'https://b.com/2',
      'https://c.com/3'
    ]);
  });

  it('retorna um array vazio quando não há fotos cadastradas', () => {
    expect(normalizeFotos({})).toEqual([]);
    expect(normalizeFotos({ fotos: [] })).toEqual([]);
  });

  it('resolve caminhos relativos de fotos para a URL base da API', () => {
    const animal = {
      fotos: ['/uploads/a.jpg'],
      fotoUrl: 'uploads/b.jpg'
    };

    expect(normalizeFotos(animal)).toEqual([
      'http://localhost:5050/uploads/a.jpg',
      'http://localhost:5050/uploads/b.jpg'
    ]);
  });

  it('mantém o caminho da imagem fictícia padrão sem apontar para a API', () => {
    expect(normalizeFotos({ fotoUrl: '/placeholder-padrao.svg' })).toEqual([
      '/placeholder-padrao.svg'
    ]);
  });
});

describe('resolverUrl', () => {
  it('mantém URLs absolutas', () => {
    expect(resolverUrl('https://cdn.com/foto.jpg')).toBe('https://cdn.com/foto.jpg');
    expect(resolverUrl('http://cdn.com/foto.jpg')).toBe('http://cdn.com/foto.jpg');
    expect(resolverUrl('//cdn.com/foto.jpg')).toBe('//cdn.com/foto.jpg');
  });

  it('concatena a URL base da API apenas em caminhos de uploads', () => {
    expect(resolverUrl('/uploads/foto.jpg')).toBe('http://localhost:5050/uploads/foto.jpg');
    expect(resolverUrl('uploads/foto.jpg')).toBe('http://localhost:5050/uploads/foto.jpg');
  });

  it('mantém assets estáticos do frontend (placeholder) como estão', () => {
    expect(resolverUrl('/placeholder-padrao.svg')).toBe('/placeholder-padrao.svg');
    expect(resolverUrl('/images/placeholder-pet.png')).toBe('/images/placeholder-pet.png');
  });

  it('retorna string vazia para valores inválidos', () => {
    expect(resolverUrl('')).toBe('');
    expect(resolverUrl('   ')).toBe('');
    expect(resolverUrl(null)).toBe('');
    expect(resolverUrl(undefined)).toBe('');
    expect(resolverUrl(123)).toBe('');
  });
});
