const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Order = require('../models/order');
const Product = require('../models/product');

// Handle incoming GET requests to /orders
router.get('/', (req, res, next) => {
    Order.find()
    .select("product quantity _id")
    .exec()
    .then(docs => {
        res.status(200).json({
            count: docs.length,
            orders: docs.map(doc=> {
                return {
                    _id: doc._id,
                    product: doc.product,
                    quantity: doc.quantity,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/orders/' + doc._id
                    }
                }
                })
            })
    })
    .catch(err => {
        res.status(500).json({
            error:err
        });
    });
});

router.post('/', (req, res, next) => {
    if(mongoose.Types.ObjectId.isValid(req.body.productId)){
        Product.findById(req.body.productId)
            .then(product => {
                const order = new Order({
                    _id: new mongoose.Types.ObjectId(),
                    quantity: req.body.quantity,
                    product: req.body.productId
                });
                return order.save()
                    
            })
            .then(result => {
                console.log(result);
                res.status(201).json({
                    message: 'Order stored',
                    createdOrder: {
                        _id: result._id,
                        product: result.product,
                        quantity: result.quantity
                    },
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/orders/' + result._id
                    }
                });
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({
                    error: err
                });
            })
    }
    else {
        console.log("invalid product id");
        return res.status(500).json({
            message: "invalid product id"
        });
    }
});

router.get('/:orderId', (req, res, next) => {
    if(mongoose.Types.ObjectId.isValid(req.body.orderId)) {
        Order.findById(req.params.orderId)
        .exec()
        .then(order => {
            if (!order) {
                return res.status(404),json({
                    message: 'Order not found'
                })
            }
            res.status(200).json({
                order: order,
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/orders'
                }
            })
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
    }
    else {
        console.log("invalid order id");
        return res.status(500).json({
            message: "invalid order id"
        });
    }
    
});
router.delete('/:orderId', (req, res, next) => {
    Order.deleteOne({ _id: req.params.orderId })
    .exec()
    .then(order => {
        res.status(200).json({
            message: 'Order deleted',
            request: {
                type: 'POST',
                url: 'http://localhost:3000/orders',
                body: { productId: 'ID', quantity: 'Number'}
            }
        })
    })
    .catch(err => {
        res.status(500).json({
            error: err
        })
    })
});

module.exports = router;