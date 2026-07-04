# eventhub360-gst

This repository contains the `frontend` and `backend` codebases for EventHub360 GST.

## Directory Structure

- `frontend/`: The frontend application.
- `backend/`: The backend server.

## Git Collaboration

To maintain a clean and reliable Git history and prevent accidental overwrites, please follow this push workflow:

1. **Synchronize Local State**:
   ```bash
   git fetch origin
   git status
   ```
2. **Integrate Remote Changes** (if any exist on your upstream branch):
   ```bash
   git pull origin <branch-name>
   ```
   *(Resolve any merge conflicts locally before committing).*
3. **Safe Pushing**:
   * Always use standard push:
     ```bash
     git push
     ```
   * **Never** use `git push --force` or `-f` as it blindly overwrites the remote branch history and can delete teammate commits.
   * If you need to push a branch after a local history rewrite (such as `git commit --amend` or `git rebase`), always use:
     ```bash
     git push --force-with-lease
     ```
     *Note: `--force-with-lease` is preferred because it checks if the remote branch has new commits that are missing from your local repository. If it finds new commits from another teammate, it rejects the push, protecting their work.*
