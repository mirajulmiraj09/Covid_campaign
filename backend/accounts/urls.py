from django.urls import path, include
from accounts.views import PatientRegistrationView, DoctorRegistrationView,LoginView,ChangePasswordView

urlpatterns = [
    path('register/patient/', PatientRegistrationView.as_view()),
    path('register/doctor/', DoctorRegistrationView.as_view()),
    path('login/', LoginView.as_view()),
    path("change-password/", ChangePasswordView.as_view(), name="change-password"),
]
