#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const colors = require("colors");

//Parametro que ingresa User para ser examinado
const ruta = process.argv[2];
console.log(ruta.rainbow);

//Comprueba si ruta existe, solo funciona con relativas
const routeExist = (source) => {
  if (fs.existsSync(source) === false) {
    return "Ruta NO existe";
  }
  return "Ruta existe";
};
console.log(routeExist(ruta));

// Transforma a relativa
const getAbsoluteLink = (source) => {
  if (path.isAbsolute(source) === false) {
    return path.resolve(source);
  }
  return source;
};
console.log(getAbsoluteLink(ruta));

// Comprobamos si es archivo
const routeType = (source) => {
  if (source.isFile() === true) {
    return true;
  }
  return false;
};

// Leer archivos de tu ruta principal
const routeFiles = fs.statSync(ruta);
console.log("es archivo? " + routeType(routeFiles));

// Lectura de directorio
const readFolder = (directory) => fs.readdirSync(directory, "utf8");
console.log(readFolder(ruta));

// Filtrar archivos .md por extensión
const fileExtensionMD = (file) => path.extname(file) === ".md";
console.log("hola", fileExtensionMD(ruta));

// Función que lee directorio y retorna los archivos.md
let arrayOfMDFiles = [];
const extractionFilesMD = (directory) => {
  const dataDirectory = readFolder(directory);
  let arrayFiles = dataDirectory.filter((element) => {
    if (fileExtensionMD(element)) {
      arrayOfMDFiles.push(element);
      return element;
    }
  });
  return arrayFiles;
};
console.log(extractionFilesMD(ruta));
console.log("hola guardo array de elementos MD", arrayOfMDFiles);

//Filtro de archivo md
const dir = fs.readdirSync(ruta, { encoding: "utf8", flag: "r" });
let array = [];
function rute(dir) {
  return (array = dir.filter((archivo) => {
    return path.extname(archivo) === ".md";
    //console.log(array);
  }));
}
//Lee y extrae Links, verifica status de estos
const arrayMd = rute(dir);
const Url =
  /(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])/gim;
const exitos = [];
const errores = [];
let validos;
let broken;
function readMDLinks(paths) {
  //console.log("ejecutando path");
  paths.forEach((element) => {
    const data = fs.readFileSync(element, { encoding: "utf8", flag: "r" });
    //console.log("leyendo", data);
    let findLinks = data.match(Url);
    console.log(findLinks);
    const arrfetch = findLinks.map((url) => {
      return fetch(url);
    });
    console.log(arrfetch);
    Promise.allSettled(arrfetch)
      .then((result) => {
        result.forEach((res) => {
          if (res.status === "fulfilled") {
            if (res.value.status === 200) {
              console.log("Exito ", res.value?.status, res.value?.url);
            } else {
              console.log("Error ", res.value?.status, res.value?.url);
            }
            exitos.push({ status: res.value?.status, url: res.value?.url });
          } else {
            console.log("Error", res.reason);
            errores.push({ error: res.reason });
          }
          validos = exitos.filter((url) => url.status === 200);
          //console.log(validos.length);
          broken = exitos.filter((url) => url.status !== 200);
          //console.log(broken);
        });
      })
      .finally(() => {
        console.log("-------------------------------------------");
        console.log(
          "| total exito : ",
          validos.length,
          " | ",
          "total errores: ",
          broken.length,
          " | "
        );
        console.log("-------------------------------------------");
        console.log("|         Detalle Exito                   |");
        console.log("-------------------------------------------");
        exitos.forEach((exito) =>
          console.log(`status : ${exito.status}  url : ${exito.url}`)
        );
      });
  });
}

console.log(readMDLinks(arrayMd));

// ESTA PARTE NO FUNCIONA AYUDA SOLO TOMABA PARAMETRO DADO POR README.MD
/*const fileContents = fs.readFileSync(ruta, "utf8");
const { metadata, content } = parseMD(fileContents);

//se leen los links


console.log(transformed); */
