import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * קובע סטטוס "מושהה" ליוזרים חדשים שנכנסים מכאן והלאה
 * מופעל מיד אחרי שהמייל נשלח ליוזר החדש
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Check if user is admin
        const adminUser = await base44.auth.me();
        if (!adminUser || adminUser.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const body = await req.json();
        const { email } = body;

        if (!email) {
            return Response.json({ error: 'email is required' }, { status: 400 });
        }

        console.log('📧 Checking if user exists:', email);

        // חכה קצת שהיוזר ייווצר במערכת
        await new Promise(resolve => setTimeout(resolve, 3000));

        // מצא את היוזר שנוצר
        const allUsers = await base44.asServiceRole.entities.User.list();
        const newUser = allUsers.find(u => u.email === email);

        if (!newUser) {
            console.log('⏭️ User not found yet:', email);
            return Response.json({ message: 'User not created yet' });
        }

        // עדכן ל-paused
        await base44.asServiceRole.entities.User.update(newUser.id, {
            status: 'paused'
        });

        console.log('✅ New user set to paused:', email);

        return Response.json({ 
            success: true, 
            user_email: email,
            user_id: newUser.id,
            status: 'paused' 
        });

    } catch (error) {
        console.error('Error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});