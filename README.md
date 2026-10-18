# Speak Thai With Me

A responsive, static Thai-learning website for English-speaking learners. It uses HTML, CSS, vanilla JavaScript, lesson content in JSON, the browser Speech Synthesis API, and LocalStorage for lesson completion.

## Run locally

Lesson content is loaded with `fetch`, so open the project through a local HTTP server rather than opening `index.html` directly as a `file://` URL.

From the project folder, run one of:

```bash
python -m http.server 8000
```

or, if Python is not installed:

```bash
npx serve .
```

Then open `http://localhost:8000` (or the URL printed by `serve`).

## Configure real teacher details

Edit the values in `js/config.js`:

- `teacherName`: the teacher’s real name, as they want it displayed.
- `teacherBiography`: a teacher-approved biography; avoid unverified claims.
- `teachingApproach`: a concise, teacher-approved explanation of how lessons are taught.
- `contactEmail`: a real teacher email address. Contact links activate and, when no booking URL is set, the booking form prepares an email draft.
- `bookingUrl`: optional real HTTPS/HTTP booking service URL. When configured, visitors use the provider instead of entering details on this site.
- `socialLinks`: real social profile URLs. Empty values remain hidden.

The email booking form appears only after a valid teacher email is configured. It validates the required student fields and preferred date, then opens a `mailto:` draft. The student must review and send the email; a reservation is not confirmed until the teacher replies. The site does not send requests to a server, claim a booking succeeded, or save student details in LocalStorage. Email applications can impose URL length limits, so this static workflow is best suited to short requests. Until an email address or booking URL is configured, the form stays hidden and the page clearly explains that booking is not available.

The teacher name, biography, and teaching approach on `about.html` are rendered from `js/config.js`. Replace the photo placeholder on `about.html` with a real teacher photo or remove it before publishing. Do not add unverified qualifications or experience.

## Lessons and progress

All 10 beginner lessons are in `data/lessons.json`, including learning objectives, vocabulary, examples, and quiz explanations. Romanization is a consistent plain-text guide but does not mark tones and cannot fully represent Thai pronunciation; learners should not treat it as exact. Quiz answers are calculated in the browser. A lesson is marked complete at 50% or higher and saved in this browser’s LocalStorage; progress is not synced. Learners can reset it from the lessons page. Thai pronunciation uses browser speech synthesis when a Thai voice is available; availability and actual voice quality vary by device and browser.

See [LESSON_QA_REPORT.md](./LESSON_QA_REPORT.md) for the lesson review, test results, audio limitations, and remaining native-speaker review items.

## Deploy on GitHub Pages

1. Push the project files to a GitHub repository.
2. In repository **Settings → Pages**, select the branch and folder containing `index.html` (usually `main` and `/ (root)`).
3. Save and open the published URL once GitHub Pages has finished deploying.
4. Verify that the site owner has configured real contact details in `js/config.js`.

All page links and asset references are relative, so the site works from a GitHub Pages project subpath without a backend or build step.

See [DEPLOYMENT_REPORT.md](./DEPLOYMENT_REPORT.md) for the readiness audit, nested-path test results, remaining launch blockers, and dedicated-repository deployment commands.
