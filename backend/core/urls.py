from django.contrib import admin
from django.urls import path, include   

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('', include('accounts.urls')),
    path('', include('campaigns.urls')),
    path('', include('operations.urls')),
    path('', include('reviews.urls')),
]
