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

            **Your Mission:**
            1. **Deep Analysis:** Look at *every* answer. If they said their blocker is "Fear", the first step MUST address mindset/confidence. If they said "Leads" are the challenge, the plan MUST focus on lead gen.
            2. **Define the State:** Create a custom state name that fits them exactly (e.g., "Graphic Designer - Early Growth" or "Tech Startup - Scaling Phase").
            3. **Generate 6 Tactical Steps:**
               - **Step 1:** Must be an "Quick Win" addressing their immediate pain point (e.g. "Overcome the fear of selling").
               - **Steps 2-5:** Build the foundation and growth engines specific to their flow.
               - **Step 6:** The "Next Level" milestone (e.g. "Hiring your first employee" or "Reaching 30k revenue").
            
            **CRITICAL RULES:**
            - **Do NOT be generic.** "Build a marketing plan" is bad. "Create 3 Instagram Reels showcasing your design process" is good.
            - **Address the 'Missing Piece':** If they explicitly stated what's missing or challenging, solve it in the plan.
            - **Tone:** Professional, encouraging, yet tactical and direct.
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