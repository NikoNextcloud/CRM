# PrintPilot AI CRM

Премиум CRM система за печатници, фирми за винил, рекламни агенции, производители на табели, брандинг компании и бизнеси за рекламни материали.

Приложението се отваря директно в таблото. Няма login, register, екипи, роли или permissions екрани, защото е направено за един собственик.

## Какво е включено

- Next.js App Router, React, TypeScript и Tailwind CSS.
- Модерен светъл SaaS интерфейс.
- Метрики в реално време от Supabase.
- Добавяне и редакция на клиенти.
- Viber и WhatsApp номера в профила на клиента с директно отваряне на приложението.
- Добавяне на поръчки.
- Изтриване на поръчки от таблицата с поръчки.
- Смяна на статуси от таблицата с поръчки.
- Kanban табло с drag & drop, което записва статуса в Supabase.
- Календар със срокове, клиент, поръчка, бележки и червено маркиране на период за изработка.
- 360° профил на клиента: информация, финансов преглед, поръчки, файлове, история, бележки и AI анализ.
- Добавяне на бележки към клиенти.
- Качване на файлове към Supabase Storage.
- Отваряне/сваляне на качени файлове чрез временни Supabase signed links.
- Cloudflare AI API маршрут, който анализира CRM данните в реално време.
- Supabase SQL схема за клиенти, поръчки, продукти, файлове, снимки, бележки, обаждания, история, известия, задачи, плащания, AI препоръки, activity logs и настройки.
- Готова структура за GitHub и Vercel.

## Подробна инсталация

### 1. Инсталирай Node.js

Свали Node.js от:

https://nodejs.org/

Избери LTS версията. След инсталацията рестартирай терминала или компютъра.

За проверка отвори Command Prompt или PowerShell и изпълни:

```bash
node -v
npm -v
```

Трябва да видиш номера на версии.

На този компютър проектът може да използва и вече наличния Node runtime тук:

```text
C:\Users\User\Documents\IPTV\.runtime\node-v24.18.0-win-x64
```

Файлът `start-local.bat` автоматично го използва, ако нормалният `npm` не е наличен.

### 2. Отвори папката на проекта

Проектът е тук:

```text
C:\Users\User\Documents\IPTV\printpilot-ai-crm
```

Можеш да го отвориш във Visual Studio Code, Cursor или друг редактор.

### 3. Инсталирай зависимостите

Отвори терминал в папката на проекта и изпълни:

```bash
npm install
```

Това сваля Next.js, React, Tailwind, Supabase и нужните UI зависимости.

### 4. Стартирай локално

Изпълни:

```bash
npm run dev
```

После отвори:

```text
http://localhost:3000
```

Можеш и директно да стартираш:

```text
start-local.bat
```

Този файл инсталира зависимостите и стартира локалния сървър.

### 5. Създай Supabase проект

1. Отвори https://supabase.com/
2. Създай нов проект.
3. Отвори SQL Editor.
4. Копирай всичко от:

```text
supabase/schema.sql
```

5. Постави го в Supabase SQL Editor.
6. Натисни Run.

Това създава всички CRM таблици.

SQL файлът създава и нужните Storage buckets:

- `order-files`
- `product-photos`
- `company-assets`

Използвай `order-files` за PDF, AI, CDR, SVG, EPS, PNG, JPG, DXF, ZIP и RAR файлове към поръчки.

Ако вече си пускал стара версия на SQL файла, пусни обновения `supabase/schema.sql` отново. Той добавя липсващите колони `viber`, `whatsapp`, `product` и таблицата `calendar_notes`, без да трие старите данни.

### 6. Добави променливите на средата

Направи копие на:

```text
.env.example
```

Преименувай копието на:

```text
.env.local
```

Попълни:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token
CLOUDFLARE_AI_MODEL=@cf/meta/llama-3.1-8b-instruct
```

След промяна на `.env.local` рестартирай локалния сървър.

Важно:

- `SUPABASE_SERVICE_ROLE_KEY` трябва да остане само на сървъра.
- Не го поставяй в кода, който се изпълнява в браузъра.
- Проектът използва Next.js API routes, така че създаване, редакция и качване на файлове минават през сървъра.

### 7. Настрой Cloudflare AI

1. Отвори https://dash.cloudflare.com/
2. Влез в акаунта си.
3. Създай API token с Workers AI достъп.
4. Добави Account ID и token-а в `.env.local`.

Без тези ключове AI route-ът работи в демо режим и връща примерни препоръки.

### 8. Качване във Vercel

1. Създай GitHub repository.
2. Качи или push-ни тази папка в GitHub.
3. Отвори https://vercel.com/
4. Натисни Add New Project.
5. Импортирай GitHub repository-то.
6. Добави същите променливи от `.env.local` във Vercel Project Settings.
7. Deploy.

След deploy приложението ще се отвори директно в CRM таблото.

### 9. Работа в реално време

След като Supabase променливите са настроени:

1. Добави клиент от панела “Добави клиент”.
2. Добави поръчка към този клиент.
3. Премести поръчката в Kanban таблото или смени статуса в таблицата.
4. Отвори клиента в 360° профила.
5. Добави бележки.
6. Качи файлове към избраната поръчка.
7. Натисни “Анализирай”, за да пуснеш Cloudflare AI върху CRM данните в реално време.

## Бележки за разработка

Приложението е свързано към Supabase данни в реално време през сървърни API маршрути:

- `app/api/crm/route.ts`
- `app/api/files/route.ts`
- `app/api/ai/route.ts`

Ако Supabase не е настроен, приложението се отваря, но показва предупреждение и няма данни в реално време.
