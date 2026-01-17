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
            1. **Deep Analysis:** Look at *every* answer. Identify the specific pain point (e.g., "Chaos", "No Leads", "Fear").
            2. **Define the State:** Create a custom state name that fits them exactly.
            3. **Generate 6 Strategic Steps that SELL the solution:**
               - Every step must guide them to take action **USING THE SYSTEM**.
               
               **CRITICAL - STEP 1 LOGIC:**
               Step 1 is the "Hook". It MUST solve their *burning* pain point immediately.
               - IF they are in "Idea" stage OR have "Fear" -> Step 1 MUST be **"Consult with the AI Mentor"** to build confidence/strategy. (Do NOT tell them to create an invoice).
               - IF they are "New" and need "Branding" -> Step 1 MUST be **"Create your Logo"** in the Marketing Suite.
               - IF they have "No Leads" -> Step 1 MUST be **"Create a Landing Page"** or **"Start a Campaign"** in the Marketing Suite.
               - IF they have "Sales" issues -> Step 1 MUST be **"Roleplay a Sales Call"** with the AI Mentor.
               - IF (and ONLY IF) they have "Chaos" or "Cashflow" issues -> Step 1 can be **"Issue a Digital Invoice"** or "Organize Expenses" in the Financial System.

               **Steps 2-6:**
               - Build the rest of the foundation using the *other* relevant modules (Marketing/Finance/Mentor/Goals) in a logical order.
               - Ensure a mix of tools is introduced over time.

            **CRITICAL RULES:**
            - **Be the Guide:** The steps should feel like a roadmap that says "We have the tools to help you grow".
            - **Context is King:** Do not suggest advanced features (like ROI tracking) to a beginner. Do not suggest basic features (like "open a file") to a veteran.
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