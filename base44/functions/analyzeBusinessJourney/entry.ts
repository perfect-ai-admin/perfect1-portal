import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { answers } = await base44.request.json();

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

            **CRITICAL CONTEXT - PROFESSION:**
            The user has explicitly stated their profession/business type in the 'profession_description' field. 
            YOU MUST USE THIS to tailor the plan. If they are a "Singer", suggest music-related steps. If "Lawyer", suggest legal marketing. 
            Do not give generic advice if you know the profession.

            **CRITICAL CONTEXT - PROFESSION:**
            The user has explicitly stated their profession/business type in the 'profession_description' field. 
            YOU MUST USE THIS to tailor the plan. If they are a "Singer", suggest music-related steps. If "Lawyer", suggest legal marketing. 
            Do not give generic advice if you know the profession.

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

               **Step 1: The "Momentum" Task (Quick Win)**
               - THIS IS CRITICAL. The first task MUST be something they can do in 5-10 minutes to get a "quick win".
               - Examples: "Send a WhatsApp to 5 friends", "Write your pitch", "Sign up for the app".
               - It must be tagged as task_type: "MOMENTUM".

               **Steps 2-6: The "Healthy Business" Roadmap**
               - Don't just list random tasks. Build the business layer by layer.
               - IF they are "Idea Stage" (רעיון/חושב לפתוח): Follow this EXACT order: Step 1 = Formulate the Idea (גיבוש הרעיון), Step 2 = Acquire First Client (גיוס לקוח ראשון), Step 3 = Open Osek Patur (פתיחת עוסק פטור) to issue a receipt.
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

            **CRITICAL - Description Format:**
            Each task description MUST be:
            - Maximum 8-10 words in Hebrew
            - One clear sentence only
            - No technical jargon
            - Readable on mobile (small screen)
            - Focus on the outcome, not the process

            Examples of GOOD descriptions:
            ✅ "הגדר מה אתה מוכר ולמי"
            ✅ "צור דף נחיתה שמביא לקוחות"
            ✅ "פתח תיק במס הכנסה"

            Examples of BAD descriptions (too long):
            ❌ "זהו את הלקוחות הפוטנציאליים ובנה אסטרטגיה מותאמת להם"
            ❌ "כדי להתחיל לדווח ולהוציא חשבוניות, יש לפתוח עוסק פטור"

            **CRITICAL: Recommended Goal Selection**
            Based on the user's answers, you MUST select ONE recommended goal that is the BEST starting point for them RIGHT NOW.
            
            Available Goal Templates (by ID):
            - active_customers: הגדלת כמות לקוחות פעילים
            - monthly_income: הגדלת הכנסה חודשית
            - cashflow_stability: יציבות בתזרים מזומנים
            - quality_leads: יותר פניות / לידים איכותיים
            - conversion_rate: שיפור אחוזי סגירה
            - deal_value: העלאת מחיר / ערך עסקה
            - time_saving: חיסכון בזמן עבודה
            - business_control: סדר ושליטה בעסק
            - marketing_engine: בניית מנגנון שיווק קבוע
            - retention: שימור והחזרת לקוחות
            - reduce_stress: פחות לחץ ושחיקה
            - focus_direction: מיקוד וכיוון עסקי ברור
            
            **Logic for Goal Selection:**
            - "idea" stage -> focus_direction (צריכים בהירות)
            - "new" with no clients -> quality_leads (צריכים לקוחות)
            - "new" with first clients but low conversion -> conversion_rate
            - "active" with chaos -> business_control
            - "active" with low revenue -> monthly_income
            - "stable" with time pressure -> time_saving
            - "stable" with stress -> reduce_stress
            - "scaling" -> depends on bottleneck
            
            **Output JSON Structure:**
            {
            "state_id": "string (one of: idea, new, active, stable, scaling)",
            "state_name": "string (Creative Hebrew name for their current status)",
            "state_description": "string (A sharp, 2-sentence diagnosis of where they are and what's holding them back, in Hebrew)",
            "state_goal": "string (The primary objective for the next 3-6 months in Hebrew)",
            "recommended_goal": {
                "goal_id": "string (one of the goal template IDs above)",
                "reason": "string (ONE sentence in Hebrew explaining WHY this goal is perfect for them right now. Max 15 words.)",
                "confidence": "string (high/medium/low)"
            },
            "tasks": [
                {
                    "title": "string (Actionable, specific step title in Hebrew - max 4 words)",
                    "description": "string (MAXIMUM 8-10 words in Hebrew. One clear sentence. Mobile-friendly.)",
                    "is_milestone": boolean (true for steps 1, 3, 6),
                    "task_type": "string (Enum: MOMENTUM, SETUP, MARKETING, SALES, FINANCE, STRATEGY, PRODUCT, GENERAL)",
                    "effort": "string (Low/Medium/High)",
                    "impact": "string (Low/Medium/High)"
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
                recommended_goal: {
                    type: "object",
                    properties: {
                        goal_id: { type: "string" },
                        reason: { type: "string" },
                        confidence: { type: "string" }
                    },
                    required: ["goal_id", "reason", "confidence"]
                },
                tasks: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            title: { type: "string" },
                            description: { type: "string" },
                            is_milestone: { type: "boolean" },
                            task_type: { type: "string", enum: ["MOMENTUM", "SETUP", "MARKETING", "SALES", "FINANCE", "STRATEGY", "PRODUCT", "GENERAL"] },
                            effort: { type: "string" },
                            impact: { type: "string" }
                        },
                        required: ["title", "description", "is_milestone", "task_type"]
                    }
                }
            },
            required: ["state_id", "state_name", "tasks", "recommended_goal"]
            }
        });

        const analysis = llmResponse;

        console.log('AI Analysis Result:', JSON.stringify(analysis, null, 2));

        // Validate that we got a proper response
        if (!analysis.tasks || analysis.tasks.length === 0) {
            throw new Error('AI failed to generate tasks. Please try again.');
        }

        // Archive previous journeys
        const existingJourneys = await base44.entities.BusinessJourney.filter({ user_id: user.id, status: 'active' });
        for (const journey of existingJourneys) {
            await base44.entities.BusinessJourney.update(journey.id, { status: 'archived' });
        }

        // Create new BusinessJourney entity
        const tasksWithIds = analysis.tasks.map((task, index) => ({
            id: crypto.randomUUID(),
            title: task.title,
            description: task.description || task.title,
            status: index === 0 ? "in_progress" : "pending",
            is_milestone: task.is_milestone || false,
            task_type: task.task_type || "GENERAL",
            effort: task.effort || "Medium",
            impact: task.impact || "High"
        }));

        const newJourney = await base44.entities.BusinessJourney.create({
            user_id: user.id,
            status: 'active',
            stage: analysis.state_id,
            tasks: tasksWithIds,
            recommended_goal: analysis.recommended_goal,
            ai_analysis: analysis.state_description,
            business_metrics: {
                goal: analysis.state_goal,
                state_name: analysis.state_name
            }
        });

        // Backward compatibility + Flag updates on User
        // שינוי סטטוס מ-paused ל-active כי המשתמש השלים את האונבורדינג
        const updates = {
            status: 'active',
            business_journey_completed: true,
            business_journey_answers: answers,
            business_domain: answers.profession_description || null,
            business_journey_completed_date: new Date().toISOString(),
        };

        await base44.auth.updateMe({
            ...updates,
            // We keep these for now as some components might still rely on them until full migration
            business_state: {
                id: analysis.state_id,
                name: analysis.state_name,
                description: analysis.state_description,
                goal: analysis.state_goal
            },
            recommended_goal: analysis.recommended_goal,
            active_journey_id: newJourney.id
        });

        return Response.json({ success: true, analysis: analysis, journeyId: newJourney.id });

    } catch (error) {
        console.error("Error analyzing business journey:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});