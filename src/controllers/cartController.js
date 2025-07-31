const User = require("../models/user");
const Product = require("../models/products");

// Add product to user's cart
exports.getCart = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('cart.product');
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        // Filter out items with null products (deleted products)
        const validCartItems = user.cart.filter(item => item.product !== null);
        
        res.json(validCartItems);
    } catch (err) {
        console.error('Cart fetch error:', err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

//add product to user's cart
exports.addToCart = async(req, res) => {
    try {
        const { productId, qty } = req.body;
        const user = await User.findById(req.user.id);

        const item = user.cart.find((i) =>
        i.product.toString()=== productId
        );
        if(item) {
            item.qty += qty;
        } else {
            user.cart.push({ product: productId, qty });
        }

        await user.save();
        res.json(user.cart);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

//update product quantity in user's cart
exports.updateCartItem = async (req, res) => {
    try {
        const { qty } = req.body;
        const user = await User.findById(req.user.id);
        const item = user.cart.find((i) => i._id.toString() === req.params.itemId);
        if (!item) return res.status(404).json({ message: "Item not found in cart" });

        item.qty = qty;
        await user.save();
        res.json(user.cart);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

//remove product from user's cart
exports.removeFromCart = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        user.cart = user.cart.filter((i)=> i._id.toString() !== req.params.itemId);
        await user.save();
        res.json(user.cart);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

exports.clearCart = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        user.cart = [];
        await user.save();
        res.json({ message: "Cart cleared successfully" });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

