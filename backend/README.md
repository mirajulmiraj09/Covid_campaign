# Covid Campaign - Backend

This repository contains the Django backend for the Covid Campaign project. This README focuses on quick local setup, API schema (Swagger/OpenAPI) options, and production deployment checklist.

**Quick Start (local)**
- **Create & activate venv:**
```bash
python -m venv covid_camp_env
# Windows (PowerShell)
.
\covid_camp_env\Scripts\Activate.ps1
# Windows (cmd)
\covid_camp_env\Scripts\activate.bat
```
- **Install dependencies:**
```bash
pip install -r requirement
```
- **Run migrations:**
```bash
python manage.py migrate
```
- **Create superuser (optional):**
```bash
python manage.py createsuperuser
```
- **Run the dev server:**
```bash
python manage.py runserver
```

**API Schema / Swagger (two recommended options)**

- drf-spectacular (recommended modern approach)
  - Install: `pip install drf-spectacular`
  - Add to `INSTALLED_APPS` in `covid_campaign_system/settings.py`:
    ```py
    INSTALLED_APPS += ['drf_spectacular']
    REST_FRAMEWORK = {
        'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
        # ... other settings
    }
    ```
  - Add schema views to `urls.py` (project-level):
    ```py
    from django.urls import path
    from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

    urlpatterns += [
        path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
        path('api/schema/swagger-ui/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    ]
    ```

- drf-yasg (quick setup)
  - Install: `pip install drf-yasg`
  - Add `'drf_yasg'` to `INSTALLED_APPS`
  - Example `urls.py` snippet:
    ```py
    from django.urls import path
    from drf_yasg.views import get_schema_view
    from drf_yasg import openapi

    schema_view = get_schema_view(
        openapi.Info(title="API", default_version='v1'),
        public=True,
    )

    urlpatterns += [
        path('swagger.json', schema_view.without_ui(cache_timeout=0), name='schema-json'),
        path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
        path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    ]
    ```

Notes:
- Protect schema endpoints in production if the API should not be public; e.g., restrict to staff-only or behind authentication.
- Both tools generate accurate OpenAPI specs; `drf-spectacular` tends to require fewer per-view tweaks and integrates well with modern DRF setups.

**Deployment Checklist (production-ready)**
- **Settings:** Set `DEBUG = False` and configure `ALLOWED_HOSTS`.
- **Secrets & config:** Use environment variables for `SECRET_KEY`, DB, and third-party credentials (for example via `django-environ`).
- **Migrations & static:** Run `python manage.py migrate` and `python manage.py collectstatic` during release.
- **Static files:** Use WhiteNoise for simple setups or serve via Nginx/Cloud Storage in front of the app server.
- **App server:** Use Gunicorn for WSGI or Uvicorn for ASGI. Run behind Nginx (recommended) or Traefik.
- **HTTPS:** Terminate TLS at the load balancer or Nginx; ensure `SECURE_PROXY_SSL_HEADER` and `SESSION_COOKIE_SECURE` are set.
- **CORS & security headers:** Configure `django-cors-headers`, `X-Frame-Options`, `Content-Security-Policy`, `X-Content-Type-Options`, and other recommended headers.
- **Database:** Use a managed DB or production-ready DB server; do not use `sqlite3` in production.
- **Monitoring & logging:** Add Sentry or similar, and centralize logs.
- **Scaling & process management:** Use systemd or process managers, and consider containers (Docker) and orchestration (Kubernetes) for larger deployments.

**Protecting schema endpoints**
If the API schema should not be public, wrap schema views with permission checks, e.g.:
```py
from django.contrib.admin.views.decorators import staff_member_required
from django.utils.decorators import method_decorator

@method_decorator(staff_member_required, name='dispatch')
class ProtectedSchemaView(...):
    ...
```
Or conditionally mount schema URLs based on `DEBUG` or an env var.

**Where to add project-specific notes**
Add any cloud provider or CI/CD steps in this README or create `DEPLOYMENT.md` for longer instructions (e.g., Dockerfile, GitHub Actions, Azure/AWS/GCP pipeline steps).

--
This README is purposely focused and minimal. If you want, I can:
- add the schema route snippet directly to your project `urls.py`, or
- create a `DEPLOYMENT.md` with step-by-step Docker and CI examples.
