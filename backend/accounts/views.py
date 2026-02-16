
from rest_framework import generics
from accounts.serializers import RegistrationSerializer,LoginSerializer,UserSerializer,ChangePasswordSerializer
from rest_framework.permissions import IsAuthenticated
from accounts.permissions import IsDoctorOrSuperuser
from rest_framework.views import APIView
from accounts.models import User
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny

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
        context['role_type'] = 'Doctor'
        return context


class LoginView(APIView):
    serializer_class = LoginSerializer
    permission_classes = [AllowAny]  
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid(raise_exception=True):
            user = serializer.validated_data.get('user')
            user.last_login = timezone.now()
            user.save(update_fields=['last_login'])

            refresh = RefreshToken.for_user(user)
            user_serializer = UserSerializer(user)
            return Response({
                'status': 'success',
                'message': 'Login successful',
                'data': {
                    'tokens': {
                        'refresh': str(refresh),
                        'access': str(refresh.access_token),
                    },
                    'user': user_serializer.data
                }
            }, status=status.HTTP_200_OK)
        
        return Response({
            'status': 'error',
            'message': 'Login failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)



class ChangePasswordView(APIView):
    """Change password for authenticated users"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response({
                'status': 'success',
                'message': 'Password changed successfully.'
            }, status=status.HTTP_200_OK)
        
        return Response({
            'status': 'error',
            'message': 'Password change failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
