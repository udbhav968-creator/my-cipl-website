# Quiz Game

A small React quiz application that loads questions from a local API, keeps score, shows a countdown timer, and displays explanations after each answer.

## Features

- Multiple-choice quiz questions
- Score tracking for correct answers
- Countdown timer for each question
- Explanation panel after answering
- Restart option to play again

## Project setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. The app expects the backend API to run alongside it, so make sure the server script is available when you launch the project.

## Scripts

- `npm run dev` — start the frontend development server
- `npm run build` — create a production build
- `npm run preview` — preview the production build locally

## Notes

- The quiz data is fetched from `/api/questions`.
- The app includes a fallback question set if the API request fails.
- Styling and layout are handled in the React components and CSS files in the `src` folder.
- You can customize questions by editing `fallbackQuestions` in `src/App.jsx`.
