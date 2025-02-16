// app/routes/api/chat.tsx
import { json } from '@remix-run/node';
import  prisma  from '~/utils/prisma.server';
import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { getKindeSession } from "@kinde-oss/kinde-remix-sdk";
import { requireAuth } from '~/utils/requireAuth';
// Enhanced error handling
export const loader: LoaderFunction = async ({ request }) => {
  try {
    const user = await requireAuth(request);
    if (!user) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }
    const chatSettings = await prisma.chatSettings.findUnique({
      where: { userId: user.id },
    });
    return json({ chatSettings });
  } catch (error) {
    console.error(error);
    return json({ error: "Unauthorized" }, { status: 401 });
  }
};
export const action: ActionFunction = async ({ request }) => {
  const session = await getKindeSession(request);
  const user = await session.getUser();
  
  if (!user) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const action = formData.get('action');

  switch (action) {
    case 'updateSettings': {
      const settings = JSON.parse(formData.get('settings') as string);
      
      const updatedSettings = await prisma.chatSettings.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          ...settings,
        },
        update: settings,
      });

      return json({ settings: updatedSettings });
    }

    case 'captureEmail': {
      const email = formData.get('email');
      
      const capturedEmail = await prisma.emailCapture.create({
        data: {
          userId: user.id,
          email: email as string,
        },
      });

      return json({ success: true, email: capturedEmail });
    }

    case 'generateCode': {
      const language = formData.get('language');
      const prompt = formData.get('prompt');
      // Implement your code generation logic here
      const result = await generateCode(language as string, prompt as string);

      return json({ code: result });
    }
    case 'updateSettings': {
      const settings = JSON.parse(formData.get('settings') as string);
      const validationResult = validateSettingsSchema(settings);
      if (validationResult === undefined) {
        return json({ error: 'Invalid settings format' }, { status: 400 });
      }
      return json({ settings });
    }

    default:
      return json({ error: 'Invalid action' }, { status: 400 });
  }
};
function validateSettingsSchema(settings: any) {
  throw new Error('Function not implemented.');
}

