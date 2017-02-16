
CREATE DATABASE csv CHARACTER SET utf8 COLLATE utf8_general_ci;

CREATE TABLE file (
    file_name varchar(30) NOT NULL UNIQUE,
    total_numbers_of_rows int(11),
    rows_with_error int(11),
    creation_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP,
    start_date TIMESTAMP,
    PRIMARY KEY (file_name)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8;

CREATE TABLE transaction_description (
    transaction_description int(11) NOT NULL UNIQUE AUTO_INCREMENT,
    description varchar(33) UNIQUE NOT NULL ,
    creation_date TIMESTAMP NOT NULL,
    PRIMARY KEY (transaction_description)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8;

CREATE TABLE transactions (
transaction_id int(11) NOT NULL UNIQUE,
transaction_date DATE NOT NULL,
amount LONG NOT NULL,
creation_date TIMESTAMP NOT NULL,
transaction_description int(11) NOT NULL,
file varchar(30) NOT NULL,
PRIMARY KEY (transaction_id),
FOREIGN KEY (transaction_description)
REFERENCES transaction_description(transaction_description),
FOREIGN KEY (file)
REFERENCES file(file_name)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8;