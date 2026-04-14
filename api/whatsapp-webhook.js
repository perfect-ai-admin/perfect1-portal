export default async function handler(req, res) {
  const VERIFY_TOKEN = "perfect1_whatsapp_verify";

  if (req.method === "GET") {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    }
    return res.status(403).send("Verification failed");
  }

  if (req.method === "POST") {
    console.log("WhatsApp webhook:", req.body);
    return res.status(200).send("OK");
  }

  return res.status(405).send("Method not allowed");
}
