
from rest_framework import generics
from accounts.serializers import RegistrationSerializer
from accounts.permissions import IsDoctorOrSuperuser


class PatientRegistrationView(generics.CreateAPIView):
    serializer_class = RegistrationSerializer
    permission_classes = []  # Public access

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['role_type'] = 'patient'
        return context


class DoctorRegistrationView(generics.CreateAPIView):
    serializer_class = RegistrationSerializer
    permission_classes = [IsDoctorOrSuperuser]  

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['role_type'] = 'doctor'
        return context