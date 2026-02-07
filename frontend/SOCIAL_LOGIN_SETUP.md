# How to Get Google & Facebook IDs

## Google Client ID

1. **Go to Google Cloud Console:**
   - Link: [https://console.cloud.google.com/](https://console.cloud.google.com/)
   - Create a **New Project** or select an existing one.

2. **Configure OAuth Consent Screen:**
   - Go to **APIs & Services > OAuth consent screen**.
   - Select **External** (for testing/production) and click Create.
   - Fill in:
     - **App name**: AuthentiMart
     - **User support email**: Your email
     - **Developer contact information**: Your email
   - Click **Save and Continue** (skip Scopes/Test Users for now if testing with your own account).
   - If setting "Testing" status, only added Test Users can sign in. Often easier to add yourself as a test user.

3. **Create Credentials:**
   - Go to **APIs & Services > Credentials**.
   - Click **Create Credentials > OAuth client ID**.
   - **Application type**: Web application.
   - **Name**: AuthentiMart Web Client.
   - **Authorized JavaScript origins**:
     - `http://localhost:5173` (Add `http://localhost` just in case).
   - **Authorized redirect URIs** (for safety/popup):
     - `http://localhost:5173`
   - Click **Create**.

4. **Copy the Client ID:**
   - Your Client ID will look like: `1234567890-abcdefg12345.apps.googleusercontent.com`.
   - Paste it into `frontend/.env` as `VITE_GOOGLE_CLIENT_ID`.

---

## Facebook App ID

1. **Go to Meta for Developers:**
   - Link: [https://developers.facebook.com/](https://developers.facebook.com/)
   - Click **My Apps** (top right) > **Create App**.

2. **Create App:**
   - Select **Other** > **Next**.
   - Select **Consumer** > **Next**.
   - **App Name**: AuthentiMart.
   - **App Contact Email**: Your email.
   - Click **Create App**.

3. **Set Up Facebook Login:**
   - On the dashboard ("Add products to your app"), find **Facebook Login** and click **Set Up**.
   - Select **Web**.
   - **Site URL**: `http://localhost:5173/`.
   - Click **Save** > Continue... (You can click "Next" through steps or just use the settings).

4. **Configure Settings:**
   - Go to **Facebook Login > Settings** (sidebar).
   - Ensure **Client OAuth Login** is YES.
   - Ensure **Web OAuth Login** is YES.
   - **Valid OAuth Redirect URIs**: `http://localhost:5173/`, `http://localhost:5173/login`.
   - Click **Save Changes**.

5. **Copy App ID:**
   - Go to **Settings > Basic** (sidebar).
   - Copy the **App ID**.
   - Paste it into `frontend/.env` as `VITE_FACEBOOK_APP_ID`.
