import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema({
    title:{
        type:String,
        required: true
    },
    description:{
        type:String,
        required: true
    },
    status:{
        type:String,
        enum: ['open', 'in-progress', 'closed'],
        default:'TODO'
    },
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required: true
    },
    assingedTo:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        default: null
    },
    priority: String,
    deadline:Date,
    helpfulNotes:String,
    relatedSkills:[String],
    createdAt: {
        type: Date,
        default: Date.now
    },
    // comments: [{

})

export default mongoose.model("Ticket", ticketSchema);