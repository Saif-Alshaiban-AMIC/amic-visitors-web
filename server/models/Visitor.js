const { Schema, model } = require('mongoose');

const visitorSchema = new Schema({
  title:            { type: String, required: true },
  visitDate:        { type: Date, required: true },
  timeIn:           String,
  companyName:      String,
  personOrDept:     String,
  phoneNumber:      String,
  timeLeaving:      String,
  remarks:          String,
  visitorSignature: String,
}, { timestamps: true });

module.exports = model('Visitor', visitorSchema);
