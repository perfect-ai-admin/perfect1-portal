import { createClientFromRequest } from 'npm:@base44/sdk@0.8.3';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { answers } = await req.json();

        if (!answers) {
            return Response.json({ error: 'Answers are required' }, { status: 400 });
        }

        // Context from the dynamic questionnaire
        // The 'current_status' answer determines the flow: idea, new, active, stable, scaling
        
        // Call LLM to analyze with enhanced context
        const llmResponse = await base44.integrations.Core.InvokeLLM({
            prompt: `
            You are "Perfect Biz AI", an elite business strategist and consultant.
            Your goal is to build a highly **hyper-personalized** growth plan for a business owner based on their specific questionnaire answers.

            **User Profile & Answers:**
            ${JSON.stringify(answers, null, 2)}

            **Context on The Flows:**
            The user came through one of 5 specific flows based on their 'current_status':
            1. **Idea Stage** (answers include: field, blocker, commitment, skill_level) -> Needs validation, overcoming fear, and initial setup.
            2. **New Business** (answers include: bureaucracy_status, first_clients, marketing_method, biggest_challenge_new) -> Needs first paying clients, basic marketing assets, and confidence.
            3. **Active/Survival** (answers include: revenue_range, lead_source_active, process_status, missing_piece) -> Needs consistency, better sales conversions, and organized processes to stop the chaos.
            4. **Stable/Plateau** (answers include: team_structure, ceiling, finance_mgmt, next_year_goal) -> Needs optimization, breaking the "glass ceiling" (time/income), and better financial control.
            5. **Scaling/Growth** (answers include: bottleneck, sops, involvement, vision) -> Needs systems, automation, management, and strategic expansion (exit/franchise).

            **Our Platform Capabilities ("The Solution Toolbox"):**
            You must connect the user's needs to OUR system features. The goal is to show them how the platform helps them succeed.
            1. **AI Business Mentor:** For strategy, asking questions, daily focus, and overcoming fear/blockers.
            2. **Marketing Suite:** For creating campaigns, landing pages, generating leads, and branding (Logo Creator).
            3. **Financial System:** For issuing invoices, tracking expenses, and viewing P&L reports.
            4. **Goals & Tasks:** For structured progress and accountability.

            **Your Mission:**
            1. **Deep Analysis:** Look at *every* answer. Understand the business as a whole - not just the pain point, but what is missing to make it a **successful, healthy business**.
            2. **Define the State:** Create a custom state name that fits them exactly.
            3. **Generate 6 Strategic Steps - The "Business Success Path":**
               Build a logical, ordered roadmap that takes them from their current chaos/start to a stable, working machine.
               
               **The Logic of Business Order (Use this flow):**
               1. **Foundation & Identity:** (Concept, Branding, Confidence)
               2. **Acquisition Engine:** (Marketing, Leads, Exposure)
               3. **Sales & Revenue:** (Closing deals, Pricing, Contracts)
               4. **Financial Order:** (Invoicing, Expenses, Cashflow)
               5. **Management & Growth:** (Goals, Routine, Optimization)

               **Step 1: The "Hook" (Immediate Relief)**
               - Must solve the specific *burning* pain point immediately (e.g. Fear -> Mentor, No Leads -> Campaign/Landing Page, Chaos -> Invoice).

               **Steps 2-6: The "Healthy Business" Roadmap**
               - Don't just list random tasks. Build the business layer by layer.
               - IF they are "Idea Stage" (רעיון/חושב לפתוח): **MANDATORY:** One of the steps MUST be "Opening Osek Patur" (פתיחת עוסק פטור) to make it official.
               - IF they are "New": Step 2=Branding, Step 3=First Offer/Price, Step 4=First Invoice, Step 5=Marketing, Step 6=Weekly Goal.
               - IF they are "Active" but messy: Step 2=Organize Expenses, Step 3=Set Monthly Goal, Step 4=Refine Sales Script, Step 5=New Campaign.
               
               **Connect EVERY step to the System:**
               - "Define your services" -> "Use the **AI Mentor** to refine your offer."
               - "Get paid" -> "Issue a digital invoice in the **Financial Tab**."
               - "Get known" -> "Create a **Landing Page** in the Marketing Suite."

            **CRITICAL RULES:**
            - **Structure is Key:** The plan must look like a professional consultant wrote it. It needs a beginning, middle, and end.
            - **Context is King:** Don't ask a freelancer to build a team. Don't ask a big business to make a logo.
            - **Tone:** Professional, encouraging, tactical, and platform-oriented.
            - **Language:** STRICTLY HEBREW (עברית).

            **Output JSON Structure:**
            {
                "state_id": "string (one of: idea, new, active, stable, scaling)",
                "state_name": "string (Creative Hebrew name for their current status)",
                "state_description": "string (A sharp, 2-sentence diagnosis of where they are and what's holding them back, in Hebrew)",
                "state_goal": "string (The primary objective for the next 3-6 months in Hebrew)",
                "tasks": [
                    {
                        "title": "string (Actionable, specific step title in Hebrew)",
                        "description": "string (Why this step fixes their specific problem)",
                        "is_milestone": boolean (true for steps 1, 3, 6)
                    }
                ]
            }
            `,
            response_json_schema: {
                type: "object",
                properties: {
                    state_id: { type: "string" },
                    state_name: { type: "string" },
                    state_description: { type: "string" },
                    state_goal: { type: "string" },
                    tasks: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                title: { type: "string" },
                                description: { type: "string" },
                                is_milestone: { type: "boolean" }
                            },
                            required: ["title", "description", "is_milestone"]
                        }
                    }
                },
                required: ["state_id", "state_name", "tasks"]
            }
        });

        const analysis = llmResponse;

        // Update user entity
        const tasksWithIds = analysis.tasks.map((task, index) => ({
            id: crypto.randomUUID(),
            title: task.title,
            description: task.description || task.title,
            status: index === 0 ? "in_progress" : "pending",
            is_milestone: task.is_milestone || false
        }));

        await base44.auth.updateMe({
            business_journey_completed: true,
            business_journey_answers: answers,
            business_state: {
                id: analysis.state_id,
                name: analysis.state_name,
                description: analysis.state_description,
                goal: analysis.state_goal
            },
            client_tasks: tasksWithIds
        });

        return Response.json({ success: true, analysis: analysis });

    } catch (error) {
        console.error("Error analyzing business journey:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});