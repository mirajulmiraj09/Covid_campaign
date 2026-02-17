from django.urls import path, include
from accounts.views import DoctorListView, PatientRegistrationView, DoctorRegistrationView,LoginView,ChangePasswordView, ProfileMeView

urlpatterns = [
    path('auth/register/patient/', PatientRegistrationView.as_view()),
    path('auth/register/doctor/', DoctorRegistrationView.as_view()),
    path('auth/login/', LoginView.as_view()),
    path("auth/change-password/", ChangePasswordView.as_view(), name="change-password"),
    path('profiles/me/', ProfileMeView.as_view(), name='profile-me'),
     path('doctors/', DoctorListView.as_view(), name='doctor-list'),
]
