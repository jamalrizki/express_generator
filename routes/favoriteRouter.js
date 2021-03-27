const express = require('express');
const Favorite = require('../models/favorite');
const authenticate = require('../authenticate');
const cors = require('./cors');

const favoriteRouter = express.Router();

favoriteRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Favorite.find({ user: req.user._id })
            .populate('user')
            .populate('campsites')
            .then(favorite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            })
            .catch(err => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({ user: req.user._id })
            .then(favorite => {
                if (favorite) {
                    for (var i = 0; i < req.body.length; i++) {
                        if (favorite.campsites.includes(req.body[i]._id)) {
                            //console.log('favorite exists');
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'text/plain');
                            res.end('Campsite has already been added to favorites');
                        }
                        else if (favorite.campsites.indexOf(req.body[i]._id)) {
                            favorite.campsites.push(req.body[i]._id);
                        }
                    }
                    favorite.save()
                        .then(favorite => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                        })
                        .catch(err => next(err));
                } else {
                    Favorite.create({
                        user: req.user._id,
                        campsites: req.body
                    })
                        .then(favorite => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                        })
                        .catch(err => next(err));
                }
            })
            .catch(err => next(err));
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /favorites');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOneAndDelete()
            .then(response => {
                if (response == null) {
                    res.setHeader('Content-Type', 'text/plain');
                    res.end('You do not have any favorites to delete.');
                } else {
                    //console.log(response)
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(response);
                }
            })
            .catch(err => next(err));
    })


favoriteRouter.route('/:campsiteId')
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors.cors, (req, res, next) => {
        res.statusCode = 403;
        res.end('GET operation not supported on /favorites/:campsiteId');
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({ user: req.user._id })
            .then(favorite => {
                if (favorite) {
                    if (!favorite.campsites.includes(req.params.campsiteId)) {
                        favorite.campsites.push(req.params.campsiteId);
                        favorite.save()
                            .then(favorite => {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(favorite);
                            })
                            .catch(err => next(err));
                    } else {
                        res.statusCode = 200;
                        res.end(`That campsite is already in the list of favorites!`)
                    }
                } else {
                    Favorite.create({
                        user: req.user._id, campsites: [req.params.campsiteId]
                    })
                        .then(favorite => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', '/application/json');
                            res.json(favorite);
                        })
                        .catch(err => next(err));
                }
            })
            .catch(err => next(err));
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /favorites/:campsiteId');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({ user: req.user._id })
            .then(favorite => {
                if (favorite) {
                    const favorites = favorite.campsites.indexOf(req.params.campsiteId);
                    //console.log(favorites)
                    if (favorites < 0) {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'text/plain');
                        res.end('There are no favorites to delete');
                    }
                    else if (favorites >= 0) {
                        favorite.campsites.splice(favorites, 1);
                        favorite.save();
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorite);
                    }
                } else {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', '/application/json');
                    res.json(favorite);
                }
            }).catch(err => next(err));
    });

module.exports = favoriteRouter;

