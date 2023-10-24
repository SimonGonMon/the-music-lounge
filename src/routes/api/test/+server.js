export async function GET(req) {
    const body = JSON.stringify({ message: "Test successful" });
    const headers = { 'Content-Type': 'application/json' };
    return new Response(body, { status: 200, headers: headers });
  }