import mongoose from "mongoose";
import resultSchema from "../../../../src/models/result-schema";

export default mongoose.model("baccarat_results", resultSchema);
