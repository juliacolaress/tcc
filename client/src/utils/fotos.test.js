import { normalizeFotos } from './fotos';

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
});
