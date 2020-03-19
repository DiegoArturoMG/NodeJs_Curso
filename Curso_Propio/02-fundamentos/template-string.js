let nombre = 'Arturo';
let real = 'Diego Morales';

/*console.log(nombre + ' ' + real);
console.log(`${ nombre } ${ real }`);*/

function getNombre() {
    return `${ nombre } ${ real }`;
}

console.log(`El nombre de: ${getNombre()}`);