export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const formData = await request.formData();
    const name    = formData.get('name')?.trim();
    const email   = formData.get('email')?.trim();
    const message = formData.get('message')?.trim();

    // Validasyon
    if (!name || !email || !message) {
      return Response.json(
        { success: false, error: 'Tüm alanlar zorunludur.' },
        { status: 400 }
      );
    }

    // Resend API ile e-posta gönder
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Site Formu <form@sarantasoundworks.com>',  // ← kendi domainin
        to:   'contact@sarantasoundworks.com',                  // ← sana gelecek adres
        reply_to: email,
        subject: `Yeni mesaj: ${name}`,
        html: `
          <h2>Yeni Form Mesajı</h2>
          <p><b>Ad Soyad:</b> ${name}</p>
          <p><b>E-posta:</b> ${email}</p>
          <p><b>Mesaj:</b></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
        `,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error('Resend hatası:', err);
      return Response.json(
        { success: false, error: 'E-posta gönderilemedi.' },
        { status: 500 }
      );
    }

    return Response.json({ success: true });

  } catch (err) {
    console.error('Sunucu hatası:', err);
    return Response.json(
      { success: false, error: 'Sunucu hatası.' },
      { status: 500 }
    );
  }
}
