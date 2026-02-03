create table endereco (
id INT AUTO_INCREMENT PRIMARY KEY,
    rua VARCHAR(50),
    numero INT,
    bairro VARCHAR(50),
    cidade VARCHAR(50),
    estado CHAR(2),
    cep CHAR(9),
    obs VARCHAR(60),
    adm_ong int );
    
  