import Booking from "../models/Booking.js";
import Product from "../models/Product.js";

// Function to check Availability of product for a given date
const checkAvailability = async (product, pickupDate, returnDate) => {
    const bookings = await Booking.find({
        product,
        pickupDate: { $lte: returnDate },
        returnDate: { $gte: pickupDate },
    });
    return bookings.length === 0;
};

// API to check Availability of product for the given date and location
export const checkAvailabilityOfProduct = async (req, res) => {
    try {
        const { location, pickupDate, returnDate } = req.body;

        // fetch all available product for the given location
        const products = await Product.find({ location, isAvailable: true });

        // check product availability for the given date range
        const availableProductPromises = products.map(async (product) => {
            const isAvailable = await checkAvailability(product._id, pickupDate, returnDate);
            return { ...product._doc, isAvailable };
        });

        let availableProducts = await Promise.all(availableProductPromises);
        availableProducts = availableProducts.filter(p => p.isAvailable);

        res.json({ success: true, availableProducts });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// API to Create booking
export const createBooking = async (req, res) => {
    try {
        const { _id } = req.user;
        const { product, pickupDate, returnDate } = req.body;

        const isAvailable = await checkAvailability(product, pickupDate, returnDate);
        if (!isAvailable) {
            return res.json({ success: false, message: "Product is not available" });
        }

        const productData = await Product.findById(product);

        // calculate price based on pickup and return date
        const picked = new Date(pickupDate);
        const returned = new Date(returnDate);
        const noOfDays = Math.ceil((returned - picked) / (1000 * 60 * 60 * 24));
        const price = productData.pricePerDay * noOfDays;

        await Booking.create({
            product,
            owner: productData.owner,
            user: _id,
            pickupDate,
            returnDate,
            price
        });

        res.json({ success: true, message: "Booking Created" });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// API to List user bookings
export const getUserBookings = async (req, res) => {
    try {
        const { _id } = req.user;
        const bookings = await Booking.find({ user: _id })
            .populate("product")
            .sort({ createdAt: -1 });

        res.json({ success: true, bookings });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// API to get Owner Booking
export const getOwnerBookings = async (req, res) => {
    try {
        if (req.user.role !== 'owner') {
            return res.json({ success: false, message: "Unauthorized" });
        }

        const bookings = await Booking.find({ owner: req.user._id })
            .populate('product user')
            .select("-user.password")
            .sort({ createdAt: -1 });

        res.json({ success: true, bookings });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// API to change the booking status
export const changeBookingStatus = async (req, res) => {
    try {
        const { _id } = req.user;
        const { bookingId, status } = req.body;

        const booking = await Booking.findById(bookingId);

        if (booking.owner.toString() !== _id.toString()) {
            return res.json({ success: false, message: "Unauthorized" });
        }

        booking.status = status;
        await booking.save();

        res.json({ success: true, message: "Status Updated" });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};
