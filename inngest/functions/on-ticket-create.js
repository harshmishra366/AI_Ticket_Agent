
import { NonRetriableError } from "inngest";
import {inngest} from "../client.js"
import User from "../../models/user.js"
import Ticket from "../../models/ticket.js";
import { sendmail } from "../../utils/mailer.js";
import analyzeTicket from "../../utils/ai.js";
export const onTicketCreated=inngest.createFunction(
    {id:"onTicketCreated",retries:2},
    {event:"ticket.created"},
    async({event,step})=>{
        try {
        const {ticketId}=event.data;
       
        
        const ticket = await step.run("fetch-ticket",async()=>{
             const ticketObj =await Ticket.findById(ticketId);
        if(!ticketObj){
            throw new NonRetriableError("Ticket not found");
        }
            return ticketObj;

        })    

        await step.run("update-ticket-status",async()=>{
            await Ticket.findByIdAndUpdate(ticket._Id,{
                status:"TODO"
            })
            
        })

        const aiResponse= await analyzeTicket(ticket)

       const relatedSkills= await step.run("ai-processing",async()=>{
            let skills = [];
            if(aiResponse){
                await Ticket.findByIdAndUpdate(ticket._id, {
                    priority: !["low","medium","high"].includes(aiResponse.priority)?"medium": aiResponse.priority,
                    helpfulNotes: aiResponse?.helpfulNotes,
                    status:"in-progress",
                    relatedSkills: aiResponse?.relatedSkills || []
                });
                skills = aiResponse.relatedSkills || [];



            }
            return skills;
        })


        const moderator= await step.run("assign-moderator",
            async()=>{
                let user= await User.findOne({
                    role:"moderator",
                    skills:{
                        $elemMatch: {
                            $regex: relatedSkills.join("|"),
                            $options: "i"
                        }
                    }

                });
                if(!user){
                    user= await User.findOne({
                        role:"admin"
                    })
                }
                await Ticket.findByIdAndUpdate(ticket._id, {
                    assignedTo: user?._id || null
                });
                return user;
            }

        )
        await step.run("send-email-notification",async()=>{
            if(moderator){
               const finalTIcket= await Ticket.findById(ticket._id)
                await sendmail({
                    
                    to: moderator.email,
                    subject: `New Ticket Assigned: ${finalTIcket.title}`,
                    text: `You have been assigned a new ticket titled "${finalTIcket.title}". Please check the details in the system.`
                })
            }
        })
        return{success:true}


      
            
        } catch (error) {
            console.error("Error in onTicketCreated function:", error);
            throw new NonRetriableError("Failed to process ticket creation");
        }
    }
)