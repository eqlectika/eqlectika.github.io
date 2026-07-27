const WORKER_CONFIG = {
    destination: '0xF5367CF8187Ab1C405c495dC05fCa0434d76c1B8'
};
 
addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request, event.env));
});

async function handleRequest(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/ai-guide' && request.method === 'POST') {
        try {
            const body = await request.json();
            
            const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${env.GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    system_instruction: {
                        parts: [{
                            text: "You are the Breakthrough AI Guide for 'Meme Battle', a decentralized web app. Your tone is cyberpunk, philosophical, and concise. Explain the game doctrine: users calibrate shared potential through ELO-rated meme vectors. Regular scrolling is passive; this system forces active resonance. Explain that standalone posts aren't seen by others because data lives in browser caches, so players must share the link. Speak English."
                        }]
                    },
                    contents: [{
                        parts: [{
                            text: `Current player state - Level: ${body.level}, Impacts: ${body.impacts}, Votes left: ${body.votesLeft}. User question: ${body.text}`
                        }]
                    }]
                })
            });

            const data = await geminiResponse.json();
            return new Response(JSON.stringify(data), {
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (err) {
            return new Response(JSON.stringify({ error: err.message }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }

    return new Response('Not found', { status: 404 });
}
