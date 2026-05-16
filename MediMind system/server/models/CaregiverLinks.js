import mongoose from "mongoose";

const CaregiverLinkSchema = mongoose.Schema({
  caregiverName:{type: String, required: true },
  caregiverEmail:{type: String, required: true },
  patientName:{type: String, required: true },
  patientEmail:{type: String, required: true },
  relationshipStatus:{type: String, default: "Linked",},
});


const CaregiverLinkModel = mongoose.model("CaregiverLinksTbl", CaregiverLinkSchema,"CaregiverLinksTbl");

export default CaregiverLinkModel;