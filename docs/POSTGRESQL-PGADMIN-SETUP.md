# PostgreSQL & pgAdmin 4 Database Setup Guide

This document describes the process of migrating the EventHub360 database from SQLite to PostgreSQL and provides detailed instructions for registering the server and tables in pgAdmin 4.

---

## 1. Previous Database Type
* **SQLite** (local file: `backend/prisma/dev.db`)

## 2. New Database Type
* **PostgreSQL** (running locally on port `5432`)

## 3. Database Name
* **`guest_management_db`**

## 4. Prisma Provider Used
* **`postgresql`**

## 5. Tables & Models Created
Prisma ORM automatically maps the relational schemas to PostgreSQL tables (using correct capitalization/casing):
* **`Event`**: Stores details of events hosting invitees.
* **`Hotel`**: Stores guest lodging information.
* **`Table`**: Stores seating table configurations.
* **`Guest`**: Core table mapping attendees, status, category, hotel, and seating relations.
* **`_prisma_migrations`**: Internal Prisma table tracking Applied Migration scripts.

---

## 6. Migration Command Used
To switch datasource providers and configure the fresh PostgreSQL schema layout, the SQLite migrations folder was renamed to `migrations_sqlite` and the following command was executed in the `backend/` folder:
```bash
npx prisma migrate dev --name init_postgresql
```
This successfully generated the PostgreSQL-compatible migration script and updated `backend/prisma/migrations/migration_lock.toml`.

## 7. Seed Command Used
To seed the database with initial mockup datasets (1,248 total guest records, events, seating tables, and hotels):
```bash
npm run prisma:seed
```

---

## 8. CRUD Verification Results
All backend endpoints, validations, and UI-level CRUD operations have been successfully verified against the new PostgreSQL database:
* **Jest Test Suite**: **16/16 tests passing** (`npm run test`).
* **REST Integration Test**: **30/30 validations passing** (`node test-apis.js`).
* **Browser E2E Tests**: Fully verified in the browser. Created guests, modified details, deleted entries, and verified that transactions reflect instantly in PostgreSQL.

---

## 9. pgAdmin Connection Steps
Follow these step-by-step instructions to register the database in pgAdmin 4:

1. **Launch pgAdmin 4**:
   * Open the application (default location: `C:\Program Files\PostgreSQL\18\pgAdmin 4\runtime\pgAdmin4.exe`).
2. **Register Server**:
   * Right-click **Servers** in the left browser tree → **Register** → **Server...**
3. **General Tab**:
   * **Name**: Enter `Local PostgreSQL 18` (or any friendly name).
4. **Connection Tab**:
   * **Host name/address**: `localhost`
   * **Port**: `5432`
   * **Maintenance database**: `postgres`
   * **Username**: `postgres`
   * **Password**: `post1234` (use this verified local database password).
   * Check **Save password?** to avoid re-entering it.
   * Click **Save**.
5. **Locate Tables**:
   * In the browser tree, expand:
     `Servers` → `Local PostgreSQL 18` → `Databases` → `guest_management_db` → `Schemas` → `public` → `Tables`.

---

## 10. Exact Table Names to Check in pgAdmin
Use the following exact table names in pgAdmin 4 (note the double quotes are required for case-sensitive SQL queries due to Prisma mapping):
* **`"Guest"`**
* **`"Event"`**
* **`"Hotel"`**
* **`"Table"`**

### How to View Table Data:
* **Option A (UI)**: Right-click the **`Guest`** table in the tree → **View/Edit Data** → **All Rows**.
* **Option B (SQL Query Tool)**: Highlight the database `guest_management_db`, open the **Query Tool** (lightning icon or Alt+Shift+Q), and execute:
  ```sql
  SELECT * FROM "Guest";
  ```

### How to View Table Columns:
* Expand `Tables` → **`Guest`** → **`Columns`** to see fields such as `id`, `name`, `email`, `phone`, `status`, `eventId`, etc.

---

## 11. Common Errors and Fixes

### Error: PostgreSQL service not running
* **Symptom**: pgAdmin or Prisma throws a connection error like `ECONNREFUSED 127.0.0.1:5432`.
* **Fix**: Open Windows Services manager (`services.msc`), find **postgresql-x64-18**, and click **Start**. Alternatively, run in admin PowerShell:
  ```powershell
  Start-Service -Name postgresql-x64-18
  ```

### Error: Password authentication failed
* **Symptom**: `FATAL: password authentication failed for user "postgres"`.
* **Fix**: Verify your connection password in `backend/.env`. On this machine, the password has been verified as `post1234`.

### Error: Port 5432 already in use
* **Symptom**: Server fails to bind, or connecting connects to the wrong service.
* **Fix**: Check if another PostgreSQL or service instance is holding port 5432. Stop conflicting services or modify the port setting in `postgresql.conf` and update `DATABASE_URL` accordingly.

### Error: Database does not exist
* **Symptom**: Prisma throws `Database "guest_management_db" does not exist`.
* **Fix**: Create the database manually using pgAdmin or the PostgreSQL binaries:
  ```bash
  & "C:\Program Files\PostgreSQL\18\bin\createdb.exe" -U postgres guest_management_db
  ```

### Error: Prisma cannot connect
* **Symptom**: Prisma migration hangs or crashes.
* **Fix**: Ensure the connection string in `backend/.env` is correctly formatted:
  ```env
  DATABASE_URL="postgresql://postgres:post1234@localhost:5432/guest_management_db?schema=public"
  ```
  *(Restart backend dev server if you edit `.env` to load the new config)*.

### Error: Tables not visible in pgAdmin
* **Symptom**: Schema expands but `Tables` folder is empty.
* **Fix**: Right-click the **`Tables`** folder or **`public`** schema and click **Refresh** to sync the visual tree. Ensure migrations were successfully applied.

---

## 12. Files Changed
* [backend/prisma/schema.prisma](file:///C:/Users/srashti/.gemini/antigravity-ide/scratch/eventhub360-gst/backend/prisma/schema.prisma): Database provider changed to `postgresql`.
* [backend/.env](file:///C:/Users/srashti/.gemini/antigravity-ide/scratch/eventhub360-gst/backend/.env): connection string updated.
* [backend/.env.example](file:///C:/Users/srashti/.gemini/antigravity-ide/scratch/eventhub360-gst/backend/.env.example): updated safe connection template.
* [frontend/src/pages/GuestManagement.jsx](file:///C:/Users/srashti/.gemini/antigravity-ide/scratch/eventhub360-gst/frontend/src/pages/GuestManagement.jsx): removed developer API and table schema details.
* [frontend/src/components/GuestManagement/ImportExportModals.jsx](file:///C:/Users/srashti/.gemini/antigravity-ide/scratch/eventhub360-gst/frontend/src/components/GuestManagement/ImportExportModals.jsx): removed debugging API route links.

---

## 13. Git Safety Check
* **Confirmed**: `.env` is correctly gitignored in both frontend and backend configurations.
* **Confirmed**: `backend/.env.example` does not contain passwords or secrets.
* **Confirmed**: Untracked database backup files (`dev.db.bak` and `migrations_sqlite`) are excluded from tracking.
