<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/e3cfe96f-8498-4078-a1ae-f94b0ef5a360

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## آرشیو کلون‌ها: ذخیره روی دیسک، نسخه‌دار

آرشیو کلون‌ها فقط در مرورگر نیست. سرور نسخه‌ی اصلی را روی دیسک خودش نگه می‌دارد، پس هر دستگاهی که به همین سرور وصل شود همان آرشیو را می‌بیند (`localStorage` فقط کش سریع و حالت آفلاین است).

| مسیر | محتوا |
| --- | --- |
| `data/archives/index.json` | وضعیت فعلی همه‌ی آرشیوها |
| `data/archives/versions/<id>/v-<timestamp>-<hash>.json` | یک نسخه‌ی کامل و قابل بازگردانی برای هر تغییر |
| `data/archives/versions/<id>/index.json` | فهرست نسخه‌ها (زمان، دلیل، اندازه) |

- نسخه فقط وقتی نوشته می‌شود که محتوا واقعاً تغییر کرده باشد (درخواست تکراری نسخه‌ی جدید نمی‌سازد).
- حذف یک آرشیو، نسخه‌هایش را پاک نمی‌کند؛ فقط از وضعیت فعلی خارج می‌شود.
- پوشه‌ی `data/` عمداً در گیت نیست (اطلاعات شخصی رزومه). برای پشتیبان‌گیری کامل:

```bash
curl -O "http://localhost:3000/api/archives/export?withVersions=1"
```

### API

| متد | مسیر | کار |
| --- | --- | --- |
| GET | `/api/archives` | وضعیت فعلی + نشانه‌های حذف + مسیر دیسک |
| PUT | `/api/archives` | جایگزینی آرشیو (`archives`) و ثبت نسخه‌ی تغییرها |
| GET | `/api/archives/:id/versions` | فهرست نسخه‌های یک آرشیو |
| GET | `/api/archives/:id/versions/:file` | یک نسخه‌ی کامل |
| DELETE | `/api/archives/:id?purge=1` | حذف از وضعیت فعلی (با `purge` نسخه‌ها هم پاک می‌شوند) |
| GET | `/api/archives/export?withVersions=1` | خروجی کامل برای پشتیبان |
