export async function onRequestPost(context) {
  try {
    const data = await context.request.formData();
    const name = data.get('name');
    const email = data.get('email');
    const message = data.get('message');

    // Resend API'sine istek gönderiyoruz
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer re_hwkZUHJV_JzpenXCsmJiQTkLqw8ZEcBXT`,`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Saranta Form <onboarding@resend.dev>", // Domain doğrularsanız kendi mailinizi yazabilirsiniz
        to: ["contact@sarantasoundworks.com"], // Mesajın gideceği adres
        subject: `Yeni Form Mesajı: ${name}`,
        html: `
          <p><strong>İsim:</strong> ${name}</p>
          <p><strong>E-posta:</strong> ${email}</p>
          <p><strong>Mesaj:</strong> ${message}</p>
        `,
      }),
    });

    if (res.ok) {
      return new Response("Mesajınız iletildi, teşekkürler!", { status: 200 });
    } else {
      const error = await res.text();
      return new Response("Gönderim hatası: " + error, { status: 500 });
    }

  } catch (err) {
    return new Response("Sunucu hatası: " + err.message, { status: 500 });
  }
}
