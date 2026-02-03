CREATE TABLE formularios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100),
    nome VARCHAR(100),
    data_nasc DATE,
    telefone CHAR(15),
    cpf CHAR(14),
    endereco_id INT,
    motivacao VARCHAR(60),
    FOREIGN KEY (endereco_id) REFERENCES endereco(id)
);