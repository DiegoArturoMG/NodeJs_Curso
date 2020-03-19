let usuario = {
    nombre: 'Arturo',
    apellido: 'Morales',
    edad: 23,
    getDatos: function() {
        return `${ this.nombre } ${ this.apellido } - edad: ${ this.edad }`
    }
};

let { nombre: primerNombre, apellido, edad } = usuario;

console.log(primerNombre, apellido, edad);