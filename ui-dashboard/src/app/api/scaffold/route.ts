import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request: Request) {
  try {
    const { target_ecosystem } = await request.json();
    if (!target_ecosystem) {
      return NextResponse.json({ error: 'target_ecosystem is required' }, { status: 400 });
    }

    const ecoName = target_ecosystem.replace(/\s+/g, '-').toLowerCase();
    const ecoPath = `/root/ecosystems/ecosystem-${ecoName}`;

    // Execute the real F100 devluxe AI tailoring script!
    // This physically alters the CPX62 file system, persisting the F100 standard.
    const cmd = `node /root/ecosystems/ecosystem-whitelabel/devluxe/npm/bin/devluxe.js init ${ecoPath} --name ecosystem-${ecoName} --ai-tailor --force`;
    
    // We launch it async and return immediately so the UI doesn't hang for 10 minutes.
    execAsync(cmd).catch(err => console.error("Scaffold Error:", err));

    return NextResponse.json({ 
      success: true, 
      target: ecoName,
      message: `AI Tailoring Marathon launched for ecosystem-${ecoName}. Files are being written to the CPX62 SSD.` 
    });

  } catch (error) {
    return NextResponse.json({ error: 'Execution failed' }, { status: 500 });
  }
}
