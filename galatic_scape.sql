-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 20-05-2025 a las 04:34:44
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `galatic_scape`
--

-- --------------------------------------------------------
CREATE TABLE `jugadores` (
  `idJugadores` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `puntaje` int(11) NOT NULL,
  `vidas` int(11) NOT NULL,
  `nivel` int(11) NOT NULL,
  `modo` varchar(20) NOT NULL,
  `monedas` int(11) NOT NULL
)
CREATE TABLE `resultados` (
  `idResultados` int(11) NOT NULL,
  `idJugadores` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `puntaje` int(11) NOT NULL,
  `vidas` int(3) NOT NULL,
  `nivel` int(11) NOT NULL,
  `modo` varchar(20) NOT NULL,
  `monedas` int(11) NOT NULL
)
ALTER TABLE `jugadores`
  ADD PRIMARY KEY (`idJugadores`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `resultados`
--
ALTER TABLE `resultados`
  ADD PRIMARY KEY (`idResultados`),
  ADD KEY `idJugadores` (`idJugadores`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `jugadores`
--
ALTER TABLE `jugadores`
  MODIFY `idJugadores` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

--
-- AUTO_INCREMENT de la tabla `resultados`
--
ALTER TABLE `resultados`
  MODIFY `idResultados` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `resultados`
--
ALTER TABLE `resultados`
  ADD CONSTRAINT `resultados_ibfk_1` FOREIGN KEY (`idJugadores`) REFERENCES `jugadores` (`idJugadores`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
