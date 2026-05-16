import mongoose from "mongoose";

const MedicationSchema = mongoose.Schema({
  userEmail:{type: String,required:true},
medicationName: {type: String,required:true},
dosage:{type: String,required:true},
frequency:{type: String,required:true},
timing:{type: String,required:true},
instructions:{type: String},
prescriptionImage:{type: String},
});
const MedicationModel = mongoose.model("MedicationsTbl", MedicationSchema, "MedicationsTbl");

export default MedicationModel;