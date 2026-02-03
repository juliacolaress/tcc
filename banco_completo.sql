CREATE database projeto_TCC;
use projeto_TCC;

CREATE TABLE endereco (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rua VARCHAR(50),
    numero INT,
    bairro VARCHAR(50),
    cidade VARCHAR(50),
    estado CHAR(2),
    cep CHAR(9),
    obs VARCHAR(60),
    adm_ong_id INT
);
    
    CREATE TABLE conta (
    id INT AUTO_INCREMENT PRIMARY KEY,
    banco VARCHAR(50),
    numero_agencia VARCHAR(10),
    numero_conta VARCHAR(20),
    adm_ong_id INT
);
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
CREATE TABLE animal (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100),
    porte VARCHAR(30),
    especie VARCHAR(50),
    raca VARCHAR(50),
    data_nasc DATE,
    caracteristicas VARCHAR(100),
    data_resgate DATE,
    obs VARCHAR(50),
    status VARCHAR(20),
    genero CHAR(1),
    fotos BLOB,
    castracao BOOLEAN,
    estado_saude VARCHAR(50),
    doencas_pre_ex VARCHAR(50),
    pelo VARCHAR(20),
    amputacao BOOLEAN,
    cor VARCHAR(50),
    adm_ong_id INT,
    FOREIGN KEY (adm_ong_id) REFERENCES adm_ong(id)
);
CREATE TABLE vacina (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100),
    marca VARCHAR(50),
    data_aplicacao DATE,
    indicacao VARCHAR(100),
    calendario VARCHAR(50),
    animal_id INT,
    FOREIGN KEY (animal_id) REFERENCES animal(id)
);
