import mongoose from "mongoose";

const { ObjectId } = mongoose.Schema.Types; // <-- correct

const productSchema = new mongoose.Schema({
    owner: { type: ObjectId, ref: 'User' }, // <-- fixed
    name: { type: String, required: true },
    category: { type: String, required: true },
    image: { type: String, required: true },
    size: { type: String, required: true },
    colour: { type: String, required: true },
    material: { type: String, required: true },
    occasion: { type: String, required: true },
    pricePerDay: { type: Number, required: true },
    location: { type: String, required: true },
    description: { type: String, required: true },
    isAvailable: { type: Boolean, default: true }
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

export default Product;
