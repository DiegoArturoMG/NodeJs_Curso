'use strict'

var validator = require('validator');
var fs = require('fs');
var path = require('path');
var Article = require('../models/article');

var controller = {
    datosCurso: (req, res) => {
        return res.status(200).send({
            curso: 'Master en Frameworks JS',
            autor: 'Arturo',
            url: 'Arturo.com'
        });
    },
    test: (req, res) => {
        console.log(req.body);
        return res.status(200).send({
            message: 'Soy la fuincion test de mi controlador de articulos'
        })
    },
    save: (req, res) => {
        // Recoger los parametros por post
        var params = req.body;
        // Validar datos (validator)
        try{
            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);
        }catch(err){
            return res.status(200).send({
                status: 'error',
                message: 'Faltan datos para enviar'
            });
        }

        if(validate_title && validate_content){
            
            // Crear el objeto a guardar
            var article = new Article();
            
            // Asignar valores
            article.title = params.title;
            article.content = params.content;
            if(params.image){
                article.image = params.image;
            }else{
                article.image = null;
            }
            
            // Guardar el articulo
            article.save((err, articleStored) => {
                if(err || !articleStored){
                    return res.status(404).send({
                        status: 'error',
                        message: 'El articulo no se ha guardado'
                    })            
                }

                // Devolver una respuesta
                return res.status(200).send({
                    status: 'success',
                    article: articleStored
                })
            });
        }
    },
    getArticles: (req, res) => {
        var query = Article.find({});
        var last = req.params.last;

        if(last || last != undefined){
            query.limit(Number(last));
        }

        query.sort('-_id').exec((err, articles) => {
            if(err){
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al devolver los articulos'
                })   
            }
            if(!articles){
                return res.status(404).send({
                    status: 'error',
                    message: 'No hay articulos para mostrar'
                })   
            }
            return res.status(200).send({
                status: 'success',
                articles
            })
        });
    },
    getArticle: (req,res) => {
        // Recoger el id de la url
        var articleID = req.params.id;

        //Comprobar que existe
        if(!articleID || articleID == null){
            return res.status(404).send({
                status: 'error',
                message: 'No existe el articulo'
            })   
        }

        // Buscar el articulo
        Article.findById(articleID, (err, article) => {
            if(err || !article){
                return res.status(404).send({
                    status: 'error',
                    message: 'No existe el articulo'
                }) 
            }
            return res.status(200).send({
                status: 'success',
                article
            })
        });
    },
    update: (req, res) => {
        // Recoger el ID del articulo por la URL
        var articleId = req.params.id;
        // Recoger los datos que llegan por put
        var params = req.body;
        // Validar los datos
        try {
            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);
        } catch (err) {
            return res.status(200).send({
                status: 'error',
                message: 'Faltan datos por enviar'
            })  
        }
        if(validate_title && validate_content){
            // Find and update
            Article.findOneAndUpdate({_id: articleId}, params, {new: true}, (err, articleUpdated) => {
                if(err){
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error al actualizar'
                    })      
                }
                if(!articleUpdated){
                    return res.status(404).send({
                        status: 'error',
                        message: 'No existe el articulo'
                    })
                }
                return res.status(200).send({
                    status: 'success',
                    article: articleUpdated
                })
            });
        }else{
            //Devolver una respuesta
            return res.status(200).send({
                status: 'error',
                message: 'La validacion no es correcta'
            }) 
        }

    },
    delete: (req, res) => {
        // Recoger el id de la url
        var articleId = req.params.id;
        // Find and delete
        Article.findOneAndDelete({_id: articleId}, (err,articleRemoved) => {
            if(err){
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al borrar'
                }) 
            }
            if(!articleRemoved){
                return res.status(404).send({
                    status: 'error',
                    message: 'No se ha borrado el articulo'
                }) 
            }
            return res.status(200).send({
                status: 'success',
                article: articleRemoved
            }) 
        });
    },
    upload: (req, res) => {
        // Configurar el modulo del connect multiparty router/article.js
        // Recoger el fichero de la peticion
        var file_name = 'Imagen no subida';
        if(!req.files){
            return res.status(404).send({
                status: 'error',
                message: file_name
            });
        }

        // Conseguir el nombre y la extension del archivo
        var file_path = req.files.file0.path;
        var file_split = file_path.split('\\');

        // Nombre del archivo
        var file_name = file_split[2];

        // Extension del fichero
        var extension_split = file_name.split('\.');
        var file_ext = extension_split[1];

        // Comprobar la extension, solo imagenes, si no es valida borrar fichero
        if(file_ext != 'png' && file_ext != 'jpg' && file_ext != 'jpeg' && file_ext != 'gif'){
            // Borrar el archivo subido
            fs.unlink(file_path, (err) => {
                return res.status(200).send({
                    status: 'error',
                    message: 'La extension de la imagen no es valida'
                }) 
            });
        }else{
            // Si todo es valido, sacando id de la url
            var articleId = req.params.id;
            if(articleId){
                // Buscar el articulo, asignarle el nombre de la imagen y actualizarlo
                Article.findOneAndUpdate({_id: articleId}, {image: file_name}, {new: true}, (err, articleUpdated) => {
                    if(err || !articleUpdated){
                        return res.status(200).send({
                            status: 'error',
                            message: 'Error al guardar la imagen de articulo'
                        })  
                    }
                    return res.status(200).send({
                        status: 'success',
                        image: file_name
                    }) 
                });
            }else{
                return res.status(200).send({
                    status: 'success',
                    image: file_name
                }) 
            }
            
        }
    },
    getImage: (req, res) => {
        var file = req.params.image;
        var path_file = './upload/articles/'+file;

        fs.exists(path_file, (exists) => {
            if(exists){
                return res.sendFile(path.resolve(path_file));
            }else{
                return res.status(200).send({
                    status: 'error',
                    message: 'La imagen no existe'
                })  
            }
        });   
    },
    search: (req, res) => {
        // Sacar el string a buscar
        var searchString = req.params.search;
        // Find or 
        Article.find({ "$or":
            [{ "title": { "$regex": searchString, "$options": "i"}},
            { "content": { "$regex": searchString, "$options": "i"}}
        ]})
        .sort([['date', 'descending']])
        .exec((err, articles) => {
            if(err){
                return res.status(500).send({
                    status: 'error',
                    message: 'Error en la peticion'
                })  
            }
            if(!articles || articles.length <= 0){
                return res.status(500).send({
                    status: 'error',
                    message: 'No hay articulos que coincidan con tu busqueda'
                })  
            }
            return res.status(200).send({
                status: 'success',
                articles
            })
        });

    }
};

module.exports = controller;