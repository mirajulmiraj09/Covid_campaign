
from rest_framework import generics
from accounts.serializers import DoctorProfileSerializer, PatientProfileSerializer, ProfileUpdateSerializer, RegistrationSerializer,LoginSerializer,UserSerializer,ChangePasswordSerializer,BaseProfileSerializer
from rest_framework.permissions import IsAuthenticated
from accounts.permissions import IsDoctorOrSuperuser
from rest_framework.views import APIView
from accounts.models import Profile, User
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny
from accounts.utils import get_user_role
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

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


class ProfileMeView(generics.RetrieveUpdateAPIView):
    """Get and update authenticated user's profile"""
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def get_object(self):
        try:
            return Profile.objects.select_related('user').get(user=self.request.user)
        except Profile.DoesNotExist:
            return None
    
    def get_serializer_class(self):
        user_role = get_user_role(self.request.user)
        
        if self.request.method == 'GET':
            if user_role == 'Doctor':
                return DoctorProfileSerializer
            elif user_role == 'Patient':
                return PatientProfileSerializer
            return BaseProfileSerializer
        
        return ProfileUpdateSerializer
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        
        if instance is None:
            return Response({
                'status': 'error',
                'message': 'Profile not found.'
            }, status=status.HTTP_404_NOT_FOUND)
        
        serializer = self.get_serializer(instance)
        return Response({
            'status': 'success',
            'data': serializer.data
        }, status=status.HTTP_200_OK)
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        if instance is None:
            return Response({
                'status': 'error',
                'message': 'Profile not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        
        if serializer.is_valid():
            self.perform_update(serializer)
            
            user_role = get_user_role(request.user)
            
            if user_role == 'Doctor':
                response_serializer = DoctorProfileSerializer(instance)
            elif user_role == 'Patient':
                response_serializer = PatientProfileSerializer(instance)
            else:
                response_serializer = BaseProfileSerializer(instance)
            
            return Response({
                'status': 'success',
                'message': 'Profile updated successfully',
                'data': response_serializer.data
            }, status=status.HTTP_200_OK)
        
        return Response({
            'status': 'error',
            'message': 'Profile update failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    


# Add to accounts/views.py

class DoctorListView(generics.ListAPIView):
    """
    GET: List all doctors (public)
    """
    serializer_class = DoctorProfileSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        # Get all users with Doctor role
        from .models import UserRole
        doctor_user_ids = UserRole.objects.filter(
            role__role_name='Doctor'
        ).values_list('user_id', flat=True)
        
        return Profile.objects.filter(
            user_id__in=doctor_user_ids
        ).select_related('user')
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        
        return Response({
            'status': 'success',
            'count': len(serializer.data),
            'data': serializer.data
        }, status=status.HTTP_200_OK)