# How to Push XAI Demo to GitHub

Follow these steps to upload your project to GitHub.

## Prerequisites

1.  **Git Installed**: Make sure you have Git installed on your computer. You can check by running `git --version` in your terminal.
2.  **GitHub Account**: You need an account on [github.com](https://github.com/).

## Step 1: Initialize Git (if not already done)

If your project folder is not yet a Git repository (i.e., you don't see a `.git` folder), run:

```bash
git init
```

## Step 2: Create a .gitignore File

Ensure you have a `.gitignore` file to prevent uploading unnecessary files (like `node_modules` and `.env`). A standard Next.js `.gitignore` should include:

```text
node_modules
.next
.env
.env.local
.DS_Store
```

*(Note: Your project already has a `.gitignore` file, so you are good to go!)*

## Step 3: Stage and Commit Your Files

1.  **Stage all files**:
    ```bash
    git add .
    ```

2.  **Commit the files**:
    ```bash
    git commit -m "Initial commit - XAI Visualizer App"
    ```

## Step 4: Create a New Repository on GitHub

1.  Go to [GitHub.com](https://github.com) and log in.
2.  Click the **+** icon in the top-right corner and select **New repository**.
3.  **Repository name**: Enter a name (e.g., `xai-visualizer` or `xai-demo`).
4.  **Visibility**: Choose **Public** or **Private**.
5.  **Do NOT** initialize with a README, .gitignore, or license (since you already have them locally).
6.  Click **Create repository**.

## Step 5: Connect Local Repo to GitHub

Once the repository is created, GitHub will show you a list of commands. Look for the section **"…or push an existing repository from the command line"**.

Run these commands in your terminal (replace `YOUR_USERNAME` and `REPO_NAME` with your actual details):

```bash
git remote add origin git@github.com:SamK23/xAI-Visualizer.git
git branch -M main
git push -u origin main
```

## Step 6: Verify

Refresh your GitHub repository page. You should now see all your code listed there!

---

### Troubleshooting

-   **"Remote origin already exists"**: If you get this error, it means a remote is already linked. You can check it with `git remote -v`. To remove the old one and add the new one:
    ```bash
    git remote remove origin
    git remote add origin git@github.com:SamK23/xAI-Visualizer.git
    ```
-   **Authentication**: If prompted for a password, use your GitHub **Personal Access Token** if you have 2FA enabled, or sign in via the browser prompt if available.
