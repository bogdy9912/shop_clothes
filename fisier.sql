

CREATE TYPE categ_properties AS ENUM( 'zgarie-nori', 'hotel', 'familial', 'lux', 'bloc','casa');
CREATE TYPE tipuri_produse AS ENUM('birou', 'rezidential', 'mixt');


CREATE TABLE IF NOT EXISTS products2 (
   id serial PRIMARY KEY,
   nume VARCHAR(50) UNIQUE NOT NULL,
   descriere TEXT,
   pret NUMERIC(8,2) NOT NULL,
   garantie INT NOT NULL CHECK (garantie>0),
   tip_produs tipuri_produse DEFAULT 'birou',
   etaj INT NOT NULL CHECK (etaj>=0),
   categorie categ_properties DEFAULT 'bloc',
   auxiliare VARCHAR [], --pot sa nu fie specificare deci nu punem NOT NULL
   rent BOOLEAN NOT NULL DEFAULT FALSE,
   imagine VARCHAR(300),
   data_adaugare TIMESTAMP DEFAULT current_timestamp
);

INSERT into products2 (nume,descriere,pret, garantie, etaj, categorie, tip_produs, auxiliare, rent, imagine) VALUES
('Giant', 'Cea mai inalta cladire din Bucuresti', 1000 , 20, 100, 'zgarie-nori', 'mixt', '{"incalzire centralizata","panouri solare","exterior sticla"}', True, 'giant.jpg'),

('Family One', 'Casa perfecta pentru a intemeia o familie', 60 , 10, 1, 'familial', 'rezidential', '{"incalzire in pardoseala","panouri solare","gradina","mobilat"}', False, 'family_one.jpg'),

('Dorobanti Simple', 'Cladire de birouri clasa A, cu design industrial', 200, 10, 15, 'bloc', 'birou', '{"incalzire centralizata","exterior sticla"}', True,'dorobanti_simple.jpg'),

('Ferdinand Simple', 'Complex mixt de spatii comerciale, rezidentiale si birouri', 800 , 12, 13, 'bloc', 'mixt', '{"panouri solare","exterior sticla"}', True,'ferdinand_simple.jpg'),

('Casa', 'Casa simpla executata la comanda pe teritoriul clientului', 20 , 2, 5, 'familial', 'rezidential', '{"incalzire prin pardoseala","garaj"}', False,'casa.jpg'),

('Nimic', 'Nimic', 10 , 1, 1, 'hotel', 'rezidential', '{}', False, 'nimic.jpg'),

('Hotel Simple', 'Primul Simple Hotel de vanzare', 160 , 13, 12, 'hotel', 'rezidential', '{"incalzire centralizata"}', False, 'hotel_simple.jpg'),

('Conac', 'Resedinta unui arhitect austriac din 1943', 200 , 14, 100, 'lux', 'rezidential', '{"mobilat","candelabru"}', False, 'conac.jpg'),

('Vila', 'O casa mai mare cu etaj', 80 , 4, 1, 'casa', 'rezidential', '{"garaj","mobilat"}', False, 'vila.jpg');