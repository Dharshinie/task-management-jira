<<<<<<< HEAD
=======

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
>>>>>>> 113e977 (firebase updation)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.


## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

<<<<<<< HEAD
Yes, you can!
=======


### Firebase connectivity

The application is already wired to a Firestore database. You can find configuration in `src/firebase.js` and the database instance `db` is exported for use throughout the app. Tasks (and any other collections) are read from / written to the `tasks` collection. No authentication is required; the current Firestore rules allow open read/write through April 2026.

To change the Firebase project, update the `firebaseConfig` object or use environment variables and reinitialize the app.

If you add additional collections (projects, comments, etc.) simply import `db` and use the standard [Firebase Web SDK](https://firebase.google.com/docs/firestore/quickstart) methods.
>>>>>>> 113e977 (firebase updation)


