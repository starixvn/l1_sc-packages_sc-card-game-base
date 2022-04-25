import mongoose from "mongoose";

const resultSchema = new mongoose.Schema({
    isAvailable: { type: Boolean, required: true },
    currentIndex: { type: Number, required: true },
    maxIndex: { type: Number, required: true },
    skippedCount: { type: Number, required: true },
    chain: { type: Object, required: true },
    time: { type: Date, default: new Date() },
});

export default resultSchema;
