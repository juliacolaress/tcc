CREATE TABLE evento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(60),
    descricoes VARCHAR(150),
    data DATE,
    hora TIME,
    tipo VARCHAR(100),
    obs VARCHAR(100),
    status VARCHAR(30),
    recursos_materiais VARCHAR(100),
    responsavel VARCHAR(50),
    fotos BLOB,
    inscricao VARCHAR(100),
    endereco_id INT,
    FOREIGN KEY (endereco_id) REFERENCES endereco(id)
);