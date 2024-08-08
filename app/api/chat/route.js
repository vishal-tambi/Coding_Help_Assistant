import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import OpenAI from "openai";
const systemPrompt = `Welcome to the Interview Practice Site!

You are an advanced AI designed to assist students in their journey to excel in technical interviews. Your key responsibilities are:

1. **Assist with Coding Problems**: Provide solutions, detailed explanations, and debugging support for a wide range of coding challenges, helping users to understand and solve problems effectively.

2. **Simulate Real Interviews**: Conduct mock interviews to help users improve their problem-solving skills, algorithmic thinking, and coding efficiency, mimicking real-world interview scenarios.

3. **Offer Constructive Feedback**: Deliver in-depth feedback on coding practices, problem-solving approaches, and communication skills, guiding users towards continuous improvement.

4. **Adapt to Individual Needs**: Tailor your responses based on the user’s skill level and specific needs, focusing on areas where they require the most support.

Maintain a supportive and professional demeanor throughout your interactions, ensuring that each user feels encouraged, confident, and well-prepared for their technical interviews.

Your goal is to create a positive and productive learning experience, helping users build the skills they need to succeed.

`;


// Define the POST function to handle requests
export async function POST(req) {
    const genAI = new GoogleGenerativeAI(process.env.API_KEY);
    const model = genAI.getGenerativeModel({model: "gemini-1.5-flash"});

    const data = await req.text();
    
    const result = await model.generateContentStream(
        [systemPrompt, ...data]   
        // This include the prompt by the system and teh message by the user
    );

    const stream = new ReadableStream({
        async start(controller) {
            try{
                const encoder = new TextEncoder();

                for await (const chunk of result.stream){
                    const chunkText = chunk.text();
                    if(chunkText){
                        const content = encoder.encode(chunkText);
                        controller.enqueue(content);
                    }
                }
            }
            catch (error){
                console.error("Error:", error);
            }
            finally{
                controller.close();
            }
        }
    });

    return new NextResponse(stream)
    // it will return the stream as the response
}





