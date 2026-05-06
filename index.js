"use strict";

const lienzo = document.getElementById("tetris");
const ctx = lienzo.getContext("2d");
ctx.scale(20, 20);

const colores = [
    null,
    "#ff0d72",
    "#0dc2ff",
    "#0dff72",
    "#ff8e0d",
    "#f538ff",
    "#ff3138",
    "#3877ff",
];

function crearMatriz(ancho, alto) {
    const matriz = [];
    while (alto--) matriz.push(new Array(ancho).fill(0));
    return matriz;
}

function crearPieza(tipo) {
    if (tipo === "I") return [[0,1,0,0],[0,1,0,0],[0,1,0,0],[0,1,0,0]];
    if (tipo === "L") return [[0,2,0],[0,2,0],[0,2,2]];
    if (tipo === "J") return [[0,3,0],[0,3,0],[3,3,0]];
    if (tipo === "O") return [[4,4],[4,4]];
    if (tipo === "Z") return [[0,5,5],[5,5,0],[0,0,0]];
    if (tipo === "S") return [[0,6,6],[6,6,0],[0,0,0]];
    if (tipo === "T") return [[0,7,0],[7,7,7],[0,0,0]];
}

function colisionar(tablero, jugador) {
    const m = jugador.matriz;
    const o = jugador.pos;
    for (let y = 0; y < m.length; ++y)
        for (let x = 0; x < m[y].length; ++x)
            if (m[y][x] !== 0 && (tablero[y + o.y] && tablero[y + o.y][x + o.x]) !== 0)
                return true;
    return false;
}

function fusionar(tablero, jugador) {
    jugador.matriz.forEach((fila, y) => {
        fila.forEach((valor, x) => {
            if (valor !== 0)
                tablero[y + jugador.pos.y][x + jugador.pos.x] = valor;
        });
    });
}

function girar(matriz, dir) {
    for (let y = 0; y < matriz.length; ++y)
        for (let x = 0; x < y; ++x)
            [matriz[x][y], matriz[y][x]] = [matriz[y][x], matriz[x][y]];
    if (dir > 0) matriz.forEach(f => f.reverse());
    else matriz.reverse();
}

function limpiarFilas() {
    let multiplicador = 1;
    outer: for (let y = tablero.length - 1; y > 0; --y) {
        for (let x = 0; x < tablero[y].length; ++x)
            if (tablero[y][x] === 0) continue outer;
        const fila = tablero.splice(y, 1)[0].fill(0);
        tablero.unshift(fila);
        ++y;
        jugador.puntuacion += multiplicador * 10;
        multiplicador *= 2;
    }
}

function dibujarMatriz(matriz, desp) {
    matriz.forEach((fila, y) => {
        fila.forEach((valor, x) => {
            if (valor !== 0) {
                ctx.fillStyle = colores[valor];
                ctx.fillRect(x + desp.x, y + desp.y, 1, 1);
            }
        });
    });
}

function dibujar() {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, lienzo.width, lienzo.height);
    dibujarMatriz(tablero, { x: 0, y: 0 });
    dibujarMatriz(jugador.matriz, jugador.pos);
}

function reiniciarJugador() {
    const piezas = "TJLOSZI";
    jugador.matriz = crearPieza(piezas[(piezas.length * Math.random()) | 0]);
    jugador.pos.y = 0;
    jugador.pos.x = ((tablero[0].length / 2) | 0) - ((jugador.matriz[0].length / 2) | 0);
    if (colisionar(tablero, jugador)) {
        tablero.forEach(fila => fila.fill(0));
        jugador.puntuacion = 0;
        actualizarPuntuacion();
    }
}

function bajarPieza() {
    jugador.pos.y++;
    if (colisionar(tablero, jugador)) {
        jugador.pos.y--;
        fusionar(tablero, jugador);
        reiniciarJugador();
        limpiarFilas();
        actualizarPuntuacion();
    }
    contadorCaida = 0;
}

function moverJugador(desplazamiento) {
    jugador.pos.x += desplazamiento;
    if (colisionar(tablero, jugador)) jugador.pos.x -= desplazamiento;
}

function girarJugador(dir) {
    const pos = jugador.pos.x;
    let desp = 1;
    girar(jugador.matriz, dir);
    while (colisionar(tablero, jugador)) {
        jugador.pos.x += desp;
        desp = -(desp + (desp > 0 ? 1 : -1));
        if (desp > jugador.matriz[0].length) {
            girar(jugador.matriz, -dir);
            jugador.pos.x = pos;
            return;
        }
    }
}

function actualizarPuntuacion() {
    document.getElementById("puntuacion").innerText = "Puntuación: " + jugador.puntuacion;
}

let contadorCaida = 0;
const intervaloCaida = 1000;
let ultimoTiempo = 0;

function actualizar(tiempo = 0) {
    const deltaTiempo = tiempo - ultimoTiempo;
    contadorCaida += deltaTiempo;
    if (contadorCaida > intervaloCaida) bajarPieza();
    ultimoTiempo = tiempo;
    dibujar();
    requestAnimationFrame(actualizar);
}

document.addEventListener("keydown", (evento) => {
    if (evento.keyCode === 37)      moverJugador(-1);
    else if (evento.keyCode === 39) moverJugador(1);
    else if (evento.keyCode === 40) bajarPieza();
    else if (evento.keyCode === 81) girarJugador(-1);
    else if (evento.keyCode === 87) girarJugador(1);
});

const tablero = crearMatriz(12, 20);
const jugador = {
    pos: { x: 0, y: 0 },
    matriz: null,
    puntuacion: 0,
};

reiniciarJugador();
actualizarPuntuacion();
actualizar();