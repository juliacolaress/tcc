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