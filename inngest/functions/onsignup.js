
import { NonRetriableError } from "inngest";
import {inngest} from "../inngest/client.js"
import User from "../models/User.js"
import { sendmail } from "../../utils/mailer.js";
export const onUserSignup=inngest.createFunction(
    {id:"onUserSignup",retries:2},
    {event:"user.signup"},
    async({event,step})=>{
        try {
        const {email}=event.data;
        const user = await step.run("get-user-email",async()=>{
            const userOnject= await User.findOne({email})
            if(!userOnject){
                
                throw new NonRetriableError("User not found")

            }
            return userOnject;

        })    

        await step.run("send-welcome-email",async()=>{
            const subject=`Welcome to AI Assistant Ticketing System`
            const message=`Hello ,\n\nWelcome to the AI Assistant Ticketing System! We're excited to have you on board.\n\nBest regards,\nAI Assistant Team`


            await sendmail(user.email,subject,message)
        })

        return {success:true,message:"Welcome email sent successfully"}
            
        } catch (error) {
            console.error("Error in onUserSignup function:", error);
        }
    }
)