-- MySQL Script generated by MySQL Workbench
-- 05/09/17 00:13:53
-- Model: New Model    Version: 1.0
-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL,ALLOW_INVALID_DATES';

-- -----------------------------------------------------
-- Schema matcha
-- -----------------------------------------------------
DROP SCHEMA IF EXISTS `matcha` ;

-- -----------------------------------------------------
-- Schema matcha
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `matcha` DEFAULT CHARACTER SET utf8 ;
USE `matcha` ;

-- -----------------------------------------------------
-- Table `matcha`.`t_user`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `matcha`.`t_user` ;

CREATE TABLE IF NOT EXISTS `matcha`.`t_user` (
  `usr_id` INT NOT NULL AUTO_INCREMENT,
  `usr_email` VARCHAR(255) NULL,
  `usr_password` VARCHAR(255) NULL,
  `usr_token` VARCHAR(255) NULL,
  PRIMARY KEY (`usr_id`),
  UNIQUE INDEX `usr_token_UNIQUE` (`usr_token` ASC),
  UNIQUE INDEX `usr_email_UNIQUE` (`usr_email` ASC))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `matcha`.`t_tag`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `matcha`.`t_tag` ;

CREATE TABLE IF NOT EXISTS `matcha`.`t_tag` (
  `tag_id` INT NOT NULL AUTO_INCREMENT,
  `tag_content` VARCHAR(45) NULL,
  PRIMARY KEY (`tag_id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `matcha`.`t_user_has_t_tag`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `matcha`.`t_user_has_t_tag` ;

CREATE TABLE IF NOT EXISTS `matcha`.`t_user_has_t_tag` (
  `usr_id` INT NOT NULL,
  `tag_id` INT NOT NULL,
  PRIMARY KEY (`usr_id`, `tag_id`),
  INDEX `fk_t_user_has_t_tag_t_tag1_idx` (`tag_id` ASC),
  INDEX `fk_t_user_has_t_tag_t_user_idx` (`usr_id` ASC),
  CONSTRAINT `fk_t_user_has_t_tag_t_user`
    FOREIGN KEY (`usr_id`)
    REFERENCES `matcha`.`t_user` (`usr_id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_t_user_has_t_tag_t_tag1`
    FOREIGN KEY (`tag_id`)
    REFERENCES `matcha`.`t_tag` (`tag_id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `matcha`.`t_user_profile`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `matcha`.`t_user_profile` ;

CREATE TABLE IF NOT EXISTS `matcha`.`t_user_profile` (
  `usr_id` INT NOT NULL,
  `firstname` VARCHAR(255) NULL,
  `lastname` VARCHAR(255) NULL,
  `sex` ENUM('man', 'woman') NULL,
  `orientation` ENUM('man', 'woman', 'bi') NULL,
  `birthday` DATE NULL,
  `images` LONGTEXT NULL,
  `profileImage` TEXT NULL,
  `bio` TEXT NULL,
  `geoTimestamp` DATETIME NULL,
  `geoLatitude` DOUBLE NULL,
  `geoLongitude` DOUBLE NULL,
  `popularity` INT NULL DEFAULT 0,
  `last_connection` DATETIME NULL,
  PRIMARY KEY (`usr_id`),
  INDEX `fk_t_user_meta_t_user1_idx` (`usr_id` ASC),
  UNIQUE INDEX `usr_id_UNIQUE` (`usr_id` ASC, `firstname` ASC),
  UNIQUE INDEX `meta_name_UNIQUE` (`firstname` ASC, `usr_id` ASC),
  CONSTRAINT `fk_t_user_meta_t_user1`
    FOREIGN KEY (`usr_id`)
    REFERENCES `matcha`.`t_user` (`usr_id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `matcha`.`t_notification`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `matcha`.`t_notification` ;

CREATE TABLE IF NOT EXISTS `matcha`.`t_notification` (
  `notif_id` INT NOT NULL AUTO_INCREMENT,
  `usr_id_emitter` INT NOT NULL,
  `usr_id_target` INT NOT NULL,
  `notif_type` ENUM('PROFILE_VIEW', 'MESSAGE', 'FRIEND_REQUEST', 'FRIEND_ACCEPT', 'FRIEND_REMOVE', 'FRIEND_IGNORE') NOT NULL,
  `notif_time` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  `notif_status` TINYINT NULL,
  INDEX `fk_t_notification_t_user1_idx` (`usr_id_emitter` ASC),
  INDEX `fk_t_notification_t_user2_idx` (`usr_id_target` ASC),
  PRIMARY KEY (`notif_id`),
  CONSTRAINT `fk_t_notification_t_user1`
    FOREIGN KEY (`usr_id_emitter`)
    REFERENCES `matcha`.`t_user` (`usr_id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_t_notification_t_user2`
    FOREIGN KEY (`usr_id_target`)
    REFERENCES `matcha`.`t_user` (`usr_id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `matcha`.`t_friend`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `matcha`.`t_friend` ;

CREATE TABLE IF NOT EXISTS `matcha`.`t_friend` (
  `usr_id_1` INT NOT NULL,
  `usr_id_2` INT NOT NULL,
  `usr_id_action` INT NOT NULL,
  `status` TINYINT NULL,
  INDEX `fk_t_friend_t_user1_idx` (`usr_id_1` ASC),
  INDEX `fk_t_friend_t_user2_idx` (`usr_id_2` ASC),
  INDEX `fk_t_friend_t_user3_idx` (`usr_id_action` ASC),
  PRIMARY KEY (`usr_id_1`, `usr_id_2`),
  CONSTRAINT `fk_t_friend_t_user1`
    FOREIGN KEY (`usr_id_1`)
    REFERENCES `matcha`.`t_user` (`usr_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_t_friend_t_user2`
    FOREIGN KEY (`usr_id_2`)
    REFERENCES `matcha`.`t_user` (`usr_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_t_friend_t_user3`
    FOREIGN KEY (`usr_id_action`)
    REFERENCES `matcha`.`t_user` (`usr_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `matcha`.`t_message`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `matcha`.`t_message` ;

CREATE TABLE IF NOT EXISTS `matcha`.`t_message` (
  `msg_id` INT NOT NULL AUTO_INCREMENT,
  `usr_id_emit` INT NOT NULL,
  `usr_id_target` INT NOT NULL,
  `msg_message` TEXT NULL,
  `msg_status` TINYINT NULL,
  `msg_date` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `fk_t_message_t_user1_idx` (`usr_id_emit` ASC),
  INDEX `fk_t_message_t_user2_idx` (`usr_id_target` ASC),
  PRIMARY KEY (`msg_id`),
  CONSTRAINT `fk_t_message_t_user1`
    FOREIGN KEY (`usr_id_emit`)
    REFERENCES `matcha`.`t_user` (`usr_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_t_message_t_user2`
    FOREIGN KEY (`usr_id_target`)
    REFERENCES `matcha`.`t_user` (`usr_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `matcha`.`t_report`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `matcha`.`t_report` ;

CREATE TABLE IF NOT EXISTS `matcha`.`t_report` (
  `usr_id_emitter` INT NOT NULL,
  `usr_id_target` INT NOT NULL,
  INDEX `fk_t_report_t_user1_idx` (`usr_id_emitter` ASC),
  INDEX `fk_t_report_t_user2_idx` (`usr_id_target` ASC),
  CONSTRAINT `fk_t_report_t_user1`
    FOREIGN KEY (`usr_id_emitter`)
    REFERENCES `matcha`.`t_user` (`usr_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_t_report_t_user2`
    FOREIGN KEY (`usr_id_target`)
    REFERENCES `matcha`.`t_user` (`usr_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

USE `matcha` ;

-- -----------------------------------------------------
-- function MatchScore
-- -----------------------------------------------------

USE `matcha`;
DROP function IF EXISTS `matcha`.`MatchScore`;

DELIMITER $$
USE `matcha`$$
CREATE FUNCTION MatchScore(distance double, commonTags int, ageDif INT) RETURNS INT
BEGIN
	DECLARE score INT;
    SET score = 100;
    
    SET ageDif = IF (ageDif < 0, ageDif * -1, ageDif);
    
    SET score = score - ROUND(distance / 50) - ageDif + commonTags;

    RETURN score;
END$$

DELIMITER ;

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
