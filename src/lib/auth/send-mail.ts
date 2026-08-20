/** Send auth emails. Resend in prod; log the link locally. */
export async function sendAuthMail(opts: { to: string; subject: string; url: string }): Promise<void> {
  const key = process.env.RESEND_API_KEY?.trim();
  const from = process.env.AUTH_EMAIL_FROM?.trim() || "Woods <noreply@joinwoods.co>";
  if (key) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: opts.to,
        subject: opts.subject,
        html: `<p>Open this link to continue:</p><p><a href="${opts.url}">${opts.url}</a></p>`,
      }),
    });
    if (!res.ok) throw new Error(`Resend failed: ${res.status}`);
    return;
  }
  console.log(`[woods-auth] ${opts.subject} for ${opts.to}\n${opts.url}`);
}
