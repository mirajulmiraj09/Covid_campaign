from django.urls import path, include
from accounts.views import PatientRegistrationView, DoctorRegistrationView,LoginView,ChangePasswordView

urlpatterns = [
    path('auth/register/patient/', PatientRegistrationView.as_view()),
    path('auth/register/doctor/', DoctorRegistrationView.as_view()),
    path('auth/login/', LoginView.as_view()),
    path("auth/change-password/", ChangePasswordView.as_view(), name="change-password"),
]
