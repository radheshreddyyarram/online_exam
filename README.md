# Human Reasoning Experiment – Static Application

## Contents
- `index.html`, `styles.css`, `app.js`: static participant application
- `questions.json`: question bank used by the application
- `question-bank.csv`: editable/researcher copy of the question bank

## Run
The app loads `questions.json` with `fetch`, so run it from a local static web server rather than opening `index.html` directly.

For example, if Python is installed:
1. Open a terminal in this folder.
2. Run: `python -m http.server 8000`
3. Open: `http://localhost:8000`

You can also deploy the complete folder to GitHub Pages or another static host.

## Participant workflow
1. Give each participant an anonymous ID such as P01.
2. Participant completes the same 20 questions.
3. At the end, choose **Print / Save pictorial PDF** and select “Save as PDF” in the browser print dialog.
4. Choose **Download raw CSV** to download the question-level data.

## Data and privacy
- No database, server-side storage, analytics or external libraries are used.
- Answers and timings remain in page memory until the participant downloads the report.
- Refreshing or closing the page resets the attempt.
- The participant ID should be anonymous; do not collect names or contact details in this app.
- The PDF is created using the browser print-to-PDF feature.
- The CSV contains one row per question and includes participant ID, date, category, difficulty, response, correctness, marks, time and order.

## Experimental cautions
- The difficulty levels are initial design labels, not validated psychometric difficulty estimates.
- Pilot the questions with a small group before the main sample and revise ambiguous or unexpectedly easy/hard items.
- Keep instructions, device conditions and question order consistent across participants.
- This is an educational project activity, not a validated psychological test or diagnosis.
- Timing can be affected by reading speed, interruptions, device performance and familiarity with the language.

## Question-bank note
The questions are designed to sample basic numerical, deductive, pattern, verbal and lateral problem-solving. A correct answer does not establish a general measure of intelligence or a clinical trait.
