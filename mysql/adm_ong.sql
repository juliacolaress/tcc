CREATE TABLE adm_ong (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100),
    email VARCHAR(100),
    telefone VARCHAR(20),
    senha VARCHAR(255),
    responsavel VARCHAR(50),
    cnpj CHAR(18),
    obs VARCHAR(50),
    pix VARCHAR(100),
    endereco_id INT,
    conta_id INT,
    FOREIGN KEY (endereco_id) REFERENCES endereco(id),
    FOREIGN KEY (conta_id) REFERENCES conta(id)
);