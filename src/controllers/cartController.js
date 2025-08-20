const User = require("../models/user");
const Product = require("../models/products");
const recipes = require("../data/recipes");

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

// Get recipe suggestions based on cart items
exports.getRecipeSuggestions = async (req, res) => {
    try {
        // For now, use mock data since auth is not working
        // TODO: Replace with real cart data when auth is fixed
        const cartItems = ["egg", "bread", "tomato"];
        
        // Helper function to match ingredients (handles singular/plural)
        const ingredientMatches = (ingredient, cartItem) => {
            const ing = ingredient.toLowerCase();
            const cart = cartItem.toLowerCase();
            return ing.includes(cart) || cart.includes(ing) || 
                   ing === cart + 's' || cart === ing + 's' ||
                   ing === cart + 'es' || cart === ing + 'es';
        };
        
        // Find matching recipes
        const suggestions = recipes.filter(recipe => {
            const matchCount = recipe.ingredients.filter(ingredient => 
                cartItems.some(cartItem => ingredientMatches(ingredient, cartItem))
            ).length;
            return matchCount >= 2;
        }).map(recipe => ({
            ...recipe,
            matchingIngredients: recipe.ingredients.filter(ingredient => 
                cartItems.some(cartItem => ingredientMatches(ingredient, cartItem))
            )
        })).sort((a, b) => b.matchingIngredients.length - a.matchingIngredients.length);
        
        res.json({ suggestions, cartItems });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

