export async function onRequestPost(context) {
  try {
    const data = await context.request.formData();
    const name = data.get('name');
    const email = data.get('email');
    const message = data.get('message');
    const token = data.get('cf-turnstile-response');

    // 1. Turnstile Doğrulaması (Güvenlik için)
    const ip = context.request.headers.get('CF-Connecting-IP');
    const formData = new FormData();
    formData.append('secret', '0x4AAAAAACydKW-8xQmp9Q0dDid_i9B-D88'); // Cloudflare'den aldığın Secret Key
    formData.append('response', token);
    formData.append('remoteip', ip);

    const result = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      body: formData,
      method: 'POST',
    });

    const outcome = await result.json();
    if (!outcome.success) {
      return new Response("Güvenlik doğrulaması başarısız.", { status: 403 });
    }

    // 2. Veriyi Bir Yere Gönder (Örn: Discord Webhook - En kolayı budur)
    const DISCORD_WEBHOOK = "DISCORD_WEBHOOK_URL_BURAYA";
    await fetch(DISCORD_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: `📬 **Yeni Mesaj!**\n**İsim:** ${name}\n**E-posta:** ${email}\n**Mesaj:** ${message}`
      })
    });

    // 3. Başarılı Sonuç Dön (Veya teşekkür sayfasına yönlendir)
    return new Response("Mesajınız başarıyla gönderildi!", { status: 200 });

  } catch (err) {
    return new Response("Hata: " + err.message, { status: 500 });
  }
}
