/*
DROP USER IF EXISTS 'poppit'@'localhost';
DROP USER IF EXISTS 'poppit'@'%';

DROP DATABASE IF EXISTS poppit;
CREATE DATABASE poppit;

CREATE USER 'poppit'@'localhost' IDENTIFIED WITH mysql_native_password BY 'poppit';
GRANT ALL PRIVILEGES ON poppit.* TO 'poppit'@'localhost';
GRANT ALL PRIVILEGES ON _skeema_tmp.* TO 'poppit'@'localhost';

CREATE USER 'poppit'@'%' IDENTIFIED WITH mysql_native_password BY 'poppit';
GRANT ALL PRIVILEGES ON poppit.* TO 'poppit'@'%';

FLUSH PRIVILEGES;
*/